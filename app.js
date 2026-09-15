// Service PMS Application Logic

// Local storage key
const STORAGE_KEY = 'SERVICE_PMS_DATA_V5';

// Initial state
let sitesData = [];
let activeSiteId = null;
let currentEditingTaskId = null;

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  setupEventListeners();
  renderSites();
  populateSiteDropdown();
});

// Load Data from LocalStorage or seed_data.json
async function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      sitesData = JSON.parse(saved);
      if (sitesData.length > 0) {
        // Ensure all tasks have duration calculated from dates if missing
        sitesData.forEach(s => {
          s.tasks.forEach(t => {
            if (!t.isHeader && (!t.duration || t.duration <= 1)) {
              if (t.startDate && t.endDate) {
                try {
                  const d1 = new Date(t.startDate);
                  const d2 = new Date(t.endDate);
                  const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
                  t.duration = Math.max(1, diff);
                } catch(e) { t.duration = 7; }
              } else {
                t.duration = 7;
              }
            }
          });
        });
        activeSiteId = sitesData[0].id;
        return;
      }
    } catch (e) {
      console.error('Error loading localStorage data:', e);
    }
  }

  // Load initial seed data
  try {
    const response = await fetch('seed_data.json');
    sitesData = await response.json();
    
    // Ensure all tasks have calculated duration
    sitesData.forEach(s => {
      s.tasks.forEach(t => {
        if (!t.isHeader && (!t.duration || t.duration <= 1)) {
          if (t.startDate && t.endDate) {
            try {
              const d1 = new Date(t.startDate);
              const d2 = new Date(t.endDate);
              const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
              t.duration = Math.max(1, diff);
            } catch(e) { t.duration = 7; }
          } else {
            t.duration = 7;
          }
        }
      });
    });

    if (sitesData.length > 0) {
      activeSiteId = sitesData[0].id;
    }
    saveData();
  } catch (err) {
    console.error('Failed to load seed_data.json:', err);
    // Fallback default site
    sitesData = [{
      id: 'site-1',
      name: 'RDM Service PMS of 2 MVA Portal Substation',
      client: 'MAHESHWARI DISTRIBUTORS',
      poNumber: '5100033887',
      owner: 'DK Shriwal',
      siteIncharge: 'Dinesh Purohit',
      tasks: []
    }];
    activeSiteId = 'site-1';
    saveData();
  }
}

// Add demo sites matching the user's screenshots
function addInitialDemoSites() {
  sitesData.push({
    id: 'site-ev-clzs',
    name: 'EV Charging_CLZS',
    client: 'HZL CLZS',
    poNumber: '4200088912',
    owner: 'Arun Sharma',
    siteIncharge: 'Ramesh Patel',
    tasks: [
      {
        id: 'CLZS001',
        wbs: '1.0',
        title: 'Civil foundation for EV Charger units',
        totalQty: 10,
        completedQty: 10,
        uom: 'Nos',
        doer: 'Ramesh Patel',
        manpower: '8',
        startDate: '2026-08-01',
        endDate: '2026-08-15',
        progressPct: 100,
        remark: 'Completed successfully',
        isHeader: false
      },
      {
        id: 'CLZS002',
        wbs: '2.0',
        title: 'Cable trenching and pipe laying',
        totalQty: 250,
        completedQty: 150,
        uom: 'Mtr',
        doer: 'Vikram Singh',
        manpower: '6',
        startDate: '2026-08-16',
        endDate: '2026-09-05',
        progressPct: 60,
        remark: '150m done, remaining in progress',
        isHeader: false
      },
      {
        id: 'CLZS003',
        wbs: '3.0',
        title: 'Installation of EV Charger Dispensers',
        totalQty: 5,
        completedQty: 0,
        uom: 'Nos',
        doer: 'Vikram Singh',
        manpower: '4',
        startDate: '2026-09-10',
        endDate: '2026-09-20',
        progressPct: 0,
        remark: 'Awaiting delivery',
        isHeader: false
      }
    ]
  });

  sitesData.push({
    id: 'site-dsc-common',
    name: 'DSC Common-RD',
    client: 'HZL Smelter',
    poNumber: '4500012900',
    owner: 'Mukesh Vyas',
    siteIncharge: 'Sohan Lal',
    tasks: [
      {
        id: 'DSC001',
        wbs: '1.0',
        title: 'HT Panel Erection & Alignment',
        totalQty: 6,
        completedQty: 6,
        uom: 'Sets',
        doer: 'Sohan Lal',
        manpower: '12',
        startDate: '2026-07-01',
        endDate: '2026-07-20',
        progressPct: 100,
        remark: 'Testing done',
        isHeader: false
      },
      {
        id: 'DSC002',
        wbs: '2.0',
        title: 'Control cable termination & ferruling',
        totalQty: 120,
        completedQty: 60,
        uom: 'Cores',
        doer: 'Sunil Kumar',
        manpower: '4',
        startDate: '2026-08-01',
        endDate: '2026-08-25',
        progressPct: 50,
        remark: 'Half completed',
        isHeader: false
      }
    ]
  });

  sitesData.push({
    id: 'site-debari',
    name: 'Debari Substation Maintenance',
    client: 'Debari Zinc Smelter',
    poNumber: '5100098231',
    owner: 'Pawan Joshi',
    siteIncharge: 'Govind Ram',
    tasks: [
      {
        id: 'DEB001',
        wbs: '1.0',
        title: 'Transformer oil filtration and BDV testing',
        totalQty: 2,
        completedQty: 1,
        uom: 'Nos',
        doer: 'Govind Ram',
        manpower: '5',
        startDate: '2026-08-10',
        endDate: '2026-08-20',
        progressPct: 50,
        remark: 'TR-1 completed, TR-2 scheduled next week',
        isHeader: false
      }
    ]
  });
}

