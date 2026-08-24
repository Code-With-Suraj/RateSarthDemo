/**
 * RateSarthi - Items Master UI Controller
 */

let itemsData = [];
let categoriesList = [];

document.addEventListener('DOMContentLoaded', () => {
  Components.initAdminLayout('items');
  loadCategoriesSelect();
  loadItems();
});

async function loadCategoriesSelect() {
  const res = await API.request('getCategories');
  if (res.success && Array.isArray(res.data)) {
    categoriesList = res.data;
    const filterSelect = document.getElementById('category-filter');
    const modalSelect = document.getElementById('item-category');

    filterSelect.innerHTML = `<option value="">All Categories</option>` + categoriesList.map(c => `<option value="${c.categoryId}">${Utils.escapeHtml(c.categoryName)}</option>`).join('');
    modalSelect.innerHTML = categoriesList.map(c => `<option value="${c.categoryId}">${Utils.escapeHtml(c.categoryName)}</option>`).join('');
  }
}

async function loadItems() {
  const tableBody = document.getElementById('items-table-body');
  const catFilter = document.getElementById('category-filter').value;

  tableBody.innerHTML = `
    <tr>
      <td colspan="7" class="px-6 py-12 text-center text-slate-400">
        <svg class="animate-spin w-6 h-6 mx-auto mb-2 text-blue-600" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <span>Loading items...</span>
      </td>
    </tr>
  `;

  const res = await API.request('getItems', { categoryId: catFilter });
  if (res.success && Array.isArray(res.data)) {
    itemsData = res.data;
    renderItemsTable(itemsData);
  } else {
    tableBody.innerHTML = `<tr><td colspan="7" class="px-6 py-8 text-center text-rose-500">${Utils.escapeHtml(res.message)}</td></tr>`;
  }
}

function renderItemsTable(items) {
  const tableBody = document.getElementById('items-table-body');
  if (items.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="7" class="px-6 py-12 text-center text-slate-400">No items found. Click Add New Item to add items.</td></tr>`;
    return;
  }

  tableBody.innerHTML = items.map(item => `
    <tr class="hover:bg-slate-50/80 transition-colors border-b border-slate-100">
      <td class="px-6 py-4 text-xs font-mono font-bold text-slate-700">${item.itemId}</td>
      <td class="px-6 py-4">
        <div class="font-bold text-slate-900 text-sm">${Utils.escapeHtml(item.itemName)}</div>
        <div class="text-xs text-slate-400">${Utils.escapeHtml(item.specification || 'No spec')}</div>
      </td>
      <td class="px-6 py-4 text-xs font-medium text-slate-700">
        <span class="inline-block px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200">${Utils.escapeHtml(item.categoryName)}</span>
      </td>
      <td class="px-6 py-4 text-xs font-mono font-bold text-slate-700">${Utils.escapeHtml(item.unit)}</td>
      <td class="px-6 py-4 text-xs text-center font-semibold text-slate-700">
        ${item.assignedVendorsCount} Vendors
      </td>
      <td class="px-6 py-4 text-center">
        ${Utils.renderBadge(item.status)}
      </td>
      <td class="px-6 py-4 text-right">
        <button onclick="openEditItemModal('${item.itemId}')" class="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
        </button>
      </td>
    </tr>
  `).join('');
}

function filterItems() {
  const query = document.getElementById('search-item').value.toLowerCase();
  const filtered = itemsData.filter(i => 
    i.itemName.toLowerCase().includes(query) ||
    i.itemId.toLowerCase().includes(query) ||
    (i.specification && i.specification.toLowerCase().includes(query))
  );
  renderItemsTable(filtered);
}

function openAddItemModal() {
  document.getElementById('item-id').value = '';
  document.getElementById('item-name').value = '';
  document.getElementById('item-unit').value = 'Kg';
  document.getElementById('item-spec').value = '';
  document.getElementById('item-status').value = 'ACTIVE';
  document.getElementById('item-modal').classList.remove('hidden');
}

function openEditItemModal(itemId) {
  const item = itemsData.find(i => i.itemId === itemId);
  if (!item) return;

  document.getElementById('item-id').value = item.itemId;
  document.getElementById('item-name').value = item.itemName;
  document.getElementById('item-category').value = item.categoryId;
  document.getElementById('item-unit').value = item.unit;
  document.getElementById('item-spec').value = item.specification || '';
  document.getElementById('item-status').value = item.status || 'ACTIVE';
  document.getElementById('item-modal').classList.remove('hidden');
}

function closeItemModal() {
  document.getElementById('item-modal').classList.add('hidden');
}

async function saveItem(e) {
  e.preventDefault();
  const itemId = document.getElementById('item-id').value;
  const payload = {
    itemId: itemId,
    itemName: document.getElementById('item-name').value.trim(),
    categoryId: document.getElementById('item-category').value,
    unit: document.getElementById('item-unit').value.trim(),
    specification: document.getElementById('item-spec').value.trim(),
    status: document.getElementById('item-status').value
  };

  const action = itemId ? 'updateItem' : 'createItem';
  const res = await API.request(action, payload);

  if (res.success) {
    Utils.showToast(itemId ? 'Item updated successfully' : 'Item created successfully', 'success');
    closeItemModal();
    loadItems();
  } else {
    Utils.showToast(res.message || 'Failed to save item', 'error');
  }
}
