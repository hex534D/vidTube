import { Router } from 'express';

import { upload } from '../middlewares/multer.middleware';
import { verifyJWT } from '../middlewares/auth.middleware';
import {
  changeCurrentPassword,
  getCurrentUser,
  getUserChannelProfile,
  getWatchHistory,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
} from '../controllers/user.controller';

const router = Router();

// unsecured routes
router.route('/login').post(loginUser);
router.route('/refresh-token').post(refreshAccessToken);

router.route('/register').post(
  upload.fields([
    {
      name: 'avatar',
      maxCount: 1,
    },
    {
      name: 'coverImage',
      maxCount: 1,
    },
  ]),
  registerUser
);

// secured routes
router.route('/logout').post(verifyJWT, logoutUser);
router.route('/history').get(verifyJWT, getWatchHistory);
router.route('/current-user').get(verifyJWT, getCurrentUser);
router.route('/c/:username').get(verifyJWT, getUserChannelProfile);
router.route('/update-account').patch(verifyJWT, updateAccountDetails);
router.route('/change-password').post(verifyJWT, changeCurrentPassword);
router.route('/avatar').patch(verifyJWT, upload.single('avatar'), updateUserAvatar);
router.route('/cover-image').patch(verifyJWT, upload.single('coverImage'), updateUserCoverImage);

export default router;
