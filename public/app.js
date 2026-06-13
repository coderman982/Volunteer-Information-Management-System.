// ==========================================================================
// VIMS Single Page Application Logic (Vanilla JS)
// ==========================================================================

// Global state
let state = {
  user: null,
  activeView: 'auth',
  events: [],
  hoursLogs: [],
  volunteers: [],
  stats: null
};

// UI Elements
const els = {
  header: document.getElementById('app-header'),
  navName: document.getElementById('nav-user-name'),
  btnLogout: document.getElementById('btn-logout'),
  toastContainer: document.getElementById('toast-container'),
  
  // Navigation buttons
  navDashboard: document.getElementById('nav-btn-dashboard'),
  navEvents: document.getElementById('nav-btn-events'),
  navHours: document.getElementById('nav-btn-hours'),
  navVolunteers: document.getElementById('nav-btn-volunteers'),
  navProfile: document.getElementById('nav-btn-profile'),

  // Views
  viewAuth: document.getElementById('view-auth'),
  viewVolDashboard: document.getElementById('view-volunteer-dashboard'),
  viewAdminDashboard: document.getElementById('view-admin-dashboard'),
  viewEvents: document.getElementById('view-events'),
  viewVolunteers: document.getElementById('view-volunteers'),
  viewProfile: document.getElementById('view-profile'),

  // Auth Forms
  tabLogin: document.getElementById('auth-tab-login'),
  tabRegister: document.getElementById('auth-tab-register'),
  formLogin: document.getElementById('form-login'),
  formRegister: document.getElementById('form-register'),
  
  // Volunteer Dashboard fields
  vDashName: document.getElementById('v-dash-name'),
  vDashHours: document.getElementById('v-dash-hours'),
  vDashEmail: document.getElementById('v-dash-email'),
  vDashAvailability: document.getElementById('v-dash-availability'),
  vDashSkills: document.getElementById('v-dash-skills'),
  vDashInterests: document.getElementById('v-dash-interests'),
  vDashEventsList: document.getElementById('v-dash-events-list'),
  vDashHoursTableBody: document.getElementById('v-dash-hours-table-body'),
  btnDashBrowse: document.getElementById('btn-dash-browse-events'),
  btnDashLogHours: document.getElementById('btn-dash-log-hours'),

  // Admin Dashboard fields
  adminStatVolunteers: document.getElementById('admin-stat-volunteers'),
  adminStatHours: document.getElementById('admin-stat-hours'),
  adminStatEvents: document.getElementById('admin-stat-events'),
  adminStatPending: document.getElementById('admin-stat-pending'),
  adminStatPendingTrigger: document.getElementById('admin-stat-pending-trigger'),
  adminHoursTableBody: document.getElementById('admin-hours-table-body'),
  adminLeaderboard: document.getElementById('admin-leaderboard'),
  adminEventStatsBars: document.getElementById('event-stats-bars'),

  // Events View
  eventsGrid: document.getElementById('events-grid'),
  eventSearch: document.getElementById('event-search'),
  eventStatusFilter: document.getElementById('event-status-filter'),
  btnCreateEventTrigger: document.getElementById('btn-event-create-trigger'),

  // Volunteers Directory View
  volSearch: document.getElementById('vol-search'),
  volAvailabilityFilter: document.getElementById('vol-availability-filter'),
  volDirectoryTableBody: document.getElementById('vol-directory-table-body'),

  // Profile View
  formProfile: document.getElementById('form-profile'),
  profileName: document.getElementById('profile-name-display'),
  profileEmail: document.getElementById('profile-email-display'),
  profileSkills: document.getElementById('profile-skills'),
  profileInterests: document.getElementById('profile-interests'),
  profileAvailability: document.getElementById('profile-availability'),

  // Modals
  modalEvent: document.getElementById('modal-event'),
  formEvent: document.getElementById('form-event'),
  modalEventTitle: document.getElementById('modal-event-title'),
  eventModalId: document.getElementById('event-modal-id'),
  eventTitle: document.getElementById('event-title'),
  eventDescription: document.getElementById('event-description'),
  eventDate: document.getElementById('event-date'),
  eventLocation: document.getElementById('event-location'),
  eventStatus: document.getElementById('event-status'),
  btnModalEventClose: document.getElementById('btn-modal-event-close'),
  btnModalEventCancel: document.getElementById('btn-modal-event-cancel'),

  modalHours: document.getElementById('modal-hours'),
  formHours: document.getElementById('form-hours'),
  hoursEventSelect: document.getElementById('hours-event-select'),
  hoursNumber: document.getElementById('hours-number'),
  hoursDate: document.getElementById('hours-date'),
  hoursDescription: document.getElementById('hours-description'),
  btnModalHoursClose: document.getElementById('btn-modal-hours-close'),
  btnModalHoursCancel: document.getElementById('btn-modal-hours-cancel')
};

