import { schema, CustomMessages,rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'


let arr = ['SATIS','TEVKIFAT','IADE','ISTISNA','OZELMATRAH']
let currencyCode = ["AFN", "EUR", "ALL", "DZD", "USD", "EUR", "AOA", "XCD", , "XCD", "ARS", "AMD", "AWG", "AUD", "EUR", "AZN", "BSD", "BHD", "BDT", "BBD", "BYN", "EUR", "BZD", "XOF", "BMD", "INR", "BTN", "BOB", "BOV", "USD", "BAM", "BWP", "NOK", "BRL", "USD", "BND", "BGN", "XOF", "BIF", "CVE", "KHR", "XAF", "CAD", "KYD", "XAF", "XAF", "CLP", "CLF", "CNY", "AUD", "AUD", "COP", "COU", "KMF", "CDF", "XAF", "NZD", "CRC", "XOF", "HRK", "CUP", "CUC", "ANG", "EUR", "CZK", "DKK", "DJF", "XCD", "DOP", "USD", "EGP", "SVC", "USD", "XAF", "ERN", "EUR", "SZL", "ETB", "EUR", "FKP", "DKK", "FJD", "EUR", "EUR", "EUR", "XPF", "EUR", "XAF", "GMD", "GEL", "EUR", "GHS", "GIP", "EUR", "DKK", "XCD", "EUR", "USD", "GTQ", "GBP", "GNF", "XOF", "GYD", "HTG", "USD", "AUD", "EUR", "HNL", "HKD", "HUF", "ISK", "INR", "IDR", "XDR", "IRR", "IQD", "EUR", "GBP", "ILS", "EUR", "JMD", "JPY", "GBP", "JOD", "KZT", "KES", "AUD", "KPW", "KRW", "KWD", "KGS", "LAK", "EUR", "LBP", "LSL", "ZAR", "LRD", "LYD", "CHF", "EUR", "EUR", "MOP", "MKD", "MGA", "MWK", "MYR", "MVR", "XOF", "EUR", "USD", "EUR", "MRU", "MUR", "EUR", "XUA", "MXN", "MXV", "USD", "MDL", "EUR", "MNT", "EUR", "XCD", "MAD", "MZN", "MMK", "NAD", "ZAR", "AUD", "NPR", "EUR", "XPF", "NZD", "NIO", "XOF", "NGN", "NZD", "AUD", "USD", "NOK", "OMR", "PKR", "USD", , "PAB", "USD", "PGK", "PYG", "PEN", "PHP", "NZD", "PLN", "EUR", "USD", "QAR", "EUR", "RON", "RUB", "RWF", "EUR", "SHP", "XCD", "XCD", "EUR", "EUR", "XCD", "WST", "EUR", "STN", "SAR", "XOF", "RSD", "SCR", "SLL", "SGD", "ANG", "XSU", "EUR", "EUR", "SBD", "SOS", "ZAR", , "SSP", "EUR", "LKR", "SDG", "SRD", "NOK", "SEK", "CHF", "CHE", "CHW", "SYP", "TWD", "TJS", "TZS", "THB", "USD", "XOF", "NZD", "TOP", "TTD", "TND", "TRY", "TMT", "USD", "AUD", "UGX", "UAH", "AED", "GBP", "USD", "USD", "USN", "UYU", "UYI", "UYW", "UZS", "VUV", "VES", "VND", "USD", "USD", "XPF", "MAD", "YER", "ZMW", "ZWL", "XBA", "XBB", "XBC", "XBD", "XTS", "XXX", "XAU", "XPD", "XPT", "XAG", "AFA", "FIM", "ALK", "ADP", "ESP", "FRF", "AOK", "AON", "AOR", "ARA", "ARP", "ARY", "RUR", "ATS", "AYM", "AZM", "RUR", "BYB", "BYR", "RUR", "BEC", "BEF", "BEL", "BOP", "BAD", "BRB", "BRC", "BRE", "BRN", "BRR", "BGJ", "BGK", "BGL", "BUK", "HRD", "HRK", "CYP", "CSJ", "CSK", "ECS", "ECV", "GQE", "EEK", "XEU", "FIM", "FRF", "FRF", "FRF", "GEK", "RUR", "DDM", "DEM", "GHC", "GHP", "GRD", "FRF", "GNE", "GNS", "GWE", "GWP", "ITL", "ISJ", "IEP", "ILP", "ILR", "ITL", "RUR", "RUR", "LAJ", "LVL", "LVR", "LSM", "ZAL", "LTL", "LTT", "LUC", "LUF", "LUL", "MGF", "MWK", "MVQ", "MLF", "MTL", "MTP", "FRF", "MRO", "FRF", "MXP", "RUR", "FRF", "MZE", "MZM", "NLG", "ANG", "NIC", "PEH", "PEI", "PEN", "PES", "PLZ", "PTE", "FRF", "ROK", "ROL", "RON", "RUR", "FRF", "FRF", "FRF", "ITL", "STD", "CSD", "EUR", "SKK", "SIT", "ZAL", "SDG", "RHD", "ESA", "ESB", "ESP", "SDD", "SDP", "SRG", "SZL", "CHC", "RUR", "TJR", "IDR", "TPE", "TRL", "TRY", "RUR", "TMM", "UGS", "UGW", "UAK", "SUR", "USS", "UYN", "UYP", "RUR", "VEB", "VEF", "VEF", "VEF", "VNC", "YDD", "YUD", "YUM", "YUN", "ZRN", "ZRZ", "ZMK", "ZWC", "ZWD", "ZWD", "ZWN", "ZWR", "XFO", "XRE", "XFU"]

export default class EArsivSatisValidator {


  constructor(protected ctx: HttpContextContract) {}

  /*
   * Define schema to validate the "shape", "type", "formatting" and "integrity" of data.
   *
   * For example:
   * 1. The username must be of data type string. But then also, it should
   *    not contain special characters or numbers.
   *    ```
   *     schema.string({}, [ rules.alpha() ])
   *    ```
   *
   * 2. The email must be of data type string, formatted as a valid
   *    email. But also, not used by any other user.
   *    ```
   *     schema.string({}, [
   *       rules.email(),
   *       rules.unique({ table: 'users', column: 'email' }),
   *     ])
   *    ```
   */

  public schema = schema.create({
    
    SESSION_ID: schema.string(),
    ProfileID:schema.enum(['EARSIVFATURA']),
    InvoiceTypeCode:schema.enum(arr),
    InvoiceLine:schema.string(),
    currencyID:schema.enum(currencyCode),
    IssueDate:schema.date({
      format: 'yyyy-MM-dd',
    }),
    IssueTime:schema.date({
      format: 'HH:mm:ss',
    }),
    Note:schema.string.nullable(),
    DocumentCurrencyCode:schema.enum(currencyCode),
    LineCountNumeric:schema.number(),
    DocumentType:schema.enum(['XSLT']),
    SignatureVKN_TCKN:schema.string({}, [rules.maxLength(11), rules.minLength(10)]),
    SignatureVKN:schema.string({}, [rules.maxLength(11), rules.minLength(10)]),
    SignatureStreetName:schema.string(),
    SignatureBuildingNumber:schema.number(),
    SignatureCitySubdivisionName:schema.string(),
    SignatureCityName:schema.string(),
    SignaturePostalZone:schema.number(),
    SignatureRegion:schema.string(),
    SignatureCountryName:schema.string(),
    AspWebsiteURI:schema.string(),
    AspVKN:schema.string({}, [rules.maxLength(11), rules.minLength(10)]),
    AspMERSISNO:schema.number(),
    AspTICARETSICILNO:schema.number(),
    AspName:schema.string(),
    AspStreetName:schema.string(),
    AspCitySubdivisionName:schema.string(),
    AspCityName:schema.string(),
    AspPostalZone:schema.number(),
    AspRegion:schema.string(),
    AspCountryName:schema.string(),
    AspPartyTaxSchemeName:schema.string(),
    AspContactTelephone:schema.number(),
    AspContactElectronicMail:schema.string(),
    AcpVKN:schema.string({}, [rules.maxLength(11), rules.minLength(10)]),
    AcpName:schema.string(),
    AcpStreetName:schema.string(),
    AcpCitySubdivisionName:schema.string(),
    AcpCityName:schema.string(),
    AcpPartyTaxSchemeName:schema.string(),
    AcpContactTelephone:schema.number(),
    AcpContactElectronicMail:schema.string(),
    invoiceID:schema.string(),
    uuid:schema.string(),
    AdrDocumentTypeCode:schema.enum(['SendingType']),
    AdrDocumentType:schema.enum(['KAGIT','INTERNET']),
    AcpPersonFirstName:schema.string(),
    AcpPersonFamilyName:schema.string(),
    earsiv_type:schema.enum(['NORMAL','INTERNET']),
    sub_status:schema.enum(['DRAFT','NEW']),
    seri:schema.string({}, [rules.maxLength(3), rules.minLength(3)]),
    taxTotal:schema.string(),
    lmtLineExtensionAmount:schema.string(),
    lmtTaxExclusiveAmount:schema.string(),
    lmtTaxInclusiveAmount:schema.string(),
    lmtAllowanceTotalAmount:schema.string(),
    lmtChargeTotalAmount:schema.string(),
    lmtPayableAmount:schema.string(),

    // * Bunlar null gelebilir 
    TaxExemptionReasonCode:schema.number.nullable(),
    TaxExemptionReason:schema.string.nullable(),

    // * Tevkifat Array
    wtt: schema.array().members(
      schema.object().members({
        wttTaxAmount: schema.number(),
        wttTaxableAmount: schema.number(),
        wttTaxAmount2: schema.number(),
        wttPercent: schema.number(),
        wttTaxCategoryTaxSchemeName: schema.string(),
        wttTaxCategoryTaxSchemeTaxTypeCode: schema.number(),
      })
    ),




  })

  /**
   * Custom messages for validation failures. You can make use of dot notation `(.)`
   * for targeting nested fields and array expressions `(*)` for targeting all
   * children of an array. For example:
   *
   * {
   *   'profile.username.required': 'Username is required',
   *   'scores.*.number': 'Define scores as valid numbers'
   * }
   *
   */
  public messages: CustomMessages = {}
}
