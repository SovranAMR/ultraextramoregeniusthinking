# A/B Round 4 — Görsel (Max MCP vs Düz)

**Amaç:** Aynı görsel brief — max thinking MCP ile düz chat çıktısını **gözle** kıyasla.  
**İzole:** Sadece `test/ab-round4/max/` ve `plain/` — `src/` dokunulmaz.

---

## Hazırlık

1. Brief oku: `test/ab-round4/BRIEF.md`
2. İki **yeni chat** — context taşıma
3. Chat B'de ultra-thinking MCP **kapalı** veya think kullanma

---

## Chat A — Max MCP

```
max de düşün: test/ab-round4/BRIEF.md spec'ine göre DAS sistem durumu dashboard widget yap.

Tek self-contained HTML, harici CDN yok, inline CSS+SVG.
Çıktı: test/ab-round4/max/dashboard.html
```

---

## Chat B — Düz (MCP yok)

```
test/ab-round4/BRIEF.md spec'ine göre DAS sistem durumu dashboard widget yap.

Tek self-contained HTML, harici CDN yok, inline CSS+SVG.
Çıktı: test/ab-round4/plain/dashboard.html
```

---

## Karşılaştır

Tarayıcıda aç (file:// veya Cursor Simple Browser):

```
test/ab-round4/compare.html
```

Veya terminal:

```bash
node test/ab-round4/validate.mjs both
xdg-open test/ab-round4/compare.html   # Linux
```

**375px test:** DevTools → responsive → iPhone genişliği, her iki iframe'i kontrol et.

---

## Skor tablosu (doldur)

| Kriter | Max (1-5) | Plain (1-5) | Not |
|--------|-----------|-------------|-----|
| İlk izlenim | | | |
| Okunabilirlik | | | |
| Animasyon | | | |
| SVG/sparkline | | | |
| Responsive | | | |
| Kod sadeiliği (wc -l) | | | |

**Kazanan:** ___________

---

## Not

Round 3 (rate-limit code fix) ile karıştırma — bu tur **sadece görsel**.
