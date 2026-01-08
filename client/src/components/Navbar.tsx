import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Container,
  Avatar,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  AccountCircle,
  Menu as MenuIcon,
  Logout as LogoutIcon,
  AdminPanelSettings as AdminIcon,
  Favorite as FavoriteIcon,
  Close as CloseIcon,
  Login as LoginIcon,
} from '@mui/icons-material';
import AuthContext from '../contexts/AuthContext';

interface NavbarProps {
  onMenuClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { user, isAuthenticated, isAdmin, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleClose();
    setMobileDrawerOpen(false);
    await logout();
    navigate('/login');
  };

  const handleMobileDrawerToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  // Menu items per mobile drawer
  const mobileMenuItems = [
    ...(isAuthenticated() ? [
      { text: 'Preferiti', icon: <FavoriteIcon />, path: '/favorites' },
    ] : []),
    ...(isAdmin() ? [
      { text: 'Admin', icon: <AdminIcon />, path: '/admin' },
    ] : []),
  ];

  return (
    <>
      <AppBar 
        position="fixed" 
        elevation={1}
        sx={{ 
          backgroundColor: 'var(--primary-color)',
          borderRadius: 0,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Container maxWidth={false}>
          <Toolbar 
            sx={{ 
              justifyContent: 'space-between',
              minHeight: { xs: 56, sm: 64 },
              px: { xs: 1, sm: 2 },
            }}
          >
            {/* Sinistra: Hamburger (per sidebar) + Logo */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {/* Hamburger per aprire Sidebar - solo se autenticato */}
              {isAuthenticated() && (
                <IconButton
                  color="inherit"
                  aria-label="apri menu laterale"
                  edge="start"
                  onClick={onMenuClick}
                  sx={{ 
                    mr: { xs: 1, sm: 2 },
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  <MenuIcon />
                </IconButton>
              )}
              
              {/* Logo */}
              <Box
                component={Link}
                to={isAuthenticated() ? "/dashboard" : "/login"}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  textDecoration: 'none',
                }}
              >
                <Box
                  component="img"
                  src="/itfpluslogo.png" 
                  alt="ITFPLUS" 
                  sx={{ 
                    height: { xs: 32, sm: 40 },
                    width: 'auto',
                  }}
                />
              </Box>
            </Box>

            {/* Destra: Menu desktop o hamburger mobile */}
            {!isMobile ? (
              // DESKTOP: mostra bottoni
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {isAuthenticated() && (
                  <Button
                    component={Link}
                    to="/favorites"
                    color="inherit"
                    startIcon={<FavoriteIcon />}
                    sx={{ 
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                  >
                    Preferiti
                  </Button>
                )}

                {isAdmin() && (
                  <Button
                    component={Link}
                    to="/admin"
                    color="inherit"
                    startIcon={<AdminIcon />}
                    sx={{ 
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                  >
                    Admin
                  </Button>
                )}

                {isAuthenticated() ? (
                  <Box>
                    <IconButton
                      size="large"
                      aria-label="menu account"
                      aria-controls="menu-appbar"
                      aria-haspopup="true"
                      onClick={handleMenu}
                      color="inherit"
                    >
                      <Avatar 
                        sx={{ 
                          width: 34, 
                          height: 34, 
                          backgroundColor: 'var(--secondary-color)', 
                          color: 'white',
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          borderRadius: '4px',
                        }}
                      >
                        {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                      </Avatar>
                    </IconButton>
                    <Menu
                      id="menu-appbar"
                      anchorEl={anchorEl}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                      }}
                      keepMounted
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                      }}
                      open={Boolean(anchorEl)}
                      onClose={handleClose}
                      PaperProps={{
                        sx: {
                          mt: 1,
                          minWidth: 180,
                          borderRadius: '4px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                          border: '1px solid var(--border-light)',
                        }
                      }}
                    >
                      <MenuItem 
                        onClick={handleLogout}
                        sx={{ 
                          py: 1.5,
                          '&:hover': {
                            backgroundColor: 'rgba(244, 63, 94, 0.1)',
                          },
                        }}
                      >
                        <LogoutIcon fontSize="small" sx={{ mr: 1.5, color: 'var(--error-color)' }} />
                        Logout
                      </MenuItem>
                    </Menu>
                  </Box>
                ) : (
                  <Button
                    component={Link}
                    to="/login"
                    color="inherit"
                    variant="outlined"
                    sx={{ 
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                      '&:hover': {
                        borderColor: 'white',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                  >
                    Accedi
                  </Button>
                )}
              </Box>
            ) : (
              // MOBILE: mostra hamburger per drawer
              <IconButton
                color="inherit"
                aria-label="apri menu"
                onClick={handleMobileDrawerToggle}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                {mobileDrawerOpen ? <CloseIcon /> : <AccountCircle />}
              </IconButton>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            pt: '64px',
            backgroundColor: 'var(--card-background)',
            borderRadius: 0,
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          {isAuthenticated() && user && (
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2, 
                  mb: 2,
                  p: 2,
                  borderRadius: '4px',
                  backgroundColor: 'rgba(27, 42, 74, 0.04)',
                  border: '1px solid var(--border-light)',
                }}
              >
                <Avatar 
                  sx={{ 
                    width: 44, 
                    height: 44, 
                    backgroundColor: 'var(--primary-color)', 
                    color: 'white',
                    fontWeight: 600,
                    borderRadius: '4px',
                  }}
                >
                {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
              </Avatar>
              <Box>
                <Box sx={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {user.name || 'Utente'}
                </Box>
                <Box sx={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {user.email}
                </Box>
              </Box>
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          <List disablePadding>
            {mobileMenuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  onClick={() => setMobileDrawerOpen(false)}
                  sx={{
                    borderRadius: '4px',
                    mb: 0.5,
                    '&:hover': {
                      backgroundColor: 'rgba(27, 42, 74, 0.06)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: 'var(--primary-color)' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text}
                    primaryTypographyProps={{ fontWeight: 500 }}
                  />
                </ListItemButton>
              </ListItem>
            ))}

            <Divider sx={{ my: 2 }} />

            {isAuthenticated() ? (
              <ListItem disablePadding>
                <ListItemButton
                  onClick={handleLogout}
                  sx={{
                    borderRadius: '4px',
                    color: 'var(--error-color)',
                    '&:hover': {
                      backgroundColor: 'rgba(244, 63, 94, 0.08)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: 'var(--error-color)' }}>
                    <LogoutIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Logout"
                    primaryTypographyProps={{ fontWeight: 500 }}
                  />
                </ListItemButton>
              </ListItem>
            ) : (
              <ListItem disablePadding>
                <ListItemButton
                  component={Link}
                  to="/login"
                  onClick={() => setMobileDrawerOpen(false)}
                  sx={{
                    borderRadius: '4px',
                    backgroundColor: 'var(--primary-color)',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'var(--primary-light)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: 'white' }}>
                    <LoginIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Accedi"
                    primaryTypographyProps={{ fontWeight: 600 }}
                  />
                </ListItemButton>
              </ListItem>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;
