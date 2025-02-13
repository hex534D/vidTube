import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose, { Model, Schema } from 'mongoose';

import { IUser } from '../utils/interfaces';
import { JWT_SECRET, REFRESH_TOKEN_SECRET } from '../constants';

interface IUserMethods {
  comparePassword(password: string): boolean;
  generateAccessToken(): string;
  generateRefreshToken(): string
}

type UserModel = Model<IUser, {}, IUserMethods>;


const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    username: {
      type: String,
      required: [true, 'Username is required.'],
      index: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      index: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full Name is required.'],
      trim: true,
    },
    avatar: {
      type: String,
      required: [true, 'Avatar is required.'],
    },
    coverImage: {
      type: String,
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Video',
      },
    ],
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 10);

  next();
});

userSchema.method('comparePassword', async function (password: string) {
  return await bcrypt.compare(password, this.password);
});

userSchema.method('generateAccessToken', function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      fullName: this.fullName,
      username: this.username,
    },
    JWT_SECRET,
    { expiresIn: '1d' }
  );
});

userSchema.method('generateRefreshToken', function () {
  return jwt.sign({
    _id: this._id
  }, REFRESH_TOKEN_SECRET, { expiresIn: '1d' })
});

export const User = mongoose.model<IUser, UserModel>('User', userSchema);
