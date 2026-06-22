# Ultra Thinking — Büyük Proje Orkestrasyonu (10dk)

Tek koşuluk. Chat açma, bitir.

---

## Bu ne için?

İnsan şunu isteyebilmeli:

> “Bana sıfırdan bir Minecraft yaz.”

Ve sistem şöyle çalışmalı:

1. **Önce plan** — dev iş parçalara bölünür (motor, dünya, blok, oyuncu, arayüz…). Her parça net, sıralı, yapılabilir.
2. **Sonra adım adım derin düşünme** — plandaki **her bir adım** için en güçlü düşünme modu devreye girer. Adım tasarımı, kararları, riskleri, ne yapılacağı iyice oturur; sonra uygulama.
3. **Adımlar birbirini hatırlar** — üçüncü adım birinci adımda ne karar verildiğini bilir. Bağlam kopmaz.
4. **Kalite düz moddan iyi olmalı** — daha çok dosya, daha çok satır, daha çok süs değil. Düz tek seferde yapılan işten **daha iyi sonuç**. Görselde kötüyse kodda da kötüdür; aynı mantık.

Bugün MCP tek soruya odaklanıyor: bir konu sor, 10 tur düşün, bitir. **Plandan adıma, adımdan sonraki adıma otomatik köprü yok.** Senin işin bu köprüyü inşa etmek.

---

## Ürün hayali (kullanıcı gözü)

- Büyük iş verir → sistem **plan çıkarır** (fazlar / adımlar / sıra).
- Her adım için: “Şimdi bu adımı en derin modda düşün” — mimari, trade-off, edge case, basitleştirme.
- Adım bitince: kısa **karar özeti** kalır; sonraki adım ona dayanır.
- İnsan araya girer, adım atlar, planı günceller — sistem bunu kabul eder.
- Küçük işler eskisi gibi: tek soru, tek düşünme oturumu yeter.

Örnekler (hepsi aynı mantık): voxel oyun, e-ticaret platformu, klinik yazılım, çok servisli API. Minecraft sadece örnek; motor evrensel.

---

## Ne BİTTİ — tekrarlama

Tek konu + pass döngüsü, guard, çok dil, sonuç basireti, plain kıyası — hepsi tamam (v1.7.1 civarı).

**Tek konu modunu bozma.** Yeni katman **üstüne** eklenir.

**Yasak:**
- Sadece state dosyası değişen boş commit
- Guard’ı parlatmak (test kırılmadıkça)
- Mock / sahte plan adımları
- Her koşuda dev mimari refactor

---

## Faz F — Orkestrasyon (AKTİF)

Her koşuda **tek madde**. `docs/automation-state.json` içindeki `fazFProgress` — ilk `false` olanı al.

### F1 — Plan kavramı
Sistem bir **plan** oluşturabilsin: başlık, adım listesi, her adımda kısa amaç. Plan diske yazılsın, id alsın. Tek seferlik soru oturumundan ayrı dursun.

### F2 — Adım oturumu
Plandaki **tek bir adım** için derin düşünme başlatılabilsin. Adım numarası, plan id, mod (varsayılan en derin) belli olsun. Oturum “bu adımın sorusu” ile açılsın; plandaki önceki adımların karar özeti bağlama gitsin.

### F3 — Adım tamamlanınca
Adım bittiğinde: o adıma ait **karar özeti** plan kaydına işlensin (ne seçildi, ne reddedildi, hangi dosyalar). Sonraki adım bunu otomatik görsün.

### F4 — Plan ilerlemesi
Planda hangi adımlar bitti, hangisi sırada — state’ten okunabilsin. Agent her seferinde “şimdi 3. adım” demek zorunda kalmasın; sistem söylesin.

### F5 — İnsan dili
Kullanıcı “büyük plan çıkar sonra her adımı max düşün” dediğinde mod ve akış doğal dilden anlaşılsın. Türkçe ve İngilizce yeterli ilk turda.

### F6 — Küçük işler bozulmasın
“Şu bug’ı düzelt” gibi küçük işler hâlâ tek oturumla çalışsın. Plan zorunluluğu sadece büyük iş tetikleyicilerinde.

### F7 — Test
Gerçek senaryo: en az 3 adımlı sahte plan → 1. adım oturumu → özet yaz → 2. adım oturumunda 1. özetin bağlamda olduğu doğrulansın. Mock yasak değil bu test verisi için — ama davranış gerçek olmalı.

### F8 — Sürüm
F1–F7 bitince anlamlı sürüm bump (1.8.0). MCP arayüzü geriye dönük: eski `think` / `think_next` kırılmaz.

**Faz F bitti** → `roadmapDone.orchestration: true`, phase `idle` veya sonraki faz.

---

## Her koşu disiplini

1. `git pull` → `npm run build && npm test` — kırmızıysa sadece onu düzelt
2. Faz F’den **bir** madde
3. En fazla **2–3 dosya**, **1 commit**, `main` push
4. Mock ürün verisi yasak; test senaryosu gerçek akış
5. README genişletme yok (kod değişmediyse)

Aynı madde 2 koşuda bitmediyse: `escalate: true`, blocker yaz, bir sonraki maddeye geç.

---

## State (her koşu sonu)

```json
{
  "lastRun": "<ISO8601>",
  "runCount": <+1>,
  "roadmapPhase": "orchestration",
  "roadmapDone": {
    "basiret": true,
    "i18n": true,
    "product": true,
    "polish": true,
    "ship": true,
    "orchestration": false
  },
  "fazFProgress": {
    "f1_plan_concept": false,
    "f2_step_session": false,
    "f3_step_completion_summary": false,
    "f4_plan_progress": false,
    "f5_natural_language": false,
    "f6_small_jobs_unchanged": false,
    "f7_integration_test": false,
    "f8_version_bump": false
  },
  "lastFocus": "F1: plan kavramı",
  "testsPass": true,
  "escalate": false,
  "productVision": "Büyük iş → plan → her adım derin düşünme → adımlar arası hafıza"
}
```

---

## Başarı kriteri (F tamamlanınca)

Biri şunu yazabilmeli:

> “Sıfırdan bir Minecraft yaz — önce plan çıkar, her adımı en derin modda tasarla, adımlar birbirini hatırlasın.”

Agent plan oluşturur, adım adım derin oturum açar, özetler birikir, küçük bug fix hâlâ tek oturumla çalışır. **Düz moddan daha iyi karar** — daha şişkin değil.

---

## Çıktı (max 4 cümle)

Hangi F maddesi · ne değişti · test · sıradaki false madde.

Türkçe, robot değil.
