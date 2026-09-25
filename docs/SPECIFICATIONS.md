# Especificaciones Técnicas

## 1. Modelo de Datos

### Entidades

#### Resident
```typescript
interface Resident {
  id: string;                    // PK, UUID
  condominiumId: string;         // FK, string
  unitNumber: string;            // string, requerido
  name: string;                  // string, requerido
  email: string;                 // string, requerido, único
  phone: string;                 // string, requerido
  createdAt: string;             // ISO8601
}
```

#### Condominium
```typescript
interface Condominium {
  id: string;                    // PK, UUID
  name: string;                  // string, requerido
  address: string;               // string, requerido
  adminEmail: string;            // string, requerido
  createdAt: string;             // ISO8601
}
```

#### Visit
```typescript
interface Visit {
  id: string;                    // PK, UUID
  residentId: string;            // FK, string, requerido
  visitorName: string;           // string, requerido
  expectedDate: string;          // ISO8601, requerido
  visitorCount: number;          // number, requerido, default: 1
  carDescription?: string;       // string, opcional
  licensePlate?: string;         // string, opcional
  notes?: string;                // string, opcional
  accessCode: string;            // string, único, requerido
  status: 'PENDING' | 'VALIDATED' | 'REJECTED' | 'EXPIRED' | 'CANCELLED';
  createdAt: string;             // ISO8601
  expiresAt: string;             // ISO8601, requerido
}
```

#### Guard
```typescript
interface Guard {
  id: string;                    // PK, UUID
  condominiumId: string;         // FK, string, requerido
  name: string;                  // string, requerido
  email: string;                 // string, requerido, único
  shift?: string;                // string, opcional
  createdAt: string;             // ISO8601
}
```

#### Validation
```typescript
interface Validation {
  id: string;                    // PK, UUID
  visitId: string;               // FK, string, requerido
  guardId: string;               // FK, string, requerido
  validatedAt: string;           // ISO8601
  status: 'APPROVED' | 'REJECTED';
  notes?: string;                // string, opcional
}
```

### Relaciones

```
Resident → Condominium (many-to-one)
Visit → Resident (many-to-one)
Guard → Condominium (many-to-one)
Validation → Visit (one-to-one)
Validation → Guard (many-to-one)
```

### Índices y Patrones de Acceso

#### Visit Table

**Primary Key**: `id`

**Global Secondary Indexes (GSI)**:

1. **GSI-1: residentId + expectedDate**
   - Patrón de acceso: Listar visitas de un residente ordenadas por fecha
   - Query: `GET /visits?residentId=xxx`
   - Sort: expectedDate (descending)

2. **GSI-2: accessCode**
   - Patrón de acceso: Búsqueda pública por código de acceso
   - Query: `GET /public/visits/:accessCode`
   - Single item lookup

3. **GSI-3: expectedDate + status**
   - Patrón de acceso: Búsqueda en rango de tiempo para vigilantes
   - Query: `GET /visits/expected?time=now`
   - Filter: status = PENDING
   - Sort: expectedDate (ascending)

#### Resident Table

**Primary Key**: `id`

**Global Secondary Indexes (GSI)**:

1. **GSI-1: email**
   - Patrón de acceso: Búsqueda por email (login)
   - Query: `GET /residents/by-email?email=xxx`
   - Single item lookup

2. **GSI-2: condominiumId + unitNumber**
   - Patrón de acceso: Listar residentes de un condominio
   - Query: `GET /condominium/residents?condominiumId=xxx`
   - Sort: unitNumber (ascending)

#### Guard Table

**Primary Key**: `id`

**Global Secondary Indexes (GSI)**:

1. **GSI-1: email**
   - Patrón de acceso: Búsqueda por email (login)
   - Query: `GET /guards/by-email?email=xxx`
   - Single item lookup

2. **GSI-2: condominiumId**
   - Patrón de acceso: Listar vigilantes de un condominio
   - Query: `GET /condominium/guards?condominiumId=xxx`

## 2. Endpoints de la API

### Auth

#### POST /auth/register
Registrar nuevo residente

**Request**:
```json
{
  "email": "resident@example.com",
  "password": "SecurePass123!",
  "name": "Juan Pérez",
  "phone": "+527221234567",
  "unitNumber": "15",
  "condominiumId": "cond-uuid-123"
}
```

**Response** (201 Created):
```json
{
  "user": {
    "id": "user-uuid-456",
    "email": "resident@example.com",
    "name": "Juan Pérez"
  },
  "confirmationCode": "123456"
}
```

