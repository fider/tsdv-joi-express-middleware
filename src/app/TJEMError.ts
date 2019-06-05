
export class HttpError extends Error {

    // `status` is recognized by default Express error handler and use as response code.
    public status: number;

    constructor(message: string, status: number) {
        super(message);
        this.status = status;
    }
}