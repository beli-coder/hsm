/* ================================================
   HIGH SCHOOL MUSICAL — CFS
   JavaScript: SPA Navigation + Effects
================================================ */

// ---- SPA Navigation ----

function showPage(pageId) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  // Show target
  const target = document.getElementById(pageId);
  if (target) target.classList.add('active');
  // Update nav links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.page === pageId);
  });
  // Close mobile menu
  document.getElementById('navLinks').classList.remove('open');
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function navigate(pageId) {
  if (window.location.hash.replace('#', '') !== pageId) {
    window.location.hash = pageId;
  } else {
    showPage(pageId);
  }
}
// Make navigate globally accessible for inline onclick handlers
window.navigate = navigate;

// Handle nav link clicks
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    navigate(link.dataset.page);
  });
});

// Footer link clicks
document.querySelectorAll('.footer-links a').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const href = link.getAttribute('href').replace('#', '');
    navigate(href);
  });
});

// Handle initial page load with hash (call directly, not in DOMContentLoaded)
const hash = window.location.hash.replace('#', '');
if (hash && document.getElementById(hash)) {
  showPage(hash);
} else {
  showPage('home');
}

        // Handle browser navigation (back/forward/hash changes)
        window.addEventListener('hashchange', () => {
          const hash = window.location.hash.replace('#', '');
          if (hash && document.getElementById(hash)) {
            showPage(hash);
          } else {
            showPage('home');
          }
        });

// Hamburger menu
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

// ---- Stars ----
function createStars() {
  const container = document.getElementById('stars');
  if (!container) return;
  const count = 120;
  for (let i = 0; i < count; i++) {
    const star = document.createElement('div');
    const size = Math.random() * 2.4 + 0.4;
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const delay = Math.random() * 4;
    const dur = 2 + Math.random() * 3;
    star.style.cssText = `
      position: absolute;
      left: ${x}%;
      top: ${y}%;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: rgba(255,255,255,${0.4 + Math.random() * 0.6});
      animation: starTwinkle ${dur}s ease-in-out infinite ${delay}s;
      pointer-events: none;
    `;
    container.appendChild(star);
  }

  // Add gold star sparkles
  const goldStars = 20;
  for (let i = 0; i < goldStars; i++) {
    const star = document.createElement('div');
    const size = Math.random() * 1.6 + 0.6;
    const isPurple = Math.random() > 0.5;
    star.style.cssText = `
      position: absolute;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: ${isPurple ? `rgba(124,58,237,${0.5 + Math.random() * 0.5})` : `rgba(212,168,67,${0.5 + Math.random() * 0.5})`};
      animation: starTwinkle ${2 + Math.random() * 4}s ease-in-out infinite ${Math.random() * 5}s;
      pointer-events: none;
    `;
    container.appendChild(star);
  }
}

// Inject keyframes
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes starTwinkle {
    0%, 100% { opacity: 0.2; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.5); }
  }
`;
document.head.appendChild(styleSheet);
createStars();

// ---- Nav scroll effect ----
window.addEventListener('scroll', () => {
  const nav = document.getElementById('nav');
  if (window.scrollY > 40) {
    nav.style.background = 'rgba(8,6,8,0.98)';
    nav.style.backdropFilter = 'blur(20px)';
  } else {
    nav.style.background = 'linear-gradient(to bottom, rgba(8,6,8,0.98), rgba(8,6,8,0.85))';
  }
});

// ---- Ticket form handler ----
const ticketBtn = document.querySelector('.btn-ticket');
if (ticketBtn) {
  ticketBtn.addEventListener('click', () => {
    const name = document.querySelector('.ticket-form input[type="text"]')?.value.trim();
    const email = document.querySelector('.ticket-form input[type="email"]')?.value.trim();
    if (!name || !email) {
      showToast('Please fill in your name and email.', 'warn');
      return;
    }
    if (!email.includes('@')) {
      showToast('Please enter a valid email address.', 'warn');
      return;
    }
    showToast(`🎭 Reserved! Confirmation sent to ${email}`, 'success');
  });
}

// ---- Toast notification ----
function showToast(message, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 32px;
    left: 50%;
    transform: translateX(-50%) translateY(20px);
    background: ${type === 'success' ? '#d4a843' : '#7c3aed'};
    color: ${type === 'success' ? '#06040e' : '#f0eaff'};
    padding: 14px 28px;
    font-family: 'Montserrat', sans-serif;
    font-size: 13px;
    letter-spacing: 1.5px;
    font-weight: 600;
    z-index: 999;
    opacity: 0;
    transition: opacity 0.4s, transform 0.4s;
    max-width: 90vw;
    text-align: center;
  `;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(10px)';
    setTimeout(() => toast.remove(), 400);
  }, 3200);
}

// ---- Intersection Observer for subtle entry animations ----
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

function observeElements(selectors) {
  selectors.forEach(sel => {
    document.querySelectorAll(sel).forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = `opacity 0.6s ease ${i * 0.08}s, transform 0.6s ease ${i * 0.08}s`;
      observer.observe(el);
    });
  });
}

// Wait a tick so the initial page renders first
setTimeout(() => {
  observeElements([
    '.cast-card', '.crew-item', '.feature-tile',
    '.date-item', '.value-card', '.gallery-item',
    '.fact-item', '.crew-grid'
  ]);
}, 100);

// ---- Gallery lightbox ----
document.querySelectorAll('.gallery-item').forEach(item => {
  item.addEventListener('click', () => {
    const caption = item.querySelector('.gallery-caption')?.textContent || '';
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 200;
      background: rgba(8,6,8,0.95);
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      cursor: pointer; padding: 24px;
    `;
    const svgClone = item.querySelector('svg')?.cloneNode(true);
    if (svgClone) {
      svgClone.style.cssText = 'max-width: 800px; width: 100%; max-height: 70vh;';
      overlay.appendChild(svgClone);
    }
    const cap = document.createElement('p');
    cap.textContent = caption;
    cap.style.cssText = `
      margin-top: 20px;
      font-family: 'Montserrat', sans-serif;
      font-size: 13px;
      letter-spacing: 2px;
      color: rgba(201,168,76,0.8);
      text-transform: uppercase;
    `;
    overlay.appendChild(cap);

    const closeHint = document.createElement('p');
    closeHint.textContent = 'Click to close';
    closeHint.style.cssText = 'margin-top:10px; font-size: 11px; color: rgba(160,144,128,0.4); font-family: Montserrat;';
    overlay.appendChild(closeHint);

    overlay.addEventListener('click', () => overlay.remove());
    document.body.appendChild(overlay);
  });
});
