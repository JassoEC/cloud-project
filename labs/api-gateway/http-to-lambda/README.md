# Http to Lambda

## Objetivo

- Comprender el ciclo de vida desde que se recibe una peticion http mediante ApiGateway
hasta la ejecuion de una Lambda function


## Flow

- Http request detected

- Handle request with a GET route

- Trigger lambda function

## Input

- Query param, it acts as a simulated db identifier


## Espected behaviour

- ApiGateway catch request

- ApiGateway generates a event

- Existing lambda hadnles event

- Http valid response recived


## Boundaries

- There is not real db, is just mocked data into the function


- No Aurota
- No RDS
- No dynamo

