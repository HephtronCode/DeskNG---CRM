// Express 5 exposes req.query as a getter-only property, so
// plain assignment throws TypeError. Define an own property to
// safely override parsed request sections.
const overrideSection = (req, section, value) => {
  Object.defineProperty(req, section, {
    value,
    writable: true,
    configurable: true,
    enumerable: true,
  });
};

export const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    // Replace request objects with stripped, validated data
    if (parsed.body) overrideSection(req, "body", parsed.body);
    if (parsed.query) overrideSection(req, "query", parsed.query);
    if (parsed.params) overrideSection(req, "params", parsed.params);

    next();
  } catch (error) {
    next(error);
  }
};
