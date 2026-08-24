/**
 * RateSarthi - Centralized API Service Wrapper
 */

const API = {
  /**
   * Main dispatch method for API calls
   */
  async request(action, data = {}, customToken = null) {
    const token = customToken || localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN) || '';
    const apiUrl = CONFIG.API_BASE_URL;

    // Build payload
    const payload = {
      action: action,
      token: token,
      data: data
    };

    if (!apiUrl) {
      console.warn(`[API] API_BASE_URL is not set. Executing action '${action}' in client mode.`);
      return this.handleClientFallback(action, data);
    }

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8' // Standard CORS-friendly request format for Apps Script
        },
        body: JSON.stringify(payload)
      });

      const json = await response.json();
      
      if (!json.success && json.code === 'UNAUTHORIZED') {
        // Clear session and redirect to login if unauthorized
        if (!window.location.pathname.includes('/login.html') && !window.location.pathname.includes('/vendor/')) {
          localStorage.removeItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
          localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_DATA);
          window.location.href = '../login.html?expired=1';
        }
      }

      return json;
    } catch (err) {
      console.error(`[API Error] Failed to execute ${action}:`, err);
      return {
        success: false,
        message: 'Network error or backend unreachable. Please check your connection.',
        code: 'NETWORK_ERROR',
        details: err.message
      };
    }
  },

  /**
   * Client-side fallback for development without immediate Apps Script URL configured
   */
  handleClientFallback(action, data) {
    console.log(`[API Mock] Executing '${action}' with payload:`, data);
    
    // Simulate API responses for initial frontend verification if URL not pasted yet
    return new Promise(resolve => {
      setTimeout(() => {
        if (action === 'login') {
          if (data.email === 'manager@company.com' && data.password === 'Admin@123') {
            resolve({
              success: true,
              message: 'Login successful (Demo Mode)',
              data: {
                token: 'mock-session-token-12345',
                user: { userId: 'USR001', name: 'Purchase Manager', email: 'manager@company.com', role: 'ADMIN' }
              }
            });
          } else {
            resolve({ success: false, message: 'Invalid credentials. Demo admin: manager@company.com / Admin@123', code: 'INVALID_CREDENTIALS' });
          }
          return;
        }

        resolve({
          success: true,
          message: 'Operation completed (Client Fallback)',
          data: []
        });
      }, 300);
    });
  }
};
