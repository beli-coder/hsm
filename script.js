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
    // Matches if the link's data-page OR its href matches the pageId
    const isTarget = link.dataset.page === pageId || link.getAttribute('href') === '#' + pageId;
    link.classList.toggle('active', isTarget);
  });

  // Close mobile menu
  var navLinks = document.getElementById('navLinks');
  if (navLinks) {
    navLinks.classList.remove('open');
  }

  // Scroll to top. Use 'instant' to avoid competing with the browser's own
  // smooth-scroll-to-anchor triggered by html { scroll-behavior: smooth }.
  window.scrollTo({ top: 0, behavior: 'instant' });
}

// ---- Routing Logic ----
function handleRouting() {
  // Use the hash from the URL, default to 'home'
  var hash = window.location.hash.slice(1) || 'home';
  showPage(hash);
}

// ---- Event Listeners ----

// Listen for browser back/forward and link clicks
window.addEventListener('hashchange', handleRouting);

// Initialize on first load.
// Guard against Cloudflare Rocket Loader (and async/defer loading) which can
// fire DOMContentLoaded before this script executes, causing the listener to
// never run and leaving every page stuck on the default #home section.
function init() {
  handleRouting();
  createStars();
}

if (document.readyState === 'loading') {
  // HTML not yet fully parsed — wait for DOMContentLoaded
  document.addEventListener('DOMContentLoaded', init);
} else {
  // DOM is already ready (script was deferred/async by Rocket Loader or similar)
  init();
}

// Hamburger menu toggle
var hamburger = document.getElementById('hamburger');
var navLinks = document.getElementById('navLinks');
if (hamburger) {
  hamburger.addEventListener('click', function() {
    navLinks.classList.toggle('open');
  });
}

// ---- Stars Effect ----
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
}

// ---- UI Feedback (Toast) ----
function showToast(message, type) {
  var toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toast.style.cssText = 'position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%); background: #d4a843; color: #06040e; padding: 14px 28px; z-index: 999; transition: opacity 0.4s;';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ---- RSVP Form ----
function handleRsvp() {
  var name  = (document.getElementById('ticket-name')  || {}).value || '';
  var email = (document.getElementById('ticket-email') || {}).value || '';
  var date  = (document.getElementById('ticket-date')  || {}).value || '';
  if (!name.trim() || !email.trim() || !date) {
    showToast('Please fill in all fields.', 'error');
    return;
  }
  showToast('Reserved for ' + name.trim() + '! We\u2019ll be in touch. \uD83C\uDFAD', 'success');
}

// ---- Video player ----
// Replace VIDEO_ID_HERE in the src attrs (index.html) with the real YouTube video ID.
// Clicking a highlight thumbnail swaps the main player to that video.
function playVideo(videoId) {
  var frame = document.getElementById('mainVideoFrame');
  if (!frame || videoId === 'VIDEO_ID_HERE') return;
  frame.src = 'https://www.youtube-nocookie.com/embed/' + videoId + '?autoplay=1&rel=0&modestbranding=1';
  frame.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ---- Intersection Observer for Animations ----
var observer = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.cast-card, .feature-tile').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'all 0.6s ease-out';
  observer.observe(el);
});