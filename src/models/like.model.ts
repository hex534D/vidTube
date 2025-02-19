import mongoose, { Schema, Model } from 'mongoose';
import { ILike } from '../utils/interfaces';

interface LikesMethods { }

type LikeModel = Model<ILike, {}, LikesMethods>;

const likesSchema = new Schema<ILike, LikeModel, LikesMethods>(
  {
    video: {
      type: Schema.Types.ObjectId,
      ref: 'Video',
    },
    comment: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
    },
    tweet: {
      type: Schema.Types.ObjectId,
      ref: 'Tweet',
    },
    likedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

export const Like = mongoose.model<ILike, LikesMethods>('Like', likesSchema);
