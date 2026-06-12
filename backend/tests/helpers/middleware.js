async function runMiddleware(middleware, options = {}) {
  const rawHeaders = options.headers || {};
  const headers = Object.keys(rawHeaders).reduce(function(acc, key) {
    acc[key.toLowerCase()] = rawHeaders[key];
    return acc;
  }, {});

  const req = {
    body: options.body || {},
    params: options.params || {},
    query: options.query || {},
    headers: headers,
  };

  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };

  const next = jest.fn();

  await middleware(req, res, next);

  return { req, res, next };
}

module.exports = { runMiddleware };
