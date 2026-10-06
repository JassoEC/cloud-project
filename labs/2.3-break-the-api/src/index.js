const MOCK_VISITORS = [{ id: "1", name: "John Doe" },
{ id: "2", name: "Jane Doe" },
{ id: "3", name: "Carlos Ramirez" }
];

const buildResponse = (statusCode, body) => ({
statusCode,
headers: { "Content-Type": "application/json" },
body: JSON.stringify(body)
});



// intentional breaking
//const msg = body.unknown_value;
//console.log(mgs)

export const handler = async (event, context) => {
const requestId = context?.awsRequestId ?? "unknown";
const id = event?.queryStringParameters?.id?.trim();

console.log(JSON.stringify({
  requestId,
  eventSource: "api-gateway",
  method: event?.requestContext?.http?.method ?? event?.httpMethod ?? "unknown",
  path: event?.rawPath ?? event?.path ?? "unknown",
  id: id ?? null
}));

if(isNaN(id)){
console.log(JSON.stringify({requestId, result: "BAD_REQUEST", reason:"INVALID_ID_FORMAT"}))
    return buildResponse(400,{
      error:{
        code: 'INVALID_ID_FORMAT',
        message:"The parameter id should be a valid number"
      }
    })
  }

if (!id) {
  console.log(JSON.stringify({ requestId, result: "BAD_REQUEST", reason: "MISSING_ID" }));
  return buildResponse(400, {
    error: {
      code: "MISSING_ID",
      message: "Query parameter 'id' is required"
    }
  });
}

const visitor = MOCK_VISITORS.find((item) => item.id === id);

if (!visitor) {
  console.log(JSON.stringify({ requestId, result: "NOT_FOUND", id }));
  return buildResponse(404, {
    error: {
      code: "VISITOR_NOT_FOUND",
      message: `No visitor found for id '${id}'`
    }
  });
}

console.log(JSON.stringify({ requestId, result: "OK", visitorId: visitor.id }));
return buildResponse(200, { data: visitor });
};

