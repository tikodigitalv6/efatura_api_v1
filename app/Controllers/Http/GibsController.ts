import type {
  HttpContextContract
} from "@ioc:Adonis/Core/HttpContext";
var qs = require("qs");
import axios from "axios";
var fs = require("fs");
import GibValidator from "App/Validators/GibValidator";
import GibInfoValidator from "App/Validators/GibInfoValidator";
import GiblogoutValidator from '../../Validators/GiblogoutValidator';
var replaceall = require("replaceall");
import Env from "@ioc:Adonis/Core/Env";
var convert = require('xml-js');





export default class GibsController {
  // * Vkn Login Bilgileri
  public async gib_login({
    response,
    request
  }: HttpContextContract) {
    try {
      let all = request.body();

      console.log('İstek geldiiiiii')

      try {
        await request.validate(GibValidator);
      } catch (error) {
        console.log('Valid patladı')
        return response.status(400).send({
          status: 400,
          message: 'ERROR',
          response: error
        })
      }

      var data = qs.stringify({
        assoscmd: "anologin",
        rtype: "json",
        userid: all.username,
        sifre: all.password,
        sifre2: all.password,
        parola: "1",
      });

      var config = {
        method: "post",
        url: "https://earsivportal.efatura.gov.tr/earsiv-services/assos-login",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: data,
      };

      let respData = await axios(config);



      return response.status(200).send({
        status: 200,
        message: "success",
        response: respData.data,
      });
    } catch (error) {
      console.log("error");
    }
  }

