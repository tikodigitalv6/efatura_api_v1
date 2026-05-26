import type {
  HttpContextContract
} from '@ioc:Adonis/Core/HttpContext'
import InvoicesController from './InvoicesController';
import { encode } from 'js-base64';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
const extract = require('extract-zip')
var convert = require('xml-js');
var replaceall = require("replaceall");
import AWS from 'aws-sdk'
import Mail from '@ioc:Adonis/Addons/Mail'
const fs = require('fs');
import eArsivXml from './xmlParser';
const xmlToJson = new eArsivXml();
import qs from 'qs';
import {
  DownloaderHelper
} from 'node-downloader-helper';

import Env from '@ioc:Adonis/Core/Env'
var utf8 = require('utf8');
var base64 = require('base-64');

AWS.config.update({
  region: 'eu-central-1'
});

// Create an SQS service object
var sqs = new AWS.SQS({
  apiVersion: '2012-11-05',
  accessKeyId: process.env.AWS_ACCESS_KEY || "",
  secretAccessKey: process.env.AWS_SECRET_KEY || ""
});


const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY || "",
  secretAccessKey: process.env.AWS_SECRET_KEY || ""
});

export default class SoapsController {

  // * Login İşlemi
  public async login({
    response,
    request
  }: HttpContextContract) {

    try {


      let all = request.body()

      var soap = require('soap');
      var url = 'https://authenticationws.izibiz.com.tr/AuthenticationWS?wsdl';
      var args = {
        USER_NAME: all.username,
        PASSWORD: all.password
      };

      const resp = new Promise((resolve, reject) => {
        soap.createClient(url, function (err, client) {
          if(err){
            reject(err)
          }
          client.Login(args, function (err, result) {
            if(err){
              reject(err)
            }
            resolve(result)
          });

        });
      });

      let data:any = await resp

      if (data != null && data.status == 500) {
       
        var result1 = convert.xml2json(data.data, {
          compact: true,
          ignoreText:false,
          ignoreDoctype:false,
          ignoreCdata:true,
          ignoreComment:true,
          ignoreAttributes:true,
          ignoreInstruction:true,
          ignoreDeclaration:true,
          indentAttributes:true,
          fullTagEmptyElement:true,
          indentCdata:true,
          spaces: 4});
    
          let snc = replaceall("SOAP-ENV:", "", result1);
    
          snc = replaceall("_text", "text", snc);
    
        return response.status(200).send({
          status: 200,
          message: 'OK',
          response: JSON.parse(snc)
        })
    
    
      }
      else {

        return response.status(200).send({
          status: 200,
          message: 'OK',
          response: data
        })
  
      }

     

    } catch (error) {
      console.log(error)

      await this.error_mail('Login',error)

      if (error.response != undefined) {

        let xml = error.response.data

        var result1 = convert.xml2json(xml, {
          compact: true,
          ignoreText:false,
          ignoreDoctype:false,
          ignoreCdata:true,
          ignoreComment:true,
          ignoreAttributes:true,
          ignoreInstruction:true,
          ignoreDeclaration:true,
          indentAttributes:true,
          fullTagEmptyElement:true,
          indentCdata:true,
          spaces: 4});
  
          var original = result1
    
          let resp = replaceall("SOAP-ENV:", "", original);
  
          resp = replaceall("_text", "text", resp);
  
      
  
        return response.status(400).send({
          status: 400,
          message: 'OK',
          response: JSON.parse(resp)
        })
  

      }else {

        return response.status(400).send({
          status: 400,
          message: 'Bir Sorun Oluştu',
          response: ''
        })

      }

    }

  }

  // * Çıkış İşlemi
  public async logout({
    response,
    request
  }: HttpContextContract) {

    try {

      let all = request.body()

      var soap = require('soap');
      var url = 'https://authenticationws.izibiz.com.tr/AuthenticationWS?wsdl';
      var args = {
        REQUEST_HEADER: {
          SESSION_ID: all.SESSION_ID
        }
      };

      const resp = new Promise((resolve, reject) => {

        soap.createClient(url, function (err, client) {
          if(err){
            reject(err)
          }
          client.Logout(args, function (err, result) {
            if(err){
              reject(err)
            }
            resolve(result)
          });

        });
      });

      let data = await resp

      return response.status(200).send({
        status: 200,
        message: 'OK',
        response: data
      })

    } catch (error) {
      console.log(error)

      await this.error_mail('logout',error)

    }

  }

  // * Mükellef Listesi Çekme
  public async mukellefListesi({
    response,
    request
  }: HttpContextContract) {

    try {

      let all = request.body()

      var soap = require('soap');
      var url = 'https://authenticationws.izibiz.com.tr/AuthenticationWS?wsdl';
      var args = {
        REQUEST_HEADER: {
          SESSION_ID: all.SESSION_ID
        }
      };

      const resp = new Promise((resolve, reject) => {

        soap.createClient(url, function (err, client) {
          if(err){
            reject(err)
          }

          client.GetGibUserList(args, function (err, result) {
            if(err){
              reject(err)
            }
            resolve(result)
          });

        });
      });

      let data = await resp

      return response.status(200).send({
        status: 200,
        message: 'OK',
        response: data
      })


    } catch (error) {
      console.log('error mukellefListesi', error)

      await this.error_mail('mukellefListesi',error)

    }

  }

  // * Mükellef Listesi Çekme
  public async mukellefSorgulama({
    response,
    request
  }: HttpContextContract) {

    try {

      let all = request.body()

      let pushData = `

      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsdl="http://schemas.i2i.com/ei/wsdl">
      <soapenv:Header/>
      <soapenv:Body>
         <wsdl:CheckUserRequest>
            <REQUEST_HEADER>
                  <SESSION_ID>`+all.SESSION_ID+`</SESSION_ID>
                  <APPLICATION_NAME>S</APPLICATION_NAME>
            </REQUEST_HEADER>
            <USER>
              <IDENTIFIER>`+all.IDENTIFIER+`</IDENTIFIER>
            </USER>
            <DOCUMENT_TYPE>`+all.DOCUMENT_TYPE+`</DOCUMENT_TYPE>
            </wsdl:CheckUserRequest>
          </soapenv:Body>
      </soapenv:Envelope>
      
      `

      var config = {
        method: 'post',
        url: 'https://authenticationws.izibiz.com.tr/AuthenticationWS?wsdl',
        headers: { 
          'Content-Type': 'text/xml'
        },
        data : pushData
      };
      
      let datas = await axios(config)

      var result1 = convert.xml2json(datas.data, {
        compact: true,
        ignoreText:false,
        ignoreDoctype:false,
        ignoreCdata:true,
        ignoreComment:true,
        ignoreAttributes:true,
        ignoreInstruction:true,
        ignoreDeclaration:true,
        indentAttributes:true,
        fullTagEmptyElement:true,
        indentCdata:true,
        spaces: 4});
        console.log(result1);
        
        let snc = replaceall("SOAP-ENV:", "", result1);
        snc = replaceall("_text", "text", snc);
        snc = replaceall("S:", "text", snc);
        snc = replaceall("ns3:", "text", snc);


      return response.status(200).send({
        status: 200,
        message: 'OK',
        response: JSON.parse(snc)
      })

      

    } catch (error) {

      await this.error_mail('mukellefSorgulama',error)

      let xml = error.response.data

      var result1 = convert.xml2json(xml, {
        compact: true,
        ignoreText:false,
        ignoreDoctype:false,
        ignoreCdata:true,
        ignoreComment:true,
        ignoreAttributes:true,
        ignoreInstruction:true,
        ignoreDeclaration:true,
        indentAttributes:true,
        fullTagEmptyElement:true,
        indentCdata:true,
        spaces: 4});

        var original = result1
 
        let resp = replaceall("SOAP-ENV:", "", original);

        resp = replaceall("_text", "text", resp);

   

      return response.status(200).send({
        status: 500,
        message: 'OK',
        response: JSON.parse(resp)
      })
    }

  }

  // * Fatura Bilgileri
  public async faturaListesi({
    response
  }: HttpContextContract) {

    try {

      let arr = [{
          "name": "Temel Satış Faturası",
          "desk": "Alıcısı tarafından elektronik ortamda kabul veya reddedilemeyen fatura tipidir.",
        },
        {
          "name": "Ticari Satış Faturası",
          "desk": "Alıcısı tarafından elektronik ortamda kabul veya reddedilebilen fatura tipidir.",
        },
        {
          "name": "İade Faturası",
          "desk": "Alınan bir fatura üzerinde ki yanlış tutar veya eksik bilgi sebebi ile düzenlenen fatura tipidir. İade faturası TEMELFATURA olarak gönderilmesi zorunludur.",
        },
        {
          "name": "Farklı KDV Oranlarına Sahip Fatura",
          "desk": "Fatura satırında farklı KDV oranlarının bulunduğu fatura örneğidir. Her satırda farklı KDV oranı vardır.",
        },
        {
          "name": "0 KDV Fatura",
          "desk": "Fatura satırında KDV oranı 0 olan satış faturası örneğidir. KDV 0 olduğu durumlarda muafiyet sebebi belirtilmelidir.",
        },
        {
          "name": "Dövizli Satış Faturası",
          "desk": "Fatura para birimi TL dışında farklı bir para birimi ile düzenlenen fatura örneğidir. Faturanın içerisinde tutarlar döviz cinsindendir. TL karşlıkları XML içerisinde bulunmaz. TL karşılıkları görsel üzerinde tutar ile kur çarpılarak gösterilir.",
        },
        {
          "name": "Bedelsiz (%100 İskontolu) Satış Faturası",
          "desk": "Promosyon, Eşantiyon veya Numune Ürün Teslimlerinde bedelsiz düzenlenen fatura örneğidir. Bu faturalarda KDV 0 hesaplandığı için muafiyet sebebi belirtilmelidir. Bu faturaların muafiyet kodu 351 olur. Muafiyet sebebi ise müşteri tarafından girilebilir.",
        },
        {
          "name": "Satırda Çoklu İskontolu Satış Faturası",
          "desk": "Bir fatura satırında birden fazla iskonto içeren fatura örneğidir.",
        },
        {
          "name": "İstisna Faturası",
          "desk": "İstisna Faturası",
        },
        {
          "name": "Özel Mathrah Faturası",
          "desk": "Özel Matrah Faturası",
        },
        {
          "name": "Tevkifat Faturası",
          "desk": "Tevkifat Faturası.",
        },
        {
          "name": "İhraç Kayıtlı Fatura",
          "desk": "İhraç Kayıtlı Fatura.",
        },
        {
          "name": "İhracat Faturası",
          "desk": "İhracat Faturası.",
        },
        {
          "name": "Yolcu Beraberi (Taxfree)",
          "desk": "Yolcu Beraberi (Taxfree).",
        },
        {
          "name": "SGK Faturası",
          "desk": "SGK Faturası TEMELFATURA senaryosunda gönderilmek zorundadır.",
        },
        {
          "name": "Kamu Faturası",
          "desk": "Kamu kurum ve kuruluşlarına düzenlenen fatura örneğidir. TEMELFATURA senaryosunda göndermek zorundadır.",
        },
        {
          "name": "Hal Komisyon Faturası",
          "desk": "Hal Komisyoncularının komisyon kazançları için düzenledikleri fatura tipidir. Faturanın HKS senaryosunda gönderilmesi zorunludur.",
        },
        {
          "name": "Gelir Vergisi(GV) Stopajlı Fatura",
          "desk": "Gelir vergisi stopajı uygulanan fatura örneğidir.",
        },
        {
          "name": "Kurumlar Vergisi(KV) Stopajlı Fatura",
          "desk": "Kurumlar vergisi stopajı uygulanan fatura örneğidir.",
        },
        {
          "name": "Ek Belge İçeren Fatura",
          "desk": "Faturanın ekinde belge gönderildiği durumlarda düzenlenecek fatura örneğidir.",
        },
        {
          "name": "E-Arşiv Fatura - İnternet",
          "desk": "Internet üzerine yapılan satış için düzenlenen fatura tipidir. Bu faturalar alıcısına elektronik ortamda iletilmek zorundadır. Bu faturalar diğer satış faturalarından farklı bir seriden gönderilmeldir.",
        },
        {
          "name": "E-Arşiv Fatura - Normal",
          "desk": "Internet üzerine yapılan satış dışında düzenlenen fatura tipidir. Bu faturalar alıcısına elektronik ortamda iletilebileceği gibi kağıt olarakta teslim edilebilir.",
        }
      ]

      return response.status(200).send({
        status: 200,
        message: 'OK',
        response: arr
      })

    } catch (error) {
      console.log('Fatura Listesi error', error)
      await this.error_mail('faturaListesi',error)
    }

  }

