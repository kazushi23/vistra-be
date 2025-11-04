import type { Response } from "express";

class RequestHandler { // utility function for error and success response
  constructor() {}
  // success helper standardised
  static sendSuccess<T = unknown, G = Record<string, unknown>>(res: Response, message = "Success result", count = 0, status = 200) {
    return (data?: T, globalData?: G) => {
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
  static sendError(res: Response, message = "An error occurred", status = 500, details?: unknown) {
      res.status(status).json({
        type: "Error",
        message,
        ...(details ? { details } : {}),
      });
  }
}


export default RequestHandler;