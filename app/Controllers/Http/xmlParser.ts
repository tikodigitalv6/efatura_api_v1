import { Analysis } from "aws-sdk/clients/quicksight";

var replaceall = require("replaceall");
var convert = require('xml-js');
var moment = require('moment')
import miktarKod from './miktarKod';
let mKod = new miktarKod()


export default class eArsivXml {

    public async xmltoJson(xml){

        try {

            var fatura = convert.xml2json(xml, {
                compact: true,
                spaces: 4
            });

            let ivd = replaceall("cac:", "", fatura);
            ivd = replaceall("cbc:", "", ivd);
            ivd = replaceall("_text", "text", ivd);
            ivd = replaceall("q1:","",ivd)
            ivd = replaceall("ns4:","",ivd)
            ivd = replaceall("ns1:","",ivd)
            ivd = replaceall("ns2:","",ivd)
            ivd = replaceall("ns3:","",ivd)
            ivd = replaceall("ns4:","",ivd)
            ivd = replaceall("ns5:","",ivd)
            ivd = replaceall("ns6:","",ivd)
            ivd = replaceall("ns7:","",ivd)
            ivd = replaceall("ns8:","",ivd)
            ivd = replaceall("ns9:","",ivd)
            ivd = replaceall("ns10:","",ivd)
            ivd = replaceall("ns11:","",ivd)
            
            
            ivd = JSON.parse(ivd)
            console.log(ivd);


            let iade:any = []
            let iadeObj:any = {}

            if (Array.isArray(ivd.Invoice.BillingReference)) {
              

                for (let id = 0; id < ivd.Invoice.BillingReference.length; id++) {

                    const element = ivd.Invoice.BillingReference[id];

                

                    iadeObj.IadeNo = element.InvoiceDocumentReference?.ID?.text
                    iadeObj.Date = element.InvoiceDocumentReference?.IssueDate?.text

                    iade.push(iadeObj)

                }


            }else {

                iadeObj.IadeNo = ivd.Invoice?.BillingReference?.InvoiceDocumentReference?.ID?.text
                iadeObj.Date = ivd.Invoice?.BillingReference?.InvoiceDocumentReference?.IssueDate?.text
                iade.push(iadeObj)

            }



   


            let faturaBilgileri:any = {}
            faturaBilgileri.versiyon = ivd.Invoice.UBLVersionID?.text
            faturaBilgileri.OzellestirmeId = ivd.Invoice.CustomizationID?.text
            faturaBilgileri.faturaProfilId = ivd.Invoice.ProfileID?.text
            faturaBilgileri.faturaNo = ivd.Invoice.ID?.text
            faturaBilgileri.uuid = ivd.Invoice.UUID?.text
            faturaBilgileri.faturaTarihi = moment(ivd.Invoice.IssueDate.text).format('YYYY-MM-DD')


            if (ivd.Invoice.IssueTime == undefined) {
                faturaBilgileri.faturaSaati = '00:00'
            }else {
                faturaBilgileri.faturaSaati = ivd.Invoice?.IssueTime?.text
            }
            
            faturaBilgileri.faturaTipi = ivd.Invoice?.InvoiceTypeCode?.text





            faturaBilgileri.not =ivd.Invoice.Note?.text
            faturaBilgileri.paraBirimi = ivd.Invoice.DocumentCurrencyCode.text
            faturaBilgileri.satirSayisi = ivd.Invoice.LineCountNumeric.text

            let saticiBilgileri:any = {}

            saticiBilgileri.webSite = (ivd.Invoice.AccountingSupplierParty.Party.WebsiteURI == undefined ? "" : ivd.Invoice.AccountingSupplierParty.Party.WebsiteURI.text)

            if (ivd.Invoice.AccountingSupplierParty.Party.PartyIdentification[0] == undefined) {
                saticiBilgileri.vkn = ivd.Invoice.AccountingSupplierParty.Party.PartyIdentification.ID.text
            } else {
                saticiBilgileri.vkn = ivd.Invoice.AccountingSupplierParty.Party.PartyIdentification[0].ID.text
            }

            if (ivd.Invoice.AccountingSupplierParty.Party.PartyIdentification[1] == undefined) {
                saticiBilgileri.tcno = ivd.Invoice.AccountingSupplierParty.Party.PartyIdentification.ID.text
            } else {
                saticiBilgileri.tcno = ivd.Invoice.AccountingSupplierParty.Party.PartyIdentification[1].ID.text
            }

            saticiBilgileri.unvan = ivd.Invoice.AccountingSupplierParty?.Party?.PartyName?.Name?.text
            saticiBilgileri.apartmanNo = (ivd.Invoice.AccountingSupplierParty.Party.PostalAddress.Room == undefined ? "" : ivd.Invoice.AccountingSupplierParty.Party.PostalAddress.Room.text)
            saticiBilgileri.sokakAd = (ivd.Invoice.AccountingSupplierParty.Party.PostalAddress.StreetName == undefined ? "" : ivd.Invoice.AccountingSupplierParty.Party.PostalAddress.StreetName.text)
            saticiBilgileri.binaAd = (ivd.Invoice.AccountingSupplierParty.Party.PostalAddress.BuildingName == undefined ? "" : ivd.Invoice.AccountingSupplierParty.Party.PostalAddress.BuildingName.text)
            saticiBilgileri.binaNo = (ivd.Invoice.AccountingSupplierParty.Party.PostalAddress.BuildingNumber == undefined ? "" : ivd.Invoice.AccountingSupplierParty.Party.PostalAddress.BuildingNumber.text)
            saticiBilgileri.ilce = (ivd.Invoice.AccountingSupplierParty.Party.PostalAddress.CitySubdivisionName == undefined ? "" : ivd.Invoice.AccountingSupplierParty.Party.PostalAddress.CitySubdivisionName.text)
            saticiBilgileri.il = (ivd.Invoice.AccountingSupplierParty.Party.PostalAddress.CityName == undefined ? "" : ivd.Invoice.AccountingSupplierParty.Party.PostalAddress.CityName.text)
            saticiBilgileri.postaKodu = (ivd.Invoice.AccountingSupplierParty.Party.PostalAddress.PostalZone == undefined ? "" : ivd.Invoice.AccountingSupplierParty.Party.PostalAddress.PostalZone.text)
            saticiBilgileri.mahalle = (ivd.Invoice.AccountingSupplierParty.Party.PostalAddress.Region == undefined ? "" : ivd.Invoice.AccountingSupplierParty.Party.PostalAddress.Region.text)
            saticiBilgileri.ulke = (ivd.Invoice.AccountingSupplierParty.Party.PostalAddress.Country.Name == undefined ? "" : ivd.Invoice.AccountingSupplierParty.Party.PostalAddress.Country.Name.text)
            saticiBilgileri.vergiDairesi = (ivd.Invoice.AccountingSupplierParty.Party.PartyTaxScheme?.TaxScheme.Name == undefined ? "" : ivd.Invoice.AccountingSupplierParty.Party.PartyTaxScheme.TaxScheme.Name.text)
            saticiBilgileri.telefon = (ivd.Invoice.AccountingSupplierParty?.Party?.Contact?.Telephone == undefined ? "" : ivd.Invoice.AccountingSupplierParty?.Party?.Contact?.Telephone?.text)
            saticiBilgileri.fax = (ivd.Invoice.AccountingSupplierParty?.Party?.Contact?.Telefax == undefined ? "" : ivd.Invoice.AccountingSupplierParty?.Party?.Contact?.Telefax?.text)
            saticiBilgileri.email = (ivd.Invoice.AccountingSupplierParty?.Party?.Contact?.ElectronicMail == undefined ? "" : ivd.Invoice.AccountingSupplierParty?.Party?.Contact?.ElectronicMail?.text)
            saticiBilgileri.ad = ivd.Invoice.AccountingSupplierParty?.Party?.Person?.FirstName?.text
            saticiBilgileri.soyad = ivd.Invoice.AccountingSupplierParty?.Party?.Person?.FamilyName?.text


            let aliciBilgileri:any = {}
            aliciBilgileri.webSite = (ivd.Invoice.AccountingCustomerParty?.Party?.WebsiteURI == undefined ? "" : ivd.Invoice.AccountingCustomerParty.Party?.WebsiteURI?.text)


            if (ivd.Invoice.AccountingCustomerParty.Party?.PartyIdentification.ID?.text?.length == 11) {
                aliciBilgileri.tcno = (ivd.Invoice.AccountingCustomerParty?.Party?.PartyIdentification?.ID?.text == undefined ? "" : ivd?.Invoice?.AccountingCustomerParty?.Party?.PartyIdentification?.ID?.text)
            } else {
                aliciBilgileri.vkn = (ivd.Invoice.AccountingCustomerParty?.Party?.PartyIdentification[0]?.ID?.text == undefined ? "" : ivd?.Invoice?.AccountingCustomerParty?.Party?.PartyIdentification[0]?.ID?.text)
            }

            aliciBilgileri.unvan = ivd.Invoice.AccountingCustomerParty?.Party?.PartyName?.Name?.text
            aliciBilgileri.apartmanNo = (ivd.Invoice.AccountingCustomerParty.Party.PostalAddress.Room == undefined ? "" : ivd.Invoice.AccountingCustomerParty.Party.PostalAddress.Room.text)
            aliciBilgileri.sokakAd = (ivd.Invoice.AccountingCustomerParty.Party.PostalAddress.StreetName == undefined ? "" : ivd.Invoice.AccountingCustomerParty.Party.PostalAddress.StreetName.text)
            aliciBilgileri.binaAd = (ivd.Invoice.AccountingCustomerParty.Party.PostalAddress.BuildingName == undefined ? "" : ivd.Invoice.AccountingCustomerParty.Party.PostalAddress.BuildingName.text)
            aliciBilgileri.binaNo = (ivd.Invoice.AccountingCustomerParty.Party.PostalAddress.BuildingNumber == undefined ? "" : ivd.Invoice.AccountingCustomerParty.Party.PostalAddress.BuildingNumber.text)
            aliciBilgileri.ilce = (ivd.Invoice.AccountingCustomerParty.Party.PostalAddress.CitySubdivisionName == undefined ? "" : ivd.Invoice.AccountingCustomerParty.Party.PostalAddress.CitySubdivisionName.text)
            aliciBilgileri.il = (ivd.Invoice.AccountingCustomerParty.Party.PostalAddress.CityName == undefined ? "" : ivd.Invoice.AccountingCustomerParty.Party.PostalAddress.CityName.text)
            aliciBilgileri.postaKodu = (ivd.Invoice.AccountingCustomerParty.Party.PostalAddress.PostalZone == undefined ? "" : ivd.Invoice.AccountingCustomerParty.Party.PostalAddress.PostalZone.text)
            aliciBilgileri.sehir = (ivd.Invoice.AccountingCustomerParty.Party.PostalAddress.Region == undefined ? "" : ivd.Invoice.AccountingCustomerParty.Party.PostalAddress.Region.text)
            aliciBilgileri.ulke = (ivd.Invoice.AccountingCustomerParty.Party.PostalAddress.Country.Name == undefined ? "" : ivd.Invoice.AccountingCustomerParty.Party.PostalAddress.Country.Name.text)

            if (ivd.Invoice.AccountingCustomerParty.Party == undefined) {
                aliciBilgileri.vergiDairesi = (ivd.Invoice.AccountingCustomerParty.Party.PartyTaxScheme.TaxScheme.Name == undefined ? "" : ivd.Invoice.AccountingCustomerParty.Party.PartyTaxScheme.TaxScheme.Name.text)
            } else {
                aliciBilgileri.vergiDairesi = ''
            }

            aliciBilgileri.telefon = (ivd.Invoice.AccountingCustomerParty?.Party?.Contact?.Telephone == undefined ? "" : ivd.Invoice.AccountingCustomerParty.Party?.Contact?.Telephone?.text)
            aliciBilgileri.fax = (ivd.Invoice.AccountingCustomerParty?.Party?.Contact?.Telefax == undefined ? "" : ivd.Invoice.AccountingCustomerParty?.Party?.Contact?.Telefax?.text)
            aliciBilgileri.email = (ivd.Invoice.AccountingCustomerParty?.Party?.Contact?.ElectronicMail == undefined ? "" : ivd.Invoice.AccountingCustomerParty?.Party?.Contact?.ElectronicMail?.text)

            aliciBilgileri.ad = (ivd.Invoice.AccountingCustomerParty?.Party?.Person == undefined ? "" : ivd.Invoice.AccountingCustomerParty?.Party?.Person?.FirstName?.text)
            aliciBilgileri.soyad = (ivd.Invoice.AccountingCustomerParty?.Party?.Person == undefined ? "" : ivd.Invoice.AccountingCustomerParty?.Party?.Person?.FamilyName?.text)

            let lineArr:any = []
            let line = ivd.Invoice.InvoiceLine


            let top0kdv:any = []
            let top1kdv:any = []
            let top8kdv:any = []
            let top18kdv:any = []
            let top10kdv:any = []
            let top20kdv:any = []

            let genel:any = {}

            // * Verinin Array olup olmadığını kontrol eder tek satır faturalarda durum farklı 
            let arrCheck = Array.isArray(line)

            if (arrCheck == true) {

                for (let l = 0; l < line.length; l++) {
                    const element = line[l];
                    let faturaSatirlari:any = {}
                    faturaSatirlari.id = element.ID.text
                    faturaSatirlari.malHizmet = element.Item.Name.text
                    faturaSatirlari.birimFiyat = parseFloat(element.Price.PriceAmount.text)
                    faturaSatirlari.miktarKod = element.InvoicedQuantity._attributes.unitCode

                    let miktarOrj = await mKod.miktar(element.InvoicedQuantity?._attributes?.unitCode)
                    faturaSatirlari.miktar = miktarOrj


                    if (element.AllowanceCharge != undefined) {
                        let totalIsk = 0;
                        if(Array.isArray(element.AllowanceCharge)){
                            for (let index = 0; index < element.AllowanceCharge.length; index++) {
                                const element2 = element.AllowanceCharge[index];
                                totalIsk = totalIsk + parseFloat(element2.Amount.text) 
                            } 
                        }else{
                            totalIsk =  parseFloat(element.AllowanceCharge?.Amount?.text)
                        }
                        
                        faturaSatirlari.iskontoOrani = parseFloat(element.AllowanceCharge?.MultiplierFactorNumeric?.text) * 100
                        faturaSatirlari.iskontoTutari = totalIsk;
    
                    }else{

                        faturaSatirlari.iskontoOrani = 0
                        faturaSatirlari.iskontoTutari = 0

                    }

                    

                    faturaSatirlari.kdvOrani = parseFloat(element?.TaxTotal?.TaxSubtotal?.Percent?.text)
                    faturaSatirlari.kdvTutar = parseFloat(element?.TaxTotal?.TaxSubtotal?.TaxAmount?.text)
                    faturaSatirlari.malHizmetTutar = parseFloat(element?.LineExtensionAmount?.text)
                    faturaSatirlari.birim = parseFloat(element?.InvoicedQuantity?.text)

                    if (parseFloat(element?.TaxTotal?.TaxSubtotal?.Percent?.text) == 0) {
                        top0kdv.push(element?.TaxTotal?.TaxSubtotal?.TaxAmount?.text)
                    } else if (parseFloat(element?.TaxTotal?.TaxSubtotal?.Percent?.text) == 1) {
                         top1kdv.push(element?.TaxTotal?.TaxSubtotal?.TaxAmount?.text)
                    } else if (parseFloat(element?.TaxTotal?.TaxSubtotal?.Percent?.text) == 8) {
                        top8kdv.push(element?.TaxTotal?.TaxSubtotal?.TaxAmount?.text)
                    } else if (parseFloat(element?.TaxTotal?.TaxSubtotal?.Percent?.text) == 18) {
                        top18kdv.push(element?.TaxTotal?.TaxSubtotal?.TaxAmount?.text)
                    } else if (parseFloat(element?.TaxTotal?.TaxSubtotal?.Percent?.text) == 10) {
                        top10kdv.push(element?.TaxTotal?.TaxSubtotal?.TaxAmount?.text)
                    } else if (parseFloat(element?.TaxTotal?.TaxSubtotal?.Percent?.text) == 20) {
                        top20kdv.push(element?.TaxTotal?.TaxSubtotal?.TaxAmount?.text)
                    }


                 

                    lineArr.push(faturaSatirlari)

                }

                

            } else {

                let faturaSatirlari:any = {}
                faturaSatirlari.id = line.ID.text
                faturaSatirlari.malHizmet = line.Item.Name.text
                faturaSatirlari.birimFiyat = parseFloat(line.Price.PriceAmount.text)
                faturaSatirlari.birim = line.InvoicedQuantity.text

                let miktarOrj = await mKod.miktar(line.InvoicedQuantity._attributes.unitCode)
                faturaSatirlari.miktar = miktarOrj

               
                

                if (line.AllowanceCharge != undefined) {
                    let totalIsk = 0;
                    if(Array.isArray(line.AllowanceCharge)){
                        for (let index = 0; index < line.AllowanceCharge.length; index++) {
                            const element = line.AllowanceCharge[index];
                            totalIsk = totalIsk + parseFloat(element.Amount.text) 
                        } 
                    }else{
                        totalIsk =  parseFloat(line.AllowanceCharge?.Amount?.text)
                    }
                    
                    faturaSatirlari.iskontoOrani = parseFloat(line.AllowanceCharge?.MultiplierFactorNumeric?.text) * 100
                    faturaSatirlari.iskontoTutari = totalIsk;

                }else{
                    faturaSatirlari.iskontoOrani = 0
                    faturaSatirlari.iskontoTutari = 0
                }
                

                faturaSatirlari.kdvOrani = parseFloat((line.TaxTotal?.TaxSubtotal?.Percent == undefined ? "" : line.TaxTotal?.TaxSubtotal?.Percent?.text))
                faturaSatirlari.kdvTutar = parseFloat((line?.TaxTotal?.TaxSubtotal?.TaxAmount?.text == undefined ? "" : line?.TaxTotal?.TaxSubtotal?.TaxAmount?.text))
                
                // faturaSatirlari.vergiMuafiyetSebebiKodu = line.TaxTotal.TaxAmount.TaxCategory.TaxExemptionReasonCode?.text
                // faturaSatirlari.vergiMuafiyetSebebi = line.TaxTotal.TaxAmount.TaxCategory.TaxExemptionReason?.text

                faturaSatirlari.malHizmetTutar = parseFloat((line.LineExtensionAmount == undefined ? "" : line.LineExtensionAmount.text))
                faturaSatirlari.miktarKod = line.InvoicedQuantity._attributes.unitCode


                if (line.Delivery != undefined) {
                    faturaSatirlari.gtip = line?.Delivery?.Shipment?.GoodsItem?.RequiredCustomsID?.text
                }

		  

                if (parseFloat((line.TaxTotal?.TaxSubtotal?.Percent == undefined ? "" : line.TaxTotal?.TaxSubtotal?.Percent?.text)) == 0) {
                    top0kdv.push(line.TaxTotal.TaxSubtotal.TaxAmount.text)
                } else if (parseFloat((line.TaxTotal?.TaxSubtotal?.Percent == undefined ? "" : line.TaxTotal?.TaxSubtotal?.Percent?.text)) == 1) {
                    top1kdv.push(line.TaxTotal.TaxSubtotal.TaxAmount.text)
                } else if (parseFloat((line.TaxTotal?.TaxSubtotal?.Percent == undefined ? "" : line.TaxTotal?.TaxSubtotal?.Percent?.text)) == 8) {
                    top8kdv.push(line.TaxTotal.TaxSubtotal.TaxAmount.text)
                } else if (parseFloat((line.TaxTotal?.TaxSubtotal?.Percent == undefined ? "" : line.TaxTotal?.TaxSubtotal?.Percent?.text)) == 18) {
                    top18kdv.push(line.TaxTotal.TaxSubtotal.TaxAmount.text)
                } else if (parseFloat((line.TaxTotal?.TaxSubtotal?.Percent == undefined ? "" : line.TaxTotal?.TaxSubtotal?.Percent?.text)) == 10) {
                    top10kdv.push(line.TaxTotal.TaxSubtotal.TaxAmount.text)
                } else if (parseFloat((line.TaxTotal?.TaxSubtotal?.Percent == undefined ? "" : line.TaxTotal?.TaxSubtotal?.Percent?.text)) == 20) {
                    top20kdv.push(line.TaxTotal.TaxSubtotal.TaxAmount.text)
                }

                lineArr.push(faturaSatirlari)

            }

            if (line.WithholdingTaxTotal != undefined) {


                // * Tevkifatın Array olup olmadığını kontrol eder
                let tevkifatArrCheck = Array.isArray(line.WithholdingTaxTotal)

                let tevkifat = {}

                if (tevkifatArrCheck == true) {

                } else if (tevkifatArrCheck == false) {
                    let faturaSatirlari:any = {}
                    faturaSatirlari.tevkifatVergilendirilecekTutar = parseFloat(line.WithholdingTaxTotal.TaxSubtotal.TaxableAmount?.text)
                    faturaSatirlari.tevkifatVergi = parseFloat(line.WithholdingTaxTotal?.TaxAmount.text)
                    
                    faturaSatirlari.tevkifatVergiAraToplam = parseFloat(line.WithholdingTaxTotal.TaxSubtotal.TaxAmount?.text)
                    faturaSatirlari.tevkifatSatirSayisi = parseFloat(line.WithholdingTaxTotal.TaxSubtotal.CalculationSequenceNumeric?.text)
                    faturaSatirlari.tevkifatYuzde = parseFloat(line.WithholdingTaxTotal.TaxSubtotal.Percent?.text)
                    faturaSatirlari.tevkifatKodu = line.WithholdingTaxTotal.TaxSubtotal.TaxCategory.TaxScheme.TaxTypeCode?.text
                    faturaSatirlari.tevkifatKodAciklama = line.WithholdingTaxTotal.TaxSubtotal.TaxCategory.TaxScheme?.Name.text

                    genel.tevkifatVergilendirilecekTutar = parseFloat(line.WithholdingTaxTotal.TaxSubtotal.TaxableAmount?.text)
                    genel.tevkifatVergiAraToplam = parseFloat(line.WithholdingTaxTotal.TaxSubtotal.TaxAmount?.text)
                    genel.tevkifatSatirSayisi = parseFloat(line.WithholdingTaxTotal.TaxSubtotal.CalculationSequenceNumeric?.text)
                    genel.tevkifatYuzde = parseFloat(line.WithholdingTaxTotal.TaxSubtotal.Percent?.text)

                    // * Tevkifatlı durumlarda Fatura Bilgisine Durumları iletir alanında tevkifatın çıkması için Faturabilgisi not 
                    if (faturaBilgileri.faturaTipi == 'TEVKIFAT') {
                        faturaBilgileri.tevkifatKodu = parseFloat(line.WithholdingTaxTotal.TaxSubtotal.TaxCategory.TaxScheme.TaxTypeCode?.text)
                        faturaBilgileri.tevkifatSebebi = parseFloat(line.WithholdingTaxTotal.TaxSubtotal.TaxCategory.TaxScheme.Name?.text)
                    }

                }


            }

            var toplam0kdv = 0;
            for (var i = 0; i < top0kdv.length; i++) {
                if (isNaN(top0kdv[i])) {
                    continue;
                }
                toplam0kdv += Number(top0kdv[i]);
            }

         
            
            var toplam1kdv = 0;
            for (var i = 0; i < top1kdv.length; i++) {
                if (isNaN(top1kdv[i])) {
                    continue;
                }
                toplam1kdv += Number(top1kdv[i]);
            }


            var toplam8kdv = 0;
            for (var i = 0; i < top8kdv.length; i++) {
                if (isNaN(top8kdv[i])) {
                    continue;
                }
                toplam8kdv += Number(top8kdv[i]);
            }

            var toplam18kdv = 0;
            for (var i = 0; i < top18kdv.length; i++) {
                if (isNaN(top18kdv[i])) {
                    continue;
                }
                toplam18kdv += Number(top18kdv[i]);
            }

            var toplam10kdv = 0;
            for (var i = 0; i < top10kdv.length; i++) {
                if (isNaN(top10kdv[i])) {
                    continue;
                }
                toplam10kdv += Number(top10kdv[i]);
            }

            var toplam20kdv = 0;
            for (var i = 0; i < top20kdv.length; i++) {
                if (isNaN(top20kdv[i])) {
                    continue;
                }
                toplam20kdv += Number(top20kdv[i]);
            }


            genel.malHizmetToplamTutari = parseFloat(ivd.Invoice.LegalMonetaryTotal.LineExtensionAmount.text)
            genel.vergilerDahilToplamTutar = parseFloat(ivd.Invoice.LegalMonetaryTotal.TaxInclusiveAmount.text)
            
            if (ivd.Invoice.LegalMonetaryTotal.AllowanceTotalAmount != undefined) {
                genel.toplamIskonto = parseFloat(ivd.Invoice.LegalMonetaryTotal.AllowanceTotalAmount.text)
            }else{
                genel.toplamIskonto = 0
            }

            genel.odenecekTutar = parseFloat(ivd.Invoice.LegalMonetaryTotal.PayableAmount.text)
            genel.hesaplananKdv0 = toplam0kdv
            genel.hesaplananKdv1 = toplam1kdv
            genel.hesaplananKdv8 = toplam8kdv
            genel.hesaplananKdv18 = toplam18kdv
            genel.hesaplananKdv10 = toplam10kdv
            genel.hesaplananKdv20 = toplam20kdv
            

            faturaBilgileri.vergiMuafiyetSebebi = ivd.Invoice.TaxTotal.TaxSubtotal?.TaxCategory?.TaxExemptionReason?.text
            faturaBilgileri.vergiMuafiyetKodu = ivd.Invoice.TaxTotal.TaxSubtotal?.TaxCategory?.TaxExemptionReasonCode?.text
            
            let objData:any = {}

            objData.faturaBilgileri = faturaBilgileri
            objData.saticiBilgileri =saticiBilgileri
            objData.aliciBilgileri = aliciBilgileri
            objData.faturaSatirlari = lineArr


            if (iade[0].IadeNo != undefined) {
                objData.iadeBilgileri =iade
            }
           

            objData.genelToplam =genel

            return objData

        } catch (error) {
            console.log('error', error)
        }

    }

}

