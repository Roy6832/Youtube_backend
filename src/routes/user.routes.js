import { Router } from "express";
import { RefreshAccessToken, loginUser, logout, requestUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../controllers/auth.middleware.js";

const router=Router()

router.route("/register").post(upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'coverImage', maxCount: 1 }]),requestUser)

router.route('/login').post(loginUser)
router.route('/logout').post(verifyJWT,logout)
router.route('/refresh-token').post(RefreshAccessToken)


export default router