// Save Data to LocalStorage
function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sitesData));
}

// Calculate site stats
function getSiteStats(site) {
  const actionableTasks = site.tasks.filter(t => !t.isHeader && t.totalQty !== null);
  const total = actionableTasks.length;
  if (total === 0) {
    return { total: 0, done: 0, inProgress: 0, pending: 0, avgProgress: 0 };
  }

  let done = 0;
  let inProgress = 0;
  let pending = 0;
  let sumPct = 0;

  actionableTasks.forEach(t => {
    sumPct += t.progressPct || 0;
    if (t.progressPct >= 100) {
      done++;
    } else if (t.progressPct > 0) {
      inProgress++;
    } else {
      pending++;
    }
  });

  const avgProgress = Math.round(sumPct / total);
  return { total, done, inProgress, pending, avgProgress };
}

// Render Sites Directory
function renderSites() {
  const container = document.getElementById('sitesGridContainer');
  const showHidden = document.getElementById('chkShowHidden').checked;
  container.innerHTML = '';

  const sitesToDisplay = showHidden ? sitesData : sitesData.filter(s => !s.hidden);

  if (sitesToDisplay.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #64748b;">
      No sites to display. Click "+ Add New Site" to create one.
    </div>`;
    return;
  }

  sitesToDisplay.forEach(site => {
    const stats = getSiteStats(site);
    const packagesCount = site.tasks.filter(t => t.isHeader).length || 1;

    const card = document.createElement('div');
    card.className = 'site-card';
    card.innerHTML = `
      <div class="site-card-header">
        <div class="site-name-wrap" onclick="openSiteTasks('${site.id}')">
          <span class="site-bullet"></span>
          <span class="site-title">${site.name}</span>
        </div>
        <div class="site-card-tools">
          <button class="tool-icon-btn" title="Toggle Hide Site" onclick="toggleHideSite('${site.id}', event)">
            <i class="fa-solid ${site.hidden ? 'fa-eye-slash' : 'fa-eye'}"></i>
          </button>
          <button class="tool-icon-btn" title="Rename Site" onclick="editSite('${site.id}', event)">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button class="tool-icon-btn" title="Delete Site" onclick="deleteSite('${site.id}', event)">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>

      <div class="site-card-progress-meta">
        <span>Progress: ${stats.done}/${stats.total} Steps (${stats.avgProgress}%)</span>
        <span class="site-packages-badge">${packagesCount} Packages</span>
      </div>

      <div class="site-progress-track">
        <div class="site-progress-bar" style="width: ${stats.avgProgress}%;"></div>
      </div>

      <div class="site-card-footer">
        <div class="site-stats-tags">
          <span class="stat-pill done">Done: ${stats.done}</span>
          <span class="stat-pill pending">In Progress: ${stats.inProgress}</span>
          <span class="stat-pill delayed">Pending: ${stats.pending}</span>
        </div>
        <button class="btn-card-task" onclick="openSiteTasks('${site.id}')">
          + Task View
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

// Populate Site dropdown inside Tasks view
function populateSiteDropdown() {
  const select = document.getElementById('selectActiveSiteDropdown');
  select.innerHTML = '';
  sitesData.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.id;
    opt.textContent = s.name;
    if (s.id === activeSiteId) {
      opt.selected = true;
    }
    select.appendChild(opt);
  });
}

// Switch between View 1 (Sites) and View 2 (Tasks)
function switchView(viewName) {
  const viewSites = document.getElementById('viewSites');
  const viewTasks = document.getElementById('viewTasks');
  const dockSites = document.getElementById('dockBtnSites');
  const dockTasks = document.getElementById('dockBtnTasks');

  if (viewName === 'tasks') {
    viewSites.classList.remove('active');
    viewTasks.classList.add('active');
    dockSites.classList.remove('active');
    dockTasks.classList.add('active');
  } else {
    viewSites.classList.add('active');
    viewTasks.classList.remove('active');
    dockSites.classList.add('active');
    dockTasks.classList.remove('active');
    renderSites();
  }
}

// Open tasks view for a specific site
function openSiteTasks(siteId) {
  activeSiteId = siteId;
  const select = document.getElementById('selectActiveSiteDropdown');
  select.value = siteId;
  renderSiteTasks();
  switchView('tasks');
}

