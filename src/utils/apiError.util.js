class ApiError {
    constructor (
        statusCode,
        message = 'SOMETHING WENT WRONG',
        success = false
    ) {
        this.message = message,
        this.statusCode = statusCode,
        this.success = success
    }
}

export { ApiError }