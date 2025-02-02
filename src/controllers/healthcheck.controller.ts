import { asyncHandler } from '../utils/asyncHandler';
import { success } from '../utils/response-handler';

const healthCheck = asyncHandler(async (req: any, res: any) => {
  res.status(200).json(success(200, 'OK', 'Health Check Passed!!'));
});

export { healthCheck };
