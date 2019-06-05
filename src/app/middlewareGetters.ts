import { Validator, ValidationError } from 'tsdv-joi';
import express = require('express');
import { inspect } from 'util';
import { NextFunction, Request, Response } from 'express';
import { HttpError } from './TJEMError';


type ValidationOptions = {
    allowMissingParamGroup: boolean
}

const optionsDefaults: ValidationOptions = {
    allowMissingParamGroup: true
}



/**
 * Returns Restify/Express validation middleware
 *
 * @param contentType  {string}  Expected content-type header.
 * @param [error]  {Error}  Instance of error to be passed to `next` in case if validation failed.
 */
export function validateContentType(contentType: string = "application/json", error?: Error) {

    return (req: Request, _res: Response, next: NextFunction) => {

        if ( ! req.is(contentType.toLowerCase())) {

            let err =  error
                ? error
                : new HttpError(`Invalid header content-type="${req.header("content-type")}". Expected: "${contentType}"`, 400);

            return next(err);
        }

        return next();
    }

}



/**
 * Returns Restify/Express validation middleware for json body parameters
 *
 * @param clazz {constructor}  Class instance to be validated and assigned to `req.body`. Need to be decorated by constraints decorators.
 */
export function validateBody<T>(clazz: new () => T) {

    return validate("body", clazz, "application/json", {allowMissingParamGroup: false});

}



/**
 * Returns Restify/Express validation middleware for url query parameters
 *
 * @param clazz {constructor}  Class instance to be validated and assigned to `req.query`. Need to be decorated by constraints decorators.
 */
export function validateQuery<T>(clazz: new () => T) {

    return validate("query", clazz, "", {allowMissingParamGroup: true});

}



export function validate<T>(paramGroup: "body" | "query" | string, clazz: new () => T, contentType = "", options: Partial<ValidationOptions> = {}) {

    const fullOptions = Object.assign(options, optionsDefaults) as ValidationOptions;

    return (req: express.Request, _res: express.Response, next: express.NextFunction) => {

        // optional validation
        if (contentType  &&  !req.is(contentType)) {
            return next(new HttpError(`Invalid header content-type="${req.header("content-type")}". Expected "${contentType}"`, 400));
        }

        let data = (<any>req)[paramGroup];

        if (fullOptions.allowMissingParamGroup) {
            data = data || {}
        }

        if ( ! data) {
            return next(new HttpError(`Request ${paramGroup} - missing ${paramGroup}.`, 400));
        }

        let object = new clazz();
        try {
            Object.assign(object, data);
        }
        catch (err) {
            return next(new HttpError(`Failed to assign data="${inspect(data)}" to its model "${clazz.name}"`, 400));
        }

        const validator = new Validator();
        var result = validator.validate(object, {allowUnknown: false, abortEarly: false});

        let err = result.error;
        if (err) {
            console.log(`\n\nERROR   (${ValidationError.toString()})    ${err}\n\n`);
            if (err instanceof ValidationError) {
                // 400
                return next(new HttpError(`Validation of request ${paramGroup}. ${err}`, 400));
            }
            else {
                // 500
                return next(new HttpError(`ERROR: [tsdv-joi-express-middleware] > tsdv-joi library returned unknown error during validation of requrest ${paramGroup}.` +
                    `Details: ${err}`, 500))
            }
        }

        (<any>req)[paramGroup] = result.value;
        next();
    }
}
