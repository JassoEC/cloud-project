# Cloud Engineering Tracking Guide

> Guía de seguimiento para construir **Proyecto Transversal** como laboratorio práctico de Cloud Engineering sobre AWS.

## Cómo usar este documento

Este documento convierte el roadmap del proyecto en un sistema de seguimiento. La intención no es medir cuántas líneas de código existen, sino cuánto dominio técnico has construido.

Una capacidad se considera realmente terminada cuando puedes responder cuatro preguntas:

1. **Build — ¿puedo construirlo?**
2. **Understand — ¿puedo explicar por qué funciona así y qué trade-offs tiene?**
3. **Operate — ¿puedo detectar, diagnosticar y recuperar cuando falla?**
4. **Reproduce — ¿puedo volver a crear el comportamiento mediante infraestructura y automatización?**

Una casilla marcada sólo por "funciona en mi máquina" no representa dominio suficiente.

### Estados recomendados

- [ ] Pendiente
- [~] En progreso
- [x] Implementado
- [x] Entendido
- [x] Operable
- [x] Reproducible

Cuando sea útil, registra evidencia debajo del punto: commit, test, dashboard, captura, métrica, ADR, runbook o experimento de fallo.

---

# 0. Arquitectura y diseño

## Objetivo

Antes de construir servicios, debes ser capaz de explicar el sistema como una arquitectura distribuida y justificar cada componente.

El objetivo no es memorizar AWS. Es aprender a convertir requisitos de negocio en decisiones técnicas: sincronía vs asincronía, estado vs eventos, autorización, persistencia, disponibilidad, observabilidad y coste.

### Checks

- [ ] Definir explícitamente el objetivo de ingeniería del proyecto.
- [ ] Dibujar la arquitectura general.
- [ ] Documentar el flujo principal Resident → API → Visit → Visitor → Guard.
- [ ] Documentar el flujo asíncrono de notificaciones.
- [ ] Documentar el flujo de expiración.
- [ ] Documentar los límites de confianza.
- [ ] Documentar qué servicio AWS resuelve cada responsabilidad.
- [ ] Documentar qué componentes son síncronos y cuáles asíncronos.
- [ ] Documentar los puntos donde puede existir consistencia eventual.
- [ ] Definir ambientes local, staging y producción.
- [ ] Mantener ADRs para decisiones arquitectónicas relevantes.
- [ ] Definir una Definition of Done para capacidades cloud.

### Debes entender

- Por qué una Lambda no es simplemente "un servidor pequeño".
- Cuándo API Gateway debe invocar directamente una Lambda y cuándo conviene desacoplar mediante SQS.
- Por qué el modelo de datos de DynamoDB depende de los access patterns.
- Por qué IAM forma parte de la arquitectura y no es configuración posterior.
- Qué significa que un sistema sea distribuido: latencia, fallos parciales, retries, duplicados y consistencia.

### Evidencia

Debes poder dibujar la arquitectura desde cero y explicar el camino de una petición, incluyendo qué ocurre cuando uno de los componentes falla.

---

# 1. AWS Account Foundation

## Objetivo

Construir una base segura y reproducible para experimentar con AWS sin convertir la cuenta de aprendizaje en un riesgo operativo o financiero.

### Checks

- [ ] Crear/configurar la cuenta AWS de sandbox.
- [ ] Configurar MFA y proteger el usuario root.
- [ ] Definir región principal.
- [ ] Crear estrategia de identidades y roles.
- [ ] Configurar AWS CLI.
- [ ] Configurar perfiles/credenciales sin almacenarlas en el repositorio.
- [ ] Ejecutar y entender `aws sts get-caller-identity`.
- [ ] Configurar alertas de billing.
- [ ] Revisar límites relevantes de AWS.
- [ ] Documentar supuestos de coste.
- [ ] Documentar cómo se destruyen recursos experimentales.

### Debes entender

Diferencia entre:

