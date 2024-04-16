class ApiError extends Error {
  constructor(
    statuscode,
    message = "Something went wrong",
    stack = "",
    errors = []
  ) {
    super(message);
    this.message = message;
    this.statuscode = statuscode;
    this.errors = errors;
    this.data = null;
    this.success = false;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
