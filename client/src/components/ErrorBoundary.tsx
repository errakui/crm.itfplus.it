import React, { Component, ErrorInfo } from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import { apiService } from '../services/api';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  apiStatus: 'unknown' | 'online' | 'offline';
  apiStatusMessage: string;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      apiStatus: 'unknown',
      apiStatusMessage: ''
    };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  checkApiStatus = async () => {
    try {
      this.setState({ apiStatus: 'unknown', apiStatusMessage: 'Verificando connessione al server...' });
      
      const response = await apiService.checkApiStatus();
      
      if (response.status === 200) {
        this.setState({ 
          apiStatus: 'online',
          apiStatusMessage: `Server online. Versione: ${response.data.version}, Tempo: ${response.data.time}`
        });
      } else {
        this.setState({ 
          apiStatus: 'offline',
          apiStatusMessage: `Errore: Risposta con stato ${response.status}`
        });
      }
    } catch (error: any) {
      console.error('Errore nel controllo dello stato API:', error);
      this.setState({ 
        apiStatus: 'offline',
        apiStatusMessage: `Errore di connessione: ${error.message}`
      });
    }
  };

  render() {
    const { hasError, error, errorInfo, apiStatus, apiStatusMessage } = this.state;

    if (hasError) {
      return (
        <Box 
          sx={{ 
            p: 3, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            textAlign: 'center'
          }}
        >
          <Typography variant="h4" gutterBottom color="error">
            Si è verificato un errore
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 2 }}>
            {error?.toString()}
          </Typography>

          <Box sx={{ mt: 2, mb: 4 }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => window.location.reload()}
              sx={{ mr: 2 }}
            >
              Ricarica pagina
            </Button>
            
            <Button 
              variant="outlined"
              onClick={this.checkApiStatus}
            >
              Verifica stato server
            </Button>
          </Box>

          {apiStatus !== 'unknown' && (
            <Alert 
              severity={apiStatus === 'online' ? 'success' : 'error'}
              sx={{ mt: 2, mb: 2 }}
            >
              {apiStatusMessage}
            </Alert>
          )}

          <Box sx={{ mt: 2, textAlign: 'left', maxWidth: '800px' }}>
            <details style={{ whiteSpace: 'pre-wrap' }}>
              <summary>Dettagli errore</summary>
              {errorInfo?.componentStack}
            </details>
          </Box>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 