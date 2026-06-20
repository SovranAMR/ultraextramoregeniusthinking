# Ultra Thinking — Kusursuzluk Turu (10dk)

Tek koşuluk döngü. Chat açık bırakma. GitHub/PR/push YASAK — sadece local değişiklik.

## 0) Hafıza

1. `docs/automation-state.json` oku — önceki koşu, son odak, tekrar sayacı
2. Bu koşunun başlangıç SHA'sını not et (`git rev-parse HEAD` veya working tree hash)

## 1) Gate (sıra değişmez)

```bash
npm run build && npm test
```

Kırmızıysa: **sadece** kırmızıyı düzelt, başka iş yok. Bitir.

## 2) Kırmızı çizgiler

- Yeni modül/dosya EKLEME (zorunlu test/fix hariç — max 1 dosya, gerekçeli)
- Mimari dallandırma YASAK: abstraction, factory, plugin, yeni katman
- Mock/demo/sahte veri YASAK
- README/markdown genişletme YASAK (kod değişmediyse dokunma)
- `git push`, remote, PR, GitHub CLI YASAK
- Aynı turda 3+ dosya değiştirme YASAK
- Feature creep YASAK (yeni MCP tool, yeni mod, CLI genişletme)

## 3) Odak tarama (sadece bunlar)

Öncelik sırası — ilk bulduğun zayıf noktayı al, diğerlerine atlama:

1. **Doğruluk** — `answer-guard`, `session`, meta-reject, stagnation, task-kind edge case
2. **Test** — `test/thinking-smoke.mjs` gerçek davranış eksikleri
3. **Prompt/disiplin** — agent'ın pass döngüsünü bozan belirsiz direktif
4. **Tip/kod** — gereksiz tekrar, zayıf isim, küçük bug
5. **Sadeleştirme** — fazla satır, gereksiz branch (silerek iyileştir)

`src/` dışına dokunma. `test/tavuskusu*.html`, `test/demo-*.html` demo çıktıları — dokunma.

## 4) Tek adım kuralı

Koşu başına **EN FAZLA 1** odaklı iyileştirme:

- Küçük diff, yüksek etki
- Değişiklikten sonra `npm run build && npm test` tekrar
- Aynı issue 2 koşuda çözülmediyse `automation-state.json`'da `escalate: true` yaz, bu turda başka şeye geçme

## 5) Değişiklik yoksa

Kod sağlıklıysa dosya değiştirme. `automation-state.json` güncelle:

- `lastRun`, `lastFocus: "none"`, `health: "ok"`, `nextRisk` (1 cümle)

## 6) State güncelle (her koşu sonu)

`docs/automation-state.json`:

```json
{
  "lastRun": "ISO timestamp",
  "lastFocus": "kısa açıklama veya none",
  "lastFiles": ["path"],
  "testsPass": true,
  "escalate": false,
  "nextRisk": "bir sonraki micro-risk",
  "runCount": N
}
```

## 7) Çıktı (kısa)

- Yaptıysan: ne düzelttin, hangi dosya, test sonucu (max 5 cümle)
- Yapmadıysan: neden sağlıklı, sonraki risk (max 3 cümle)

Türkçe, robot değil, boş övgü yok.
