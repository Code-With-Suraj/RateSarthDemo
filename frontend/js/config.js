/**
 * RateSarthi - Frontend Configuration Constants
 */

const CONFIG = {
  APP_NAME: 'RateSarthi',
  COMPANY_NAME: 'Procurement Management Co.',
  
  // Set your deployed Apps Script Web App URL here
  // Example: 'https://script.google.com/macros/s/AKfycbx.../exec'
  API_BASE_URL: window.RATESARTHI_API_URL || 'https://script.google.com/macros/s/AKfycbyoDkrUWvkDtS2wZrRCUFtfgN1smoWVpmP4qQkt3vKlbEGFvZnOFRNRJircl2C-Lg/exec',

  STORAGE_KEYS: {
    AUTH_TOKEN: 'ratesarthi_auth_token',
    USER_DATA: 'ratesarthi_user_data'
  }
};