  // * Fatura Gönderme
  public async faturaGonder({
    response,
    request
  }: HttpContextContract) {

    try {

      let all = request.body()
      
      let xml: any = new InvoicesController()

      // * Line Alanları

      let lineList = JSON.parse(all.InvoiceLine)
      let daf:any = []


      return


      let ortak = ''
      if (all.TaxCategoryTaxSchemeTaxExemptionReasonCode != undefined && all.TaxCategoryTaxSchemeTaxExemptionReason != undefined) {
          ortak = `
          <cbc:TaxExemptionReasonCode>`+all.TaxCategoryTaxSchemeTaxExemptionReasonCode+`</cbc:TaxExemptionReasonCode>
          <cbc:TaxExemptionReason>`+all.TaxCategoryTaxSchemeTaxExemptionReason+`</cbc:TaxExemptionReason>
          `
      }


      for (let i = 0; i < lineList.length; i++) {
        const lines = lineList[i];


        // * Satırda Çoklu İskontolu Satış Faturası
        if (lines.IskChargeIndicator != undefined) {


          daf.push(`

          <cac:InvoiceLine>
          <cbc:ID>1</cbc:ID>
          <cbc:Note></cbc:Note>
          <cbc:InvoicedQuantity unitCode="C62">`+lines.InvoicedQuantity+`</cbc:InvoicedQuantity>
          <cbc:LineExtensionAmount currencyID=`+JSON.stringify(all.currencyID)+`>`+lines.LineExtensionAmount+`</cbc:LineExtensionAmount>


          <cac:AllowanceCharge>
          <cbc:ChargeIndicator>`+lines.IskChargeIndicator+`</cbc:ChargeIndicator>
          <cbc:AllowanceChargeReason>`+lines.IskAllowanceChargeReason+`</cbc:AllowanceChargeReason>
          <cbc:MultiplierFactorNumeric>`+lines.IskMultiplierFactorNumeric+`</cbc:MultiplierFactorNumeric>
          <cbc:Amount currencyID="TRY">`+lines.IskAmount+`</cbc:Amount>
          <cbc:BaseAmount currencyID="TRY">`+lines.IskBaseAmount+`</cbc:BaseAmount>
          </cac:AllowanceCharge>


          <cac:TaxTotal>
          <cbc:TaxAmount currencyID=`+JSON.stringify(all.currencyID)+`>`+lines.TaxAmount+`</cbc:TaxAmount>
          <cac:TaxSubtotal>
          <cbc:TaxableAmount currencyID=`+JSON.stringify(all.currencyID)+`>`+lines.TaxableAmount+`</cbc:TaxableAmount>
          <cbc:TaxAmount currencyID=`+JSON.stringify(all.currencyID)+`>`+lines.TaxAmount+`</cbc:TaxAmount>
          <cbc:CalculationSequenceNumeric>`+lines.CalculationSequenceNumeric+`</cbc:CalculationSequenceNumeric>
          <cbc:Percent>`+lines.Percent+`</cbc:Percent>
          <cac:TaxCategory>
          <cac:TaxScheme>
          <cbc:Name>`+JSON.stringify(lines.TaxSchemeName)+`</cbc:Name>
          <cbc:TaxTypeCode>`+lines.TaxTypeCode+`</cbc:TaxTypeCode>
          </cac:TaxScheme>
          </cac:TaxCategory>
          </cac:TaxSubtotal>
          </cac:TaxTotal>
          <cac:Item>
          <cbc:Name> `+lines.ItemName+` </cbc:Name>
          </cac:Item>
          <cac:Price>
          <cbc:PriceAmount currencyID=`+JSON.stringify(all.currencyID)+`>`+lines.PriceAmount+`</cbc:PriceAmount>
          </cac:Price>
          </cac:InvoiceLine>`)


        }else if(lines.TevkifatWithholdingTaxTotalTaxAmount != undefined) {

          
          daf.push(`

          <cac:InvoiceLine>
          <cbc:ID>1</cbc:ID>
          <cbc:Note></cbc:Note>
          <cbc:InvoicedQuantity unitCode="C62">`+lines.InvoicedQuantity+`</cbc:InvoicedQuantity>
          <cbc:LineExtensionAmount currencyID=`+JSON.stringify(all.currencyID)+`>`+lines.LineExtensionAmount+`</cbc:LineExtensionAmount>
          <cac:TaxTotal>
          <cbc:TaxAmount currencyID=`+JSON.stringify(all.currencyID)+`>`+lines.TaxAmount+`</cbc:TaxAmount>
          <cac:TaxSubtotal>
          <cbc:TaxableAmount currencyID=`+JSON.stringify(all.currencyID)+`>`+lines.TaxableAmount+`</cbc:TaxableAmount>
          <cbc:TaxAmount currencyID=`+JSON.stringify(all.currencyID)+`>`+lines.TaxAmount+`</cbc:TaxAmount>
          <cbc:CalculationSequenceNumeric>`+lines.CalculationSequenceNumeric+`</cbc:CalculationSequenceNumeric>
          <cbc:Percent>`+lines.Percent+`</cbc:Percent>
          <cac:TaxCategory>
          <cac:TaxScheme>
          <cbc:Name>`+JSON.stringify(lines.TaxSchemeName)+`</cbc:Name>
          <cbc:TaxTypeCode>`+lines.TaxTypeCode+`</cbc:TaxTypeCode>
          </cac:TaxScheme>
          </cac:TaxCategory>
          </cac:TaxSubtotal>
          </cac:TaxTotal>

          <cac:WithholdingTaxTotal>
          <cbc:TaxAmount currencyID="TRY">324.00</cbc:TaxAmount>
          <cac:TaxSubtotal>
          <cbc:TaxableAmount currencyID="TRY">2000</cbc:TaxableAmount>
          <cbc:TaxAmount currencyID="TRY">324.00</cbc:TaxAmount>
          <cbc:Percent>90</cbc:Percent>
          <cac:TaxCategory>
          <cac:TaxScheme>
          <cbc:Name>602 - etüt, plan-proje, danişmanlik, denetim ve benzeri hizmetler</cbc:Name>
          <cbc:TaxTypeCode>602</cbc:TaxTypeCode>
          </cac:TaxScheme>
          </cac:TaxCategory>
          </cac:TaxSubtotal>
          </cac:WithholdingTaxTotal>


          <cac:Item>
          <cbc:Name> `+lines.ItemName+` </cbc:Name>
          </cac:Item>
          <cac:Price>
          <cbc:PriceAmount currencyID=`+JSON.stringify(all.currencyID)+`>`+lines.PriceAmount+`</cbc:PriceAmount>
          </cac:Price>
          </cac:InvoiceLine>`)



        }else if(lines.ihracatDeliveryTermsID != undefined) {

          daf.push(`

          <cac:InvoiceLine>
          <cbc:ID>1</cbc:ID>
          <cbc:Note></cbc:Note>
          <cbc:InvoicedQuantity unitCode="C62">`+lines.InvoicedQuantity+`</cbc:InvoicedQuantity>
          <cbc:LineExtensionAmount currencyID=`+JSON.stringify(all.currencyID)+`>`+lines.LineExtensionAmount+`</cbc:LineExtensionAmount>


          <cac:Delivery>
          <cac:DeliveryAddress>
          <cbc:StreetName/>
          <cbc:BuildingName/>
          <cbc:BuildingNumber/>
          <cbc:CitySubdivisionName/>
          <cbc:CityName/>
          <cbc:PostalZone/>
          <cac:Country>
          <cbc:Name/>
          </cac:Country>
          </cac:DeliveryAddress>
          <cac:DeliveryTerms>
          <cbc:ID schemeID="INCOTERMS">`+lines.ihracatDeliveryTermsID+`</cbc:ID>
          </cac:DeliveryTerms>
          <cac:Shipment>
          <cbc:ID/>
          <cbc:FreeOnBoardValueAmount currencyID="TRY">`+lines.ihracatFreeOnBoardValueAmount+`</cbc:FreeOnBoardValueAmount>
          <cac:GoodsItem>
          <cbc:RequiredCustomsID>`+lines.ihracatRequiredCustomsID+`</cbc:RequiredCustomsID>
          </cac:GoodsItem>
          <cac:ShipmentStage>
          <cbc:TransportModeCode>`+lines.ihracatTransportModeCode+`</cbc:TransportModeCode>
          </cac:ShipmentStage>
          <cac:TransportHandlingUnit>
          <cac:ActualPackage>
          <cbc:ID/>
          <cbc:Quantity>`+lines.ihracatQuantity+`</cbc:Quantity>
          <cbc:PackagingTypeCode>`+lines.ihracatPackagingTypeCode+`</cbc:PackagingTypeCode>
          </cac:ActualPackage>
          </cac:TransportHandlingUnit>
          </cac:Shipment>
          </cac:Delivery>



          <cac:TaxTotal>
          <cbc:TaxAmount currencyID=`+JSON.stringify(all.currencyID)+`>`+lines.TaxAmount+`</cbc:TaxAmount>
          <cac:TaxSubtotal>
          <cbc:TaxableAmount currencyID=`+JSON.stringify(all.currencyID)+`>`+lines.TaxableAmount+`</cbc:TaxableAmount>
          <cbc:TaxAmount currencyID=`+JSON.stringify(all.currencyID)+`>`+lines.TaxAmount+`</cbc:TaxAmount>
          <cbc:CalculationSequenceNumeric>`+lines.CalculationSequenceNumeric+`</cbc:CalculationSequenceNumeric>
          <cbc:Percent>`+lines.Percent+`</cbc:Percent>
          <cac:TaxCategory>
          <cac:TaxScheme>
          <cbc:Name>`+JSON.stringify(lines.TaxSchemeName)+`</cbc:Name>
          <cbc:TaxTypeCode>`+lines.TaxTypeCode+`</cbc:TaxTypeCode>
          </cac:TaxScheme>
          </cac:TaxCategory>
          </cac:TaxSubtotal>
          </cac:TaxTotal>
          <cac:Item>
          <cbc:Name> `+lines.ItemName+` </cbc:Name>
          </cac:Item>
          <cac:Price>
          <cbc:PriceAmount currencyID=`+JSON.stringify(all.currencyID)+`>`+lines.PriceAmount+`</cbc:PriceAmount>
          </cac:Price>
          </cac:InvoiceLine>`)

        }else {
          daf.push(`

          <cac:InvoiceLine>
          <cbc:ID>1</cbc:ID>
          <cbc:Note></cbc:Note>
          <cbc:InvoicedQuantity unitCode="C62">`+lines.InvoicedQuantity+`</cbc:InvoicedQuantity>
          <cbc:LineExtensionAmount currencyID=`+JSON.stringify(all.currencyID)+`>`+lines.LineExtensionAmount+`</cbc:LineExtensionAmount>
          <cac:TaxTotal>
          <cbc:TaxAmount currencyID=`+JSON.stringify(all.currencyID)+`>`+lines.TaxAmount+`</cbc:TaxAmount>
          <cac:TaxSubtotal>
          <cbc:TaxableAmount currencyID=`+JSON.stringify(all.currencyID)+`>`+lines.TaxableAmount+`</cbc:TaxableAmount>
          <cbc:TaxAmount currencyID=`+JSON.stringify(all.currencyID)+`>`+lines.TaxAmount+`</cbc:TaxAmount>
          <cbc:CalculationSequenceNumeric>`+lines.CalculationSequenceNumeric+`</cbc:CalculationSequenceNumeric>
          <cbc:Percent>`+lines.Percent+`</cbc:Percent>
          <cac:TaxCategory>
          <cac:TaxScheme>
          <cbc:Name>`+JSON.stringify(lines.TaxSchemeName)+`</cbc:Name>
          <cbc:TaxTypeCode>`+lines.TaxTypeCode+`</cbc:TaxTypeCode>
          </cac:TaxScheme>
          </cac:TaxCategory>
          </cac:TaxSubtotal>
          </cac:TaxTotal>
          <cac:Item>
          <cbc:Name> `+lines.ItemName+` </cbc:Name>
          </cac:Item>
          <cac:Price>
          <cbc:PriceAmount currencyID=`+JSON.stringify(all.currencyID)+`>`+lines.PriceAmount+`</cbc:PriceAmount>
          </cac:Price>
          </cac:InvoiceLine>`)

        }


      }

      
      // * Kdv Toplamı
      let TaxAmount = ` <cbc:TaxAmount currencyID=`+JSON.stringify(all.currencyID)+`>337.00</cbc:TaxAmount>`

      // * Kdv 8 oranı 
      let kdv8 = `
      <cac:TaxSubtotal>
        <cbc:TaxableAmount currencyID=`+JSON.stringify(all.currencyID)+`>`+all.kdv8TaxableAmount+`</cbc:TaxableAmount>
        <cbc:TaxAmount currencyID=`+JSON.stringify(all.currencyID)+`>`+all.kdv8TaxAmount+`</cbc:TaxAmount>
        <cbc:CalculationSequenceNumeric>`+all.kdv8CalculationSequenceNumeric+`</cbc:CalculationSequenceNumeric>
        <cbc:Percent>`+all.kdv8Percent+`</cbc:Percent>
        <cac:TaxCategory>
        `+ortak+`
          <cac:TaxScheme>
            <cbc:Name>`+all.kdv8TaxCategoryTaxSchemeName+`</cbc:Name>
            <cbc:TaxTypeCode>`+all.kdv8TaxCategoryTaxSchemeTaxTypeCode+`</cbc:TaxTypeCode>
          </cac:TaxScheme>
        </cac:TaxCategory>
      </cac:TaxSubtotal>
      `

      // * Kdv 1 oranı 
      let kdv1 = `
      <cac:TaxSubtotal>
        <cbc:TaxableAmount currencyID=`+JSON.stringify(all.currencyID)+`>`+all.kdv1TaxableAmount+`</cbc:TaxableAmount>
        <cbc:TaxAmount currencyID=`+JSON.stringify(all.currencyID)+`>`+all.kdv1TaxAmount+`</cbc:TaxAmount>
        <cbc:CalculationSequenceNumeric>`+all.kdv1CalculationSequenceNumeric+`</cbc:CalculationSequenceNumeric>
        <cbc:Percent>`+all.kdv1Percent+`</cbc:Percent>
        <cac:TaxCategory>
        `+ortak+`
          <cac:TaxScheme>
            <cbc:Name>`+all.kdv1TaxCategoryTaxSchemeName+`</cbc:Name>
            <cbc:TaxTypeCode>`+all.kdv1TaxCategoryTaxSchemeTaxTypeCode+`</cbc:TaxTypeCode>
          </cac:TaxScheme>
        </cac:TaxCategory>
      </cac:TaxSubtotal>
      `


      // * Kdv 18 oranı 
      let kdv18 = `
      <cac:TaxSubtotal>
        <cbc:TaxableAmount currencyID=`+JSON.stringify(all.currencyID)+`>`+all.kdv18TaxableAmount+`</cbc:TaxableAmount>
        <cbc:TaxAmount currencyID=`+JSON.stringify(all.currencyID)+`>`+all.kdv18TaxAmount+`</cbc:TaxAmount>
        <cbc:CalculationSequenceNumeric>`+all.kdv18CalculationSequenceNumeric+`</cbc:CalculationSequenceNumeric>
        <cbc:Percent>`+all.kdv18Percent+`</cbc:Percent>
        <cac:TaxCategory>
        `+ortak+`
          <cac:TaxScheme>
            <cbc:Name>`+all.kdv18TaxCategoryTaxSchemeName+`</cbc:Name>
            <cbc:TaxTypeCode>`+all.kdv18TaxCategoryTaxSchemeTaxTypeCode+`</cbc:TaxTypeCode>
          </cac:TaxScheme>
        </cac:TaxCategory>
      </cac:TaxSubtotal>
      `


      // * Kdv 0 oranı 
      let kdv0 = `
      <cac:TaxSubtotal>
        <cbc:TaxableAmount currencyID=`+JSON.stringify(all.currencyID)+`>`+all.kdv0TaxableAmount+`</cbc:TaxableAmount>
        <cbc:TaxAmount currencyID=`+JSON.stringify(all.currencyID)+`>`+all.kdv0TaxAmount+`</cbc:TaxAmount>
        <cbc:CalculationSequenceNumeric>`+all.kdv0CalculationSequenceNumeric+`</cbc:CalculationSequenceNumeric>
        <cbc:Percent>`+all.kdv0Percent+`</cbc:Percent>
        <cac:TaxCategory>
          `+ortak+`
          <cac:TaxScheme>
            <cbc:Name>`+all.kdv0TaxCategoryTaxSchemeName+`</cbc:Name>
            <cbc:TaxTypeCode>`+all.kdv0TaxCategoryTaxSchemeTaxTypeCode+`</cbc:TaxTypeCode>
          </cac:TaxScheme>
        </cac:TaxCategory>
      </cac:TaxSubtotal>
      `


      // * Dovizli Satış
      let doviz = `
      <cac:PricingExchangeRate>
        <cbc:SourceCurrencyCode listAgencyName="United Nations Economic Commission for Europe" listID="ISO 4217 Alpha" listName="Currency" listVersionID="2001">`+all.dovizPricingExchangeRateSourceCurrencyCode+`</cbc:SourceCurrencyCode>
        <cbc:TargetCurrencyCode listAgencyName="United Nations Economic Commission for Europe" listID="ISO 4217 Alpha" listName="Currency" listVersionID="2001">`+all.dovizPricingExchangeRateTargetCurrencyCode+`</cbc:TargetCurrencyCode>
        <cbc:CalculationRate>`+all.dovizPricingExchangeRateCalculationRate+`</cbc:CalculationRate>
      </cac:PricingExchangeRate>
      `


      // * Bedelsiz (%100) İskonto
      let bedelsizIsk = `
      <cac:AllowanceCharge>
        <cbc:ChargeIndicator>`+all.bedelsizIskAllowanceChargeChargeIndicator+`</cbc:ChargeIndicator>
        <cbc:AllowanceChargeReason>`+all.bedelsizIskAllowanceAllowanceChargeReason+`</cbc:AllowanceChargeReason>
        <cbc:SequenceNumeric>`+all.bedelsizIskAllowanceSequenceNumeric+`</cbc:SequenceNumeric>
        <cbc:Amount currencyID="TRY">`+all.bedelsizIskAllowanceAmount+`</cbc:Amount>
        <cbc:BaseAmount currencyID="TRY">`+all.bedelsizIskAllowanceBaseAmount+`</cbc:BaseAmount>
      </cac:AllowanceCharge>
      `


      // * Satırda Çoklu İskontolu Satış Faturası
      let satirCkIsk = `
      <cac:AllowanceCharge>
      <cbc:ChargeIndicator>`+all.satirCkIskAllowanceChargeChargeIndicator+`</cbc:ChargeIndicator>
      <cbc:AllowanceChargeReason>`+all.satirCkIskAllowanceChargeAllowanceChargeReason+`</cbc:AllowanceChargeReason>
      <cbc:Amount currencyID="TRY">`+all.satirCkIskAllowanceChargeAmount+`</cbc:Amount>
      </cac:AllowanceCharge>
      `


      // * Tevkifatlı Fatura Kesme Durumu
      let tevkifat = `
        <cac:WithholdingTaxTotal>
        <cbc:TaxAmount currencyID="TRY">`+all.tevkifatWithholdingTaxTotalTaxAmount+`</cbc:TaxAmount>
        <cac:TaxSubtotal>
        <cbc:TaxableAmount currencyID="TRY">`+all.tevkifatWithholdingTaxTotalTaxableAmount+`</cbc:TaxableAmount>
        <cbc:TaxAmount currencyID="TRY">`+all.tevkifatWithholdingTaxTotalTaxAmount2+`</cbc:TaxAmount>
        <cbc:Percent>`+all.tevkifatWithholdingTaxTotalPercent+`</cbc:Percent>
        <cac:TaxCategory>
        <cac:TaxScheme>
        <cbc:Name>`+all.tevkifatWithholdingTaxTotalTaxCategoryTaxSchemeName+`</cbc:Name>
        <cbc:TaxTypeCode>`+all.tevkifatWithholdingTaxTotalTaxCategoryTaxSchemeTaxTypeCode+`</cbc:TaxTypeCode>
        </cac:TaxScheme>
        </cac:TaxCategory>
        </cac:TaxSubtotal>
        </cac:WithholdingTaxTotal>
      `

      // * Normal Fatura Gönderilirken (İhracat Istisna Fatuarları Hariç)
      let AccountingCustomerPartyNormal = `
                <cac:AccountingCustomerParty>
                <cac:Party>
                  <cbc:WebsiteURI >`+all.AcpWebsiteURI+`</cbc:WebsiteURI>
                  <cac:PartyIdentification>
                    <cbc:ID schemeID="VKN">`+all.AcpVKN+`</cbc:ID>
                  </cac:PartyIdentification>
                  <cac:PartyName>
                    <cbc:Name>`+all.AcpName+`</cbc:Name>
                  </cac:PartyName>
                  <cac:PostalAddress>
                    <cbc:StreetName>`+all.AcpStreetName+`</cbc:StreetName>
                    <cbc:BuildingName >`+all.AcpBuildingName+`</cbc:BuildingName>
                    <cbc:BuildingNumber />
                    <cbc:CitySubdivisionName>`+all.AcpCitySubdivisionName+`</cbc:CitySubdivisionName>
                    <cbc:CityName>`+all.AcpCityName+`</cbc:CityName>
                    <cbc:PostalZone />
                    <cbc:Region />
                    <cac:Country>
                      <cbc:Name>`+all.AcpCountryName+`</cbc:Name>
                    </cac:Country>
                  </cac:PostalAddress>
                  <cac:PartyTaxScheme>
                    <cac:TaxScheme>
                      <cbc:Name>`+all.AcpPartyTaxSchemeName+`</cbc:Name>
                    </cac:TaxScheme>
                  </cac:PartyTaxScheme>
                  <cac:Contact>
                    <cbc:Telephone>`+all.AcpContactTelephone+`</cbc:Telephone>
                    <cbc:Telefax>`+all.AcpContactTelefax+`</cbc:Telefax>
                    <cbc:ElectronicMail>`+all.AcpContactElectronicMail+`</cbc:ElectronicMail>
                  </cac:Contact>
                </cac:Party>
              </cac:AccountingCustomerParty>
      ` 

      // * ihracat istisna faturası kesme 
      let AccountingCustomerPartyIhracat = `
      
          <cac:AccountingCustomerParty>
          <cac:Party>
            <cac:PartyIdentification>
              <cbc:ID schemeID="VKN">1460415308</cbc:ID>
            </cac:PartyIdentification>
            <cac:PartyName>
              <cbc:Name>Gümrük ve Ticaret Bakanlığı Gümrükler Genel Müdürlüğü- Bilgi İşlem Dairesi Başkanlığı</cbc:Name>
            </cac:PartyName>
            <cac:PostalAddress>
              <cbc:BuildingName />
              <cbc:BuildingNumber />
              <cbc:CitySubdivisionName />
              <cbc:CityName>ANKARA</cbc:CityName>
              <cac:Country>
                <cbc:Name>Türkiye</cbc:Name>
              </cac:Country>
            </cac:PostalAddress>
            <cac:PartyTaxScheme>
              <cac:TaxScheme>
                <cbc:Name>ULUS</cbc:Name>
              </cac:TaxScheme>
            </cac:PartyTaxScheme>
            <cac:Contact />
          </cac:Party>
        </cac:AccountingCustomerParty>

        <cac:BuyerCustomerParty>
        <cac:Party>
          <cac:PartyIdentification>
            <cbc:ID schemeID="PARTYTYPE">EXPORT</cbc:ID>
          </cac:PartyIdentification>
          <cac:PartyName>
            <cbc:Name>İZİBİZ BİLİŞİM TEKNOLOJİLERİ ANONİM ŞİRKETİ</cbc:Name>
          </cac:PartyName>
          <cac:PostalAddress>
            <cbc:StreetName>İSTANBUL MALTEPE</cbc:StreetName>
            <cbc:BuildingName />
            <cbc:BuildingNumber />
            <cbc:CitySubdivisionName />
            <cbc:CityName>İSTANBUL</cbc:CityName>
            <cac:Country>
              <cbc:Name>TÜRKİYE</cbc:Name>
            </cac:Country>
          </cac:PostalAddress>
          <cac:PartyLegalEntity>
            <cbc:RegistrationName>İZİBİZ BİLİŞİM TEKNOLOJİLERİ ANONİM ŞİRKETİ</cbc:RegistrationName>
            <cbc:CompanyID>2222222222</cbc:CompanyID>
          </cac:PartyLegalEntity>
        </cac:Party>
      </cac:BuyerCustomerParty>
    
      <cac:Delivery>
        <cac:Shipment>
          <cbc:ID />
          <cbc:InsuranceValueAmount currencyID="TRY">0.00</cbc:InsuranceValueAmount>
          <cbc:DeclaredForCarriageValueAmount currencyID="TRY">0.00</cbc:DeclaredForCarriageValueAmount>
        </cac:Shipment>
      </cac:Delivery>


      `

      // * İade Faturası Kesme 
      let iadeDataList:any = []
      if (all.iadeBillingReference != undefined) {

        let iadeList = JSON.parse(all.iadeBillingReference)

        for (let iade = 0; iade < iadeList.length; iade++) {
          const ia = iadeList[iade];
  
          let iadeData = `
            <cac:BillingReference>
            <cac:InvoiceDocumentReference>
            <cbc:ID>`+ia.iadeInvoiceDocumentReferenceID+`</cbc:ID>
            <cbc:IssueDate>`+ia.iadeInvoiceDocumentReferenceIssueDate+`</cbc:IssueDate>
            <cbc:DocumentTypeCode>`+ia.iadeInvoiceDocumentReferenceDocumentTypeCode+`</cbc:DocumentTypeCode>
            </cac:InvoiceDocumentReference>
            </cac:BillingReference>
          `

          iadeDataList.push(iadeData)

        }

      }

      
      let obj:any = {}
      obj.uuid = all.uuid
      obj.id = all.invoiceID
      obj.line = daf

      // * Kesilen Faturanın Seneryosu
      obj.ProfileID = all.ProfileID

      // * Kesilen Faturanın Tipi
      obj.InvoiceTypeCode = all.InvoiceTypeCode


      // ******************** Fatura Bilgileri Alanları *****************

      // * Kopya Göstergesi
      obj.CopyIndicator = all.CopyIndicator

      // * IssueDate - Veriliş Tarihi
      obj.IssueDate = all.IssueDate

      // * IssueTime - Veriliş Saati
      obj.IssueTime = all.IssueTime

      // * Note - Fatura Not Alanı
      obj.Note = all.Note

      // * DocumentCurrencyCode - Belge Para Birimi Kodu
      obj.DocumentCurrencyCode = all.DocumentCurrencyCode

      // * LineCountNumeric - Satır Sayısı Sayısal
      obj.LineCountNumeric = all.LineCountNumeric

      // * DocumentType - Döküman Tipi
      obj.DocumentType = all.DocumentType

      // * SignatureVKN_TCKN - Mali Mühür İmza -  VKN_TCKN
      obj.SignatureVKN_TCKN = all.SignatureVKN_TCKN
      
      // * SignatureVKN - Mali Mühür İmza -  VKN
      obj.SignatureVKN = all.SignatureVKN

      // * SignatureStreetName - Mali Mühür İmza -  Sokak adı
      obj.SignatureStreetName = all.SignatureStreetName

      // * SignatureBuildingNumber - Mali Mühür İmza -  Bina numarası
      obj.SignatureBuildingNumber = all.SignatureBuildingNumber

      // * SignatureCitySubdivisionName - Mali Mühür İmza -  İlçe
      obj.SignatureCitySubdivisionName = all.SignatureCitySubdivisionName

      // * SignatureCityName - Mali Mühür İmza -  Şehir
      obj.SignatureCityName = all.SignatureCityName

      // * SignaturePostalZone - Mali Mühür İmza -  Posta Kodu
      obj.SignaturePostalZone = all.SignaturePostalZone

      // * SignatureRegion - Mali Mühür İmza -  Bölge
      obj.SignatureRegion = all.SignatureRegion

      // * SignatureCountryName - Mali Mühür İmza -  Ülke Kodu
      obj.SignatureCountryName = all.SignatureCountryName

      // * SignatureURI - Mali Mühür İmza
      obj.SignatureURI = all.SignatureURI


      // * -------------- Satıcı Bilgileri -----------------

      // * AspWebsiteURI - Satıcı - Website URI
      obj.AspWebsiteURI = all.AspWebsiteURI

      // * AspVKN Satıcı - VKN
      obj.AspVKN = all.AspVKN

      // * AspMERSISNO - Satıcı - MERSISNO
      obj.AspMERSISNO = all.AspMERSISNO

      // * AspTICARETSICILNO -Satıcı - TICARETSICILNO 
      obj.AspTICARETSICILNO = all.AspTICARETSICILNO

      // * AspName - Satıcı - Firma Adı
      obj.AspName = all.AspName

      // * AspStreetName - Satıcı - Sokak Adı
      obj.AspStreetName = all.AspStreetName

      // * AspBuildingNumber - Satıcı - Sokak Numarası
      obj.AspBuildingNumber = all.AspBuildingNumber

      // * AspCitySubdivisionName - Satıcı - İlçe
      obj.AspCitySubdivisionName = all.AspCitySubdivisionName

      // * AspCityName - Satıcı - İl
      obj.AspCityName = all.AspCityName

      // * AspPostalZone - Satıcı - Posta Kodu
      obj.AspPostalZone = all.AspPostalZone

      // * AspRegion - Satıcı - Bölge
      obj.AspRegion = all.AspRegion

      // * AspCountryName - Satıcı - Ülke Kodu
      obj.AspCountryName = all.AspCountryName

      // * AspPartyTaxSchemeName - Satıcı - Vergi Dairesi 
      obj.AspPartyTaxSchemeName = all.AspPartyTaxSchemeName

      // * AspContactTelephone - Satıcı - Telefon
      obj.AspContactTelephone = all.AspContactTelephone

      // * AspContactTelefax - Satıcı - Fax
      obj.AspContactTelefax = all.AspContactTelefax

      // * AspContactElectronicMail - Satıcı - Email
      obj.AspContactElectronicMail = all.AspContactElectronicMail

      // * -------------- Alıcı Bilgileri -----------------



















      // * Ihracat Durumu
      if (all.ProfileID == 'IHRACAT' && all.InvoiceTypeCode == 'ISTISNA') {
        obj.AccountingCustomerParty = AccountingCustomerPartyIhracat
      }else {
        obj.AccountingCustomerParty = AccountingCustomerPartyNormal
      }


      // * Kdv Toplamını Gönderir
      obj.TaxAmount = TaxAmount

      // * Fatura Para birimi Cinsi
      obj.currencyID = all.currencyID

      // * Kdv %8 
      if (all.kdv8TaxableAmount != undefined) {
        obj.kdv8 = kdv8
      }else {
        obj.kdv8 = ''
      }

      // * Kdv %1 
      if (all.kdv1TaxableAmount != undefined) {
        obj.kdv1 = kdv1
      }else {
        obj.kdv1 = ''
      }

      // * Kdv %18
      if (all.kdv18TaxableAmount != undefined) {
        obj.kdv18 = kdv18
      }else {
        obj.kdv18 = ''
      }

      // * Kdv %0
      if (all.kdv0TaxableAmount != undefined) {
        obj.kdv0 = kdv0
      }else {
        obj.kdv0 = ''
      }

      // * Doviz
      if (all.dovizPricingExchangeRateCalculationRate != undefined) {
        obj.doviz = doviz
      }else {
        obj.doviz = ''
      }

      // * Bedelsiz Satıs
      if(all.bedelsizIskAllowanceChargeChargeIndicator != undefined){
        obj.bedelsizIsk = bedelsizIsk
      }else {
        obj.bedelsizIsk = ''
      }


      // * Satırda Çoklu İskontolu Satış Faturası
      if (all.satirCkIskAllowanceChargeChargeIndicator != undefined) {
        obj.satirCkIsk = satirCkIsk
      }else {
        obj.satirCkIsk = ''
      }


      // * Tevkifatlı Fatura Kesme Durumu
      if(all.tevkifatWithholdingTaxTotalTaxAmount != undefined){
        obj.tevkifatWithholdingTaxTotal = tevkifat
      }else {
        obj.tevkifatWithholdingTaxTotal = ''
      }



      // * İade Faturası Kesme 
      if(iadeDataList.length != 0){
        console.log('data yı gönder')
        obj.iadeList = iadeDataList.join('')
      }else {
        console.log('boş veri gönder')
        obj.iadeList = ''
      }

  
      let temelFaturaXml = await xml.temelFatura(obj)
      let temelFaturaBase64 = await encode(temelFaturaXml)
      
      let pushData = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsdl="http://schemas.i2i.com/ei/wsdl">
            <soapenv:Header/>
            <soapenv:Body>
                <wsdl:SendInvoiceRequest>

                  <REQUEST_HEADER>
                        <SESSION_ID>`+all.SESSION_ID+`</SESSION_ID>
                        <APPLICATION_NAME>s</APPLICATION_NAME>
                        <COMPRESSED>N</COMPRESSED>
                  </REQUEST_HEADER>
          
                  <INVOICE>
                    <CONTENT>
                        `+ temelFaturaBase64 +`
                    </CONTENT>
                  </INVOICE>
                  
                </wsdl:SendInvoiceRequest>
            </soapenv:Body>
          </soapenv:Envelope>`
          
      var config = {
        method: 'post',
        url: 'https://efaturaws.izibiz.com.tr/EFaturaOIB?wsdl',
        headers: { 
          'Content-Type': 'text/xml'
        },
        data : pushData
      };
      
      let datas = await axios(config)

      console.log('********')
      console.log(datas)
      console.log('********')

      var result1 = convert.xml2json(datas.data, {
        compact: true,
        ignoreText:false,
        ignoreDoctype:false,
        ignoreCdata:true,
        ignoreComment:true,
        ignoreAttributes:true,
        ignoreInstruction:true,
        ignoreDeclaration:true,
        indentAttributes:true,
        fullTagEmptyElement:true,
        indentCdata:true,
        spaces: 4});

        let snc = replaceall("SOAP-ENV:", "", result1);

        snc = replaceall("_text", "text", snc);

      return response.status(200).send({
        status: 200,
        message: 'OK',
        response: JSON.parse(snc)
      })

  
    } catch (error) {


      await this.error_mail('faturaGonder',error)
      


      let xml = error.response.data

      var result1 = convert.xml2json(xml, {
        compact: true,
        ignoreText:false,
        ignoreDoctype:false,
        ignoreCdata:true,
        ignoreComment:true,
        ignoreAttributes:true,
        ignoreInstruction:true,
        ignoreDeclaration:true,
        indentAttributes:true,
        fullTagEmptyElement:true,
        indentCdata:true,
        spaces: 4});

        var original = result1
  
        let resp = replaceall("SOAP-ENV:", "", original);

        resp = replaceall("_text", "text", resp);

    

      return response.status(200).send({
        status: 500,
        message: 'OK',
        response: JSON.parse(resp)
      })

    }

  }

  // Fatura Görsel Okuma (GetInvoiceWithType)
  public async faturaGorselOkuma({
    response,
    request
  }: HttpContextContract) {

    try {

      console.log('İstek Geldi')

      let all = request.body()

      var soap = require('soap');
      var url = 'https://efaturaws.izibiz.com.tr/EInvoiceWS?wsdl';
      var args = {
        "REQUEST_HEADER": {
          "SESSION_ID": all.SESSION_ID,
          "APPLICATION_NAME": "s",
        },
        "INVOICE_SEARCH_KEY": {
          "ID":all.ID || "",
          "UUID":all.UUID || "",
          "TYPE": all.TYPE,
          "DIRECTION": all.DIRECTION,
          
        },
        "HEADER_ONLY": ""
      };

      const resp = new Promise((resolve, reject) => {

        soap.createClient(url, function (err, client) {
          if(err){
            reject(err)
          }
          client.GetInvoiceWithType(args, function (err, result) {
            if(err){
              reject(err)
            }
            resolve(result)
          });

        });
      });

      let data:any = await resp

      




      if (data != null && data.status == 500) {
       
        var result1 = convert.xml2json(data.data, {
          compact: true,
          ignoreText:false,
          ignoreDoctype:false,
          ignoreCdata:true,
          ignoreComment:true,
          ignoreAttributes:true,
          ignoreInstruction:true,
          ignoreDeclaration:true,
          indentAttributes:true,
          fullTagEmptyElement:true,
          indentCdata:true,
          spaces: 4});
    
          let snc = replaceall("SOAP-ENV:", "", result1);
    
          snc = replaceall("_text", "text", snc);
    
        return response.status(200).send({
          status: 200,
          message: 'OK',
          response: JSON.parse(snc)
        })
    
    
      }else if(data == null) {
        
        return response.status(200).send({
          status: 200,
          message: 'Fatura Bulunamadı',
          response: ''
        })
    
      }
      else {

        return response.status(200).send({
          status: 200,
          message: 'Fatura',
          response: data.INVOICE[0].CONTENT
        })
  
      }
      

    } catch (error) {

      console.log(error)



      await this.error_mail('faturaGorselOkuma',error)

      if (error.response != undefined) {

        let xml = error.response.data

        var result1 = convert.xml2json(xml, {
          compact: true,
          ignoreText:false,
          ignoreDoctype:false,
          ignoreCdata:true,
          ignoreComment:true,
          ignoreAttributes:true,
          ignoreInstruction:true,
          ignoreDeclaration:true,
          indentAttributes:true,
          fullTagEmptyElement:true,
          indentCdata:true,
          spaces: 4});
  
          var original = result1
    
          let resp = replaceall("SOAP-ENV:", "", original);
  
          resp = replaceall("_text", "text", resp);
  
      
  
        return response.status(400).send({
          status: 400,
          message: 'OK',
          response: JSON.parse(resp)
        })
  

      }else {

        return response.status(400).send({
          status: 400,
          message: 'Bir Sorun Oluştu',
          response: ''
        })

      }

    }

  }

  // * Fatura Taslak Sorgulama
  public async faturaTaslakSorgulama({
    response,
    request
  }: HttpContextContract) {

    try {

      let all = request.body()

      // * <INVOICE ID="......."></INVOICE> Bu veri ile oynama yapmayınız !!! İki invoice arasına data yazmayınız
      let pushData = `
      
          <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsdl="http://schemas.i2i.com/ei/wsdl" xmlns:xmime="http://www.w3.org/2005/05/xmlmime">
            <soapenv:Header/>
              <soapenv:Body>
                <wsdl:GetInvoiceStatusRequest>

                  <REQUEST_HEADER>
                    <SESSION_ID> `+all.SESSION_ID+` </SESSION_ID>
                  </REQUEST_HEADER>

                  <INVOICE ID=`+JSON.stringify(all.ID)+`></INVOICE>

                  </wsdl:GetInvoiceStatusRequest>
              </soapenv:Body>
          </soapenv:Envelope>
              
      `

      var config = {
        method: 'post',
        url: 'https://efaturaws.izibiz.com.tr/EFaturaOIB?wsdl',
        headers: { 
          'Content-Type': 'text/xml'
        },
        data : pushData
      };
      
      let datas = await axios(config)

      var result1 = convert.xml2json(datas.data, {
        compact: true,
        ignoreText:false,
        ignoreDoctype:false,
        ignoreCdata:true,
        ignoreComment:true,
        ignoreAttributes:true,
        ignoreInstruction:true,
        ignoreDeclaration:true,
        indentAttributes:true,
        fullTagEmptyElement:true,
        indentCdata:true,
        spaces: 4});

        let snc = replaceall("SOAP-ENV:", "", result1);

        snc = replaceall("_text", "text", snc);

        console.log('ok ok ok burada')

      return response.status(200).send({
        status: 200,
        message: 'OK',
        response: JSON.parse(snc)
      })

    } catch (error) {


      await this.error_mail('faturaTaslakSorgulama',error)
      
      let xml = error.response.data

      var result1 = convert.xml2json(xml, {
        compact: true,
        ignoreText:false,
        ignoreDoctype:false,
        ignoreCdata:true,
        ignoreComment:true,
        ignoreAttributes:true,
        ignoreInstruction:true,
        ignoreDeclaration:true,
        indentAttributes:true,
        fullTagEmptyElement:true,
        indentCdata:true,
        spaces: 4});

        var original = result1
  
        let resp = replaceall("SOAP-ENV:", "", original);

        resp = replaceall("_text", "text", resp);

    

      return response.status(500).send({
        status: 500,
        message: 'OK',
        response: JSON.parse(resp)
      })
    }

  }

  // * E-Fatura Okuma (GetInvoice) 
  public async eFaturaOkuma({
    response,
    request
  }: HttpContextContract) {

    let all = request.body()



    try {

      console.log('e fatura okuma geldi')
     
      if (all.SESSION_ID == undefined) {
        
        return response.status(400).send({
          status: 400,
          message: 'SESSION_ID parametresi eksik',
          response: ''
        })

      }

      console.log('e fatura okuma geldi222222')

      let arr:any = []

      if(all.LIMIT != undefined){
        arr.push(`<LIMIT>`+all.LIMIT+`</LIMIT>`)
      }

      if(all.FROM != undefined){
        arr.push(`<FROM>`+all.FROM+`</FROM>`)
      }


      if(all.TO != undefined){
        arr.push(`<TO>`+all.TO+`</TO>`)
      }

      if(all.ID != undefined){
        arr.push(`<ID>`+all.ID+`</ID>`)
      }

      if (all.UUID != undefined) {
        arr.push(`<UUID>`+all.UUID+`</UUID>`)
      }


      if (all.DATE_TYPE != undefined) {
        arr.push(`<DATE_TYPE>`+all.DATE_TYPE+`</DATE_TYPE>`)
      }


      if (all.START_DATE != undefined) {
        arr.push(`<START_DATE>`+all.START_DATE+`</START_DATE>`)
      }


      if (all.END_DATE != undefined) {
        arr.push(`<END_DATE>`+all.END_DATE+`</END_DATE>`)
      }


      if (all.READ_INCLUDED != undefined) {
        arr.push(`<READ_INCLUDED>`+all.READ_INCLUDED+`</READ_INCLUDED>`)
      }


      if (all.DIRECTION != undefined) {
        arr.push(`<DIRECTION>`+all.DIRECTION+`</DIRECTION>`)
      }

      if (all.DRAFT_FLAG != undefined) {
        arr.push(`<DRAFT_FLAG>`+all.DRAFT_FLAG+`</DRAFT_FLAG>`)
      }

      console.log('------ 11111 --------')


      let pushData = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsdl="http://schemas.i2i.com/ei/wsdl">
      <soapenv:Header/>
      <soapenv:Body>
            <wsdl:GetInvoiceRequest>
              <REQUEST_HEADER>
                  <SESSION_ID>`+all.SESSION_ID+`</SESSION_ID>
                  <APPLICATION_NAME>dgn</APPLICATION_NAME>
                  <COMPRESSED>N</COMPRESSED>
              </REQUEST_HEADER>
              <INVOICE_SEARCH_KEY>

              `+arr.join('')+`
              
              </INVOICE_SEARCH_KEY>
                  
              <HEADER_ONLY>`+all.HEADER_ONLY+`</HEADER_ONLY>
            </wsdl:GetInvoiceRequest>
        </soapenv:Body>
      </soapenv:Envelope>`
  
      console.log('------ 2222222 --------')
      var config = {
        method: 'post',
        url: 'https://efaturaws.izibiz.com.tr/EInvoiceWS?wsdl',
        headers: { 
          'Content-Type': 'text/xml'
        },
        data : pushData
      };

      console.log('------ 333333333 --------')
      
      let datas = await axios(config)
      console.log('------ 444444 --------')
     
      var result1 = convert.xml2json(datas.data, {
        compact: true,
        ignoreText:false,
        ignoreDoctype:true,
        ignoreCdata:true,
        ignoreComment:true,
        spaces: 2});

        let snc = replaceall("SOAP-ENV:", "", result1);
  
        snc = replaceall("_text", "text", snc);
        snc = replaceall("_attributes", "attributes", snc);

        let parseData = JSON.parse(snc)

        let arrInv = parseData.Envelope.Body.GetInvoiceResponse.INVOICE
      
        if (arrInv == undefined) {

          return response.status(200).send({
            status: 200,
            message: 'OK',
            response: ''
          })

        }

        let fullData:any = []
        let dd:any = {}


        if (Array.isArray(arrInv) == true) {
        
          for (let fr = 0; fr < arrInv.length; fr++) {
            const element = arrInv[fr]; 



            let contentText = "";
            
              if (all.HEADER_ONLY == 'N') {
                var decodedStringAtoB:any =  Buffer.from(element.CONTENT.text, 'base64').toString('utf8');
                contentText = await xmlToJson.xmltoJson(decodedStringAtoB)
          
              }

              
              let obj:any = {}
              obj.HEADER = element.HEADER
              obj.CONTENT = contentText

              

              fullData.push({
                ID:element.attributes.ID,
                UUID:element.attributes.UUID,
                CURRENCY_TYPE:obj.CONTENT.faturaBilgileri?.paraBirimi,
                SENDER:element.HEADER.SENDER.text,
                RECEIVER:element.HEADER.RECEIVER.text,
                SUPPLIER:element.HEADER.SUPPLIER.text,
                CUSTOMER:element.HEADER.CUSTOMER.text,
                ISSUE_DATE:element.HEADER.ISSUE_DATE.text,
                PAYABLE_AMOUNT:element.HEADER.PAYABLE_AMOUNT.text,
                FROM:element.HEADER?.FROM?.text,
                TO:element.HEADER?.TO?.text,
                PROFILEID:element.HEADER.PROFILEID.text,
                INVOICE_TYPE_CODE:element.HEADER.INVOICE_TYPE_CODE.text,
                STATUS:element.HEADER.STATUS.text,
                STATUS_DESCRIPTION:element.HEADER.STATUS_DESCRIPTION.text,
                GIB_STATUS_CODE:element.HEADER.GIB_STATUS_CODE.text,
                GIB_STATUS_DESCRIPTION:element.HEADER.GIB_STATUS_DESCRIPTION.text,
                CDATE:element.HEADER.CDATE.text,
                ENVELOPE_IDENTIFIER:element.HEADER?.ENVELOPE_IDENTIFIER?.text,
                STATUS_CODE:element.HEADER.STATUS_CODE.text,
                CONTENT:contentText
              })

            

          }

        }else {         
          
          
 
          if (arrInv.length != 0) {

    
   

            dd.HEADER = arrInv.HEADER
            if (all.HEADER_ONLY != 'Y') {
              
              var decodedStringAtoB:any = Buffer.from(arrInv.CONTENT.text, 'base64').toString('utf8');
              let contentText = await xmlToJson.xmltoJson(decodedStringAtoB)
              dd.CONTENT = contentText
          
              
              return response.status(200).send({
                status: 200,
                message: 'OK',
                response: [{
                  ID:arrInv.attributes.ID,
                  CURRENCY_TYPE:dd.CONTENT.faturaBilgileri?.paraBirimi,
                  UUID:arrInv.attributes.UUID,
                  SENDER:dd.HEADER.SENDER.text,
                  RECEIVER:dd.HEADER.RECEIVER.text,
                  SUPPLIER:dd.HEADER.SUPPLIER.text,
                  CUSTOMER:dd.HEADER.CUSTOMER.text,
                  ISSUE_DATE:dd.HEADER.ISSUE_DATE.text,
                  PAYABLE_AMOUNT:dd.HEADER.PAYABLE_AMOUNT.text,
                  FROM:dd.HEADER.FROM.text,
                  TO:dd.HEADER.TO.text,
                  PROFILEID:dd.HEADER.PROFILEID.text,
                  INVOICE_TYPE_CODE:dd.HEADER.INVOICE_TYPE_CODE.text,
                  STATUS:dd.HEADER.STATUS.text,
                  STATUS_DESCRIPTION:dd.HEADER.STATUS_DESCRIPTION.text,
                  GIB_STATUS_CODE:dd.HEADER.GIB_STATUS_CODE.text,
                  GIB_STATUS_DESCRIPTION:dd.HEADER.GIB_STATUS_DESCRIPTION.text,
                  CDATE:dd.HEADER.CDATE.text,
                  ENVELOPE_IDENTIFIER:dd.HEADER.ENVELOPE_IDENTIFIER.text,
                  STATUS_CODE:dd.HEADER.STATUS_CODE.text,
                  CONTENT:contentText
                }]
              })

            }else {

      

              return response.status(200).send({
                status: 200,
                message: 'OK',
                response: [{
                  ID:arrInv.attributes.ID,
                  UUID:arrInv.attributes.UUID,
                  SENDER:dd.HEADER.SENDER.text,
                  RECEIVER:dd.HEADER.RECEIVER.text,
                  SUPPLIER:dd.HEADER.SUPPLIER.text,
                  CUSTOMER:dd.HEADER.CUSTOMER.text,
                  ISSUE_DATE:dd.HEADER.ISSUE_DATE.text,
                  PAYABLE_AMOUNT:dd.HEADER.PAYABLE_AMOUNT.text,
                  FROM:dd.HEADER.FROM.text,
                  TO:dd.HEADER.TO.text,
                  PROFILEID:dd.HEADER.PROFILEID.text,
                  INVOICE_TYPE_CODE:dd.HEADER.INVOICE_TYPE_CODE.text,
                  STATUS:dd.HEADER.STATUS.text,
                  STATUS_DESCRIPTION:dd.HEADER.STATUS_DESCRIPTION.text,
                  GIB_STATUS_CODE:dd.HEADER.GIB_STATUS_CODE.text,
                  GIB_STATUS_DESCRIPTION:dd.HEADER.GIB_STATUS_DESCRIPTION.text,
                  CDATE:dd.HEADER.CDATE.text,
                  ENVELOPE_IDENTIFIER:dd.HEADER.ENVELOPE_IDENTIFIER.text,
                  STATUS_CODE:dd.HEADER.STATUS_CODE.text,
                  CONTENT:''
                }]
              })

            }
           

          }else {

            return response.status(200).send({
                status: 200,
                message: 'OK',
                response: parseData
            })

          }
          

        }



        

  
      return response.status(200).send({
        status: 200,
        message: 'OK',
        response: fullData
      })
  
    } catch (error) {

      console.log('hATA BURADAS',error)
      
      if (error.response) {
        
        let xml = error.response.data

      var result1 = convert.xml2json(xml, {
        compact: true,
        ignoreText:false,
        ignoreDoctype:false,
        ignoreCdata:true,
        ignoreComment:true,
        ignoreAttributes:true,
        ignoreInstruction:true,
        ignoreDeclaration:true,
        indentAttributes:true,
        fullTagEmptyElement:true,
        indentCdata:true,
        spaces: 4});

        var original = result1
  
        let resp = replaceall("SOAP-ENV:", "", original);

        resp = replaceall("_text", "text", resp);

    

      return response.status(200).send({
        status: 500,
        message: 'OK',
        response: JSON.parse(resp)
      })

      }
      

      return response.status(200).send({
        status: 500,
        message: 'OK',
        response: (error.message)
      })

      
    }





  }

