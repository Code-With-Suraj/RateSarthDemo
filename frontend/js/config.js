/**
 * RateSarthi - Frontend Configuration Constants
 */

const CONFIG = {
  APP_NAME: 'RateSarthi',
  COMPANY_NAME: 'Procurement Management Co.',
  
  // Set your deployed Apps Script Web App URL here
  // Example: 'https://script.google.com/macros/s/AKfycbx.../exec'
  API_BASE_URL: window.RATESARTHI_API_URL || 'https://script.google.com/macros/s/AKfycbzGc0ijYNNjUdfPOnj_0CXq8W2t5N1oaOOI1hmJSsT-LG4t8RqdSoJjHOizUsGQ7Ltl/exec',

  STORAGE_KEYS: {
    AUTH_TOKEN: 'ratesarthi_auth_token',
    USER_DATA: 'ratesarthi_user_data'
  }
};
