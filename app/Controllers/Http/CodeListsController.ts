import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import  fs  from "fs";
import { parsePhoneNumber } from "awesome-phonenumber";
const EmailValidator = require("email-deep-validator");
import Env from "@ioc:Adonis/Core/Env";

export default class CodeListsController {


  public async ceviri() {
    try {
      let arr = [
        "DAY",
        "MON",
        "ANN",
        "HUR",
        "D61",
        "D62",
        "C62",
        "PA",
        "BX",
        "MGM",
        "GRM",
        "KGM",
        "LTR",
        "TNE",
        "NT",
        "GT",
        "MMT",
        "CMT",
        "MTR",
        "KTM",
        "MLT",
        "MMQ",
        "CMK",
        "CMQ",
        "MTK",
        "MTQ",
        "KJO",
        "CLT",
        "CT",
        "KWH",
        "MWH",
        "CCT",
        "D30",
        "D40",
        "LPA",
        "B32",
        "NCL",
        "PR",
        "R9",
        "SET",
        "T3",
        "Q37",
        "Q39",
        "J39",
        "G52",
        "DZN",
        "DMK",
        "DMT",
        "HAR",
      ];
      let arr2 = [
        "Gün",
        "Ay",
        "Yıl",
        "Saat",
        "Dakika",
        "Saniye",
        "Adet",
        "Paket",
        "Kutu",
        "mg",
        "g",
        "kg",
        "lt",
        "ton",
        "Net Ton",
        "Gross ton",
        "mm",
        "cm",
        "m",
        "km",
        "ml",
        "mm3",
        "cm2",
        "cm3",
        "m2",
        "m3",
        "kJ",
        "cl",
        "KARAT",
        "KWH",
        "MWH",
        "Ton baş.taşıma kap.",
        "Brüt kalori",
        "1000 lt",
        "Saf alkol lt",
        "kg.m2",
        "Hücre adet",
        "Çift",
        "1000 m3",
        "Set",
        "1000 adet",
        "SCM",
        "NCM",
        "mmBTU",
        "CM³",
        "Düzine",
        "dm2",
        "dm",
        "ha",
      ];

      for (let i = 0; i < arr.length; i++) {
        const c = arr[i];
        const n = arr2[i];

        console.log({
          name: n,
          code: c,
        });
      }
    } catch (error) {
      console.log("olcu birimi error ------>", error);
    }
  }

  // * ÖLÇÜ BİRİMLERİ LİSTESİ
  public async olcuBirimleri({ response }: HttpContextContract) {
    try {
      const myPromise = new Promise((resolve, reject) => {
        fs.readFile(
          Env.get("OLCU_BIRIMLARI_PATH") + "olcuBrm.json",
          "utf8",
          (err, data) => {
            if (err) {
              console.error(err);
              reject(err);
              return;
            }

            resolve(JSON.parse(data));
          }
        );
      });

      return response.status(200).send({
        status: 200,
        name: "ÖLÇÜ BİRİMLERİ LİSTESİ",
        message: "OK",
        response: await myPromise,
      });
    } catch (error) {
      console.log(error);
    }
  }

  // * KISMİ İSTİSNA KODLARI LİSTESİ
  public async kismiIstisnaKodlari({ response }: HttpContextContract) {
    try {
      const myPromise = new Promise((resolve, reject) => {
        fs.readFile(
          Env.get("OLCU_BIRIMLARI_PATH") + "kismiIstisnaKodlar.json",
          "utf8",
          (err, data) => {
            if (err) {
              reject(err);
              console.error(err);
              return;
            }

            resolve(JSON.parse(data));
          }
        );
      });

      return response.status(200).send({
        status: 200,
        name: "KISMİ İSTİSNA KODLARI LİSTESİ",
        message: "OK",
        response: await myPromise,
      });
    } catch (error) {
      console.log("kismiIstisnaKodlari error --->", error);
    }
  }