  // * Okundu Olarak İşaretleme
  public async faturaOkunduIsaretleme({
    response,
    request
  }: HttpContextContract) {

    try {

      let all = request.body()

      if (all.ID == null) {

        return response.status(200).send({
          status: 200,
          message: 'SESSION_ID - ID Veriler Boş gelemez veya Eksik paramere ',
          response: ''
        })

      }


      let pushData = `
      
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsdl="http://schemas.i2i.com/ei/wsdl">
      <soapenv:Header/>
      <soapenv:Body>
         <wsdl:MarkInvoiceRequest>
            <REQUEST_HEADER>
                  <SESSION_ID>`+all.SESSION_ID+`</SESSION_ID>
                  <APPLICATION_NAME>MarkInvoiceRequest</APPLICATION_NAME>
            </REQUEST_HEADER>
          <MARK>
              <INVOICE ID="`+all.ID+`" ></INVOICE>
          </MARK>
         </wsdl:MarkInvoiceRequest>
      </soapenv:Body>
   </soapenv:Envelope>
              
      `

      var config = {
        method: 'post',
        url: 'https://efaturaws.izibiz.com.tr/EFaturaOIB?wsdl',
        headers: { 
          'Content-Type': 'text/xml'
        },
        data : pushData
      };
      
      let datas = await axios(config)

      var result1 = convert.xml2json(datas.data, {
        compact: true,
        ignoreText:false,
        ignoreDoctype:false,
        ignoreCdata:true,
        ignoreComment:true,
        ignoreAttributes:true,
        ignoreInstruction:true,
        ignoreDeclaration:true,
        indentAttributes:true,
        fullTagEmptyElement:true,
        indentCdata:true,
        spaces: 4});

        let snc = replaceall("SOAP-ENV:", "", result1);

        snc = replaceall("_text", "text", snc);

        console.log('ok ok ok burada')

      return response.status(200).send({
        status: 200,
        message: 'OK',
        response: JSON.parse(snc)
      })

    } catch (error) {

      await this.error_mail('faturaOkunduIsaretleme',error)

      let xml = error.response.data

      var result1 = convert.xml2json(xml, {
        compact: true,
        ignoreText:false,
        ignoreDoctype:false,
        ignoreCdata:true,
        ignoreComment:true,
        ignoreAttributes:true,
        ignoreInstruction:true,
        ignoreDeclaration:true,
        indentAttributes:true,
        fullTagEmptyElement:true,
        indentCdata:true,
        spaces: 4});

        var original = result1
  
        let resp = replaceall("SOAP-ENV:", "", original);

        resp = replaceall("_text", "text", resp);

    

      return response.status(500).send({
        status: 500,
        message: 'OK',
        response: JSON.parse(resp)
      })
    }
  }
  