// ==========================================
// TOAST NOTIFICATIONS
// ==========================================
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = '';
  if (type === 'success') {
    icon = `<svg class="btn-icon" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>`;
  } else if (type === 'error') {
    icon = `<svg class="btn-icon" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>`;
  } else {
    icon = `<svg class="btn-icon" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>`;
  }

  toast.innerHTML = `${icon}<span>${message}</span>`;
  els.toastContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ==========================================
// NAVIGATION / ROUTING SYSTEM
// ==========================================
function showView(viewId) {
  // Hide all views
  const views = [els.viewAuth, els.viewVolDashboard, els.viewAdminDashboard, els.viewEvents, els.viewVolunteers, els.viewProfile];
  views.forEach(v => v.classList.add('hidden'));

  // Remove active state from all nav buttons
  const navBtns = [els.navDashboard, els.navEvents, els.navHours, els.navVolunteers, els.navProfile];
  navBtns.forEach(b => b.classList.remove('active'));

  state.activeView = viewId;

  // Show active view and highlight nav button
  if (viewId === 'auth') {
    els.viewAuth.classList.remove('hidden');
    els.header.classList.add('hidden');
  } else {
    els.header.classList.remove('hidden');

    if (viewId === 'volunteer-dashboard') {
      els.viewVolDashboard.classList.remove('hidden');
      els.navDashboard.classList.add('active');
    } else if (viewId === 'admin-dashboard') {
      els.viewAdminDashboard.classList.remove('hidden');
      els.navDashboard.classList.add('active');
    } else if (viewId === 'events') {
      els.viewEvents.classList.remove('hidden');
      els.navEvents.classList.add('active');
    } else if (viewId === 'volunteers') {
      els.viewVolunteers.classList.remove('hidden');
      els.navVolunteers.classList.add('active');
    } else if (viewId === 'profile') {
      els.viewProfile.classList.remove('hidden');
      els.navProfile.classList.add('active');
    }
  }
}

// ==========================================
// DATA FETCHING & UI RENDERING
// ==========================================

// 1. Fetch current logged-in user session
async function checkAuthSession() {
  try {
    const res = await fetch('/api/auth/me');
    if (res.ok) {
      const data = await res.json();
      state.user = data.user;
      handleUserLoggedIn();
    } else {
      showView('auth');
    }
  } catch (err) {
    console.error('Session check failed:', err);
    showView('auth');
  }
}

// Configure dashboard layouts based on role
function handleUserLoggedIn() {
  els.navName.textContent = state.user.name;

  if (state.user.role === 'admin') {
    // Show admin navigation options
    document.querySelectorAll('.admin-only').forEach(el => el.classList.remove('hidden'));
    document.querySelectorAll('.volunteer-only').forEach(el => el.classList.add('hidden'));
    
    // Redirect to Admin Dashboard
    showView('admin-dashboard');
    refreshAdminDashboard();
  } else {
    // Show volunteer navigation options
    document.querySelectorAll('.admin-only').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.volunteer-only').forEach(el => el.classList.remove('hidden'));
    
    // Redirect to Volunteer Dashboard
    showView('volunteer-dashboard');
    refreshVolunteerDashboard();
  }
}