- cuenta AWS;
- usuario IAM;
- role IAM;
- credenciales permanentes;
- credenciales temporales;
- identidad usada por tu CLI;
- identidad asumida por una Lambda;
- identidad usada por CI/CD.

La pregunta importante no es "¿cómo entro a AWS?", sino:

> ¿Qué identidad está haciendo esta operación y qué permisos tiene?

### Evidencia

Puedes explicar el resultado de `sts get-caller-identity`, identificar qué credencial/role está utilizando una operación y demostrar que el repositorio no contiene secretos AWS.

---

# 2. CDK / Infrastructure as Code

## Objetivo

Que la infraestructura sea código versionado, revisable y reproducible.

### Checks

- [ ] Crear estructura CDK en TypeScript.
- [ ] Definir stack/contexto.
- [ ] Implementar `cdk synth`.
- [ ] Implementar `cdk diff`.
- [ ] Implementar `cdk deploy`.
- [ ] Implementar `cdk destroy` para recursos descartables.
- [ ] Definir outputs útiles.
- [ ] Definir naming/tags.
- [ ] Definir removal policies conscientemente.
- [ ] Modelar Cognito.
- [ ] Modelar API Gateway.
- [ ] Modelar DynamoDB.
- [ ] Modelar SQS/DLQ.
- [ ] Modelar EventBridge Scheduler.
- [ ] Modelar observabilidad.
- [ ] Evitar configuración manual como requisito del despliegue.
- [ ] Revisar el CloudFormation generado.

### Debes entender

CDK no reemplaza CloudFormation: genera una plantilla declarativa que CloudFormation utiliza para gestionar el estado de la infraestructura.

Debes poder distinguir:

- código de aplicación;
- código de infraestructura;
- configuración;
- estado administrado por AWS;
- secretos;
- recursos efímeros vs persistentes.

También debes entender qué implica cambiar un recurso: actualización in-place, reemplazo, pérdida potencial de datos y dependencia entre recursos.

### Evidencia

Una persona debería poder clonar el repositorio, configurar las credenciales y desplegar el stack sin seguir una lista secreta de pasos manuales.

---

# 3. IAM y Security

## Objetivo

Aprender least privilege mediante roles pequeños y responsabilidades aisladas.

### Checks

- [ ] Configurar Cognito User Pool.
- [ ] Configurar App Client.
- [ ] Definir roles/perfiles de usuario.
- [ ] Crear role para API/business logic.
- [ ] Crear role para worker de notificaciones.
- [ ] Crear role para expiración.
- [ ] Separar permisos de deployment de permisos runtime.
- [ ] Evitar AdministratorAccess en workloads.
- [ ] Evitar `*` cuando un recurso concreto sea suficiente.
- [ ] Revisar permisos de cada Lambda.
- [ ] Probar aislamiento Resident → sus propias visitas.
- [ ] Probar aislamiento Guard → su condominio.
- [ ] Probar que un worker no puede modificar recursos que no necesita.
- [ ] Probar comportamiento ante JWT inválido/expirado.
- [ ] Documentar amenazas principales.

### Debes entender

IAM debe responder:

> ¿Quién puede hacer qué, sobre qué recurso y bajo qué condiciones?

No basta con que el sistema funcione. Debes demostrar que una credencial comprometida tiene un blast radius limitado.

También debes diferenciar:

- autenticación: quién eres;
- autorización: qué puedes hacer;
- identidad de usuario;
- identidad de workload;
- permisos de infraestructura.

### Evidencia

Para cada workload puedes explicar qué acciones AWS necesita y por qué. También puedes quitar un permiso deliberadamente y demostrar qué falla y cómo se detecta.

---

# 4. DynamoDB y Access Patterns

## Objetivo

Aprender a diseñar DynamoDB desde las consultas reales, no desde entidades relacionales.

### Access patterns mínimos