  // * Toplu Fatura Sorgulama
  public async topluSorgulama({
    response,
    request
  }: HttpContextContract) {

    try {

      let all = request.body()


      if (all.UUID == null) {

        return response.status(200).send({
          status: 200,
          message: 'SESSION_ID - ID Veriler Boş gelemez veya eksik parametre',
          response: ''
        })

      }

      let searchData:any = []
      let arrParse = JSON.parse(all.UUID)

      for (let i = 0; i < arrParse.length; i++) {
        const element = arrParse[i];
        let data = `<UUID>`+element+`</UUID>`
        searchData.push(data)
      }

      let pushData = `
          <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsdl="http://schemas.i2i.com/ei/wsdl" xmlns:xmime="http://www.w3.org/2005/05/xmlmime">
            <soapenv:Header/>
              <soapenv:Body>
                <wsdl:GetInvoiceStatusAllRequest>

                  <REQUEST_HEADER>
                    <SESSION_ID> `+all.SESSION_ID+` </SESSION_ID>
                  </REQUEST_HEADER>
      
                  `+searchData.join('')+`

                  </wsdl:GetInvoiceStatusAllRequest>
              </soapenv:Body>
          </soapenv:Envelope>    
      `

      var config = {
        method: 'post',
        url: 'https://efaturaws.izibiz.com.tr/EInvoiceWS?wsdl',
        headers: { 
          'Content-Type': 'text/xml'
        },
        data : pushData
      };
      
      let datas = await axios(config)

      var result1 = convert.xml2json(datas.data, {
        compact: true,
        ignoreText:false,
        ignoreDoctype:true,
        ignoreCdata:true,
        ignoreComment:true,
        spaces: 2});

        let snc = replaceall("SOAP-ENV:", "", result1);
        snc = replaceall("_text", "text", snc);
        snc = replaceall("_attributes", "attributes", snc);

        let parseData = JSON.parse(snc)
        let arr = parseData.Envelope.Body.GetInvoiceStatusAllResponse.INVOICE_STATUS
        let dats:any = []

        if (Array.isArray(parseData.Envelope.Body.GetInvoiceStatusAllResponse.INVOICE_STATUS) == true) {
         
          for (let kl = 0; kl < arr.length; kl++) {

            const element = arr[kl];

           

            let obj:any = {}
            obj.ID = element.attributes.ID,
            obj.UUID = element.attributes.UUID,
            obj.STATUS = element.HEADER.STATUS.text
            obj.STATUS_DESCRIPTION = element.HEADER.STATUS_DESCRIPTION.text
            obj.GIB_STATUS_CODE = element.HEADER.GIB_STATUS_CODE.text
            obj.GIB_STATUS_DESCRIPTION = element.HEADER.GIB_STATUS_DESCRIPTION.text
            obj.DIRECTION = element.HEADER.DIRECTION.text
            obj.CDATE = element.HEADER.CDATE.text
            obj.ENVELOPE_IDENTIFIER = element.HEADER.ENVELOPE_IDENTIFIER?.text
            obj.STATUS_CODE = element.HEADER.STATUS_CODE?.text

            dats.push(obj)

           
          }

        }else {

          let obj:any = {}

       
          obj.ID = parseData.Envelope.Body.GetInvoiceStatusAllResponse.INVOICE_STATUS.attributes.ID
          obj.UUID = parseData.Envelope.Body.GetInvoiceStatusAllResponse.INVOICE_STATUS.attributes.UUID
          obj.STATUS = parseData.Envelope.Body.GetInvoiceStatusAllResponse.INVOICE_STATUS.HEADER.STATUS.text
          obj.STATUS_DESCRIPTION = parseData.Envelope.Body.GetInvoiceStatusAllResponse.INVOICE_STATUS.HEADER.STATUS_DESCRIPTION.text
          obj.GIB_STATUS_CODE = parseData.Envelope.Body.GetInvoiceStatusAllResponse.INVOICE_STATUS.HEADER.GIB_STATUS_CODE.text
          obj.GIB_STATUS_DESCRIPTION = parseData.Envelope.Body.GetInvoiceStatusAllResponse.INVOICE_STATUS.HEADER.GIB_STATUS_DESCRIPTION.text
          obj.DIRECTION = parseData.Envelope.Body.GetInvoiceStatusAllResponse.INVOICE_STATUS.HEADER.DIRECTION.text
          obj.CDATE = parseData.Envelope.Body.GetInvoiceStatusAllResponse.INVOICE_STATUS.HEADER.CDATE.text
          obj.ENVELOPE_IDENTIFIER = parseData.Envelope.Body.GetInvoiceStatusAllResponse.INVOICE_STATUS.HEADER.ENVELOPE_IDENTIFIER.text
          obj.STATUS_CODE = parseData.Envelope.Body.GetInvoiceStatusAllResponse.INVOICE_STATUS.HEADER.STATUS_CODE.text

          dats.push(obj)

        
        }
        

  
      return response.status(200).send({
        status: 200,
        message: 'OK',
        response: dats
      })

    } catch (error) {

      console.log('errrror----->',error)

      await this.error_mail('topluSorgulama',error)
      
      if (error.response != undefined) {

        let xml = error.response.data

        var result1 = convert.xml2json(xml, {
          compact: true,
          ignoreText:false,
          ignoreDoctype:false,
          ignoreCdata:true,
          ignoreComment:true,
          ignoreAttributes:true,
          ignoreInstruction:true,
          ignoreDeclaration:true,
          indentAttributes:true,
          fullTagEmptyElement:true,
          indentCdata:true,
          spaces: 4});
  
          var original = result1
    
          let resp = replaceall("SOAP-ENV:", "", original);
  
          resp = replaceall("_text", "text", resp);

          return response.status(400).send({
            status: 400,
            message: 'OK',
            response: JSON.parse(resp)
            
        })
  
      }else {

        return response.status(400).send({
          status: 400,
          message: 'Bir Sorun Oluştu',
          response: ''
        })

      }


    }

  }
  
