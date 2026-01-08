import React from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Chip,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material';

// Interfaccia per gli articoli
export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  category: string;
  readTime: string;
}

// Articoli del blog (hardcoded per ora)
export const articles: Article[] = [
  {
    id: '1',
    slug: 'come-funziona-itfplus',
    title: 'Come funziona ITFPLUS: Guida completa alla piattaforma',
    excerpt: 'Scopri come utilizzare al meglio ITFPLUS per la ricerca e consultazione di documenti giuridici. Una guida passo-passo per professionisti del diritto.',
    content: `
## Introduzione

**ITFPLUS** è la piattaforma di documentazione giuridica pensata per avvocati, studi legali e professionisti del diritto. Offre accesso rapido e sicuro a una vasta collezione di sentenze e documenti legali.

## Come accedere alla piattaforma

1. **Registrazione**: Visita la pagina di login e richiedi una prova gratuita di 3 giorni
2. **Credenziali**: Riceverai via email le credenziali di accesso
3. **Primo accesso**: Effettua il login con email e password ricevute

## Funzionalità principali

### Motore di ricerca avanzato

Il cuore di ITFPLUS è il potente motore di ricerca che permette di:

- **Ricerca testuale**: Cerca per parole chiave nel titolo e nel contenuto dei documenti
- **Filtro per città**: Filtra i risultati per tribunale/città di riferimento
- **Ricerca combinata**: Combina più filtri per risultati più precisi

### Gestione dei Preferiti

Salva i documenti più importanti nei tuoi preferiti per accedervi rapidamente:

- Clicca sull'icona cuore per aggiungere un documento ai preferiti
- Accedi alla sezione "Preferiti" dal menu per visualizzarli tutti
- Rimuovi un documento dai preferiti con un altro click

### Visualizzatore documenti

Il visualizzatore integrato permette di:

- Leggere i documenti direttamente nella piattaforma
- Evidenziare i termini di ricerca nel testo
- Navigare facilmente tra le pagine

## Assistenza e supporto

Per qualsiasi domanda o problema:

- **Email**: info@itfplus.it
- **Telefono**: +39 333 617 0230
- **Sezione FAQ**: Consulta le domande frequenti

## Convenzioni e tribunali

ITFPLUS collabora con diversi tribunali italiani per offrire un archivio sempre aggiornato. Resta sintonizzato sul nostro blog per le ultime novità sulle convenzioni istituite.

---

*Il team ITFPLUS è a tua disposizione per aiutarti a sfruttare al meglio la piattaforma.*
    `,
    date: '2026-01-08',
    author: 'Team ITFPLUS',
    category: 'Guide',
    readTime: '5 min',
  },
];

const BlogPage: React.FC = () => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      {/* Header */}
      <Box sx={{ mb: { xs: 4, md: 6 }, textAlign: 'center' }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontFamily: '"Libre Baskerville", Georgia, serif',
            fontWeight: 700,
            color: 'var(--primary-color)',
            mb: 2,
            fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' },
          }}
        >
          Blog
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: 'var(--text-secondary)',
            maxWidth: 600,
            mx: 'auto',
            fontSize: { xs: '0.95rem', md: '1.05rem' },
          }}
        >
          News, guide e aggiornamenti sulla piattaforma ITFPLUS e sul mondo giuridico
        </Typography>
      </Box>

      {/* Lista articoli */}
      <Grid container spacing={3}>
        {articles.map((article) => (
          <Grid item xs={12} md={6} lg={4} key={article.id}>
            <Card
              elevation={0}
              sx={{
                height: '100%',
                border: '1px solid var(--border-light)',
                borderRadius: '4px',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: 'var(--primary-color)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                },
              }}
            >
              <CardActionArea
                component={Link}
                to={`/blog/${article.slug}`}
                sx={{ height: '100%' }}
              >
                <CardContent sx={{ p: 3 }}>
                  {/* Categoria */}
                  <Chip
                    label={article.category}
                    size="small"
                    sx={{
                      mb: 2,
                      backgroundColor: 'rgba(27, 42, 74, 0.08)',
                      color: 'var(--primary-color)',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      borderRadius: '4px',
                    }}
                  />

                  {/* Titolo */}
                  <Typography
                    variant="h6"
                    component="h2"
                    sx={{
                      fontFamily: '"Libre Baskerville", Georgia, serif',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      mb: 2,
                      fontSize: { xs: '1rem', md: '1.1rem' },
                      lineHeight: 1.4,
                    }}
                  >
                    {article.title}
                  </Typography>

                  {/* Excerpt */}
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'var(--text-secondary)',
                      mb: 3,
                      lineHeight: 1.6,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {article.excerpt}
                  </Typography>

                  {/* Footer card */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      pt: 2,
                      borderTop: '1px solid var(--border-light)',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CalendarIcon sx={{ fontSize: 16, color: 'var(--text-tertiary)' }} />
                      <Typography
                        variant="caption"
                        sx={{ color: 'var(--text-tertiary)' }}
                      >
                        {formatDate(article.date)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography
                        variant="caption"
                        sx={{ 
                          color: 'var(--primary-color)', 
                          fontWeight: 600,
                        }}
                      >
                        Leggi
                      </Typography>
                      <ArrowIcon sx={{ fontSize: 16, color: 'var(--primary-color)' }} />
                    </Box>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Se non ci sono articoli */}
      {articles.length === 0 && (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            px: 3,
            border: '1px dashed var(--border-light)',
            borderRadius: '4px',
          }}
        >
          <Typography variant="h6" color="text.secondary">
            Nessun articolo disponibile al momento
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default BlogPage;

