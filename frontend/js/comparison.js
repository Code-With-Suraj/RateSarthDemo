/**
 * RateSarthi — Professional Vendor Rate Comparison & Procurement Decision Suite
 */

let currentRequestId = '';
let comparisonData = null;
let currentView = 'matrix'; // 'matrix' | 'scenarios' | 'scorecards' | 'analytics'

document.addEventListener('DOMContentLoaded', () => {
  Components.initAdminLayout('requests');

  const urlParams = new URLSearchParams(window.location.search);
  currentRequestId = urlParams.get('id') || urlParams.get('requestId') || 'REQ001';

  loadComparisonData();
});

async function loadComparisonData() {
  const container = document.getElementById('comparison-view-container');
  container.innerHTML = `
    <div class="text-center py-20 text-slate-400">
      <svg class="animate-spin w-10 h-10 mx-auto mb-3 text-blue-600" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p class="font-bold text-slate-700 text-sm">Calculating Rate Comparison Matrix & L1 Rankings...</p>
      <p class="text-xs text-slate-400 mt-1">Evaluating vendor basket totals and potential savings</p>
    </div>
  `;

  const res = await API.request('getComparison', { requestId: currentRequestId });
  if (res.success && res.data) {
    comparisonData = res.data;
    renderComparisonDashboard(comparisonData);
  } else {
    container.innerHTML = `
      <div class="text-center py-12 text-rose-500 font-semibold text-sm">
        <svg class="w-12 h-12 mx-auto mb-2 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        <span>${Utils.escapeHtml(res.message || 'Failed to load comparison data')}</span>
      </div>
    `;
  }
}

function renderComparisonDashboard(data) {
  const req = data.request;
  const summary = data.summary;
  const scenarios = data.awardScenarios;

  // Render Header Details
  document.getElementById('comparison-title').textContent = req.RequestTitle || 'Rate Comparison';
  if (document.getElementById('print-request-title')) {
    document.getElementById('print-request-title').textContent = `Request ID: ${req.RequestID || currentRequestId} — ${req.RequestTitle}`;
  }
  if (document.getElementById('print-date')) {
    document.getElementById('print-date').textContent = Utils.formatDate(new Date());
  }

  document.getElementById('req-category').textContent = req.CategoryID || 'General';
  document.getElementById('req-due-date').textContent = req.DueDate ? Utils.formatDate(req.DueDate) : 'No due date';
  document.getElementById('req-creator').textContent = req.CreatedBy || 'Manager';

  const statusBadge = document.getElementById('req-status-badge');
  if (statusBadge) {
    statusBadge.textContent = req.Status || 'SENT';
    statusBadge.className = `badge badge-${(req.Status || 'sent').toLowerCase()}`;
  }

  // Render KPI Cards
  document.getElementById('kpi-total-items').textContent = summary.totalItems || 0;
  
  const responsePct = summary.totalVendors > 0 && data.vendors.length > 0 
    ? Math.round((data.vendors.length / summary.totalVendors) * 100) 
    : 100;
  document.getElementById('kpi-response-rate').textContent = `${responsePct}% Coverage`;
  document.getElementById('kpi-vendors-count').textContent = `${summary.totalVendors} Vendor${summary.totalVendors !== 1 ? 's' : ''}`;

  document.getElementById('kpi-lowest-sum').textContent = Utils.formatCurrency(summary.totalLowestSum);

  // Single Vendor Winner KPI
  if (scenarios && scenarios.singleVendorWinner) {
    const sw = scenarios.singleVendorWinner;
    document.getElementById('kpi-single-winner-name').textContent = sw.vendorName;
    document.getElementById('kpi-single-winner-cost').textContent = Utils.formatCurrency(sw.basketSum);
    document.getElementById('kpi-single-winner-delta').textContent = `+${Utils.formatCurrency(sw.deltaCostVsSplit)} (+${sw.deltaCostPct}%)`;
  } else {
    document.getElementById('kpi-single-winner-name').textContent = 'No Full Basket';
    document.getElementById('kpi-single-winner-cost').textContent = '—';
    document.getElementById('kpi-single-winner-delta').textContent = '—';
  }

  // Potential Savings KPI
  document.getElementById('kpi-savings').textContent = Utils.formatCurrency(summary.potentialSavings);
  document.getElementById('kpi-savings-pct').textContent = `${summary.potentialSavingsPercentage || 0}% Savings`;

  // Render Current Active View
  renderActiveView();
}

