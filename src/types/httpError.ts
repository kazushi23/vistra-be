export class HttpError extends Error {
  status: number;

  constructor(message: string, status = 400, options?: ErrorOptions) {
    super(message, options); // pass options to base Error
    this.status = status;
  }
}
