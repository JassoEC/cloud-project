# Lambda with Application Code

## Objective

Learn to write application code that can run inside an AWS Lambda function, receiving a JSON event, validating its input data, and producing a JSON response.

## Flow

```text
Mock JSON Event
      ↓
   Lambda
      ↓
 Input validation
      ↓
 Processing
      ↓
 JSON response
```

## Input

The test event will be a JSON object generated manually from **Lambda Test Events**.

Example:

```json
{
  "name": "Carlos",
  "phone": "5551234567"
}
```

## Expected behavior

The function should:

1. Receive the JSON event.
2. Validate that the expected fields exist.
3. Process the received data.
4. Produce a JSON response indicating the result of the validation.

## Lab boundaries

This exercise uses **AWS Lambda** only.

The following will not be used yet:

* API Gateway
* DynamoDB
* S3
* Aurora
* MongoDB or another database
* Data persistence
* Authentication
* Additional monitoring or logging
* Infrastructure as code

The data used will be **mock/test data** only, provided via Lambda Test Events.

## Troubleshooting

- Runtime.UserCodeSyntaxError

The code does not even execute because it fails at "compile" time, and the process stops.

- ReferenceError

Occurs when, even though the syntax is correct, a variable that does not exist or is not declared within scope is referenced.

- Validation error with Status: Succeeded

The syntax is correct and there are no wrong references, but the added validations catch an error in the event format, a missing key, or an invalid type.

All of them can be identified by reviewing the execution status and the logs written by the function.
