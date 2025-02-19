import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

import logger from '../logging/logger';
import { User } from '../models/user.model';
import { createError } from '../utils/custom-error';
import { success } from '../utils/response-handler';
import { asyncHandler } from '../utils/asyncHandler';
import { REFRESH_TOKEN_SECRET, options } from '../constants';
import { deleteFromCloudinary, uploadToCloudinary } from '../utils/cloudinary';

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

const changeCurrentPassword = asyncHandler(async (req: any, res: any) => {
  const { oldPassword, newPassword } = req.body;

  const user = (await User.findById(req.user?._id)) as any;

  const isPasswordValid = user?.comparePassword(oldPassword);

  if (!isPasswordValid) createError('Old password is Invalid!', 401);

  user.password = newPassword;

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(success(200, 'Password changed successfully', {}));
});

const getCurrentUser = asyncHandler(async (req: any, res: any) => {
  return res
    .status(200)
    .json(success(200, 'Current user details', { user: req.user }));
});

const updateAccountDetails = asyncHandler(async (req: any, res: any) => {
  const { fullName, email } = req.body;

  if (!fullName || !email) createError('Fullname or email are required', 400);

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email,
      },
    },
    { new: true }
  ).select('-password -refreshToken');

  return res.status(200).json(success(200, 'Updated user details', { user }));
});

const updateUserAvatar = asyncHandler(async (req: any, res: any) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) createError('Avatar image is required');

  const avatar = await uploadToCloudinary(avatarLocalPath);

  if (!avatar?.url) createError('Error in uploading avatar file');

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar?.url,
      },
    },
    { new: true }
  ).select('-password -refreshToken');

  res.status(200).json(success(200, 'Avatar upload successful', { user }));
});

const updateUserCoverImage = asyncHandler(async (req: any, res: any) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) createError('Cover image is required', 400);

  const coverImage = await uploadToCloudinary(coverImageLocalPath);

  if (!coverImage?.url) createError('Error in uploading the cover Image');

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage?.url,
      },
    },
    { new: true }
  ).select('-password --refreshToken');

  res
    .status(200)
    .json(success(200, 'Cover image uploaded successfully', { user }));
});

const getUserChannelProfile = asyncHandler(async (req: any, res: any) => {
  const { username } = req.params;

  if (!username.trim()) createError('Username is required', 400);

  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: 'subscriptions',
        localField: '_id',
        foreignField: 'channel',
        as: 'subscribers',
      },
    },
    {
      $lookup: {
        from: 'subscriptions',
        localField: '_id',
        foreignField: 'subscriber',
        as: 'subscribedTo',
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: '$subscribers',
        },
        channelsSubscribedToCount: {
          $size: '$subscribedTo',
        },
        isSubscribed: {
          $cond: {
            if: {
              $in: [req.user?._id, '$subscribers.subscribe'],
            },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        avatar: 1,
        email: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        coverImage: 1,
      },
    },
  ]);

  if (!channel.length) createError('Channel not found', 404);

  res
    .status(200)
    .json(success(200, 'Channel data fetch successful', channel[0]));
});

const getWatchHistory = asyncHandler(async (req: any, res: any) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(`${req.user?.id}`)
      }
    },
    {
      $lookup: {
        from: 'videos',
        localField: 'watchHistory',
        foreignField: '_id',
        as: 'watchHistory',
        pipeline: [
          {
            $lookup: {
              from: 'users',
              localField: 'owner',
              foreignField: '_id',
              as: 'owner',
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1
                  }
                },
                {
                  $addFields: {
                    owner: {
                      $first: '$owner'
                    }
                  }
                }
              ]
            }
          }
        ]
      }
    }
  ]);

  if (!user.length) createError('User not found', 400);


  return res.status(200).json(success(200, 'Watch history fetched successfully', user[0]?.watchHistory))
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory
};