  //  * Vkn_Bilgisi getirir
  public async vkn_bilgi({
    response,
    request
  }: HttpContextContract) {
    try {

      let all = request.all();

      console.log('****** 11111 *****')

      let data2 = qs.stringify({
        'vknTc': all.vknTcknn
      });
      
      let config2 = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'http://185.237.83.120:3009/vkn_sorgula_efatura',//'http://185.237.83.120:3009/vkn3',
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data : data2
      };
      

      let respData = await axios(config2)

      console.log('****** 4444444 *****')

      let text = respData.data

      console.log('****** 5555555 *****')

      let position = text.search("Mükellef kayıtlıdır.");

      console.log('****** 66666666 *****')

      let checkUser;

      if (position <= 0) {
        checkUser = 0
        console.log('****** position --- 1 ---- *****')
      } else {
        checkUser = 1
        console.log('****** position --- 2 ---- *****')
      }

      // console.log('Gelen parametreler ---->', all)

      // let pushData = `

      // <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsdl="http://schemas.i2i.com/ei/wsdl">
      // <soapenv:Header/>
      // <soapenv:Body>
      //    <wsdl:CheckUserRequest>
      //       <REQUEST_HEADER>
      //             <SESSION_ID>` + all.session_id + `</SESSION_ID>
      //             <APPLICATION_NAME>S</APPLICATION_NAME>
      //       </REQUEST_HEADER>
      //       <USER>
      //         <IDENTIFIER>` + all.vknTcknn + `</IDENTIFIER>
      //       </USER>
      //       <DOCUMENT_TYPE>INVOICE</DOCUMENT_TYPE>
      //       </wsdl:CheckUserRequest>
      //     </soapenv:Body>
      // </soapenv:Envelope>
      // `

      // var configQ = {
      //   method: 'post',
      //   url: 'https://efatura.izibiz.com.tr/AuthenticationWS?wsdl',
      //   headers: {
      //     'Content-Type': 'text/xml'
      //   },
      //   data: pushData
      // };

      // let datas = await axios(configQ)

      // var result1 = convert.xml2json(datas.data, {
      //   compact: true,
      //   ignoreText: false,
      //   ignoreDoctype: false,
      //   ignoreCdata: true,
      //   ignoreComment: true,
      //   ignoreAttributes: true,
      //   ignoreInstruction: true,
      //   ignoreDeclaration: true,
      //   indentAttributes: true,
      //   fullTagEmptyElement: true,
      //   indentCdata: true,
      //   spaces: 4
      // });


      // let snc = replaceall("SOAP-ENV:", "", result1);
      // snc = replaceall("_text", "text", snc);
      // snc = replaceall("S:", "text", snc);
      // snc = replaceall("ns3:", "text", snc);

      // let parseData = JSON.parse(snc)


      // let checkSessions = parseData.textEnvelope.textBody.textCheckUserResponse.ERROR_TYPE

    
        // eSorgu : sonuç : 1 -> eFatura - 0 -> eArsiv
        let eSorgu = checkUser
        console.log('****** 7777777 *****')
        var data = qs.stringify({
          'vknTc': all.vknTcknn
        });

        console.log('****** 8888888 *****')

        var config = {
          method: 'post',
          url: 'http://185.237.83.120:3009/vkn_sorgula_efatura',//'http://185.237.83.120:3009/vkn2',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          data: data
        };

        console.log('****** 9999999 *****')

        let resp = await axios(config)


        console.log('****** 00000000 *****')

        console.log('********')
        console.log(resp.data)
        console.log('********')

        console.log('****** 111111111 *****')
        // * Vergi Dairesinin bulunduğu ili bulmak
        const myPromise = new Promise((resolve, reject) => {
          fs.readFile(
            Env.get("OLCU_BIRIMLARI_PATH") + "vergi_daireleri.json",
            "utf8",
            (err, data) => {
              if (err) {
                reject(err);
                console.error(err);
                return;
              }

              let dataParse = JSON.parse(data)

              let findData = dataParse.find(x => x.daire_kodu === resp.data.vergiDairesiKodu)

              console.log('******** il kodu ********')
              console.log(findData)
              console.log('******** il kodu ********')

              if (findData == undefined) {
                return resolve('');
              } else {
                return resolve(findData);
              }

            }
          );
        });


        console.log('****** 22222222 *****')


        let cnt;

        try {
          cnt = await myPromise
        } catch (error) {
          console.log('error---->', error)
        }

        console.log('****** 333333 *****')

        let jsp;

        if (all.vknTcknn.length == 10) {
          jsp = {
            "sorgulayanTckn": "",
            "sorgulanacakVkn": all.vknTcknn,
            "sorgulanacakTckn": "",
            "sorgulanacakVDIl": cnt.il_kodu,
            "sorgulanacakVDAd": resp.data.vergiDairesiKodu,
            "islemTip": "0"
          }
        } else {
          jsp = {
            "sorgulayanTckn": "",
            "sorgulanacakVkn": "",
            "sorgulanacakTckn": all.vknTcknn,
            "sorgulanacakVDIl": cnt.il_kodu,
            "sorgulanacakVDAd": resp.data.vergiDairesiKodu,
            "islemTip": "0"
          }
        }

        // var data = qs.stringify({
        //   'cmd': 'vergiLevhasiDetay_sorgula',
        //   'callid': '63f540c224ad3-40',
        //   'pageName': 'P_INTVRG_INTVD_E_VERGI_LEVHA_SORGULA',
        //   'token': 'd1078f5e3dc646b78d5d4e5842f21e97feb48d366bc7617458b6679dec12675154a01fccc42292bb04d926bc259dbc75e39dd8e202535fd70a7098396c74a6f7',
        //   'jp': JSON.stringify(jsp)
        // });

        // console.log('****** 444444444 *****')

        // var configs = {
        //   method: 'post',
        //   url: 'https://ivd.gib.gov.tr/tvd_server/dispatch',
        //   headers: {
        //     'Accept': 'application/json, text/javascript, */*; q=0.01',
        //     'Accept-Language': 'en-US,en;q=0.7',
        //     'Cache-Control': 'no-cache',
        //     'Connection': 'keep-alive',
        //     'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        //     'Cookie': 'JSESSIONID=DEEEF8193F9B174DF092CEB404006879',
        //     'Origin': 'https://ivd.gib.gov.tr',
        //     'Pragma': 'no-cache',
        //     'Referer': 'https://ivd.gib.gov.tr/tvd_side/main.jsp?token=d1078f5e3dc646b78d5d4e5842f21e97feb48d366bc7617458b6679dec12675154a01fccc42292bb04d926bc259dbc75e39dd8e202535fd70a7098396c74a6f7&gn=vkndogrulamalar',
        //     'Sec-Fetch-Dest': 'empty',
        //     'Sec-Fetch-Mode': 'cors',
        //     'Sec-Fetch-Site': 'same-origin',
        //     'Sec-GPC': '1',
        //     'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36'
        //   },
        //   data: data
        // };



        // console.log('****** 5555555 *****')

        // let getLevha = await axios(configs)


        console.log('****** 66666666 *****')

        let adres;

        // if (getLevha.data.error != undefined) {
        //   adres = ""
        // } else {
        //   adres = getLevha.data.data.adres
        // }

        let unvan = resp.data.unvan

        console.log('****** 7777777 *****')

        // console.log('*********-----******----->',resp.data.unvan)

        // if (resp.data.unvan.length == 0) {
        //   unvan = resp.data.unvan
        // }else {
        //   unvan = resp.data.ad + ' ' + resp.data.soyad
        // }

        console.log('****unvan****')
        console.log(resp.data.unvan)
        console.log('********')
        let adr = resp.data.adresBilgileri[0]
        if (resp.data.adresBilgileri[0]) {
          adr = adr.mahalleSemt + ' ' + adr.koy + ' ' + adr.caddeSokak + ' ' + adr.disKapiNo + '/' + adr.icKapiNo + ' ' + adr.beldeBucak + ' ' + adr.ilceAdi + ' ' + adr.ilAdi
        }else{
          adr = "Bulunamadı"
        }
        
        console.log('****** END *****')

        return response.status(200).send({
          status: 200,
          message: "Vergi Kimlik Bilgileri",
          response: {
            unvan: unvan,
            vergi_dairesi: resp.data.vergiDairesiAdi,
            adi: resp.data.ad,
            tc_no: resp.data.tc_no,
            soyadi: resp.data.soyad,
            adres: adr,
            vknInfo: eSorgu,
            faalTerkDurumu: resp.data.faalTerkDurumu,
            sirketinTuru: resp.data.sirketinTuru,
          },
        });


        // if (resp.data.unvan.length != 0) {

        //   return response.status(200).send({
        //     status: 200,
        //     message: "Vergi Kimlik Bilgileri",
        //     response: {
        //       unvan:unvan,
        //       vergi_dairesi: resp.data.vergiDairesiAdi,
        //       adi: resp.data.ad,
        //       tc_no: resp.data.tc_no,
        //       soyadi: resp.data.soyad,
        //       adres: adres,
        //       vknInfo:eSorgu
        //     },
        //   });


        // }else {

        //   return response.status(200).send({
        //     status: 200,
        //     message: "Vergi Kimlik Bilgileri",
        //     response: {
        //       unvan:'',
        //       vergi_dairesi: '',
        //       adi: '',
        //       tc_no: '',
        //       soyadi: '',
        //       adres: '',
        //       vknInfo:eSorgu
        //     },
        //   });


        // }


        // if (resp.data.unvan == '') {

        //   return response.status(200).send({
        //   status: 200,
        //   message: "Vergi Kimlik Bilgileri",
        //   response: {
        //     unvan:unvan,
        //     vergi_dairesi: resp.data.vergiDairesiAdi,
        //     adi: resp.data.ad,
        //     tc_no: resp.data.tc_no,
        //     soyadi: resp.data.soyad,
        //     adres: adres,
        //     vknInfo:eSorgu
        //   },

        // });
        // }else {
        //   return response.status(200).send({
        //     status: 200,
        //     message: "Vergi Kimlik Bilgileri",
        //     response: {
        //       unvan:'',
        //       vergi_dairesi: '',
        //       adi: '',
        //       tc_no: '',
        //       soyadi: '',
        //       adres: '',
        //       vknInfo:''
        //     },
        //   });
        // }




    } catch (error) {
      console.log("vergi Kimlik bilgileri --> error --->", error);
    }
  }

  // * Gib Logout Servisi
  public async gib_logout({
    request,
    response
  }: HttpContextContract) {

    try {

      let all = request.body();

      try {
        await request.validate(GiblogoutValidator)
      } catch (error) {
        return response.status(400).send({
          status: 400,
          message: 'ERROR',
          response: error
        })
      }

      var data = qs.stringify({
        'assoscmd': 'logout',
        'rtype': 'json',
        'token': all.token
      });

      var config = {
        method: 'post',
        url: 'https://earsivportal.efatura.gov.tr/earsiv-services/assos-login',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: data
      };

      let respData = await axios(config)

      return response.status(200).send({
        status: 200,
        message: 'success',
        response: respData.data
      })

    } catch (error) {

      console.log('gibLogin --> error --> ', error)

    }

  }


  public async mukellefiyetSorgu({
    response,
    request
  }: HttpContextContract){
  
      try {
  
        let all = request.all();

        let data = qs.stringify({
          'VKN': all.VKN
        });
        
        let config = {
          method: 'post',
          maxBodyLength: Infinity,
          url: 'http://185.237.83.120:3009/vkn3',
          headers: { 
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          data : data
        };
        
  
        let respData = await axios(config)
  
        let text = respData.data
  
        let position = text.search("Mükellef kayıtlıdır.");
  
        let checkUser;
        let message;

        if (position <= 0) {
          checkUser = 0
          message = 'Mükellef Kayıtlı Değil'
        } else {
          checkUser = 1
          message = 'Mükellef Kayıtlı'
        }


        return response.status(200).send({
          status:200,
          message:'Başarılı',
          response:{
            code:checkUser,
            message:message
          }
        })
  
        
      } catch (error) {
        console.log('error ----->',error)
        return response.status(200).send({
          status:200,
          message:'Bir Hata Oluştu.Lütfen daha sonra deneyiniz',
          response:''
        })
      }
  
  }


    // * Mükellefi izibiz servisi üzerinden sorgular
    public async get_user_izi({
      request,
      response
    }: HttpContextContract){
  
      try { 
  
        let all = request.all();
  
        let pushData = `
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsdl="http://schemas.i2i.com/ei/wsdl">
        <soapenv:Header/>
        <soapenv:Body>
           <wsdl:CheckUserRequest>
              <REQUEST_HEADER>
                    <SESSION_ID>` + all.session_id + `</SESSION_ID>
                    <APPLICATION_NAME>S</APPLICATION_NAME>
              </REQUEST_HEADER>
              <USER>
                <IDENTIFIER>` + all.vknTcknn + `</IDENTIFIER>
              </USER>
              <DOCUMENT_TYPE>INVOICE</DOCUMENT_TYPE>
              </wsdl:CheckUserRequest>
            </soapenv:Body>
        </soapenv:Envelope>
        `
  
        var configQ = {
          method: 'post',
          url: 'https://authenticationws.izibiz.com.tr/AuthenticationWS?wsdl',
          headers: {
            'Content-Type': 'text/xml'
          },
          data: pushData
        };
  
        let datas = await axios(configQ)

        console.log('************ -- *************')
        console.log(datas.data)
        console.log('************ -- *************')
  
        var result1 = convert.xml2json(datas.data, {
          compact: true,
          ignoreText: false,
          ignoreDoctype: false,
          ignoreCdata: true,
          ignoreComment: true,
          ignoreAttributes: true,
          ignoreInstruction: true,
          ignoreDeclaration: true,
          indentAttributes: true,
          fullTagEmptyElement: true,
          indentCdata: true,
          spaces: 4
        });
  
  
        let snc = replaceall("SOAP-ENV:", "", result1);
        snc = replaceall("_text", "text", snc);
        snc = replaceall("S:", "text", snc);
        snc = replaceall("ns3:", "text", snc);
  
        let parseData = JSON.parse(snc)
        let prr = parseData.textEnvelope.textBody.textCheckUserResponse.USER
  
        let obj:any = {}
        obj.IDENTIFIER = prr.IDENTIFIER.text
        obj.ALIAS =  prr.ALIAS.text
        obj.TITLE =  prr.TITLE.text
        obj.TYPE =  prr.TYPE.text
        obj.REGISTER_TIME =  prr.REGISTER_TIME.text
        obj.UNIT =  prr.UNIT.text
        obj.ALIAS_CREATION_TIME =  prr.ALIAS_CREATION_TIME.text
        obj.ACCOUNT_TYPE =  prr.ACCOUNT_TYPE.text
        obj.DOCUMENT_TYPE =  prr.DOCUMENT_TYPE.text


  
        return response.status(200).send({
          status: 200,
          message: 'success',
          response: obj
        })
  
      } catch (error) {
          console.log('error ----get user izi---->',error)
      }
  
    }



}

