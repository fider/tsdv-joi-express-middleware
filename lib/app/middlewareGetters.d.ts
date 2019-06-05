import express = require('express');
declare type ValidationOptions = {
    allowMissingParamGroup: boolean;
};
/**
 * Returns Restify/Express validation middleware
 *
 * @param contentType  {string}  Expected content-type header.
 * @param [error]  {Error}  Instance of error to be passed to `next` in case if validation failed.
 */
export declare function validateContentType(contentType?: string, error?: Error): (req: express.Request, _res: express.Response, next: express.NextFunction) => void;
/**
 * Returns Restify/Express validation middleware for json body parameters
 *
 * @param clazz {constructor}  Class instance to be validated and assigned to `req.body`. Need to be decorated by constraints decorators.
 */
export declare function validateBody<T>(clazz: new () => T): (req: express.Request, _res: express.Response, next: express.NextFunction) => void;
/**
 * Returns Restify/Express validation middleware for url query parameters
 *
 * @param clazz {constructor}  Class instance to be validated and assigned to `req.query`. Need to be decorated by constraints decorators.
 */
export declare function validateQuery<T>(clazz: new () => T): (req: express.Request, _res: express.Response, next: express.NextFunction) => void;
export declare function validate<T>(paramGroup: "body" | "query" | string, clazz: new () => T, contentType?: string, options?: Partial<ValidationOptions>): (req: express.Request, _res: express.Response, next: express.NextFunction) => void;
export {};
