import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Chip,
  Alert,
  Tooltip,
  CircularProgress,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  FormHelperText,
  Pagination,
  Stack,
  Checkbox,
  InputAdornment,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  FileUpload as FileUploadIcon,
  InsertDriveFile as FileIcon,
  CloudUpload as CloudUploadIcon,
  ErrorOutline as ErrorOutlineIcon,
  Close as CloseIcon,
  PictureAsPdf as PictureAsPdfIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import axios from 'axios';
import AuthContext from '../contexts/AuthContext';
import API from '../utils/http';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  expiresAt?: string; // Data di scadenza dell'account
  expiresInDays?: string; // Giorni di validità per l'account (30 o 360)
}

interface Document {
  id: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileSize: number;
  uploadDate: string;
  viewCount: number;
  downloadCount: number;
  favoriteCount: number;
  keywords?: string[];
  content?: string;
}

interface AdminStats {
  totalUsers: number;
  totalDocuments: number;
  totalSize: number;
  activeUsers: number;
}

interface PaginatedResponse {
  documents: Document[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface PaginatedUsersResponse {
  users: User[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

// Funzione di utilità per determinare lo stato dell'account
const getAccountStatus = (expiresAt: Date | null): 'expired' | 'expiring-soon' | 'active' => {
  if (!expiresAt) return 'active'; // Account senza scadenza
  
  const now = new Date();
  
  // Verifico se l'account è già scaduto
  if (now > expiresAt) return 'expired';
  
  // Verifico se scade entro 7 giorni
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(now.getDate() + 7);
  
  if (expiresAt < sevenDaysFromNow) return 'expiring-soon';
  
  // Altrimenti è attivo regolare
  return 'active';
};

const AdminPage: React.FC = () => {
  const { token, isAdmin } = useContext(AuthContext);
  const [tabValue, setTabValue] = useState<number>(0);
  const [users, setUsers] = useState<User[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalDocuments, setTotalDocuments] = useState<number>(0);

  // Stato per selezione multipla
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [openMultiDeleteDialog, setOpenMultiDeleteDialog] = useState<boolean>(false);

  // Dialog states
  const [openUserDialog, setOpenUserDialog] = useState<boolean>(false);
  const [openDocumentDialog, setOpenDocumentDialog] = useState<boolean>(false);
  const [openBulkUploadDialog, setOpenBulkUploadDialog] = useState<boolean>(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [deleteItemType, setDeleteItemType] = useState<'user' | 'document' | null>(null);

  // Form states
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);
  const [editingDocument, setEditingDocument] = useState<Partial<Document> | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  
  // Bulk upload states
  const [bulkFiles, setBulkFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [currentFileIndex, setCurrentFileIndex] = useState<number>(0);
  const [uploadSuccess, setUploadSuccess] = useState<string[]>([]);
  const [uploadFailed, setUploadFailed] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const [usersSortBy, setUsersSortBy] = useState<string>('default');
  const [userCurrentPage, setUserCurrentPage] = useState<number>(1);
  const [userTotalPages, setUserTotalPages] = useState<number>(1);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [userSearchTerm, setUserSearchTerm] = useState<string>('');

  useEffect(() => {
    // Se non è admin, non dovrebbe essere qui
    if (!isAdmin()) {
      return;
    }
    
    console.log("[AdminPage] useEffect per loadTabData attivato", {
      tabValue,
      currentPage,
      userCurrentPage,
      usersSortBy,
      userSearchTerm
    });
    
    // Carica i dati per la tab corrente
    loadTabData(tabValue);
    loadStats();
  }, [token, isAdmin, tabValue, currentPage, userCurrentPage, usersSortBy, userSearchTerm]);

  const loadTabData = async (tab: number) => {
    setLoading(true);
    setError(null);
    
    try {
      if (tab === 0) {
        // Carica utenti con paginazione
        console.log(`[AdminPage] Richiesta utenti con paginazione:`, {
          userCurrentPage,
          pageSize: 10,
          sortBy: usersSortBy,
          searchTerm: userSearchTerm
        });
        
        // Costruisci i parametri di richiesta
        const params: Record<string, any> = {
          page: userCurrentPage,
          pageSize: 10
        };
        
        // Aggiungi parametro di ordinamento se presente
        if (usersSortBy !== 'default') {
          params.sortBy = usersSortBy;
        }
        
        // Aggiungi parametro di ricerca se presente
        if (userSearchTerm) {
          params.searchTerm = userSearchTerm;
        }
        
        const response = await axios.get('/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` },
          params: params
        });
        
        if (response.data.users) {
          setUsers(response.data.users || []);
          
          // Se il server supporta la paginazione, usa i dati restituiti
          if (response.data.totalPages) {
            setUserTotalPages(response.data.totalPages || 1);
            setTotalUsers(response.data.total || 0);
          } else {
            // Altrimenti calcola manualmente (10 per pagina)
            const total = response.data.users.length;
            setTotalUsers(total);
            setUserTotalPages(Math.ceil(total / 10));
          }
        }
      } else if (tab === 1) {
        // Carica documenti con paginazione usando la nuova API utilità
        console.log(`[AdminPage] Richiesta documenti con paginazione:`, {
          currentPage,
          pageSize: 10
        });
        
        const response = await API.getPaginated<PaginatedResponse>(
          '/api/documents/admin/all',
          currentPage,
          10,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        console.log('[AdminPage] Risposta documenti del server:', {
          documents: response.data.documents?.length || 0,
          page: response.data.page,
          totalPages: response.data.totalPages,
          total: response.data.total
        });
        
        setDocuments(response.data.documents || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalDocuments(response.data.total || 0);
      }
    } catch (err: any) {
      console.error('Errore nel caricamento dei dati:', err);
      setError(err.response?.data?.message || 'Errore nel caricamento dei dati.');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await axios.get('/api/auth/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.stats);
      console.log('Statistiche caricate:', response.data.stats);
    } catch (error) {
      console.error('Errore nel caricamento delle statistiche:', error);
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setCurrentPage(1); // Reset alla prima pagina quando si cambia tab
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    console.log(`[AdminPage] handlePageChange - Cambio pagina da ${currentPage} a ${value}`);
    setCurrentPage(value);
  };

  const handleRefresh = () => {
    loadTabData(tabValue);
  };

  // Gestione utenti
  const openUserForm = (user?: User) => {
    if (user) {
      setEditingUser({ ...user });
    } else {
      setEditingUser({ name: '', email: '', role: 'USER' });
    }
    setOpenUserDialog(true);
  };

  const handleUserFormChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | SelectChangeEvent
  ) => {
    const { name, value } = e.target;
    if (name) {
      setEditingUser(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleUserSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (editingUser?.id) {
        // Aggiorna utente
        await axios.put(
          `/api/admin/users/${editingUser.id}`,
          editingUser,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess('Utente aggiornato con successo!');
      } else {
        // Crea utente
        await axios.post(
          '/api/admin/users',
          editingUser,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess('Utente creato con successo!');
      }
      setOpenUserDialog(false);
      loadTabData(0);
    } catch (err: any) {
      console.error('Errore nella gestione dell\'utente:', err);
      setError(err.response?.data?.message || 'Errore nella gestione dell\'utente.');
    } finally {
      setLoading(false);
    }
  };

  // Gestione documenti
  const openDocumentForm = (document?: Document) => {
    if (document) {
      setEditingDocument({ ...document });
    } else {
      setEditingDocument({ title: '', description: '', keywords: [] });
    }
    setDocumentFile(null);
    setOpenDocumentDialog(true);
  };

  const handleDocumentFormChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setEditingDocument(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleKeywordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const keywordsText = e.target.value;
    const keywordsArray = keywordsText.split(',').map(k => k.trim()).filter(k => k);
    setEditingDocument(prev => ({ ...prev, keywords: keywordsArray }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setDocumentFile(e.target.files[0]);
    }
  };

  const handleDocumentSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (editingDocument?.id) {
        // Aggiorna documento (solo metadati)
        await axios.put(
          `/api/documents/${editingDocument.id}`,
          editingDocument,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess('Documento aggiornato con successo!');
      } else {
        // Crea documento (richiede file)
        if (!documentFile) {
          setError('Devi selezionare un file PDF.');
          setLoading(false);
          return;
        }
        
        // Verifica che sia effettivamente un PDF
        if (!documentFile.type || documentFile.type !== 'application/pdf') {
          setError('Il file selezionato non è un PDF valido. Per favore, seleziona un file PDF.');
          setLoading(false);
          return;
        }

        // Verifica dimensione del file (max 20MB)
        const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB in byte
        if (documentFile.size > MAX_FILE_SIZE) {
          setError(`Il file è troppo grande (${(documentFile.size / (1024 * 1024)).toFixed(2)}MB). La dimensione massima consentita è 20MB.`);
          setLoading(false);
          return;
        }
        
        const formData = new FormData();
        formData.append('file', documentFile);
        formData.append('title', editingDocument?.title || documentFile.name.replace('.pdf', ''));
        formData.append('description', editingDocument?.description || '');
        if (editingDocument?.keywords && editingDocument.keywords.length > 0) {
          formData.append('keywords', JSON.stringify(editingDocument.keywords));
        }
        
        console.log(`[AdminPage] Avvio caricamento documento: ${documentFile.name} (${(documentFile.size / 1024).toFixed(2)}KB)`);
        
        try {
          const response = await axios.post(
            '/api/documents',
            formData,
            { 
              headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
              },
              onUploadProgress: (progressEvent) => {
                // Monitoraggio progresso upload
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total!);
                console.log(`[AdminPage] Progresso upload: ${percentCompleted}%`);
              }
            }
          );
          
          console.log('[AdminPage] Risposta dal server:', response.data);
          
          if (response.data?.document?.id) {
            setSuccess(`Documento "${response.data.document.title}" caricato con successo! (ID: ${response.data.document.id})`);
          } else {
            setSuccess('Documento caricato con successo!');
          }
          setOpenDocumentDialog(false);
          loadTabData(1);
        } catch (uploadError: any) {
          console.error('[AdminPage] Errore upload:', uploadError);
          
          // Gestisce errori specifici
          if (uploadError.response) {
            if (uploadError.response.status === 409) {
              // Conflitto (documento duplicato)
              setError(`Un documento con lo stesso nome è già presente nel sistema. ${uploadError.response.data?.existingDocument?.title || ''}`);
            } else if (uploadError.response.status === 413) {
              // File troppo grande
              setError('Il file è troppo grande. La dimensione massima consentita è 20MB.');
            } else {
              setError(uploadError.response.data?.message || 'Errore durante il caricamento del documento.');
            }
          } else if (uploadError.request) {
            setError('Nessuna risposta dal server. Verifica la tua connessione e riprova.');
          } else {
            setError(`Errore durante il caricamento: ${uploadError.message}`);
          }
          setLoading(false);
          return;
        }
      }
    } catch (err: any) {
      console.error('[AdminPage] Errore generale nella gestione del documento:', err);
      setError(err.response?.data?.message || 'Errore nella gestione del documento.');
    } finally {
      setLoading(false);
    }
  };

  // Gestione eliminazione
  const openDeleteConfirmation = (id: string, type: 'user' | 'document') => {
    setDeleteItemId(id);
    setDeleteItemType(type);
    setOpenDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!deleteItemId || !deleteItemType) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (deleteItemType === 'user') {
        await axios.delete(`/api/admin/users/${deleteItemId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Utente eliminato con successo!');
        loadTabData(0);
      } else if (deleteItemType === 'document') {
        await axios.delete(`/api/documents/${deleteItemId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Documento eliminato con successo!');
        loadTabData(1);
      }
    } catch (err: any) {
      console.error('Errore nell\'eliminazione:', err);
      setError(err.response?.data?.message || 'Errore nell\'eliminazione.');
    } finally {
      setLoading(false);
      setOpenDeleteDialog(false);
      setDeleteItemId(null);
      setDeleteItemType(null);
    }
  };

  // Formattazione date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Nuova funzione per gestire il caricamento di più file
  const handleBulkFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setBulkFiles(filesArray);
    }
  };

  const openBulkUploadForm = () => {
    setBulkFiles([]);
    setUploadProgress(0);
    setCurrentFileIndex(0);
    setUploadSuccess([]);
    setUploadFailed([]);
    setIsUploading(false);
    setOpenBulkUploadDialog(true);
  };

  const handleBulkUpload = async () => {
    if (!bulkFiles.length) return;
    
    console.log("Avvio caricamento di", bulkFiles.length, "file");
    setIsUploading(true);
    setUploadSuccess([]);
    setUploadFailed([]);
    setCurrentFileIndex(0);
    setUploadProgress(0);
    
    try {
      const formData = new FormData();
      
      // Aggiungi tutti i file al FormData
      bulkFiles.forEach(file => {
        console.log("Aggiunto file:", file.name, file.type, file.size);
        formData.append('files', file);
      });
      
      console.log("Token di autorizzazione:", token ? token.substring(0, 20) + "..." : "Mancante");
      
      // Usiamo axios invece di fetch per mantenere consistenza con il resto dell'app
      const response = await axios.post(
        '/api/documents/bulk-upload',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total!);
            setUploadProgress(percentCompleted);
          }
        }
      );
      
      console.log("Risposta del server:", response.status);
      
      const result = response.data;
      
      setUploadProgress(100);
      setCurrentFileIndex(bulkFiles.length);
      setUploadSuccess(Array(result.results.successful).fill('').map((_, i) => `File ${i+1}`));
      setUploadFailed(result.results.failedFiles);
      
      // Aggiorna la lista dei documenti dopo il caricamento
      loadTabData(1);
      
      const message = `Caricamento completato: ${result.results.successful} file caricati con successo, ${result.results.failed} falliti.`;
      setSuccess(message);
    } catch (error: any) {
      console.error('Errore durante il caricamento multiplo:', error);
      if (error.response) {
        console.error("Dettagli errore:", error.response.status, error.response.data);
      }
      setUploadFailed(bulkFiles.map(file => file.name));
      setError(`Errore durante il caricamento multiplo: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Gestione selezione multipla
  const handleSelectDocument = (id: string) => {
    setSelectedDocuments(prev => {
      if (prev.includes(id)) {
        return prev.filter(docId => docId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAllDocuments = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const allIds = documents.map(doc => doc.id);
      setSelectedDocuments(allIds);
    } else {
      setSelectedDocuments([]);
    }
  };

  const handleMultiDeleteConfirmation = () => {
    setOpenMultiDeleteDialog(true);
  };

  const handleMultiDelete = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Esegui l'eliminazione in sequenza per ogni documento selezionato
      const results = await Promise.all(
        selectedDocuments.map(id => 
          axios.delete(`/api/documents/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        )
      );
      
      setSuccess(`${selectedDocuments.length} documenti eliminati con successo!`);
      setSelectedDocuments([]);
      loadTabData(1);
    } catch (err: any) {
      console.error('Errore nell\'eliminazione multipla:', err);
      setError(err.response?.data?.message || 'Errore nell\'eliminazione dei documenti.');
    } finally {
      setLoading(false);
      setOpenMultiDeleteDialog(false);
    }
  };

  const handleUserPageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    console.log(`[AdminPage] handleUserPageChange - Cambio pagina utenti da ${userCurrentPage} a ${value}`);
    setUserCurrentPage(value);
  };
  
  const handleUserSortChange = (event: SelectChangeEvent<string>) => {
    setUsersSortBy(event.target.value);
    setUserCurrentPage(1); // Reset alla prima pagina quando cambia l'ordinamento
  };

  const handleUserSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserSearchTerm(event.target.value);
    setUserCurrentPage(1); // Reset alla prima pagina quando cambia la ricerca
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }} className="fade-in">
      {!isAdmin() ? (
        <Alert severity="error" sx={{ mb: 4 }}>
          Non hai i permessi per accedere a questa pagina.
        </Alert>
      ) : (
        <>
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom 
              className="page-title"
              sx={{ 
                fontWeight: 600,
                mb: 2
              }}
            >
              Pannello di Amministrazione
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ 
                mb: 3,
                maxWidth: '800px'
              }}
              className="slide-up"
            >
              Gestisci utenti, documenti e monitora le statistiche del sistema.
            </Typography>

            {/* Notifiche di successo ed errore */}
            {success && (
              <Alert 
                severity="success" 
                sx={{ mb: 2 }}
                onClose={() => setSuccess(null)}
              >
                {success}
              </Alert>
            )}
            
            {error && (
              <Alert 
                severity="error" 
                sx={{ mb: 2 }}
                onClose={() => setError(null)}
              >
                {error}
              </Alert>
            )}
          </Box>

          {/* Statistiche del sistema - Layout migliorato */}
          <Grid container spacing={3} className="fade-blur-in" sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                sx={{ 
                  p: 2.5, 
                  height: '100%',
                  borderRadius: '10px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}
              >
                <Typography variant="overline" sx={{ opacity: 0.7 }}>
                  Utenti Totali
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600, my: 1 }}>
                  {stats?.totalUsers ?? '—'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box component="span" sx={{ 
                    display: 'inline-block', 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    bgcolor: 'success.main' 
                  }} />
                  <Typography variant="body2" color="text.secondary">
                    {stats?.activeUsers ?? '—'} attivi
                  </Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                sx={{ 
                  p: 2.5, 
                  height: '100%',
                  borderRadius: '10px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}
              >
                <Typography variant="overline" sx={{ opacity: 0.7 }}>
                  Documenti Totali
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600, my: 1 }}>
                  {stats?.totalDocuments ?? '—'}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                sx={{ 
                  p: 2.5, 
                  height: '100%',
                  borderRadius: '10px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}
              >
                <Typography variant="overline" sx={{ opacity: 0.7 }}>
                  Spazio Utilizzato
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600, my: 1 }}>
                  {stats?.totalSize ? (stats.totalSize / (1024 * 1024)).toFixed(1) : '—'}
                </Typography>
                <Typography variant="body2" color="text.secondary">MB</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                sx={{ 
                  p: 2.5, 
                  height: '100%',
                  borderRadius: '10px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}
              >
                <Typography variant="overline" sx={{ opacity: 0.7 }}>
                  Data aggiornamento
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600, my: 1 }}>
                  {new Date().toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date().toLocaleDateString('it-IT', { year: 'numeric' })}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Schede per utenti/documenti */}
          <Paper sx={{ borderRadius: '10px', overflow: 'hidden', mb: 4 }} elevation={2}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
              sx={{ 
                borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                '& .MuiTab-root': {
                  fontWeight: 500,
                  textTransform: 'none',
                  transition: 'all 0.2s ease',
                  py: 1.5
                },
                '& .Mui-selected': {
                  fontWeight: 600
                }
              }}
            >
              <Tab label="Gestione Utenti" />
              <Tab label="Gestione Documenti" />
            </Tabs>

            <Box sx={{ p: 2.5 }}>
              {/* Gestione Utenti */}
              <TabPanel value={tabValue} index={0}>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Utenti ({totalUsers})
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      placeholder="Cerca utenti..."
                      variant="outlined"
                      size="small"
                      value={userSearchTerm}
                      onChange={handleUserSearch}
                      sx={{ 
                        width: '220px', 
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px'
                        }
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon fontSize="small" color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: userSearchTerm ? (
                          <InputAdornment position="end">
                            <IconButton 
                              size="small" 
                              onClick={() => setUserSearchTerm('')}
                              edge="end"
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </InputAdornment>
                        ) : null
                      }}
                    />
                    <FormControl sx={{ minWidth: 200 }} size="small">
                      <InputLabel id="user-sort-label">Ordina per</InputLabel>
                      <Select
                        labelId="user-sort-label"
                        id="user-sort"
                        value={usersSortBy}
                        label="Ordina per"
                        onChange={handleUserSortChange}
                        sx={{ borderRadius: '8px' }}
                      >
                        <MenuItem value="default">Predefinito</MenuItem>
                        <MenuItem value="expiresAt-asc">Data scadenza (più vicina)</MenuItem>
                        <MenuItem value="expiresAt-desc">Data scadenza (più lontana)</MenuItem>
                        <MenuItem value="createdAt-desc">Registrazione (più recenti)</MenuItem>
                        <MenuItem value="createdAt-asc">Registrazione (più vecchi)</MenuItem>
                      </Select>
                    </FormControl>
                    <Button
                      startIcon={<AddIcon />}
                      variant="contained"
                      color="primary"
                      onClick={() => openUserForm()}
                      size="medium"
                      sx={{ 
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 500,
                      }}
                    >
                      Aggiungi Utente
                    </Button>
                    <IconButton 
                      color="primary" 
                      onClick={handleRefresh}
                    >
                      <RefreshIcon />
                    </IconButton>
                  </Box>
                </Box>

                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress color="primary" />
                  </Box>
                ) : error ? (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                  </Alert>
                ) : users.length === 0 ? (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Non ci sono utenti disponibili.
                  </Alert>
                ) : (
                  <>
                    <TableContainer 
                      component={Paper} 
                      sx={{ 
                        mt: 2, 
                        borderRadius: '8px',
                        boxShadow: 'none',
                        border: '1px solid rgba(0, 0, 0, 0.08)'
                      }}
                    >
                      <Table sx={{ minWidth: 650 }}>
                        <TableHead sx={{ bgcolor: 'rgba(0, 0, 0, 0.03)' }}>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Nome</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Ruolo</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Data Registrazione</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Scadenza</TableCell>
                            <TableCell sx={{ fontWeight: 600 }} align="right">Azioni</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {users.map((user) => (
                            <TableRow 
                              key={user.id} 
                              sx={{ 
                                '&:last-child td, &:last-child th': { border: 0 },
                                transition: 'background-color 0.2s ease',
                                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.02)' },
                                // Colorazione basata sullo stato dell'account
                                ...(user.expiresAt ? 
                                  (
                                    getAccountStatus(new Date(user.expiresAt)) === 'expired' ? 
                                      { className: 'admin-expired-row' } :  // Rosso per account scaduti
                                    getAccountStatus(new Date(user.expiresAt)) === 'expiring-soon' ?
                                      { className: 'admin-expiring-row' } :  // Arancione per account in scadenza
                                      {}
                                  ) : {})
                              }}
                            >
                              <TableCell 
                                component="th" 
                                scope="row" 
                                sx={{ maxWidth: '300px' }}
                              >
                                <Tooltip title={user.name}>
                                  <Typography 
                                    className="text-truncate" 
                                    sx={{ maxWidth: '300px', display: 'inline-block' }}
                                  >
                                    {user.name}
                                  </Typography>
                                </Tooltip>
                              </TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>
                                <Chip 
                                  label={user.role} 
                                  color={user.role === 'ADMIN' ? 'primary' : 'default'} 
                                  size="small" 
                                />
                              </TableCell>
                              <TableCell>{formatDate(user.createdAt)}</TableCell>
                              <TableCell>
                                {user.expiresAt ? (
                                  <Tooltip title={`Scade il ${formatDate(user.expiresAt)}`}>
                                    <Chip 
                                      label={formatDate(user.expiresAt)} 
                                      color={
                                        getAccountStatus(new Date(user.expiresAt)) === 'expired' ?
                                          'error' :
                                        getAccountStatus(new Date(user.expiresAt)) === 'expiring-soon' ?
                                          'warning' :
                                          'default'
                                      }
                                      size="small" 
                                    />
                                  </Tooltip>
                                ) : (
                                  <Chip label="Nessuna scadenza" size="small" />
                                )}
                              </TableCell>
                              <TableCell align="right">
                                <Tooltip title="Modifica">
                                  <IconButton 
                                    color="primary" 
                                    size="small" 
                                    onClick={() => openUserForm(user)}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Elimina">
                                  <IconButton 
                                    color="error" 
                                    size="small" 
                                    onClick={() => openDeleteConfirmation(user.id, 'user')}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    
                    {/* Paginazione utenti */}
                    {userTotalPages > 1 && (
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          justifyContent: 'center', 
                          mt: 3,
                          pt: 2,
                          borderTop: '1px solid rgba(0, 0, 0, 0.08)'
                        }}
                      >
                        <Stack spacing={2}>
                          <Pagination 
                            count={userTotalPages} 
                            page={userCurrentPage} 
                            onChange={handleUserPageChange} 
                            color="primary"
                            size="medium"
                            siblingCount={1}
                            showFirstButton
                            showLastButton
                          />
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            align="center"
                          >
                            Mostrando {((userCurrentPage - 1) * 10) + 1}-{Math.min(userCurrentPage * 10, totalUsers)} di {totalUsers} utenti
                          </Typography>
                        </Stack>
                      </Box>
                    )}
                  </>
                )}
              </TabPanel>

              {/* Gestione Documenti */}
              <TabPanel value={tabValue} index={1}>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Documenti ({totalDocuments})
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      startIcon={<CloudUploadIcon />}
                      variant="outlined"
                      color="primary"
                      onClick={() => setOpenBulkUploadDialog(true)}
                      size="medium"
                      sx={{ 
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 500,
                      }}
                    >
                      Carica multipli
                    </Button>
                    <Button
                      startIcon={<AddIcon />}
                      variant="contained"
                      color="primary"
                      onClick={() => openDocumentForm()}
                      size="medium"
                      sx={{ 
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 500,
                      }}
                    >
                      Aggiungi PDF
                    </Button>
                    <IconButton 
                      color="primary" 
                      onClick={handleRefresh}
                    >
                      <RefreshIcon />
                    </IconButton>
                  </Box>
                </Box>

                {/* Pulsante per eliminazione multipla */}
                {selectedDocuments.length > 0 && (
                  <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', bgcolor: 'rgba(0, 0, 0, 0.03)', p: 1.5, borderRadius: '8px' }}>
                    <Typography variant="body2" sx={{ mr: 2 }}>
                      {selectedDocuments.length} documenti selezionati
                    </Typography>
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={handleMultiDeleteConfirmation}
                      size="small"
                      sx={{ 
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 500,
                      }}
                    >
                      Elimina selezionati
                    </Button>
                    <Button
                      variant="text"
                      onClick={() => setSelectedDocuments([])}
                      size="small"
                      sx={{ ml: 1, textTransform: 'none' }}
                    >
                      Annulla selezione
                    </Button>
                  </Box>
                )}

                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress color="primary" />
                  </Box>
                ) : error ? (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                  </Alert>
                ) : documents.length === 0 ? (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Non ci sono documenti disponibili.
                  </Alert>
                ) : (
                  <>
                    <TableContainer 
                      component={Paper} 
                      sx={{ 
                        mt: 2, 
                        borderRadius: '8px',
                        boxShadow: 'none',
                        border: '1px solid rgba(0, 0, 0, 0.08)'
                      }}
                    >
                      <Table sx={{ minWidth: 650 }}>
                        <TableHead sx={{ bgcolor: 'rgba(0, 0, 0, 0.03)' }}>
                          <TableRow>
                            <TableCell padding="checkbox">
                              <Checkbox
                                indeterminate={selectedDocuments.length > 0 && selectedDocuments.length < documents.length}
                                checked={documents.length > 0 && selectedDocuments.length === documents.length}
                                onChange={handleSelectAllDocuments}
                                color="primary"
                              />
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Titolo</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Data</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Dimensione</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Visualizzazioni</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Download</TableCell>
                            <TableCell sx={{ fontWeight: 600 }} align="right">Azioni</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {documents.map((doc) => (
                            <TableRow 
                              key={doc.id} 
                              sx={{ 
                                '&:last-child td, &:last-child th': { border: 0 },
                                transition: 'background-color 0.2s ease',
                                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.02)' },
                                bgcolor: selectedDocuments.includes(doc.id) ? 'rgba(25, 118, 210, 0.08)' : 'transparent'
                              }}
                            >
                              <TableCell padding="checkbox">
                                <Checkbox
                                  checked={selectedDocuments.includes(doc.id)}
                                  onChange={() => handleSelectDocument(doc.id)}
                                  color="primary"
                                />
                              </TableCell>
                              <TableCell 
                                component="th" 
                                scope="row" 
                                sx={{ maxWidth: '300px' }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <PictureAsPdfIcon fontSize="small" color="error" sx={{ mr: 1, opacity: 0.7 }} />
                                  <Tooltip title={doc.title}>
                                    <Typography 
                                      className="text-truncate" 
                                      sx={{ maxWidth: '250px', display: 'inline-block' }}
                                    >
                                      {doc.title}
                                    </Typography>
                                  </Tooltip>
                                </Box>
                              </TableCell>
                              <TableCell>{formatDate(doc.uploadDate)}</TableCell>
                              <TableCell>{formatFileSize(doc.fileSize)}</TableCell>
                              <TableCell>{doc.viewCount}</TableCell>
                              <TableCell>{doc.downloadCount}</TableCell>
                              <TableCell align="right">
                                <Tooltip title="Modifica">
                                  <IconButton 
                                    color="primary" 
                                    size="small" 
                                    onClick={() => openDocumentForm(doc)}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Elimina">
                                  <IconButton 
                                    color="error" 
                                    size="small" 
                                    onClick={() => openDeleteConfirmation(doc.id, 'document')}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    
                    {/* Paginazione documenti */}
                    {totalPages > 1 && (
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          justifyContent: 'center', 
                          mt: 3,
                          pt: 2,
                          borderTop: '1px solid rgba(0, 0, 0, 0.08)'
                        }}
                      >
                        <Stack spacing={2}>
                          <Pagination 
                            count={totalPages} 
                            page={currentPage} 
                            onChange={handlePageChange} 
                            color="primary"
                            size="medium"
                            siblingCount={1}
                            showFirstButton
                            showLastButton
                          />
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            align="center"
                          >
                            Mostrando {((currentPage - 1) * 10) + 1}-{Math.min(currentPage * 10, totalDocuments)} di {totalDocuments} documenti
                          </Typography>
                        </Stack>
                      </Box>
                    )}
                  </>
                )}
              </TabPanel>
            </Box>
          </Paper>

          {/* Mostra la versione */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="caption">
              versione: 0.0.7
            </Typography>
          </Box>

          {/* Dialog per utenti */}
          <Dialog open={openUserDialog} onClose={() => setOpenUserDialog(false)} maxWidth="sm" fullWidth>
            <DialogTitle>
              {editingUser?.id ? 'Modifica Utente' : 'Nuovo Utente'}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nome"
                    name="name"
                    value={editingUser?.name || ''}
                    onChange={handleUserFormChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={editingUser?.email || ''}
                    onChange={handleUserFormChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Ruolo</InputLabel>
                    <Select
                      name="role"
                      value={editingUser?.role || 'USER'}
                      onChange={handleUserFormChange}
                      label="Ruolo"
                    >
                      <MenuItem value="USER">Utente</MenuItem>
                      <MenuItem value="ADMIN">Amministratore</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Durata Account</InputLabel>
                    <Select
                      name="expiresInDays"
                      value={editingUser?.expiresInDays || ''}
                      onChange={handleUserFormChange}
                      label="Durata Account"
                    >
                      <MenuItem value="">Nessuna scadenza</MenuItem>
                      <MenuItem value="1">24 ore</MenuItem>
                      <MenuItem value="3">3 giorni (Prova)</MenuItem>
                      <MenuItem value="30">30 giorni</MenuItem>
                      <MenuItem value="360">360 giorni</MenuItem>
                    </Select>
                    <FormHelperText>
                      {editingUser?.id ? 'La modifica aggiornerà la scadenza a partire da oggi' : 
                      'Seleziona la durata del nuovo account'}
                    </FormHelperText>
                  </FormControl>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenUserDialog(false)}>Annulla</Button>
              <Button 
                onClick={handleUserSubmit} 
                variant="contained"
                disabled={loading}
              >
                {loading ? 'Salvataggio...' : 'Salva'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Dialog per documenti - migliorato */}
          <Dialog open={openDocumentDialog} onClose={() => setOpenDocumentDialog(false)} maxWidth="sm" fullWidth>
            <DialogTitle>
              {editingDocument?.id ? 'Modifica Documento' : 'Carica Nuovo Documento'}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Titolo"
                    name="title"
                    value={editingDocument?.title || ''}
                    onChange={handleDocumentFormChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Descrizione"
                    name="description"
                    value={editingDocument?.description || ''}
                    onChange={handleDocumentFormChange}
                    multiline
                    rows={3}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Parole chiave (separate da virgola)"
                    name="keywordsInput"
                    value={(editingDocument?.keywords || []).join(', ')}
                    onChange={handleKeywordsChange}
                    helperText="Es.: diritto civile, contratto, locazione"
                  />
                </Grid>
                {!editingDocument?.id && (
                  <Grid item xs={12}>
                    <Box 
                      sx={{ 
                        border: '2px dashed rgba(0, 0, 0, 0.12)',
                        borderRadius: '8px',
                        p: 3,
                        textAlign: 'center',
                        backgroundColor: 'rgba(0,0,0,0.01)',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer',
                        '&:hover': {
                          borderColor: 'primary.main',
                          backgroundColor: 'rgba(0,0,0,0.02)',
                        }
                      }}
                      component="label"
                    >
                      {!documentFile ? (
                        <>
                          <Box sx={{ mb: 2 }}>
                            <FileUploadIcon color="primary" sx={{ fontSize: 40, opacity: 0.7 }} />
                          </Box>
                          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                            Trascina qui il tuo PDF o clicca per selezionarlo
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Formati supportati: PDF (max 20MB)
                          </Typography>
                        </>
                      ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <Box sx={{ 
                            bgcolor: 'primary.light', 
                            color: 'primary.contrastText', 
                            p: 1.5, 
                            borderRadius: '6px',
                            mb: 1,
                            width: '100%',
                            maxWidth: '400px'
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <PictureAsPdfIcon />
                              <Box sx={{ overflow: 'hidden', textAlign: 'left', flex: 1 }}>
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    fontWeight: 600,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                  }}
                                >
                                  {documentFile.name}
                                </Typography>
                                <Typography variant="caption" display="block">
                                  {(documentFile.size / 1024 / 1024).toFixed(2)} MB
                                </Typography>
                              </Box>
                              <IconButton 
                                size="small" 
                                onClick={(e) => {
                                  e.preventDefault();
                                  setDocumentFile(null);
                                }}
                              >
                                <CloseIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>
                          <Typography variant="body2" color="primary">
                            Clicca per cambiare file
                          </Typography>
                        </Box>
                      )}
                      <input
                        type="file"
                        accept=".pdf"
                        hidden
                        onChange={handleFileChange}
                      />
                    </Box>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDocumentDialog(false)}>Annulla</Button>
              <Button 
                onClick={handleDocumentSubmit} 
                variant="contained"
                disabled={loading}
              >
                {loading ? 'Salvataggio...' : 'Salva'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Dialog di conferma eliminazione */}
          <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
            <DialogTitle>Conferma eliminazione</DialogTitle>
            <DialogContent>
              <DialogContentText>
                {deleteItemType === 'user' 
                  ? 'Sei sicuro di voler eliminare questo utente? L\'operazione non può essere annullata.' 
                  : 'Sei sicuro di voler eliminare questo documento? L\'operazione non può essere annullata.'}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDeleteDialog(false)}>Annulla</Button>
              <Button 
                onClick={handleDelete} 
                color="error"
                disabled={loading}
              >
                {loading ? 'Eliminazione...' : 'Elimina'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Dialog di conferma eliminazione multipla */}
          <Dialog open={openMultiDeleteDialog} onClose={() => setOpenMultiDeleteDialog(false)}>
            <DialogTitle>Conferma eliminazione multipla</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Sei sicuro di voler eliminare {selectedDocuments.length} documenti selezionati? 
                L'operazione non può essere annullata.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenMultiDeleteDialog(false)}>Annulla</Button>
              <Button 
                onClick={handleMultiDelete} 
                color="error"
                disabled={loading}
              >
                {loading ? 'Eliminazione...' : 'Elimina tutti'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Dialog per caricamento multiplo - semplificato */}
          <Dialog open={openBulkUploadDialog} onClose={() => !isUploading && setOpenBulkUploadDialog(false)} maxWidth="md" fullWidth>
            <DialogTitle>
              Caricamento Multiplo Documenti
            </DialogTitle>
            <DialogContent>
              <Box sx={{ my: 2 }}>
                <Typography variant="body1" gutterBottom sx={{ mb: 3 }}>
                  Seleziona più file PDF da caricare contemporaneamente. I documenti duplicati saranno identificati e non verranno caricati nuovamente.
                </Typography>
                
                {!isUploading && (
                  <Box 
                    sx={{ 
                      border: '2px dashed rgba(0, 0, 0, 0.12)',
                      borderRadius: '8px',
                      p: 3,
                      textAlign: 'center',
                      backgroundColor: 'rgba(0,0,0,0.01)',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                      mb: 3,
                      '&:hover': {
                        borderColor: 'primary.main',
                        backgroundColor: 'rgba(0,0,0,0.02)',
                      }
                    }}
                    component="label"
                  >
                    <Box sx={{ mb: 2 }}>
                      <CloudUploadIcon 
                        sx={{ 
                          fontSize: 50, 
                          color: 'primary.main',
                          opacity: 0.7 
                        }} 
                      />
                    </Box>
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                      Trascina qui i tuoi PDF o clicca per selezionarli
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Formati supportati: PDF (max 20MB per file)
                    </Typography>
                    <input
                      type="file"
                      accept=".pdf"
                      hidden
                      multiple
                      onChange={handleBulkFileChange}
                    />
                  </Box>
                )}
                
                {bulkFiles.length > 0 && !isUploading && (
                  <Paper 
                    elevation={1} 
                    sx={{ 
                      mt: 2, 
                      border: '1px solid rgba(0, 0, 0, 0.08)', 
                      borderRadius: '8px', 
                      p: 2, 
                      maxHeight: '300px', 
                      overflowY: 'auto',
                    }}
                  >
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      mb: 2
                    }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {bulkFiles.length} {bulkFiles.length === 1 ? 'file selezionato' : 'file selezionati'}
                      </Typography>
                      <Button 
                        size="small" 
                        onClick={() => setBulkFiles([])}
                        startIcon={<CloseIcon />}
                        variant="outlined"
                        color="error"
                      >
                        Rimuovi tutti
                      </Button>
                    </Box>
                    
                    <Alert severity="info" sx={{ mb: 2 }}>
                      I file con lo stesso nome di documenti già presenti nel sistema saranno saltati automaticamente.
                    </Alert>
                    
                    <List dense>
                      {bulkFiles.slice(0, 10).map((file, index) => (
                        <ListItem key={index} sx={{ borderRadius: '4px', mb: 0.5 }}>
                          <ListItemIcon>
                            <PictureAsPdfIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={file.name}
                            secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                            primaryTypographyProps={{ sx: { fontWeight: 500 } }}
                          />
                          <IconButton 
                            size="small" 
                            onClick={() => {
                              const newBulkFiles = [...bulkFiles];
                              newBulkFiles.splice(index, 1);
                              setBulkFiles(newBulkFiles);
                            }}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </ListItem>
                      ))}
                      {bulkFiles.length > 10 && (
                        <ListItem>
                          <ListItemText 
                            primary={`+ altri ${bulkFiles.length - 10} file...`}
                            primaryTypographyProps={{ sx: { fontStyle: 'italic', color: 'text.secondary' } }}
                          />
                        </ListItem>
                      )}
                    </List>
                  </Paper>
                )}
                
                {isUploading && (
                  <Box sx={{ mt: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Caricamento in corso ({currentFileIndex + 1}/{bulkFiles.length})
                      </Typography>
                      <Typography variant="body2" sx={{ ml: 'auto', fontWeight: 600 }}>
                        {uploadProgress}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={uploadProgress} 
                      sx={{ 
                        mb: 3,
                        height: 8,
                        borderRadius: 4,
                      }} 
                    />
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Paper 
                          sx={{ 
                            p: 2, 
                            textAlign: 'center', 
                            bgcolor: 'success.main',
                            color: 'white',
                            borderRadius: '8px'
                          }}
                          elevation={1}
                        >
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {uploadSuccess.length}
                          </Typography>
                          <Typography variant="body2">
                            Completati
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6}>
                        <Paper 
                          sx={{ 
                            p: 2, 
                            textAlign: 'center', 
                            bgcolor: 'error.main',
                            color: 'white',
                            borderRadius: '8px'
                          }}
                          elevation={1}
                        >
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {uploadFailed.length}
                          </Typography>
                          <Typography variant="body2">
                            Falliti
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={() => setOpenBulkUploadDialog(false)} 
                disabled={isUploading}
              >
                {isUploading ? 'Caricamento in corso...' : 'Annulla'}
              </Button>
              <Button 
                onClick={handleBulkUpload} 
                variant="contained"
                disabled={bulkFiles.length === 0 || isUploading}
                startIcon={<CloudUploadIcon />}
                color="primary"
              >
                {isUploading ? 'Caricamento in corso...' : `Carica ${bulkFiles.length} file`}
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Container>
  );
};

export default AdminPage; 