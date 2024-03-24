import { Router } from "express";
import {
    addTodo,
    getTodos,
    getTodo,
    updateTodo,
    deleteTodo
} from "../controllers/todo.controller.js"
import { verifyUser } from "../middlewares/auth.middleware.js"

const todoRouter = Router()

todoRouter.route('/get-todo/:todoID').get(
    getTodo
)

todoRouter.use(verifyUser)

todoRouter.route('/add-todo').post(
    addTodo
)

todoRouter.route('/get-all-todos').get(
    getTodos
)

todoRouter.route('/update-todo/:todoID').patch(
    updateTodo
)

todoRouter.route('/delete-todo/:todoID').delete(
    deleteTodo
)

export { todoRouter }