// Refresh Volunteer Dashboard
async function refreshVolunteerDashboard() {
  try {
    // Update user display tags
    els.vDashName.textContent = state.user.name;
    els.vDashEmail.textContent = state.user.email;
    els.vDashAvailability.textContent = state.user.availability || 'Flexible';

    renderProfileTags(state.user.skills, els.vDashSkills, 'No skills listed yet.');
    renderProfileTags(state.user.interests, els.vDashInterests, 'No interests listed yet.');

    // Fetch Events list and filter registered ones
    const eventsRes = await fetch('/api/events');
    const hoursRes = await fetch('/api/hours');

    if (eventsRes.ok && hoursRes.ok) {
      const eventsData = await eventsRes.json();
      const hoursData = await hoursRes.json();
      
      state.events = eventsData.events;
      state.hoursLogs = hoursData.logs;

      // Render hours list
      renderVolunteerHoursLogs(state.hoursLogs);

      // Render registered events mini-list
      renderRegisteredEvents(state.events);
      
      // Calculate approved hours sum
      const approvedSum = state.hoursLogs
        .filter(l => l.status === 'approved')
        .reduce((sum, current) => sum + current.hours, 0);
      els.vDashHours.textContent = approvedSum.toFixed(1);
    }
  } catch (err) {
    showToast('Failed to sync dashboard data.', 'error');
  }
}

// Render comma separated profile tags
function renderProfileTags(tagStr, targetContainer, placeholder) {
  targetContainer.innerHTML = '';
  if (!tagStr || tagStr.trim() === '') {
    targetContainer.innerHTML = `<span class="placeholder-text">${placeholder}</span>`;
    return;
  }
  tagStr.split(',').forEach(tag => {
    const span = document.createElement('span');
    span.className = 'tag';
    span.textContent = tag.trim();
    targetContainer.appendChild(span);
  });
}

// Render registered events list in volunteer dashboard
function renderRegisteredEvents(events) {
  els.vDashEventsList.innerHTML = '';
  const registered = events.filter(e => e.is_registered === 1 && e.status === 'upcoming');
  
  if (registered.length === 0) {
    els.vDashEventsList.innerHTML = `<p class="placeholder-text">You haven't registered for any upcoming events yet.</p>`;
    return;
  }

  registered.forEach(e => {
    const item = document.createElement('div');
    item.className = 'event-mini-item';
    item.innerHTML = `
      <div class="event-mini-info">
        <h5>${e.title}</h5>
        <span>📅 ${e.date} &bull; 📍 ${e.location}</span>
      </div>
      <button class="btn btn-secondary btn-small btn-cancel-reg" data-id="${e.id}">Unregister</button>
    `;
    els.vDashEventsList.appendChild(item);
  });

  // Attach click listener for unregister buttons
  els.vDashEventsList.querySelectorAll('.btn-cancel-reg').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const eventId = e.target.getAttribute('data-id');
      await cancelEventRegistration(eventId);
    });
  });
}

// Render Volunteer Hours Logs Table
function renderVolunteerHoursLogs(logs) {
  els.vDashHoursTableBody.innerHTML = '';
  if (logs.length === 0) {
    els.vDashHoursTableBody.innerHTML = `<tr><td colspan="5" class="center-text placeholder-text">No hours logged yet.</td></tr>`;
    return;
  }

  logs.forEach(l => {
    const row = document.createElement('tr');
    let statusClass = 'badge-pending';
    if (l.status === 'approved') statusClass = 'badge-approved';
    if (l.status === 'rejected') statusClass = 'badge-rejected';

    row.innerHTML = `
      <td>${l.date}</td>
      <td><strong>${l.event_title}</strong></td>
      <td>${l.hours} hrs</td>
      <td>${l.description || '-'}</td>
      <td><span class="badge ${statusClass}">${l.status}</span></td>
    `;
    els.vDashHoursTableBody.appendChild(row);
  });
}