  // * TAM İSTİSNA KODLARI LİSTESİ
  public async tamIstisnaKodlari({ response }: HttpContextContract) {
    try {
      const myPromise = new Promise((resolve, reject) => {
        fs.readFile(
          Env.get("OLCU_BIRIMLARI_PATH") + "kismiIstisnaKodlar.json",
          "utf8",
          (err, data) => {
            if (err) {
              reject(err);
              console.error(err);
              return;
            }

            resolve(JSON.parse(data));
          }
        );
      });

      return response.status(200).send({
        status: 200,
        name: "TAM İSTİSNA KODLARI LİSTESİ",
        message: "OK",
        response: await myPromise,
      });
    } catch (error) {
      console.log("kismiIstisnaKodlari error --->", error);
    }
  }

  // * ÖTV İSTİSNA KODLARI LİSTESİ
  public async otvIstisnaKodlari({ response }: HttpContextContract) {
    try {
      const myPromise = new Promise((resolve, reject) => {
        fs.readFile(
          Env.get("OLCU_BIRIMLARI_PATH") + "otvIstisnaKodlari.json",
          "utf8",
          (err, data) => {
            if (err) {
              reject(err);
              console.error(err);
              return;
            }

            resolve(JSON.parse(data));
          }
        );
      });

      return response.status(200).send({
        status: 200,
        name: "ÖTV İSTİSNA KODLARI LİSTESİ",
        message: "OK",
        response: await myPromise,
      });
    } catch (error) {
      console.log("kismiIstisnaKodlari error --->", error);
    }
  }

  // * ÖZEL MATRAH KODLARI LİSTESİ
  public async ozelMatrahKodlari({ response }: HttpContextContract) {
    try {
      const myPromise = new Promise((resolve, reject) => {
        fs.readFile(
          Env.get("OLCU_BIRIMLARI_PATH") + "ozelMatrahKodlari.json",
          "utf8",
          (err, data) => {
            if (err) {
              reject(err);
              console.error(err);
              return;
            }

            resolve(JSON.parse(data));
          }
        );
      });

      return response.status(200).send({
        status: 200,
        name: "ÖZEL MATRAH KODLARI LİSTESİ",
        message: "OK",
        response: await myPromise,
      });
    } catch (error) {
      console.log("kismiIstisnaKodlari error --->", error);
    }
  }

  // * İHRAÇ KAYITLI SATIŞLAR İLE DİİB VE GEÇİCİ KABUL REJİMİ KAPSAMINDAKİ SATIŞ KODLARI LİSTESİ
  public async ihracKytDiipGec({ response }: HttpContextContract) {
    try {
      const myPromise = new Promise((resolve, reject) => {
        fs.readFile(
          Env.get("OLCU_BIRIMLARI_PATH") + "ihracKytDiipGec.json",
          "utf8",
          (err, data) => {
            if (err) {
              reject(err);
              console.error(err);
              return;
            }

            resolve(JSON.parse(data));
          }
        );
      });

      return response.status(200).send({
        status: 200,
        name: "İHRAÇ KAYITLI SATIŞLAR İLE DİİB VE GEÇİCİ KABUL REJİMİ KAPSAMINDAKİ SATIŞ KODLARI LİSTESİ",
        message: "OK",
        response: await myPromise,
      });
    } catch (error) {
      console.log("kismiIstisnaKodlari error --->", error);
    }
  }

  // * VERGİ KODLARI LİSTESİ
  public async vergiKodlari({ response }: HttpContextContract) {
    try {
      const myPromise = new Promise((resolve, reject) => {
        fs.readFile(
          Env.get("OLCU_BIRIMLARI_PATH") + "vergiKodlari.json",
          "utf8",
          (err, data) => {
            if (err) {
              reject(err);
              console.error(err);
              return;
            }

            resolve(JSON.parse(data));
          }
        );
      });

      return response.status(200).send({
        status: 200,
        name: "VERGİ KODLARI LİSTESİ",
        message: "OK",
        response: await myPromise,
      });
    } catch (error) {
      console.log("kismiIstisnaKodlari error --->", error);
    }
  }