  // * Fatura Okuma pdf-html-xml indirme
  public async download({
    response,
    request
  }: HttpContextContract){

    try {

      let all = request.body()



      let search:any = {}

      if (all.ID != undefined) {
        search.ID = all.ID
      }else if(all.ID == undefined){

        return response.status(200).send({
          status: 200,
          message: 'Paremetre eksik veya boş gelemez (ID)',
          response:''
        })

      } 

      if (all.UUID != undefined) {
        search.UUID = all.UUID
      }

      if (all.TYPE != undefined) {
        search.TYPE = all.TYPE
      }

      if (all.DIRECTION != undefined) {
        search.DIRECTION = all.DIRECTION
      }


     


      var soap = require('soap');
        var url = 'https://efaturaws.izibiz.com.tr/EInvoiceWS?wsdl';
        var args = {
          "REQUEST_HEADER": {
            "SESSION_ID": all.SESSION_ID,
            "APPLICATION_NAME": "tiko",
          },
          "INVOICE_SEARCH_KEY":search,
          "HEADER_ONLY":"N"
        };

        const resp = new Promise((resolve, reject) => {

          soap.createClient(url, function (err, client) {
            if(err){
              reject(err)
            }

            client.GetInvoiceWithType(args, function (err, result) {
              if(err){
                reject(err)
              }
              resolve(result)
            });

          });
        });

        let data:any = await resp



        if (data != null && data.status == 500) {
       
          var result1 = convert.xml2json(data.data, {
            compact: true,
            ignoreText:false,
            ignoreDoctype:false,
            ignoreCdata:true,
            ignoreComment:true,
            ignoreAttributes:true,
            ignoreInstruction:true,
            ignoreDeclaration:true,
            indentAttributes:true,
            fullTagEmptyElement:true,
            indentCdata:true,
            spaces: 4});
    
            let snc = replaceall("SOAP-ENV:", "", result1);
    
            snc = replaceall("_text", "text", snc);
    
          return response.status(200).send({
            status: 200,
            message: 'OK',
            response: JSON.parse(snc)
          })
  
        }else {
         
        let name = all.UUID || all.ID




        if (data == null) {

          return response.status(200).send({
            status: 200,
            message: 'Veri Bulunamadı',
            response:''
          })

        }

       
        let buff = Buffer.from(data.INVOICE[0].CONTENT, 'base64'); 

        const pdf = new Promise((resolve, reject) => {
          fs.writeFile(Env.get('MAIN_PATH')+'faturalar/' +name+'.bin', buff, (err) => {
            if(err){
              reject(err)
            }
              return resolve(1)
          });
        });


        let check = await pdf
        let type = all.TYPE

        if (check == 1 ) {


          await extract(Env.get('MAIN_PATH')+'faturalar/' +name+'.bin', { dir: Env.get('MAIN_PATH')+'faturalar/' })
         
            const pdf = new Promise((resolve, reject) => {


            let fileContent = fs.readFileSync(Env.get('MAIN_PATH')+'faturalar/' +name+'.'+type.toLowerCase())
            

            let params:any = {}

            params.Bucket = 'eftr.net/efatura/pdf/'+Math.floor(Math.random() * 100000)
            params.Key = name+'.'+type.toLowerCase()
            
            if (all.TYPE == 'PDF') {

              params.ContentType = 'application/'+type.toLowerCase()
            }else {
              params.ContentType = 'text/'+type.toLowerCase()
            }

            
            params.Body = fileContent

            // const params = {
            //   Bucket: , // pass your bucket name
            //   Key: , // file will be saved as testBucket/contacts.csv
            //   ContentType: ,
            //   Body: 
            // };

            s3.upload(params, function(s3Err, data) {
              
                if (s3Err){
                  reject(s3Err)
                }
                console.log('--------->',data.Location)
                return resolve(data.Location)
            });

          });

          let lnk = (await pdf)
          return response.status(200).send({
            status: 200,
            message: 'OK',
            response: {
              url: lnk
            }
          })
          let text = lnk
          let result = ""//text.replace("https://", "");
          result = result.replace('"','')
          result = result.replace('"','')
          result = result.replace('s3.eu-central-1.amazonaws.com/','')
    

          var axios = require('axios');
          var vdata = JSON.stringify({
            "dynamicLinkInfo": {
              "domainUriPrefix": "https://tiko.link",
              "link": "https://"+result
            },
            "suffix": {
              "option": "SHORT"
            }
          });

          var config = {
            method: 'post',
            url: 'https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=AIzaSyCEI4c7roZUj9jeKEbiw5K0OXbkJUmF86I',
            headers: { 
              'Content-Type': 'application/json'
            },
            data : vdata
          };

          let linkShort = await axios(config)


         

         

  
        }
      }
      
    } catch (error) {

      console.log('dowland error ----->',error)


    }

  }
  public async downloadCustom({
    response,
    request
  }: HttpContextContract){

    try {

      let all = request.body()



      let search:any = {}

      if (all.ID != undefined) {
        search.ID = all.ID
      }else if(all.ID == undefined){

        return response.status(200).send({
          status: 200,
          message: 'Paremetre eksik veya boş gelemez (ID)',
          response:''
        })

      } 

      if (all.UUID != undefined) {
        search.UUID = all.UUID
      }

      if (all.TYPE != undefined) {
        search.TYPE = all.TYPE
      }

      if (all.DIRECTION != undefined) {
        search.DIRECTION = all.DIRECTION
      }


     


      var soap = require('soap');
        var url = 'https://efaturaws.izibiz.com.tr/EInvoiceWS?wsdl';
        var args = {
          "REQUEST_HEADER": {
            "SESSION_ID": all.SESSION_ID,
            "APPLICATION_NAME": "tiko",
          },
          "INVOICE_SEARCH_KEY":search,
          "HEADER_ONLY":"N"
        };

        const resp = new Promise((resolve, reject) => {

          soap.createClient(url, function (err, client) {
            if(err){
              reject(err)
            }

            client.GetInvoiceWithType(args, function (err, result) {
              if(err){
                reject(err)
              }
              resolve(result)
            });

          });
        });

        let data:any = await resp



        if (data != null && data.status == 500) {
       
          var result1 = convert.xml2json(data.data, {
            compact: true,
            ignoreText:false,
            ignoreDoctype:false,
            ignoreCdata:true,
            ignoreComment:true,
            ignoreAttributes:true,
            ignoreInstruction:true,
            ignoreDeclaration:true,
            indentAttributes:true,
            fullTagEmptyElement:true,
            indentCdata:true,
            spaces: 4});
    
            let snc = replaceall("SOAP-ENV:", "", result1);
    
            snc = replaceall("_text", "text", snc);
    
          return response.status(200).send({
            status: 200,
            message: 'OK',
            response: JSON.parse(snc)
          })
  
        }else {
         
        let name = all.UUID || all.ID




        if (data == null) {

          return response.status(200).send({
            status: 200,
            message: 'Veri Bulunamadı',
            response:''
          })

        }

        let randoom = Math.floor(Math.random() * (100 - 1 + 1)) + 1
        let buff = Buffer.from(data.INVOICE[0].CONTENT, 'base64'); 

        const pdf = new Promise((resolve, reject) => {
          fs.writeFile(Env.get('MAIN_PATH')+'faturalar/' +name+'.bin', buff, (err) => {
            if(err){
              reject(err)
            }
              return resolve(1)
          });
        });


        let check = await pdf
        let type = all.TYPE

        if (check == 1 ) {


          await extract(Env.get('MAIN_PATH')+'faturalar/' +name+'.bin', { dir: Env.get('MAIN_PATH')+'faturalar/' })
         
            const pdf = new Promise((resolve, reject) => {


            let fileContent = fs.readFileSync(Env.get('MAIN_PATH')+'faturalar/' +name+'.'+type.toLowerCase())
            let str = fileContent.toString('utf-8');
          
              
            // Değiştirilecek metni kontrol et
                // Eğer metin içinde varsa, değiştir
                str = str.replace(/TİKO DİJİTAL/g, all.NewName);
                
                // Değiştirilmiş string'i tekrar fileContenter'a dönüştür
                fileContent = Buffer.from(str, 'utf-8');

            let params:any = {}

            params.Bucket = 'eftr.net/efatura/pdf/'+Math.floor(Math.random() * 100000)
            params.Key = name+'_'+randoom+'.'+type.toLowerCase()
        
            params.ContentType = 'text/'+type.toLowerCase()

            params.Body = fileContent

            // const params = {
            //   Bucket: , // pass your bucket name
            //   Key: , // file will be saved as testBucket/contacts.csv
            //   ContentType: ,
            //   Body: 
            // };

            s3.upload(params, function(s3Err, data) {
              
                if (s3Err){
                  reject(s3Err)
                }
                console.log('--------->',data.Location)
                return resolve(data.Location)
            });

          });

          let lnk = (await pdf)


          name = name + Math.floor(Math.random() * (100 - 1 + 1)) + 1
          let data = qs.stringify({
            'url': lnk,
            'fileName': name
          });
          console.log(data);
          
          let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'http://78.135.107.96:2580/convert-pdf',
            headers: { 
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            data : data
          };
          
          let rs = await axios.request(config)
          
          console.log(rs.data);
          
          const dl = new DownloaderHelper(
           "http://78.135.107.96:2580/pdf/"+ name + `.pdf`,
           Env.get('MAIN_PATH')+'faturalar'
          );
      
          let fName = "";
          dl.on("end", res => (fName = res.fileName));
          let rs2 = await dl.start();

          // await new Promise(r => setTimeout(r, 5000));

          const pdfss = await new Promise((resolve, reject) => {
            
            const params = {
              Bucket: 'eftr.net/earsiv/pdf', // pass your bucket name
              Key: name+Math.floor(Math.random() * (100 - 1 + 1)) + 1+'.pdf', // file will be saved as testBucket/contacts.csv
              Body: fs.readFileSync(Env.get('MAIN_PATH')+'faturalar/' +name+'.pdf'),
              ContentType: 'application/pdf'
            };


            s3.upload(params, function(s3Err, data) {
                if (s3Err){
                  reject(s3Err)
                }
                return resolve(data.Location)
            });

        });

          return response.status(200).send({
            status: 200,
            message: 'OK',
            response: {
              html_url: lnk,
              pdf_url:pdfss
            }
          })

  
        }
      }
      
    } catch (error) {

      console.log('dowland error ----->',error)


    }

  }

