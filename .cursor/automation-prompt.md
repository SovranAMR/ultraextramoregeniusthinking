# Ultra Thinking — Büyük Proje Orkestrasyonu (10dk)

Tek koşuluk. Chat açma, bitir.

---

## Bu ne için?

Bu MCP **binlerce farklı iş türü** için kullanılacak — tek bir örnek veya sektöre kilitlenme yok.

İnsan büyük bir iş verdiğinde (ne olursa olsun):

> “Şunu sıfırdan kur / şu sistemi baştan tasarla / bu projeyi faz faz götür.”

Sistem şöyle çalışmalı:

1. **Önce plan** — iş parçalara bölünür. Her parça net, sıralı, yapılabilir. Oyun, e-ticaret, klinik yazılım, API, migration, iç araç — fark etmez; plan mantığı aynı.
2. **Sonra adım adım derin düşünme** — plandaki **her adım** için en güçlü düşünme modu. Karar, risk, trade-off oturur; sonra uygulama.
3. **Adımlar birbirini hatırlar** — sonraki adım öncekilerde ne kararlaşıldığını bilir. Bağlam kopmaz.
4. **Kalite düz moddan iyi** — daha çok dosya/satır/süs değil; daha iyi sonuç. Aynı motor her kategoride geçerli.

Bugün MCP tek soruya odaklı: sor, 10 tur düşün, bitir. **Plandan adıma köprü yok.** Senin işin bu köprüyü inşa etmek.

**Yasak:** Tek örnek ürüne (oyun, sektör, demo senaryo) özel kod, metin veya test. Evrensel tasarım.

---

## Ürün hayali (kullanıcı gözü)

- Büyük iş → **plan** (fazlar / adımlar / sıra).
- Her adım → en derin modda düşün (mimari, edge case, basitleştirme).
- Adım bitince → **karar özeti** kalır; sonraki adım dayanır.
- İnsan planı günceller, adım atlar — sistem kabul eder.
- Küçük işler → tek oturum yeter (bug fix, küçük refactor, tek soru).

**Kategori örnekleri (hepsi aynı motor):** ödeme entegrasyonu, hasta randevu modülü, tekstil ERP raporu, auth migration, mobil API, landing + admin panel, incident postmortem planı. Hiçbiri “referans senaryo” değil — sadece kapsamı gösterir.

---

## Ne BİTTİ — tekrarlama

Tek konu + pass döngüsü, guard, çok dil, sonuç basireti, plain kıyası — tamam (v1.7.1+).

**Tek konu modunu bozma.** Yeni katman üstüne.

**Yasak:**
- Sadece state değişen boş commit
- Guard parlatma (test kırılmadıkça)
- Sahte / tek sektöre özel demo planlar
- Her koşuda dev refactor
- Prompt, test veya örneklerde **tek marka/oyun/ürün adı** kullanmak

---

## Faz F — Orkestrasyon (AKTİF)

Her koşuda **tek madde**. `fazFProgress` — ilk `false`.

### F1 — Plan kavramı
**Plan** oluştur: başlık, adım listesi, her adımda kısa amaç. Diske yaz, id ver. Tek soru oturumundan ayrı.

### F2 — Adım oturumu
Plandaki **tek adım** için derin düşünme. Plan id, adım no, mod. Önceki adım özetleri bağlama.

### F3 — Adım tamamlanınca
**Karar özeti** plana yazılsın (seçilen, reddedilen, etkilenen dosyalar). Sonraki adım otomatik görsün.

### F4 — Plan ilerlemesi
Hangi adım bitti, sırada ne — sistem söylesin.

### F5 — İnsan dili
“Plan çıkar, her adımı max düşün” — TR + EN doğal dilden anlaşılsın. Kategori-nötr tetikleyiciler.

### F6 — Küçük işler bozulmasın
Bug fix, tek dosya, kısa soru → tek oturum. Plan sadece **büyük iş** tetikleyicilerinde.

### F7 — Test
**Kategori-nötr** 3 adımlı plan (ör. generic “auth modülü migration” veya “checkout flow”) → adım oturumu → özet → bağlam taşınıyor mu. Tek sektöre özel isim yok.

### F8 — Sürüm
F1–F7 bitince 1.8.0. Eski `think` / `think_next` kırılmaz.

**Faz F bitti** → `roadmapDone.orchestration: true`.

---

## Her koşu disiplini

1. `git pull` → `npm test` — kırmızıysa sadece onu düzelt
2. Faz F’den **bir** madde
3. Max **2–3 dosya**, **1 commit**, push `main`
4. Test verisi generic; mock ürün yasak
5. README genişletme yok

Aynı madde 2 koşuda bitmezse: `escalate: true`, sonraki maddeye geç.

---

## State (her koşu sonu)

`docs/automation-state.json` güncelle: `lastRun`, `runCount++`, `fazFProgress`, `lastFocus`.

`productVision`: *Evrensel büyük iş → plan → adım adım derin düşünme → hafıza — kategori bağımsız.*

---

## Başarı kriteri

Herhangi bir büyük iş için:

> “Önce plan çıkar, her adımı en derin modda tasarla, adımlar birbirini hatırlasın.”

Kategori fark etmez. Agent plan açar, adım adım derin oturum, özetler birikir. Küçük iş tek oturumda. **Düz moddan daha iyi karar** — daha şişkin değil.

---

## Çıktı (max 4 cümle)

F maddesi · ne değişti · test · sıradaki madde.

Türkçe, kısa.
