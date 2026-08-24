/**
 * RateSarthi - Multi-Step Rate Request Creation Wizard
 */

let currentStep = 1;
let categoriesList = [];
let allItems = [];
let allVendors = [];
let vendorItemMappings = [];

document.addEventListener('DOMContentLoaded', () => {
  Components.initAdminLayout('requests');
  initWizardData();
});

async function initWizardData() {
  // Set default due date to 7 days from now
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  document.getElementById('due-date').value = nextWeek.toISOString().split('T')[0];

  // Load Categories
  const catRes = await API.request('getCategories');
  if (catRes.success && Array.isArray(catRes.data)) {
    categoriesList = catRes.data.filter(c => c.status === 'ACTIVE');
    const catSelect = document.getElementById('request-category');
    catSelect.innerHTML = categoriesList.map(c => `<option value="${c.categoryId}">${Utils.escapeHtml(c.categoryName)}</option>`).join('');
  }

  // Load Items
  const itemsRes = await API.request('getItems');
  if (itemsRes.success && Array.isArray(itemsRes.data)) {
    allItems = itemsRes.data.filter(i => i.status === 'ACTIVE');
  }

  // Load Vendors
  const vendorsRes = await API.request('getVendors');
  if (vendorsRes.success && Array.isArray(vendorsRes.data)) {
    allVendors = vendorsRes.data.filter(v => v.status === 'ACTIVE');
  }
}

function goToStep(step) {
  if (step > currentStep) {
    // Validate current step before advancing
    if (currentStep === 1) {
      const title = document.getElementById('request-title').value.trim();
      const dueDate = document.getElementById('due-date').value;
      if (!title || !dueDate) {
        Utils.showToast('Please enter Request Title and Due Date', 'warning');
        return;
      }
      renderStep2Items();
    } else if (currentStep === 2) {
      const selectedItems = getSelectedCheckboxes('item-select-cb');
      if (selectedItems.length === 0) {
        Utils.showToast('Please select at least one item', 'warning');
        return;
      }
      renderStep3Vendors();
    } else if (currentStep === 3) {
      const selectedVendors = getSelectedCheckboxes('vendor-select-cb');
      if (selectedVendors.length === 0) {
        Utils.showToast('Please select at least one vendor', 'warning');
        return;
      }
      renderStep4Preview();
    }
  }

  currentStep = step;
  updateWizardUI();
}

function updateWizardUI() {
  // Hide all step panels
  for (let i = 1; i <= 4; i++) {
    const panel = document.getElementById(`wizard-step-${i}`);
    const indicator = document.getElementById(`step-indicator-${i}`);
    if (panel) panel.classList.add('hidden');
    if (indicator) {
      if (i === currentStep) {
        indicator.className = 'w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-md shadow-blue-500/30';
      } else if (i < currentStep) {
        indicator.className = 'w-8 h-8 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center';
      } else {
        indicator.className = 'w-8 h-8 rounded-full bg-slate-200 text-slate-500 font-bold text-xs flex items-center justify-center';
      }
    }
  }

  const currentPanel = document.getElementById(`wizard-step-${currentStep}`);
  if (currentPanel) currentPanel.classList.remove('hidden');

  // Button visibility
  document.getElementById('btn-prev').classList.toggle('hidden', currentStep === 1);
  document.getElementById('btn-next').classList.toggle('hidden', currentStep === 4);
  document.getElementById('btn-submit-request').classList.toggle('hidden', currentStep !== 4);
}

