-- ==============================================================================
-- FIBEROPS ERP - ESQUEMA DE BASE DE DATOS POSTGRESQL + POSTGIS (FTTH & FIELD SERVICE)
-- ==============================================================================

-- 1. Extensiones requeridas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. Enumeraciones de Dominio
CREATE TYPE client_type_enum AS ENUM ('RESIDENTIAL', 'CORPORATE', 'B2B');
CREATE TYPE client_status_enum AS ENUM ('ACTIVE', 'SUSPENDED', 'PROSPECT');
CREATE TYPE service_type_enum AS ENUM ('NEW_INSTALL', 'MIGRATION', 'MAINTENANCE_CORRECTIVE', 'EQUIPMENT_RETRIEVAL');
CREATE TYPE work_order_status_enum AS ENUM ('CREATED', 'ASSIGNED', 'EN_ROUTE', 'ON_SITE', 'IN_EXECUTION', 'COMPLETED', 'CANCELLED');
CREATE TYPE item_category_enum AS ENUM ('EQUIPMENT', 'OPTICAL_PASSIVE', 'CABLE', 'CONSUMABLE');
CREATE TYPE serial_status_enum AS ENUM ('CENTRAL_WAREHOUSE', 'MOBILE_WAREHOUSE', 'INSTALLED_CLIENT', 'RMA_DEFECTIVE');
CREATE TYPE cert_status_enum AS ENUM ('VALID', 'WARNING', 'EXPIRED');

-- 3. Clientes y Contratos (Módulo 1)
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50) NOT NULL,
    type client_type_enum NOT NULL DEFAULT 'RESIDENTIAL',
    address TEXT NOT NULL,
    neighborhood VARCHAR(150),
    city VARCHAR(100) NOT NULL DEFAULT 'Bogotá D.C.',
    -- PostGIS Point (WGS 84 SRID 4326): Longitud, Latitud
    location GEOMETRY(Point, 4326) NOT NULL,
    contract_number VARCHAR(100) NOT NULL UNIQUE,
    plan_name VARCHAR(150) NOT NULL,
    plan_speed_mbps INT NOT NULL DEFAULT 300,
    status client_status_enum NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_clients_location ON clients USING GIST (location);

-- 4. Técnicos, Cuadrillas y Certificaciones (Módulo 5)
CREATE TABLE IF NOT EXISTS technicians (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    avatar_url TEXT,
    vehicle_plate VARCHAR(20) NOT NULL,
    specialties TEXT[] NOT NULL DEFAULT '{"FIBER_FUSION"}',
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    current_location GEOMETRY(Point, 4326),
    location_updated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_technicians_current_location ON technicians USING GIST (current_location);

CREATE TABLE IF NOT EXISTS technician_certifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    technician_id UUID NOT NULL REFERENCES technicians(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL, -- ej. "Trabajo Seguro en Alturas (Avanzado)", "Riesgo Eléctrico RETIE"
    issued_at DATE NOT NULL,
    expires_at DATE NOT NULL,
    status cert_status_enum NOT NULL DEFAULT 'VALID',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Catálogo de Artículos de Inventario (Módulo 2)
CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    category item_category_enum NOT NULL,
    unit VARCHAR(20) NOT NULL DEFAULT 'UND',
    is_serial_tracked BOOLEAN NOT NULL DEFAULT FALSE,
    central_stock NUMERIC(10, 2) NOT NULL DEFAULT 0,
    min_alert_threshold NUMERIC(10, 2) NOT NULL DEFAULT 5,
    unit_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Trazabilidad de Seriales / ONUs / Routers (Módulo 2)
CREATE TABLE IF NOT EXISTS equipment_serials (
    serial_number VARCHAR(100) PRIMARY KEY,
    mac_address VARCHAR(50) NOT NULL UNIQUE,
    model VARCHAR(100) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'ONU_GPON', 'WIFI6_ROUTER'
    status serial_status_enum NOT NULL DEFAULT 'CENTRAL_WAREHOUSE',
    assigned_technician_id UUID REFERENCES technicians(id),
    installed_client_id UUID REFERENCES clients(id),
    installed_ot_id UUID,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Bodega Móvil por Cuadrilla (Módulo 2)
CREATE TABLE IF NOT EXISTS mobile_warehouse_stock (
    technician_id UUID REFERENCES technicians(id) ON DELETE CASCADE,
    item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
    quantity NUMERIC(10, 2) NOT NULL DEFAULT 0,
    PRIMARY KEY (technician_id, item_id)
);

-- 8. Órdenes de Trabajo (OT) (Módulo 1 & 3)
CREATE TABLE IF NOT EXISTS work_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) NOT NULL UNIQUE, -- ej. OT-2026-0042
    client_id UUID NOT NULL REFERENCES clients(id),
    service_type service_type_enum NOT NULL,
    status work_order_status_enum NOT NULL DEFAULT 'CREATED',
    scheduled_date DATE NOT NULL,
    time_slot VARCHAR(50) NOT NULL, -- '08:00 - 12:00'
    plan_speed_mbps INT NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    location GEOMETRY(Point, 4326) NOT NULL,
    assigned_technician_id UUID REFERENCES technicians(id),
    started_at TIMESTAMP WITH TIME ZONE,
    arrived_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    total_duration_minutes INT,
    cost_estimate NUMERIC(12, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_work_orders_location ON work_orders USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_work_orders_status ON work_orders (status);

-- 9. Control de Calidad, Evidencias Fotográficas y Firma (Módulo 3)
CREATE TABLE IF NOT EXISTS work_order_evidences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    work_order_id UUID NOT NULL UNIQUE REFERENCES work_orders(id) ON DELETE CASCADE,
    nap_box_photo_url TEXT,
    nap_port_assigned VARCHAR(20),
    cable_route_photo_url TEXT,
    drop_cable_meters NUMERIC(8, 2),
    optical_power_photo_url TEXT,
    optical_power_dbm NUMERIC(5, 2), -- ej. -19.45 dBm
    equipment_running_photo_url TEXT,
    client_signature_url TEXT,
    client_signer_name VARCHAR(255),
    client_signer_doc VARCHAR(50),
    completed_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Consulta Espacial para Asignación Inteligente (PostGIS)
-- Busca los técnicos más cercanos a una OT dentro de un radio en metros
-- SELECT t.id, t.full_name, ST_Distance(t.current_location::geography, wo.location::geography) AS distance_meters
-- FROM technicians t, work_orders wo
-- WHERE wo.id = '...' AND t.is_available = TRUE
-- ORDER BY distance_meters ASC
-- LIMIT 3;
