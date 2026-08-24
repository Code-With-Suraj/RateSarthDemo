/**
 * RateSarthi - Rate Requests List Controller
 */

let requestsData = [];

document.addEventListener('DOMContentLoaded', () => {
  Components.initAdminLayout('requests');
  loadRateRequests();
});

async function loadRateRequests() {
  const tableBody = document.getElementById('requests-table-body');
  tableBody.innerHTML = `
    <tr>
      <td colspan="7" class="px-6 py-12 text-center text-slate-400">
        <svg class="animate-spin w-6 h-6 mx-auto mb-2 text-blue-600" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <span>Loading rate requests...</span>
      </td>
    </tr>
  `;

  const res = await API.request('getRateRequests');
  if (res.success && Array.isArray(res.data)) {
    requestsData = res.data;
    renderRequestsTable(requestsData);
  } else {
    tableBody.innerHTML = `<tr><td colspan="7" class="px-6 py-8 text-center text-rose-500 font-medium">${Utils.escapeHtml(res.message)}</td></tr>`;
  }
}

function renderRequestsTable(requests) {
  const tableBody = document.getElementById('requests-table-body');
  if (requests.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" class="px-6 py-12 text-center text-slate-400">
          No rate requests found. Click <strong>Create New Request</strong> to initiate rate collection.
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = requests.map(r => `
    <tr class="hover:bg-slate-50/80 transition-colors border-b border-slate-100">
      <td class="px-6 py-4 text-xs font-mono font-bold text-slate-700">${r.requestId}</td>
      <td class="px-6 py-4">
        <a href="comparison.html?id=${r.requestId}" class="font-bold text-slate-900 text-sm hover:text-blue-600 transition-colors">${Utils.escapeHtml(r.requestTitle)}</a>
        <div class="text-xs text-slate-400">Category: ${Utils.escapeHtml(r.categoryName)}</div>
      </td>
      <td class="px-6 py-4 text-xs text-slate-600">
        <div>Due: <strong class="text-slate-800 font-mono">${Utils.formatDate(r.dueDate)}</strong></div>
        <div class="text-[11px] text-slate-400">Created: ${Utils.formatDate(r.createdAt)}</div>
      </td>
      <td class="px-6 py-4 text-xs text-center font-semibold text-slate-700">
        ${r.totalItems} Items / ${r.totalVendors} Vendors
      </td>
      <td class="px-6 py-4 min-w-[160px]">
        <div class="flex items-center justify-between text-xs mb-1 font-semibold text-slate-700">
          <span>${r.completedVendors} / ${r.totalVendors} Vendors</span>
          <span class="font-mono">${r.completionPercentage}%</span>
        </div>
        <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div class="bg-blue-600 h-full transition-all duration-300" style="width: ${r.completionPercentage}%"></div>
        </div>
      </td>
      <td class="px-6 py-4 text-center">
        ${Utils.renderBadge(r.status)}
      </td>
      <td class="px-6 py-4 text-right space-x-2">
        <a href="comparison.html?id=${r.requestId}" class="px-3.5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-xs font-semibold inline-flex items-center gap-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
          <span>Compare Rates</span>
        </a>
      </td>
    </tr>
  `).join('');
}

function filterRequests() {
  const query = document.getElementById('search-request').value.toLowerCase();
  const statusFilter = document.getElementById('status-filter').value;

  const filtered = requestsData.filter(r => {
    const matchesQuery = r.requestTitle.toLowerCase().includes(query) || r.requestId.toLowerCase().includes(query);
    const matchesStatus = !statusFilter || r.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  renderRequestsTable(filtered);
}