  // * TAŞIMA GÖNDERİM ŞEKLİ KODLARI
  public async tasimaGonderimKodlari({ response }: HttpContextContract) {
    try {
      const myPromise = new Promise((resolve, reject) => {
        fs.readFile(
          Env.get("OLCU_BIRIMLARI_PATH") + "tasimaGonderimKodlari.json",
          "utf8",
          (err, data) => {
            if (err) {
              reject(err);
              console.error(err);
              return;
            }

            resolve(JSON.parse(data));
          }
        );
      });

      return response.status(200).send({
        status: 200,
        name: "TAŞIMA GÖNDERİM ŞEKLİ KODLARI",
        message: "OK",
        response: await myPromise,
      });
    } catch (error) {
      console.log("kismiIstisnaKodlari error --->", error);
    }
  }

  // * TEVKİFAT KODLARI LİSTESİ
  public async tevkifatKodlari({ response }: HttpContextContract) {
    try {
      const myPromise = new Promise((resolve, reject) => {
        fs.readFile(
          Env.get("OLCU_BIRIMLARI_PATH") + "tevkifatKodlari.json",
          "utf8",
          (err, data) => {
            if (err) {
              reject(err);
              console.error(err);
              return;
            }

            resolve(JSON.parse(data));
          }
        );
      });

      return response.status(200).send({
        status: 200,
        name: "TEVKİFAT KODLARI LİSTESİ",
        message: "OK",
        response: await myPromise,
      });
    } catch (error) {
      console.log("kismiIstisnaKodlari error --->", error);
    }
  }

  // * PAKET/KAP CİNS KODLARI
  public async paketKap({ response }: HttpContextContract) {
    try {
      const myPromise = new Promise((resolve, reject) => {
        fs.readFile(
          Env.get("OLCU_BIRIMLARI_PATH") + "paketKap.json",
          "utf8",
          (err, data) => {
            if (err) {
              reject(err);
              console.error(err);
              return;
            }

            resolve(JSON.parse(data));
          }
        );
      });

      return response.status(200).send({
        status: 200,
        name: "PAKET/KAP CİNS KODLARI",
        message: "OK",
        response: await myPromise,
      });
    } catch (error) {
      console.log("kismiIstisnaKodlari error --->", error);
    }
  }

  // * PAKET/KAP CİNS KODLARI DEVAMI
  public async paketKapDevam({ response }: HttpContextContract) {
    try {
      const myPromise = new Promise((resolve, reject) => {
        fs.readFile(
          Env.get("OLCU_BIRIMLARI_PATH") + "paketKapDevam.json",
          "utf8",
          (err, data) => {
            if (err) {
              reject(err);
              console.error(err);
              return;
            }

            resolve(JSON.parse(data));
          }
        );
      });

      return response.status(200).send({
        status: 200,
        name: "PAKET/KAP CİNS KODLARI DEVAMI",
        message: "OK",
        response: await myPromise,
      });
    } catch (error) {
      console.log("kismiIstisnaKodlari error --->", error);
    }
  }

  // * Mail adresinin formatını - Domain ise domanin doğruluğunu - smtp doğruluğunu kontrol eder
  public async epostaKontrol({ request, response }: HttpContextContract) {
    try {
      let all = request.body();

      if (all.eposta == undefined) {
        return response.status(200).send({
          status: 200,
          name: "Mail adresi doğrulama servisi",
          message: "Eksik parametre (eposta)",
          response: "",
        });
      }

      const emailValidator = new EmailValidator();
      const { wellFormed, validDomain, validMailbox } =
        await emailValidator.verify(all.eposta);

      return response.status(200).send({
        status: 200,
        name: "Mail adresi doğrulama servisi",
        message: "OK",
        response: {
          wellFormed: wellFormed,
          validDomain: validDomain,
          validMailbox: validMailbox,
        },
      });
    } catch (error) {}
  }

