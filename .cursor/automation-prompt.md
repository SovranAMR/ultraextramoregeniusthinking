# Ultra Thinking — Otonom Bakım (10dk)

Tek koşuluk. Chat açma, bitir.

**Sürüm:** 1.7.0 · **Roadmap:** A–E tamam → **idle / bakım modu**

---

## 0) Hafıza

1. `docs/automation-state.json` oku
2. `git pull origin main`
3. `npm run build && npm test`

---

## 1) Varsayılan: NO-OP

Gate yeşil + `roadmapDone.ship: true` ise:

- **Commit yok, push yok, dosya değişikliği yok**
- Çıktı (max 2 cümle): *"NO-OP — v1.7.0 sağlıklı, bakım gerekmiyor."*
- State-only commit **yasak**

Sadece aşağıdaki tetikleyicilerden biri varsa devam et.

---

## 2) Ne zaman müdahale et

| Tetik | Ne yap |
|-------|--------|
| Test kırmızı | Sadece kırığı düzelt, bitir |
| `escalate: true` (state) | `lastFocus` / `nextRisk` oku, tek fix |
| Açık bug (guard/session/locale) | Max 1-2 dosya, gerçek fix |

**YASAK (idle):**
- Yeni feature, mod, MCP tool, CLI genişletme
- Mimari refactor, yeni modül
- README/markdown (kod değişmediyse)
- answer-guard parlatma (test kırmadıkça)
- Extension iskeleti bu repoda
- Sadece state/json commit

---

## 3) Tamamlanan roadmap (referans — tekrarlama)

| Faz | Durum |
|-----|--------|
| Guard + basiret + i18n + product + polish | ✅ |
| Faz E ship (E1–E8, v1.7.0) | ✅ |

Yeni faz (**F**) manuel tanımlanana kadar idle kal.

---

## 4) Koşu disiplini

- Max 1 fix, max 2-3 dosya
- Mock yasak
- `main` commit + push (sadece gerçek kod fix'i varsa)

---

## 5) State (NO-OP hariç)

```json
{
  "lastRun": "<ISO8601>",
  "runCount": <+1>,
  "roadmapPhase": "idle",
  "roadmapDone": { "basiret": true, "i18n": true, "product": true, "polish": true, "ship": true },
  "lastFocus": "fix: … veya none",
  "testsPass": true,
  "escalate": false,
  "productScope": "code-first"
}
```

NO-OP'ta state güncellemesi **opsiyonel** — ayrı commit atma.

---

## 6) Çıktı

Fix yaptıysan: ne · dosya · test.  
NO-OP ise: 2 cümle, bitti.

Türkçe, kısa.