- [ ] Obtener visita mediante access code.
- [ ] Obtener visitas de un residente.
- [ ] Obtener visitas esperadas.
- [ ] Buscar visitante por nombre/unidad dentro de una ventana temporal.
- [ ] Consultar residentes de un condominio.
- [ ] Consultar guardias de un condominio.
- [ ] Validar visita.
- [ ] Expirar visita.
- [ ] Consultar historial relevante.

### Checks

- [ ] Definir PK/SK.
- [ ] Definir GSIs.
- [ ] Documentar cardinalidad.
- [ ] Documentar consistencia requerida.
- [ ] Documentar paginación.
- [ ] Documentar coste de cada patrón.
- [ ] Crear tabla mediante CDK.
- [ ] Crear índices mediante CDK.
- [ ] Implementar repository/data-access layer.
- [ ] Implementar queries reales.
- [ ] Evitar scans para operaciones normales.
- [ ] Implementar conditional writes.
- [ ] Analizar necesidad de TransactWriteItems.
- [ ] Diseñar idempotencia.
- [ ] Probar concurrencia de dos validaciones.

### Debes entender

En DynamoDB la pregunta inicial no es:

> "¿Qué tablas tengo?"

sino:

> "¿Qué consultas necesito ejecutar y cómo las resolveré eficientemente?"

Debes entender:

- partition key;
- sort key;
- distribución de datos;
- hot partitions;
- GSI;
- Query vs Scan;
- consistencia;
- conditional expressions;
- idempotencia;
- coste de lectura/escritura;
- paginación.

### Evidencia

Puedes tomar una consulta nueva del dominio y diseñar su acceso DynamoDB antes de escribir el código. Puedes explicar por qué un Scan sería una mala solución para una operación frecuente.

---

# 5. Cognito + API Gateway

## Objetivo

Construir una frontera HTTP autenticada y controlada.

### Checks

- [ ] Registro de usuario.
- [ ] Login.
- [ ] Emisión de JWT.
- [ ] Refresh/token lifecycle.
- [ ] Obtener identidad del usuario desde el JWT.
- [ ] Definir autorización por rol.
- [ ] Configurar API Gateway.
- [ ] Configurar rutas.
- [ ] Configurar CORS donde corresponda.
- [ ] Configurar throttling.
- [ ] Validar requests.
- [ ] Definir errores HTTP consistentes.
- [ ] Proteger endpoints privados.
- [ ] Mantener endpoint público separado conceptualmente.

### Endpoints objetivo

- [ ] `POST /auth/register`
- [ ] `POST /visits`
- [ ] `GET /visits`
- [ ] `DELETE /visits/:id`
- [ ] `POST /visits/validate`
- [ ] `GET /visits/expected`
- [ ] `POST /visits/search`
- [ ] `GET /public/visits/:code`

### Debes entender

La API no debe confiar en datos enviados por el cliente para determinar identidad.

Por ejemplo, un residente no debería enviar `residentId=123` y esperar que la API lo tome como verdad. La identidad debe derivarse del contexto autenticado y la autorización debe verificarse en backend.

También debes entender la diferencia entre:

- authentication;
- authorization;
- validation;
- throttling;
- rate limiting;
- CORS;
- errores de cliente vs errores del servidor.

### Evidencia

Puedes inspeccionar una petición y explicar cómo viaja desde API Gateway hasta la Lambda y cómo se determina la identidad/autorización.

---

# 6. Visit Domain y State Machine

## Objetivo

Mantener el dominio pequeño, pero suficientemente rico para practicar reglas de negocio y transiciones de estado.

### Estado objetivo

`PENDING → VALIDATED`

Y estados terminales:

- `REJECTED`
- `CANCELLED`
- `EXPIRED`

### Checks

