import { Router } from "express";
import { 
    registerUser, 
    loginUser, 
    logoutUser, 
    refreshAccessToken, 
    changePassword, 
    updateUser, 
    getCurrentUser, 
    getAllUsers,
    getUser,
    deleteUser
} from "../controllers/user.controller.js";
import { verifyUser } from "../middlewares/auth.middleware.js";

const userRouter = Router()

userRouter.route('/register-user').post(
    registerUser
)

userRouter.route('/login-user').post(
    loginUser
)

userRouter.route('/get-all-users').get(
    getAllUsers
)

userRouter.route('/get-user/:userName').get(
    getUser
)

// secure routes 

userRouter.route('/logout-user').post(
    verifyUser,
    logoutUser
)

userRouter.route('/refresh-access-token').post(
    verifyUser,
    refreshAccessToken
)

userRouter.route('/change-password').patch(
    verifyUser,
    changePassword
)

userRouter.route('/update-user').patch(
    verifyUser,
    updateUser
)

userRouter.route('/get-current-user').get(
    verifyUser,
    getCurrentUser
)

userRouter.route('/delete-user').delete(
    verifyUser,
    deleteUser
)

export { userRouter }