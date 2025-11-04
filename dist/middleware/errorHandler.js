import RequestHandler from '../utils/RequestHandler.js';
export const errorHandler = (err, req, res, next) => {
    // return response when error through next() in controller
    // default to status 500 and internal server error message
    return RequestHandler.sendError(res, err.message || 'Internal Server Error', err.status || 500);
};
//# sourceMappingURL=errorHandler.js.map