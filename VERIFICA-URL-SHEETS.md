# 🔍 Verifica URL Google Sheets

## Problema Attuale

Continua errore 401 = URL vecchio o mancata autorizzazione

## ✅ SOLUZIONE DEFINITIVA

### Passo 1: Elimina Tutto e Ricomincia

1. Apri Google Sheet
2. **Estensioni** → **Apps Script**
3. **Implementa** → **Gestisci implementazioni**
4. **ELIMINA** tutte le implementazioni (cestino 🗑️)

### Passo 2: Crea Nuova Implementazione

1. **Implementa** → **Nuova implementazione**
2. Rotellina ⚙️ → **"App web"**
3. Descrizione: `API Trial v2`
4. **Esegui come**: **Me (il tuo account)**
5. **Chi ha accesso**: **Chiunque** ⚠️ IMPORTANTE
6. Clicca **"Implementa"**

### Passo 3: AUTORIZZA (Fondamentale!)

Google ti mostrerà una schermata:

1. Clicca **"Autorizza accesso"**
2. Seleziona il tuo account Google
3. Verrà scritto "Google non ha verificato questa app"
4. Clicca **"Avanzate"** (link piccolo in basso)
5. Clicca **"Vai a ITFPlus Trial Logger (non sicuro)"**
6. Clicca **"Consenti"**

### Passo 4: Copia NUOVO URL

Dopo l'autorizzazione, Google ti mostra:
```
URL dell'app web:
https://script.google.com/macros/s/NUOVO_ID_QUI/exec
```

**COPIA QUESTO URL!**

### Passo 5: Aggiorna nel Server

```bash
nano /var/www/itfplus/server/.env
```

Trova la riga:
```
GOOGLE_SHEETS_WEBHOOK_URL=...
```

Sostituisci con il NUOVO URL:
```
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/IL_TUO_NUOVO_ID/exec
```

Salva: `Ctrl+X`, poi `Y`, poi `Enter`

### Passo 6: Riavvia

```bash
pm2 restart itfplus-server --update-env
```

### Passo 7: Testa

```bash
curl -X POST http://localhost:8000/api/public/request-account \
  -H "Content-Type: application/json" \
  -H "X-API-Key: 933126c4a803a65808eab51db263a5287841a661d648c08196363bd257b08246" \
  -d '{"email":"test.finale@example.com","name":"Test Finale","expiresInDays":3,"telefono":"+39 333","azienda":"Test","ruolo":"Avvocato","settore":"Civile","citta":"Roma","note":"Test"}'
```

Controlla log:
```bash
pm2 logs itfplus-server --lines 5
```

Dovresti vedere:
```
[Google Sheets] ✅ Dati salvati per: test.finale@example.com
```

---

## 🎯 Vai sul Google Sheet

Dovresti vedere le righe con i dati dei test!

Se vedi le righe = **FUNZIONA!** ✅

