import { ApiError } from "../utils/apiError.util.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/apiResponse.util.js";
import jwt from "jsonwebtoken";

const cookieOption = {
    httpOnly : true,
    secure : true
}

const registerUser = asyncHandler(
    async (req, res) => {

        const { userName, fullName, email, password } = req.body

        if (
            [ userName, fullName, email, password ].some(item => item?.trim() === '')
        ) {
            throw new ApiError(400, "All fields are mandatory.")
        }

        const existedUser = await User.findOne(
            {
                $or : [
                    { userName },
                    { email }
                ]
            }
        )

        console.log(existedUser);

        if (existedUser) {
            throw new ApiError(400, "user already exists")
        }

        const user = await User.create(
            {
                userName,
                email,
                fullName,
                password
            }
        )

        const checkUser = await User.findOne(
            {
                userName: userName
            }
        ).select("-password")

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                checkUser,
                "User registered successfully."
            )
        )
    }
)

const loginUser = asyncHandler(
    async (req, res) => {

        const { userName, email, password } = req.body

        // at least one of userName and email is required 

        if (!(userName || email)) {
            throw new ApiError(400, "userName or email is required.")
        }

        if (!password) {
            throw new ApiError(400, "password is mandatory.")
        }

        // get user

        const user = await User.findOne(
            {
                $or : [
                    { userName },
                    { email }
                ]
            }
        )

        // check password
        const isPasswordCorrect = await user.validatePassword(password)

        if (!isPasswordCorrect) {
            throw new ApiError(400, "Password incorrect.")
        }

        // generate access and refresh token

        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        user.save({ validateBeforeSave : false })

        const loggedInUser = await User.findById(
            user._id
        ).select("-password -refreshToken")

        return res
        .status(200)
        .cookie('refreshToken', refreshToken, cookieOption)
        .cookie('accessToken', accessToken, cookieOption)
        .json(
            new ApiResponse(
                200,
                loggedInUser,
                "user logged in."
            )
        )
    }
)

const logoutUser = asyncHandler(
    async (req, res) => {

        // get user

        const user = await User.findByIdAndUpdate(
            req.user?._id,
            {
                $unset : {
                    refreshToken : 1
                }
            }, 
            {
                new : true
            }
        ).select("-password")
        
        return res
        .status(200)
        .clearCookie('refreshToken')
        .clearCookie('accessToken')
        .json(
            new ApiResponse(
                200,
                user, 
                "user logged out."
            )
        )
    }
)

const refreshAccessToken = asyncHandler(
    async (req, res) => {

        const inRefreshToken = req.user?.refreshToken;

        if (!inRefreshToken) {
            throw new ApiError(400, "refresh token expired or used.")
        }

        const decodedToken = jwt.decode(inRefreshToken)

        const user = await User.findById(decodedToken._id)

        const newAccessToken = user.generateAccessToken()
        const newRefreshToken = user.generateRefreshToken()

        user.refreshToken = newRefreshToken
        user.save({ validateBeforeSave : false })

        const refreshedUser = await User.findById(user._id).select("-password -refreshToken")

        return res
        .status(200)
        .cookie('refreshToken', newRefreshToken, cookieOption)
        .cookie('accessToken', newAccessToken, cookieOption)
        .json(
            new ApiResponse(
                200,
                refreshedUser,
                "user refreshed successfully."
            )
        )
    }
)

const changePassword = asyncHandler(
    async (req, res) => {

        const { oldPassword, newPassword } = req.body
        
        if (!(oldPassword || newPassword)) {
            throw new ApiError(400, "both new and old password is mandatory field.")
        }

        const user = await User.findById(req.user?._id)

        if (!user) {
            throw new ApiError(400, "user not found")
        }

        const isPasswordCorrect = await user.validatePassword(oldPassword)

        if (!isPasswordCorrect) {
            throw new ApiError(400, "password is incorrect")
        }

        user.password = newPassword
        user.save({ validateBeforeSave : false })
        
        const updatedUser = await User.findById(user?._id).select("-password -refreshToken")

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedUser,
                "password changed successfully."
            )
        )
    }
)

const updateUser = asyncHandler(
    async (req, res) => {

        const { userName, fullName, email } = req.body;

        // if all fields are undefined throw error
        if (!(userName || fullName || email)) {
            throw new ApiError(400, "at least one filed be present")
        }

        const updateFields = {};
        if (fullName !== undefined) {
            updateFields.fullName = fullName;
        }
        if (email !== undefined) {
            updateFields.email = email;
        }
        if (userName !== undefined) {
            updateFields.userName = userName;
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user?._id,
            { $set: updateFields },
            { new: true }
        ).select("-password -refreshToken");

        return res
        .status(200)
        .json(
            new ApiResponse(
                200, 
                updatedUser,
                "user updated successfully."
            )
        )
    }
)

const getCurrentUser = asyncHandler(
    async (req, res) => {

        const currentUser = await User.findById(req.user?._id).select("-password -refreshToken")

        if (!currentUser) {
            throw new ApiError(400, 'user not found.')
        }

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                currentUser,
                "current user fetched successfully."
            )
        )
    }
)

const getAllUsers = asyncHandler(
    async (req, res) => {

        const users = await User.find().select("-password -refreshToken")

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                users,
                "fectched all users successfully."
            )
        )
    }
)

const deleteUser = asyncHandler(
    async (req, res) => {

        if (!req.user) {
            throw new ApiError(400, "user not logged in.")
        }

        const deletedUser = await User.findByIdAndDelete(
            req.user?._id
        ).select("-password -refreshToken")

        if (!deleteUser) {
            throw new ApiError(400, "user not found")
        }
        
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                deletedUser,
                "user deleted successfully."
            )
        )
    }
)

const getUser = asyncHandler(
    async (req, res) => {

        const { userName } = req.params

        const user = await User.findOne(
            {
                userName : userName
            }
        ).select("-password -refreshToken")

        if (!user) {
            throw new ApiError(400, "user not found")
        }

        return res
        .status(200)
        .json(
            new ApiResponse(
                200, 
                user,
                "user fetched successfully."
            )
        )
    }
)

export { 
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
}