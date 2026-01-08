import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Button,
  Avatar,
} from '@mui/material';
import {
  Search as SearchIcon,
  AccountCircle as AccountCircleIcon,
  HelpOutline as HelpOutlineIcon,
  QuestionAnswer as QuestionAnswerIcon,
  ContactSupport as ContactSupportIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import AuthContext from '../contexts/AuthContext';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  drawerWidth?: number;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose, drawerWidth = 280 }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate('/login');
    onClose();
  };

  const menuItems = [
    {
      text: 'Motore di ricerca',
      icon: <SearchIcon />,
      path: '/dashboard',
    },
    {
      text: 'Il mio profilo',
      icon: <PersonIcon />,
      path: '/profile',
    },
    {
      text: 'Assistenza',
      icon: <HelpOutlineIcon />,
      path: '/support',
    },
    {
      text: 'FAQ',
      icon: <QuestionAnswerIcon />,
      path: '/faq',
    },
    {
      text: 'Contattaci',
      icon: <ContactSupportIcon />,
      path: '/contact',
    },
  ];

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Migliora le prestazioni su dispositivi mobili
      }}
      sx={{
        display: { xs: 'block' },
        '& .MuiDrawer-paper': {
          boxSizing: 'border-box',
          width: { xs: 260, sm: drawerWidth },
          backgroundColor: 'var(--card-background)',
          paddingTop: { xs: '56px', sm: '64px' }, // Dinamico basato su altezza navbar
          borderRight: '1px solid var(--border-light)',
        },
      }}
    >
      <Box sx={{ p: 3 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Avatar
            sx={{
              width: 50,
              height: 50,
              backgroundColor: 'primary.main',
              color: 'white',
              mr: 2,
            }}
          >
            {user?.name?.[0] || user?.email?.[0] || 'U'}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              {user?.name || 'Utente'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.email || ''}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider />

      <List sx={{ pt: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              onClick={onClose}
              selected={location.pathname === item.path}
              sx={{
                py: 1.5,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(27, 42, 74, 0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(27, 42, 74, 0.15)',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ color: location.pathname === item.path ? 'primary.main' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: location.pathname === item.path ? 'bold' : 'regular',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Box 
        sx={{ 
          p: 2, 
          mt: 3,
          borderTop: '1px solid var(--border-light)',
        }}
      >
        <Button
          variant="contained"
          color="error"
          fullWidth
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{
            py: 1.2,
            borderRadius: 2,
            fontWeight: 600,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(244, 63, 94, 0.3)',
            },
          }}
        >
          Logout
        </Button>
      </Box>
    </Drawer>
  );
};

export default Sidebar; 