/**
 * RateSarthi - Categories UI Controller
 */

let categoriesData = [];

document.addEventListener('DOMContentLoaded', () => {
  Components.initAdminLayout('categories');
  loadCategories();
});

async function loadCategories() {
  const container = document.getElementById('categories-grid');
  container.innerHTML = `
    <div class="col-span-full text-center py-12 text-slate-400">
      <svg class="animate-spin w-6 h-6 mx-auto mb-2 text-blue-600" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      <span>Loading categories...</span>
    </div>
  `;

  const res = await API.request('getCategories');
  if (res.success && Array.isArray(res.data)) {
    categoriesData = res.data;
    renderCategories(categoriesData);
  } else {
    container.innerHTML = `<div class="col-span-full text-center py-8 text-rose-500 font-medium">${Utils.escapeHtml(res.message)}</div>`;
  }
}

function renderCategories(categories) {
  const container = document.getElementById('categories-grid');
  if (categories.length === 0) {
    container.innerHTML = `<div class="col-span-full text-center py-12 text-slate-400">No categories found. Click Add Category to create one.</div>`;
    return;
  }

  container.innerHTML = categories.map(c => `
    <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div class="flex items-start justify-between mb-3">
        <div>
          <span class="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider">${c.categoryId}</span>
          <h4 class="font-bold text-slate-900 text-base leading-tight">${Utils.escapeHtml(c.categoryName)}</h4>
        </div>
        ${Utils.renderBadge(c.status)}
      </div>

      <p class="text-xs text-slate-500 min-h-[36px] mb-4">${Utils.escapeHtml(c.description || 'No description provided.')}</p>

      <div class="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
        <span class="font-semibold text-slate-700">${c.itemCount} Items</span>
        <button onclick="openEditCategoryModal('${c.categoryId}')" class="text-blue-600 font-semibold hover:text-blue-700">Edit</button>
      </div>
    </div>
  `).join('');
}

function openAddCategoryModal() {
  document.getElementById('category-id').value = '';
  document.getElementById('category-name').value = '';
  document.getElementById('category-desc').value = '';
  document.getElementById('category-status').value = 'ACTIVE';
  document.getElementById('category-modal').classList.remove('hidden');
}

function openEditCategoryModal(catId) {
  const cat = categoriesData.find(c => c.categoryId === catId);
  if (!cat) return;
  document.getElementById('category-id').value = cat.categoryId;
  document.getElementById('category-name').value = cat.categoryName;
  document.getElementById('category-desc').value = cat.description || '';
  document.getElementById('category-status').value = cat.status || 'ACTIVE';
  document.getElementById('category-modal').classList.remove('hidden');
}

function closeCategoryModal() {
  document.getElementById('category-modal').classList.add('hidden');
}

async function saveCategory(e) {
  e.preventDefault();
  const catId = document.getElementById('category-id').value;
  const payload = {
    categoryId: catId,
    categoryName: document.getElementById('category-name').value.trim(),
    description: document.getElementById('category-desc').value.trim(),
    status: document.getElementById('category-status').value
  };

  const action = catId ? 'updateCategory' : 'createCategory';
  const res = await API.request(action, payload);

  if (res.success) {
    Utils.showToast(catId ? 'Category updated' : 'Category created', 'success');
    closeCategoryModal();
    loadCategories();
  } else {
    Utils.showToast(res.message || 'Failed to save category', 'error');
  }
}
