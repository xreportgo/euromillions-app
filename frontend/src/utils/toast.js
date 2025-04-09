// src/utils/toast.js

// Fonction de remplacement simple pour les notifications
const toast = {
  success: (message) => {
    console.log('✅ Success:', message);
    // Vous pourriez implémenter ici une notification basique en CSS pur si nécessaire
  },
  error: (message) => {
    console.error('❌ Error:', message);
    // Vous pourriez implémenter ici une notification basique en CSS pur si nécessaire
  },
  info: (message) => {
    console.info('ℹ️ Info:', message);
    // Vous pourriez implémenter ici une notification basique en CSS pur si nécessaire
  },
  warning: (message) => {
    console.warn('⚠️ Warning:', message);
    // Vous pourriez implémenter ici une notification basique en CSS pur si nécessaire
  }
};

export default toast;
