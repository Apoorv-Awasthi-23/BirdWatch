class ApiError extends Error{
    constructor(
        statuscode,
        message = "Something went wrong",
        stack = "",
        errors=[]
    ) {
        super(message)
        this.message=message
        this.statuscode = statuscode
        this.errors = errors
        this.data = data
        this.success = false
        ;

        if (stack)
        {
            this.stack=stack
        }
        else
        {
            Error.captureStackTrace(this, this.constructor);    
        }
    }
}

export { ApiError };