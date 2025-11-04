export class HttpError extends Error {
  status: number;
  // for throw error with status code, since new Error() will default to status 500
  constructor(message: string, status = 400, options?: ErrorOptions) {
    super(message, options); // pass options to base Error
    this.status = status;
  }
}