  // * Telefon numarası kontrol
  public async gsmKontrol({ request, response }: HttpContextContract) {
    try {
      let all = request.all();

      if (all.gsm == undefined) {
        return response.status(200).send({
          status: 200,
          name: "Gsm doğrulama servisi",
          message: "Eksik parametre (gsm)",
          response: "",
        });
      }

      const pn = parsePhoneNumber(all.gsm, "TR");

      let valid = pn.isValid(); // -> true
      let isMobil = pn.isMobile(); // -> true
      pn.canBeInternationallyDialled(); // -> true
      let getNumber = pn.getNumber(); // -> '+46707123456'
      pn.getNumber("e164"); // -> '+46707123456' (default)
      let international = pn.getNumber("international"); // -> '+46 70 712 34 56'
      let national = pn.getNumber("national"); // -> '070-712 34 56'
      let rfc3966 = pn.getNumber("rfc3966"); // -> 'tel:+46-70-712-34-56'
      let significant = pn.getNumber("significant"); // -> '707123456'
      pn.getRegionCode(); // -> 'SE'
      pn.getCountryCode(); // -> 46

      pn.toJSON(); // -> json blob, so that:

      return response.status(200).send({
        status: 200,
        name: "Gsm doğrulama servisi",
        message: "OK",
        response: {
          isMobil: isMobil,
          getNumber: getNumber,
          significant: significant,
          rfc3966: rfc3966,
          national: national,
          number: international,
          valid: valid,
        },
      });
    } catch (error) {
      console.log("Error ---Telefon numarası doğrulama servisi-->", error);
    }
  }

  // * Para Birimleri Listesi
  public async paraBirimleri({ response }: HttpContextContract) {
    try {
      const myPromise = new Promise((resolve, reject) => {
        fs.readFile(
          Env.get("OLCU_BIRIMLARI_PATH") + "paraBirimleri.json",
          "utf8",
          (err, data) => {
            if (err) {
              reject(err);
              console.error(err);
              return;
            }

            resolve(JSON.parse(data));
          }
        );
      });

      return response.status(200).send({
        status: 200,
        name: "Para Birimleri Kodları",
        message: "OK",
        response: await myPromise,
      });
    } catch (error) {
      console.log("Para Birimleri Listesi error", error);
    }
  }

  // * Giden Fatura Durumları
  public async gidenFaturaDurumlari({ response }: HttpContextContract) {
    try {
      const myPromise = new Promise((resolve, reject) => {
        fs.readFile(
          Env.get("OLCU_BIRIMLARI_PATH") + "gidenFaturaDurum.json",
          "utf8",
          (err, data) => {
            if (err) {
              reject(err);
              console.error(err);
              return;
            }

            resolve(JSON.parse(data));
          }
        );
      });

      return response.status(200).send({
        status: 200,
        name: "Giden Fatura Durumları",
        message: "OK",
        response: await myPromise,
      });
    } catch (error) {
      console.log("Giden Fatura Durumlari error", error);
    }
  }

  // * Gelen Fatura Durumları
  public async gelenFaturaDurumlari({ response }: HttpContextContract) {
    try {
      const myPromise = new Promise((resolve, reject) => {
        fs.readFile(
          Env.get("OLCU_BIRIMLARI_PATH") + "gelenFaturaDurum.json",
          "utf8",
          (err, data) => {
            if (err) {
              reject(err);
              console.error(err);
              return;
            }

            resolve(JSON.parse(data));
          }
        );
      });

      return response.status(200).send({
        status: 200,
        name: "Gelen Fatura Durumları",
        message: "OK",
        response: await myPromise,
      });
    } catch (error) {
      console.log("Giden Fatura Durumlari error", error);
    }
  }

