import React from 'react';
import { NavLink as RouterLink, useLocation } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
  alpha,
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CodeIcon from '@mui/icons-material/Code';
import RecommendIcon from '@mui/icons-material/Recommend';
import HistoryIcon from '@mui/icons-material/History';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SettingsIcon from '@mui/icons-material/Settings';
import BuildIcon from '@mui/icons-material/Build';
import InfoIcon from '@mui/icons-material/Info';

type SidebarProps = {
  onMobileClose?: () => void;
};

// Create a custom component that wraps ListItem with RouterLink
const NavItemLink = React.forwardRef<HTMLAnchorElement, any>((props, ref) => (
  <RouterLink ref={ref} {...props} />
));

const StyledNavItem = styled(ListItem)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(0.5),
  '&.active': {
    backgroundColor: theme.palette.action.selected,
  },
}));

// Navigation item configuration
const navItems = [
  {
    title: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/',
    dividerAfter: false,
  },
  {
    title: 'Repository Details',
    icon: <CodeIcon />,
    path: '/repository',
    dividerAfter: false,
  },
  {
    title: 'Recommendations',
    icon: <RecommendIcon />,
    path: '/recommendations',
    dividerAfter: false,
  },
  {
    title: 'Historical Data',
    icon: <HistoryIcon />,
    path: '/historical',
    dividerAfter: true,
  },
  {
    title: 'Action Templates',
    icon: <PlayArrowIcon />,
    path: '/actions',
    dividerAfter: false,
  },
  {
    title: 'Settings',
    icon: <SettingsIcon />,
    path: '/settings',
    dividerAfter: true,
  },
];

const Sidebar: React.FC<SidebarProps> = ({ onMobileClose }) => {
  const location = useLocation();
  const theme = useTheme();

  return (
    <Box sx={{ overflow: 'auto', height: '100%' }}>
      <List component="nav" sx={{ px: 2 }}>
        {navItems.map((item) => (
          <React.Fragment key={item.title}>
            <Tooltip title={item.title} placement="right">
              <StyledNavItem
                button
                component={NavItemLink}
                to={item.path}
                className={location.pathname === item.path ? 'active' : ''}
                onClick={onMobileClose}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.title} />
              </StyledNavItem>
            </Tooltip>
            {item.dividerAfter && (
              <Divider
                sx={{
                  my: 2,
                  borderColor: alpha(theme.palette.text.primary, 0.1),
                }}
              />
            )}
          </React.Fragment>
        ))}
      </List>
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <BuildIcon sx={{ mr: 1, fontSize: '1rem', color: theme.palette.text.secondary }} />
          <Box sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary }}>v0.1.0</Box>
        </Box>
        <Tooltip title="About OctoFlow">
          <InfoIcon sx={{ fontSize: '1.25rem', color: theme.palette.text.secondary, cursor: 'pointer' }} />
        </Tooltip>
      </Box>
    </Box>
  );
};

export default Sidebar; 