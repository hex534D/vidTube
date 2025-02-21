import mongoose, { Types } from 'mongoose';

// checks if given id is valid mongo objectId or not
// TODO update the logic to handle invalid strings which has length 12
export const isValidMongoObjectId = (id: Types.ObjectId) =>
  mongoose.Types.ObjectId.isValid(id) ? true : false;


