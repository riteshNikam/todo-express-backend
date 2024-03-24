import mongoose from "mongoose";

const connectDB = async () => {
    await mongoose.connect(`${process.env.MONGO_CONNECTION_STRING}/${process.env.MONGO_DATABASE_NAME}`)
}

export { connectDB }