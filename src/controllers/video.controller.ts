import { Video } from '../models/video.model'
import { success } from '../utils/response-handler';
import { createError } from '../utils/custom-error';
import { asyncHandler } from '../utils/asyncHandler';
import { isValidMongoObjectId } from '../utils/util';

const getAllVideos = asyncHandler(async (req: any, res: any) => {
  const videos = await Video.find({}).sort({ createdAt: 1 });
  // TODO Pagination implementation in TS

  res.status(200).json(success(200, 'videos fetch successful', videos));
});

const publishAVideo = asyncHandler(async (req: any, res: any) => {});

const getVideoById = asyncHandler(async (req: any, res: any) => {
  const { videoId } = req.params;

  if (!isValidMongoObjectId(videoId)) createError('Invalid videoId.', 400);

  const video = await Video.findById({ _id: videoId });

  res.status(200).json(success(200, 'Video is fetched successfully', video));
});

const updateVideo = asyncHandler(async (req: any, res: any) => {
  const { videoId } = req.params;
  const { title, description, thumbnail } = req.body;

  if (!isValidMongoObjectId(videoId)) createError('Invalid videoId.', 400);

  const video = await Video.updateOne(
    { _id: videoId },
    {
      $set: {
        title,
        thumbnail,
        description,
      },
    },
    { new: true }
  );

  res.status(200).json(success(200, 'Video updated successfully', video));
});

const deleteVideo = asyncHandler(async (req: any, res: any) => {
  const { videoId } = req.params;

  if (!isValidMongoObjectId(videoId)) createError('Invalid videoId.', 400);

  const video = await Video.deleteOne({ _id: videoId });

  if (video?.deletedCount)
    return res.status(200).json(success(200, 'Video has been deleted', {}));
  else
    return res
      .status(400)
      .json(success(400, 'No video has been found with that id.', {}));
});

const togglePublishStatus = asyncHandler(async (req: any, res: any) => {
  const { videoId } = req.params;

  if (!isValidMongoObjectId(videoId)) createError('Invalid videoId.', 400);

  const video = await Video.updateOne(
    { _id: videoId },
    {
      $set: {
        isPublished: true,
      },
    },
    {
      new: true,
    }
  );

  res.status(200).json(success(200, 'Video published successfully', video));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
