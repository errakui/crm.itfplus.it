import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { createTheme, ThemeProvider, CssBaseline, GlobalStyles, Box } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Pagine
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ViewerPage from './pages/ViewerPage';
import AdminPage from './pages/AdminPage';
import UserDashboard from './pages/UserDashboard';
import FavoritesPage from './pages/FavoritesPage';
import ProfilePage from './pages/ProfilePage';
import SupportPage from './pages/SupportPage';
import FAQPage from './pages/FAQPage';
import ContactPage from './pages/ContactPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import ChangelogPage from './pages/ChangelogPage';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import RegisterPage from './pages/RegisterPage';
import TermsPage from './pages/TermsPage';

// Tema ITFPLUS - Professionale Giuridico
const theme = createTheme({
  palette: {
    primary: {
      main: '#1B2A4A',
      light: '#2c4270',
      dark: '#0d1a2e',
    },
    secondary: {
      main: '#A67C52',
      light: '#c9a77d',
    },
    background: {
      default: '#F9FAFC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0F172A',
      secondary: '#475569',
    },
  },
  typography: {
    fontFamily: '"Source Sans Pro", -apple-system, BlinkMacSystemFont, sans-serif',
    h1: { fontFamily: '"Libre Baskerville", Georgia, serif', fontWeight: 700 },
    h2: { fontFamily: '"Libre Baskerville", Georgia, serif', fontWeight: 700 },
    h3: { fontFamily: '"Libre Baskerville", Georgia, serif', fontWeight: 700 },
    h4: { fontFamily: '"Libre Baskerville", Georgia, serif', fontWeight: 700 },
    h5: { fontFamily: '"Libre Baskerville", Georgia, serif', fontWeight: 700 },
    h6: { fontFamily: '"Libre Baskerville", Georgia, serif', fontWeight: 700 },
    body1: { fontFamily: '"Source Sans Pro", sans-serif' },
    body2: { fontFamily: '"Source Sans Pro", sans-serif' },
    button: { fontFamily: '"Source Sans Pro", sans-serif', fontWeight: 600 },
  },
  shape: {
    borderRadius: 4, // Bordi professionali
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 4,
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 4,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 4,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 4,
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          borderRadius: 0, // Navbar completamente squadrata
        },
      },
    },
  },
});

// GlobalStyles minimo - i font sono già importati in index.css
const globalStyles = (
  <GlobalStyles
    styles={{
      body: {
        margin: 0,
        padding: 0,
      }
    }}
  />
);

const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {globalStyles}
      <Router>
        <AuthProvider>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            minHeight: '100vh' 
          }}>
            <Navbar onMenuClick={toggleSidebar} />
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <Box sx={{ pt: '64px', flexGrow: 1 }}>
              <Routes>
                {/* Pagine pubbliche */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/termsofservice" element={<TermsPage />} />
                <Route path="/condizioni" element={<TermsPage />} />
                <Route path="/changelog" element={<ChangelogPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/contact" element={<ContactPage />} />
                
                {/* Dashboard utente (solo utenti autenticati) */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <UserDashboard />
                    </ProtectedRoute>
                  }
                />
                
                {/* Pagina preferiti (solo utenti autenticati) */}
                <Route
                  path="/favorites"
                  element={
                    <ProtectedRoute>
                      <FavoritesPage />
                    </ProtectedRoute>
                  }
                />
                
                {/* Pagina profilo (solo utenti autenticati) */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                
                {/* Pagina supporto (solo utenti autenticati) */}
                <Route
                  path="/support"
                  element={
                    <ProtectedRoute>
                      <SupportPage />
                    </ProtectedRoute>
                  }
                />
                
                {/* Pagine protette (solo utenti autenticati) */}
                <Route
                  path="/viewer/:id"
                  element={
                    <ProtectedRoute>
                      <ViewerPage />
                    </ProtectedRoute>
                  }
                />
                
                {/* Pagine per amministratori */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminPage />
                    </ProtectedRoute>
                  }
                />
                
                {/* Reindirizzamenti */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Box>
            <Footer />
          </Box>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
};

export default App;