- [ ] Crear visita.
- [ ] Generar access code.
- [ ] Calcular expiración.
- [ ] Consultar visita.
- [ ] Cancelar visita.
- [ ] Validar visita.
- [ ] Rechazar visita.
- [ ] Expirar visita.
- [ ] Implementar ventana de ±90 minutos para búsqueda.
- [ ] Implementar comparación exacta cuando sea requerida.
- [ ] Implementar comparación case-insensitive.
- [ ] Proteger información sensible.
- [ ] Aislar datos por condominio.
- [ ] Manejar múltiples coincidencias.
- [ ] Definir comportamiento de estados terminales.
- [ ] Definir comportamiento ante validación duplicada.

### Debes entender

Una transición de estado no es sólo una actualización de una propiedad.

Debes preguntarte:

- ¿quién puede ejecutarla?
- ¿desde qué estado?
- ¿qué ocurre si dos procesos la ejecutan simultáneamente?
- ¿qué evento externo provoca la transición?
- ¿qué side effects produce?
- ¿es idempotente?
- ¿cómo se observa?

### Evidencia

Puedes dibujar la state machine y demostrar qué sucede cuando dos requests intentan validar la misma visita al mismo tiempo.

---

# 7. Arquitectura Asíncrona: SQS + Worker + DLQ

## Objetivo

Aprender a desacoplar trabajo no crítico para la respuesta inmediata y manejar fallos parciales.

Flujo:

`Validation API → SQS → Worker → Notification Provider`

### Checks

- [ ] Crear SQS queue.
- [ ] Configurar visibility timeout.
- [ ] Configurar retries.
- [ ] Crear DLQ.
- [ ] Configurar redrive policy.
- [ ] Crear worker Lambda.
- [ ] Implementar procesamiento.
- [ ] Implementar idempotencia.
- [ ] Manejar errores transitorios.
- [ ] Manejar errores permanentes.
- [ ] Registrar mensajes fallidos.
- [ ] Crear alarma para DLQ.
- [ ] Probar éxito.
- [ ] Probar retry.
- [ ] Probar fallo repetido → DLQ.

### Debes entender

El objetivo de SQS no es simplemente "mandar mensajes".

Debes comprender:

- eventual consistency;
- delivery al menos una vez;
- duplicados;
- visibility timeout;
- retries;
- poison messages;
- DLQ;
- backpressure;
- idempotencia.

Una pregunta clave:

> ¿Qué pasa si el worker procesa el mensaje, envía la notificación y después falla antes de marcar correctamente el mensaje?

La respuesta debe formar parte del diseño.

### Evidencia

Puedes introducir un fallo artificial en el worker y observar el retry, el mensaje en DLQ y la alarma correspondiente.

---

# 8. EventBridge Scheduler y expiración

## Objetivo

Aprender a ejecutar una acción futura como parte del ciclo de vida de una entidad.

### Checks

- [ ] Crear un schedule one-time.
- [ ] Asociarlo a `expiresAt`.
- [ ] Invocar Lambda de expiración.
- [ ] Implementar transición condicional a EXPIRED.
- [ ] Manejar ejecución duplicada.
- [ ] Manejar ejecución retrasada.
- [ ] Definir cleanup del schedule.
- [ ] Observar ejecuciones y errores.
- [ ] Documentar por qué se usa Scheduler.

### Debes entender

Debes distinguir:

- DynamoDB TTL;
- EventBridge Scheduler;
- EventBridge Rules.

TTL sirve principalmente para expiración/eliminación eventual de datos.

Scheduler sirve cuando necesitas que ocurra una acción en un momento determinado.

Una visita que deja de ser válida necesita una transición de negocio, por lo que no debes asumir que TTL sustituye automáticamente esa lógica.

### Evidencia

Puedes retrasar o repetir la ejecución de expiración y demostrar que la transición de estado sigue siendo segura.

---

# 9. Visitor Web: S3 + CloudFront

## Objetivo

Construir un cliente público mínimo y usarlo como laboratorio de hosting, CDN y seguridad.

### Checks