  // * Taslak Fatura Yükleme
  public async taslakPush({
    response,
    request
  }: HttpContextContract) {


    try {

      let all = request.body()

      let xml: any = new InvoicesController()

      // * Line Alanları


      let lineList = JSON.parse(all.InvoiceLine)
      let daf:any = []


      let ortak = ''
      if (all.TaxCategoryTaxSchemeTaxExemptionReasonCode != undefined && all.TaxCategoryTaxSchemeTaxExemptionReason != undefined) {
          ortak = `
          <cbc:TaxExemptionReasonCode>`+all.TaxCategoryTaxSchemeTaxExemptionReasonCode+`</cbc:TaxExemptionReasonCode>
          <cbc:TaxExemptionReason>`+all.TaxCategoryTaxSchemeTaxExemptionReason+`</cbc:TaxExemptionReason>
          `
      }



      for (let i = 0; i < lineList.length; i++) {
        const lines = lineList[i];


        // * Satırda Çoklu İskontolu Satış Faturası
        if (lines.IskChargeIndicator != undefined) {


          daf.push(`

          <cac:InvoiceLine>
          <cbc:ID>1</cbc:ID>
          <cbc:Note></cbc:Note>
          <cbc:InvoicedQuantity unitCode="C62">`+lines.InvoicedQuantity+`</cbc:InvoicedQuantity>
          <cbc:LineExtensionAmount currencyID=`+JSON.stringify(all.currencyID)+`>`+lines.LineExtensionAmount+`</cbc:LineExtensionAmount>


          <cac:AllowanceCharge>
          <cbc:ChargeIndicator>`+lines.IskChargeIndicator+`</cbc:ChargeIndicator>
          <cbc:AllowanceChargeReason>`+lines.IskAllowanceChargeReason+`</cbc:AllowanceChargeReason>
          <cbc:MultiplierFactorNumeric>`+lines.IskMultiplierFactorNumeric+`</cbc:MultiplierFactorNumeric>
          <cbc:Amount currencyID="TRY">`+lines.IskAmount+`</cbc:Amount>
          <cbc:BaseAmount currencyID="TRY">`+lines.IskBaseAmount+`</cbc:BaseAmount>
          </cac:AllowanceCharge>


          <cac:TaxTotal>
          <cbc:TaxAmount currencyID=`+JSON.stringify(all.currencyID)+`>`+lines.TaxAmount+`</cbc:TaxAmount>
          <cac:TaxSubtotal>
          <cbc:TaxableAmount currencyID=`+JSON.stringify(all.currencyID)+`>`+lines.TaxableAmount+`</cbc:TaxableAmount>
          <cbc:TaxAmount currencyID=`+JSON.stringify(all.currencyID)+`>`+lines.TaxAmount+`</cbc:TaxAmount>
          <cbc:CalculationSequenceNumeric>`+lines.CalculationSequenceNumeric+`</cbc:CalculationSequenceNumeric>
          <cbc:Percent>`+lines.Percent+`</cbc:Percent>
          <cac:TaxCategory>
          <cac:TaxScheme>
          <cbc:Name>`+JSON.stringify(lines.TaxSchemeName)+`</cbc:Name>
          <cbc:TaxTypeCode>`+lines.TaxTypeCode+`</cbc:TaxTypeCode>
          </cac:TaxScheme>
          </cac:TaxCategory>
          </cac:TaxSubtotal>
          </cac:TaxTotal>
          <cac:Item>
          <cbc:Name> `+lines.ItemName+` </cbc:Name>
          </cac:Item>
          <cac:Price>
          <cbc:PriceAmount currencyID=`+JSON.stringify(all.currencyID)+`>`+lines.PriceAmount+`</cbc:PriceAmount>
          </cac:Price>
          </cac:InvoiceLine>`)


        }else if(lines.TevkifatWithholdingTaxTotalTaxAmount != undefined) {

          
          daf.push(`

          <cac:InvoiceLine>
          <cbc:ID>1</cbc:ID>
          <cbc:Note></cbc:Note>
          <cbc:InvoicedQuantity unitCode="C62">`+lines.InvoicedQuantity+`</cbc:InvoicedQuantity>
          <cbc:LineExtensionAmount currencyID=`+JSON.stringify(all.currencyID)+`>`+lines.LineExtensionAmount+`</cbc:LineExtensionAmount>
          <cac:TaxTotal>
          <cbc:TaxAmount currencyID=`+JSON.stringify(all.currencyID)+`>`+lines.TaxAmount+`</cbc:TaxAmount>
          <cac:TaxSubtotal>
          <cbc:TaxableAmount currencyID=`+JSON.stringify(all.currencyID)+`>`+lines.TaxableAmount+`</cbc:TaxableAmount>
          <cbc:TaxAmount currencyID=`+JSON.stringify(all.currencyID)+`>`+lines.TaxAmount+`</cbc:TaxAmount>
          <cbc:CalculationSequenceNumeric>`+lines.CalculationSequenceNumeric+`</cbc:CalculationSequenceNumeric>
          <cbc:Percent>`+lines.Percent+`</cbc:Percent>
          <cac:TaxCategory>
          <cac:TaxScheme>
          <cbc:Name>`+JSON.stringify(lines.TaxSchemeName)+`</cbc:Name>
          <cbc:TaxTypeCode>`+lines.TaxTypeCode+`</cbc:TaxTypeCode>
          </cac:TaxScheme>
          </cac:TaxCategory>
          </cac:TaxSubtotal>
          </cac:TaxTotal>

          <cac:WithholdingTaxTotal>
          <cbc:TaxAmount currencyID="TRY">324.00</cbc:TaxAmount>
          <cac:TaxSubtotal>
          <cbc:TaxableAmount currencyID="TRY">2000</cbc:TaxableAmount>
          <cbc:TaxAmount currencyID="TRY">324.00</cbc:TaxAmount>
          <cbc:Percent>90</cbc:Percent>
          <cac:TaxCategory>
          <cac:TaxScheme>
          <cbc:Name>602 - etüt, plan-proje, danişmanlik, denetim ve benzeri hizmetler</cbc:Name>
          <cbc:TaxTypeCode>602</cbc:TaxTypeCode>
          </cac:TaxScheme>
          </cac:TaxCategory>
          </cac:TaxSubtotal>
          </cac:WithholdingTaxTotal>


          <cac:Item>
          <cbc:Name> `+lines.ItemName+` </cbc:Name>
          </cac:Item>
          <cac:Price>
          <cbc:PriceAmount currencyID=`+JSON.stringify(all.currencyID)+`>`+lines.PriceAmount+`</cbc:PriceAmount>
          </cac:Price>
          </cac:InvoiceLine>`)



        }else if(lines.ihracatDeliveryTermsID != undefined) {

          daf.push(`

          <cac:InvoiceLine>
          <cbc:ID>1</cbc:ID>
          <cbc:Note></cbc:Note>
          <cbc:InvoicedQuantity unitCode="C62">`+lines.InvoicedQuantity+`</cbc:InvoicedQuantity>
          <cbc:LineExtensionAmount currencyID=`+JSON.stringify(all.currencyID)+`>`+lines.LineExtensionAmount+`</cbc:LineExtensionAmount>


          <cac:Delivery>
          <cac:DeliveryAddress>
          <cbc:StreetName/>
          <cbc:BuildingName/>
          <cbc:BuildingNumber/>
          <cbc:CitySubdivisionName/>
          <cbc:CityName/>
          <cbc:PostalZone/>
          <cac:Country>
          <cbc:Name/>
          </cac:Country>
          </cac:DeliveryAddress>
          <cac:DeliveryTerms>
          <cbc:ID schemeID="INCOTERMS">`+lines.ihracatDeliveryTermsID+`</cbc:ID>
          </cac:DeliveryTerms>
          <cac:Shipment>
          <cbc:ID/>
          <cbc:FreeOnBoardValueAmount currencyID="TRY">`+lines.ihracatFreeOnBoardValueAmount+`</cbc:FreeOnBoardValueAmount>
          <cac:GoodsItem>
          <cbc:RequiredCustomsID>`+lines.ihracatRequiredCustomsID+`</cbc:RequiredCustomsID>
          </cac:GoodsItem>
          <cac:ShipmentStage>
          <cbc:TransportModeCode>`+lines.ihracatTransportModeCode+`</cbc:TransportModeCode>
          </cac:ShipmentStage>
          <cac:TransportHandlingUnit>
          <cac:ActualPackage>
          <cbc:ID/>
          <cbc:Quantity>`+lines.ihracatQuantity+`</cbc:Quantity>
          <cbc:PackagingTypeCode>`+lines.ihracatPackagingTypeCode+`</cbc:PackagingTypeCode>
          </cac:ActualPackage>
          </cac:TransportHandlingUnit>
          </cac:Shipment>
          </cac:Delivery>



          <cac:TaxTotal>
          <cbc:TaxAmount currencyID=`+JSON.stringify(all.currencyID)+`>`+lines.TaxAmount+`</cbc:TaxAmount>
          <cac:TaxSubtotal>
          <cbc:TaxableAmount currencyID=`+JSON.stringify(all.currencyID)+`>`+lines.TaxableAmount+`</cbc:TaxableAmount>
          <cbc:TaxAmount currencyID=`+JSON.stringify(all.currencyID)+`>`+lines.TaxAmount+`</cbc:TaxAmount>
          <cbc:CalculationSequenceNumeric>`+lines.CalculationSequenceNumeric+`</cbc:CalculationSequenceNumeric>
          <cbc:Percent>`+lines.Percent+`</cbc:Percent>
          <cac:TaxCategory>
          <cac:TaxScheme>
          <cbc:Name>`+JSON.stringify(lines.TaxSchemeName)+`</cbc:Name>
          <cbc:TaxTypeCode>`+lines.TaxTypeCode+`</cbc:TaxTypeCode>
          </cac:TaxScheme>
          </cac:TaxCategory>
          </cac:TaxSubtotal>
          </cac:TaxTotal>
          <cac:Item>
          <cbc:Name> `+lines.ItemName+` </cbc:Name>
          </cac:Item>
          <cac:Price>
          <cbc:PriceAmount currencyID=`+JSON.stringify(all.currencyID)+`>`+lines.PriceAmount+`</cbc:PriceAmount>
          </cac:Price>
          </cac:InvoiceLine>`)

        }else {
          daf.push(`

          <cac:InvoiceLine>
          <cbc:ID>1</cbc:ID>
          <cbc:Note></cbc:Note>
          <cbc:InvoicedQuantity unitCode="C62">`+lines.InvoicedQuantity+`</cbc:InvoicedQuantity>
          <cbc:LineExtensionAmount currencyID=`+JSON.stringify(all.currencyID)+`>`+lines.LineExtensionAmount+`</cbc:LineExtensionAmount>
          <cac:TaxTotal>
          <cbc:TaxAmount currencyID=`+JSON.stringify(all.currencyID)+`>`+lines.TaxAmount+`</cbc:TaxAmount>
          <cac:TaxSubtotal>
          <cbc:TaxableAmount currencyID=`+JSON.stringify(all.currencyID)+`>`+lines.TaxableAmount+`</cbc:TaxableAmount>
          <cbc:TaxAmount currencyID=`+JSON.stringify(all.currencyID)+`>`+lines.TaxAmount+`</cbc:TaxAmount>
          <cbc:CalculationSequenceNumeric>`+lines.CalculationSequenceNumeric+`</cbc:CalculationSequenceNumeric>
          <cbc:Percent>`+lines.Percent+`</cbc:Percent>
          <cac:TaxCategory>
          <cac:TaxScheme>
          <cbc:Name>`+JSON.stringify(lines.TaxSchemeName)+`</cbc:Name>
          <cbc:TaxTypeCode>`+lines.TaxTypeCode+`</cbc:TaxTypeCode>
          </cac:TaxScheme>
          </cac:TaxCategory>
          </cac:TaxSubtotal>
          </cac:TaxTotal>
          <cac:Item>
          <cbc:Name> `+lines.ItemName+` </cbc:Name>
          </cac:Item>
          <cac:Price>
          <cbc:PriceAmount currencyID=`+JSON.stringify(all.currencyID)+`>`+lines.PriceAmount+`</cbc:PriceAmount>
          </cac:Price>
          </cac:InvoiceLine>`)

        }


      }

      
      // * Kdv Toplamı
      let TaxAmount = ` <cbc:TaxAmount currencyID=`+JSON.stringify(all.currencyID)+`>337.00</cbc:TaxAmount>`

      // * Kdv 8 oranı 
      let kdv8 = `
      <cac:TaxSubtotal>
        <cbc:TaxableAmount currencyID=`+JSON.stringify(all.currencyID)+`>`+all.kdv8TaxableAmount+`</cbc:TaxableAmount>
        <cbc:TaxAmount currencyID=`+JSON.stringify(all.currencyID)+`>`+all.kdv8TaxAmount+`</cbc:TaxAmount>
        <cbc:CalculationSequenceNumeric>`+all.kdv8CalculationSequenceNumeric+`</cbc:CalculationSequenceNumeric>
        <cbc:Percent>`+all.kdv8Percent+`</cbc:Percent>
        <cac:TaxCategory>
        `+ortak+`
          <cac:TaxScheme>
            <cbc:Name>`+all.kdv8TaxCategoryTaxSchemeName+`</cbc:Name>
            <cbc:TaxTypeCode>`+all.kdv8TaxCategoryTaxSchemeTaxTypeCode+`</cbc:TaxTypeCode>
          </cac:TaxScheme>
        </cac:TaxCategory>
      </cac:TaxSubtotal>
      `

      // * Kdv 1 oranı 
      let kdv1 = `
      <cac:TaxSubtotal>
        <cbc:TaxableAmount currencyID=`+JSON.stringify(all.currencyID)+`>`+all.kdv1TaxableAmount+`</cbc:TaxableAmount>
        <cbc:TaxAmount currencyID=`+JSON.stringify(all.currencyID)+`>`+all.kdv1TaxAmount+`</cbc:TaxAmount>
        <cbc:CalculationSequenceNumeric>`+all.kdv1CalculationSequenceNumeric+`</cbc:CalculationSequenceNumeric>
        <cbc:Percent>`+all.kdv1Percent+`</cbc:Percent>
        <cac:TaxCategory>
        `+ortak+`
          <cac:TaxScheme>
            <cbc:Name>`+all.kdv1TaxCategoryTaxSchemeName+`</cbc:Name>
            <cbc:TaxTypeCode>`+all.kdv1TaxCategoryTaxSchemeTaxTypeCode+`</cbc:TaxTypeCode>
          </cac:TaxScheme>
        </cac:TaxCategory>
      </cac:TaxSubtotal>
      `


      // * Kdv 18 oranı 
      let kdv18 = `
      <cac:TaxSubtotal>
        <cbc:TaxableAmount currencyID=`+JSON.stringify(all.currencyID)+`>`+all.kdv18TaxableAmount+`</cbc:TaxableAmount>
        <cbc:TaxAmount currencyID=`+JSON.stringify(all.currencyID)+`>`+all.kdv18TaxAmount+`</cbc:TaxAmount>
        <cbc:CalculationSequenceNumeric>`+all.kdv18CalculationSequenceNumeric+`</cbc:CalculationSequenceNumeric>
        <cbc:Percent>`+all.kdv18Percent+`</cbc:Percent>
        <cac:TaxCategory>
        `+ortak+`
          <cac:TaxScheme>
            <cbc:Name>`+all.kdv18TaxCategoryTaxSchemeName+`</cbc:Name>
            <cbc:TaxTypeCode>`+all.kdv18TaxCategoryTaxSchemeTaxTypeCode+`</cbc:TaxTypeCode>
          </cac:TaxScheme>
        </cac:TaxCategory>
      </cac:TaxSubtotal>
      `


      // * Kdv 0 oranı 
      let kdv0 = `
      <cac:TaxSubtotal>
        <cbc:TaxableAmount currencyID=`+JSON.stringify(all.currencyID)+`>`+all.kdv0TaxableAmount+`</cbc:TaxableAmount>
        <cbc:TaxAmount currencyID=`+JSON.stringify(all.currencyID)+`>`+all.kdv0TaxAmount+`</cbc:TaxAmount>
        <cbc:CalculationSequenceNumeric>`+all.kdv0CalculationSequenceNumeric+`</cbc:CalculationSequenceNumeric>
        <cbc:Percent>`+all.kdv0Percent+`</cbc:Percent>
        <cac:TaxCategory>
          `+ortak+`
          <cac:TaxScheme>
            <cbc:Name>`+all.kdv0TaxCategoryTaxSchemeName+`</cbc:Name>
            <cbc:TaxTypeCode>`+all.kdv0TaxCategoryTaxSchemeTaxTypeCode+`</cbc:TaxTypeCode>
          </cac:TaxScheme>
        </cac:TaxCategory>
      </cac:TaxSubtotal>
      `


      // * Dovizli Satış
      let doviz = `
      <cac:PricingExchangeRate>
        <cbc:SourceCurrencyCode listAgencyName="United Nations Economic Commission for Europe" listID="ISO 4217 Alpha" listName="Currency" listVersionID="2001">`+all.dovizPricingExchangeRateSourceCurrencyCode+`</cbc:SourceCurrencyCode>
        <cbc:TargetCurrencyCode listAgencyName="United Nations Economic Commission for Europe" listID="ISO 4217 Alpha" listName="Currency" listVersionID="2001">`+all.dovizPricingExchangeRateTargetCurrencyCode+`</cbc:TargetCurrencyCode>
        <cbc:CalculationRate>`+all.dovizPricingExchangeRateCalculationRate+`</cbc:CalculationRate>
      </cac:PricingExchangeRate>
      `


      // * Bedelsiz (%100) İskonto
      let bedelsizIsk = `
      <cac:AllowanceCharge>
        <cbc:ChargeIndicator>`+all.bedelsizIskAllowanceChargeChargeIndicator+`</cbc:ChargeIndicator>
        <cbc:AllowanceChargeReason>`+all.bedelsizIskAllowanceAllowanceChargeReason+`</cbc:AllowanceChargeReason>
        <cbc:SequenceNumeric>`+all.bedelsizIskAllowanceSequenceNumeric+`</cbc:SequenceNumeric>
        <cbc:Amount currencyID="TRY">`+all.bedelsizIskAllowanceAmount+`</cbc:Amount>
        <cbc:BaseAmount currencyID="TRY">`+all.bedelsizIskAllowanceBaseAmount+`</cbc:BaseAmount>
      </cac:AllowanceCharge>
      `


      // * Satırda Çoklu İskontolu Satış Faturası
      let satirCkIsk = `
      <cac:AllowanceCharge>
      <cbc:ChargeIndicator>`+all.satirCkIskAllowanceChargeChargeIndicator+`</cbc:ChargeIndicator>
      <cbc:AllowanceChargeReason>`+all.satirCkIskAllowanceChargeAllowanceChargeReason+`</cbc:AllowanceChargeReason>
      <cbc:Amount currencyID="TRY">`+all.satirCkIskAllowanceChargeAmount+`</cbc:Amount>
      </cac:AllowanceCharge>
      `


      // * Tevkifatlı Fatura Kesme Durumu
      let tevkifat = `
        <cac:WithholdingTaxTotal>
        <cbc:TaxAmount currencyID="TRY">`+all.tevkifatWithholdingTaxTotalTaxAmount+`</cbc:TaxAmount>
        <cac:TaxSubtotal>
        <cbc:TaxableAmount currencyID="TRY">`+all.tevkifatWithholdingTaxTotalTaxableAmount+`</cbc:TaxableAmount>
        <cbc:TaxAmount currencyID="TRY">`+all.tevkifatWithholdingTaxTotalTaxAmount2+`</cbc:TaxAmount>
        <cbc:Percent>`+all.tevkifatWithholdingTaxTotalPercent+`</cbc:Percent>
        <cac:TaxCategory>
        <cac:TaxScheme>
        <cbc:Name>`+all.tevkifatWithholdingTaxTotalTaxCategoryTaxSchemeName+`</cbc:Name>
        <cbc:TaxTypeCode>`+all.tevkifatWithholdingTaxTotalTaxCategoryTaxSchemeTaxTypeCode+`</cbc:TaxTypeCode>
        </cac:TaxScheme>
        </cac:TaxCategory>
        </cac:TaxSubtotal>
        </cac:WithholdingTaxTotal>
      `

      // * Normal Fatura Gönderilirken (İhracat Istisna Fatuarları Hariç)
      let AccountingCustomerPartyNormal = `
                <cac:AccountingCustomerParty>
                <cac:Party>
                  <cbc:WebsiteURI >`+all.AcpWebsiteURI+`</cbc:WebsiteURI>
                  <cac:PartyIdentification>
                    <cbc:ID schemeID="VKN">`+all.AcpVKN+`</cbc:ID>
                  </cac:PartyIdentification>
                  <cac:PartyName>
                    <cbc:Name>`+all.AcpName+`</cbc:Name>
                  </cac:PartyName>
                  <cac:PostalAddress>
                    <cbc:StreetName>`+all.AcpStreetName+`</cbc:StreetName>
                    <cbc:BuildingName >`+all.AcpBuildingName+`</cbc:BuildingName>
                    <cbc:BuildingNumber />
                    <cbc:CitySubdivisionName>`+all.AcpCitySubdivisionName+`</cbc:CitySubdivisionName>
                    <cbc:CityName>`+all.AcpCityName+`</cbc:CityName>
                    <cbc:PostalZone />
                    <cbc:Region />
                    <cac:Country>
                      <cbc:Name>`+all.AcpCountryName+`</cbc:Name>
                    </cac:Country>
                  </cac:PostalAddress>
                  <cac:PartyTaxScheme>
                    <cac:TaxScheme>
                      <cbc:Name>`+all.AcpPartyTaxSchemeName+`</cbc:Name>
                    </cac:TaxScheme>
                  </cac:PartyTaxScheme>
                  <cac:Contact>
                    <cbc:Telephone>`+all.AcpContactTelephone+`</cbc:Telephone>
                    <cbc:Telefax>`+all.AcpContactTelefax+`</cbc:Telefax>
                    <cbc:ElectronicMail>`+all.AcpContactElectronicMail+`</cbc:ElectronicMail>
                  </cac:Contact>
                </cac:Party>
              </cac:AccountingCustomerParty>
      ` 

      // * ihracat istisna faturası kesme 
      let AccountingCustomerPartyIhracat = `
      
          <cac:AccountingCustomerParty>
          <cac:Party>
            <cac:PartyIdentification>
              <cbc:ID schemeID="VKN">1460415308</cbc:ID>
            </cac:PartyIdentification>
            <cac:PartyName>
              <cbc:Name>Gümrük ve Ticaret Bakanlığı Gümrükler Genel Müdürlüğü- Bilgi İşlem Dairesi Başkanlığı</cbc:Name>
            </cac:PartyName>
            <cac:PostalAddress>
              <cbc:BuildingName />
              <cbc:BuildingNumber />
              <cbc:CitySubdivisionName />
              <cbc:CityName>ANKARA</cbc:CityName>
              <cac:Country>
                <cbc:Name>Türkiye</cbc:Name>
              </cac:Country>
            </cac:PostalAddress>
            <cac:PartyTaxScheme>
              <cac:TaxScheme>
                <cbc:Name>ULUS</cbc:Name>
              </cac:TaxScheme>
            </cac:PartyTaxScheme>
            <cac:Contact />
          </cac:Party>
        </cac:AccountingCustomerParty>

        <cac:BuyerCustomerParty>
        <cac:Party>
          <cac:PartyIdentification>
            <cbc:ID schemeID="PARTYTYPE">EXPORT</cbc:ID>
          </cac:PartyIdentification>
          <cac:PartyName>
            <cbc:Name>İZİBİZ BİLİŞİM TEKNOLOJİLERİ ANONİM ŞİRKETİ</cbc:Name>
          </cac:PartyName>
          <cac:PostalAddress>
            <cbc:StreetName>İSTANBUL MALTEPE</cbc:StreetName>
            <cbc:BuildingName />
            <cbc:BuildingNumber />
            <cbc:CitySubdivisionName />
            <cbc:CityName>İSTANBUL</cbc:CityName>
            <cac:Country>
              <cbc:Name>TÜRKİYE</cbc:Name>
            </cac:Country>
          </cac:PostalAddress>
          <cac:PartyLegalEntity>
            <cbc:RegistrationName>İZİBİZ BİLİŞİM TEKNOLOJİLERİ ANONİM ŞİRKETİ</cbc:RegistrationName>
            <cbc:CompanyID>2222222222</cbc:CompanyID>
          </cac:PartyLegalEntity>
        </cac:Party>
      </cac:BuyerCustomerParty>
    
      <cac:Delivery>
        <cac:Shipment>
          <cbc:ID />
          <cbc:InsuranceValueAmount currencyID="TRY">0.00</cbc:InsuranceValueAmount>
          <cbc:DeclaredForCarriageValueAmount currencyID="TRY">0.00</cbc:DeclaredForCarriageValueAmount>
        </cac:Shipment>
      </cac:Delivery>


      `

      // * İade Faturası Kesme 
      let iadeDataList:any = []
      if (all.iadeBillingReference != undefined) {

        let iadeList = JSON.parse(all.iadeBillingReference)

        for (let iade = 0; iade < iadeList.length; iade++) {
          const ia = iadeList[iade];
  
          let iadeData = `
            <cac:BillingReference>
            <cac:InvoiceDocumentReference>
            <cbc:ID>`+ia.iadeInvoiceDocumentReferenceID+`</cbc:ID>
            <cbc:IssueDate>`+ia.iadeInvoiceDocumentReferenceIssueDate+`</cbc:IssueDate>
            <cbc:DocumentTypeCode>`+ia.iadeInvoiceDocumentReferenceDocumentTypeCode+`</cbc:DocumentTypeCode>
            </cac:InvoiceDocumentReference>
            </cac:BillingReference>
          `

          iadeDataList.push(iadeData)

        }

      }

      
      let obj:any = {}
      obj.uuid = all.uuid
      obj.id = all.invoiceID
      obj.line = daf

      // * Kesilen Faturanın Seneryosu
      obj.ProfileID = all.ProfileID

      // * Kesilen Faturanın Tipi
      obj.InvoiceTypeCode = all.InvoiceTypeCode


      // ******************** Fatura Bilgileri Alanları *****************

      // * Kopya Göstergesi
      obj.CopyIndicator = all.CopyIndicator

      // * IssueDate - Veriliş Tarihi
      obj.IssueDate = all.IssueDate

      // * IssueTime - Veriliş Saati
      obj.IssueTime = all.IssueTime

      // * Note - Fatura Not Alanı
      obj.Note = all.Note

      // * DocumentCurrencyCode - Belge Para Birimi Kodu
      obj.DocumentCurrencyCode = all.DocumentCurrencyCode

      // * LineCountNumeric - Satır Sayısı Sayısal
      obj.LineCountNumeric = all.LineCountNumeric

      // * DocumentType - Döküman Tipi
      obj.DocumentType = all.DocumentType

      // * SignatureVKN_TCKN - Mali Mühür İmza -  VKN_TCKN
      obj.SignatureVKN_TCKN = all.SignatureVKN_TCKN
      
      // * SignatureVKN - Mali Mühür İmza -  VKN
      obj.SignatureVKN = all.SignatureVKN

      // * SignatureStreetName - Mali Mühür İmza -  Sokak adı
      obj.SignatureStreetName = all.SignatureStreetName

      // * SignatureBuildingNumber - Mali Mühür İmza -  Bina numarası
      obj.SignatureBuildingNumber = all.SignatureBuildingNumber

      // * SignatureCitySubdivisionName - Mali Mühür İmza -  İlçe
      obj.SignatureCitySubdivisionName = all.SignatureCitySubdivisionName

      // * SignatureCityName - Mali Mühür İmza -  Şehir
      obj.SignatureCityName = all.SignatureCityName

      // * SignaturePostalZone - Mali Mühür İmza -  Posta Kodu
      obj.SignaturePostalZone = all.SignaturePostalZone

      // * SignatureRegion - Mali Mühür İmza -  Bölge
      obj.SignatureRegion = all.SignatureRegion

      // * SignatureCountryName - Mali Mühür İmza -  Ülke Kodu
      obj.SignatureCountryName = all.SignatureCountryName

      // * SignatureURI - Mali Mühür İmza
      obj.SignatureURI = all.SignatureURI


      // * -------------- Satıcı Bilgileri -----------------

      // * AspWebsiteURI - Satıcı - Website URI
      obj.AspWebsiteURI = all.AspWebsiteURI

      // * AspVKN Satıcı - VKN
      obj.AspVKN = all.AspVKN

      // * AspMERSISNO - Satıcı - MERSISNO
      obj.AspMERSISNO = all.AspMERSISNO

      // * AspTICARETSICILNO -Satıcı - TICARETSICILNO 
      obj.AspTICARETSICILNO = all.AspTICARETSICILNO

      // * AspName - Satıcı - Firma Adı
      obj.AspName = all.AspName

      // * AspStreetName - Satıcı - Sokak Adı
      obj.AspStreetName = all.AspStreetName

      // * AspBuildingNumber - Satıcı - Sokak Numarası
      obj.AspBuildingNumber = all.AspBuildingNumber

      // * AspCitySubdivisionName - Satıcı - İlçe
      obj.AspCitySubdivisionName = all.AspCitySubdivisionName

      // * AspCityName - Satıcı - İl
      obj.AspCityName = all.AspCityName

      // * AspPostalZone - Satıcı - Posta Kodu
      obj.AspPostalZone = all.AspPostalZone

      // * AspRegion - Satıcı - Bölge
      obj.AspRegion = all.AspRegion

      // * AspCountryName - Satıcı - Ülke Kodu
      obj.AspCountryName = all.AspCountryName

      // * AspPartyTaxSchemeName - Satıcı - Vergi Dairesi 
      obj.AspPartyTaxSchemeName = all.AspPartyTaxSchemeName

      // * AspContactTelephone - Satıcı - Telefon
      obj.AspContactTelephone = all.AspContactTelephone

      // * AspContactTelefax - Satıcı - Fax
      obj.AspContactTelefax = all.AspContactTelefax

      // * AspContactElectronicMail - Satıcı - Email
      obj.AspContactElectronicMail = all.AspContactElectronicMail

      // * -------------- Alıcı Bilgileri -----------------



      // * Ihracat Durumu
      if (all.ProfileID == 'IHRACAT' && all.InvoiceTypeCode == 'ISTISNA') {
        obj.AccountingCustomerParty = AccountingCustomerPartyIhracat
      }else {
        obj.AccountingCustomerParty = AccountingCustomerPartyNormal
      }


      // * Kdv Toplamını Gönderir
      obj.TaxAmount = TaxAmount

      // * Fatura Para birimi Cinsi
      obj.currencyID = all.currencyID

      // * Kdv %8 
      if (all.kdv8TaxableAmount != undefined) {
        obj.kdv8 = kdv8
      }else {
        obj.kdv8 = ''
      }

      // * Kdv %1 
      if (all.kdv1TaxableAmount != undefined) {
        obj.kdv1 = kdv1
      }else {
        obj.kdv1 = ''
      }

      // * Kdv %18
      if (all.kdv18TaxableAmount != undefined) {
        obj.kdv18 = kdv18
      }else {
        obj.kdv18 = ''
      }

      // * Kdv %0
      if (all.kdv0TaxableAmount != undefined) {
        obj.kdv0 = kdv0
      }else {
        obj.kdv0 = ''
      }

      // * Doviz
      if (all.dovizPricingExchangeRateCalculationRate != undefined) {
        obj.doviz = doviz
      }else {
        obj.doviz = ''
      }

      // * Bedelsiz Satıs
      if(all.bedelsizIskAllowanceChargeChargeIndicator != undefined){
        obj.bedelsizIsk = bedelsizIsk
      }else {
        obj.bedelsizIsk = ''
      }


      // * Satırda Çoklu İskontolu Satış Faturası
      if (all.satirCkIskAllowanceChargeChargeIndicator != undefined) {
        obj.satirCkIsk = satirCkIsk
      }else {
        obj.satirCkIsk = ''
      }


      // * Tevkifatlı Fatura Kesme Durumu
      if(all.tevkifatWithholdingTaxTotalTaxAmount != undefined){
        obj.tevkifatWithholdingTaxTotal = tevkifat
      }else {
        obj.tevkifatWithholdingTaxTotal = ''
      }


      // * İade Faturası Kesme 
      if(iadeDataList.length != 0){
        console.log('data yı gönder')
        obj.iadeList = iadeDataList.join('')
      }else {
        console.log('boş veri gönder')
        obj.iadeList = ''
      }

      let temelFaturaXml = await xml.temelFatura(obj)
      let temelFaturaBase64 = await encode(temelFaturaXml)
      
            let pushData = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsdl="http://schemas.i2i.com/ei/wsdl">
            <soapenv:Header/>
            <soapenv:Body>
                <wsdl:LoadInvoiceRequest>

                  <REQUEST_HEADER>
                        <SESSION_ID>`+all.SESSION_ID+`</SESSION_ID>
                        <APPLICATION_NAME>tiko</APPLICATION_NAME>
                        <COMPRESSED>N</COMPRESSED>
                  </REQUEST_HEADER>
          
                  <INVOICE>
                    <CONTENT>
                        `+ temelFaturaBase64 +`
                    </CONTENT>
                  </INVOICE>
                  
                </wsdl:LoadInvoiceRequest>
            </soapenv:Body>
          </soapenv:Envelope>`

          return temelFaturaBase64

      var config = {
        method: 'post',
        url: 'https://efaturaws.izibiz.com.tr/EInvoiceWS?wsdl',
        headers: { 
          'Content-Type': 'text/xml'
        },
        data : pushData
      };
      
      let datas = await axios(config)

                


          

      var result1 = convert.xml2json(datas.data, {
        compact: true,
        ignoreText:false,
        ignoreDoctype:false,
        ignoreCdata:true,
        ignoreComment:true,
        ignoreAttributes:true,
        ignoreInstruction:true,
        ignoreDeclaration:true,
        indentAttributes:true,
        fullTagEmptyElement:true,
        indentCdata:true,
        spaces: 4
      });

        let snc = replaceall("SOAP-ENV:", "", result1);

        snc = replaceall("_text", "text", snc);

        let parseData = JSON.parse(snc)



        console.log('**** PARSE DATA ****')
        console.log(JSON.stringify(parseData))
        console.log('**** PARSE DATA ****')



        if (parseData.Envelope.Body.LoadInvoiceResponse.REQUEST_RETURN.RETURN_CODE.text == 0) {

          console.log('----- 555 ------')

          let typeArr = ["PDF","XML","HTML"]

          for (let i = 0; i < typeArr.length; i++) {
            const element = typeArr[i];
            
            let sqsOrderData:any = {
              MessageBody: JSON.stringify(
                {
                  'ID': all.invoiceID,
                  'TYPE': element,
                  'DIRECTION': 'OUT',
                  'UUID':all.uuid,
                  'SESSION_ID': all.SESSION_ID
                }
              ),
              QueueUrl: "https://sqs.eu-central-1.amazonaws.com/847516675391/download"
          };

          let sendSqsMessage = sqs.sendMessage(sqsOrderData).promise();
          sendSqsMessage.then((data) => {
              console.log(`OrdersSvc | SUCCESS: ${data.MessageId}`);

          }).catch((err) => {
              console.log(`OrdersSvc | ERROR: ${err}`);
          });

          }

          return response.status(200).send({
            status: 200,
            message: 'OK',
            response: parseData
          })

        }

     
    } catch (error) {

      console.log('errrorrrrr',error)

      return
      await this.error_mail('faturaGonder',error)
      
      let xml = error.response.data

      var result1 = convert.xml2json(xml, {
        compact: true,
        ignoreText:false,
        ignoreDoctype:false,
        ignoreCdata:true,
        ignoreComment:true,
        ignoreAttributes:true,
        ignoreInstruction:true,
        ignoreDeclaration:true,
        indentAttributes:true,
        fullTagEmptyElement:true,
        indentCdata:true,
        spaces: 4});

        var original = result1
  
        let resp = replaceall("SOAP-ENV:", "", original);

        resp = replaceall("_text", "text", resp);

        console.log(resp)
    

      return response.status(400).send({
        status: 400,
        message: 'OK',
        response: JSON.parse(resp)
      })

    }
  }

  // * Kullanıcının E-fatura mı E-arşiv mi oldunu döner
  public async efaturaSorgula({
    response,
    request
  }:HttpContextContract){

    try {

      let all = request.all()

      if (all.VKN == undefined) {
        return response.status(200).send({
          status: 200,
          message: 'OK',
          response: {
            url: 'Eksik parametre (VKN)'
          }
        })
      }

      var axios = require('axios');
      var qs = require('qs');
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
      

      let resp = await axios(config)
    


      let text =resp.data
      let position = text.search("Arama işlemi sonucunda kayıt bulunamadı!");


      if (position > 0) {
        return response.status(200).send({
          status: 200,
          message: 'OK',
          response: {
            url: 'E-Faturaya Kayıtlı Değil',
            code:0
          }
        })
      }else {
        return response.status(200).send({
          status: 200,
          message: 'OK',
          response: {
            url: 'E-Faturaya Kayıtlı',
            code:1
          }
        })
      }



    } catch (error) {


      console.log('mukellef cHECK ---->',error)

      await this.error_mail('efaturaSorgula',error)
    }

  }

  // * UUID servisi
  public async uuid({
    response
  }:HttpContextContract){
    
    try {

      return response.status(200).send({
        status: 200,
        message: 'OK',
        response: {
          uuid: uuidv4()
        }
      })
      
    } catch (error) {
      console.log('uuid --> error --->',error)

      await this.error_mail('uuid',error)

    }

  }

  // * Ticari Faturaların Kabul
  public async ticari_fatura_kabul_et({
    response,
    request
  }:HttpContextContract){

    try {

      let all = request.body()


      if (all.INVOICE == null) {
        return response.status(500).send({
          status: 500,
          message: 'Eksik parametre (INVOICE) veya Eksik Veri',
          response: ''
        })
      }

      // let parse = JSON.parse(all.INVOICE)
      let parse = all.INVOICE

      let inv:any = []

      for (let i = 0; i < parse.length; i++) {
        const element = parse[i];
        let invoice = `<INVOICE ID="`+element+`"></INVOICE>`
        inv.push(invoice)
      }

  

      let pushData = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsdl="http://schemas.i2i.com/ei/wsdl" xmlns:xmime="http://www.w3.org/2005/05/xmlmime">
          <soapenv:Header/>
          <soapenv:Body>
            <wsdl:SendInvoiceResponseWithServerSignRequest>
                <REQUEST_HEADER>
                  <SESSION_ID>`+all.SESSION_ID+`</SESSION_ID>
                  <APPLICATION_NAME>izi</APPLICATION_NAME>
                </REQUEST_HEADER>
                <STATUS>KABUL</STATUS>
                `+inv.join('')+`
            </wsdl:SendInvoiceResponseWithServerSignRequest>
          </soapenv:Body>
      </soapenv:Envelope>
      `

      var config = {
        method: 'post',
        url: 'https://efaturaws.izibiz.com.tr/EFaturaOIB?wsdl',
        headers: { 
          'Content-Type': 'text/xml'
        },
        data : pushData
      };
      
      let datas = await axios(config)

      if (datas != null && datas.status != 500) {
       
        var result1 = convert.xml2json(datas.data, {
          compact: true,
          ignoreText:false,
          ignoreDoctype:false,
          ignoreCdata:true,
          ignoreComment:true,
          ignoreAttributes:true,
          ignoreInstruction:true,
          ignoreDeclaration:true,
          indentAttributes:true,
          fullTagEmptyElement:true,
          indentCdata:true,
          spaces: 4});
  
          let snc = replaceall("SOAP-ENV:", "", result1);
  
          snc = replaceall("_text", "text", snc);
  
        return response.status(200).send({
          status: 200,
          message: 'OK',
          response: JSON.parse(snc)
        })


      }else {

        return response.status(200).send({
          status: 200,
          message: 'OK',
          response: datas
        })

      }
      
      
    } catch (error) {
      console.log('Ticari Fatura Kabul Et --> Error',error)


      await this.error_mail('ticari_fatura_kabul_et',error)

      let xml = error.response.data

      var result1 = convert.xml2json(xml, {
        compact: true,
        ignoreText:false,
        ignoreDoctype:false,
        ignoreCdata:true,
        ignoreComment:true,
        ignoreAttributes:true,
        ignoreInstruction:true,
        ignoreDeclaration:true,
        indentAttributes:true,
        fullTagEmptyElement:true,
        indentCdata:true,
        spaces: 4});

        var original = result1
  
        let resp = replaceall("SOAP-ENV:", "", original);

        resp = replaceall("_text", "text", resp);

    

      return response.status(200).send({
        status: 500,
        message: 'HATA',
        response: JSON.parse(resp)
      })

    }

  }

