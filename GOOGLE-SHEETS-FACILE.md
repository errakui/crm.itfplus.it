# 📊 Google Sheets - Setup Facile (5 minuti)

## Passo 1: Crea Google Sheet

1. Vai su https://sheets.google.com
2. Crea nuovo foglio: **"ITFPlus - Utenti Trial"**
3. Nella prima riga scrivi:

```
A1: Data/Ora
B1: Nome
C1: Cognome  
D1: Email
E1: Telefono
F1: Azienda
G1: Ruolo
H1: Settore
I1: Città
J1: Note
K1: Scadenza
```

---

## Passo 2: Aggiungi Script

1. Nel foglio, vai su **Estensioni** → **Apps Script**
2. Cancella tutto il codice esistente
3. **COPIA E INCOLLA questo codice:**

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    var row = [
      new Date().toLocaleString('it-IT'),
      data.nome || '',
      data.cognome || '',
      data.email || '',
      data.telefono || '',
      data.azienda || '',
      data.ruolo || '',
      data.settore || '',
      data.citta || '',
      data.note || '',
      data.scadenza || ''
    ];
    
    sheet.appendRow(row);
    
    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. Clicca **"Salva progetto"** (icona floppy disk)
5. Nome progetto: `ITFPlus Trial Logger`

---

## Passo 3: Pubblica come Web App

1. Clicca **"Implementa"** (in alto a destra) → **"Nuova implementazione"**
2. Clicca sulla rotellina ⚙️ → Seleziona **"App web"**
3. Descrizione: `API per salvare utenti trial`
4. **"Esegui come"**: **Me** (il tuo account)
5. **"Chi ha accesso"**: **Chiunque**
6. Clicca **"Implementa"**
7. **COPIA L'URL** che appare (qualcosa tipo: `https://script.google.com/macros/s/ABC...XYZ/exec`)
8. Clicca **"Fine"**

---

## Passo 4: Configura il Server

Nel file `/var/www/itfplus/server/.env` aggiungi:

```env
# Google Sheets (metodo semplice)
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/TUO_URL_QUI/exec
```

Sostituisci `TUO_URL_QUI` con l'URL copiato al Passo 3.

---

## ✅ FATTO!

Ora quando un utente compila il form trial:
1. ✅ Account creato
2. ✅ Email inviata
3. ✅ **Dati salvati automaticamente su Google Sheet**

Niente file JSON, niente Google Cloud, niente complicazioni!

---

## 🔧 Se devi modificare lo script in futuro

1. Apri il Google Sheet
2. **Estensioni** → **Apps Script**
3. Modifica e salva
4. **Implementa** → **Gestisci implementazioni**
5. Clicca sulla rotellina → **Nuova versione** → **Implementa**

