/**
 * RateSarthi - Admin Layout Components & Navigation Generator
 */

const Components = {
  /**
   * Render Main Admin Layout Frame (Sidebar + Top Navbar)
   */
  initAdminLayout(activePage = '') {
    Auth.requireAuth();
    const user = Auth.getUser() || { name: 'Purchase Manager', email: 'manager@company.com' };

    const navItems = [
      { id: 'dashboard', label: 'Dashboard', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 00-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>', href: 'dashboard.html' },
      { id: 'requests', label: 'Rate Requests', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>', href: 'requests.html' },
      { id: 'vendors', label: 'Vendors', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>', href: 'vendors.html' },
      { id: 'categories', label: 'Categories', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>', href: 'categories.html' },
      { id: 'items', label: 'Items Master', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>', href: 'items.html' },
      { id: 'assignments', label: 'Vendor Items Map', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>', href: 'assignments.html' },
      { id: 'history', label: 'Rate History', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>', href: 'history.html' }
    ];

    const sidebarNavHtml = navItems.map(item => {
      const isActive = activePage === item.id;
      const activeClass = isActive 
        ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/20' 
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium';
      return `
        <a href="${item.href}" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 text-sm ${activeClass}">
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">${item.icon}</svg>
          <span>${item.label}</span>
        </a>
      `;
    }).join('');

    const layoutContainer = document.getElementById('app-layout');
    if (!layoutContainer) return;

    const pageContentHtml = layoutContainer.innerHTML;

    layoutContainer.innerHTML = `
      <div class="min-h-screen flex bg-slate-50">
        <!-- Sidebar -->
        <aside id="sidebar" class="w-64 bg-white border-r border-slate-200 flex flex-col fixed inset-y-0 z-30 transition-transform duration-300 md:translate-x-0 -translate-x-full">
          <!-- App Branding -->
          <div class="h-16 px-6 flex items-center gap-3 border-b border-slate-100">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-blue-500/30">
              R
            </div>
            <div>
              <h1 class="font-bold text-slate-900 tracking-tight leading-none text-base">RateSarthi</h1>
              <span class="text-[11px] font-medium text-slate-400">Procurement Suite</span>
            </div>
          </div>

          <!-- Nav Links -->
          <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            ${sidebarNavHtml}
          </nav>

          <!-- System Action Footer -->
          <div class="p-3 border-t border-slate-100 space-y-2">
            <button onclick="Components.triggerSystemInit()" class="w-full text-xs flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors font-medium">
              <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
              <span>Initialize / Reset DB</span>
            </button>
          </div>
        </aside>

        <!-- Main Wrapper -->
        <div class="flex-1 md:pl-64 flex flex-col min-w-0">
          <!-- Top Navbar -->
          <header class="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-20 flex items-center justify-between px-4 sm:px-8">
            <div class="flex items-center gap-3">
              <button onclick="Components.toggleSidebar()" class="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
              </button>
              <h2 class="text-lg font-bold text-slate-800 tracking-tight capitalize" id="page-title">${activePage}</h2>
            </div>

            <!-- Profile & Actions -->
            <div class="flex items-center gap-3">
              <a href="create-request.html" class="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                <span>New Rate Request</span>
              </a>

              <div class="h-8 w-px bg-slate-200 hidden sm:block"></div>

              <div class="flex items-center gap-3">
                <div class="text-right hidden sm:block">
                  <p class="text-xs font-bold text-slate-900 leading-none">${Utils.escapeHtml(user.name)}</p>
                  <p class="text-[11px] text-slate-400 font-medium">${Utils.escapeHtml(user.email)}</p>
                </div>
                <button onclick="Auth.logout()" title="Logout" class="p-2 rounded-xl text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                </button>
              </div>
            </div>
          </header>

          <!-- Main Page Body -->
          <main class="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
            ${pageContentHtml}
          </main>
        </div>
      </div>
    `;
  },

  toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.toggle('-translate-x-full');
  },

  async triggerSystemInit() {
    if (!confirm('This will verify/create all 10 sheet tables and seed demo master data. Proceed?')) return;
    Utils.showToast('Initializing Database & Seeding Data...', 'info');
    const res = await API.request('seedData');
    if (res.success) {
      Utils.showToast('Database initialized and demo data seeded successfully!', 'success');
      setTimeout(() => location.reload(), 1000);
    } else {
      Utils.showToast(res.message || 'Initialization failed', 'error');
    }
  }
};