function switchView(viewName) {
  currentView = viewName;

  // Toggle Tab Button Classes
  ['matrix', 'scenarios', 'scorecards', 'analytics'].forEach(v => {
    const btn = document.getElementById(`tab-${v}`);
    if (btn) {
      if (v === viewName) {
        btn.className = 'px-4 py-3 text-xs font-bold border-b-2 border-blue-600 text-blue-600 flex items-center gap-2 transition-colors';
      } else {
        btn.className = 'px-4 py-3 text-xs font-bold border-b-2 border-transparent text-slate-500 hover:text-slate-800 flex items-center gap-2 transition-colors';
      }
    }
  });

  // Toggle Matrix Toolbar Controls
  const matrixControls = document.getElementById('matrix-toolbar-controls');
  if (matrixControls) {
    matrixControls.style.display = viewName === 'matrix' ? 'flex' : 'none';
  }

  renderActiveView();
}

function renderActiveView() {
  if (!comparisonData) return;

  switch (currentView) {
    case 'matrix':
      renderMatrixView();
      break;
    case 'scenarios':
      renderScenariosView();
      break;
    case 'scorecards':
      renderScorecardsView();
      break;
    case 'analytics':
      renderAnalyticsView();
      break;
    default:
      renderMatrixView();
  }
}

/* ==========================================================================
   VIEW 1: INTERACTIVE MATRIX GRID VIEW
   ========================================================================== */
