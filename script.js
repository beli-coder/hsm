/* ================================================
   HIGH SCHOOL MUSICAL — CFS
   JavaScript: SPA Navigation + Effects
================================================ */

// ---- SPA Navigation Helper ----
function showPage(pageId) {
  const targetPage = document.getElementById(pageId);
  if (!targetPage) {
    console.warn('Page not found: ' + pageId);
    return;
  }

  // Hide all pages
  document.querySelectorAll('.page').forEach(function(p) {
    p.classList.remove('active');
  });

  // Show target page
  targetPage.classList.add('active');

  // Update nav link active states
  document.querySelectorAll('.nav-link').forEach(function(link) {
    link.classList.toggle('active', link.dataset.page === pageId);
  });

  // Close mobile menu
  var navLinks = document.getElementById('navLinks');
  if (navLinks) {
    navLinks.classList.remove('open');
  }

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ---- Global Navigation Function ----
window.navigate = function(pageId) {
  window.location.hash = pageId;
  showPage(pageId);
};

// ---- Initial Page Load ----
function initializeNavigation() {
  var hash = window.location.hash.slice(1) || 'home';
  showPage(hash);
}

// ---- Hash Change Listener ----
window.addEventListener('hashchange', function() {
  var hash = window.location.hash.slice(1) || 'home';
  showPage(hash);
});

// ---- Nav Link Click Handlers ----
document.querySelectorAll('.nav-link').forEach(function(link) {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    var page = link.dataset.page;
    if (page) {
      window.navigate(page);
    }
  });
});

// ---- Footer Link Click Handlers ----
document.querySelectorAll('.footer-links a').forEach(function(link) {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    var href = link.getAttribute('href');
    var page = href.replace('#', '');
    if (page) {
      window.navigate(page);
    }
  });
});

// ---- Hamburger menu ----
var hamburger = document.getElementById('hamburger');
var navLinks = document.getElementById('navLinks');
if (hamburger) {
  hamburger.addEventListener('click', function() {
    navLinks.classList.toggle('open');
  });
}

// ---- Initialize Navigation ----
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeNavigation);
} else {
  initializeNavigation();
}

// ---- Stars ----
function createStars() {
  var container = document.getElementById('stars');
  if (!container) return;
  var count = 120;
  for (var i = 0; i < count; i++) {
    var star = document.createElement('div');
    var size = Math.random() * 2.4 + 0.4;
    var x = Math.random() * 100;
    var y = Math.random() * 100;
    var delay = Math.random() * 4;
    var dur = 2 + Math.random() * 3;
    star.style.cssText =
      'position: absolute; left: ' + x + '%; top: ' + y + '%; width: ' + size + 'px; height: ' + size + 'px; border-radius: 50%; background: rgba(255,255,255,' + (0.4 + Math.random() * 0.6) + '); animation: starTwinkle ' + dur + 's ease-in-out infinite ' + delay + 's; pointer-events: none;';
    container.appendChild(star);
  }

  var goldStars = 20;
  for (var i = 0; i < goldStars; i++) {
    var star = document.createElement('div');
    var size = Math.random() * 1.6 + 0.6;
    var isPurple = Math.random() > 0.5;
    var bgColor = isPurple
      ? 'rgba(124,58,237,' + (0.5 + Math.random() * 0.5) + ')'
      : 'rgba(212,168,67,' + (0.5 + Math.random() * 0.5) + ')';
    star.style.cssText =
      'position: absolute; left: ' + (Math.random() * 100) + '%; top: ' + (Math.random() * 100) + '%; width: ' + size + 'px; height: ' + size + 'px; border-radius: 50%; background: ' + bgColor + '; animation: starTwinkle ' + (2 + Math.random() * 4) + 's ease-in-out infinite ' + (Math.random() * 5) + 's; pointer-events: none;';
    container.appendChild(star);
  }
}

var styleSheet = document.createElement('style');
styleSheet.textContent = '@keyframes starTwinkle { 0%, 100% { opacity: 0.2; transform: scale(1); } 50% { opacity: 1; transform: scale(1.5); } }';
document.head.appendChild(styleSheet);
createStars();

window.addEventListener('scroll', function() {
  var nav = document.getElementById('nav');
  if (window.scrollY > 40) {
    nav.style.background = 'rgba(8,6,8,0.98)';
    nav.style.backdropFilter = 'blur(20px)';
  } else {
    nav.style.background = 'linear-gradient(to bottom, rgba(8,6,8,0.98), rgba(8,6,8,0.85))';
  }
});

function showToast(message, type) {
  type = type || 'success';
  var existing = document.querySelector('.toast');
  if (existing) existing.remove();

  var toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  var bgColor = type === 'success' ? '#d4a843' : '#7c3aed';
  var textColor = type === 'success' ? '#06040e' : '#f0eaff';
  toast.style.cssText =
    'position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%) translateY(20px); background: ' + bgColor + '; color: ' + textColor + '; padding: 14px 28px; font-family: Montserrat, sans-serif; font-size: 13px; letter-spacing: 1.5px; font-weight: 600; z-index: 999; opacity: 0; transition: opacity 0.4s, transform 0.4s; max-width: 90vw; text-align: center;';
  document.body.appendChild(toast);

  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });
  });

  setTimeout(function() {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(10px)';
    setTimeout(function() {
      toast.remove();
    }, 400);
  }, 3200);
}

var observer = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

function observeElements(selectors) {
  selectors.forEach(function(sel) {
    document.querySelectorAll(sel).forEach(function(el, i) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.6s ease ' + (i * 0.08) + 's, transform 0.6s ease ' + (i * 0.08) + 's';
      observer.observe(el);
    });
  });
}

setTimeout(function() {
  observeElements([
    '.cast-card',
    '.crew-item',
    '.feature-tile',
    '.date-item',
    '.value-card',
    '.gallery-item',
    '.fact-item',
    '.crew-grid'
  ]);
}, 100);

document.querySelectorAll('.gallery-item').forEach(function(item) {
  item.addEventListener('click', function() {
    var caption = (item.querySelector('.gallery-caption') || {}).textContent || '';
    var overlay = document.createElement('div');
    overlay.style.cssText =
      'position: fixed; inset: 0; z-index: 200; background: rgba(8,6,8,0.95); display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; padding: 24px;';
    var svgClone = item.querySelector('svg');
    if (svgClone) {
      svgClone = svgClone.cloneNode(true);
      svgClone.style.cssText = 'max-width: 800px; width: 100%; max-height: 70vh;';
      overlay.appendChild(svgClone);
    }
    var cap = document.createElement('p');
    cap.textContent = caption;
    cap.style.cssText =
      'margin-top: 20px; font-family: Montserrat, sans-serif; font-size: 13px; letter-spacing: 2px; color: rgba(201,168,76,0.8); text-transform: uppercase;';
    overlay.appendChild(cap);

    var closeHint = document.createElement('p');
    closeHint.textContent = 'Click to close';
    closeHint.style.cssText = 'margin-top: 10px; font-size: 11px; color: rgba(160,144,128,0.4); font-family: Montserrat;';
    overlay.appendChild(closeHint);

    overlay.addEventListener('click', function() {
      overlay.remove();
    });
    document.body.appendChild(overlay);
  });
});
