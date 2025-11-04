class RequestHandler {
    constructor() { }
    // success helper standardised
    static sendSuccess(res, message = "Success result", count = 0, status = 200) {
        return (data, globalData) => {
            res.status(status).json({
                type: "Success",
                message,
                count,
                data,
                ...(globalData ?? {}),
            });
        };
    }
    // error helper standardised
    static sendError(res, message = "An error occurred", status = 500, details) {
        res.status(status).json({
            type: "Error",
            message,
            ...(details ? { details } : {}),
        });
    }
}
export default RequestHandler;
//# sourceMappingURL=RequestHandler.js.map