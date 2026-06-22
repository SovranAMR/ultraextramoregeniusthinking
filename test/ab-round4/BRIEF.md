# Görsel brief — A/B Round 4

**Ürün:** DAS Systems internal ops panel — tek sayfa widget.  
**Çıktı:** Tek self-contained HTML dosyası (inline CSS + inline SVG ikonlar, harici CDN yok).

---

## Zorunlu içerik

1. **Başlık:** "Sistem Durumu" (veya EN: System Status)
2. **3 metrik kartı** (yan yana desktop, alt alta mobil):
   - API gecikmesi (ms) — örnek: 42ms, durum: iyi
   - Aktif oturum — örnek: 1.284
   - Hata oranı — örnek: 0.12%, durum: düşük
3. **Durum renkleri:** yeşil / sarı / kırmızı badge veya border (her kart farklı durum gösterebilir)
4. **Dark theme** — arka plan #0f1419 civarı, okunaklı kontrast
5. **En az 1 CSS animasyon** — pulse, shimmer, veya progress bar (abartma yok)
6. **Sparkline veya mini grafik** — en az 1 kartta inline SVG ile 7 noktalı basit çizgi
7. **Son güncelleme** footer — "Son sync: …" metni
8. **Erişilebilirlik:** `lang`, kartlarda `aria-label`, focus görünür

---

## Yasak

- Harici script/CSS CDN (google fonts bile yok — system-ui)
- Placeholder lorem-only sayfa
- Boş div + "TODO"
- İkinci dosya (JS ayrı .css ayrı yok — hepsi tek HTML)

---

## Görsel kalite barı

- Profesyonel SaaS panel hissi (Stripe/Vercel dashboard seviyesi hedef)
- Hizalama tutarlı, padding dengeli
- Tipografi hiyerarşisi: başlık > değer > label

---

## Değerlendirme (insan gözü)

Tarayıcıda yan yana aç: `test/ab-round4/compare.html`

| Kriter | Sor |
|--------|-----|
| İlk izlenim | Hangisi daha "prod-ready"? |
| Okunabilirlik | Kontrast, font boyutu |
| Animasyon | Canlı mı, dikkat dağıtıcı mı? |
| Karmaşıklık | Gereksiz filter/SVG çamuru var mı? |
| Responsive | 375px dar ekranda kırılıyor mu? |

```bash
node test/ab-round4/validate.mjs both
wc -l test/ab-round4/max/dashboard.html test/ab-round4/plain/dashboard.html
```
