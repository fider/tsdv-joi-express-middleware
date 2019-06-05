

const deepCopy = require("deepcopy");
import { HttpError } from "../../app/TJEMError";
import { inspect } from "util";
import { validateBody, validate, validateQuery } from "../../app/index";



test(`Test helper`, () => {
    // Required so jest will not complain
});



//--------------------------------------------------------------------------------------
// Spec helper
//
export type TJEMData = Array<{
    isValid: boolean,
    data: any
}>;

/**
 * Jasmine spec creator
 * @param ModelClazz {class}  Validation class decorated with tsdv-joi module.
 * @param specData {TJEMData}  Array of test input data objects and expected results.
 */
export function testTJEM(ModelClazz: new () => {}, specData: TJEMData, reqField: 'body' | 'query' | 'param' | string) {

    // Copy to prevent unwanted external specData update between this method call and test execution.
    const _specData = deepCopy(specData);

    describe(`testTJEM(${ModelClazz.name})`, () => {

        for (let [index, data] of _specData.entries()) {
            it(`Validation of data[${index}]=${ inspect(data.data) }.`, async () => {

                let err: Error | undefined;
                try {
                    err = await tryValidateModel(ModelClazz, data.data, reqField);
                }
                catch (err) {
                    fail(`tsdvJoiSpec() Unexpected error while validate: ${err}`);
                    return;
                }

                if (err && data.isValid) {
                    fail(`Validation fail.  Detailed error: ${err}`);
                }

                if (!err && !data.isValid) {
                    fail(`Validation pass but expected validation fail.`);
                }
            });
        }

    });
}



async function tryValidateModel(clazz: new () => {}, object: any,  reqField: 'body' | 'query' | 'param' | string): Promise<undefined | Error> {
    return new Promise( (resolve, reject) => {

        const req = {
            is() {
                return true;
            }
        };
        req[reqField] = object;
        const res = {};

        function next(err?: Error) {
            if (err && ! (err instanceof HttpError)) {
                reject(err);
            }
            else {
                resolve(err);
            }
        }

        switch(reqField) {
            case 'body':
                validateBody(clazz)( req as any, res as any, next as any );
                break;
            case 'query':
                validateQuery(clazz)( req as any, res as any, next as any );
                break;
            default:
                validate(reqField, clazz)( req as any, res as any, next as any );
                break;
        }


    })
}