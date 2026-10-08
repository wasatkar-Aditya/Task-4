# SmartForm — Advanced Registration & User Management

> **Subtitle:** Complex Form Validation • Dynamic DOM • Client-Side Routing

---

## Objective

This project was built as part of **Internship Task 4: Complex Form Validation and Dynamic DOM Manipulation**. It demonstrates a professional, framework-free frontend web application that showcases:

- Advanced real-time form validation
- Password strength verification with live requirement indicators
- Dynamic DOM manipulation for user management
- Hash-based client-side routing with browser history support
- Persistent client-side storage via LocalStorage
- A fully responsive, accessible, and polished user interface

Everything is written in plain **HTML5, CSS3, and Vanilla JavaScript ES6+** — no libraries, no frameworks, no backend.

---

## Features

### ✅ Complex Form Validation
- Full Name validation (min 3 characters, reasonable character set)
- Email format validation using standard RFC-style regex
- Password strength validation (8+ chars, uppercase, lowercase, number, special)
- Confirm password cross-field matching
- Live email uniqueness check against existing registered users
- Specific, human-readable error messages (no generic "invalid input")

### 🔐 Password Features
- Live **password strength meter** (Weak / Medium / Strong) with animated bar
- Visual **password requirement checklist** that highlights each rule as it's met
- **Show/Hide Password** toggle button (dynamically switches input `type`)

### ⚡ Real-Time Validation
- Validation runs on `input`, `blur`, and `submit` events
- Valid fields receive a green success indicator
- Invalid fields receive a red error indicator with inline message
- Confirm-password mismatch is shown **instantly** while typing

### 🎯 Dynamic DOM Manipulation
- User cards are **generated dynamically** via JavaScript (`createElement`, `appendChild`, `classList`, etc.)
- Total user count updates automatically with a pulse animation
- Delete operation removes cards from DOM and storage with exit animation
- Empty state toggles when zero users exist
- Validation messages and status icons are injected/updated dynamically

### 🗑️ Delete Functionality
- Every user card has a **Delete** button
- Removes the user from LocalStorage
- Removes the user card from the DOM (animated out)
- Updates the total user count
- Shows a confirmation toast notification
- **No page reload required**

### 💾 LocalStorage
- Users persist across browser sessions
- Passwords are **NEVER** stored — only `id`, `name`, `email`, and `createdAt`

### 🧭 Client-Side Routing
- Hash-based navigation (`#home`, `#register`, `#users`, `#about`)
- **No browser reloads** when switching pages
- Browser **Back / Forward** buttons work correctly
- Invalid routes automatically redirect to `#home`
- Active navigation item is visually highlighted
- Page sections fade + slide in on route change

### 📱 Responsive Design
- Desktop, tablet, and mobile layouts
- Collapsible hamburger navigation on small screens
- User cards stack vertically on mobile
- Form fits without horizontal scrolling
- Large, tap-friendly buttons

### ✨ Subtle Animations
- Button + card hover effects
- Page section transitions
- Input focus transitions
- Password strength bar animation
- User card enter / exit animations
- Animated toast notifications
- User count pulse on change

---

## Technologies

| Technology | Purpose |
| --- | --- |
| **HTML5** | Semantic markup, accessible forms, labels, nav, footer |
| **CSS3** | Custom properties (variables), flexbox, grid, transitions, keyframes, responsive media queries |
| **JavaScript ES6+** | `const` / `let`, arrow functions, template literals, destructuring, modern DOM API |
| **LocalStorage** | Persistent client-side user storage |
| **DOM API** | `createElement`, `appendChild`, `remove`, `classList`, `textContent`, event listeners |

---

## Routes

| Hash Route | Page | Description |
| --- | --- | --- |
| `#home` | Home | Hero landing with feature cards and call-to-action |
| `#register` | Register | Full registration form with live validation |
| `#users` | Users | User dashboard — cards, count, delete, empty state |
| `#about` | About | Project objective, features, and tech stack overview |

Invalid routes (e.g. `#asdf`) redirect automatically to `#home`.

---

## How to Run

This is a **static** project — no build step, no server required.

### Option 1: Open directly (simplest)
1. Navigate to the project folder: `smart-form/`
2. Double-click **`index.html`** to open it in your browser.
3. The URL will be something like `file:///C:/.../smart-form/index.html`
4. Use the navigation bar to switch pages, or add `#home`, `#register`, `#users`, `#about` to the hash.

### Option 2: VS Code Live Server (recommended)
1. Open the `smart-form/` folder in VS Code.
2. Install the **Live Server** extension if not installed.
3. Right-click `index.html` → **Open with Live Server**.
4. The app opens at `http://127.0.0.1:5500/index.html`

> LocalStorage works with both approaches.

---

## Project Structure

```
smart-form/
├── index.html   # Semantic markup: navbar, 4 pages, form, users container
├── style.css    # Complete styling with CSS variables + responsive
├── script.js    # Routing, validation, DOM, LocalStorage, interactions
└── README.md    # This file
```

---

## Internship Requirements Mapping

| Requirement | Implementation |
| --- | --- |
| **Complex Form Validation** | Password strength (5 criteria) + email regex + name rules + confirm-password matching + uniqueness check — all with specific, non-generic error messages |
| **Dynamic DOM Manipulation** | User cards created via `createElement()`, injected into the grid; total count updates; delete operation removes DOM nodes with animation; form validation messages toggle live |
| **Client-Side Routing** | Hash-based router (`#home` / `#register` / `#users` / `#about`) with `hashchange` listener; browser history works; invalid routes redirect to home; no page reloads |

---

## Security & Best Practices

- ✅ **Passwords are never stored** in LocalStorage or shown in the Users page
- ✅ User-supplied content is inserted via `textContent` (not `innerHTML`) for name/email — preventing XSS
- ✅ No `eval()` used anywhere
- ✅ No inline `onclick` or `oninput` handlers — all listeners attached via JS
- ✅ Semantic HTML: `<nav>`, `<main>`, `<section>`, `<form>`, `<label>`, `<button>`
- ✅ All inputs have associated `<label>` tags
- ✅ Delete actions use `<button>` elements, not clickable `<div>`s
- ✅ `aria-live="polite"` region for toast notifications

---

## Validation Test Checklist

Use these values to verify every validation path:

| Test | Input | Expected |
| --- | --- | --- |
| Empty name | `""` | "Please enter your full name." |
| Short name | `"Al"` | "Name must contain at least 3 characters." |
| Invalid email | `"abc"` | "Please enter a valid email address." |
| Weak password — too short | `"Ab1!"` | "Password must contain at least 8 characters." |
| Missing uppercase | `"abcdefg1!"` | "Password must contain an uppercase letter." |
| Missing lowercase | `"ABCDEFG1!"` | "Password must contain a lowercase letter." |
| Missing number | `"Abcdefg!"` | "Password must contain a number." |
| Missing special | `"Abcdefg1"` | "Password must contain a special character." |
| Password mismatch | password `Abcdefg1!`, confirm `Abcdefg2!` | "Passwords do not match." |
| Valid registration | name `John Doe`, email `j@example.com`, password `StrongPass1!` | Success toast, user added to Users page, password NOT stored |