// Refresh Admin Dashboard
async function refreshAdminDashboard() {
  try {
    const statsRes = await fetch('/api/stats');
    const hoursRes = await fetch('/api/hours');

    if (statsRes.ok && hoursRes.ok) {
      const statsData = await statsRes.json();
      const hoursData = await hoursRes.json();

      state.stats = statsData.stats;
      state.hoursLogs = hoursData.logs;

      // Render Stats Indicators
      els.adminStatVolunteers.textContent = state.stats.totalVolunteers;
      els.adminStatHours.textContent = state.stats.totalApprovedHours.toFixed(1);
      els.adminStatEvents.textContent = state.stats.totalEvents;
      els.adminStatPending.textContent = state.stats.pendingApprovalCount;

      // Highlight the pending log card if count > 0
      const pendingCard = document.getElementById('admin-stat-pending-trigger');
      if (state.stats.pendingApprovalCount > 0) {
        pendingCard.style.animation = 'pulse 2s infinite';
      } else {
        pendingCard.style.animation = 'none';
      }

      // Render hours approvals requests table
      renderAdminHoursLogsTable(state.hoursLogs);

      // Render Leaderboard Chart
      renderLeaderboard(state.stats.topVolunteers, state.stats.totalApprovedHours);

      // Render Column Bar Charts
      renderEventsBarChart(state.stats.eventStats);
    }
  } catch (err) {
    showToast('Failed to sync admin stats.', 'error');
  }
}

