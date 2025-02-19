import mongoose, { Schema, Model } from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
import { IComment } from '../utils/interfaces';

interface ICommentsMethods { }

type CommentModel = Model<IComment, {}, ICommentsMethods>;

const commentSchema = new Schema<IComment, CommentModel, ICommentsMethods>(
  {
    content: {
      type: String,
      required: true,
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: 'Video',
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

commentSchema.plugin(mongooseAggregatePaginate);

export const Comment = mongoose.model<IComment, CommentModel>('Comment', commentSchema);