- [ ] Crear aplicación web estática.
- [ ] Publicar assets en S3.
- [ ] Configurar CloudFront.
- [ ] Configurar HTTPS.
- [ ] Configurar caching.
- [ ] Configurar errores/routing necesarios.
- [ ] Consumir endpoint público.
- [ ] Mostrar QR.
- [ ] Mostrar información mínima de visita.
- [ ] Mostrar visita expirada.
- [ ] Mostrar código inválido.
- [ ] Validar comportamiento responsive.

### Seguridad

- [ ] No exponer información sensible innecesaria.
- [ ] Tratar access code como bearer capability.
- [ ] Usar suficiente entropía/impredecibilidad.
- [ ] Proteger endpoint contra abuso.
- [ ] Evitar secretos en JavaScript público.

### Debes entender

La web pública es deliberadamente diferente de la aplicación autenticada.

El visitante no necesita una cuenta, por lo que el access code funciona como una capacidad de acceso. Eso implica que debe ser difícil de adivinar y que la respuesta debe contener sólo lo necesario.

También debes comprender:

- object storage;
- CDN;
- cache;
- invalidation;
- HTTPS;
- origin;
- exposición pública vs acceso público controlado.

### Evidencia

Puedes explicar qué información sería peligrosa exponer aunque el access code sea válido y cómo limitarías esa exposición.

---

# 10. Observabilidad y Operación

## Objetivo

Pasar de "el sistema funciona" a "sé si funciona, por qué falla y cuándo se recuperó".

### Logs

- [ ] Logs estructurados JSON.
- [ ] Request/correlation ID.
- [ ] User ID cuando sea apropiado.
- [ ] Identificadores de operación.
- [ ] Nivel de log coherente.
- [ ] No registrar secretos.
- [ ] Minimizar PII.
- [ ] Registrar errores con contexto útil.

### Métricas

- [ ] Visits created.
- [ ] Visits validated.
- [ ] Visits rejected.
- [ ] Visits expired.
- [ ] Validation latency.
- [ ] API latency.
- [ ] API 5xx.
- [ ] Lambda errors.
- [ ] Lambda duration.
- [ ] Lambda throttles.
- [ ] SQS failures.
- [ ] DLQ messages.

### Dashboards

- [ ] Dashboard técnico.
- [ ] Dashboard de negocio.
- [ ] Visualizar tendencias.
- [ ] Identificar anomalías.

### Alarmas

- [ ] API 5xx.
- [ ] Latencia alta.
- [ ] Lambda errors.
- [ ] Lambda throttling.
- [ ] Mensajes en DLQ.

### Debes entender

Observabilidad responde tres preguntas:

- **Logs:** ¿qué ocurrió?
- **Metrics:** ¿con qué frecuencia o magnitud ocurre?
- **Traces/correlation:** ¿cómo se relacionó una operación distribuida?

No basta con producir logs. Deben permitir investigar una operación concreta.

### Evidencia

Introduce un fallo y demuestra:

1. cómo se detecta;
2. dónde aparece;
3. cómo encuentras la causa;
4. cómo verificas la recuperación.

---

# 11. Testing

## Objetivo

Probar comportamiento, seguridad y contratos, no sólo funciones aisladas.

### Unit tests

- [ ] Reglas de dominio.
- [ ] State transitions.
- [ ] Access code generation.
- [ ] Validation rules.
- [ ] Authorization decisions.

### Integration tests

- [ ] DynamoDB.
- [ ] SQS.
- [ ] Cognito/API boundary.
- [ ] Persistence conditions.
- [ ] Worker behavior.

### E2E

- [ ] Resident crea visita.
- [ ] Visitor abre URL.
- [ ] Guard valida.
- [ ] Notification flow se ejecuta.
- [ ] Visit expira.

### Security tests

- [ ] Resident no puede consultar visita ajena.
- [ ] Guard no puede acceder a otro condominio.
- [ ] JWT inválido es rechazado.
- [ ] JWT expirado es rechazado.
- [ ] Public endpoint no expone datos sensibles.
- [ ] Access code inválido no revela información.
- [ ] Concurrent validation no produce dos validaciones válidas.

