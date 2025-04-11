// src/components/Footer.js
import React from 'react';
import { Box, Container, Typography, Link, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: '#111',
        color: '#fff',
        borderTop: '1px solid #333'
      }}
    >
      <Container maxWidth="lg">
        <Divider sx={{ mb: 2, bgcolor: '#333' }} />
        
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: { xs: 2, sm: 0 } }}>
            © 2025 EuroMillions App - Ce site n'est pas affilié à la FDJ.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Link
              component={RouterLink}
              to="/mentions-legales"
              color="primary"
              underline="hover"
              sx={{ fontWeight: 'medium' }}
            >
              Mentions légales
            </Link>
            
            <Link
              component={RouterLink}
              to="/confidentialite"
              color="primary"
              underline="hover"
              sx={{ fontWeight: 'medium' }}
            >
              Confidentialité
            </Link>
            
            <Link
              component={RouterLink}
              to="/contact"
              color="primary"
              underline="hover"
              sx={{ fontWeight: 'medium' }}
            >
              Contact
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