**Notas**:
- Usa Cognito User Pool
- Envía código de confirmación por email
- Contraseña debe cumplir políticas de Cognito

#### POST /auth/login
Iniciar sesión

**Request**:
```json
{
  "email": "resident@example.com",
  "password": "SecurePass123!"
}
```

**Response** (200 OK):
```json
{
  "accessToken": "eyJhbGc...",
  "idToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "expiresIn": 3600
}
```

**Notas**:
- accessToken expira en 1 hora
- refreshToken para sesiones largas
- idToken contiene claims del usuario (email, name, custom:role)

#### POST /auth/confirm
Confirmar registro

**Request**:
```json
{
  "email": "resident@example.com",
  "confirmationCode": "123456"
}
```

**Response** (200 OK):
```json
{
  "success": true
}
```

### Residentes

#### POST /visits
Registrar nueva visita

**Headers**:
```
Authorization: Bearer <accessToken>
```

**Request**:
```json
{
  "visitorName": "María González",
  "expectedDate": "2026-01-15T15:00:00Z",
  "visitorCount": 2,
  "carDescription": "Honda Civic rojo",
  "licensePlate": "ABC-123",
  "notes": "Viene por mudanza"
}
```

**Response** (201 Created):
```json
{
  "visitId": "visit-uuid-789",
  "accessCode": "ABC123XYZ",
  "publicUrl": "https://app.com/v/ABC123XYZ",
  "expiresAt": "2026-01-16T15:00:00Z"
}
```

**Lógica de negocio**:
- Genera accessCode único (8 caracteres alfanuméricos)
- Calcula expiresAt = expectedDate + 24h
- Status inicial: PENDING
- Programa evento de expiración en EventBridge

#### GET /visits
Listar visitas del residente autenticado

**Headers**:
```
Authorization: Bearer <accessToken>
```

**Query Parameters**:
```
?status=PENDING&limit=20&offset=0
```

**Response** (200 OK):
```json
{
  "visits": [
    {
      "id": "visit-uuid-789",
      "visitorName": "María González",
      "expectedDate": "2026-01-15T15:00:00Z",
      "visitorCount": 2,
      "carDescription": "Honda Civic rojo",
      "licensePlate": "ABC-123",
      "status": "PENDING",
      "accessCode": "ABC123XYZ",
      "publicUrl": "https://app.com/v/ABC123XYZ",
      "expiresAt": "2026-01-16T15:00:00Z",
      "createdAt": "2026-01-14T10:00:00Z"
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0
}
```

**Lógica de negocio**:
- Filtra por residentId del token JWT
- Ordena por expectedDate descending
- Paginación con limit/offset

#### GET /visits/:id
Obtener detalle de visita específica

**Headers**:
```
Authorization: Bearer <accessToken>
```

**Response** (200 OK):
```json
{
  "visit": {
    "id": "visit-uuid-789",
    "visitorName": "María González",
    "expectedDate": "2026-01-15T15:00:00Z",
    "visitorCount": 2,
    "carDescription": "Honda Civic rojo",
    "licensePlate": "ABC-123",
    "notes": "Viene por mudanza",
    "status": "PENDING",
    "accessCode": "ABC123XYZ",
    "publicUrl": "https://app.com/v/ABC123XYZ",
    "expiresAt": "2026-01-16T15:00:00Z",
    "createdAt": "2026-01-14T10:00:00Z",
    "resident": {
      "id": "resident-uuid-456",
      "name": "Juan Pérez",
      "unitNumber": "15"
    }
  }
}
```

**Lógica de negocio**:
- Valida que la visita pertenece al residente autenticado
- Retorna 404 si no existe o no pertenece

#### DELETE /visits/:id
Cancelar visita

**Headers**:
```
Authorization: Bearer <accessToken>
```

**Response** (200 OK):
```json
{
  "success": true
}
```

**Lógica de negocio**:
- Cambia status a CANCELLED
- Solo puede cancelar si status es PENDING
- Cancela evento de expiración en EventBridge

### Vigilantes

#### POST /visits/validate
Validar visita (escanear QR)

**Headers**:
```
Authorization: Bearer <accessToken>
```

**Request**:
```json
{
  "accessCode": "ABC123XYZ"
}
```

