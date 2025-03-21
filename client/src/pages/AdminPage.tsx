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
} from '@mui/icons-material';
import axios from 'axios';
import AuthContext from '../contexts/AuthContext';

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

const AdminPage: React.FC = () => {
  const { token, isAdmin } = useContext(AuthContext);
  const [tabValue, setTabValue] = useState<number>(0);
  const [users, setUsers] = useState<User[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

  useEffect(() => {
    // Se non è admin, non dovrebbe essere qui
    if (!isAdmin()) {
      return;
    }
    
    // Carica i dati per la tab corrente
    loadTabData(tabValue);
  }, [token, isAdmin, tabValue]);

  const loadTabData = async (tab: number) => {
    setLoading(true);
    setError(null);
    
    try {
      if (tab === 0) {
        // Carica utenti
        const response = await axios.get('http://localhost:8000/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(response.data.users || []);
      } else if (tab === 1) {
        // Carica documenti
        const response = await axios.get('http://localhost:8000/api/documents/admin/all', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDocuments(response.data.documents || []);
      }
    } catch (err: any) {
      console.error('Errore nel caricamento dei dati:', err);
      setError(err.response?.data?.message || 'Errore nel caricamento dei dati.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
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
          `http://localhost:8000/api/admin/users/${editingUser.id}`,
          editingUser,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess('Utente aggiornato con successo!');
      } else {
        // Crea utente
        await axios.post(
          'http://localhost:8000/api/admin/users',
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
          `http://localhost:8000/api/documents/${editingDocument.id}`,
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
        
        const formData = new FormData();
        formData.append('file', documentFile);
        formData.append('title', editingDocument?.title || '');
        formData.append('description', editingDocument?.description || '');
        if (editingDocument?.keywords && editingDocument.keywords.length > 0) {
          formData.append('keywords', JSON.stringify(editingDocument.keywords));
        }
        
        await axios.post(
          'http://localhost:8000/api/documents',
          formData,
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            } 
          }
        );
        setSuccess('Documento caricato con successo!');
      }
      setOpenDocumentDialog(false);
      loadTabData(1);
    } catch (err: any) {
      console.error('Errore nella gestione del documento:', err);
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
        await axios.delete(`http://localhost:8000/api/admin/users/${deleteItemId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Utente eliminato con successo!');
        loadTabData(0);
      } else if (deleteItemType === 'document') {
        await axios.delete(`http://localhost:8000/api/documents/${deleteItemId}`, {
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
        'http://localhost:8000/api/documents/bulk-upload',
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

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography
        variant="h4"
        component="h1"
        sx={{
          mb: 4,
          fontFamily: 'Cormorant Garamond, serif',
          color: '#1B2A4A',
          fontWeight: 600,
        }}
      >
        Pannello di Amministrazione
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, display: 'flex', alignItems: 'center' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="admin tabs">
            <Tab label="Gestione Utenti" id="tab-0" aria-controls="tabpanel-0" />
            <Tab label="Gestione Documenti" id="tab-1" aria-controls="tabpanel-1" />
          </Tabs>
          <Box sx={{ ml: 'auto' }}>
            <Tooltip title="Aggiorna">
              <IconButton onClick={handleRefresh} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            {tabValue === 0 && (
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={() => openUserForm()}
                sx={{ ml: 1 }}
              >
                Nuovo Utente
              </Button>
            )}
            {tabValue === 1 && (
              <>
                <Button 
                  variant="contained" 
                  startIcon={<FileUploadIcon />}
                  onClick={() => openDocumentForm()}
                  sx={{ ml: 1 }}
                >
                  Carica Documento
                </Button>
                <Button 
                  variant="contained" 
                  color="secondary"
                  startIcon={<CloudUploadIcon />}
                  onClick={openBulkUploadForm}
                  sx={{ ml: 1 }}
                >
                  Caricamento Multiplo
                </Button>
              </>
            )}
          </Box>
        </Box>

        {/* Tab Gestione Utenti */}
        <TabPanel value={tabValue} index={0}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : users.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                Nessun utente trovato.
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell>Nome</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Ruolo</TableCell>
                    <TableCell>Data Registrazione</TableCell>
                    <TableCell align="right">Azioni</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip 
                          label={user.role} 
                          color={user.role === 'ADMIN' ? 'primary' : 'default'} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Modifica">
                          <IconButton onClick={() => openUserForm(user)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Elimina">
                          <IconButton 
                            onClick={() => openDeleteConfirmation(user.id, 'user')}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        {/* Tab Gestione Documenti */}
        <TabPanel value={tabValue} index={1}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : documents.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                Nessun documento trovato.
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell>Titolo</TableCell>
                    <TableCell>Data Caricamento</TableCell>
                    <TableCell>Visualizzazioni</TableCell>
                    <TableCell>Download</TableCell>
                    <TableCell>Preferiti</TableCell>
                    <TableCell align="right">Azioni</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>{doc.title}</TableCell>
                      <TableCell>{formatDate(doc.uploadDate)}</TableCell>
                      <TableCell>{doc.viewCount}</TableCell>
                      <TableCell>{doc.downloadCount}</TableCell>
                      <TableCell>{doc.favoriteCount}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Modifica">
                          <IconButton onClick={() => openDocumentForm(doc)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Elimina">
                          <IconButton 
                            onClick={() => openDeleteConfirmation(doc.id, 'document')}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>
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

      {/* Dialog per documenti */}
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
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  startIcon={<FileUploadIcon />}
                  sx={{ py: 1.5 }}
                >
                  {documentFile ? documentFile.name : 'Seleziona file PDF'}
                  <input
                    type="file"
                    accept=".pdf"
                    hidden
                    onChange={handleFileChange}
                  />
                </Button>
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

      {/* Dialog per caricamento multiplo */}
      <Dialog open={openBulkUploadDialog} onClose={() => !isUploading && setOpenBulkUploadDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Caricamento Multiplo Documenti
        </DialogTitle>
        <DialogContent>
          <Box sx={{ my: 2 }}>
            <Typography variant="body1" gutterBottom>
              Seleziona fino a 800 file PDF da caricare. Il titolo di ogni documento verrà estratto dal nome del file.
            </Typography>
            
            {!isUploading && (
              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<CloudUploadIcon />}
                sx={{ py: 1.5, my: 2 }}
              >
                Seleziona file PDF multipli
                <input
                  type="file"
                  accept=".pdf"
                  hidden
                  multiple
                  onChange={handleBulkFileChange}
                />
              </Button>
            )}
            
            {bulkFiles.length > 0 && !isUploading && (
              <Box sx={{ mt: 2, border: '1px solid #eee', borderRadius: 1, p: 2, maxHeight: '300px', overflowY: 'auto' }}>
                <Typography variant="subtitle2" gutterBottom>
                  {bulkFiles.length} file selezionati
                </Typography>
                <List dense>
                  {bulkFiles.slice(0, 10).map((file, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <FileIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary={file.name}
                        secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                      />
                    </ListItem>
                  ))}
                  {bulkFiles.length > 10 && (
                    <ListItem>
                      <ListItemText 
                        primary={`+ altri ${bulkFiles.length - 10} file...`}
                      />
                    </ListItem>
                  )}
                </List>
              </Box>
            )}
            
            {isUploading && (
              <Box sx={{ mt: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2">
                    Caricamento in corso ({currentFileIndex + 1}/{bulkFiles.length})
                  </Typography>
                  <Typography variant="body2" sx={{ ml: 'auto' }}>
                    {uploadProgress}%
                  </Typography>
                </Box>
                <LinearProgress variant="determinate" value={uploadProgress} sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e9' }}>
                      <Typography variant="h6" color="success.main">
                        {uploadSuccess.length}
                      </Typography>
                      <Typography variant="body2">
                        Completati
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#ffebee' }}>
                      <Typography variant="h6" color="error.main">
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
          >
            {isUploading ? 'Caricamento in corso...' : `Carica ${bulkFiles.length} file`}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminPage; 