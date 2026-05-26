// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
var aes256 = require('aes256');
export default class UsersController {

    public static async tokenRegister({request,response}){

        try {
            
            let all = request.headers()
    
            var key = 'tiko2022efaturaApi';
            var plaintext = 'my plaintext message';

            var encryptedPlainText = aes256.encrypt(key, plaintext);

            return response.status(200).send({
                status:200,
                message:'OK',
                response:{
                    token:encryptedPlainText
                }
            })


        } catch (error) {

            console.log('Token Register ------>',error);
            
        }

    }

}