**Response** (200 OK):
```json
{
  "visit": {
    "id": "visit-uuid-789",
    "visitorName": "María González",
    "expectedDate": "2026-01-15T15:00:00Z",
    "visitorCount": 2,
    "carDescription": "Honda Civic rojo",
    "licensePlate": "ABC-123",
    "status": "VALIDATED"
  },
  "resident": {
    "id": "resident-uuid-456",
    "name": "Juan Pérez",
    "unitNumber": "15",
    "phone": "+527221234567"
  }
}
```

**Lógica de negocio**:
- Busca visita por accessCode
- Valida que no esté expirada (expiresAt > now)
- Cambia status a VALIDATED
- Envía notificación push al residente (vía SQS → SNS)
- Crea registro de Validation

**Errores**:
- 404: Código no encontrado
- 410: Código expirado
- 409: Visita ya validada

#### GET /visits/expected
Listar visitas esperadas en rango ±90min

**Headers**:
```
Authorization: Bearer <accessToken>
```

**Query Parameters**:
```
?time=2026-01-15T15:00:00Z
```

**Response** (200 OK):
```json
{
  "visits": [
    {
      "id": "visit-uuid-789",
      "visitorName": "María González",
      "expectedDate": "2026-01-15T15:00:00Z",
      "visitorCount": 2
    }
  ]
}
```

**Lógica de negocio**:
- Si time no proporcionado, usa now
- Calcula rango: time - 90min a time + 90min
- Busca visitas con status = PENDING en ese rango
- NO incluye datos críticos del residente (solo visitorName, expectedDate, visitorCount)
- Ordena por expectedDate ascending

#### POST /visits/search
Buscar visita por nombre o unidad (flujo alternativo)

**Headers**:
```
Authorization: Bearer <accessToken>
```

**Request**:
```json
{
  "visitorName": "María González",
  "unitNumber": "15"
}
```

**Response** (200 OK) - Con coincidencia:
```json
{
  "found": true,
  "visit": {
    "id": "visit-uuid-789",
    "visitorName": "María González",
    "expectedDate": "2026-01-15T15:00:00Z",
    "visitorCount": 2,
    "resident": {
      "name": "Juan Pérez",
      "unitNumber": "15",
      "phone": "+527221234567"
    }
  }
}
```

**Response** (200 OK) - Sin coincidencia:
```json
{
  "found": false,
  "message": "No se encontró coincidencia exacta. Por favor contacte al residente directamente."
}
```

**Lógica de negocio**:
- Busca visitas en rango ±90min desde now
- Busca coincidencia exacta (case-insensitive) en visitorName O unitNumber
- Si hay coincidencia → devuelve info completa del residente
- Si NO hay coincidencia → NO devuelve datos críticos
- Si hay múltiples coincidencias → devuelve todas

### Públicas (sin autenticación)

#### GET /public/visits/:accessCode
Obtener información pública de visita

**Response** (200 OK):
```json
{
  "visit": {
    "visitorName": "María González",
    "expectedDate": "2026-01-15T15:00:00Z",
    "residentName": "Juan Pérez",
    "unitNumber": "15",
    "accessCode": "ABC123XYZ"
  }
}
```

**Lógica de negocio**:
- Busca visita por accessCode
- Valida que no esté expirada
- Retorna información mínima necesaria para el visitante
- Rate limiting: 100 requests/min por IP

**Errores**:
- 404: Código no encontrado
- 410: Código expirado

**Rate Limiting**:
- 100 requests por minuto por IP
- Retorna 429 si excede límite

### Admin

#### GET /condominium/residents
Listar todos los residentes del condominio

**Headers**:
```
Authorization: Bearer <accessToken>
```

**Response** (200 OK):
```json
{
  "residents": [
    {
      "id": "resident-uuid-456",
      "name": "Juan Pérez",
      "unitNumber": "15",
      "email": "juan@example.com",
      "phone": "+527221234567"
    }
  ]
}
```

**Lógica de negocio**:
- Solo accesible por admin del condominio
- Valida que el admin pertenece al condominio

#### GET /condominium/guards
Listar todos los vigilantes del condominio

**Headers**:
```
Authorization: Bearer <accessToken>
```

**Response** (200 OK):
```json
{
  "guards": [
    {
      "id": "guard-uuid-789",
      "name": "Carlos López",
      "email": "carlos@example.com",
      "shift": "Morning"
    }
  ]
}
```

**Lógica de negocio**:
- Solo accesible por admin del condominio
- Valida que el admin pertenece al condominio

#### GET /condominium/visits
Listar todas las visitas del condominio

