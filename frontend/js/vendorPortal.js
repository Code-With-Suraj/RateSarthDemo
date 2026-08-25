/**
 * RateSarthi - Vendor Portal Front-end Controller (Token-based)
 */

let portalToken = '';
let requestId = '';
let vendorData = null;
let requestData = null;
let itemsData = [];

document.addEventListener('DOMContentLoaded', () => {
  // Parse query parameters
  const urlParams = new URLSearchParams(window.location.search);
  portalToken = urlParams.get('t') || urlParams.get('token') || '';
  requestId = urlParams.get('req') || urlParams.get('requestId') || 'REQ001';

  if (!portalToken) {
    showPortalError('Missing Vendor Link Token', 'Please access this portal via your dedicated unique link received from the procurement manager.');
    return;
  }

  loadVendorPortalData();
});

function showPortalError(title, msg) {
  document.getElementById('portal-loading').classList.add('hidden');
  document.getElementById('portal-content').classList.add('hidden');
  
  const errBox = document.getElementById('portal-error');
  errBox.classList.remove('hidden');
  document.getElementById('portal-error-title').textContent = title;
  document.getElementById('portal-error-msg').textContent = msg;
}

async function loadVendorPortalData() {
  const res = await API.request('getVendorRequest', { requestId: requestId }, portalToken);
  
  document.getElementById('portal-loading').classList.add('hidden');

  if (res.success && res.data) {
    vendorData = res.data.vendor;
    requestData = res.data.request;
    itemsData = res.data.items;

    renderVendorHeader();
    renderVendorItems(itemsData);
    loadVendorNegotiations();
    document.getElementById('portal-content').classList.remove('hidden');
  } else {
    showPortalError('Portal Access Error', res.message || 'Unable to load rate request.');
  }
}

async function loadVendorNegotiations() {
  const res = await API.request('getVendorNegotiations', { requestId: requestId }, portalToken);
  const container = document.getElementById('vendor-negotiations-container');
  if (res.success && res.data && res.data.negotiations && res.data.negotiations.length > 0) {
    renderVendorNegotiations(res.data.negotiations);
    container.classList.remove('hidden');
  } else {
    container.classList.add('hidden');
  }
}