// Render Admin Hours Logs Table (Hours Pending Approvals)
function renderAdminHoursLogsTable(logs) {
  els.adminHoursTableBody.innerHTML = '';
  const pendingLogs = logs.filter(l => l.status === 'pending');

  if (pendingLogs.length === 0) {
    els.adminHoursTableBody.innerHTML = `<tr><td colspan="6" class="center-text placeholder-text">All hours logs reviewed. No pending requests.</td></tr>`;
    return;
  }

  pendingLogs.forEach(l => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${l.volunteer_name}</strong></td>
      <td>${l.event_title}</td>
      <td>${l.hours} hrs</td>
      <td>${l.date}</td>
      <td><small>${l.description || '-'}</small></td>
      <td>
        <div style="display:flex; gap:0.5rem;">
          <button class="btn btn-primary btn-small btn-approve" data-id="${l.id}">Approve</button>
          <button class="btn btn-danger btn-small btn-reject" data-id="${l.id}">Reject</button>
        </div>
      </td>
    `;
    els.adminHoursTableBody.appendChild(row);
  });

  // Attach approval listeners
  els.adminHoursTableBody.querySelectorAll('.btn-approve').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const logId = e.target.getAttribute('data-id');
      await updateHoursLogStatus(logId, 'approved');
    });
  });

  els.adminHoursTableBody.querySelectorAll('.btn-reject').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const logId = e.target.getAttribute('data-id');
      await updateHoursLogStatus(logId, 'rejected');
    });
  });
}

// Render CSS/HTML Leaderboard
function renderLeaderboard(topVolunteers, totalHoursSum) {
  els.adminLeaderboard.innerHTML = '';
  if (!topVolunteers || topVolunteers.length === 0) {
    els.adminLeaderboard.innerHTML = `<p class="placeholder-text">No approved volunteer hours yet.</p>`;
    return;
  }

  const maxHours = topVolunteers[0].hours || 1;

  topVolunteers.forEach(v => {
    const pct = (v.hours / maxHours) * 100;
    const item = document.createElement('div');
    item.className = 'leaderboard-item';
    item.innerHTML = `
      <div class="leaderboard-item-info">
        <span class="leaderboard-name">${v.name}</span>
        <span class="leaderboard-hours">${v.hours.toFixed(1)} hrs</span>
      </div>
      <div class="leaderboard-progress-bg">
        <div class="leaderboard-progress-fill" style="width: 0%"></div>
      </div>
    `;
    els.adminLeaderboard.appendChild(item);
    
    // Animate the bar expansion
    setTimeout(() => {
      item.querySelector('.leaderboard-progress-fill').style.width = `${pct}%`;
    }, 100);
  });
}

// Render CSS-based Column Event Bar Charts
function renderEventsBarChart(eventStats) {
  els.adminEventStatsBars.innerHTML = '';
  if (!eventStats || eventStats.length === 0) {
    els.adminEventStatsBars.innerHTML = `<p class="placeholder-text">No events created yet.</p>`;
    return;
  }

  const maxRegistrations = Math.max(...eventStats.map(e => e.registrations), 1);

  eventStats.forEach(e => {
    const pct = (e.registrations / maxRegistrations) * 100;
    const column = document.createElement('div');
    column.className = 'chart-bar-column';
    column.innerHTML = `
      <span class="chart-bar-value">${e.registrations}</span>
      <div class="chart-bar-pill ${e.status === 'completed' ? 'completed' : ''}" style="height: 0%"></div>
      <span class="chart-bar-label" title="${e.title}">${e.title}</span>
    `;
    els.adminEventStatsBars.appendChild(column);

    // Animate the bar height
    setTimeout(() => {
      column.querySelector('.chart-bar-pill').style.height = `${pct}%`;
    }, 100);
  });
}

// 2. Events List Page
async function loadEventsPage() {
  try {
    const res = await fetch('/api/events');
    if (res.ok) {
      const data = await res.json();
      state.events = data.events;
      renderEventsGrid();
    }
  } catch (err) {
    showToast('Failed to load events.', 'error');
  }
}

function renderEventsGrid() {
  els.eventsGrid.innerHTML = '';
  
  const query = els.eventSearch.value.toLowerCase();
  const filterStatus = els.eventStatusFilter.value;

  const filtered = state.events.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(query) || e.description.toLowerCase().includes(query);
    const matchesStatus = filterStatus === 'all' || e.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (filtered.length === 0) {
    els.eventsGrid.innerHTML = `<div class="card glass center-text width-100" style="grid-column: 1/-1;"><p class="placeholder-text">No opportunities matching filters found.</p></div>`;
    return;
  }

  filtered.forEach(e => {
    const card = document.createElement('div');
    card.className = 'card glass event-card';
    
    let badgeClass = e.status === 'upcoming' ? 'bg-teal' : 'badge-approved';
    let actionButtons = '';

    if (state.user.role === 'admin') {
      actionButtons = `
        <button class="btn btn-secondary btn-small btn-edit-event" data-id="${e.id}">Edit</button>
        <button class="btn btn-danger btn-small btn-delete-event" data-id="${e.id}">Delete</button>
      `;
    } else {
      if (e.status === 'upcoming') {
        if (e.is_registered === 1) {
          actionButtons = `<button class="btn btn-danger btn-small btn-register-toggle" data-id="${e.id}" data-action="unregister">Cancel Registration</button>`;
        } else {
          actionButtons = `<button class="btn btn-primary btn-small btn-register-toggle" data-id="${e.id}" data-action="register">Sign Up</button>`;
        }
      } else {
        actionButtons = `<span class="badge badge-approved center-text" style="width: 100%; padding:0.5rem;">Project Finished</span>`;
      }
    }

    card.innerHTML = `
      <div>
        <div class="event-status-header">
          <span class="badge ${badgeClass}">${e.status}</span>
          <span class="badge bg-teal">${e.registered_count || 0} Registered</span>
        </div>
        <h4>${e.title}</h4>
        <p>${e.description || 'No description provided.'}</p>
      </div>
      <div>
        <div class="event-meta-info">
          <div>
            <svg class="event-meta-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <span>${e.date}</span>
          </div>
          <div>
            <svg class="event-meta-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <span>${e.location}</span>
          </div>
        </div>
        <div class="event-card-actions">
          ${actionButtons}
        </div>
      </div>
    `;

    els.eventsGrid.appendChild(card);
  });

  // Attach event action listeners
  els.eventsGrid.querySelectorAll('.btn-register-toggle').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const eventId = e.target.getAttribute('data-id');
      const action = e.target.getAttribute('data-action');
      if (action === 'register') {
        await registerForEvent(eventId);
      } else {
        await cancelEventRegistration(eventId);
      }
      loadEventsPage();
    });
  });

  els.eventsGrid.querySelectorAll('.btn-edit-event').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const eventId = e.target.getAttribute('data-id');
      const event = state.events.find(ev => ev.id == eventId);
      openEventModal(event);
    });
  });

  els.eventsGrid.querySelectorAll('.btn-delete-event').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      if (confirm('Are you sure you want to delete this event? This will erase all registrations and logged hours.')) {
        const eventId = e.target.getAttribute('data-id');
        await deleteEvent(eventId);
      }
    });
  });
}

// 3. Volunteers Directory Page (Admin)
async function loadVolunteersPage() {
  try {
    const res = await fetch('/api/volunteers');
    if (res.ok) {
      const data = await res.json();
      state.volunteers = data.volunteers;
      renderVolunteersDirectory();
    }
  } catch (err) {
    showToast('Failed to load volunteers directory.', 'error');
  }
}

function renderVolunteersDirectory() {
  els.volDirectoryTableBody.innerHTML = '';
  
  const query = els.volSearch.value.toLowerCase();
  const availabilityFilter = els.volAvailabilityFilter.value;

  const filtered = state.volunteers.filter(v => {
    const matchQuery = v.name.toLowerCase().includes(query) || 
                       v.email.toLowerCase().includes(query) || 
                       (v.skills && v.skills.toLowerCase().includes(query)) ||
                       (v.interests && v.interests.toLowerCase().includes(query));
    
    const matchAvailability = availabilityFilter === 'all' || v.availability === availabilityFilter;
    return matchQuery && matchAvailability;
  });

  if (filtered.length === 0) {
    els.volDirectoryTableBody.innerHTML = `<tr><td colspan="6" class="center-text placeholder-text">No volunteers found matching specifications.</td></tr>`;
    return;
  }

  filtered.forEach(v => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${v.name}</strong></td>
      <td>${v.email}</td>
      <td>${v.skills ? v.skills.split(',').map(s => `<span class="tag">${s.trim()}</span>`).join(' ') : '<small class="placeholder-text">None listed</small>'}</td>
      <td>${v.interests ? v.interests.split(',').map(i => `<span class="tag">${i.trim()}</span>`).join(' ') : '<small class="placeholder-text">None listed</small>'}</td>
      <td><span class="badge bg-teal">${v.availability || 'Flexible'}</span></td>
      <td><strong style="color: var(--primary);">${v.total_hours.toFixed(1)} hrs</strong></td>
    `;
    els.volDirectoryTableBody.appendChild(row);
  });
}