function renderMatrixView() {
  const container = document.getElementById('comparison-view-container');
  if (!comparisonData || !comparisonData.matrix) return;

  const vendors = comparisonData.vendors;
  let matrix = comparisonData.matrix;

  // Apply Search & Variance Filters
  const searchTxt = (document.getElementById('search-input')?.value || '').toLowerCase().trim();
  const varianceFilter = document.getElementById('variance-filter')?.value || 'all';

  if (searchTxt) {
    matrix = matrix.filter(row => 
      row.itemName.toLowerCase().includes(searchTxt) || 
      (row.specification && row.specification.toLowerCase().includes(searchTxt))
    );
  }

  if (varianceFilter === 'high-variance') {
    matrix = matrix.filter(row => row.differencePercentage >= 15);
  } else if (varianceFilter === 'multi-quote') {
    matrix = matrix.filter(row => row.validQuotesCount > 1);
  }

  if (matrix.length === 0) {
    container.innerHTML = `
      <div class="text-center py-16 text-slate-400">
        <svg class="w-10 h-10 mx-auto mb-2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        <p class="font-bold text-slate-700 text-sm">No items match the current filter criteria.</p>
        <p class="text-xs text-slate-400 mt-1">Try searching for another term or reset variance filter.</p>
      </div>
    `;
    return;
  }

  // Dynamic Table Headers
  const vendorHeadersHtml = vendors.map(v => `
    <th class="px-4 py-3.5 text-center min-w-[130px] border-x border-slate-200/60 bg-slate-50/80">
      <div class="font-bold text-slate-900 text-xs">${Utils.escapeHtml(v.vendorName)}</div>
      <div class="text-[10px] text-slate-400 font-normal mt-0.5">${Utils.escapeHtml(v.contactPerson || v.phone || 'Vendor')}</div>
    </th>
  `).join('');

  // Table Body Rows
  const rowsHtml = matrix.map(row => {
    const vendorRateCells = vendors.map(v => {
      const rateObj = row.vendorRates[v.vendorId];
      if (!rateObj || rateObj.rate === null || rateObj.rate === undefined) {
        return `<td class="px-4 py-3 text-center text-slate-300 font-mono text-xs border-x border-slate-100">—</td>`;
      }

      // Rank styling
      let cellStyleClass = 'text-slate-800 font-medium';
      let rankBadgeHtml = '';

      if (rateObj.rank === 1) {
        cellStyleClass = 'rate-cell-l1';
        rankBadgeHtml = `<span class="inline-block px-1.5 py-0.2 text-[9px] font-extrabold bg-emerald-600 text-white rounded">👑 L1</span>`;
      } else if (rateObj.rank === 2) {
        cellStyleClass = 'rate-cell-l2';
        rankBadgeHtml = `<span class="inline-block px-1.5 py-0.2 text-[9px] font-bold bg-green-200 text-green-800 rounded">L2</span>`;
      } else if (rateObj.rank === 3) {
        cellStyleClass = 'rate-cell-l3';
        rankBadgeHtml = `<span class="inline-block px-1.5 py-0.2 text-[9px] font-bold bg-amber-100 text-amber-800 rounded">L3</span>`;
      } else if (row.highestRate !== null && rateObj.rate === row.highestRate && row.validQuotesCount > 2) {
        cellStyleClass = 'rate-cell-highest';
      }

      return `
        <td onclick="openQuoteModal('${row.itemId}', '${v.vendorId}')" title="Click to view quote details" class="px-4 py-3 text-center font-mono text-xs border-x border-slate-100 cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all ${cellStyleClass}">
          <div class="flex items-center justify-center gap-1.5">
            <span class="font-bold">${Utils.formatCurrency(rateObj.rate)}</span>
            ${rankBadgeHtml}
          </div>
          ${rateObj.brand ? `<div class="text-[10px] text-slate-500 font-sans mt-0.5 truncate max-w-[120px] mx-auto">${Utils.escapeHtml(rateObj.brand)}</div>` : ''}
          ${rateObj.varianceVsL1 > 0 ? `<div class="text-[9px] text-amber-700 font-semibold font-sans">+${rateObj.varianceVsL1}%</div>` : ''}
        </td>
      `;
    }).join('');

    return `
      <tr class="hover:bg-slate-50/80 transition-colors border-b border-slate-100">
        <td class="px-6 py-4">
          <div class="font-bold text-slate-900 text-xs">${Utils.escapeHtml(row.itemName)}</div>
          <div class="text-[11px] text-slate-400 mt-0.5">${Utils.escapeHtml(row.specification || 'Standard')}</div>
        </td>
        <td class="px-4 py-4 text-xs font-mono text-slate-600 font-semibold">${Utils.escapeHtml(row.unit)}</td>
        ${vendorRateCells}
        <td class="px-4 py-4 text-center font-mono font-extrabold text-emerald-700 bg-emerald-50/70 text-xs border-l border-emerald-200">
          <div>${Utils.formatCurrency(row.lowestRate)}</div>
        </td>
        <td class="px-4 py-4 text-center font-mono text-slate-500 text-xs">${Utils.formatCurrency(row.highestRate)}</td>
        <td class="px-4 py-4 text-center font-mono text-xs">
          ${row.differencePercentage > 0 
            ? `<span class="px-2 py-0.5 rounded-full ${row.differencePercentage >= 15 ? 'bg-amber-100 text-amber-800 font-bold' : 'bg-slate-100 text-slate-700'}">${row.differencePercentage}%</span>` 
            : '<span class="text-slate-300">—</span>'}
        </td>
        <td class="px-6 py-4 text-center">
          <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold shadow-xs">
            <svg class="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
            <span>${Utils.escapeHtml(row.bestVendorName || '—')}</span>
          </span>
        </td>
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-slate-100/90 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
            <th class="px-6 py-3.5 min-w-[200px]">Item & Specifications</th>
            <th class="px-4 py-3.5">Unit</th>
            ${vendorHeadersHtml}
            <th class="px-4 py-3.5 text-center bg-emerald-100/80 text-emerald-900 border-l border-emerald-300">Lowest (L1)</th>
            <th class="px-4 py-3.5 text-center text-slate-600">Highest</th>
            <th class="px-4 py-3.5 text-center text-slate-600">Spread %</th>
            <th class="px-6 py-3.5 text-center text-emerald-900">Recommended L1</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          ${rowsHtml}
        </tbody>
      </table>
    </div>
  `;
}

function applyMatrixFilters() {
  if (currentView === 'matrix') {
    renderMatrixView();
  }
}

/* ==========================================================================
   VIEW 2: SMART AWARD RECOMMENDATION SCENARIOS
   ========================================================================== */
function renderScenariosView() {
  const container = document.getElementById('comparison-view-container');
  if (!comparisonData || !comparisonData.awardScenarios) return;

  const scenarios = comparisonData.awardScenarios;
  const split = scenarios.splitVendor;
  const single = scenarios.singleVendorWinner;

  const allocationsHtml = split.allocations.map(alloc => `
    <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
            ${Utils.escapeHtml(alloc.vendorName.charAt(0))}
          </div>
          <div>
            <h5 class="font-bold text-slate-900 text-sm">${Utils.escapeHtml(alloc.vendorName)}</h5>
            <span class="text-[11px] text-slate-400 font-medium">${alloc.items.length} Awarded Item${alloc.items.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <div class="text-right">
          <span class="text-[10px] font-bold uppercase text-slate-400">Award Subtotal</span>
          <div class="text-lg font-bold text-emerald-700 font-mono">${Utils.formatCurrency(alloc.totalAmount)}</div>
        </div>
      </div>

      <div class="space-y-2">
        ${alloc.items.map(item => `
          <div class="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-slate-50">
            <span class="font-semibold text-slate-800">${Utils.escapeHtml(item.itemName)}</span>
            <div class="font-mono text-slate-700 font-bold">${Utils.formatCurrency(item.rate)} <span class="text-[10px] text-slate-400 font-normal">/ ${Utils.escapeHtml(item.unit)}</span></div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');

  container.innerHTML = `
    <div class="p-6 space-y-6">
      <!-- Scenario Heading -->
      <div>
        <h4 class="text-lg font-bold text-slate-900 tracking-tight">Smart Award Recommendation Engine</h4>
        <p class="text-xs text-slate-500 mt-0.5">Automated procurement strategy analysis comparing multi-vendor split ordering vs single-source contract.</p>
      </div>

      <!-- Side-by-side Strategy Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Strategy A: Split Vendor -->
        <div class="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-2xl p-6 relative">
          <span class="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold uppercase tracking-wider">MAX SAVINGS SCENARIO</span>
          <div class="text-xs font-bold text-emerald-800 uppercase tracking-wider">Strategy A — Split-Vendor Best-of-Breed</div>
          <h3 class="text-2xl font-extrabold text-emerald-900 font-mono mt-2">${Utils.formatCurrency(split.totalCost)}</h3>
          <p class="text-xs text-emerald-700 mt-1">Order each item individually from its lowest (L1) quoting vendor. Maximizes cost savings across all items.</p>

          <div class="mt-4 pt-4 border-t border-emerald-200/80 flex items-center justify-between text-xs font-semibold text-emerald-800">
            <span>Participating Winners: ${split.allocations.length} Vendors</span>
            <span>Total Items: ${comparisonData.summary.totalItems} Items</span>
          </div>
        </div>

        <!-- Strategy B: Single Vendor Winner -->
        <div class="bg-white border-2 border-slate-200 rounded-2xl p-6 relative">
          <span class="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider">SINGLE-SOURCE</span>
          <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">Strategy B — Single Vendor Basket Winner</div>
          <h3 class="text-2xl font-extrabold text-slate-900 font-mono mt-2">${single ? Utils.formatCurrency(single.basketSum) : 'N/A'}</h3>
          <p class="text-xs text-slate-500 mt-1">Award full basket contract to <strong>${single ? Utils.escapeHtml(single.vendorName) : 'N/A'}</strong> to simplify PO management & vendor logistics.</p>

          <div class="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span class="text-slate-500">Coverage: <strong>${single ? single.coveragePercentage : 0}%</strong></span>
            <span class="text-amber-700 font-bold">Cost Delta: +${single ? Utils.formatCurrency(single.deltaCostVsSplit) : '₹0'} (+${single ? single.deltaCostPct : 0}%)</span>
          </div>
        </div>
      </div>

      <!-- Split Vendor Item Allocations Breakdown -->
      <div>
        <h5 class="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
          <span>Recommended Split-Vendor Allocations (L1 Winners)</span>
        </h5>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          ${allocationsHtml}
        </div>
      </div>
    </div>
  `;
}

/* ==========================================================================
   VIEW 3: VENDOR SCORECARDS & RANKINGS
   ========================================================================== */
function renderScorecardsView() {
  const container = document.getElementById('comparison-view-container');
  if (!comparisonData || !comparisonData.vendorScorecards) return;

  const scorecards = comparisonData.vendorScorecards;

  const cardsHtml = scorecards.map(sc => `
    <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div class="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
        <div>
          <h4 class="font-bold text-slate-900 text-base">${Utils.escapeHtml(sc.vendorName)}</h4>
          <p class="text-xs text-slate-400 mt-0.5">${Utils.escapeHtml(sc.contactPerson || 'Vendor Contact')} • ${Utils.escapeHtml(sc.phone || '')}</p>
        </div>
        <div class="text-right">
          <span class="px-2.5 py-1 rounded-full text-xs font-extrabold ${sc.coveragePercentage >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
            ${sc.coveragePercentage}% Coverage
          </span>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4 mb-4 text-xs">
        <div class="bg-slate-50 p-3 rounded-xl">
          <span class="text-slate-400 font-medium uppercase text-[10px]">L1 Winner Count</span>
          <div class="text-xl font-extrabold text-emerald-600 font-mono mt-0.5">${sc.l1Count} Items</div>
        </div>
        <div class="bg-slate-50 p-3 rounded-xl">
          <span class="text-slate-400 font-medium uppercase text-[10px]">Total Quoted Basket</span>
          <div class="text-xl font-extrabold text-slate-900 font-mono mt-0.5">${Utils.formatCurrency(sc.basketSum)}</div>
        </div>
      </div>

      <div class="space-y-2 text-xs text-slate-600">
        <div class="flex items-center justify-between">
          <span>L2 Runner-up Count:</span>
          <strong class="text-slate-800 font-mono">${sc.l2Count} Items</strong>
        </div>
        <div class="flex items-center justify-between">
          <span>Items Quoted:</span>
          <strong class="text-slate-800 font-mono">${sc.totalQuotedItems} / ${sc.totalAssignedItems}</strong>
        </div>
        <div class="flex items-center justify-between">
          <span>Avg. Variance vs L1:</span>
          <strong class="text-amber-700 font-mono">+${sc.avgVarianceVsL1}%</strong>
        </div>
      </div>
    </div>
  `).join('');

  container.innerHTML = `
    <div class="p-6 space-y-4">
      <div>
        <h4 class="text-lg font-bold text-slate-900 tracking-tight">Vendor Performance Scorecards</h4>
        <p class="text-xs text-slate-500 mt-0.5">Comprehensive evaluation of item coverage, L1 win counts, and price competitiveness per vendor.</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        ${cardsHtml}
      </div>
    </div>
  `;
}

/* ==========================================================================
   VIEW 4: VISUAL PRICE ANALYTICS
   ========================================================================== */
function renderAnalyticsView() {
  const container = document.getElementById('comparison-view-container');
  if (!comparisonData) return;

  const scorecards = comparisonData.vendorScorecards;
  const matrix = comparisonData.matrix;

  // Max Basket Sum for scaling bars
  const maxBasket = Math.max(...scorecards.map(sc => sc.basketSum), 1);

  const vendorBarsHtml = scorecards.map(sc => {
    const barWidthPct = Math.min(Math.round((sc.basketSum / maxBasket) * 100), 100);
    return `
      <div class="space-y-1.5">
        <div class="flex items-center justify-between text-xs font-bold text-slate-800">
          <span>${Utils.escapeHtml(sc.vendorName)}</span>
          <span class="font-mono text-slate-900">${Utils.formatCurrency(sc.basketSum)} (${sc.l1Count} L1 Wins)</span>
        </div>
        <div class="w-full bg-slate-100 rounded-full h-4 overflow-hidden flex">
          <div class="bg-gradient-to-r from-blue-600 to-emerald-500 h-full rounded-full transition-all duration-500" style="width: ${barWidthPct}%"></div>
        </div>
      </div>
    `;
  }).join('');

  const itemVarianceBarsHtml = matrix.map(row => {
    return `
      <div class="flex items-center justify-between py-2 border-b border-slate-100 text-xs">
        <div class="w-1/3 truncate pr-2">
          <span class="font-bold text-slate-800">${Utils.escapeHtml(row.itemName)}</span>
          <span class="text-[11px] text-slate-400 block">${Utils.escapeHtml(row.unit)}</span>
        </div>
        <div class="w-2/3 flex items-center justify-end gap-3 font-mono">
          <span class="text-emerald-700 font-bold">L1: ${Utils.formatCurrency(row.lowestRate)}</span>
          <span class="text-slate-400 text-[10px]">vs</span>
          <span class="text-rose-600 font-medium">High: ${Utils.formatCurrency(row.highestRate)}</span>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${row.differencePercentage >= 15 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}">
            Δ ${row.differencePercentage}%
          </span>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="p-6 space-y-6">
      <div>
        <h4 class="text-lg font-bold text-slate-900 tracking-tight">Visual Price Analytics</h4>
        <p class="text-xs text-slate-500 mt-0.5">Visual representation of total vendor basket values and item-level price variance spreads.</p>
      </div>

      <!-- Vendor Basket Comparison Chart -->
      <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h5 class="text-sm font-bold text-slate-900 mb-4">Vendor Quoted Total Basket Comparison</h5>
        <div class="space-y-4">
          ${vendorBarsHtml}
        </div>
      </div>

      <!-- Item Spread Breakdown -->
      <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h5 class="text-sm font-bold text-slate-900 mb-3">Item Price Spread (L1 Lowest vs Highest Quote)</h5>
        <div class="divide-y divide-slate-100">
          ${itemVarianceBarsHtml}
        </div>
      </div>
    </div>
  `;
}

/* ==========================================================================
   QUOTE DETAIL MODAL
   ========================================================================== */
function openQuoteModal(itemId, vendorId) {
  if (!comparisonData) return;

  const row = comparisonData.matrix.find(r => r.itemId === itemId);
  if (!row) return;

  const rateObj = row.vendorRates[vendorId];
  if (!rateObj) return;

  const vendor = comparisonData.vendors.find(v => v.vendorId === vendorId);

  document.getElementById('modal-vendor-name').textContent = vendor ? vendor.vendorName : vendorId;
  document.getElementById('modal-vendor-icon').textContent = (vendor ? vendor.vendorName : 'V').charAt(0).toUpperCase();
  document.getElementById('modal-item-name').textContent = `${row.itemName} (${row.unit}) — ${row.specification || 'Standard'}`;

  document.getElementById('modal-rate').textContent = Utils.formatCurrency(rateObj.rate);
  
  const rankBadge = document.getElementById('modal-rank-badge');
  rankBadge.innerHTML = `<span class="badge ${rateObj.rank === 1 ? 'badge-active' : 'badge-pending'}">${rateObj.rankBadge || 'L' + rateObj.rank} ${rateObj.rank === 1 ? 'BEST PRICE' : 'RANK ' + rateObj.rank}</span>`;

  document.getElementById('modal-brand').textContent = rateObj.brand || 'Not Specified';
  document.getElementById('modal-moq').textContent = rateObj.moq || 'No MOQ';
  document.getElementById('modal-validity').textContent = rateObj.validity || 'Standard';
  document.getElementById('modal-variance').textContent = rateObj.varianceVsL1 > 0 ? `+${rateObj.varianceVsL1}% higher than L1` : '0% (Lowest L1 Quote)';

  document.getElementById('modal-remarks').textContent = rateObj.remarks || 'No specific terms or remarks provided.';
  document.getElementById('modal-contact').textContent = vendor ? vendor.contactPerson || '—' : '—';
  document.getElementById('modal-phone').textContent = vendor ? vendor.phone || '—' : '—';

  const modal = document.getElementById('quote-detail-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeQuoteModal() {
  const modal = document.getElementById('quote-detail-modal');
  if (modal) modal.classList.add('hidden');
}

/* ==========================================================================
   EXPORT & PRINT HELPERS
   ========================================================================== */
function exportComparisonCSV() {
  if (!comparisonData) return;

  const vendors = comparisonData.vendors;
  const matrix = comparisonData.matrix;

  let csvContent = 'data:text/csv;charset=utf-8,';
  
  // Header Row
  const headers = [
    'Item ID', 'Item Name', 'Unit', 'Specification', 
    ...vendors.map(v => `Vendor Rate: ${v.vendorName}`), 
    ...vendors.map(v => `Vendor Rank: ${v.vendorName}`), 
    'Lowest Rate (L1)', 'Highest Rate', 'Price Spread %', 'Best Vendor (L1)'
  ];
  csvContent += headers.map(h => `"${h}"`).join(',') + '\r\n';

  // Data Rows
  matrix.forEach(row => {
    const vendorRateValues = vendors.map(v => {
      const r = row.vendorRates[v.vendorId];
      return r && r.rate !== null ? r.rate : '';
    });

    const vendorRankValues = vendors.map(v => {
      const r = row.vendorRates[v.vendorId];
      return r && r.rank ? r.rankBadge : '';
    });

    const rowData = [
      row.itemId,
      row.itemName,
      row.unit,
      row.specification || '',
      ...vendorRateValues,
      ...vendorRankValues,
      row.lowestRate !== null ? row.lowestRate : '',
      row.highestRate !== null ? row.highestRate : '',
      row.differencePercentage,
      row.bestVendorName || ''
    ];

    csvContent += rowData.map(v => `"${v}"`).join(',') + '\r\n';
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `RateSarthi_Comparison_${currentRequestId}_${Utils.formatDate(new Date())}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function printExecutiveReport() {
  window.print();
}
