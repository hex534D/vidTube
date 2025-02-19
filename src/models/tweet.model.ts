import mongoose, { Model, Schema } from 'mongoose';
import { ITweet } from '../utils/interfaces';

interface TweetMethods {}

type TweetModel = Model<ITweet, {}, TweetMethods>;

const tweetSchema = new Schema<ITweet, TweetModel, TweetMethods>(
  {
    content: {
      type: String,
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

export const Tweet = mongoose.model<ITweet, TweetModel>('Tweet', tweetSchema);