// Render Tasks of the Active Site
function renderSiteTasks() {
  const site = sitesData.find(s => s.id === activeSiteId);
  if (!site) return;

  // Banner details
  const stats = getSiteStats(site);
  document.getElementById('currentSiteTitle').textContent = site.name;
  document.getElementById('currentSiteProgressBadge').textContent = `${stats.avgProgress}% Complete (${stats.done}/${stats.total})`;

  // Render Project Metadata Header Card
  document.getElementById('metaClient').textContent = site.client || 'MAHESHWARI DISTRIBUTORS';
  document.getElementById('metaPO').textContent = site.poNumber || '5100033887';
  document.getElementById('metaDEO').textContent = site.deo || 'Mahender Kumar Gurjar';
  document.getElementById('metaStartDate').textContent = site.startDate || '2026-06-02';
  document.getElementById('metaEndDate').textContent = site.endDate || '2026-08-20';

  // Duration calculation
  let durationStr = '-';
  if (site.startDate && site.endDate) {
    const d1 = new Date(site.startDate);
    const d2 = new Date(site.endDate);
    const diffDays = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
    durationStr = `${diffDays > 0 ? diffDays : 0} Days`;
  }
  document.getElementById('metaDuration').textContent = durationStr;

  document.getElementById('metaOwner').textContent = site.owner || 'DK Shriwal :- 8233330578';
  document.getElementById('metaVRE').textContent = site.vre || 'Aarti Bala :- 8824133320';
  document.getElementById('metaIncharge').textContent = site.siteIncharge || 'Dinesh Purohit :- 8003698657';
  document.getElementById('metaCoordinator').textContent = site.coordinator || 'Tulsi Sen :- 9875789834';

  const tbody = document.getElementById('tasksTableBody');
  tbody.innerHTML = '';

  const filterStatus = document.getElementById('selectStatusFilter').value;
  const searchQuery = document.getElementById('taskSearchInput').value.trim().toLowerCase();

  let filteredTasks = site.tasks.filter(task => {
    // Search query filter
    if (searchQuery) {
      const matchText = (task.id + ' ' + (task.wbs || '') + ' ' + task.title + ' ' + (task.doer || '') + ' ' + (task.remark || '')).toLowerCase();
      if (!matchText.includes(searchQuery)) return false;
    }

    // Status filter
    if (filterStatus === 'COMPLETED') {
      return !task.isHeader && (task.progressPct >= 100);
    }
    if (filterStatus === 'IN_PROGRESS') {
      return !task.isHeader && (task.progressPct > 0 && task.progressPct < 100);
    }
    if (filterStatus === 'PENDING') {
      return !task.isHeader && (!task.progressPct || task.progressPct === 0);
    }
    return true;
  });

  if (filteredTasks.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 40px; color: #64748b;">
      No tasks match the filter criteria.
    </td></tr>`;
    return;
  }

  filteredTasks.forEach(task => {
    const tr = document.createElement('tr');

    // If it's a section header row (e.g. WBS Category)
    if (task.isHeader) {
      tr.className = 'header-row';
      tr.innerHTML = `
        <td class="uid-cell">
          <i class="fa-solid fa-folder-open text-primary"></i> ${task.id}
        </td>
        <td class="wbs-cell">${task.wbs || ''}</td>
        <td colspan="6" class="task-title" style="font-weight: 700; color: #1e1b4b;">
          ${task.title}
        </td>
        <td style="text-align: center;">
          <span style="font-size: 0.72rem; color: #64748b; font-weight: 600;">SECTION</span>
        </td>
      `;
      tbody.appendChild(tr);
      return;
    }

    // Calculate status badge
    let statusBadge = '';
    const pct = task.progressPct || 0;
    if (pct >= 100) {
      statusBadge = `<span class="badge badge-completed"><i class="fa-solid fa-circle-check"></i> Completed</span>`;
    } else if (pct > 0) {
      statusBadge = `<span class="badge badge-inprogress"><i class="fa-solid fa-spinner"></i> In Progress (${pct}%)</span>`;
    } else {
      statusBadge = `<span class="badge badge-pending"><i class="fa-regular fa-clock"></i> Pending</span>`;
    }

    // Total vs Completed Qty display
    let qtyDisplay = '';
    if (task.totalQty !== null && task.totalQty !== undefined) {
      const uom = task.uom || '';
      qtyDisplay = `
        <div class="qty-progress-wrap">
          <div class="qty-text">
            <strong>${task.completedQty || 0}</strong> / ${task.totalQty} ${uom}
          </div>
          <div class="progress-track-sm">
            <div class="progress-fill-sm" style="width: ${Math.min(pct, 100)}%;"></div>
          </div>
          <span class="progress-pct-badge">${pct}% Done</span>
        </div>
      `;
    } else {
      qtyDisplay = `<div class="qty-text"><strong>${pct}%</strong></div>`;
    }

    const planDates = (task.startDate || task.endDate) 
      ? `<span style="font-size: 0.74rem; color: #475569;">${task.startDate || ''}<br>&rarr; ${task.endDate || ''}</span>`
      : `<span style="color: #94a3b8;">-</span>`;

    const remarksText = task.remark 
      ? `<div class="remark-wrap-box">${task.remark}</div>`
      : `<span style="color: #cbd5e1;">-</span>`;

    tr.innerHTML = `
      <td class="uid-cell">
        <i class="fa-solid fa-play uid-arrow"></i> ${task.id}
      </td>
      <td class="wbs-cell">${task.wbs || '-'}</td>
      <td>
        <div class="task-title">${task.title}</div>
      </td>
      <td>${qtyDisplay}</td>
      <td>
        <div style="font-weight: 600; color: #1e293b; font-size: 0.8rem;">${task.doer || 'Unassigned'}</div>
        ${task.manpower ? `<span style="font-size: 0.7rem; color: #64748b;">${task.manpower} workers</span>` : ''}
      </td>
      <td>${planDates}</td>
      <td>${remarksText}</td>
      <td>${statusBadge}</td>
      <td style="text-align: center;">
        <button class="btn-table-update" onclick="openUpdateModal('${task.id}')">
          <i class="fa-solid fa-pen-to-square"></i> Update
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Also render Gantt timeline with current filter
  renderGanttTimeline(filteredTasks);
}

// ================= RENDER GANTT TIMELINE =================
function renderGanttTimeline(tasksToRender) {
  const container = document.getElementById('ganttTimelineContainer');
  if (!container) return;
  container.innerHTML = '';

  if (tasksToRender.length === 0) {
    container.innerHTML = `<div style="text-align: center; padding: 40px; color: #64748b;">No tasks to display in timeline.</div>`;
    return;
  }

  // Find max duration among actionable tasks for proportional scaling
  let maxDuration = 1;
  tasksToRender.forEach(t => {
    if (!t.isHeader && t.duration) {
      if (t.duration > maxDuration) maxDuration = t.duration;
    }
  });

  // Minimum visual width scale
  const scaleMaxDays = Math.max(maxDuration, 30);

  tasksToRender.forEach(task => {
    const row = document.createElement('div');

    if (task.isHeader) {
      row.className = 'gantt-row header-gantt-row';
      row.innerHTML = `
        <div style="font-size: 0.85rem; font-weight: 700; color: #1e1b4b; display: flex; align-items: center; gap: 8px;">
          <i class="fa-solid fa-folder-open text-primary"></i>
          <span>${task.wbs ? '[' + task.wbs + '] ' : ''}${task.title}</span>
        </div>
      `;
      container.appendChild(row);
      return;
    }

    row.className = 'gantt-row';

    // Duration display and tag styling
    const dur = task.duration || 1;
    let durTagClass = 'duration-tag-short';
    if (dur >= 20) {
      durTagClass = 'duration-tag-long';
    } else if (dur >= 7) {
      durTagClass = 'duration-tag-mid';
    }

    // Bar progress class
    const pct = task.progressPct || 0;
    let barClass = 'bar-pending';
    if (pct >= 100) {
      barClass = 'bar-completed';
    } else if (pct > 0) {
      barClass = 'bar-inprogress';
    }

    // Calculate bar percentage width relative to longest task
    // At least 15% width so short tasks are readable, scaled up to 100%
    const relativeWidthPct = Math.min(100, Math.max(12, Math.round((dur / scaleMaxDays) * 100)));

    const dateRangeStr = (task.startDate || task.endDate) 
      ? `${task.startDate || 'Start'} &rarr; ${task.endDate || 'End'}` 
      : 'No dates set';

    row.innerHTML = `
      <div class="gantt-task-info">
        <div class="gantt-task-header-row">
          <span class="gantt-uid">${task.id}</span>
          <span class="gantt-task-name" title="${task.title}">${task.title}</span>
        </div>
        <div class="gantt-task-meta">
          <span>${task.doer || 'Site Incharge'}</span> &bull; 
          <span>${dateRangeStr}</span>
        </div>
      </div>

      <div class="gantt-track-col">
        <div class="gantt-bar-wrap">
          <div class="gantt-bar-fill ${barClass}" style="width: ${relativeWidthPct}%;">
            <span>${pct}% Done (${dur} Days)</span>
          </div>
        </div>
        <div class="gantt-duration-badge">
          <span class="${durTagClass}">${dur} Days</span>
        </div>
      </div>
    `;

    container.appendChild(row);
  });
}

// ================= MODAL: UPDATE TASK QUANTITY =================
function openUpdateModal(taskId) {
  const site = sitesData.find(s => s.id === activeSiteId);
  if (!site) return;

  const task = site.tasks.find(t => t.id === taskId);
  if (!task) return;

  currentEditingTaskId = taskId;

  document.getElementById('updateModalTaskTitle').textContent = task.title;
  document.getElementById('updateModalTaskSub').textContent = `Task ID: ${task.id} | WBS: ${task.wbs || '-'} | Incharge: ${task.doer || 'Site Incharge'}`;

  const total = task.totalQty !== null ? task.totalQty : 1;
  const completed = task.completedQty !== null ? task.completedQty : 0;
  const remaining = Math.max(0, total - completed);
  const uom = task.uom || 'Unit';

  document.getElementById('dispTotalQty').textContent = `${total} ${uom}`;
  document.getElementById('dispCompletedQty').textContent = `${completed} ${uom}`;
  document.getElementById('dispRemainingQty').textContent = `${remaining} ${uom}`;
  document.getElementById('dispUomBadge').textContent = uom;

  // Set initial inputs
  const inputQty = document.getElementById('inputNewCompletedQty');
  inputQty.value = completed;
  inputQty.max = total * 1.5; // Allow slight overrun if needed

  document.getElementById('inputDoerName').value = task.doer || '';
  document.getElementById('inputManpower').value = task.manpower || '';
  document.getElementById('inputRemarks').value = task.remark || '';

  // Trigger calculation
  updateModalLivePreview();

  // Show modal
  document.getElementById('modalUpdateQty').classList.add('open');
}

function updateModalLivePreview() {
  const site = sitesData.find(s => s.id === activeSiteId);
  if (!site || !currentEditingTaskId) return;
  const task = site.tasks.find(t => t.id === currentEditingTaskId);
  if (!task) return;

  const total = task.totalQty !== null && task.totalQty > 0 ? task.totalQty : 100;
  const enteredQty = parseFloat(document.getElementById('inputNewCompletedQty').value) || 0;

  const calculatedPct = Math.min(Math.round((enteredQty / total) * 100), 100);

  document.getElementById('calcProgressPctText').textContent = `${calculatedPct}%`;
  document.getElementById('calcProgressFill').style.width = `${calculatedPct}%`;

  const statusEl = document.getElementById('calcProgressStatus');
  if (calculatedPct >= 100) {
    statusEl.innerHTML = '<i class="fa-solid fa-check-circle"></i> 100% Completed! (Task will be marked Finished)';
    statusEl.style.color = '#15803d';
  } else if (calculatedPct > 0) {
    statusEl.innerHTML = `<i class="fa-solid fa-spinner"></i> In Progress (${calculatedPct}%)`;
    statusEl.style.color = '#0284c7';
  } else {
    statusEl.innerHTML = '<i class="fa-regular fa-clock"></i> Pending (0%)';
    statusEl.style.color = '#64748b';
  }
}

// Save progress from Update Modal
function saveTaskProgress() {
  const site = sitesData.find(s => s.id === activeSiteId);
  if (!site || !currentEditingTaskId) return;
  const task = site.tasks.find(t => t.id === currentEditingTaskId);
  if (!task) return;

  const newCompleted = parseFloat(document.getElementById('inputNewCompletedQty').value) || 0;
  const total = task.totalQty !== null && task.totalQty > 0 ? task.totalQty : 1;

  task.completedQty = newCompleted;
  task.progressPct = Math.min(Math.round((newCompleted / total) * 100), 100);
  task.doer = document.getElementById('inputDoerName').value.trim() || task.doer;
  task.manpower = document.getElementById('inputManpower').value.trim();
  task.remark = document.getElementById('inputRemarks').value.trim();

  saveData();
  closeUpdateModal();
  renderSiteTasks();
}

function closeUpdateModal() {
  document.getElementById('modalUpdateQty').classList.remove('open');
  currentEditingTaskId = null;
}

// Helper to parse "Name :- Phone" or return parts
function parseStakeholder(val) {
  if (!val) return { name: '', phone: '' };
  if (typeof val === 'object' && val !== null) {
    return { name: val.name || '', phone: val.phone || '' };
  }
  const str = String(val).trim();
  if (str.includes(':-')) {
    const parts = str.split(':-');
    return { name: parts[0].trim(), phone: (parts[1] || '').trim() };
  }
  if (str.includes('-') && !str.startsWith('-')) {
    const parts = str.split('-');
    return { name: parts[0].trim(), phone: (parts[1] || '').trim() };
  }
  return { name: str, phone: '' };
}

function formatStakeholder(name, phone) {
  const n = (name || '').trim();
  const p = (phone || '').trim();
  if (n && p) return `${n} :- ${p}`;
  if (n) return n;
  if (p) return p;
  return '';
}

// Site Modal State (Create or Edit)
let editingSiteId = null;

// ================= MODAL: ADD / EDIT SITE =================
function openAddSiteModal(siteToEdit = null) {
  const modal = document.getElementById('modalAddSite');
  const templateGroup = document.getElementById('siteTemplateGroup');
  const title = document.getElementById('siteModalHeading');
  const btnText = document.getElementById('siteModalSubmitBtnText');

  if (siteToEdit) {
    editingSiteId = siteToEdit.id;
    title.textContent = 'Edit Project Information';
    btnText.textContent = 'Save Changes';
    templateGroup.style.display = 'none';

    document.getElementById('newSiteName').value = siteToEdit.name || '';
    document.getElementById('newSiteClient').value = siteToEdit.client || '';
    document.getElementById('newSitePO').value = siteToEdit.poNumber || '';
    document.getElementById('newSiteDEO').value = siteToEdit.deo || '';
    document.getElementById('newSiteStartDate').value = siteToEdit.startDate || '';
    document.getElementById('newSiteEndDate').value = siteToEdit.endDate || '';

    const ownerParts = parseStakeholder(siteToEdit.owner);
    document.getElementById('newSiteOwnerName').value = ownerParts.name || 'DK Shriwal';
    document.getElementById('newSiteOwnerPhone').value = ownerParts.phone || '8233330578';

    const vreParts = parseStakeholder(siteToEdit.vre);
    document.getElementById('newSiteVREName').value = vreParts.name || 'Aarti Bala';
    document.getElementById('newSiteVREPhone').value = vreParts.phone || '8824133320';

    const inchargeParts = parseStakeholder(siteToEdit.siteIncharge);
    document.getElementById('newSiteInchargeName').value = inchargeParts.name || 'Dinesh Purohit';
    document.getElementById('newSiteInchargePhone').value = inchargeParts.phone || '8003698657';

    const coordParts = parseStakeholder(siteToEdit.coordinator);
    document.getElementById('newSiteCoordinatorName').value = coordParts.name || 'Tulsi Sen';
    document.getElementById('newSiteCoordinatorPhone').value = coordParts.phone || '9875789834';
  } else {
    editingSiteId = null;
    title.textContent = 'Create New Service Site / Project';
    btnText.textContent = 'Create Project';
    templateGroup.style.display = 'block';

    document.getElementById('newSiteName').value = '';
    document.getElementById('newSiteClient').value = 'MAHESHWARI DISTRIBUTORS';
    document.getElementById('newSitePO').value = '5100033887';
    document.getElementById('newSiteDEO').value = 'Mahender Kumar Gurjar';
    document.getElementById('newSiteStartDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('newSiteEndDate').value = '';

    document.getElementById('newSiteOwnerName').value = 'DK Shriwal';
    document.getElementById('newSiteOwnerPhone').value = '8233330578';

    document.getElementById('newSiteVREName').value = 'Aarti Bala';
    document.getElementById('newSiteVREPhone').value = '8824133320';

    document.getElementById('newSiteInchargeName').value = 'Dinesh Purohit';
    document.getElementById('newSiteInchargePhone').value = '8003698657';

    document.getElementById('newSiteCoordinatorName').value = 'Tulsi Sen';
    document.getElementById('newSiteCoordinatorPhone').value = '9875789834';
  }

  modal.classList.add('open');
  document.getElementById('newSiteName').focus();
}

function closeAddSiteModal() {
  document.getElementById('modalAddSite').classList.remove('open');
  editingSiteId = null;
}

function submitNewSite() {
  const name = document.getElementById('newSiteName').value.trim();
  if (!name) {
    alert('Please enter a Project Title / Site name');
    return;
  }

  const client = document.getElementById('newSiteClient').value.trim() || 'MAHESHWARI DISTRIBUTORS';
  const poNumber = document.getElementById('newSitePO').value.trim() || '5100033887';
  const deo = document.getElementById('newSiteDEO').value.trim() || 'Mahender Kumar Gurjar';
  const startDate = document.getElementById('newSiteStartDate').value;
  const endDate = document.getElementById('newSiteEndDate').value;

  const ownerName = document.getElementById('newSiteOwnerName').value.trim() || 'DK Shriwal';
  const ownerPhone = document.getElementById('newSiteOwnerPhone').value.trim() || '8233330578';
  const owner = formatStakeholder(ownerName, ownerPhone);

  const vreName = document.getElementById('newSiteVREName').value.trim() || 'Aarti Bala';
  const vrePhone = document.getElementById('newSiteVREPhone').value.trim() || '8824133320';
  const vre = formatStakeholder(vreName, vrePhone);

  const siteInchargeName = document.getElementById('newSiteInchargeName').value.trim() || 'Dinesh Purohit';
  const siteInchargePhone = document.getElementById('newSiteInchargePhone').value.trim() || '8003698657';
  const siteIncharge = formatStakeholder(siteInchargeName, siteInchargePhone);

  const coordinatorName = document.getElementById('newSiteCoordinatorName').value.trim() || 'Tulsi Sen';
  const coordinatorPhone = document.getElementById('newSiteCoordinatorPhone').value.trim() || '9875789834';
  const coordinator = formatStakeholder(coordinatorName, coordinatorPhone);

  // Check if editing existing site
  if (editingSiteId) {
    const site = sitesData.find(s => s.id === editingSiteId);
    if (site) {
      site.name = name;
      site.client = client;
      site.poNumber = poNumber;
      site.deo = deo;
      site.startDate = startDate;
      site.endDate = endDate;
      site.owner = owner;
      site.vre = vre;
      site.siteIncharge = siteIncharge;
      site.coordinator = coordinator;

      saveData();
      populateSiteDropdown();
      renderSites();
      if (activeSiteId === site.id) {
        renderSiteTasks();
      }
      closeAddSiteModal();
      return;
    }
  }

  // Creating new site
  const template = document.getElementById('newSiteTemplate').value;
  let initialTasks = [];
  if (template === 'substation' && sitesData.length > 0 && sitesData[0].tasks.length > 0) {
    // Clone standard 101 tasks template with reset quantities
    initialTasks = JSON.parse(JSON.stringify(sitesData[0].tasks)).map(t => ({
      ...t,
      completedQty: 0,
      progressPct: 0,
      remark: ''
    }));
  }

  const newSite = {
    id: 'site-' + Date.now(),
    name,
    client,
    poNumber,
    deo,
    startDate,
    endDate,
    owner,
    vre,
    siteIncharge,
    coordinator,
    tasks: initialTasks
  };

  sitesData.push(newSite);
  saveData();
  populateSiteDropdown();
  renderSites();
  closeAddSiteModal();
  openSiteTasks(newSite.id);
}

// ================= MODAL: ADD NEW TASK =================
function openAddTaskModal() {
  const site = sitesData.find(s => s.id === activeSiteId);
  if (!site) return;

  document.getElementById('addTaskSiteLabel').textContent = `Adding to: ${site.name}`;
  // Suggest next ID
  const nextNum = site.tasks.length + 1;
  document.getElementById('newTaskUID').value = `PMS${String(nextNum).padStart(5, '0')}`;
  document.getElementById('newTaskWBS').value = '';
  document.getElementById('newTaskTitle').value = '';
  document.getElementById('newTaskTotalQty').value = '';
  document.getElementById('newTaskCompletedQty').value = '0';
  document.getElementById('newTaskUOM').value = 'Mtr';
  document.getElementById('newTaskDoer').value = site.siteIncharge || '';
  document.getElementById('newTaskDuration').value = '7';
  document.getElementById('newTaskStartDate').value = new Date().toISOString().split('T')[0];
  document.getElementById('newTaskEndDate').value = '';

  // Populate sections dropdown
  const secSelect = document.getElementById('newTaskParentSection');
  secSelect.innerHTML = '<option value="">(At End of List)</option>';
  site.tasks.forEach((t, index) => {
    if (t.isHeader) {
      const opt = document.createElement('option');
      opt.value = index;
      opt.textContent = `${t.wbs ? '[' + t.wbs + '] ' : ''}${t.title.substring(0, 45)}`;
      secSelect.appendChild(opt);
    }
  });

  document.getElementById('modalAddTask').classList.add('open');
}

function closeAddTaskModal() {
  document.getElementById('modalAddTask').classList.remove('open');
}

function submitNewTask() {
  const site = sitesData.find(s => s.id === activeSiteId);
  if (!site) return;

  const uid = document.getElementById('newTaskUID').value.trim();
  const title = document.getElementById('newTaskTitle').value.trim();
  const taskType = document.getElementById('newTaskType').value;

  if (!uid || !title) {
    alert('Please enter Task UID and Title');
    return;
  }

  const isHeader = taskType === 'header';
  const totalQty = isHeader ? null : parseFloat(document.getElementById('newTaskTotalQty').value) || 1;
  const completedQty = isHeader ? 0 : parseFloat(document.getElementById('newTaskCompletedQty').value) || 0;
  const uom = isHeader ? '' : document.getElementById('newTaskUOM').value.trim();
  const pct = isHeader ? 0 : Math.min(Math.round((completedQty / totalQty) * 100), 100);

  const startDate = document.getElementById('newTaskStartDate').value || new Date().toISOString().split('T')[0];
  const endDate = document.getElementById('newTaskEndDate').value || '';
  let durDays = parseInt(document.getElementById('newTaskDuration').value) || 0;
  if (!durDays && startDate && endDate) {
    try {
      const d1 = new Date(startDate);
      const d2 = new Date(endDate);
      durDays = Math.max(1, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));
    } catch (e) {
      durDays = 1;
    }
  }

  const newTask = {
    id: uid,
    wbs: document.getElementById('newTaskWBS').value.trim(),
    title: title,
    totalQty: totalQty,
    completedQty: completedQty,
    uom: uom,
    doer: document.getElementById('newTaskDoer').value.trim() || site.siteIncharge,
    manpower: '',
    startDate: startDate,
    endDate: endDate,
    duration: durDays || 1,
    progressPct: pct,
    remark: '',
    isHeader: isHeader
  };

  // Check if adding under a specific section
  const parentSecIdxStr = document.getElementById('newTaskParentSection').value;
  if (parentSecIdxStr !== '' && !isHeader) {
    const parentIdx = parseInt(parentSecIdxStr);
    // Find where this section ends (either next header or end of tasks)
    let insertIdx = parentIdx + 1;
    while (insertIdx < site.tasks.length && !site.tasks[insertIdx].isHeader) {
      insertIdx++;
    }
    site.tasks.splice(insertIdx, 0, newTask);
  } else {
    site.tasks.push(newTask);
  }

  saveData();
  renderSiteTasks();
  closeAddTaskModal();
}

// Site management actions (Hide, Rename, Delete)
function toggleHideSite(siteId, event) {
  event.stopPropagation();
  const site = sitesData.find(s => s.id === siteId);
  if (site) {
    site.hidden = !site.hidden;
    saveData();
    renderSites();
  }
}

function editSite(siteId, event) {
  if (event) event.stopPropagation();
  const site = sitesData.find(s => s.id === siteId);
  if (site) {
    openAddSiteModal(site);
  }
}

function deleteSite(siteId, event) {
  event.stopPropagation();
  if (confirm('Are you sure you want to delete this site and all its tasks?')) {
    sitesData = sitesData.filter(s => s.id !== siteId);
    if (activeSiteId === siteId) {
      activeSiteId = sitesData.length > 0 ? sitesData[0].id : null;
    }
    saveData();
    populateSiteDropdown();
    renderSites();
  }
}

// Switch between Table View and Gantt View
function switchTaskSubView(subView) {
  const btnTable = document.getElementById('btnViewTable');
  const btnGantt = document.getElementById('btnViewGantt');
  const cardTable = document.getElementById('cardTableView');
  const cardGantt = document.getElementById('cardGanttView');

  if (subView === 'gantt') {
    btnTable.classList.remove('active');
    btnGantt.classList.add('active');
    cardTable.style.display = 'none';
    cardGantt.style.display = 'block';
  } else {
    btnTable.classList.add('active');
    btnGantt.classList.remove('active');
    cardTable.style.display = 'block';
    cardGantt.style.display = 'none';
  }
}

// Event Listeners setup
function setupEventListeners() {
  // Navigation dock buttons
  document.getElementById('dockBtnSites').addEventListener('click', () => switchView('sites'));
  document.getElementById('dockBtnTasks').addEventListener('click', () => switchView('tasks'));
  document.getElementById('btnBackToSites').addEventListener('click', () => switchView('sites'));

  // Table vs Gantt view buttons
  document.getElementById('btnViewTable').addEventListener('click', () => switchTaskSubView('table'));
  document.getElementById('btnViewGantt').addEventListener('click', () => switchTaskSubView('gantt'));

  // Project Details edit button in Active Site view
  document.getElementById('btnEditCurrentSiteMeta').addEventListener('click', () => {
    if (activeSiteId) {
      editSite(activeSiteId);
    }
  });

  // Filter & Search
  document.getElementById('chkShowHidden').addEventListener('change', renderSites);
  document.getElementById('selectActiveSiteDropdown').addEventListener('change', (e) => {
    openSiteTasks(e.target.value);
  });
  document.getElementById('selectStatusFilter').addEventListener('change', renderSiteTasks);
  document.getElementById('taskSearchInput').addEventListener('input', renderSiteTasks);
  document.getElementById('btnRefreshTasks').addEventListener('click', renderSiteTasks);

  // Update Task Modal
  document.getElementById('btnCloseUpdateModal').addEventListener('click', closeUpdateModal);
  document.getElementById('btnCancelUpdateModal').addEventListener('click', closeUpdateModal);
  document.getElementById('btnSaveTaskProgress').addEventListener('click', saveTaskProgress);
  document.getElementById('inputNewCompletedQty').addEventListener('input', updateModalLivePreview);

  // Add Site Modal
  document.getElementById('btnOpenNewSiteModal').addEventListener('click', openAddSiteModal);
  document.getElementById('btnCloseAddSiteModal').addEventListener('click', closeAddSiteModal);
  document.getElementById('btnCancelAddSiteModal').addEventListener('click', closeAddSiteModal);
  document.getElementById('btnSubmitAddSite').addEventListener('click', submitNewSite);

  // Add Task Modal
  document.getElementById('btnOpenAddTaskModal').addEventListener('click', openAddTaskModal);
  document.getElementById('btnCloseAddTaskModal').addEventListener('click', closeAddTaskModal);
  document.getElementById('btnCancelAddTaskModal').addEventListener('click', closeAddTaskModal);
  document.getElementById('btnSubmitAddTask').addEventListener('click', submitNewTask);

  // Hide/Show Qty fields if header is selected
  document.getElementById('newTaskType').addEventListener('change', (e) => {
    const isHeader = e.target.value === 'header';
    document.getElementById('qtyUomSection').style.display = isHeader ? 'none' : 'flex';
  });

  // Excel Export Buttons
  const btnExcelTop = document.getElementById('btnExportExcelTop');
  if (btnExcelTop) btnExcelTop.addEventListener('click', exportSiteToExcel);

  const btnExcelBanner = document.getElementById('btnExportCurrentSiteExcel');
  if (btnExcelBanner) btnExcelBanner.addEventListener('click', exportSiteToExcel);

  // Backup & Restore
  document.getElementById('btnExportData').addEventListener('click', exportBackup);
  document.getElementById('btnImportData').addEventListener('click', () => {
    document.getElementById('fileImporter').click();
  });
  document.getElementById('fileImporter').addEventListener('change', importBackup);
}

// ================= EXPORT LIVE EXCEL SHEET (PLAN VS ACTUAL) =================
function exportSiteToExcel() {
  const site = sitesData.find(s => s.id === activeSiteId) || sitesData[0];
  if (!site) {
    alert('No active project found to export.');
    return;
  }

  if (typeof XLSX === 'undefined') {
    alert('Excel exporter library is loading, please try again in a second.');
    return;
  }

  // Header metadata block matching your original Excel format
  const rows = [
    ["MAHESHWARI DISTRIBUTORS - SERVICE PMS"],
    ["PROJECT TITLE:", site.name],
    ["PO NUMBER:", site.poNumber || "-"],
    ["DATA ENTRY OPERATOR:", site.deo || "-"],
    ["PROJECT START DATE:", site.startDate || "-", "PROJECT END DATE:", site.endDate || "-"],
    ["OWNER:", site.owner || "-", "VRE:", site.vre || "-"],
    ["SITE INCHARGE:", site.siteIncharge || "-", "PROCESS COORDINATOR:", site.coordinator || "-"],
    [], // Blank separator row
    [
      "Unique ID",
      "WBS NUMBER",
      "TASK TITLE / WORK DESCRIPTION",
      "Total Scope Qty",
      "UOM",
      "Assigned Doer",
      "Manpower",
      "PLAN START DATE",
      "PLAN END DATE",
      "DURATION (Days)",
      "COMPLETED QTY",
      "PROGRESS %",
      "STATUS",
      "REMARKS"
    ]
  ];

  // Task rows
  site.tasks.forEach(t => {
    let statusText = "Pending";
    if (t.progressPct >= 100) statusText = "Completed";
    else if (t.progressPct > 0) statusText = "In Progress";

    rows.push([
      t.id || "",
      t.wbs || "",
      t.title || "",
      t.isHeader ? "" : (t.totalQty !== null ? t.totalQty : ""),
      t.uom || "",
      t.doer || "",
      t.manpower || "",
      t.startDate || "",
      t.endDate || "",
      t.duration || "",
      t.isHeader ? "" : (t.completedQty || 0),
      t.isHeader ? "" : `${t.progressPct || 0}%`,
      t.isHeader ? "SECTION" : statusText,
      t.remark || ""
    ]);
  });

  // Create workbook and worksheet
  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Set column widths for clean look
  ws['!cols'] = [
    { wch: 14 }, // Unique ID
    { wch: 12 }, // WBS
    { wch: 45 }, // Title
    { wch: 15 }, // Scope Qty
    { wch: 8 },  // UOM
    { wch: 20 }, // Doer
    { wch: 10 }, // Manpower
    { wch: 14 }, // Start Date
    { wch: 14 }, // End Date
    { wch: 14 }, // Duration
    { wch: 15 }, // Completed Qty
    { wch: 12 }, // Progress %
    { wch: 14 }, // Status
    { wch: 30 }  // Remarks
  ];

  const wb = XLSX.utils.book_new();
  const sheetName = (site.name || "Service PMS").substring(0, 31).replace(/[:\\\/\?\*\[\]]/g, "_");
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Trigger download
  const safeFilename = `${site.name.replace(/[^a-zA-Z0-9_\-]/g, '_')}_PMS_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, safeFilename);
}

// Backup / Export
function exportBackup() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sitesData, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `service_pms_backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

// Restore / Import
function importBackup(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      if (Array.isArray(imported)) {
        sitesData = imported;
        saveData();
        populateSiteDropdown();
        renderSites();
        if (sitesData.length > 0) activeSiteId = sitesData[0].id;
        alert('Data successfully imported and restored!');
      } else {
        alert('Invalid data format in JSON backup.');
      }
    } catch (err) {
      alert('Error parsing JSON file.');
    }
  };
  reader.readAsText(file);
}
