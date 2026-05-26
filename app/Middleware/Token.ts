import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Hash from '@ioc:Adonis/Core/Hash'
var aes256 = require('aes256');
export default class Token {


  public async handle({request,response}: HttpContextContract, next: () => Promise<void>) {
    // code for middleware goes here. ABOVE THE NEXT CALL

    let all = request.headers()

    console.log(all.key)

  
    
    // var key = 'tiko2022efaturaApi';
    // var plaintext = 'my plaintext message';

    // var encryptedPlainText = aes256.encrypt(key, plaintext);

    // try {
    //   var decryptedPlainText = aes256.decrypt(key, all.authorization);
    //   console.log('decryptedPlainText ---->',decryptedPlainText)

    //   await next()

    // } catch (error) {
      
    //   return response.status(401).send({
    //     status:401,
    //     message:'unauthorization',
    //     response:''
    //   })

    // }

  
  }


}
