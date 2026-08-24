/**
 * RateSarthi - Admin Authentication & Route Guard Module
 */

const Auth = {
  /**
   * Check if Admin user is currently authenticated
   */
  isAuthenticated() {
    const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    const userData = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA);
    return !!(token && userData);
  },

  /**
   * Get current logged-in user object
   */
  getUser() {
    try {
      const data = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  getCurrentUser() {
    return this.getUser();
  },

  /**
   * Protect Admin Pages from unauthorized access
   */
  requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = '../login.html';
      return false;
    }
    return true;
  },

  /**
   * Handle Admin Login Submission
   */
  async login(email, password) {
    const res = await API.request('login', { email: email, password: password });
    if (res.success && res.data && res.data.token) {
      localStorage.setItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN, res.data.token);
      localStorage.setItem(CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(res.data.user));
    }
    return res;
  },

  /**
   * Handle Admin Logout
   */
  async logout() {
    const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      await API.request('logout', {}, token);
    }
    localStorage.removeItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_DATA);
    window.location.href = '../login.html';
  }
};
