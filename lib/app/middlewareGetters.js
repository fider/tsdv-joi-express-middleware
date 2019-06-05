"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tsdv_joi_1 = require("tsdv-joi");
const util_1 = require("util");
const TJEMError_1 = require("./TJEMError");
const optionsDefaults = {
    allowMissingParamGroup: true
};
/**
 * Returns Restify/Express validation middleware
 *
 * @param contentType  {string}  Expected content-type header.
 * @param [error]  {Error}  Instance of error to be passed to `next` in case if validation failed.
 */
function validateContentType(contentType = "application/json", error) {
    return (req, _res, next) => {
        if (!req.is(contentType.toLowerCase())) {
            let err = error
                ? error
                : new TJEMError_1.HttpError(`Invalid header content-type="${req.header("content-type")}". Expected: "${contentType}"`, 400);
            return next(err);
        }
        return next();
    };
}
exports.validateContentType = validateContentType;
/**
 * Returns Restify/Express validation middleware for json body parameters
 *
 * @param clazz {constructor}  Class instance to be validated and assigned to `req.body`. Need to be decorated by constraints decorators.
 */
function validateBody(clazz) {
    return validate("body", clazz, "application/json", { allowMissingParamGroup: false });
}
exports.validateBody = validateBody;
/**
 * Returns Restify/Express validation middleware for url query parameters
 *
 * @param clazz {constructor}  Class instance to be validated and assigned to `req.query`. Need to be decorated by constraints decorators.
 */
function validateQuery(clazz) {
    return validate("query", clazz, "", { allowMissingParamGroup: true });
}
exports.validateQuery = validateQuery;
function validate(paramGroup, clazz, contentType = "", options = {}) {
    const fullOptions = Object.assign(options, optionsDefaults);
    return (req, _res, next) => {
        // optional validation
        if (contentType && !req.is(contentType)) {
            return next(new TJEMError_1.HttpError(`Invalid header content-type="${req.header("content-type")}". Expected "${contentType}"`, 400));
        }
        let data = req[paramGroup];
        if (fullOptions.allowMissingParamGroup) {
            data = data || {};
        }
        if (!data) {
            return next(new TJEMError_1.HttpError(`Request ${paramGroup} - missing ${paramGroup}.`, 400));
        }
        let object = new clazz();
        try {
            Object.assign(object, data);
        }
        catch (err) {
            return next(new TJEMError_1.HttpError(`Failed to assign data="${util_1.inspect(data)}" to its model "${clazz.name}"`, 400));
        }
        const validator = new tsdv_joi_1.Validator();
        var result = validator.validate(object, { allowUnknown: false, abortEarly: false });
        let err = result.error;
        if (err) {
            console.log(`\n\nERROR   (${tsdv_joi_1.ValidationError.toString()})    ${err}\n\n`);
            if (err instanceof tsdv_joi_1.ValidationError) {
                // 400
                return next(new TJEMError_1.HttpError(`Validation of request ${paramGroup}. ${err}`, 400));
            }
            else {
                // 500
                return next(new TJEMError_1.HttpError(`ERROR: [tsdv-joi-express-middleware] > tsdv-joi library returned unknown error during validation of requrest ${paramGroup}.` +
                    `Details: ${err}`, 500));
            }
        }
        req[paramGroup] = result.value;
        next();
    };
}
exports.validate = validate;
//# sourceMappingURL=middlewareGetters.js.map