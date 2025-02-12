import jwt from 'jsonwebtoken';

import logger from '../logging/logger';
import { User } from '../models/user.model';
import { createError } from '../utils/custom-error';
import { asyncHandler } from '../utils/asyncHandler';
import { error, success } from '../utils/response-handler';
import { deleteFromCloudinary, uploadToCloudinary } from '../utils/cloudinary';
import { REFRESH_TOKEN_SECRET, options } from '../constants';

const generateAccessAndRefreshToken = async (userId: string) => {
  try {
    const user = await User.findById({ _id: userId });

    if (!user) return createError('No user found to create a token', 400);

    const accessToken = await user?.generateAccessToken();
    const refreshToken = await user?.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    logger.error(error);
    createError('Error in generating access and refresh token', 400);
  }
};

const registerUser = asyncHandler(async (req: any, res: any, next: any) => {
  let avatar, coverImage, user;
  const { fullName, email, username, password } = req.body;

  // TODO add proper validation
  if (!(fullName && email && username && password))
    next(createError('All fields are required', 400));

  const existingUser = await User.findOne({ $or: [{ username }, { email }] });

  if (existingUser) {
    next(createError('User with email or username already exists.', 400));
  }

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) next(createError('Avatar file is missing.', 400));

  avatar = await uploadToCloudinary(avatarLocalPath);
  if (coverImageLocalPath)
    coverImage = await uploadToCloudinary(coverImageLocalPath);
  try {
    user = await User.create({
      fullName,
      username,
      email,
      password,
      coverImage: coverImage?.url || '',
      avatar: avatar?.url,
    });

    const createdUser = await User.findById({ _id: user?._id }).select(
      '-password'
    );

    if (createdUser)
      return res
        .status(201)
        .json(success(201, 'User created successfully', createdUser));
    else next(createError('Error in creating user'));
  } catch (error) {
    if (avatar) await deleteFromCloudinary(avatar.public_id);
    if (coverImage) await deleteFromCloudinary(coverImage.public_id);
    logger.error(error);

    next(
      createError(
        'Something went wrong while creating user, Images are removed from Cloudinary.',
        400
      )
    );
  }
});

const loginUser = asyncHandler(async (req: any, res: any) => {
  const { email, username, password } = req.body;

  if (!email && !username && !password)
    createError('All fields are required', 400);

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) return createError('User not found!', 404);

  // validate password
  const isUserValid = await user.comparePassword(password);

  if (!isUserValid) createError('Invalid credentials', 404);

  const { accessToken, refreshToken } = (await generateAccessAndRefreshToken(
    user._id.toString()
  )) as any;

  const loggedInUser = await User.findById(user?._id).select(
    '-password-refreshToken'
  );

  return res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .json(
      success(200, 'User Logged in successfully', {
        user: loggedInUser,
        accessToken,
        refreshToken,
      })
    );
});

const logoutUser = asyncHandler(async (req: any, res: any) => {
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json(success(200, 'User logged out successfully', {}));
});

const refreshAccessToken = asyncHandler(async (req: any, res: any) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) createError('Refresh Token is required!', 401);

  try {
    const decodedToken = (await jwt.verify(
      incomingRefreshToken,
      REFRESH_TOKEN_SECRET
    )) as any;

    const user = await User.findById(decodedToken?._id);

    if (!user) return createError('Invalid refresh token', 401);

    if (incomingRefreshToken !== user?.refreshToken)
      createError('Invalid refresh token', 401);

    const { accessToken, refreshToken: newRefreshToken } =
      (await generateAccessAndRefreshToken(user._id.toString())) as any;

    return res
      .status(200)
      .cookie('accessToken', accessToken, options)
      .cookie('refreshToken', newRefreshToken, options)
      .json(
        success(200, 'Access Token refreshed successfully.', {
          accessToken,
          refreshToken: newRefreshToken,
        })
      );
  } catch (error) {
    logger.error(error);
    createError('Something went wrong while refreshing access token');
  }
});

export { registerUser, loginUser, logoutUser, refreshAccessToken };