  // * Ticari Faturaların Red
  public async ticari_fatura_reddet({
    response,
    request
  }:HttpContextContract){

    try {

      console.log(' ticari_fatura_reddet ')

      let all = request.all()

      if (all.INVOICE == null) {
        return response.status(500).send({
          status: 500,
          message: 'Eksik parametre (INVOICE,SESSION_ID,DESK) veya Eksik Veri',
          response: ''
        })
      }


      if (all.DESK == null) {
        return response.status(500).send({
          status: 500,
          message: 'Eksik parametre (INVOICE,SESSION_ID,DESK) veya Eksik Veri',
          response: ''
        })
      }

      // let data = JSON.parse(all.INVOICE)
      let data = all.INVOICE

      let inv:any = []

      for (let i = 0; i < data.length; i++) {
        const element = data[i];
        let invoice = `<INVOICE ID="`+element+`"></INVOICE>`
        inv.push(invoice)
      }

      let pushData = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsdl="http://schemas.i2i.com/ei/wsdl" xmlns:xmime="http://www.w3.org/2005/05/xmlmime">
          <soapenv:Header/>
          <soapenv:Body>
            <wsdl:SendInvoiceResponseWithServerSignRequest>
                <REQUEST_HEADER>
                  <SESSION_ID>`+all.SESSION_ID+`</SESSION_ID>
                  <APPLICATION_NAME>tiko</APPLICATION_NAME>
                </REQUEST_HEADER>
                <STATUS>RED</STATUS>
                `+inv.join('')+`
                <DESCRIPTION>`+all.DESK+`</DESCRIPTION>
            </wsdl:SendInvoiceResponseWithServerSignRequest>
          </soapenv:Body>
      </soapenv:Envelope>
      `

      var config = {
        method: 'post',
        url: 'https://efaturaws.izibiz.com.tr/EInvoiceWS?wsdl',
        headers: { 
          'Content-Type': 'text/xml'
        },
        data : pushData
      };
      
      let datas = await axios(config)

      if (datas != null && datas.status != 500) {
       
        var result1 = convert.xml2json(datas.data, {
          compact: true,
          ignoreText:false,
          ignoreDoctype:false,
          ignoreCdata:true,
          ignoreComment:true,
          ignoreAttributes:true,
          ignoreInstruction:true,
          ignoreDeclaration:true,
          indentAttributes:true,
          fullTagEmptyElement:true,
          indentCdata:true,
          spaces: 4});
  
          let snc = replaceall("SOAP-ENV:", "", result1);
  
          snc = replaceall("_text", "text", snc);
  
        return response.status(200).send({
          status: 200,
          message: 'OK',
          response: JSON.parse(snc)
        })


      }else {

        return response.status(200).send({
          status: 200,
          message: 'OK',
          response: datas
        })

      }
      

    } catch (error) {
      console.log('Ticari Faura Reddedilmesi Error --->',error)

      await this.error_mail('ticari_fatura_reddet',error)

        let xml = error.response.data

      var result1 = convert.xml2json(xml, {
        compact: true,
        ignoreText:false,
        ignoreDoctype:false,
        ignoreCdata:true,
        ignoreComment:true,
        ignoreAttributes:true,
        ignoreInstruction:true,
        ignoreDeclaration:true,
        indentAttributes:true,
        fullTagEmptyElement:true,
        indentCdata:true,
        spaces: 4});

        var original = result1
  
        let resp = replaceall("SOAP-ENV:", "", original);

        resp = replaceall("_text", "text", resp);

    

      return response.status(400).send({
        status: 400,
        message: 'OK',
        response: JSON.parse(resp)
      })

    }

  }

  // * Error Mail Services
  public async error_mail(name,err){

    try {
        

        await Mail.send((message) => {
          message
            .from('norply@tiko.com.tr')
            .to('huseyinozler@tiko.com.tr')
            .subject('e-Fatura Api Servis Hatası')
            .html(`
            
            <label style="font-weight: bold;" for="fname">Proje : label </label><br>
            <br>
            <label style="font-weight: bold;" for="fname">Servis Adı:`+name+` </label><br>
            <br>
            <label style="font-weight: bold;" for="lname">Hata Mesajı:`+err+`</label><br>
            
            `)
        })



    } catch (error) {
      console.log('Error Mail ---->',error)
    }

  }

  // * Taslak Silme Servisi
  public async taslakSilme({
    response,
    request
  }:HttpContextContract){

    try {

      let all = request.body()
      
      let taslakSil = `
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsdl="http://schemas.i2i.com/ei/wsdl"> 
          <soapenv:Header/>
            <soapenv:Body>
              <wsdl:CancelDraftInvoiceRequest>
                  <REQUEST_HEADER>
                    <SESSION_ID>`+all.SESSION_ID+`</SESSION_ID>
                    <COMPRESSED>`+all.COMPRESSED+`</COMPRESSED>
                  </REQUEST_HEADER>
                  <UUID>`+all.UUID+`</UUID>
              </wsdl:CancelDraftInvoiceRequest>
            </soapenv:Body>
        </soapenv:Envelope>
      `
          
      var config = {
        method: 'post',
        url: 'https://efaturaws.izibiz.com.tr/EFaturaOIB?wsdl',
        headers: { 
          'Content-Type': 'text/xml'
        },
        data : taslakSil
      };
      
      let datas = await axios(config)

      if (datas != null && datas.status != 500) {
       
        var result1 = convert.xml2json(datas.data, {
          compact: true,
          ignoreText:false,
          ignoreDoctype:false,
          ignoreCdata:true,
          ignoreComment:true,
          ignoreAttributes:true,
          ignoreInstruction:true,
          ignoreDeclaration:true,
          indentAttributes:true,
          fullTagEmptyElement:true,
          indentCdata:true,
          spaces: 4});
  
          let snc = replaceall("SOAP-ENV:", "", result1);
  
          snc = replaceall("_text", "text", snc);
  
        return response.status(200).send({
          status: 200,
          message: 'OK',
          response: JSON.parse(snc)
        })


      }else {

        return response.status(200).send({
          status: 200,
          message: 'OK',
          response: datas
        })

      }
      

    } catch (error) {
      console.log('Taslak Silme error ----->',error)


      await this.error_mail('ticari_fatura_reddet',error)

        let xml = error.response.data

      var result1 = convert.xml2json(xml, {
        compact: true,
        ignoreText:false,
        ignoreDoctype:false,
        ignoreCdata:true,
        ignoreComment:true,
        ignoreAttributes:true,
        ignoreInstruction:true,
        ignoreDeclaration:true,
        indentAttributes:true,
        fullTagEmptyElement:true,
        indentCdata:true,
        spaces: 4});

        var original = result1
  
        let resp = replaceall("SOAP-ENV:", "", original);

        resp = replaceall("_text", "text", resp);

    

      return response.status(400).send({
        status: 400,
        message: 'OK',
        response: JSON.parse(resp)
      })
    }

  }

  // * Taslakda bekleyen 
  public async taslakFaturaImza(){

 

  }

  // * Verileri Kuyruğa yeniden gönderme
  public async kuyrukIsle({
    response,
    request
  }: HttpContextContract){

    try {

      let all = request.body()

      if (all.SESSION_ID == undefined || all.data == undefined) {
        return response.status(400).send({
          status: 400,
          message: 'OK',
          response: ''
        })
      }

      let parseInvoice = JSON.parse(all.data)


      // * Türler
      let typeArr = ["PDF","XML","HTML"]

      for (let index = 0; index < parseInvoice.length; index++) {
        const element = parseInvoice[index];
        
        for (let t = 0; t < typeArr.length; t++) {
          const type = typeArr[t];


            let sqsOrderData:any = {
              MessageBody: JSON.stringify(
                {
                  'ID': element.ID,
                  'TYPE': type,
                  'DIRECTION': element.DIRECTION,
                  'UUID':element.UUID,
                  'SESSION_ID': all.SESSION_ID,
                  'INVOICE':element.INVOICE,
                  'HOOK':all.hook
                }
              ),
              QueueUrl: "https://sqs.eu-central-1.amazonaws.com/847516675391/download"
            };

            let sendSqsMessage = sqs.sendMessage(sqsOrderData).promise();
              sendSqsMessage.then((data) => {
                  console.log(`OrdersSvc | SUCCESS: ${data.MessageId}`);

              }).catch((err) => {
                  console.log(`OrdersSvc | ERROR: ${err}`);
              });
            }

        }

   

      // 

      // for (let i = 0; i < typeArr.length; i++) {
      //   const element = typeArr[i];
        
      //   let sqsOrderData:any = {
      //     MessageBody: JSON.stringify(
      //       {
      //         'ID': all.ID,
      //         'TYPE': element,
      //         'DIRECTION': 'OUT',
      //         'UUID':all.UUID,
      //         'SESSION_ID': all.SESSION_ID
      //       }
      //     ),
      //     QueueUrl: "https://sqs.eu-central-1.amazonaws.com/847516675391/download"
      // };


      // console.log('***********************')
      // console.log(sqsOrderData)
      // console.log('***********************')

      // let sendSqsMessage = sqs.sendMessage(sqsOrderData).promise();
      // sendSqsMessage.then((data) => {
      //     console.log(`OrdersSvc | SUCCESS: ${data.MessageId}`);

      // }).catch((err) => {
      //     console.log(`OrdersSvc | ERROR: ${err}`);
      // });

      // }


    } catch (error) {
      console.log('kuyrukIsle ----->',error)
    }

  }

  // * Fatura Numaralandırma Servisi
  public async faturaNumaralandirma({request,response}){

    try {

      let all = request.body()

      let pushData = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsdl="http://schemas.i2i.com/ei/wsdl">
      <soapenv:Header/>
      <soapenv:Body>
          <wsdl:LoadInvoiceRequest>

            <REQUEST_HEADER>
                  <SESSION_ID>`+all.SESSION_ID+`</SESSION_ID>
                  <APPLICATION_NAME>tiko</APPLICATION_NAME>
                  <COMPRESSED>N</COMPRESSED>
            </REQUEST_HEADER>
    
            <INVOICE>
              <CONTENT>
                `+all.CONTENT+`
              </CONTENT>
            </INVOICE>
            
          </wsdl:LoadInvoiceRequest>
      </soapenv:Body>
    </soapenv:Envelope>`
 
      var config = {
        method: 'post',
        url: 'https://efaturaws.izibiz.com.tr/EInvoiceWS?wsdl',
        headers: { 
          'Content-Type': 'text/xml'
        },
        data : pushData
      };
      
      let datas = await axios(config)



    } catch (error) {
      
      console.log('fatura numaralandırma error ----->',error)

    }

  }

