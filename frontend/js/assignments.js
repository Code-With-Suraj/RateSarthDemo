/**
 * RateSarthi - Vendor Item Assignment Controller
 */

let selectedVendorId = '';
let currentItems = [];

document.addEventListener('DOMContentLoaded', () => {
  Components.initAdminLayout('assignments');
  loadVendorsDropdown();
});

async function loadVendorsDropdown() {
  const select = document.getElementById('vendor-select');
  select.innerHTML = `<option value="">-- Select Vendor --</option>`;

  const res = await API.request('getVendors');
  if (res.success && Array.isArray(res.data)) {
    res.data.filter(v => v.status === 'ACTIVE').forEach(v => {
      select.innerHTML += `<option value="${v.vendorId}">${Utils.escapeHtml(v.vendorName)} (${v.vendorId})</option>`;
    });
  }
}

async function onVendorSelected() {
  const select = document.getElementById('vendor-select');
  selectedVendorId = select.value;

  const container = document.getElementById('assignment-items-container');
  const actionContainer = document.getElementById('assignment-actions');

  if (!selectedVendorId) {
    container.innerHTML = `
      <div class="text-center py-16 text-slate-400">
        <svg class="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
        <p class="font-medium text-sm">Please select a vendor above to manage item assignments.</p>
      </div>
    `;
    actionContainer.classList.add('hidden');
    return;
  }

  container.innerHTML = `
    <div class="text-center py-12 text-slate-400">
      <svg class="animate-spin w-6 h-6 mx-auto mb-2 text-blue-600" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      <span>Loading vendor item mapping...</span>
    </div>
  `;

  const res = await API.request('getAssignments', { vendorId: selectedVendorId });
  if (res.success && Array.isArray(res.data)) {
    currentItems = res.data;
    renderAssignmentList(currentItems);
    actionContainer.classList.remove('hidden');
  } else {
    container.innerHTML = `<div class="text-center py-8 text-rose-500 font-medium">${Utils.escapeHtml(res.message)}</div>`;
    actionContainer.classList.add('hidden');
  }
}

function renderAssignmentList(items) {
  const container = document.getElementById('assignment-items-container');
  if (items.length === 0) {
    container.innerHTML = `<div class="text-center py-12 text-slate-400">No active items in master database. Add items in Items Master first.</div>`;
    return;
  }

  // Group items by category
  const categoriesMap = new Map();
  items.forEach(item => {
    const catName = item.categoryName || 'General';
    if (!categoriesMap.has(catName)) categoriesMap.set(catName, []);
    categoriesMap.get(catName).push(item);
  });

  let html = '';
  categoriesMap.forEach((catItems, catName) => {
    html += `
      <div class="mb-6 bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
        <div class="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
          <h4 class="font-bold text-slate-800 text-sm tracking-tight">${Utils.escapeHtml(catName)}</h4>
          <button onclick="toggleCategoryAll('${Utils.escapeHtml(catName)}')" class="text-xs text-blue-600 font-semibold hover:text-blue-700">Toggle Category</button>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          ${catItems.map(item => `
            <label class="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200 cursor-pointer hover:border-blue-400 transition-colors select-none">
              <input type="checkbox" value="${item.itemId}" data-category="${Utils.escapeHtml(catName)}" class="item-checkbox mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" ${item.isAssigned ? 'checked' : ''}>
              <div class="flex-1 min-w-0">
                <div class="font-bold text-slate-900 text-xs truncate">${Utils.escapeHtml(item.itemName)}</div>
                <div class="text-[11px] text-slate-400 font-mono">${Utils.escapeHtml(item.unit)} — ${Utils.escapeHtml(item.specification || 'No spec')}</div>
              </div>
            </label>
          `).join('')}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  updateSelectedCounter();

  // Attach change event listeners to checkboxes
  document.querySelectorAll('.item-checkbox').forEach(cb => {
    cb.addEventListener('change', updateSelectedCounter);
  });
}

function updateSelectedCounter() {
  const checked = document.querySelectorAll('.item-checkbox:checked').length;
  const total = document.querySelectorAll('.item-checkbox').length;
  document.getElementById('selected-count-badge').textContent = `${checked} / ${total} Items Selected`;
}

function toggleCategoryAll(catName) {
  const checkboxes = document.querySelectorAll(`.item-checkbox[data-category="${catName}"]`);
  const anyUnchecked = Array.from(checkboxes).some(cb => !cb.checked);
  checkboxes.forEach(cb => cb.checked = anyUnchecked);
  updateSelectedCounter();
}

function selectAllItems() {
  document.querySelectorAll('.item-checkbox').forEach(cb => cb.checked = true);
  updateSelectedCounter();
}

function deselectAllItems() {
  document.querySelectorAll('.item-checkbox').forEach(cb => cb.checked = false);
  updateSelectedCounter();
}

async function saveAssignmentsSubmit() {
  if (!selectedVendorId) return;

  const checkedItemIds = Array.from(document.querySelectorAll('.item-checkbox:checked')).map(cb => cb.value);

  const btn = document.getElementById('btn-save-assignments');
  btn.disabled = true;
  btn.innerHTML = `<svg class="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> <span>Saving...</span>`;

  const res = await API.request('saveAssignments', {
    vendorId: selectedVendorId,
    itemIds: checkedItemIds
  });

  btn.disabled = false;
  btn.innerHTML = `<span>Save Assignments</span>`;

  if (res.success) {
    Utils.showToast('Vendor item assignments updated successfully!', 'success');
  } else {
    Utils.showToast(res.message || 'Failed to save assignments', 'error');
  }
}
