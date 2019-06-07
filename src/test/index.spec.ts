import { AnyConstraints, StringConstraints } from 'tsdv-joi';
import { TJEMData, testTJEM } from './helpers/test.helper.spec';



const { Required } = AnyConstraints;
const { Email, Max: MaxChar, Min: MinChar, StringSchema } = StringConstraints;



class UserClass {
    @Required()
    @Email()
    email: string;

    @MinChar(10)
    @MaxChar(20)
    @StringSchema()
    surname: string;
}


describe(`validateBody()`, () => {


    const testData: TJEMData = [
        // {isValid: true, data: {email: 'abc@def.com'}},
        // {isValid: true, data: {email: 'hahsdhfas@sdofawe.pl'}},

        {isValid: false, data: {email: ' ', surname: 'too short'}},
        {isValid: false, data: {email: 'abcdef.com', surname: '1234567890'}},
    ];
    testTJEM(UserClass, testData, 'body');

});