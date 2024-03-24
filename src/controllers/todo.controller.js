import { ApiError } from "../utils/apiError.util.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import { Todo } from "../models/todo.model.js";
import { ApiResponse } from "../utils/apiResponse.util.js";
import mongoose from "mongoose";


const addTodo = asyncHandler(
    async (req, res) => {

        const { todoContent } = req.body

        if (!todoContent) {
            throw new ApiError(400, "todo is mandatory.")
        }
        
        const todo = await Todo.create(
            {
                user : req.user?._id,
                todoContent : todoContent
            }
        )

        if (!todo) {
            throw new ApiError(400, 'todo not created.')
        }

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                todo,
                "todo added successfully."
            )
        )
    }
)

const getTodos = asyncHandler(
    async (req, res) => {

        const todos = await Todo.aggregate(
            [
                {
                '$match': {
                    'user': req.user?._id
                }
                }, {
                '$lookup': {
                    'from': 'users', 
                    'localField': 'user', 
                    'foreignField': '_id', 
                    'as': 'user'
                }
                }, {
                '$addFields': {
                    'user': {
                    '$first': '$user'
                    }
                }
                }, {
                '$project': {
                    '_id': 1, 
                    'todoContent': 1, 
                    'userId': '$user._id', 
                    'userName': '$user.userName', 
                    'createdAt': 1, 
                    'updatedAt': 1
                }
                }
            ]
        )

        if (!todos) {
            throw new ApiError(400, 'no todos')
        }

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                todos,
                "all todos fetched"
            )
        )
    }
)

const getTodo = asyncHandler(
    async (req, res) => {

        const { todoID } = req.params

        // const todo = await Todo.findById(todoID)

        const todo = await Todo.aggregate(
            [
                {
                '$match': {
                    '_id': new mongoose.Types.ObjectId(todoID)
                }
                }, {
                '$lookup': {
                    'from': 'users', 
                    'localField': 'user', 
                    'foreignField': '_id', 
                    'as': 'user'
                }
                }, {
                '$addFields': {
                    'user': {
                    '$first': '$user'
                    }
                }
                }, {
                '$project': {
                    '_id': 1, 
                    'todoContent': 1, 
                    'userId': '$user._id', 
                    'userName': '$user.userName', 
                    'createdAt': 1, 
                    'updatedAt': 1
                }
                }
            ]
        )

        if (!todo) {
            throw new ApiError(400, "no such todo.")
        }

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                todo,
                "todo fetched successfully."
            )
        )
    }
)

const updateTodo = asyncHandler(
    async (req, res) => {
        const { todoID } = req.params
        const { todoContent } = req.body

        const todo = await Todo.findById(new mongoose.Types.ObjectId(todoID))

        if (!todo) {
            throw new ApiError(400, "todo not found.")
        }

        if (req.user?._id.toString() !== todo?.user.toString()) {
            throw new ApiError(400, "unauthorised request.")
        }

        if (!todoContent) {
            throw new ApiError(400, "todoContent is mandatory.")
        }

        const updatedTodo = await Todo.findByIdAndUpdate(
            todoID,
            {
                $set : {
                    todoContent : todoContent
                }
            },
            {
                new : true
            }
        )

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedTodo,
                "todo updates successfully."
            )
        )
    }
)

const deleteTodo = asyncHandler(
    async (req, res) => {
        const { todoID } = req.params

        const todo = await Todo.findById(todoID)

        if (!todo) {
            throw new ApiError(400, "no todo.")
        }

        if (req.user?._id.toString() !== todo?.user.toString()) {
            throw new ApiError(400, "unauthorised request.")
        }

        const deletedTodo = await Todo.findByIdAndDelete(todoID)

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                deletedTodo,
                "todo deleted successfully."
            )
        )
    }
)



export { 
    addTodo,
    getTodos,
    getTodo,
    updateTodo,
    deleteTodo
}