# A/B Round 3 — Code fix (izole ortam)

**Amaç:** Max thinking MCP vs düz chat — aynı bug-fix görevi, kod kalitesi karşılaştırması.  
**Repo etkilenmez:** Çıktılar sadece `test/ab-round3/max/` ve `test/ab-round3/plain/`.

---

## Kurallar

1. **Yeni chat** aç (önceki A/B context'i taşıma)
2. Workspace: `ultraextramoregeniusthinking` — **başka dosyalara dokunma**
3. Sadece belirtilen çıktı dosyasını yaz
4. Fixture'ı **in-place düzenleme** — kopyala → çıktı klasörüne yaz

---

## Görev (her iki chat'te aynı metin)

```
test/ab-round3/fixture/rate-limit.mjs dosyasındaki rate limiter bug'larını düzelt.

Kurallar:
- Public API aynı kalsın: createRateLimiter, allow, reset
- Tek dosya çıktı — başka dosya oluşturma
- Mock yasak — gerçek mantık
- Bilinen bug'lar: pencere ms, limit kontrolü, remaining, reset(undefined)

Doğrulama (bitince sen çalıştır):
node test/ab-round3/validate.mjs max
node test/ab-round3/validate.mjs plain
```

---

## Chat A — Max MCP

**MCP:** ultra-thinking bağlı, v1.7.0

```
max de düşün: test/ab-round3/fixture/rate-limit.mjs bug fix

Çıktı: test/ab-round3/max/rate-limit.mjs (tek dosya, fixture'dan kopyala-düzelt)
```

---

## Chat B — Düz (MCP yok)

**MCP:** ultra-thinking **kapalı** veya bu chat'te think çağırma

```
test/ab-round3/fixture/rate-limit.mjs bug fix

Çıktı: test/ab-round3/plain/rate-limit.mjs (tek dosya, fixture'dan kopyala-düzelt)
```

---

## Değerlendirme

```bash
node test/ab-round3/validate.mjs both
```

| Metrik | Nasıl |
|--------|--------|
| Test geçiş | validate passed/total |
| Diff boyutu | `wc -l` max vs plain vs fixture |
| Gereksiz karmaşıklık | Abstraction eklendi mi? |
| Edge case | reset(undefined) davranışı net mi? |

**Kazanan:** Daha yüksek pass + daha sade diff (dürüst kıyas).

---

## Not

- `src/` ve MCP koduna **dokunulmaz** — bu tur ürün geliştirme değil, kalite ölçümü
- Önceki HTML/tavus testleri bu protokolle **ilgisiz**
