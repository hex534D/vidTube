// express async handler

const asyncHandler = (handler: any) => {
  return (req: any, res: any, next: any) => {
    Promise.resolve(handler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };
