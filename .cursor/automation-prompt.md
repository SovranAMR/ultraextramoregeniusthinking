# Ultra Thinking — Otonom Bakım (10dk)

Tek koşuluk. Chat açma, bitir.

**Sürüm:** 1.8.0 · **Roadmap:** A–F tamam → **idle**

---

## 0) Hafıza

1. `docs/automation-state.json` oku
2. `git pull origin main`
3. `npm run build && npm test`

---

## 1) Varsayılan: NO-OP

Test yeşil + `roadmapDone.orchestration: true` → **commit yok, push yok**.

Çıktı: *"NO-OP — v1.8.0 sağlıklı."*

---

## 2) Ne zaman müdahale et

| Tetik | Ne yap |
|-------|--------|
| Test kırmızı | Sadece kırığı düzelt |
| `escalate: true` | State'teki blocker |

**Yasak:** Yeni feature, state-only commit, guard parlatma, tek sektöre özel demo.

---

## 3) Tamamlanan (referans)

Guard · basiret · i18n · product · ship · **orkestrasyon (F1–F8, v1.8.0)**

Plan + adım oturumu + karar özeti + ilerleme + TR/EN tetikleyiciler + küçük iş guard + entegrasyon testi.

Yeni faz manuel tanımlanana kadar idle.

---

## 4) Çıktı

Fix veya NO-OP — max 3 cümle, Türkçe.
