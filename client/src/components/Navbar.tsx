import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Container,
  Avatar,
} from '@mui/material';
import {
  Search as SearchIcon,
  AccountCircle,
  Menu as MenuIcon,
  Logout as LogoutIcon,
  AdminPanelSettings as AdminIcon,
  Favorite as FavoriteIcon,
} from '@mui/icons-material';
import AuthContext from '../contexts/AuthContext';

// Definizione dell'interfaccia per le props
interface NavbarProps {
  onMenuClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { user, isAuthenticated, isAdmin, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    // Chiamiamo onMenuClick quando viene cliccato il pulsante del menu
    if (onMenuClick) {
      onMenuClick();
    }
  };

  const handleLogout = async () => {
    handleClose();
    await logout();
    navigate('/login');
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        backgroundColor: 'rgba(27, 42, 74, 0.85)', 
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)', // Per supporto Safari
        borderRadius: 0,
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        transition: 'all 0.3s ease-in-out'
      }}
    >
      <Container maxWidth={false}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Logo e titolo */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={onMenuClick}
              sx={{ mr: 2, display: { xs: 'flex', md: 'flex' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h5"
              component={Link}
              to={isAuthenticated() ? "/dashboard" : "/login"}
              sx={{
                fontFamily: 'Cormorant Garamond, serif',
                fontWeight: 'bold',
                color: 'white',
                textDecoration: 'none',
                mr: 2,
              }}
            >
              ITFPLUS
            </Typography>
          </Box>

          {/* Menu desktop */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
            {isAuthenticated() && (
              <Button
                component={Link}
                to="/favorites"
                color="inherit"
                startIcon={<FavoriteIcon />}
                sx={{ mx: 1 }}
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
                sx={{ mx: 1 }}
              >
                Admin
              </Button>
            )}

            {isAuthenticated() ? (
              <Box>
                <IconButton
                  size="large"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenu}
                  color="inherit"
                >
                  <Avatar sx={{ width: 32, height: 32, backgroundColor: '#E5E5E5', color: '#1B2A4A' }}>
                    {user?.name?.[0] || user?.email?.[0] || 'U'}
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
                >
                  <MenuItem onClick={handleLogout}>
                    <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
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
                sx={{ ml: 2, borderColor: 'white' }}
              >
                Accedi
              </Button>
            )}
          </Box>

          {/* Menu mobile */}
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="menu"
              aria-controls="menu-mobile"
              aria-haspopup="true"
              onClick={handleMobileMenuToggle}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-mobile"
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
              open={mobileMenuOpen}
              onClose={() => setMobileMenuOpen(false)}
            >
              {isAuthenticated() && (
                <MenuItem component={Link} to="/favorites">
                  <FavoriteIcon fontSize="small" sx={{ mr: 1 }} />
                  Preferiti
                </MenuItem>
              )}

              {isAdmin() && (
                <MenuItem component={Link} to="/admin">
                  <AdminIcon fontSize="small" sx={{ mr: 1 }} />
                  Admin
                </MenuItem>
              )}

              {isAuthenticated() ? (
                <MenuItem onClick={handleLogout}>
                  <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                  Logout
                </MenuItem>
              ) : (
                <MenuItem component={Link} to="/login">
                  <AccountCircle fontSize="small" sx={{ mr: 1 }} />
                  Accedi
                </MenuItem>
              )}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 