import type { Response } from "express";
declare class RequestHandler {
    constructor();
    static sendSuccess<T = unknown, G = Record<string, unknown>>(res: Response, message?: string, count?: number, status?: number): (data?: T, globalData?: G) => void;
    static sendError(res: Response, message?: string, status?: number, details?: unknown): void;
}
export default RequestHandler;
//# sourceMappingURL=RequestHandler.d.ts.map