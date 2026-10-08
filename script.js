/* ============================================================
   SmartForm — Advanced Registration & User Management
   Vanilla JavaScript ES6+
   ============================================================ */

'use strict';

/* ============================================================
   STORAGE KEY
   ============================================================ */

const STORAGE_KEY = 'smartform.users';
const VALID_ROUTES = ['home', 'register', 'users', 'about'];

/* ============================================================
   UTILITY HELPERS
   ============================================================ */

/**
 * Sanitize a user string to prevent unintended HTML injection when using innerHTML
 * Falls back to textContent for dynamic card creation (used in practice).
 */
const sanitize = (str) => String(str ?? '')
    .replace(/[&<>"']/g, (ch) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[ch]));

/** Escape for plain text display; same as sanitize. */
const escapeText = sanitize;

/**
 * Format a date as "DD MMM YYYY"
 */
const formatDate = (date) => {
    const d = new Date(date);
    if (isNaN(d)) return '';
    const day = d.getDate().toString().padStart(2, '0');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
};

/**
 * Extract a user's initials from their full name.
 */
const getInitials = (name) => {
    const parts = String(name || '')
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2);
    if (parts.length === 0) return '??';
    return parts
        .map((p) => p[0]?.toUpperCase() ?? '')
        .join('');
};

/* ============================================================
   TOAST NOTIFICATIONS
   ============================================================ */

const showMessage = (title, description, type = 'success', duration = 3800) => {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', type === 'error' ? 'alert' : 'status');

    const iconPath = type === 'success'
        ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>'
        : '<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>';

    const color = type === 'success' ? '#10B981' : '#EF4444';

    toast.innerHTML = `
        <div class="toast-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${iconPath}</svg>
        </div>
        <div class="toast-content">
            <div class="toast-title">${escapeText(title)}</div>
            <div class="toast-desc">${escapeText(description)}</div>
        </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('toast-exit');
        toast.addEventListener('animationend', () => toast.remove(), { once: true });
    }, duration);
};

/* ============================================================
   LOCALSTORAGE MANAGEMENT
   ============================================================ */

const getUsers = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (err) {
        console.warn('Failed to read users from LocalStorage:', err);
        return [];
    }
};

const saveUsers = (users) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
        return true;
    } catch (err) {
        console.warn('Failed to save users to LocalStorage:', err);
        showMessage('Storage Error', 'Unable to save data. Please check browser storage.', 'error');
        return false;
    }
};

const addUser = (user) => {
    const users = getUsers();
    users.push(user);
    saveUsers(users);
};

const removeUser = (userId) => {
    const users = getUsers().filter((u) => u.id !== userId);
    saveUsers(users);
};

/* ============================================================
   CLIENT-SIDE ROUTING
   ============================================================ */

const getRoute = () => {
    const hash = window.location.hash.replace(/^#/, '').trim().toLowerCase();
    return VALID_ROUTES.includes(hash) ? hash : 'home';
};

const setActiveNav = (route) => {
    document.querySelectorAll('.nav-link').forEach((link) => {
        link.classList.toggle('active', link.dataset.route === route);
    });
};

const showPage = (route) => {
    document.querySelectorAll('.page-section').forEach((section) => {
        section.classList.toggle('active', section.dataset.page === route);
    });
    setActiveNav(route);
    window.scrollTo({ top: 0, behavior: 'auto' });
};

const handleRoute = () => {
    const route = getRoute();
    if (!window.location.hash) {
        window.history.replaceState(null, '', '#home');
    } else if (!VALID_ROUTES.includes(window.location.hash.replace(/^#/, '').trim().toLowerCase())) {
        window.history.replaceState(null, '', '#home');
    }
    showPage(getRoute());
};

/* ============================================================
   MOBILE NAV TOGGLE
   ============================================================ */

const setupNavToggle = () => {
    const toggle = document.getElementById('navToggle');
    const menu = document.getElementById('navMenu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {
        const open = menu.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(open));
    });

    document.querySelectorAll('.nav-link').forEach((link) => {
        link.addEventListener('click', () => {
            menu.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
        });
    });
};

/* ============================================================
   FIELD VALIDATION HELPERS
   ============================================================ */

const setFieldState = (fieldGroup, state, message = '') => {
    const errorEl = fieldGroup.querySelector('[data-error-msg]');
    fieldGroup.classList.remove('valid', 'error');
    if (state === 'valid') fieldGroup.classList.add('valid');
    else if (state === 'error') fieldGroup.classList.add('error');
    if (errorEl) errorEl.textContent = message;
};

const getFieldGroup = (name) => document.querySelector(`.form-group[data-field="${name}"]`);

const NAME_REGEX = /^[A-Za-zÀ-ÿ'’\- .]+$/;
const EMAIL_REGEX = /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/;
const SPECIAL_REGEX = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/;

/**
 * Validate full name field and update UI.
 * Returns true if valid.
 */
const validateName = (value) => {
    const group = getFieldGroup('name');
    const trimmed = value.trim();

    if (!trimmed) {
        setFieldState(group, 'error', 'Please enter your full name.');
        return false;
    }
    if (trimmed.length < 3) {
        setFieldState(group, 'error', 'Name must contain at least 3 characters.');
        return false;
    }
    if (!NAME_REGEX.test(trimmed)) {
        setFieldState(group, 'error', 'Name can only contain letters, spaces, hyphens and apostrophes.');
        return false;
    }
    setFieldState(group, 'valid');
    return true;
};

/**
 * Validate email field and update UI.
 */
const validateEmail = (value) => {
    const group = getFieldGroup('email');
    const trimmed = value.trim();

    if (!trimmed) {
        setFieldState(group, 'error', 'Please enter your email address.');
        return false;
    }
    if (!EMAIL_REGEX.test(trimmed)) {
        setFieldState(group, 'error', 'Please enter a valid email address.');
        return false;
    }
    setFieldState(group, 'valid');
    return true;
};

/**
 * Validate password, update requirements list, strength bar and field state.
 * Returns { valid, strength }
 */
const validatePassword = (value) => {
    const group = getFieldGroup('password');
    const lengthValid = value.length >= 8;
    const upperValid = /[A-Z]/.test(value);
    const lowerValid = /[a-z]/.test(value);
    const numberValid = /[0-9]/.test(value);
    const specialValid = SPECIAL_REGEX.test(value);

    // Update requirements list UI
    const checks = {
        length: lengthValid,
        upper: upperValid,
        lower: lowerValid,
        number: numberValid,
        special: specialValid,
    };

    document.querySelectorAll('#passwordReqs li').forEach((li) => {
        const req = li.dataset.req;
        li.classList.toggle('valid', Boolean(checks[req]));
    });

    const allValid = Object.values(checks).every(Boolean);
    const validCount = Object.values(checks).filter(Boolean).length;

    updatePasswordStrength(value.length > 0 ? validCount : 0);

    if (value.length === 0) {
        setFieldState(group, 'error', 'Please enter a password.');
        return { valid: false, strength: 0 };
    }
    if (!lengthValid) {
        setFieldState(group, 'error', 'Password must contain at least 8 characters.');
    } else if (!upperValid) {
        setFieldState(group, 'error', 'Password must contain an uppercase letter.');
    } else if (!lowerValid) {
        setFieldState(group, 'error', 'Password must contain a lowercase letter.');
    } else if (!numberValid) {
        setFieldState(group, 'error', 'Password must contain a number.');
    } else if (!specialValid) {
        setFieldState(group, 'error', 'Password must contain a special character.');
    } else {
        setFieldState(group, 'valid');
    }

    return { valid: allValid, strength: validCount };
};

/**
 * Update the strength visual (bar width + label).
 */
const updatePasswordStrength = (validCount) => {
    const fill = document.getElementById('strengthFill');
    const label = document.getElementById('strengthText');
    if (!fill || !label) return;

    const map = [
        { label: '--',     width: '0%',  bg: 'var(--graphite-300)', level: '' },
        { label: 'Weak',   width: '30%', bg: 'var(--error-500)',   level: 'weak' },
        { label: 'Weak',   width: '40%', bg: 'var(--error-500)',   level: 'weak' },
        { label: 'Medium', width: '60%', bg: 'var(--warning-500)', level: 'medium' },
        { label: 'Medium', width: '75%', bg: 'var(--warning-500)', level: 'medium' },
        { label: 'Strong', width: '100%', bg: 'var(--success-500)', level: 'strong' },
    ];

    const entry = map[Math.min(validCount, 5)];
    fill.style.width = entry.width;
    fill.style.backgroundColor = entry.bg;
    label.textContent = entry.label;
    label.dataset.level = entry.level;
};

/**
 * Validate confirm password matches password.
 */
const validateConfirm = (confirmValue, passwordValue) => {
    const group = getFieldGroup('confirm');

    if (!confirmValue) {
        setFieldState(group, 'error', 'Please confirm your password.');
        return false;
    }
    if (confirmValue !== passwordValue) {
        setFieldState(group, 'error', 'Passwords do not match.');
        return false;
    }
    setFieldState(group, 'valid');
    return true;
};

/**
 * Validate entire form; returns true if fully valid.
 */
const validateForm = (form) => {
    const data = new FormData(form);
    const name = String(data.get('fullName') ?? '');
    const email = String(data.get('email') ?? '');
    const password = String(data.get('password') ?? '');
    const confirm = String(data.get('confirmPassword') ?? '');

    const v1 = validateName(name);
    const v2 = validateEmail(email);
    const { valid: v3 } = validatePassword(password);
    const v4 = validateConfirm(confirm, password);

    // Email uniqueness check
    if (v2 && email) {
        const existing = getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (existing) {
            setFieldState(getFieldGroup('email'), 'error', 'This email is already registered.');
            return false;
        }
    }

    return v1 && v2 && v3 && v4;
};

/* ============================================================
   PASSWORD TOGGLE
   ============================================================ */

const setupPasswordToggle = () => {
    const btn = document.getElementById('togglePassword');
    const input = document.getElementById('password');
    if (!btn || !input) return;

    btn.addEventListener('click', () => {
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        const label = btn.querySelector('.toggle-text');
        if (label) label.textContent = isPassword ? 'Hide' : 'Show';
        btn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
    });
};

/* ============================================================
   DYNAMIC USER CARD CREATION
   ============================================================ */

const createUserCard = (user) => {
    const card = document.createElement('div');
    card.className = 'user-card';
    card.dataset.userId = String(user.id);

    const header = document.createElement('div');
    header.className = 'user-card-header';

    const avatar = document.createElement('div');
    avatar.className = 'user-avatar';
    avatar.textContent = getInitials(user.name);

    const info = document.createElement('div');
    info.className = 'user-info';

    const nameEl = document.createElement('div');
    nameEl.className = 'user-name';
    nameEl.textContent = user.name;

    const emailEl = document.createElement('div');
    emailEl.className = 'user-email';
    emailEl.textContent = user.email;

    info.appendChild(nameEl);
    info.appendChild(emailEl);
    header.appendChild(avatar);
    header.appendChild(info);

    const meta = document.createElement('div');
    meta.className = 'user-card-meta';
    meta.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>';
    const metaText = document.createElement('span');
    metaText.textContent = `Registered: ${formatDate(user.createdAt)}`;
    meta.appendChild(metaText);

    const actions = document.createElement('div');
    actions.className = 'user-card-actions';

    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'btn-delete';
    delBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"></path></svg> Delete';
    delBtn.addEventListener('click', () => deleteUser(user.id));

    actions.appendChild(delBtn);

    card.appendChild(header);
    card.appendChild(meta);
    card.appendChild(actions);

    return card;
};

const updateUserCount = (count) => {
    const el = document.getElementById('userCount');
    if (!el) return;
    el.textContent = String(count);
    el.classList.remove('pulse');
    void el.offsetWidth; // reflow to restart animation
    el.classList.add('pulse');
};

const toggleEmptyState = (hasUsers) => {
    const empty = document.getElementById('emptyState');
    const container = document.getElementById('usersContainer');
    if (!empty || !container) return;

    if (hasUsers) {
        empty.classList.add('hidden');
        container.style.display = '';
    } else {
        empty.classList.remove('hidden');
        container.style.display = 'none';
    }
};

const renderUsers = () => {
    const container = document.getElementById('usersContainer');
    if (!container) return;

    const users = getUsers();
    container.textContent = '';

    users.forEach((user) => {
        container.appendChild(createUserCard(user));
    });

    updateUserCount(users.length);
    toggleEmptyState(users.length > 0);
};

const deleteUser = (userId) => {
    const card = document.querySelector(`.user-card[data-user-id="${userId}"]`);
    const user = getUsers().find((u) => u.id === userId);

    if (card) {
        card.classList.add('removing');
        card.addEventListener('animationend', () => {
            removeUser(userId);
            renderUsers();
            showMessage(
                'User Removed',
                user ? `${escapeText(user.name)} has been removed.` : 'The account has been removed.',
                'success',
                3000
            );
        }, { once: true });
    } else {
        removeUser(userId);
        renderUsers();
    }
};

/* ============================================================
   FORM SUBMISSION
   ============================================================ */

const setupForm = () => {
    const form = document.getElementById('registrationForm');
    if (!form) return;

    // Real-time validation bindings
    const nameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('confirmPassword');

    // Name
    nameInput.addEventListener('input', (e) => {
        if (e.target.value.trim() || e.target.hasAttribute('data-touched')) {
            validateName(e.target.value);
        }
    });
    nameInput.addEventListener('blur', (e) => {
        e.target.setAttribute('data-touched', '1');
        validateName(e.target.value);
    });

    // Email
    emailInput.addEventListener('input', (e) => {
        if (e.target.value.trim() || e.target.hasAttribute('data-touched')) {
            validateEmail(e.target.value);
        }
    });
    emailInput.addEventListener('blur', (e) => {
        e.target.setAttribute('data-touched', '1');
        validateEmail(e.target.value);
    });

    // Password
    passwordInput.addEventListener('input', (e) => {
        validatePassword(e.target.value);
        // Also re-check confirm if present
        if (confirmInput.value) {
            validateConfirm(confirmInput.value, e.target.value);
        }
    });
    passwordInput.addEventListener('blur', (e) => {
        validatePassword(e.target.value);
    });

    // Confirm password
    confirmInput.addEventListener('input', (e) => {
        validateConfirm(e.target.value, passwordInput.value);
    });
    confirmInput.addEventListener('blur', (e) => {
        validateConfirm(e.target.value, passwordInput.value);
    });

    // Submit
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const nameEl = document.getElementById('fullName');
        const emailEl = document.getElementById('email');

        nameEl.setAttribute('data-touched', '1');
        emailEl.setAttribute('data-touched', '1');

        if (!validateForm(form)) {
            showMessage('Registration Failed', 'Please fix the errors highlighted in the form.', 'error');
            const firstError = document.querySelector('.form-group.error .form-input');
            if (firstError) firstError.focus({ preventScroll: false });
            return;
        }

        // Build user object — NEVER store password
        const user = {
            id: Date.now(),
            name: nameEl.value.trim(),
            email: emailEl.value.trim(),
            createdAt: new Date().toISOString(),
        };

        addUser(user);
        renderUsers();
        form.reset();

        // Clear field states + reset password indicators
        document.querySelectorAll('.form-group').forEach((g) => g.classList.remove('valid', 'error'));
        document.querySelectorAll('.field-error').forEach((e) => (e.textContent = ''));
        validatePassword('');

        // Reset confirm text (since form.reset() keeps type unchanged)
        const toggleText = document.querySelector('#togglePassword .toggle-text');
        const pwInput = document.getElementById('password');
        if (pwInput.type !== 'password') {
            pwInput.type = 'password';
            if (toggleText) toggleText.textContent = 'Show';
        }

        showMessage(
            'Registration successful!',
            'Your account has been added to the user list.',
            'success',
            4200
        );
    });
};

/* ============================================================
   INITIALIZATION
   ============================================================ */

const init = () => {
    setupNavToggle();
    setupPasswordToggle();
    setupForm();
    renderUsers();
    handleRoute();

    window.addEventListener('hashchange', handleRoute);

    // Safety: clear hash on load if invalid or empty, handled by handleRoute
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