**Headers**:
```
Authorization: Bearer <accessToken>
```

**Query Parameters**:
```
?startDate=2026-01-01T00:00:00Z&endDate=2026-01-31T23:59:59Z&status=VALIDATED
```

**Response** (200 OK):
```json
{
  "visits": [
    {
      "id": "visit-uuid-789",
      "visitorName": "María González",
      "expectedDate": "2026-01-15T15:00:00Z",
      "status": "VALIDATED",
      "resident": {
        "name": "Juan Pérez",
        "unitNumber": "15"
      },
      "validatedAt": "2026-01-15T14:55:00Z"
    }
  ],
  "total": 1
}
```

**Lógica de negocio**:
- Solo accesible por admin del condominio
- Filtra por rango de fechas y status
- Incluye información del residente

#### GET /condominium/metrics
Obtener métricas del condominio

**Headers**:
```
Authorization: Bearer <accessToken>
```

**Response** (200 OK):
```json
{
  "metrics": {
    "totalVisits": 150,
    "avgValidationTime": 120,
    "visitsByStatus": {
      "VALIDATED": 120,
      "REJECTED": 10,
      "EXPIRED": 15,
      "CANCELLED": 5
    },
    "topResidents": [
      {
        "residentId": "resident-uuid-456",
        "name": "Juan Pérez",
        "visitCount": 25
      }
    ]
  }
}
```

**Lógica de negocio**:
- Solo accesible por admin del condominio
- avgValidationTime en segundos (tiempo promedio entre creación y validación)
- topResidents: top 10 residentes con más visitas

## 3. Reglas de Negocio

### RB-01: Expiración de códigos
- Los códigos de acceso expiran 24 horas después de la fecha esperada
- EventBridge programa evento de expiración al crear visita
- Lambda de expiración cambia status a EXPIRED
- URL pública deja de funcionar después de expiración

**Implementación**:
```typescript
// Al crear visita
const expiresAt = addHours(expectedDate, 24);
await eventBridge.putRule({
  schedule: `at(${expiresAt.toISOString()})`,
  target: {
    arn: expirationLambdaArn,
    input: JSON.stringify({ visitId })
  }
});

// Lambda de expiración
await dynamoDB.update({
  Key: { id: visitId },
  UpdateExpression: 'SET #status = :status',
  ExpressionAttributeNames: { '#status': 'status' },
  ExpressionAttributeValues: { ':status': 'EXPIRED' }
});
```

### RB-02: Rango de búsqueda ±90min
- Búsqueda alternativa (sin QR) usa rango de ±90min desde hora actual
- Si hora actual es 15:00, busca visitas entre 13:30 y 16:30
- Rango configurable en el futuro

**Implementación**:
```typescript
const now = new Date();
const startTime = subMinutes(now, 90);
const endTime = addMinutes(now, 90);

const visits = await dynamoDB.query({
  IndexName: 'expectedDate-status-index',
  KeyConditionExpression: 'expectedDate BETWEEN :start AND :end AND #status = :status',
  ExpressionAttributeNames: { '#status': 'status' },
  ExpressionAttributeValues: {
    ':start': startTime.toISOString(),
    ':end': endTime.toISOString(),
    ':status': 'PENDING'
  }
});
```

### RB-03: Coincidencia exacta requerida
- Búsqueda por nombre o número de unidad requiere coincidencia exacta (case-insensitive)
- Coincidencia parcial NO es suficiente
- Si hay coincidencia → devuelve info completa del residente
- Si NO hay coincidencia → NO devuelve datos críticos

**Implementación**:
```typescript
const match = visits.find(v => 
  v.visitorName.toLowerCase() === visitorName.toLowerCase() ||
  v.unitNumber === unitNumber
);

if (match) {
  return { found: true, visit: match }; // Info completa
} else {
  return { found: false, message: "No se encontró coincidencia" };
}
```

### RB-04: Protección de datos sensibles
- Sin coincidencia exacta:
  - NO muestra: teléfono del residente, dirección exacta
  - SÍ muestra: "Hay una visita esperada, confirma con el residente"
- Con coincidencia exacta:
  - Muestra: nombre residente, unidad, teléfono (para llamar)

**Implementación**:
```typescript
// Sin coincidencia
if (!match) {
  return {
    found: false,
    message: "No se encontró coincidencia exacta. Por favor contacte al residente directamente."
  };
}

// Con coincidencia
return {
  found: true,
  visit: {
    ...match,
    resident: {
      name: match.resident.name,
      unitNumber: match.resident.unitNumber,
      phone: match.resident.phone // Solo con coincidencia
    }
  }
};
```