function renderVendorNegotiations(negs) {
  const container = document.getElementById('vendor-negotiations-container');
  const activeNegs = negs.filter(n => n.status === 'COUNTER_OFFERED' || n.status === 'NEGOTIATION_REVISED');

  if (activeNegs.length === 0) {
    container.classList.add('hidden');
    return;
  }

  container.innerHTML = `
    <div class="bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
      <div class="flex items-center gap-2 border-b border-sky-100 pb-3">
        <span class="text-xl">💬</span>
        <div>
          <h3 class="font-bold text-sky-950 text-sm sm:text-base">Price Counter-Offer Negotiation Request</h3>
          <p class="text-xs text-sky-700">Procurement Team has sent counter-offers for your review.</p>
        </div>
      </div>

      <div class="space-y-3">
        ${activeNegs.map(n => `
          <div class="bg-white border border-sky-100 rounded-xl p-4 shadow-xs space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="font-bold text-slate-900 text-sm">${Utils.escapeHtml(n.itemName)}</h4>
                <p class="text-[11px] text-slate-400">Unit: ${Utils.escapeHtml(n.unit)} ${n.specification ? '• Spec: ' + Utils.escapeHtml(n.specification) : ''}</p>
              </div>
              <span class="px-2 py-0.5 text-[10px] font-bold bg-sky-100 text-sky-800 rounded-full">Round ${n.round}</span>
            </div>

            <div class="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100 text-center font-mono">
              <div>
                <span class="text-[10px] font-sans text-slate-400 font-medium block">Your Quoted Rate</span>
                <span class="font-bold text-slate-700 text-xs mt-0.5 block">${Utils.formatCurrency(n.originalRate)}</span>
              </div>
              <div>
                <span class="text-[10px] font-sans text-sky-600 font-bold block">Procurement Target Rate</span>
                <span class="font-extrabold text-sky-700 text-sm mt-0.5 block">${Utils.formatCurrency(n.targetRate)}</span>
              </div>
            </div>

            ${n.adminMessage ? `
              <div class="p-2.5 rounded-lg bg-sky-50/70 border border-sky-100 text-xs text-sky-900 italic">
                "Procurement Note: ${Utils.escapeHtml(n.adminMessage)}"
              </div>
            ` : ''}

            <!-- Response Action Options -->
            <div class="pt-2 space-y-2" id="neg-action-box-${n.negotiationId}">
              <div class="flex flex-wrap items-center gap-2">
                <button onclick="handleVendorNegResponse('${n.negotiationId}', 'ACCEPT')" class="flex-1 min-w-[130px] py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1 transition-all">
                  <span>✓ Accept ${Utils.formatCurrency(n.targetRate)}</span>
                </button>

                <button onclick="toggleReviseBox('${n.negotiationId}')" class="py-2 px-3 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-800 font-bold text-xs flex items-center justify-center gap-1 transition-all">
                  <span>✏️ Revise Rate</span>
                </button>

                <button onclick="handleVendorNegResponse('${n.negotiationId}', 'REJECT')" class="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs transition-all">
                  <span>Decline</span>
                </button>
              </div>

              <!-- Collapsible Revise Input -->
              <div id="revise-box-${n.negotiationId}" class="hidden p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 mt-2">
                <label class="block text-[11px] font-bold text-slate-700">Enter Your Best Revised Counter Rate (₹)</label>
                <div class="flex gap-2">
                  <input type="number" step="0.01" id="input-revise-${n.negotiationId}" placeholder="${n.targetRate}" class="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500">
                  <button onclick="handleVendorNegResponse('${n.negotiationId}', 'REVISE')" class="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-lg shadow-xs">
                    Submit Revision
                  </button>
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function toggleReviseBox(negId) {
  const box = document.getElementById(`revise-box-${negId}`);
  if (box) box.classList.toggle('hidden');
}

async function handleVendorNegResponse(negId, action) {
  let revisedRate = null;
  if (action === 'REVISE') {
    const input = document.getElementById(`input-revise-${negId}`);
    revisedRate = input ? input.value : null;
    if (!revisedRate || parseFloat(revisedRate) <= 0) {
      Utils.showToast('Please enter a valid revised rate', 'error');
      return;
    }
  }

  const payload = {
    negotiationId: negId,
    action: action,
    revisedRate: revisedRate,
    message: action === 'ACCEPT' ? 'Accepted counter offer rate' : (action === 'REVISE' ? `Revised rate to ₹${revisedRate}` : 'Declined counter offer')
  };

  const res = await API.request('respondToNegotiation', payload, portalToken);
  if (res.success) {
    Utils.showToast(`Negotiation response sent!`, 'success');
    await loadVendorPortalData();
  } else {
    Utils.showToast(res.message || 'Failed to submit response', 'error');
  }
}

function renderVendorHeader() {
  document.getElementById('vendor-name-display').textContent = vendorData.vendorName;
  document.getElementById('request-title-display').textContent = requestData.requestTitle;
  document.getElementById('due-date-display').textContent = Utils.formatDate(requestData.dueDate);

  if (requestData.isExpired) {
    document.getElementById('expired-banner').classList.remove('hidden');
    document.getElementById('btn-submit-all').disabled = true;
    document.getElementById('btn-submit-all').classList.add('opacity-50');
  }

  updateProgressHeader();
}

function updateProgressHeader() {
  const completed = itemsData.filter(i => i.rate !== '' && i.rate !== null && !isNaN(parseFloat(i.rate))).length;
  const total = itemsData.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  document.getElementById('progress-count').textContent = `${completed} / ${total} Quoted`;
  document.getElementById('progress-bar').style.width = `${pct}%`;
}

let saveTimeout = null;
let pendingChangedItems = new Set();

function updateSaveStatusPill(status, text) {
  const pill = document.getElementById('save-status-pill');
  if (!pill) return;

  if (status === 'saving') {
    pill.className = 'text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5 transition-all';
    pill.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></span><span>Saving...</span>`;
  } else if (status === 'saved') {
    pill.className = 'text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 transition-all';
    pill.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span><span>Saved to cloud</span>`;
  } else if (status === 'error') {
    pill.className = 'text-[11px] font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5 transition-all';
    pill.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span><span>${text || 'Save error'}</span>`;
  }
}

function renderVendorItems(items) {
  const container = document.getElementById('vendor-items-container');
  if (items.length === 0) {
    container.innerHTML = `<div class="text-center py-12 text-slate-400">No items assigned to your account for this request.</div>`;
    return;
  }

  container.innerHTML = items.map(item => `
    <div class="vendor-item-card p-4 sm:p-5" id="card-${item.itemId}">
      <div class="flex items-start justify-between gap-3 mb-3">
        <div>
          <h4 class="font-bold text-slate-900 text-base leading-tight">${Utils.escapeHtml(item.itemName)}</h4>
          <span class="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-mono font-semibold">Unit: ${Utils.escapeHtml(item.unit)}</span>
        </div>
        <div id="badge-status-${item.itemId}">
          ${item.status === 'SUBMITTED' ? Utils.renderBadge('SUBMITTED') : (item.rate !== '' && item.rate !== null ? Utils.renderBadge('DRAFT') : '<span class="text-xs text-slate-400 font-medium">Pending</span>')}
        </div>
      </div>

      ${item.specification ? `<p class="text-xs text-slate-500 mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100">Spec: ${Utils.escapeHtml(item.specification)}</p>` : ''}

      <div class="space-y-3">
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Your Rate per ${Utils.escapeHtml(item.unit)} (₹) *</label>
          <div class="relative">
            <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">₹</span>
            <input type="number" step="0.01" min="0" placeholder="0.00" value="${item.rate !== null ? item.rate : ''}" oninput="onVendorInput('${item.itemId}')" onchange="onVendorInput('${item.itemId}')" id="rate-${item.itemId}" class="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-300 font-mono font-bold text-lg text-slate-900 focus:outline-none focus:border-blue-600">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Min Order Qty (MOQ)</label>
            <input type="text" placeholder="e.g. 50 ${Utils.escapeHtml(item.unit)}" value="${Utils.escapeHtml(item.moq || '')}" oninput="onVendorInput('${item.itemId}')" onchange="onVendorInput('${item.itemId}')" id="moq-${item.itemId}" class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500">
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Brand Name / Make</label>
            <input type="text" placeholder="e.g. Fortune" value="${Utils.escapeHtml(item.brand || '')}" oninput="onVendorInput('${item.itemId}')" onchange="onVendorInput('${item.itemId}')" id="brand-${item.itemId}" class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Rate Validity</label>
            <input type="text" placeholder="e.g. 30 Days" value="${Utils.escapeHtml(item.validity || '')}" oninput="onVendorInput('${item.itemId}')" onchange="onVendorInput('${item.itemId}')" id="validity-${item.itemId}" class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500">
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Remarks / Terms</label>
            <input type="text" placeholder="e.g. GST Extra" value="${Utils.escapeHtml(item.remarks || '')}" oninput="onVendorInput('${item.itemId}')" onchange="onVendorInput('${item.itemId}')" id="remarks-${item.itemId}" class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500">
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

/**
 * Optimistic local UI update and debounced batch cloud sync
 */
function onVendorInput(itemId) {
  const rateVal = document.getElementById(`rate-${itemId}`).value;
  const item = itemsData.find(i => i.itemId === itemId);
  if (item) {
    item.rate = rateVal !== '' ? parseFloat(rateVal) : null;
    item.moq = document.getElementById(`moq-${itemId}`).value;
    item.brand = document.getElementById(`brand-${itemId}`).value;
    item.validity = document.getElementById(`validity-${itemId}`).value;
    item.remarks = document.getElementById(`remarks-${itemId}`).value;
    if (item.status !== 'SUBMITTED' && item.rate !== null) {
      item.status = 'DRAFT';
      document.getElementById(`badge-status-${itemId}`).innerHTML = Utils.renderBadge('DRAFT');
    }
  }

  // Optimistic UI updates
  updateProgressHeader();
  updateSaveStatusPill('saving');

  pendingChangedItems.add(itemId);

  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(flushPendingBatchSave, 500); // 500ms debounce
}

async function flushPendingBatchSave() {
  if (pendingChangedItems.size === 0) return;

  const itemsToSave = Array.from(pendingChangedItems).map(id => {
    const item = itemsData.find(i => i.itemId === id);
    return {
      itemId: id,
      rate: item ? item.rate : '',
      moq: item ? item.moq : '',
      brand: item ? item.brand : '',
      validity: item ? item.validity : '',
      remarks: item ? item.remarks : ''
    };
  });

  const payload = {
    requestId: requestId,
    rates: itemsToSave
  };

  const res = await API.request('saveBatchVendorRates', payload, portalToken);

  if (res.success) {
    pendingChangedItems.clear();
    updateSaveStatusPill('saved');
  } else {
    updateSaveStatusPill('error', 'Sync warning');
  }
}

async function submitAllVendorRates() {
  // Flush any un-synced batch rates first before final submission
  if (saveTimeout) clearTimeout(saveTimeout);
  if (pendingChangedItems.size > 0) {
    await flushPendingBatchSave();
  }

  const unquoted = itemsData.filter(i => i.rate === '' || i.rate === null || isNaN(parseFloat(i.rate)));
  if (unquoted.length > 0) {
    if (!confirm(`You have left ${unquoted.length} item(s) unquoted. Submit rates anyway?`)) {
      return;
    }
  }

  const btn = document.getElementById('btn-submit-all');
  btn.disabled = true;
  btn.innerHTML = `<svg class="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> <span>Submitting Rates...</span>`;

  const res = await API.request('submitVendorRates', { requestId: requestId }, portalToken);

  btn.disabled = false;
  btn.innerHTML = `<span>Submit All Rates</span>`;

  if (res.success) {
    Utils.showToast('Rates submitted successfully! Thank you.', 'success');
    setTimeout(() => {
      location.reload();
    }, 1000);
  } else {
    Utils.showToast(res.message || 'Failed to submit rates', 'error');
  }
}