function renderStep2Items() {
  const selectedCatId = document.getElementById('request-category').value;
  const filteredItems = selectedCatId ? allItems.filter(i => String(i.categoryId) === String(selectedCatId)) : allItems;
  const container = document.getElementById('step-2-items-list');

  if (filteredItems.length === 0) {
    container.innerHTML = `<div class="text-center py-8 text-slate-400">No active items in this category.</div>`;
    return;
  }

  container.innerHTML = filteredItems.map(item => `
    <label class="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-white hover:border-blue-400 cursor-pointer select-none">
      <input type="checkbox" value="${item.itemId}" class="item-select-cb mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" checked>
      <div class="flex-1 min-w-0">
        <div class="font-bold text-slate-900 text-xs truncate">${Utils.escapeHtml(item.itemName)}</div>
        <div class="text-[11px] text-slate-400 font-mono">${Utils.escapeHtml(item.unit)} • ${Utils.escapeHtml(item.specification || 'No spec')}</div>
      </div>
    </label>
  `).join('');
}

function selectAllWizardItems(select) {
  document.querySelectorAll('.item-select-cb').forEach(cb => cb.checked = select);
}

function renderStep3Vendors() {
  const container = document.getElementById('step-3-vendors-list');
  if (allVendors.length === 0) {
    container.innerHTML = `<div class="text-center py-8 text-slate-400">No active vendors found.</div>`;
    return;
  }

  container.innerHTML = allVendors.map(v => `
    <label class="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-white hover:border-blue-400 cursor-pointer select-none">
      <input type="checkbox" value="${v.vendorId}" class="vendor-select-cb mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" checked>
      <div class="flex-1 min-w-0">
        <div class="font-bold text-slate-900 text-xs truncate">${Utils.escapeHtml(v.vendorName)}</div>
        <div class="text-[11px] text-slate-400">${Utils.escapeHtml(v.contactPerson)} • ${Utils.escapeHtml(v.phone)}</div>
      </div>
    </label>
  `).join('');
}

function selectAllWizardVendors(select) {
  document.querySelectorAll('.vendor-select-cb').forEach(cb => cb.checked = select);
}

function getSelectedCheckboxes(className) {
  return Array.from(document.querySelectorAll(`.${className}:checked`)).map(cb => cb.value);
}

function renderStep4Preview() {
  const title = document.getElementById('request-title').value.trim();
  const categoryId = document.getElementById('request-category').value;
  const categoryObj = categoriesList.find(c => String(c.categoryId) === String(categoryId));
  const dueDate = document.getElementById('due-date').value;

  const itemIds = getSelectedCheckboxes('item-select-cb');
  const vendorIds = getSelectedCheckboxes('vendor-select-cb');

  document.getElementById('preview-title').textContent = title;
  document.getElementById('preview-category').textContent = categoryObj ? categoryObj.categoryName : 'General';
  document.getElementById('preview-due-date').textContent = Utils.formatDate(dueDate);
  document.getElementById('preview-item-count').textContent = `${itemIds.length} Items`;
  document.getElementById('preview-vendor-count').textContent = `${vendorIds.length} Vendors`;
  document.getElementById('preview-estimated-combos').textContent = `Max ${itemIds.length * vendorIds.length} Combinations`;
}

async function submitRateRequestWizard() {
  const title = document.getElementById('request-title').value.trim();
  const categoryId = document.getElementById('request-category').value;
  const dueDate = document.getElementById('due-date').value;
  const itemIds = getSelectedCheckboxes('item-select-cb');
  const vendorIds = getSelectedCheckboxes('vendor-select-cb');

  const btn = document.getElementById('btn-submit-request');
  btn.disabled = true;
  btn.innerHTML = `<svg class="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> <span>Creating Request...</span>`;

  const res = await API.request('createRateRequest', {
    requestTitle: title,
    categoryId: categoryId,
    dueDate: dueDate,
    itemIds: itemIds,
    vendorIds: vendorIds
  });

  btn.disabled = false;
  btn.innerHTML = `<span>Publish Request</span>`;

  if (res.success) {
    Utils.showToast('Rate Request published successfully!', 'success');
    setTimeout(() => {
      window.location.href = 'requests.html';
    }, 600);
  } else {
    Utils.showToast(res.message || 'Failed to create rate request', 'error');
  }
}