### RB-05: Flujo alternativo sin QR
- Vigilante puede buscar por nombre del visitante o número de unidad
- Sistema busca en rango ±90min
- Si hay coincidencia → vigilante puede validar manualmente
- Si NO hay coincidencia → vigilante debe llamar al residente directamente

**Implementación**:
```typescript
// POST /visits/search
const visits = await this.searchVisitsInRange(visitorName, unitNumber, now);

if (visits.length === 0) {
  return { found: false, message: "No se encontró coincidencia" };
}

// Si hay coincidencia, vigilante puede llamar al residente
return {
  found: true,
  visit: visits[0],
  resident: visits[0].resident
};
```

### RB-06: Múltiples visitas con mismo nombre
- Si hay múltiples visitas con mismo nombre de visitante:
  - Sistema muestra todas las coincidencias
  - Vigilante elige la correcta basándose en hora esperada o unidad
- Si hay ambigüedad → vigilante llama al residente

**Implementación**:
```typescript
const matches = visits.filter(v => 
  v.visitorName.toLowerCase() === visitorName.toLowerCase()
);

if (matches.length > 1) {
  return {
    found: true,
    visits: matches, // Devuelve todas las coincidencias
    message: "Múltiples visitas encontradas. Por favor seleccione la correcta."
  };
}
```

### RB-07: Validación de información por vigilante
- Al escanear QR o buscar visita, vigilante debe confirmar:
  - Nombre del visitante coincide
  - Número de visitantes coincide
  - (Opcional) Descripción del auto coincide
  - (Opcional) Placas coinciden
- Si algo no coincide → vigilante puede rechazar o llamar al residente

**Implementación**:
```typescript
// POST /visits/validate
const visit = await this.getVisitByAccessCode(accessCode);

// Vigilante confirma visualmente
// Si todo coincide:
await this.updateVisitStatus(visit.id, 'VALIDATED');
await this.sendNotification(visit.residentId, 'Su visita ha sido validada');

// Si algo no coincide:
await this.updateVisitStatus(visit.id, 'REJECTED');
await this.sendNotification(visit.residentId, 'Su visita fue rechazada');
```

## 4. Diagramas de Flujo

### Flujo Principal (QR-based)

```
Resident                System                  Visitor                 Guard
   |                       |                       |                       |
   |-- Register visit ---->|                       |                       |
   |                       |-- Generate code ----->|                       |
   |<-- Return URL --------|                       |                       |
   |                       |                       |                       |
   |-- Share URL via WA -->|---------------------->|                       |
   |                       |                       |-- Open URL ---------->|
   |                       |                       |                       |
   |                       |<-- Fetch visit info --|                       |
   |                       |-- Return info ------->|                       |
   |                       |                       |-- Display QR -------->|
   |                       |                       |                       |
   |                       |                       |<-- Show QR to guard --|
   |                       |                       |                       |
   |                       |<-- Scan QR -----------|<-- Scan QR -----------|
   |                       |-- Validate code ----->|                       |
   |                       |-- Return info ------->|                       |
   |                       |                       |                       |
   |                       |<-- Approve -----------|<-- Approve -----------|
   |<-- Push notification -|                       |                       |
```

**Secuencia detallada**:

1. Residente abre app y registra visita
2. Sistema genera accessCode único y URL pública
3. Sistema programa evento de expiración en EventBridge
4. Sistema retorna URL pública al residente
5. Residente comparte URL por WhatsApp/Messenger
6. Visitante abre URL en navegador
7. Página web hace fetch a GET /public/visits/:accessCode
8. Sistema retorna info de visita (sin datos sensibles)
9. Página web genera QR con accessCode usando qrcode.js
10. Visitante muestra QR al vigilante
11. Vigilante escanea QR con su app
12. App del vigilante hace POST /visits/validate
13. Sistema valida código, cambia status a VALIDATED
14. Sistema envía notificación push al residente (vía SQS → SNS)
15. Residente recibe alerta de visita validada

### Flujo Alternativo (sin QR)