// 4. Load Profile Settings Page (Volunteer)
function loadProfilePage() {
  els.profileName.value = state.user.name;
  els.profileEmail.value = state.user.email;
  els.profileSkills.value = state.user.skills || '';
  els.profileInterests.value = state.user.interests || '';
  els.profileAvailability.value = state.user.availability || 'Flexible';
}

// ==========================================
// FORM SUBMISSIONS & ACTIONS
// ==========================================

// Authentication Action: Submit login
els.formLogin.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (res.ok) {
      state.user = data.user;
      showToast('Logged in successfully.', 'success');
      handleUserLoggedIn();
      els.formLogin.reset();
    } else {
      showToast(data.error || 'Login failed.', 'error');
    }
  } catch (err) {
    showToast('Network error during login.', 'error');
  }
});

// Authentication Action: Submit Register
els.formRegister.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('register-name').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  const role = document.getElementById('register-role').value;

  if (password.length < 6) {
    showToast('Password must be at least 6 characters.', 'error');
    return;
  }

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role })
    });

    const data = await res.json();
    if (res.ok) {
      state.user = data.user;
      showToast('Registration successful.', 'success');
      handleUserLoggedIn();
      els.formRegister.reset();
    } else {
      showToast(data.error || 'Registration failed.', 'error');
    }
  } catch (err) {
    showToast('Network error during registration.', 'error');
  }
});

// Logout
els.btnLogout.addEventListener('click', async () => {
  try {
    const res = await fetch('/api/auth/logout', { method: 'POST' });
    if (res.ok) {
      state.user = null;
      showToast('Logged out successfully.', 'info');
      showView('auth');
    }
  } catch (err) {
    showToast('Failed to logout cleanly.', 'error');
  }
});

