/**
 * API Success response type
 *
 * @param {number} statusCode
 * @param {string} message
 * @param {*} data
 * @returns {{ code: number; message: string; data: any; }}
 */
const success = (statusCode: number, message: string, data: any) => {
  return {
    code: statusCode,
    message,
    data,
  };
};

/**
 * API Error response type
 *
 * @param {number} statusCode
 * @param {string} message
 * @param {*} error
 * @returns {{ code: number; message: string; error: any; }}
 */
const error = (statusCode: number, message: string, error: any) => {
  if (!statusCode) statusCode = 500;

  return {
    code: statusCode,
    message,
    error,
  };
};

export { success, error };
