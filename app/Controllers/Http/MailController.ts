// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Mail from '@ioc:Adonis/Addons/Mail'
import MailPushValidator from '../../Validators/MailPushValidator';
var axios = require('axios');
var qs = require('qs');


export default class MailController {


  public async mail_hook({
    request,
    response
  }) {

    try {

      let all = request.body()


    } catch (error) {
      console.log('mail hook ----->', error)
    }

  }



  public async mail_push({
    request,
    response
  }) {

    try {

      let all = request.body();


      let mailPush = await Mail.send((message) => {
        message
          .from(all.from)
          .to(all.to)
          .subject(all.subject)
          .html(all.html)
      })

      console.log('******** - Mail - *********');
      console.log(mailPush)
      console.log('***************************');



      var data = qs.stringify({
         data:mailPush
      });
      var config = {
        method: 'post',
        url: 'https://efatura.tikoapi.com/mail_hook',
        headers: { },
        data : data
      };
      
      axios(config)
      .then(function (response) {
        console.log(JSON.stringify(response.data));
      })
      .catch(function (error) {
        console.log(error);
      });
      

    } catch (error) {
      console.log('test mail error ---->', error)
    }

  }


}
