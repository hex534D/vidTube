import mongoose, { Model, Schema } from 'mongoose';
import { IPlaylist } from '../utils/interfaces';

interface PlaylistMethods { }

type PlaylistModel = Model<IPlaylist, {}, PlaylistMethods>;

const playlistSchema = new Schema<IPlaylist, PlaylistModel, PlaylistMethods>({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  videos: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Video',
    },
  ],
});

export const Playlist = mongoose.model<IPlaylist, PlaylistModel>('Playlist', playlistSchema);
