# 🚀 FiberOps ERP - Suite Integral de Telecomunicaciones & Field Service FTTH

Sistema integral de clase empresarial para ISPs, operadoras de telecomunicaciones y contratistas de fibra óptica al hogar (**FTTH**), diseñado bajo los estándares de **Clean Architecture**, **Domain-Driven Design (DDD)** y un diseño visual de alta tecnología con **Glassmorphism**, mapas en vivo y simulador PWA de campo.

---

## 🌐 URLs de Acceso Local
- **Frontend Web (Suite Completa):** [http://localhost:5180/](http://localhost:5180/)
- **Backend API REST (Express + TypeScript):** [http://localhost:3011/api](http://localhost:3011/api)
- **API Health Check:** [http://localhost:3011/health](http://localhost:3011/health)

---

## 🏛️ Módulos Construidos y Funcionando al 100%

### 1. Módulo 1: Despacho & CRM (Órdenes de Trabajo)
- Registro y gestión de clientes residenciales, corporativos y B2B.
- Creación de OTs con selección de velocidad (300, 500, 1000 Mbps) y franjas horarias.
- **Asignación Inteligente (Smart Dispatch):** Algoritmo de proximidad geoespacial (Haversine/PostGIS) que selecciona automáticamente la cuadrilla más cercana con la certificación requerida.

### 2. Módulo 2: Logística, Bodega Central & Bodega Móvil
- Control de stock de **Bodega Central vs. Bodega Móvil** (asignada a cada vehículo por placa).
- **Trazabilidad de Seriales:** Seguimiento unitario de ONUs (Huawei HG8145V5) y Routers (ZTE F670L Wi-Fi 6) por número de serie y dirección MAC.
- **Kits de Instalación Predefinidos:** Asignación automática de materiales por OT (rosetas ópticas, conectores mecánicos SC/APC, cable drop y herrajes tensores).

### 3. Módulo 3: App Móvil para Técnicos en Campo (PWA)
- **Trazabilidad de Estados en Tiempo Real:** `Asignada` $\rightarrow$ `En Camino` $\rightarrow$ `En Sitio (Geocerca)` $\rightarrow$ `En Ejecución` $\rightarrow$ `Completada`.
- **Ruteo GPS Integrado:** Navegación en un solo clic a Google Maps / Waze.
- **Checklist de Calidad Obligatorio:**
  1. Fotografía de la caja NAP con puerto asignado (ej. *NAP-CED-04 / Puerto #06*).
  2. Fotografía del recorrido de acometida con liquidación de metros reales de cable drop.
  3. **Medición de Potencia Óptica (Power Meter):** Registro en **dBm** con validador y semáforo automático de potencia (-15.00 a -25.00 dBm).
  4. Fotografía de equipo encendido (luces PON y Wi-Fi en verde).
  5. **Firma Digital del Cliente en Pantalla:** Canvas táctil HTML5 interactivo con borrador y captura de firma.
- **Modo Offline Total:** Capacidad de operar sin conexión guardando acciones y firmas en caché local, con sincronización automática al recuperar señal.

### 4. Módulo 4: Finanzas, Liquidación de Contratistas & Costos
- **Liquidación de Contratistas:** Cálculo automático de mano de obra por tarifario por tipo de OT, metros de cable drop excedente (más de 60m), bonificaciones de calidad por *First Time Fix* (>95%) y deducciones por mermas o material dañado.
- **Rentabilidad por Proyecto / OT:** Comparativa financiera de cada instalación:
  $$\text{Margen Bruto} = \text{Cobro al Operador} - (\text{Materiales Gastados} + \text{Pago a Cuadrilla} + \text{Costos de Flota/Combustible})$$

### 5. Módulo 4: Control de Flotilla y Vehículos
- Seguimiento de vehículos por cuadrilla y placa (Renault Kangoo, Chevrolet N300, Nissan Frontier).
- Registro de odómetro (kilometraje), consumo de combustible diario y rendimiento (km/galón).
- **Alertas Preventivas Automáticas:** Vencimiento de SOAT, Revisión Técnico-Mecánica (RTM) y alerta para cambio de aceite.

### 6. Módulo 5: Recursos Humanos, Habilitaciones & Asistencia
- **Legajo de Técnicos:** Datos de contacto, emergencia y especialidades (fusión óptica, alturas, espacios confinados).
- **Semáforo de Habilitaciones Obligatorias:** Control de vencimiento de carnets de alturas y RETIE, con bloqueo preventivo de despacho si el técnico no está habilitado.
- **Control de Asistencia:** Registro de Check-In a base (06:55 AM) y Check-Out con marcación de puntualidad.

### 7. Módulo 6: Dashboard Gerencial, BI & Mapas en Vivo
- **Mapa en Tiempo Real (Leaflet):** Ubicación satelital de cuadrillas en campo y dispersión geográfica de órdenes de trabajo con marcadores interactivos.
- **KPIs Operativos:** MTTR (Tiempo promedio de instalación), First Time Fix Rate (95.8%) y Tasa de Conformidad de Potencia Óptica (98.4%).

---

## 🗄️ Base de Datos: PostgreSQL + PostGIS (Producción)
El esquema DDL relacional y geoespacial completo se encuentra en:
[schema.sql](file:///c:/Users/sergio.vanegas/Downloads/CALIDAD2026/a/packages/server/src/infrastructure/database/schema.sql)

Incluye tablas normalizadas, tipos ENUM, campos espaciales `location GEOMETRY(Point, 4326)` e índices espaciales GiST.

---

## 🛠️ Comandos de Ejecución

```bash
# Instalar dependencias en todo el monorepo
npm install

# Compilar todos los paquetes
npm run build

# Iniciar servidor backend
npm run dev:server

# Iniciar cliente frontend
npm run dev:client
```