  // * Numaralandırılmış faturaları imzalama
  public async numaralandirilmisFaturaImza({request,response}){

    try {

      let all = request.body()

       let pushData = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsdl="http://schemas.i2i.com/ei/wsdl">
            <soapenv:Header/>
            <soapenv:Body>
                <wsdl:SendInvoiceRequest>

                  <REQUEST_HEADER>
                        <SESSION_ID>`+all.SESSION_ID+`</SESSION_ID>
                        <APPLICATION_NAME>tiko</APPLICATION_NAME>
                        <COMPRESSED>N</COMPRESSED>
                  </REQUEST_HEADER>
          
                  <INVOICE ID="`+all.invoiceID+`">
                    <CONTENT>
                        `+ all.CONTENT +`
                    </CONTENT>
                  </INVOICE>
                  
                </wsdl:SendInvoiceRequest>
            </soapenv:Body>
          </soapenv:Envelope>`

          var config = {
            method: 'post',
            url: 'https://efaturaws.izibiz.com.tr/EFaturaOIB?wsdl',
            headers: { 
              'Content-Type': 'text/xml'
            },
            data : pushData
          };
          
          let datas = await axios(config)
    
    
      console.log('ok ok ok')
      
    } catch (error) {
      console.log('Numaralandırılmış Fatura Imzalama -------> ',error)
    }

  }


  // * Kullanıcı Kontör Bakiye Sorgulama
  public async GetCredit({request,response}){

    try {
      
      let all = request.body();


      let pushData = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsdl="http://schemas.i2i.com/ei/wsdl">
      <soapenv:Header/>
      <soapenv:Body>
          <wsdl:GetCreditRequest>
            <REQUEST_HEADER>
                <SESSION_ID>`+all.SESSION_ID+`</SESSION_ID>       
                <COMPRESSED>N</COMPRESSED>
            </REQUEST_HEADER>
            <CREDIT_DETAIL_FLAG>Y</CREDIT_DETAIL_FLAG>
          </wsdl:GetCreditRequest>
      </soapenv:Body>
    </soapenv:Envelope>
      ` 

    // GetCreditRequest
 
    var config = {
      method: 'POST',
      url: 'https://kullanimws.izibiz.com.tr/BillingWS?wsdl',
      data : pushData
    };
    
    let datas = await axios(config)


    return

    if (datas != null && datas.status != 500) {
     
      var result1 = convert.xml2json(datas.data, {
        compact: true,
        ignoreText:false,
        ignoreDoctype:false,
        ignoreCdata:true,
        ignoreComment:true,
        ignoreAttributes:true,
        ignoreInstruction:true,
        ignoreDeclaration:true,
        indentAttributes:true,
        fullTagEmptyElement:true,
        indentCdata:true,
        spaces: 4});

        let snc = replaceall("SOAP-ENV:", "", result1);
        snc = replaceall("_text", "text", snc);
        snc = replaceall("S:", "", snc);
        snc = replaceall("ns3:", "", snc);

        

      return response.status(200).send({
        status: 200,
        message: 'OK',
        response: JSON.parse(snc)
      })


    }else {

      return response.status(200).send({
        status: 200,
        message: 'OK',
        response: datas
      })

    }
    

    } catch (error) {
      console.log('error -------->',error)
    }

  }



  public async getCre({request,response}){

    try {

      let all = request.body();

      let pushData = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsdl="http://schemas.i2i.com/ei/wsdl">
      <soapenv:Header/>
      <soapenv:Body>
          <wsdl:GetCreditRequest>
            <REQUEST_HEADER>
                <SESSION_ID>`+all.SESSION_ID+`</SESSION_ID>       
                <COMPRESSED>N</COMPRESSED>
            </REQUEST_HEADER>
            <CREDIT_DETAIL_FLAG>Y</CREDIT_DETAIL_FLAG>
          </wsdl:GetCreditRequest>
      </soapenv:Body>
      </soapenv:Envelope>
      `

      var config = {
        method: 'post',
        url: 'https://kullanimws.izibiz.com.tr/BillingWS?wsdl',
        headers: { 
          'Content-Type': 'text/xml'
        },
        data : pushData
      };
      
      let datas = await axios(config)

      if (datas != null && datas.status != 500) {
     
        var result1 = convert.xml2json(datas.data, {
          compact: true,
          ignoreText:false,
          ignoreDoctype:false,
          ignoreCdata:true,
          ignoreComment:true,
          ignoreAttributes:true,
          ignoreInstruction:true,
          ignoreDeclaration:true,
          indentAttributes:true,
          fullTagEmptyElement:true,
          indentCdata:true,
          spaces: 4
        });
  

        let snc = replaceall("SOAP-ENV:", "", result1);
        snc = replaceall("_text", "text", snc);
        snc = replaceall("S:", "", snc);
        snc = replaceall("ns3:", "", snc);
        let parseData = JSON.parse(snc)


        let CREDIT_LOADED = parseData.Envelope.Body.GetCreditResponse.CREDIT_LOADED.text
        let CREDIT_BALANCE = parseData.Envelope.Body.GetCreditResponse.CREDIT_BALANCE.text
        let MESSAGE = parseData.Envelope.Body.GetCreditResponse.MESSAGE.text

        let obj:any = {}
        obj.CREDIT_LOADED = CREDIT_LOADED
        obj.CREDIT_BALANCE = CREDIT_BALANCE
        obj.MESSAGE = MESSAGE
  
        return response.status(200).send({
          status: 200,
          message: 'OK',
          response: obj
        })
  
  
      }else {
  
        return response.status(200).send({
          status: 200,
          message: 'OK',
          response: datas.data
        })
  
      }
      

    } catch (error) {
      console.log('get cre services error ------>',error)
    }

  }



}
