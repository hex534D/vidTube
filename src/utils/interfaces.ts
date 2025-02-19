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
  videoFile: string,
  thumbnail: string,
  title: string,
  description: string,
  duration: string,
  views: number,
  isPublished: boolean,
  owner: string
}

interface ISubscription {
  subscriber: string,
  channel: string
}

interface ILike {
  video: string,
  comment: string,
  tweet: string,
  likedBy: string
}

interface IComment {
  video: string,
  owner: string,
  content: string
}

interface IPlaylist {
  owner: string,
  videos: string,
  name: string,
  description: string
}

interface ITweet {
  owner: string,
  content: string
}

export { IUser, IVideo, IComment, ILike, IPlaylist, ISubscription, ITweet };
