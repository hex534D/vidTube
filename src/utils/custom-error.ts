class CustomError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
  }
}

const createError = (message: string, status = 500) => {
  console.log(message);
  
  throw new CustomError(message, status);
}

export { CustomError, createError }