### Debes entender

Diferencia entre:

- unit;
- integration;
- contract;
- end-to-end;
- security;
- failure testing.

También debes entender qué dependencias conviene mockear y cuáles vale la pena probar contra servicios reales o emulados.

LocalStack puede ayudar durante desarrollo, pero no demuestra por sí solo que el comportamiento sea idéntico a AWS.

### Evidencia

Una modificación que rompe una regla crítica debe producir un test fallido antes de ser corregida.

---

# 12. CI/CD

## Objetivo

Convertir el repositorio en una cadena reproducible de validación y despliegue.

### Pull Request checks

- [ ] Format.
- [ ] Lint.
- [ ] Unit tests.
- [ ] Integration tests.
- [ ] Build.
- [ ] CDK synth.
- [ ] CDK diff cuando corresponda.
- [ ] Type checking.

### Deployment

- [ ] Ambiente de desarrollo/staging.
- [ ] Ambiente de producción.
- [ ] Configuración por ambiente.
- [ ] Secrets externos.
- [ ] Deployment reproducible.
- [ ] Rollback documentado.
- [ ] GitHub Actions configurado.
- [ ] GitHub → AWS mediante OIDC/short-lived credentials cuando corresponda.
- [ ] No guardar AWS access keys en el repositorio.

### Debes entender

CI/CD no significa sólo "hacer deploy automáticamente".

Debes poder explicar:

- qué valida CI;
- qué cambia CD;
- qué identidad usa GitHub Actions;
- qué permisos tiene;
- cómo se evita comprometer credenciales;
- cómo detectar un deployment defectuoso;
- cómo regresar a una versión anterior.

### Evidencia

Un PR que rompe tests o CDK synth debe quedar bloqueado automáticamente. Un cambio válido debe poder llegar al ambiente correspondiente sin intervención manual secreta.

---

# 13. Reliability / Failure Lab

## Objetivo

Esta sección es donde el proyecto pasa de tutorial a laboratorio de ingeniería.

No sólo debes implementar happy paths. Debes provocar fallos deliberadamente.

### Experimentos

- [ ] Lambda falla.
- [ ] SQS consumer falla.
- [ ] Mensaje termina en DLQ.
- [ ] Mensaje duplicado.
- [ ] Validación duplicada.
- [ ] Race condition durante expiración.
- [ ] API throttling.
- [ ] JWT inválido.
- [ ] DynamoDB conditional write falla.
- [ ] Worker falla después de ejecutar parte de su trabajo.
- [ ] Dependencia externa no responde.

### Para cada experimento documentar

**Failure → Detection → Impact → Recovery → Prevention**

### Debes entender

Un sistema confiable no es aquel donde nada falla.

Es aquel donde:

1. los fallos están contemplados;
2. el impacto está limitado;
3. el sistema puede detectarlos;
4. existe una estrategia de recuperación;
5. el mismo fallo no se repite indefinidamente.

### Evidencia

Cada experimento debe tener un pequeño registro con:

- condición inicial;
- fallo introducido;
- síntoma;
- métrica/log/alarma observada;
- recuperación;
- cambio preventivo.

---

# 14. Cost Engineering

## Objetivo

Aprender a pensar en coste como una propiedad técnica.

### Checks

- [ ] Identificar coste potencial de cada servicio.
- [ ] Configurar billing alerts.
- [ ] Documentar supuestos de uso.
- [ ] Estimar coste mensual.
- [ ] Separar coste fijo y variable.
- [ ] Analizar DynamoDB capacity mode.
- [ ] Analizar Lambda invocations/duration.
- [ ] Analizar API Gateway.
- [ ] Analizar SQS.
- [ ] Analizar CloudFront/S3.
- [ ] Analizar CloudWatch logs/retention.
- [ ] Revisar coste al aumentar tráfico.
- [ ] Documentar supuestos de Free Tier.
- [ ] No asumir que "Free Tier" significa coste cero en cualquier escenario.

