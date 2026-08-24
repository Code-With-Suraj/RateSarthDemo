/**
 * RateSarthi - Historical Rate Tracking Controller
 */

let historyData = [];

document.addEventListener('DOMContentLoaded', () => {
  Components.initAdminLayout('history');
  loadFilterDropdowns();
  loadRateHistory();
});

async function loadFilterDropdowns() {
  const itemsRes = await API.request('getItems');
  if (itemsRes.success && Array.isArray(itemsRes.data)) {
    const select = document.getElementById('history-item-filter');
    select.innerHTML = `<option value="">All Items</option>` + itemsRes.data.map(i => `<option value="${i.itemId}">${Utils.escapeHtml(i.itemName)}</option>`).join('');
  }

  const vendorsRes = await API.request('getVendors');
  if (vendorsRes.success && Array.isArray(vendorsRes.data)) {
    const select = document.getElementById('history-vendor-filter');
    select.innerHTML = `<option value="">All Vendors</option>` + vendorsRes.data.map(v => `<option value="${v.vendorId}">${Utils.escapeHtml(v.vendorName)}</option>`).join('');
  }
}

async function loadRateHistory() {
  const tableBody = document.getElementById('history-table-body');
  const itemId = document.getElementById('history-item-filter').value;
  const vendorId = document.getElementById('history-vendor-filter').value;

  tableBody.innerHTML = `
    <tr>
      <td colspan="7" class="px-6 py-12 text-center text-slate-400">
        <svg class="animate-spin w-6 h-6 mx-auto mb-2 text-blue-600" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <span>Loading rate audit history...</span>
      </td>
    </tr>
  `;

  const res = await API.request('getRateHistory', { itemId: itemId, vendorId: vendorId });
  if (res.success && Array.isArray(res.data)) {
    historyData = res.data;
    renderHistoryTable(historyData);
  } else {
    tableBody.innerHTML = `<tr><td colspan="7" class="px-6 py-8 text-center text-rose-500 font-medium">${Utils.escapeHtml(res.message)}</td></tr>`;
  }
}

function renderHistoryTable(records) {
  const tableBody = document.getElementById('history-table-body');
  if (records.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="7" class="px-6 py-12 text-center text-slate-400">No rate modification records logged yet.</td></tr>`;
    return;
  }

  tableBody.innerHTML = records.map(h => {
    const isIncrease = h.changeAmount > 0;
    const isDecrease = h.changeAmount < 0;
    const changeBadgeClass = isDecrease ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : (isIncrease ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-50 text-slate-600 border-slate-200');

    return `
      <tr class="hover:bg-slate-50/80 transition-colors border-b border-slate-100">
        <td class="px-6 py-4 text-xs font-mono font-bold text-slate-700">${h.historyId}</td>
        <td class="px-6 py-4">
          <div class="font-bold text-slate-900 text-xs">${Utils.escapeHtml(h.itemName)}</div>
          <div class="text-[11px] text-slate-400 font-mono">ID: ${h.itemId}</div>
        </td>
        <td class="px-6 py-4 text-xs font-semibold text-slate-800">${Utils.escapeHtml(h.vendorName)}</td>
        <td class="px-6 py-4 text-xs font-mono text-slate-500">${Utils.formatCurrency(h.previousRate)}</td>
        <td class="px-6 py-4 text-xs font-mono font-bold text-slate-900">${Utils.formatCurrency(h.newRate)}</td>
        <td class="px-6 py-4 text-center">
          <span class="inline-block px-2.5 py-1 rounded-full border text-xs font-bold font-mono ${changeBadgeClass}">
            ${isIncrease ? '+' : ''}${h.changeAmount} (${isIncrease ? '+' : ''}${h.changePercentage}%)
          </span>
        </td>
        <td class="px-6 py-4 text-right text-xs text-slate-500 font-mono">
          <div>${Utils.formatDate(h.changedAt)}</div>
          <div class="text-[10px] text-slate-400">Req: ${h.requestId}</div>
        </td>
      </tr>
    `;
  }).join('');
}