// Volunteer registration actions
async function registerForEvent(eventId) {
  try {
    const res = await fetch(`/api/events/${eventId}/register`, { method: 'POST' });
    const data = await res.json();
    if (res.ok) {
      showToast(data.message, 'success');
      if (state.activeView === 'volunteer-dashboard') refreshVolunteerDashboard();
    } else {
      showToast(data.error, 'error');
    }
  } catch (err) {
    showToast('Network error while registering.', 'error');
  }
}

async function cancelEventRegistration(eventId) {
  try {
    const res = await fetch(`/api/events/${eventId}/register`, { method: 'DELETE' });
    const data = await res.json();
    if (res.ok) {
      showToast(data.message, 'info');
      if (state.activeView === 'volunteer-dashboard') refreshVolunteerDashboard();
    } else {
      showToast(data.error, 'error');
    }
  } catch (err) {
    showToast('Network error cancelling registration.', 'error');
  }
}

// Profile Save Updates
els.formProfile.addEventListener('submit', async (e) => {
  e.preventDefault();
  const skills = els.profileSkills.value;
  const interests = els.profileInterests.value;
  const availability = els.profileAvailability.value;

  try {
    const res = await fetch('/api/volunteers/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skills, interests, availability })
    });

    const data = await res.json();
    if (res.ok) {
      state.user = data.user;
      showToast('Profile updated successfully.', 'success');
      loadProfilePage();
    } else {
      showToast(data.error || 'Failed to save updates.', 'error');
    }
  } catch (err) {
    showToast('Network error saving profile.', 'error');
  }
});

// Admin Hours Approval action
async function updateHoursLogStatus(logId, status) {
  try {
    const res = await fetch(`/api/hours/${logId}/approve`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });

    const data = await res.json();
    if (res.ok) {
      showToast(data.message, status === 'approved' ? 'success' : 'info');
      refreshAdminDashboard();
    } else {
      showToast(data.error, 'error');
    }
  } catch (err) {
    showToast('Error modifying verification status.', 'error');
  }
}

// ==========================================
// MODAL MANAGEMENT & FORMS
// ==========================================

// Event Modal Open (Create / Edit)
function openEventModal(event = null) {
  els.modalEvent.classList.remove('hidden');
  if (event) {
    els.modalEventTitle.textContent = 'Edit Event Details';
    els.eventModalId.value = event.id;
    els.eventTitle.value = event.title;
    els.eventDescription.value = event.description || '';
    els.eventDate.value = event.date;
    els.eventLocation.value = event.location;
    els.eventStatus.value = event.status;
  } else {
    els.modalEventTitle.textContent = 'Create New Event';
    els.formEvent.reset();
    els.eventModalId.value = '';
    els.eventStatus.value = 'upcoming';
  }
}

function closeEventModal() {
  els.modalEvent.classList.add('hidden');
  els.formEvent.reset();
}

els.btnCreateEventTrigger.addEventListener('click', () => openEventModal());
els.btnModalEventClose.addEventListener('click', closeEventModal);
els.btnModalEventCancel.addEventListener('click', closeEventModal);

els.formEvent.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = els.eventModalId.value;
  const title = els.eventTitle.value;
  const description = els.eventDescription.value;
  const date = els.eventDate.value;
  const location = els.eventLocation.value;
  const status = els.eventStatus.value;

  const url = id ? `/api/events/${id}` : '/api/events';
  const method = id ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, date, location, status })
    });

    const data = await res.json();
    if (res.ok) {
      showToast(data.message || 'Event saved successfully.', 'success');
      closeEventModal();
      loadEventsPage();
    } else {
      showToast(data.error || 'Failed to save event.', 'error');
    }
  } catch (err) {
    showToast('Network error saving event details.', 'error');
  }
});

async function deleteEvent(id) {
  try {
    const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (res.ok) {
      showToast(data.message, 'info');
      loadEventsPage();
    } else {
      showToast(data.error, 'error');
    }
  } catch (err) {
    showToast('Network error deleting event.', 'error');
  }
}

