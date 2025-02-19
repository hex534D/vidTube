import { Types } from "mongoose";

interface IUser {
  username: string;
  email: string;
  fullName: string;
  avatar: string;
  coverImage?: string;
  watchHistory?: string[];
  password: string;
  refreshToken?: string;
}

interface IVideo {
  videoFile: string;
  thumbnail: string;
  title: string;
  description: string;
  duration: number;
  views: number;
  isPublished: boolean;
  owner: Types.ObjectId;
}

interface ISubscription {
  subscriber: Types.ObjectId;
  channel: Types.ObjectId;
}

interface ILike {
  video: Types.ObjectId;
  comment: Types.ObjectId;
  tweet: Types.ObjectId;
  likedBy: Types.ObjectId;
}

interface IComment {
  video: Types.ObjectId;
  owner: Types.ObjectId;
  content: string;
}

interface IPlaylist {
  owner: Types.ObjectId;
  videos: Types.ObjectId[];
  name: string;
  description: string;
}

interface ITweet {
  owner: Types.ObjectId;
  content: string;
}

export { IUser, IVideo, IComment, ILike, IPlaylist, ISubscription, ITweet };
