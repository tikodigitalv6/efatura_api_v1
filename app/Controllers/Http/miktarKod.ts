export default class eArsivXml {

    public async miktar(code){

        try {


            let data;
            if (code == 'C62') {
                data = 'ADET'
            }else if(code == 'DAY'){
                data = 'Gün'
            }else if(code == 'MON'){
                data = 'Ay'
            }else if(code == 'ANN'){
                data = 'Yıl'
            }else if(code == 'HUR'){
                data = 'Saat'
            }else if(code == 'D61'){
                data = 'Dakika'
            }else if(code == 'D62'){
                data = 'Saniye'
            }else if(code == 'PA'){
                data = 'Paket'
            }else if(code == 'BX'){
                data = 'Kutu'
            }else if(code == 'MGM'){
                data = 'Mg'
            }else if(code == 'GRM'){
                data = 'G'
            }else if(code == 'KGM'){
                data = 'Kg'
            }else if(code == 'LTR'){
                data = 'Lt'
            }else if(code == 'TNE'){
                data = 'Ton'
            }else if(code == 'NT'){
                data = 'Net Ton'
            }else if(code == 'GT'){
                data = 'Gross ton'
            }else if(code == 'MMT'){
                data = 'Mm'
            }else if(code == 'CMT'){
                data = 'Cm'
            }else if(code == 'MTR'){
                data = 'M'
            }else if(code == 'KTM'){
                data = 'Km'
            }else if(code == 'MLT'){
                data = 'Ml'
            }else if(code == 'MMQ'){
                data = 'Mm3'
            }else if(code == 'CMK'){
                data = 'Cm2'
            }else if(code == 'CMQ'){
                data = 'Cm3'
            }else if(code == 'MTK'){
                data = 'M2'
            }else if(code == 'MTQ'){
                data = 'M3'
            }else if(code == 'KJO'){
                data = 'kJ'
            }else if(code == 'CLT'){
                data = 'Cl'
            }else if(code == 'CT'){
                data = 'KARAT'
            }else if(code == 'KWH'){
                data = 'KWH'
            }else if(code == 'MWH'){
                data = 'MWH'
            }else if(code == 'CCT'){
                data = 'Ton baş.taşıma kap.'
            }else if(code == 'D30'){
                data = 'Brüt kalori'
            }else if(code == 'D40'){
                data = '1000 lt'
            }else if(code == 'LPA'){
                data = 'Saf alkol lt'
            }else if(code == 'B32'){
                data = 'Kg.m2'
            }else if(code == 'NCL'){
                data = 'Hücre adet'
            }else if(code == 'PR'){
                data = 'Çift'
            }else if(code == 'R9'){
                data = '1000 m3'
            }else if(code == 'SET'){
                data = 'Set'
            }else if(code == 'T3'){
                data = '1000 adet'
            }else if(code == 'Q37'){
                data = 'Scm'
            }else if(code == 'Q39'){
                data = 'Ncm'
            }else if(code == 'J39'){
                data = 'mmBTU'
            }else if(code == 'G52'){
                data = 'CM³'
            }else if(code == 'DZN'){
                data = 'Düzine'
            }else if(code == 'DMK'){
                data = 'Dm2'
            }else if(code == 'DMT'){
                data = 'Dm'
            }else if(code == 'HAR'){
                data = 'Ha'
            }else if(code == 'LM'){
                data = 'Metretül (LM)'
            }else {
                data = ''
            }

            return data;

        } catch (error) {
            console.log('error')
        }

    }

}