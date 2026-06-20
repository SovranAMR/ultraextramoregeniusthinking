# Ultra Extra More Genius Thinking

MCP server — doğal dille mod seç, kaliteli cevap al.

## Kullanım (tek cümle)

Chat'e yaz, hepsi bu:

```
düşünme modu mcp easy de düşün: React'te custom hook nasıl yazılır?
```

```
düşünme modu mcp medium de düşün: bu kodu incele ve iyileştir
```

```
düşünme modu mcp more de düşün: mikroservis mimarisi mi monolith mi?
```

```
düşünme modu mcp max de düşün: ödeme sistemini yeniden tasarla
```

Agent modu otomatik algılar, pass pass iyileştirir, sana **sadece final cevabı** verir.

## Modlar

| Mod | Pass | Execution |
|-----|------|-----------|
| easy | 3 | think → read → write |
| medium | 5 | think → read → read → **write** → verify |
| more | 7 | medium + write → verify |
| max | 10 | çoklu read/write/verify |

MCP dosya okumaz/yazmaz. Agent Read/Write/Shell kullanır.

Kısa alternatifler de çalışır: `medium de düşün`, `max thinking`, `mcp easy de düşün`

## Kurulum

```bash
npm install && npm run build
```

`.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "ultra-thinking": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/to/ultraextramoregeniusthinking/dist/server.js"]
    }
  }
}
```

## Lisans

MIT