```
Visitor                 Guard                   System                  Resident
   |                       |                       |                       |
   |-- Arrive without ---->|                       |                       |
   |   cellphone           |                       |                       |
   |                       |-- Search by name ---->|                       |
   |                       |                       |-- Search ±90min ----->|
   |                       |                       |-- Check exact match ->|
   |                       |                       |                       |
   |                       |<-- No match ----------|                       |
   |                       |-- Call resident ----->|---------------------->|
   |                       |                       |                       |
   |                       |<-- Confirm -----------|<-- Confirm -----------|
   |                       |-- Manual validate --->|                       |
   |                       |                       |-- Notify resident --->|
```

**Secuencia detallada**:

1. Visitante llega sin celular o sin batería
2. Vigilante abre app y busca por nombre del visitante o número de unidad
3. Sistema busca visitas en rango ±90min desde now
4. Sistema verifica si hay coincidencia exacta
5. Si NO hay coincidencia → sistema NO devuelve datos críticos
6. Vigilante busca número de residente en directorio (físico o app)
7. Vigilante llama al residente para confirmar
8. Residente confirma visita
9. Vigilante valida manualmente en su app
10. Sistema envía notificación push al residente

### Flujo de Expiración

```
EventBridge          Lambda (Expiration)          DynamoDB
     |                       |                       |
     |-- Trigger at -------->|                       |
     |   expiresAt           |-- Update status ----->|
     |                       |                       |
     |                       |<-- Success -----------|
     |                       |                       |
     |-- Delete rule ------->|                       |
```

**Secuencia detallada**:

1. EventBridge dispara evento en expiresAt
2. Lambda de expiración recibe evento con visitId
3. Lambda actualiza status de visita a EXPIRED
4. Lambda elimina regla de EventBridge (cleanup)

## 5. Consideraciones de Seguridad

### Autenticación
- Cognito maneja JWT tokens
- Tokens expiran en 1 hora
- Refresh tokens para sesiones largas (7 días)
- Tokens se envían en header `Authorization: Bearer <token>`

### Autorización
- **RB-01**: Residentes solo pueden ver/editar sus propias visitas
  - Validación: `visit.residentId === token.sub`
- **RB-02**: Vigilantes solo pueden validar visitas de su condominio
  - Validación: `visit.condominiumId === guard.condominiumId`
- **RB-03**: Admins pueden ver todas las visitas del condominio
  - Validación: `admin.condominiumId === visit.condominiumId`

### Protección de datos
- Endpoints públicos tienen rate limiting (100 req/min por IP)
- Datos sensibles no se exponen sin coincidencia exacta
- Tokens JWT en headers, no en URLs
- HTTPS obligatorio en todos los endpoints
- Cognito encripta passwords con bcrypt

### Validación de entrada
- Todos los inputs se validan en backend
- Sanitización de strings para prevenir XSS
- Validación de formatos (email, phone, date)
- Validación de rangos (visitorCount > 0, expectedDate > now)
- Uso de DTOs (Data Transfer Objects) con class-validator

### Logs y auditoría
- Todos los eventos críticos se loguean en CloudWatch
- Logs incluyen: userId, action, timestamp, result
- No se loguean datos sensibles (passwords, tokens)
- Retención de logs: 30 días (configurable)

## 6. Testing Strategy

### Unit Tests
- Cobertura mínima: 80%
- Framework: Jest
- Mock de servicios AWS (DynamoDB, SQS, SNS)
- Tests de reglas de negocio (RB-01 a RB-07)

### Integration Tests
- Tests contra LocalStack
- Tests de flujos completos (register visit → validate → notify)
- Tests de expiración automática

### E2E Tests
- Tests de flujos completos con cliente móvil
- Tests de flujos alternativos (sin QR)
- Tests de error handling

## 7. Deployment Strategy

### Development
- LocalStack para servicios AWS
- DynamoDB local para datos
- Hot reload con nodemon

### Staging
- Deploy a AWS real (cuenta staging)
- Datos de prueba
- Testing de integración con servicios reales

### Production
- Deploy a AWS real (cuenta production)
- CloudFront para página web
- Route53 para DNS
- ACM para certificados SSL
- CloudWatch alarms para monitoreo

## 8. Monitoring and Alerting

### Métricas clave
- Latencia de API (p95, p99)
- Tasa de errores (5xx)
- Tiempo de validación de visitas
- Visitas expiradas vs validadas

### Alarmas
- Error rate > 5% por 5 minutos
- Latencia p95 > 2s por 5 minutos
- Lambda throttling > 0

### Dashboards
- Dashboard de negocio: visitas por día, tiempo promedio de validación
- Dashboard técnico: latencia, errores, throttling