### Debes entender

La pregunta no es sólo:

> "¿Cuánto cuesta hoy?"

Sino:

> "¿Qué variable hace que el coste aumente?"

Por ejemplo:

- requests;
- duración;
- almacenamiento;
- transferencia;
- lecturas/escrituras;
- logs;
- mensajes;
- distribución CDN.

### Evidencia

Puedes tomar una hipótesis de tráfico y explicar qué componentes del sistema crecerían de coste y por qué.

---

# 15. Threat Model y Security Review

## Objetivo

Modelar las amenazas antes de que aparezcan como incidentes.

### Checks

- [ ] Identificar assets.
- [ ] Identificar actores.
- [ ] Identificar trust boundaries.
- [ ] Identificar attack surfaces.
- [ ] Revisar autenticación.
- [ ] Revisar autorización.
- [ ] Revisar public URL.
- [ ] Revisar access code.
- [ ] Revisar QR.
- [ ] Revisar abuso del API.
- [ ] Revisar PII.
- [ ] Revisar logs.
- [ ] Documentar mitigaciones.

### Actores mínimos

- Resident.
- Guard.
- Visitor.
- Administrador.
- Atacante externo.
- Workload AWS.
- Pipeline CI/CD.

### Debes entender

Para cada amenaza debes poder responder:

- ¿qué recurso intento proteger?
- ¿quién podría atacarlo?
- ¿qué vector usaría?
- ¿qué control lo bloquea?
- ¿qué ocurre si ese control falla?
- ¿cómo detectaría el incidente?

### Evidencia

Puedes revisar la arquitectura y encontrar al menos un escenario donde una implementación ingenua expondría información que no debería exponerse.

---

# 16. Mobile Phase 2

## Objetivo

Agregar React Native/Expo sólo después de que la plataforma cloud pueda operar independientemente del cliente móvil.

El móvil es consumidor de la plataforma, no el centro del laboratorio cloud.

### Resident App

- [ ] Expo project.
- [ ] Cognito login.
- [ ] Token lifecycle.
- [ ] Crear visita.
- [ ] Consultar visitas.
- [ ] Historial.
- [ ] Compartir visita.
- [ ] Mostrar QR cuando corresponda.
- [ ] Push notifications.

### Guard App

- [ ] Login.
- [ ] Scanner.
- [ ] Validación.
- [ ] Búsqueda manual.
- [ ] Aprobar/rechazar.
- [ ] Manejo de errores.
- [ ] Información mínima antes de coincidencia exacta.

### Cliente/API

- [ ] API client.
- [ ] Token management.
- [ ] Error handling.
- [ ] Loading states.
- [ ] Retry behavior.
- [ ] Offline considerations.
- [ ] Push registration.

### Debes entender

El cliente móvil no debería contener reglas críticas de autorización.

La API debe seguir siendo la fuente de verdad.

La app puede mejorar UX, cachear o anticipar operaciones, pero no debe convertirse en el lugar donde se decide si una operación está permitida.

### Criterio para iniciar Phase 2

No comenzar Mobile Phase 2 hasta que Phase 1 tenga:

- infraestructura desplegable;
- API operativa;
- seguridad;
- persistencia;
- eventos;
- observabilidad;
- tests;
- CI/CD;
- failure lab mínimo.

---

# 17. Definition of Done por capacidad

Para evitar marcar cosas prematuramente, cada capacidad cloud debe pasar por esta plantilla.

## Capacidad

**Nombre:** _ej. Validación de visita_

### Build

- [ ] Código implementado.
- [ ] Infraestructura definida en CDK.
- [ ] Tests automatizados.
- [ ] Configuración documentada.

### Understand

