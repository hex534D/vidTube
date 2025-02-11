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

export { IUser };
