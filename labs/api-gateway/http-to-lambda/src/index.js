const MOCK_USERS = [
  {
    id: "123",
    name: "John Doe",
    role: "developer"
  },
  {
    id: "456",
    name: "Jane Doe",
    role: "admin"
  }
];


export const handler = async (event, context) => {
  const requestId = context?.awsRequestId ?? "unknown";



if (event?.action === "getUsers") {
    return {
      valid: true,
      requestId,
      data: MOCK_USERS
    };
  }

  return {
    valid: false,
    requestId,
    error: {
      code: "UNKNOWN_ACTION",
      message: "Unsupported action"
    }
  };




  return {
    valid: true,
    requestId,
    data: MOCK_USERS
  };
};
