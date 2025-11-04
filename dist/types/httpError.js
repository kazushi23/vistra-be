export class HttpError extends Error {
    status;
    // for throw error with status code, since new Error() will default to status 500
    constructor(message, status = 400, options) {
        super(message, options); // pass options to base Error
        this.status = status;
    }
}
//# sourceMappingURL=httpError.js.map