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
  loadCMSContent();
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

// ============================================
// CMS Dynamic Content Loader
// ============================================
function loadCMSContent() {
  fetch('/api/content')
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (!data.exists || !data.data) return;
      applyCMSContent(data.data);
    })
    .catch(function() { /* use static HTML as fallback */ });
}

function applyCMSContent(c) {
  // ---- Hero ----
  if (c.hero) {
    setText('.hero-presents', c.hero.presents);
    setTextAll('.hero-detail .detail-value', [c.hero.dates, c.hero.venue, c.hero.time]);
  }

  // ---- Quote ----
  if (c.quote) {
    setText('.quote-text', c.quote.text);
    setText('.quote-attr', c.quote.attribution);
  }

  // ---- Cast ----
  if (c.cast && c.cast.length) {
    var castGrid = document.querySelector('.cast-grid');
    if (castGrid) {
      castGrid.innerHTML = c.cast.map(function(m) {
        var initial = (m.character || '?')[0].toUpperCase();
        var hue = m.hue || 200;
        return '<div class="cast-card">'
          + '<div class="cast-avatar" style="--hue:' + hue + '">'
          + '<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">'
          + '<circle cx="40" cy="28" r="16" fill="rgba(255,255,255,0.15)"/>'
          + '<text x="40" y="34" text-anchor="middle" fill="rgba(255,255,255,0.9)" font-size="18">' + esc(initial) + '</text>'
          + '</svg></div>'
          + '<div class="cast-info">'
          + '<h4 class="cast-name">' + esc(m.character) + '</h4>'
          + '<p class="cast-actor">' + esc(m.actor) + '</p>'
          + '<p class="cast-desc">' + esc(m.description) + '</p>'
          + '</div>'
          + '<span class="cast-role-tag">' + esc(m.role) + '</span>'
          + '</div>';
      }).join('');
      // Re-apply scroll animations
      castGrid.querySelectorAll('.cast-card').forEach(function(el) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s ease-out';
        observer.observe(el);
      });
    }
  }

  // ---- Crew ----
  if (c.crew && c.crew.length) {
    var crewGrid = document.querySelector('.crew-grid');
    if (crewGrid) {
      crewGrid.innerHTML = c.crew.map(function(m) {
        return '<div class="crew-item">'
          + '<span class="crew-role">' + esc(m.role) + '</span>'
          + '<span class="crew-name">' + esc(m.name) + '</span>'
          + '</div>';
      }).join('');
    }
  }

  // ---- Show Info ----
  if (c.show) {
    // Performances
    if (c.show.performances && c.show.performances.length) {
      var dateList = document.querySelector('.date-list');
      if (dateList) {
        dateList.innerHTML = c.show.performances.map(function(p) {
          return '<div class="date-item">'
            + '<div class="date-box"><span class="date-month">' + esc(p.month) + '</span><span class="date-num">' + esc(p.day) + '</span><span class="date-day">' + esc(p.weekday) + '</span></div>'
            + '<div class="date-details"><p class="date-time">' + esc(p.time) + '</p><p class="date-note">' + esc(p.note) + '</p></div>'
            + '</div>';
        }).join('');
      }
    }

    // Venue
    if (c.show.venue) {
      setText('.venue-name', c.show.venue.name);
      setText('.venue-addr', c.show.venue.address);
    }

    // Pricing
    if (c.show.pricing && c.show.pricing.length) {
      var priceContainer = document.querySelector('.ticket-prices');
      if (priceContainer) {
        priceContainer.innerHTML = c.show.pricing.map(function(p) {
          return '<div class="price-row' + (p.highlight ? ' highlight' : '') + '">'
            + '<span class="price-label">' + esc(p.label) + '</span>'
            + '<span class="price-amount">' + esc(p.amount) + '</span>'
            + '</div>';
        }).join('');
      }
    }

    // RSVP
    if (c.show.rsvpOptions && c.show.rsvpOptions.length) {
      var sel = document.getElementById('ticket-date');
      if (sel) {
        sel.innerHTML = '<option value="">Select night\u2026</option>'
          + c.show.rsvpOptions.map(function(o) {
            return '<option value="' + escAttr(o.value) + '">' + esc(o.label) + '</option>';
          }).join('');
      }
    }

    if (c.show.note) {
      setText('.ticket-note', c.show.note);
    }
  }

  // ---- Gallery ----
  if (c.gallery && c.gallery.length) {
    var galleryGrid = document.querySelector('.gallery-grid');
    if (galleryGrid) {
      galleryGrid.innerHTML = c.gallery.map(function(g) {
        var cls = 'gallery-item';
        if (g.layout === 'tall') cls += ' tall';
        if (g.layout === 'wide') cls += ' wide';
        var imgHtml;
        if (g.imageUrl) {
          imgHtml = '<div class="gallery-img"><img src="' + escAttr(g.imageUrl) + '" alt="' + escAttr(g.caption) + '" style="width:100%;height:100%;object-fit:cover" /></div>';
        } else {
          // Placeholder SVG if no image
          var w = g.layout === 'wide' ? 800 : 400;
          var h = g.layout === 'tall' ? 560 : 280;
          imgHtml = '<div class="gallery-img"><svg viewBox="0 0 ' + w + ' ' + h + '" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">'
            + '<rect width="' + w + '" height="' + h + '" fill="#08041a"/>'
            + '<text x="50%" y="50%" text-anchor="middle" fill="rgba(212,168,67,0.3)" font-size="14" font-family="sans-serif">' + esc(g.caption) + '</text>'
            + '</svg></div>';
        }
        return '<div class="' + cls + '" style="--accent:#d4a843">'
          + imgHtml
          + '<div class="gallery-caption">' + esc(g.caption) + '</div>'
          + '</div>';
      }).join('');
    }
  }

  // ---- Videos ----
  if (c.videos) {
    if (c.videos.featured) {
      var vid = c.videos.featured;
      var frame = document.getElementById('mainVideoFrame');
      if (frame && vid.videoId && vid.videoId !== 'VIDEO_ID_HERE') {
        frame.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(vid.videoId) + '?rel=0&modestbranding=1';
      }
      setText('.video-eyebrow', vid.eyebrow);
      var infoH3 = document.querySelector('.video-info h3');
      if (infoH3) infoH3.textContent = vid.title;
      var infoP = document.querySelector('.video-info p:not(.video-eyebrow)');
      if (infoP) infoP.textContent = vid.description;
    }

    if (c.videos.highlights && c.videos.highlights.length) {
      var vGrid = document.querySelector('.video-grid');
      if (vGrid) {
        vGrid.innerHTML = c.videos.highlights.map(function(h) {
          return '<div class="video-thumb" onclick="playVideo(\'' + escAttr(h.videoId) + '\')">'
            + '<div class="video-thumb-img">'
            + '<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">'
            + '<rect width="320" height="180" fill="#0a0715"/><rect width="320" height="180" fill="rgba(212,168,67,0.04)"/>'
            + '<circle cx="160" cy="90" r="52" fill="none" stroke="rgba(212,168,67,0.1)" stroke-width="1"/>'
            + '<polygon points="148,72 148,108 186,90" fill="rgba(212,168,67,0.65)"/>'
            + '</svg><div class="video-thumb-play">&#9654;</div></div>'
            + '<div class="video-thumb-info">'
            + '<p class="video-thumb-title">' + esc(h.title) + '</p>'
            + '<span class="video-thumb-dur">' + esc(h.duration) + '</span>'
            + '</div></div>';
        }).join('');
      }
    }
  }

  // ---- School ----
  if (c.school) {
    var introText = document.querySelector('.school-intro-text');
    if (introText) {
      var h3 = introText.querySelector('h3');
      if (h3) h3.textContent = c.school.heading;
      var ps = introText.querySelectorAll('p');
      if (ps[0] && c.school.paragraph1) ps[0].textContent = c.school.paragraph1;
      if (ps[1] && c.school.paragraph2) ps[1].textContent = c.school.paragraph2;
    }

    if (c.school.values && c.school.values.length) {
      var valGrid = document.querySelector('.values-grid');
      if (valGrid) {
        valGrid.innerHTML = c.school.values.map(function(v) {
          return '<div class="value-card">'
            + '<span class="value-icon">✦</span>'
            + '<h4>' + esc(v.title) + '</h4>'
            + '<p>' + esc(v.description) + '</p>'
            + '</div>';
        }).join('');
      }
    }

    if (c.school.facts && c.school.facts.length) {
      var factsWrap = document.querySelector('.school-facts');
      if (factsWrap) {
        factsWrap.innerHTML = c.school.facts.map(function(f, i) {
          var html = '<div class="fact-item">'
            + '<span class="fact-num">' + esc(f.value) + '</span>'
            + '<span class="fact-label">' + esc(f.label) + '</span>'
            + '</div>';
          if (i < c.school.facts.length - 1) html += '<div class="fact-divider"></div>';
          return html;
        }).join('');
      }
    }
  }

  // ---- Footer ----
  if (c.footer) {
    var footerLogo = document.querySelector('.footer-logo');
    if (footerLogo) {
      var title = footerLogo.querySelector('span:first-child');
      var sub = footerLogo.querySelector('.footer-sub');
      if (title) title.textContent = c.footer.title;
      if (sub) sub.textContent = c.footer.subtitle;
    }
    setText('.footer-copy', c.footer.copyright);
  }
}

// ---- Helpers for CMS ----
function setText(sel, val) {
  var el = document.querySelector(sel);
  if (el && val !== undefined) el.textContent = val;
}

function setTextAll(sel, vals) {
  var els = document.querySelectorAll(sel);
  for (var i = 0; i < els.length && i < vals.length; i++) {
    if (vals[i] !== undefined) els[i].textContent = vals[i];
  }
}

function esc(s) {
  var d = document.createElement('div');
  d.textContent = s || '';
  return d.innerHTML;
}

function escAttr(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}