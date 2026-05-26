import Route from "@ioc:Adonis/Core/Route";

Route.get("/", async function () {
  return " Tiko AS | E Fatura API";
});

Route.post("/login", "SoapsController.login");
Route.post("/logout", "SoapsController.logout");
Route.post("/mukellefListesi", "SoapsController.mukellefListesi");
Route.post("/mukellefSorgulama", "SoapsController.mukellefSorgulama");
Route.post("/faturaGonder", "SoapsController.faturaGonder");
Route.get("/faturaListesi", "SoapsController.faturaListesi");

Route.post("/fatura", "SoapsController.data");

// * Token Register Servisi
Route.post("/register", "UsersController.register");

Route.post("/faturaTaslakYukleme", "SoapsController.taslakPush");

// Route.post('/faturaGoruntule','SoapsController.faturaGoruntule')
Route.post("/faturaOkunduIsaretleme", "SoapsController.faturaOkunduIsaretleme");

// * Fatura Görsel Okuma (GetInvoiceWithType)
Route.post("/faturaGorselOkuma", "SoapsController.faturaGorselOkuma");

// * Fatura Durum Sorgulama (GetInvoiceStatus) (Taslak Sorgulama)
Route.post("/faturaTaslakSorgulama", "SoapsController.faturaTaslakSorgulama");

// * E-Fatura Okuma (GetInvoice)
Route.post("/eFaturaOkuma", "SoapsController.eFaturaOkuma");

// * Toplu Fatura Durum Sorgulama (GetInvoiceStatusAll)
Route.post("/topluFaturaDurumSorgulama", "SoapsController.topluSorgulama");

// * Kod Listesi
Route.get("/json", "CodeListsController.ceviri");

// * ÖLÇÜ BİRİMLERİ LİSTESİ
Route.get("/olcuBirimleri", "CodeListsController.olcuBirimleri");

// * İL LİSTESİ
Route.get("/ilIlceListesi", "CodeListsController.ilIlceListesi");

// * KISMİ İSTİSNA KODLARI LİSTESİ
Route.get("/kismiIstisnaKodlari", "CodeListsController.kismiIstisnaKodlari");

// * TAM İSTİSNA KODLARI LİSTESİ
Route.get("/tamIstisnaKodlari", "CodeListsController.tamIstisnaKodlari");

// * ÖTV İSTİSNA KODLARI LİSTESİ
Route.get("/otvIstisnaKodlari", "CodeListsController.otvIstisnaKodlari");

// * ÖZEL MATRAH KODLARI LİSTESİ
Route.get("/ozelMatrahKodlari", "CodeListsController.ozelMatrahKodlari");

// * İHRAÇ KAYITLI SATIŞLAR İLE DİİB VE GEÇİCİ KABUL REJİMİ KAPSAMINDAKİ SATIŞ KODLARI LİSTESİ
Route.get("/ihracKytDiipGec", "CodeListsController.ihracKytDiipGec");

// * VERGİ KODLARI LİSTESİ
Route.get("/vergiKodlari", "CodeListsController.vergiKodlari");

// * E ARSİV DURUM KODLARİ
Route.get("/eArsivDurumKodlari", "CodeListsController.eArsivDurumKodlari");

// * E ARSİV DURUM KODLARİ
Route.get("/eArsivPostaGonderimKodlari", "CodeListsController.eArsivPostaGonderimKodlari");

// * TAŞIMA GÖNDERİM ŞEKLİ KODLARI
Route.get(
  "/tasimaGonderimKodlari",
  "CodeListsController.tasimaGonderimKodlari"
);

// * TEVKİFAT KODLARI LİSTESİ
Route.get("/tevkifatKodlari", "CodeListsController.tevkifatKodlari");

// * PAKET/KAP CİNS KODLARI
Route.get("/paketKap", "CodeListsController.paketKap");

// * PAKET/KAP CİNS KODLARI DEVAMI
Route.get("/paketKapDevam", "CodeListsController.paketKapDevam");

// * Pdf - Html - Xml download
Route.post("/download", "SoapsController.download");

// * Mukkelefin e-fatura Olup olmadığını kontrol eder
Route.post("/efaturaSorgula", "SoapsController.efaturaSorgula");

// * Eposta Kontrol Servisi
Route.post("/epostaKontrol", "CodeListsController.epostaKontrol");

