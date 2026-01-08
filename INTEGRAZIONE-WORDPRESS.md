# Integrazione Form Account di Prova su WordPress

## Form HTML Standalone

È stato creato un form HTML completo e standalone che può essere facilmente integrato su WordPress.

**File**: `/public/form-wordpress.html`

## Come Integrare su WordPress

### Metodo 1: Shortcode HTML (Consigliato)

1. **Copia il contenuto del form** dal file `form-wordpress.html`
2. **Vai su WordPress** → Pagine → Modifica la pagina dove vuoi inserire il form
3. **Aggiungi un blocco HTML personalizzato** o usa lo shortcode `[html]`
4. **Incolla il codice HTML completo** (inclusi `<style>` e `<script>`)

### Metodo 2: Iframe (Più Semplice)

1. **Carica il file** `form-wordpress.html` sul tuo server WordPress
2. **Inserisci un iframe** nella pagina:

```html
<iframe 
    src="https://crm.itfplus.it/form-wordpress.html" 
    width="100%" 
    height="800" 
    frameborder="0"
    style="border: none; max-width: 600px; margin: 0 auto; display: block;">
</iframe>
```

### Metodo 3: Plugin HTML Personalizzato

1. Installa un plugin come "Insert Headers and Footers" o "Custom HTML Widget"
2. Copia il contenuto completo di `form-wordpress.html`
3. Incollalo nel widget o nell'area personalizzata

## Caratteristiche del Form

✅ **Completamente standalone** - Non richiede dipendenze esterne  
✅ **Stile isolato** - Usa prefissi `itf-` per evitare conflitti CSS  
✅ **Responsive** - Si adatta a tutti i dispositivi  
✅ **Validazione lato client** - Controlla email e campi obbligatori  
✅ **Integrazione API** - Si collega direttamente all'API pubblica  
✅ **Messaggi di feedback** - Mostra successo/errore all'utente  

## Personalizzazione

Il form usa prefissi `itf-` per tutte le classi CSS, quindi puoi personalizzarlo senza conflitti:

- `.itf-form-container` - Container principale
- `.itf-form-group` - Gruppo di campi
- `.itf-message` - Messaggi di successo/errore
- `.itf-info` - Box informativo

## Test del Form

Il form è già configurato per:
- **API URL**: `https://crm.itfplus.it/api/public/request-account`
- **API Key**: Configurata nel codice
- **Durata account**: 3 giorni (fisso)

## Note Importanti

⚠️ **Sicurezza**: L'API Key è inclusa nel codice HTML. Questo è accettabile per un endpoint pubblico, ma assicurati che l'API sia protetta lato server.

⚠️ **CORS**: Se il form è su un dominio diverso, verifica che il server permetta le richieste cross-origin.

## Supporto

Per problemi o domande, consulta:
- `API_PUBLIC_ACCOUNT.md` - Documentazione API
- `form-wordpress.html` - Codice sorgente del form

