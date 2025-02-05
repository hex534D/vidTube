import { User } from '../models/user.model';
import { error, success } from '../utils/response-handler';
import { asyncHandler } from '../utils/asyncHandler';
import { deleteFromCloudinary, uploadToCloudinary } from '../utils/cloudinary';
import CustomError from '../utils/custom-error';
import logger from '../logging/logger';

const registerUser = asyncHandler(async (req: any, res: any, next: any) => {
  const { fullName, email, username, password } = req.body;

  // TODO add proper validation
  if (![fullName, email, username, password].every(val => val?.trim() == ''))
    throw new CustomError('All fields are required', 400);

  const existingUser = await User.findOne({ $or: [{ username }, { email }] });

  if (existingUser) {
    throw new CustomError('User with email or username already exists.', 400);
  }

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) next(new Error('Avatar file is missing.'));
  let avatar, coverImage, user;
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

    const createdUser = await User.findById({ email: user?.email });

    if (createdUser)
      res.status(201).json(success(201, 'User created successfully', user));
    else throw new Error('Error in creating user');
  } catch (error) {
    if (avatar) await deleteFromCloudinary(avatar.public_id);
    if (coverImage) await deleteFromCloudinary(coverImage.public_id);
    logger.error(error);
    logger.error(
      'Something went wrong while creating user, Images are removed from Cloudinary.'
    );

    throw new CustomError(
      'Something went wrong while creating user, Images are removed from Cloudinary.',
      400
    );
  }
});

export { registerUser };
