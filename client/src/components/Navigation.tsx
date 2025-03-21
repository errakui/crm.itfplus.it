import PersonIcon from '@mui/icons-material/Person';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FolderIcon from '@mui/icons-material/Folder';
import SupportIcon from '@mui/icons-material/ContactSupport';
import ChatIcon from '@mui/icons-material/Chat';

const navItems = [
  { text: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
  { text: 'Documenti', path: '/documents', icon: <FolderIcon /> },
  { text: 'Assistenza', path: '/support', icon: <SupportIcon /> },
  { text: 'Chatbot', path: '/chatbot', icon: <ChatIcon /> },
  { text: 'Profilo', path: '/profile', icon: <PersonIcon /> },
]; 