import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const userSchema = new Schema(
    {
        userName: {
            type: String,
            required: true,
            lowercase: true,
            unique: true
        },
        fullName: {
            type: String,
            required: true
        }, 
        email: {
            type: String,
            lowercase: true,
            unique: true,
            required: true
        }, 
        password: {
            type: String,
            required: true
        },
        refreshToken: {
            type: String
        }
    }, 
    {
        timestamps: true
    }
)

userSchema.pre('save', async function (next) {

    if (!this.isModified("password")) {
        return next()
    }

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        {
            _id : this._id
        },
        process.env.ACCESS_KEY,
        {
            expiresIn : process.env.ACCESS_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        {
            _id : this._id
        },
        process.env.REFRESH_KEY,
        {
            expiresIn : process.env.REFRESH_EXPIRY
        }
    )
}

userSchema.methods.validatePassword = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.plugin(mongooseAggregatePaginate)

export const User = mongoose.model("User", userSchema);