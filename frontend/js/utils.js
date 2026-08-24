/**
 * RateSarthi - Frontend Utilities & UI Helpers
 */

const Utils = {
  /**
   * Format numbers to Indian Rupee (₹)
   */
  formatCurrency(amount) {
    if (amount === null || amount === undefined || amount === '' || isNaN(amount)) return '—';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  },

  /**
   * Format date string to readable format (e.g. 24 Aug 2026)
   */
  formatDate(dateString) {
    if (!dateString || dateString === '-') return '—';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (e) {
      return dateString;
    }
  },

  /**
   * Status Badge HTML generator
   */
  renderBadge(status) {
    if (!status) return '';
    const st = String(status).toUpperCase();
    const classMap = {
      ACTIVE: 'badge-active',
      COMPLETED: 'badge-completed',
      SUBMITTED: 'badge-submitted',
      SENT: 'badge-sent',
      PENDING: 'badge-pending',
      PARTIALLY_COMPLETED: 'badge-partially_completed',
      DRAFT: 'badge-draft',
      INACTIVE: 'badge-inactive',
      DEACTIVATED: 'badge-deactivated',
      EXPIRED: 'badge-expired',
      CANCELLED: 'badge-cancelled'
    };

    const cls = classMap[st] || 'badge-draft';
    const label = st.replace(/_/g, ' ');
    return `<span class="badge ${cls}">${label}</span>`;
  },

  /**
   * Toast notification popups
   */
  showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full px-4 pointer-events-none';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const bgMap = {
      success: 'bg-emerald-600 text-white shadow-emerald-200',
      error: 'bg-rose-600 text-white shadow-rose-200',
      warning: 'bg-amber-500 text-white shadow-amber-200',
      info: 'bg-slate-800 text-white shadow-slate-300'
    };

    const iconMap = {
      success: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>',
      error: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>',
      warning: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>',
      info: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>'
    };

    toast.className = `pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg font-medium text-sm transition-all duration-300 transform translate-y-2 opacity-0 ${bgMap[type] || bgMap.info}`;
    toast.innerHTML = `
      <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">${iconMap[type] || iconMap.info}</svg>
      <span class="flex-1">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
    }, 10);

    setTimeout(() => {
      toast.classList.add('translate-y-2', 'opacity-0');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  },

  /**
   * Escape HTML to prevent XSS injection in dynamic tables
   */
  escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  /**
   * Share Vendor Portal Link via WhatsApp Deep Link
   */
  shareVendorWhatsApp(phone, vendorName, portalUrl, requestTitle = '') {
    let cleanPhone = String(phone || '').replace(/\D/g, '');
    if (cleanPhone.length === 10) {
      cleanPhone = '91' + cleanPhone; // Default to India country code (+91) for 10-digit numbers
    }

    const titleMsg = requestTitle ? ` for *${requestTitle}*` : '';
    const message = `Hello *${vendorName}*,\n\nPlease click the link below to submit your item rates${titleMsg} on *RateSarthi Portal*:\n\n🔗 ${portalUrl}\n\nThank you!`;

    const encodedText = encodeURIComponent(message);
    const whatsappDeepLink = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;

    window.open(whatsappDeepLink, '_blank');
  }
};