// Hours Log Modal Open (Volunteer)
async function openHoursModal() {
  els.modalHours.classList.remove('hidden');
  els.formHours.reset();
  els.hoursDate.value = new Date().toISOString().split('T')[0];

  // Fetch events list to populate drop down
  try {
    const res = await fetch('/api/events');
    if (res.ok) {
      const data = await res.json();
      state.events = data.events;

      // Populate events dropdown (Only completed events or events registered to)
      els.hoursEventSelect.innerHTML = '<option value="">-- Choose Event --</option>';
      state.events.forEach(e => {
        // Allow logging hours for completed events, or upcoming events they were registered to
        if (e.status === 'completed' || e.is_registered === 1) {
          const opt = document.createElement('option');
          opt.value = e.id;
          opt.textContent = `${e.title} (${e.date})`;
          els.hoursEventSelect.appendChild(opt);
        }
      });
    }
  } catch (err) {
    showToast('Failed to load opportunities list.', 'error');
  }
}

function closeHoursModal() {
  els.modalHours.classList.add('hidden');
  els.formHours.reset();
}

els.btnDashLogHours.addEventListener('click', openHoursModal);
els.navHours.addEventListener('click', openHoursModal);
els.btnModalHoursClose.addEventListener('click', closeHoursModal);
els.btnModalHoursCancel.addEventListener('click', closeHoursModal);

els.formHours.addEventListener('submit', async (e) => {
  e.preventDefault();
  const eventId = els.hoursEventSelect.value;
  const hours = els.hoursNumber.value;
  const date = els.hoursDate.value;
  const description = els.hoursDescription.value;

  if (!eventId) {
    showToast('Please select a valid event.', 'error');
    return;
  }

  try {
    const res = await fetch('/api/hours/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId, hours, date, description })
    });

    const data = await res.json();
    if (res.ok) {
      showToast(data.message, 'success');
      closeHoursModal();
      refreshVolunteerDashboard();
    } else {
      showToast(data.error, 'error');
    }
  } catch (err) {
    showToast('Network error logging hours.', 'error');
  }
});

// ==========================================
// TABS & FILTERS LISTENERS
// ==========================================
els.tabLogin.addEventListener('click', () => {
  els.tabLogin.classList.add('active');
  els.tabRegister.classList.remove('active');
  els.formLogin.classList.remove('hidden');
  els.formRegister.classList.add('hidden');
});

els.tabRegister.addEventListener('click', () => {
  els.tabRegister.classList.add('active');
  els.tabLogin.classList.remove('active');
  els.formRegister.classList.remove('hidden');
  els.formLogin.classList.add('hidden');
});

// Nav item routing triggers
els.navDashboard.addEventListener('click', () => {
  if (state.user.role === 'admin') {
    showView('admin-dashboard');
    refreshAdminDashboard();
  } else {
    showView('volunteer-dashboard');
    refreshVolunteerDashboard();
  }
});

els.navEvents.addEventListener('click', () => {
  showView('events');
  loadEventsPage();
});

els.navVolunteers.addEventListener('click', () => {
  showView('volunteers');
  loadVolunteersPage();
});

els.navProfile.addEventListener('click', () => {
  showView('profile');
  loadProfilePage();
});

els.btnDashBrowse.addEventListener('click', () => {
  showView('events');
  loadEventsPage();
});

// Filter triggers
els.eventSearch.addEventListener('input', renderEventsGrid);
els.eventStatusFilter.addEventListener('change', renderEventsGrid);
els.volSearch.addEventListener('input', renderVolunteersDirectory);
els.volAvailabilityFilter.addEventListener('change', renderVolunteersDirectory);

// Admin Quick Approval Counter jump
els.adminStatPendingTrigger.addEventListener('click', () => {
  // Smooth scroll down to table
  const table = els.adminHoursTableBody.closest('.card');
  table.scrollIntoView({ behavior: 'smooth' });
});

// ==========================================
// BOOTSTRAP APPLICATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  checkAuthSession();
});
