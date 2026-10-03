# Lambda with Application Code

## Objetivo

Aprender a escribir código de aplicación que pueda ejecutarse dentro de una función AWS Lambda, recibiendo un evento JSON, validando sus datos de entrada y generando una respuesta JSON.

## Flujo

```text
Mock JSON Event
      ↓
   Lambda
      ↓
Validación del input
      ↓
Procesamiento
      ↓
Respuesta JSON
```

## Input

El evento de prueba será un objeto JSON generado manualmente desde **Lambda Test Events**.

Ejemplo:

```json
{
  "name": "Carlos",
  "phone": "5551234567"
}
```

## Comportamiento esperado

La función deberá:

1. Recibir el evento JSON.
2. Validar que existan los campos esperados.
3. Procesar los datos recibidos.
4. Generar una respuesta JSON indicando el resultado de la validación.

## Límites del laboratorio

Este ejercicio utiliza únicamente **AWS Lambda**.

No se utilizarán todavía:

* API Gateway
* DynamoDB
* S3
* Aurora
* MongoDB u otra base de datos
* Persistencia de datos
* Autenticación
* Monitoreo o logging adicional
* Infraestructura como código

Los datos utilizados serán únicamente **mock/test data** proporcionados mediante Lambda Test Events.

