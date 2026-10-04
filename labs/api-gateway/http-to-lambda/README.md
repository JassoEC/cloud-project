# HTTP to Lambda

## Objective

- Understand the lifecycle from receiving an HTTP request through API Gateway to the execution of a Lambda function.

## Flow

- Detect an HTTP request.
- Handle the request with a GET route.
- Trigger the Lambda function.

## Input

- Query parameter; it acts as a simulated database identifier.

## Expected behavior

- API Gateway catches the request.
- API Gateway generates an event.
- The existing Lambda handles the event.
- A valid HTTP response is received.

## Boundaries

- There is no real database; the data is mocked inside the function.
- No Aurora.
- No RDS.
- No DynamoDB.
