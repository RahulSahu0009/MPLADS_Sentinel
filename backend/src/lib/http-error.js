export const createHttpError = (status, message, options = {}) => {
  const error = new Error(message);
  error.status = status;
  if (options.issues) {
    error.issues = options.issues;
  }
  if (options.code) {
    error.code = options.code;
  }
  return error;
};

export const isHttpError = (error) => Boolean(error && typeof error === 'object' && Number.isInteger(error.status));
