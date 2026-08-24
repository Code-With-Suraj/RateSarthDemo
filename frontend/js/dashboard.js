/**
 * RateSarthi - Admin Dashboard Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  Components.initAdminLayout('dashboard');
  loadDashboardData();
});

async function loadDashboardData() {
  const res = await API.request('getDashboard');
  if (res.success && res.data) {
    const stats = res.data;
    document.getElementById('dash-active-vendors').textContent = stats.activeVendors;
    document.getElementById('dash-active-items').textContent = stats.activeItems;
    document.getElementById('dash-pending-requests').textContent = stats.pendingRequests;
    document.getElementById('dash-completed-requests').textContent = stats.completedRequests;

    renderRecentRequestsTable(stats.recentRequests || []);
  } else {
    Utils.showToast(res.message || 'Failed to load dashboard data', 'error');
  }
}

function renderRecentRequestsTable(requests) {
  const tableBody = document.getElementById('recent-requests-table-body');
  if (requests.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5" class="px-6 py-8 text-center text-slate-400">No recent rate requests found.</td></tr>`;
    return;
  }

  tableBody.innerHTML = requests.map(r => `
    <tr class="hover:bg-slate-50/80 transition-colors border-b border-slate-100">
      <td class="px-6 py-4 text-xs font-mono font-bold text-slate-700">${r.requestId}</td>
      <td class="px-6 py-4">
        <a href="comparison.html?id=${r.requestId}" class="font-bold text-slate-900 text-xs hover:text-blue-600 transition-colors">${Utils.escapeHtml(r.requestTitle)}</a>
      </td>
      <td class="px-6 py-4 text-xs text-slate-600 font-mono">${Utils.formatDate(r.dueDate)}</td>
      <td class="px-6 py-4">
        <div class="flex items-center gap-2">
          <div class="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden min-w-[80px]">
            <div class="bg-blue-600 h-full" style="width: ${r.completionPercentage}%"></div>
          </div>
          <span class="text-xs font-mono font-semibold text-slate-700">${r.completionPercentage}%</span>
        </div>
      </td>
      <td class="px-6 py-4 text-right">
        ${Utils.renderBadge(r.status)}
      </td>
    </tr>
  `).join('');
}
