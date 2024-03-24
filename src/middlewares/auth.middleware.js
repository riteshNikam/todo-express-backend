import { asyncHandler } from "../utils/asyncHandler.util.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

const verifyUser = async (req, res, next) => {
    try {
        const inRefreshToken = req.cookies?.refreshToken;
        const decodedToken = jwt.decode(inRefreshToken)
        // get user
        const user = await User.findById(decodedToken._id)
        req.user = user
        next()
    } catch (error) {
        console.log(error.message);
        next()
    }
}

export { verifyUser }