  // * Gib Durum Kodları
  public async gibDurumKod({ response }: HttpContextContract) {
    try {
      const myPromise = new Promise((resolve, reject) => {
        fs.readFile(
          Env.get("OLCU_BIRIMLARI_PATH") + "gibDurumKodlari.json",
          "utf8",
          (err, data) => {
            if (err) {
              reject(err);
              console.error(err);
              return;
            }

            resolve(JSON.parse(data));
          }
        );
      });

      return response.status(200).send({
        status: 200,
        name: "Gib Durum Kodları",
        message: "OK",
        response: await myPromise,
      });
    } catch (error) {
      console.log("Gib Durum Kodları error -->", error);
    }
  }

  // * Ülke Listesi
  public async ulkeListesi({ response }: HttpContextContract) {
    try {

      const myPromise = new Promise((resolve, reject) => {
        fs.readFile(
          Env.get("OLCU_BIRIMLARI_PATH") + "ulkeListesi.json",
          "utf8",
          (err, data) => {
            if (err) {
              reject(err);
              console.error(err);
              return;
            }

            resolve(JSON.parse(data));
          }
        );
      });

      return response.status(200).send({
        status: 200,
        name: "Ülkeler",
        message: "OK",
        response: await myPromise,
      });

    } catch (error) {
      console.log("Ülkeler Kodları error -->", error);
    }
  }


  // * İstisna Kodları Listesi
  public async istisnaKodList({ response }: HttpContextContract){

    try {

      const myPromise = new Promise((resolve, reject) => {
        fs.readFile(
          Env.get("OLCU_BIRIMLARI_PATH") + "istisnaKodlari.json",
          "utf8",
          (err, data) => {
            if (err) {
              reject(err);
              console.error(err);
              return;
            }
            resolve(JSON.parse(data));
          }
        );
      });

      return response.status(200).send({
        status: 200,
        name: "İstisna Sebebi Listesi",
        message: "OK",
        response: await myPromise,
      });
      
    } catch (error) {
      
    }

  }


  public async ilIlceListesi({ response }: HttpContextContract){

    try {

      const myPromise = new Promise((resolve, reject) => {
        fs.readFile(
          Env.get("OLCU_BIRIMLARI_PATH") + "il_ilce.json",
          "utf8",
          (err, data) => {
            if (err) {
              reject(err);
              console.error(err);
              return;
            }
            resolve(JSON.parse(data));
          }
        );
      });


      return response.status(200).send({
        status: 200,
        name: "il listesi",
        message: "OK",
        response: await myPromise,
      });
      
    } catch (error) {
      console.log('error ------>',error)
    }

  }


  // * E arsiv durum kodları
  public async eArsivDurumKodlari({ response }: HttpContextContract){

    try {

      const myPromise = new Promise((resolve, reject) => {
        fs.readFile(
          Env.get("OLCU_BIRIMLARI_PATH") + "eArsivDurumKodlari.json",
          "utf8",
          (err, data) => {
            if (err) {
              reject(err);
              console.error(err);
              return;
            }
            resolve(JSON.parse(data));
          }
        );
      });


      return response.status(200).send({
        status: 200,
        name: "E-Arşiv Durumları",
        message: "OK",
        response: await myPromise,
      });
      
    } catch (error) {
      console.log('error ------>',error)
    }

  }


  // * E arsiv posta gönderim kodlari
  public async eArsivPostaGonderimKodlari({ response }: HttpContextContract){

    try {

      const myPromise = new Promise((resolve, reject) => {
        fs.readFile(
          Env.get("OLCU_BIRIMLARI_PATH") + "eArsivPostaGonderimKodlari.json",
          "utf8",
          (err, data) => {
            if (err) {
              reject(err);
              console.error(err);
              return;
            }
            resolve(JSON.parse(data));
          }
        );
      });


      return response.status(200).send({
        status: 200,
        name: "E-Arşiv Posta Gonderim Kodları",
        message: "OK",
        response: await myPromise,
      });
      
    } catch (error) {
      console.log('error ------>',error)
    }

  }



}
