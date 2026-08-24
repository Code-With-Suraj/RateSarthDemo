/**
 * RateSarthi - Vendor Master Management UI Controller
 */

let vendorsData = [];

document.addEventListener('DOMContentLoaded', () => {
  Components.initAdminLayout('vendors');
  loadVendors();
});

async function loadVendors() {
  const tableBody = document.getElementById('vendors-table-body');
  tableBody.innerHTML = `
    <tr>
      <td colspan="7" class="px-6 py-12 text-center text-slate-400">
        <svg class="animate-spin w-6 h-6 mx-auto mb-2 text-blue-600" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <span>Loading vendors...</span>
      </td>
    </tr>
  `;

  const res = await API.request('getVendors');
  if (res.success && Array.isArray(res.data)) {
    vendorsData = res.data;
    renderVendorsTable(vendorsData);
  } else {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" class="px-6 py-8 text-center text-rose-500 font-medium">
          Failed to load vendors: ${Utils.escapeHtml(res.message)}
        </td>
      </tr>
    `;
  }
}

function renderVendorsTable(vendors) {
  const tableBody = document.getElementById('vendors-table-body');
  if (vendors.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" class="px-6 py-12 text-center text-slate-400">
          No vendors found. Click <strong>Add New Vendor</strong> to register vendors.
        </td>
      </tr>
    `;
    return;
  }

  const currentOrigin = window.location.origin + window.location.pathname.replace('/admin/vendors.html', '');

  tableBody.innerHTML = vendors.map(v => {
    const portalUrl = `${currentOrigin}/vendor/portal.html?t=${v.portalToken}`;
    const safeVendorName = Utils.escapeHtml(v.vendorName).replace(/'/g, "\\'");
    return `
      <tr class="hover:bg-slate-50/80 transition-colors border-b border-slate-100">
        <td class="px-6 py-4 text-xs font-mono font-bold text-slate-700">${v.vendorId}</td>
        <td class="px-6 py-4">
          <div class="font-bold text-slate-900 text-sm">${Utils.escapeHtml(v.vendorName)}</div>
          <div class="text-xs text-slate-400">${Utils.escapeHtml(v.category || 'General')}</div>
        </td>
        <td class="px-6 py-4 text-xs">
          <div class="font-medium text-slate-800">${Utils.escapeHtml(v.contactPerson)}</div>
          <div class="text-slate-400 font-mono">${Utils.escapeHtml(v.phone)}</div>
          <div class="text-slate-400">${Utils.escapeHtml(v.email)}</div>
        </td>
        <td class="px-6 py-4 text-xs text-center font-semibold text-slate-700">
          ${v.assignedItems} Items
        </td>
        <td class="px-6 py-4 text-xs text-center font-bold text-emerald-600">
          ${v.responseRate}
        </td>
        <td class="px-6 py-4 text-center">
          ${Utils.renderBadge(v.status)}
        </td>
        <td class="px-6 py-4 text-right space-x-1.5 whitespace-nowrap">
          <button onclick="Utils.shareVendorWhatsApp('${v.phone}', '${safeVendorName}', '${portalUrl}')" title="Share Portal Link via WhatsApp Deep Link" class="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors text-xs font-semibold inline-flex items-center gap-1 border border-emerald-200">
            <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l.999 1.595-1.052 3.841 3.796-.995.999.626z"/></svg>
            <span>WhatsApp</span>
          </button>
          <button onclick="copyVendorPortalLink('${portalUrl}')" title="Copy Portal Link" class="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-xs font-semibold inline-flex items-center gap-1 border border-blue-200">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
            <span>Copy</span>
          </button>
          <button onclick="openEditVendorModal('${v.vendorId}')" title="Edit Vendor" class="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function filterVendors() {
  const query = document.getElementById('search-vendor').value.toLowerCase();
  const filtered = vendorsData.filter(v => 
    v.vendorName.toLowerCase().includes(query) ||
    v.contactPerson.toLowerCase().includes(query) ||
    v.email.toLowerCase().includes(query) ||
    v.vendorId.toLowerCase().includes(query)
  );
  renderVendorsTable(filtered);
}

function copyVendorPortalLink(url) {
  navigator.clipboard.writeText(url).then(() => {
    Utils.showToast('Vendor portal link copied to clipboard!', 'success');
  }).catch(() => {
    prompt('Copy portal link:', url);
  });
}

function openAddVendorModal() {
  document.getElementById('vendor-modal-title').textContent = 'Add New Vendor';
  document.getElementById('vendor-id').value = '';
  document.getElementById('vendor-name').value = '';
  document.getElementById('contact-person').value = '';
  document.getElementById('phone').value = '';
  document.getElementById('email').value = '';
  document.getElementById('category').value = 'Grocery';
  document.getElementById('status').value = 'ACTIVE';
  document.getElementById('vendor-modal').classList.remove('hidden');
}

function openEditVendorModal(vendorId) {
  const vendor = vendorsData.find(v => v.vendorId === vendorId);
  if (!vendor) return;

  document.getElementById('vendor-modal-title').textContent = `Edit Vendor — ${vendor.vendorId}`;
  document.getElementById('vendor-id').value = vendor.vendorId;
  document.getElementById('vendor-name').value = vendor.vendorName;
  document.getElementById('contact-person').value = vendor.contactPerson;
  document.getElementById('phone').value = vendor.phone;
  document.getElementById('email').value = vendor.email;
  document.getElementById('category').value = vendor.category || 'Grocery';
  document.getElementById('status').value = vendor.status || 'ACTIVE';
  document.getElementById('vendor-modal').classList.remove('hidden');
}

function closeVendorModal() {
  document.getElementById('vendor-modal').classList.add('hidden');
}

async function saveVendor(e) {
  e.preventDefault();
  const vendorId = document.getElementById('vendor-id').value;
  const payload = {
    vendorId: vendorId,
    vendorName: document.getElementById('vendor-name').value.trim(),
    contactPerson: document.getElementById('contact-person').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    email: document.getElementById('email').value.trim(),
    category: document.getElementById('category').value.trim(),
    status: document.getElementById('status').value
  };

  const action = vendorId ? 'updateVendor' : 'createVendor';
  const res = await API.request(action, payload);

  if (res.success) {
    Utils.showToast(vendorId ? 'Vendor updated successfully' : 'Vendor created successfully', 'success');
    closeVendorModal();
    loadVendors();
  } else {
    Utils.showToast(res.message || 'Failed to save vendor', 'error');
  }
}
