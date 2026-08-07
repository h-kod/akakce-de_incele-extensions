# Gizlilik Politikası — Akakçe'de İncele

Son güncelleme: 07.08.2026

"Akakçe'de İncele" tarayıcı uzantısı ("Uzantı"), kullanıcı gizliliğine önem verir. Bu belge, Uzantının hangi verileri işlediğini ve hangi verileri işlemediğini açıklar.

## Toplanan Veriler

Uzantı, herhangi bir kişisel veri toplamaz, sunucularımıza veya üçüncü taraflara veri göndermez. Uzantı, kimlik doğrulama, reklam veya analitik amaçlı hiçbir izleme (tracking) mekanizması içermez.

## İşlenen Veriler ve Kullanım Amacı

- **Sayfa içeriği (ürün başlığı):** Uzantı, aktif sekmedeki (activeTab) sayfadan ürün başlığını (JSON-LD, Open Graph meta verisi veya sayfa öğeleri üzerinden) tespit eder. Bu bilgi, yalnızca Akakçe.com üzerinde arama yapmak için kullanılır ve tarayıcınızın dışına, herhangi bir sunucuya gönderilmez.
- **Pano (clipboard):** Tespit edilen ürün başlığı, kullanıcı ayarına bağlı olarak otomatik olarak panonuza kopyalanabilir. Bu özellik ayarlar sayfasından kapatılabilir.
- **Yerel ayarlar (storage):** Uzantı ayarları (pano kopyalama, sağ tık menüsü, arama kırpıcı özelliklerinin açık/kapalı durumu) yalnızca `chrome.storage.local` kullanılarak cihazınızda yerel olarak saklanır. Bu veriler Google hesabınıza senkronize edilmez ve cihazınızın dışına aktarılmadan yalnızca Uzantının kendisi tarafından okunur.
- **Sağ tık menüsü (contextMenus):** Seçtiğiniz metni Akakçe'de aramanızı sağlar; seçilen metin yalnızca açılan arama sayfasının URL'sine yönlendirme amacıyla kullanılır.

## Veri Paylaşımı

Uzantı, işlediği hiçbir veriyi üçüncü taraflarla paylaşmaz, satmaz veya kiralamaz. Uzantı yalnızca akakce.com'a yönlendirme yapar; bu sitede geçerli olan gizlilik politikası Akakçe'ye aittir.

## İzinlerin Gerekliliği

| İzin | Amaç |
|---|---|
| `activeTab` | Aktif sekmedeki ürün başlığını tespit etmek |
| `scripting` | Ürün başlığını tespit eden betiği ilgili sayfaya enjekte etmek |
| `contextMenus` | Sağ tık menüsüne "Akakçe'de Ara" seçeneğini eklemek |
| `clipboardWrite` | Ürün başlığını panoya kopyalamak (isteğe bağlı, ayarlardan kapatılabilir) |
| `storage` | Kullanıcı ayarlarını cihazda yerel olarak saklamak |

## Değişiklikler

Bu gizlilik politikası güncellenebilir. Önemli değişiklikler bu belge üzerinden yayınlanacaktır.

## İletişim

Sorularınız için: [GitHub Issues](https://github.com/h-kod/akakce-de_incele-extensions/issues)
