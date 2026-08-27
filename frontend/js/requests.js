/**
 * RateSarthi - Rate Requests List Controller
 */

let requestsData = [];

document.addEventListener('DOMContentLoaded', () => {
  Components.initAdminLayout('requests');
  loadRateRequests();

  const urlParams = new URLSearchParams(window.location.search);
  const autoSendWa = urlParams.get('sendWa');
  if (autoSendWa) {
    setTimeout(() => {
      openRfqWhatsAppModal(autoSendWa);
    }, 500);
  }
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
      <td class="px-6 py-4 text-right space-x-2 whitespace-nowrap">
        <button onclick="openRfqWhatsAppModal('${r.requestId}')" title="Send WhatsApp Portal Links to Vendors" class="px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors text-xs font-semibold inline-flex items-center gap-1">
          <svg class="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.51 1.037 3.531l-.68 2.483 2.544-.667a5.723 5.723 0 002.867.766h.003c3.181 0 5.768-2.586 5.768-5.766 0-3.18-2.587-5.766-5.771-5.766zm3.376 8.163c-.144.405-.837.774-1.17.822-.297.043-.685.064-1.114-.073-.264-.084-.607-.2-1.026-.381-1.815-.785-3.003-2.617-3.094-2.738-.09-.122-.743-.988-.743-1.884 0-.896.469-1.336.636-1.516.167-.18.365-.225.487-.225.122 0 .243.002.348.006.11.005.258-.042.404.308.15.361.512 1.25.556 1.341.045.09.075.196.015.316-.06.12-.09.196-.18.301-.09.105-.189.234-.27.315-.09.09-.184.188-.079.369.105.18.468.772 1.004 1.25.688.613 1.269.803 1.45.893.18.09.285.075.39-.045.105-.12.45-.525.57-.705.12-.18.24-.15.405-.09.165.06 1.05.495 1.23.585.18.09.3.135.345.21.045.075.045.435-.099.84z"/></svg>
          <span>WhatsApp Vendors</span>
        </button>

        <a href="comparison.html?id=${r.requestId}" class="px-3.5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-xs font-semibold inline-flex items-center gap-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
          <span>Compare Rates</span>
        </a>
      </td>
    </tr>
  `).join('');
}

let activeRfqVendors = [];
let activeRfqDetail = null;

async function openRfqWhatsAppModal(requestId) {
  const modal = document.getElementById('rfq-whatsapp-modal');
  const container = document.getElementById('rfq-modal-vendor-list');
  container.innerHTML = `<div class="text-center py-8 text-slate-400">Loading assigned vendors...</div>`;
  if (modal) modal.classList.remove('hidden');

  const res = await API.request('getRequestDetail', { requestId: requestId });
  if (res.success && res.data) {
    activeRfqDetail = res.data.request;
    activeRfqVendors = res.data.vendors || [];

    document.getElementById('rfq-modal-title').textContent = `WhatsApp Vendor Links — ${activeRfqDetail.RequestTitle || requestId}`;
    document.getElementById('rfq-modal-subtitle').textContent = `Assigned Vendors: ${activeRfqVendors.length} | Due Date: ${Utils.formatDate(activeRfqDetail.DueDate)}`;

    if (activeRfqVendors.length === 0) {
      container.innerHTML = `<div class="text-center py-6 text-slate-400">No vendors assigned to this request.</div>`;
      return;
    }

    container.innerHTML = activeRfqVendors.map(v => {
      const portalUrl = `${window.location.origin}/vendor/portal.html?token=${v.portalToken || v.vendorId}&req=${requestId}`;      const safeVendorName = Utils.escapeHtml(v.vendorName);
      const isDone = v.status === 'COMPLETED';

      return `
        <div class="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition-colors">
          <div>
            <div class="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <span>${safeVendorName}</span>
              ${isDone ? '<span class="px-1.5 py-0.2 text-[9px] font-bold bg-emerald-100 text-emerald-800 rounded-full">Submitted</span>' : '<span class="px-1.5 py-0.2 text-[9px] font-medium bg-amber-100 text-amber-800 rounded-full">Pending</span>'}
            </div>
            <div class="text-[11px] text-slate-400 mt-0.5">${Utils.escapeHtml(v.contactPerson || 'Vendor')} • ${Utils.escapeHtml(v.phone || 'No phone')}</div>
          </div>

          <button onclick="Utils.shareVendorWhatsApp('${v.phone}', '${safeVendorName}', '${portalUrl}', '${activeRfqDetail.RequestTitle}', '${activeRfqDetail.DueDate}')" class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1">
            <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.51 1.037 3.531l-.68 2.483 2.544-.667a5.723 5.723 0 002.867.766h.003c3.181 0 5.768-2.586 5.768-5.766 0-3.18-2.587-5.766-5.771-5.766zm3.376 8.163c-.144.405-.837.774-1.17.822-.297.043-.685.064-1.114-.073-.264-.084-.607-.2-1.026-.381-1.815-.785-3.003-2.617-3.094-2.738-.09-.122-.743-.988-.743-1.884 0-.896.469-1.336.636-1.516.167-.18.365-.225.487-.225.122 0 .243.002.348.006.11.005.258-.042.404.308.15.361.512 1.25.556 1.341.045.09.075.196.015.316-.06.12-.09.196-.18.301-.09.105-.189.234-.27.315-.09.09-.184.188-.079.369.105.18.468.772 1.004 1.25.688.613 1.269.803 1.45.893.18.09.285.075.39-.045.105-.12.45-.525.57-.705.12-.18.24-.15.405-.09.165.06 1.05.495 1.23.585.18.09.3.135.345.21.045.075.045.435-.099.84z"/></svg>
            <span>Send WhatsApp</span>
          </button>
        </div>
      `;
    }).join('');
  } else {
    container.innerHTML = `<div class="text-center py-6 text-rose-500 font-medium">${Utils.escapeHtml(res.message)}</div>`;
  }
}

function closeRfqWhatsAppModal() {
  const modal = document.getElementById('rfq-whatsapp-modal');
  if (modal) modal.classList.add('hidden');
}

function sendBatchWhatsAppToAll() {
  if (!activeRfqVendors || activeRfqVendors.length === 0) {
    Utils.showToast('No assigned vendors to notify', 'warning');
    return;
  }

  activeRfqVendors.forEach((v, index) => {
    setTimeout(() => {
      const portalUrl = `${window.location.origin}/vendor/portal.html?token=${v.portalToken || v.vendorId}&req=${activeRfqDetail.RequestID}`;
      Utils.shareVendorWhatsApp(v.phone, v.vendorName, portalUrl, activeRfqDetail.RequestTitle, activeRfqDetail.DueDate);
    }, index * 400); // Small stagger to avoid browser tab popup block
  });

  Utils.showToast(`Opening WhatsApp tabs for ${activeRfqVendors.length} vendors!`, 'success');
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

