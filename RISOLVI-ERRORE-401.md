# ⚠️ Errore 401 - Come Risolvere

## Problema

Google Sheets risponde con errore 401 (non autorizzato).
Significa che i permessi dello script non sono corretti.

## Soluzione (2 minuti)

### Passo 1: Verifica Implementazione

1. Apri il Google Sheet
2. **Estensioni** → **Apps Script**
3. In alto a destra clicca **"Implementa"** → **"Gestisci implementazioni"**
4. Clicca sulla rotellina ⚙️ dell'implementazione attiva
5. **VERIFICA QUESTI SETTAGGI:**

```
✅ Esegui come: Me (il tuo account email)
✅ Chi ha accesso: Chiunque
```

6. Se sono sbagliati, **CAMBIA**:
   - "Chi ha accesso" → **"Chiunque"**
   
7. Clicca **"Implementa"**
8. **IMPORTANTE**: Potrebbe chiederti di autorizzare l'app
   - Clicca **"Autorizza accesso"**
   - Seleziona il tuo account
   - Clicca **"Avanzate"** (in basso)
   - Clicca **"Vai a [nome progetto] (non sicuro)"**
   - Clicca **"Consenti"**

---

### Passo 2: (Alternativo) Ricrea Implementazione

Se il Passo 1 non funziona:

1. **Gestisci implementazioni** → Clicca cestino 🗑️ per eliminare quella vecchia
2. **Implementa** → **Nuova implementazione**
3. Rotellina ⚙️ → **"App web"**
4. **Esegui come**: **Me**
5. **Chi ha accesso**: **Chiunque** ⚠️ (IMPORTANTE)
6. **Implementa**
7. Autorizza quando richiesto (vedi sopra)
8. **COPIA IL NUOVO URL**
9. Aggiorna nel `.env`:

```bash
nano /var/www/itfplus/server/.env
```

Sostituisci la riga:
```
GOOGLE_SHEETS_WEBHOOK_URL=IL_NUOVO_URL_QUI
```

10. Riavvia:
```bash
pm2 restart itfplus-server
```

---

### Passo 3: Testa

```bash
curl -X POST http://localhost:8000/api/public/request-account \
  -H "Content-Type: application/json" \
  -H "X-API-Key: 933126c4a803a65808eab51db263a5287841a661d648c08196363bd257b08246" \
  -d '{"email":"test@test.com","name":"Test","expiresInDays":3}'
```

Controlla i log:
```bash
pm2 logs itfplus-server --lines 5
```

Dovresti vedere:
```
[Google Sheets] ✅ Dati salvati per: test@test.com
```

---

## ✅ Come Verificare che Funziona

1. Vai sul Google Sheet
2. Dovresti vedere una nuova riga con i dati del test
3. Se vedi la riga = **FUNZIONA!** ✅

---

## 🆘 Se Ancora Non Funziona

Contattami e vediamo insieme!

