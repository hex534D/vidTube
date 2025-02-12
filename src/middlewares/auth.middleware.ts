import jwt from 'jsonwebtoken';

import { createError } from '../utils/custom-error';
import { REFRESH_TOKEN_SECRET } from '../constants';
import { asyncHandler } from '../utils/asyncHandler';
import { User } from '../models/user.model';
import logger from '../logging/logger';

const verifyJWT = asyncHandler(async (req: any, _: any, next: any) => {
  const token =
    req.cookies.accessToken ||
    req.headers('Authorization')?.replace('Bearer ', '');

  if (!token) createError('Unauthorized', 401);

  try {
    const decodedToken = jwt.verify(token, REFRESH_TOKEN_SECRET) as any;

    const user = await User.findById(decodedToken?._id).select(
      '-password -refreshToken'
    );

    if (!user) createError('Unauthorized', 401);

    req.user = user;

    next();
  } catch (error: any) {
    logger.error(error);
    createError(error?.message || 'Unauthorized', 401);
  }
});

export { verifyJWT };
