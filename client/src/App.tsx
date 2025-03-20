import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { createTheme, ThemeProvider, CssBaseline, GlobalStyles, Box } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Pagine
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ViewerPage from './pages/ViewerPage';
import AdminPage from './pages/AdminPage';
import UserDashboard from './pages/UserDashboard';
import FavoritesPage from './pages/FavoritesPage';
import ProfilePage from './pages/ProfilePage';
import SupportPage from './pages/SupportPage';
import FAQPage from './pages/FAQPage';
import ContactPage from './pages/ContactPage';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Tema personalizzato
const theme = createTheme({
  palette: {
    primary: {
      main: '#1B2A4A',
    },
    secondary: {
      main: '#A67C52',
    },
    background: {
      default: '#F5F6F8',
    },
  },
  typography: {
    fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontFamily: 'Cormorant Garamond, serif',
    },
    h2: {
      fontFamily: 'Cormorant Garamond, serif',
    },
    h3: {
      fontFamily: 'Cormorant Garamond, serif',
    },
    h4: {
      fontFamily: 'Cormorant Garamond, serif',
    },
    h5: {
      fontFamily: 'Cormorant Garamond, serif',
    },
    h6: {
      fontFamily: 'Cormorant Garamond, serif',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
});

const globalStyles = (
  <GlobalStyles
    styles={{
      '@import': "url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Cormorant+Garamond:wght@300;400;500;600;700&display=swap')",
      body: {
        margin: 0,
        padding: 0,
        fontFamily: 'Roboto, sans-serif',
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
      <AuthProvider>
        <Router>
          <Navbar onMenuClick={toggleSidebar} />
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <Box sx={{ pt: '64px' }}>
            <Routes>
              {/* Pagine pubbliche */}
              <Route path="/public" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/" element={<Navigate to="/login" replace />} />
              
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
              
              {/* Pagina FAQ (solo utenti autenticati) */}
              <Route
                path="/faq"
                element={
                  <ProtectedRoute>
                    <FAQPage />
                  </ProtectedRoute>
                }
              />
              
              {/* Pagina contatti (solo utenti autenticati) */}
              <Route
                path="/contact"
                element={
                  <ProtectedRoute>
                    <ContactPage />
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
                  <AdminRoute>
                    <AdminPage />
                  </AdminRoute>
                }
              />
              
              {/* Reindirizzamenti */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Box>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
