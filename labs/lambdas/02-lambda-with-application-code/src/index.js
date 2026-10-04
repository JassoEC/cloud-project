const NAME_MAX = 80;
const NAME_PATTERN = /^[^\d]+$/;
const PHONE_PATTERN = /^\d{10}$/;

const buildError = (field, code, message) => ({ field, code, message });

const validateEvent = (event) => {
  const errors = [];

  if (event === null || typeof event !== "object" || Array.isArray(event)) {
    return [buildError("event", "INVALID_EVENT", "Event must be a JSON object")];
  }

  const { name, phone } = event;

  if (name === undefined || name === null) {
    errors.push(buildError("name", "REQUIRED", "Field 'name' is required"));
  } else if (typeof name !== "string") {
    errors.push(buildError("name", "INVALID_TYPE", "Field 'name' must be a string"));
  } else if (name.trim().length === 0) {
    errors.push(buildError("name", "EMPTY", "Field 'name' must not be empty"));
  } else if (name.trim().length > NAME_MAX) {
    errors.push(buildError("name", "TOO_LONG", `Field 'name' must be at most ${NAME_MAX} characters`));
  } else if (!NAME_PATTERN.test(name.trim())) {
    errors.push(buildError("name", "CONTAINS_DIGITS", "Field 'name' must not contain digits"));
  }

  if (phone === undefined || phone === null) {
    errors.push(buildError("phone", "REQUIRED", "Field 'phone' is required"));
  } else if (typeof phone !== "string") {
    errors.push(buildError("phone", "INVALID_TYPE", "Field 'phone' must be a string"));
  } else if (!PHONE_PATTERN.test(phone)) {
    errors.push(buildError("phone", "INVALID_FORMAT", "Field 'phone' must be exactly 10 digits"));
  }

  return errors;
};

const processVisit = (event, context) => ({
  id: context.awsRequestId,
  name: event.name.trim(),
  phone: event.phone,
  receivedAt: new Date().toISOString()
});

export const handler = async (event, context) => {
  const requestId = context?.awsRequestId ?? "unknown";
  const errors = validateEvent(event);

  if (errors.length > 0) {
    console.log(JSON.stringify({ requestId, result: "VALIDATION_FAILED", errorCount: errors.length }));
    return { valid: false, requestId, errors };
  }

  const data = processVisit(event, context);

  console.log(JSON.stringify({ requestId, result: "OK", visitId: data.id }));

  return { valid: true, requestId, data };
};