// * Gsm Kontrol Servisi
Route.post("/gsmKontrol", "CodeListsController.gsmKontrol");

// * UUID Servisi
Route.get("/uuid", "SoapsController.uuid");

// * Ticari Fatura Kabul Et
Route.post("/ticariFaturaKabulEt", "SoapsController.ticari_fatura_kabul_et");

// * Ticari Faturaların Reddeilmesi
Route.post("/ticariFaturaRed", "SoapsController.ticari_fatura_reddet");

// * Mail Test
Route.post("/mail", "SoapsController.error_mail");

// * Para Birimleri Listesi
Route.get("/paraBirimleri", "CodeListsController.paraBirimleri");

// * Ülke Listesi
Route.get("/ulkeListesi", "CodeListsController.ulkeListesi");

// * Giden Fatura Durumları
Route.get("/gidenFaturaDurumlari", "CodeListsController.gidenFaturaDurumlari");

// * Gelen Fatura Durumları
Route.get("/gelenFaturaDurumlari", "CodeListsController.gelenFaturaDurumlari");

// * Gib Durum Kodları
Route.get("/gibDurumKodlari", "CodeListsController.gibDurumKod");

// * İstisna Kodları Listesi
Route.get("/istisnaKodList", "CodeListsController.istisnaKodList");

// * Taslak Silme
Route.post("/taslakFaturaSil", "SoapsController.taslakSilme");

// * Taslak Olan Faturayı İmzalama
Route.post("/taslakFaturaImza", "SoapsController.taslakFaturaImza");

// * Kuyruğa verileri yeniden gönderir
Route.post("/kuyrukIsle", "SoapsController.kuyrukIsle");

// * Fatura Numaralandırma
Route.post("/faturaNumaralandir", "SoapsController.faturaNumaralandirma");

// * Numaralandırılmış Fatura İmzalama
Route.post(
  "/numaralandirilmisFaturaGonder",
  "SoapsController.numaralandirilmisFaturaImza"
);

// * Stress Test
Route.get("/loaderio-b68ab8e0471e2d52c095cedcd01aded6", async function name() {
  return "loaderio-b68ab8e0471e2d52c095cedcd01aded6";
});

// ------- E arşiv ---------

// * E-arsiv Fatura Kesme
Route.post("/eArsivFatura", "EarsivsController.earsivFatura");
Route.post("/eArsivFaturaDurumSorgulama", "EarsivsController.eArsivFaturaDurumSorgulama");
Route.post("/eArsivFaturaListeleme", "EarsivsController.eArsivFaturaListeleme");
Route.post("/eArsivFaturaDetailList", "EarsivsController.eArsivFaturaDetailList");
Route.post("/eArsivFaturaDownload", "EarsivsController.eArsivFaturaDownload");
Route.post("/eArsivFaturaDownloadCustom", "EarsivsController.eArsivFaturaDownloadCustom");
Route.post("/eArsivFaturaIptal", "EarsivsController.eArsivFaturaIptal");
// * ---------- Gib -------------

// * Gib Login Servisi
// Route.post("/gib_login", "GibsController.gib_login");
Route.post("/vkn_bilgi", "GibsController.vkn_bilgi");
// Route.post("/gib_logout", "GibsController.gib_logout")


// * E-fatura Fatura Kesme (test)
Route.post("/eFaturaPush", "EFaturasController.eFatura");
// * ---------- Gib -------------


// * Mail web hook 
Route.post("/mail_hook", "MailController.mail_hook");
Route.post("/mail_push", "MailController.mail_push");


// * e-Sorgu (Kullanıcının e-Arşiv mi e-Fatura mı olduğunu sorgular)
Route.post('/eSorgu','EFaturasController.eSorgu')


// * Kontör Bakiye Sorgulama
Route.post('/getCredit','SoapsController.getCre')


// * İnteraktiv vergi dairesinden Size kesilen fatuları çeker
Route.post('/sizeKesilenFaturalar','EarsivsController.sizeKesilenFaturalar')

// * Sadece https://ebelge.gib.gov.tr/efaturakayitlikullanicilar.html adresi üzerinden sorgulama yapan servis
Route.post('/mukellefiyetSorgu','GibsController.mukellefiyetSorgu')


// * İzibiz Üzerinden Mükellef Sorgulaması Yapar
Route.post('/getUserFull','GibsController.get_user_izi')


Route.post('/faturaNoGetir','EFaturasController.faturaNoGetir')
