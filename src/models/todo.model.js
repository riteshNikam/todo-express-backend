import mongoose from "mongoose";

const todoSchema = new mongoose.Schema(
    {
        todoContent : {
            type : String,
            required : true
        }, 
        user : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User"
        },
        done : {
            type : Boolean,
            default : false
        }
    },
    {
        timestamps : true
    }
)

export const Todo = mongoose.model("Todo", todoSchema)