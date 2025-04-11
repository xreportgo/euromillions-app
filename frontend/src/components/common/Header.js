import React from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, IconButton, Box, useMediaQuery, useTheme, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useTranslation } from 'react-i18next';

/**
 * Composant Header de l'application
 * @param {Object} props - Propriétés du composant
 * @param {boolean} props.isOpen - État d'ouverture du menu latéral
 * @param {Function} props.toggleSidebar - Fonction pour basculer le menu latéral
 * @param {boolean} props.isDarkMode - État du mode sombre
 * @param {Function} props.toggleTheme - Fonction pour basculer le thème
 */
const Header = ({ isOpen, toggleSidebar, isDarkMode, toggleTheme }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const menuItems = [
    { label: t('header.dashboard'), path: '/' },
    { label: t('header.results'), path: '/draws' },
    { label: t('header.predictions'), path: '/predictions' },
    { label: t('header.statistics'), path: '/statistics' },
    { label: t('header.savedGrids'), path: '/saved-grids' },
    { label: t('header.settings'), path: '/settings' }
  ];
  
  return (
    <AppBar position="fixed" sx={{ zIndex: theme => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={toggleSidebar}
          sx={{ marginRight: 2 }}
        >
          <MenuIcon />
        </IconButton>
        
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            EuroMillions App
          </Link>
        </Typography>
        
        {isMobile ? (
          <>
            <IconButton
              color="inherit"
              onClick={toggleTheme}
              aria-label={isDarkMode ? 'switch to light mode' : 'switch to dark mode'}
            >
              {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
            
            <IconButton
              color="inherit"
              aria-label="menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
            >
              <MenuIcon />
            </IconButton>
            
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={open}
              onClose={handleClose}
            >
              {menuItems.map((item) => (
                <MenuItem key={item.path} onClick={handleClose} component={Link} to={item.path}>
                  {item.label}
                </MenuItem>
              ))}
            </Menu>
          </>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {menuItems.map((item) => (
              <Button
                key={item.path}
                color="inherit"
                component={Link}
                to={item.path}
                sx={{ mx: 1 }}
              >
                {item.label}
              </Button>
            ))}
            
            <IconButton
              color="inherit"
              onClick={toggleTheme}
              aria-label={isDarkMode ? 'switch to light mode' : 'switch to dark mode'}
              sx={{ ml: 2 }}
            >
              {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