- [ ] Puedo explicar el flujo completo.
- [ ] Puedo explicar por qué elegí esta arquitectura.
- [ ] Conozco alternativas razonables.
- [ ] Conozco los trade-offs.
- [ ] Conozco los límites de la solución.

### Operate

- [ ] Tiene logs útiles.
- [ ] Tiene métricas relevantes.
- [ ] Tiene alarmas cuando corresponde.
- [ ] Sé diagnosticar un fallo.
- [ ] Sé recuperar el sistema.
- [ ] Existe comportamiento definido ante retries/duplicados.

### Security

- [ ] IAM least privilege.
- [ ] Autenticación correcta.
- [ ] Autorización correcta.
- [ ] No expone secretos.
- [ ] No expone PII innecesaria.
- [ ] Se revisaron attack surfaces.

### Cost

- [ ] Conozco los principales drivers de coste.
- [ ] Tengo una estimación.
- [ ] Conozco qué ocurre si aumenta el tráfico.

### Reproduce

- [ ] Infraestructura en CDK.
- [ ] Deployment automatizable.
- [ ] No depende de configuración manual secreta.
- [ ] Puede reconstruirse desde el repositorio.

---

# 18. Tracking global

## Fase 1 — Cloud Engineering

| Área | Peso |
|---|---:|
| Architecture & Design | 5% |
| AWS Foundation | 5% |
| CDK / IaC | 10% |
| IAM / Security | 10% |
| DynamoDB | 10% |
| Cognito / API Gateway | 10% |
| Visit Domain | 5% |
| Async / Events | 10% |
| Visitor Web | 5% |
| Observability | 10% |
| Testing | 5% |
| CI/CD | 10% |
| Reliability / Failure Lab | 5% |
| Cost Engineering | 5% |
| **Total** | **100%** |

> Threat Modeling funciona como una revisión transversal de Security, no como porcentaje adicional.

## Vista Build / Understand / Operate

Usa esta tabla como resumen de avance:

| Capacidad | Build | Understand | Operate | Reproduce |
|---|---|---|---|---|
| CDK foundation | [ ] | [ ] | [ ] | [ ] |
| IAM roles | [ ] | [ ] | [ ] | [ ] |
| DynamoDB access patterns | [ ] | [ ] | [ ] | [ ] |
| Cognito | [ ] | [ ] | [ ] | [ ] |
| API Gateway | [ ] | [ ] | [ ] | [ ] |
| Visit lifecycle | [ ] | [ ] | [ ] | [ ] |
| SQS + DLQ | [ ] | [ ] | [ ] | [ ] |
| Scheduler | [ ] | [ ] | [ ] | [ ] |
| S3 + CloudFront | [ ] | [ ] | [ ] | [ ] |
| Observability | [ ] | [ ] | [ ] | [ ] |
| Testing | [ ] | [ ] | [ ] | [ ] |
| CI/CD | [ ] | [ ] | [ ] | [ ] |
| Failure Lab | [ ] | [ ] | [ ] | [ ] |
| Cost Engineering | [ ] | [ ] | [ ] | [ ] |

---

# 19. Regla práctica de progreso

No midas el avance únicamente por features.

Una feature como "crear visita" puede representar poco aprendizaje si sólo consiste en:

`POST → Lambda → DynamoDB → 200`

El mismo capability representa mucho más aprendizaje si además incluye:

`API → Auth → IAM → Validation → DynamoDB access pattern → Conditional write → Logs → Metrics → Tests → Failure handling → CDK → CI/CD → Cost`

Ese es el criterio de este proyecto.

## El proyecto está avanzando cuando puedes pasar progresivamente de:

**"Sé hacerlo"**

a

**"Sé por qué está diseñado así"**

a

**"Sé qué ocurre cuando falla"**

a

**"Puedo detectarlo y recuperarlo"**

a

**"Puedo reproducirlo automáticamente."**

Ese último nivel es el objetivo principal del laboratorio.
