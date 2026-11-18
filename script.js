/* ==========================================================
   Oval Services Ltd | Site scripts
   ========================================================== */

(function () {
  'use strict';

  document.documentElement.classList.remove('no-js');

  const header = document.querySelector('.site-header');
  const navToggle = document.querySelector('.nav-toggle');
  const siteNav = document.getElementById('site-nav');
  const backToTop = document.querySelector('.back-to-top');
  const navLinks = document.querySelectorAll('.site-nav a[href^="#"]:not(.btn)');
  const yearEl = document.getElementById('year');

  /* ---------- Footer year ---------- */
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* ---------- Mobile navigation ---------- */
  function setMenu(open) {
    siteNav.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
  }

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      setMenu(!siteNav.classList.contains('open'));
    });

    // Close menu when a link is tapped
    siteNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        setMenu(false);
      });
    });

    // Close with Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && siteNav.classList.contains('open')) {
        setMenu(false);
        navToggle.focus();
      }
    });

    // Reset menu state when resizing to desktop
    window.addEventListener('resize', function () {
      if (window.innerWidth > 860) {
        setMenu(false);
      }
    });
  }

  /* ---------- Header shadow + back-to-top visibility ---------- */
  function onScroll() {
    const y = window.scrollY;
    if (header) header.classList.toggle('scrolled', y > 10);
    if (backToTop) backToTop.classList.toggle('visible', y > 600);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Highlight active nav link ---------- */
  const sectionIds = Array.from(navLinks).map(function (a) {
    return a.getAttribute('href').slice(1);
  });
  const sections = sectionIds
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    const navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          navLinks.forEach(function (link) {
            link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
          });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(function (section) { navObserver.observe(section); });
  }

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el, i) {
      // Gentle stagger for items that sit in the same grid
      el.style.transitionDelay = (i % 4) * 80 + 'ms';
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  }

  /* ---------- Count-up statistics ---------- */
  const statNumbers = document.querySelectorAll('.stat-number[data-count]');

  function animateCount(el) {
    const target = parseInt(el.getAttribute('data-count'), 10);
    if (isNaN(target)) return;

    const duration = 1400;
    const start = performance.now();

    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }

  if ('IntersectionObserver' in window && statNumbers.length) {
    const statObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });

    statNumbers.forEach(function (el) { statObserver.observe(el); });
  }

  /* ---------- Back to top ---------- */
  if (backToTop) {
    backToTop.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- Quote form validation ---------- */
  const form = document.getElementById('quote-form');

  if (form) {
    const statusEl = form.querySelector('.form-status');
    const submitBtn = form.querySelector('button[type="submit"]');

    const rules = {
      name: {
        validate: function (v) { return v.trim().length >= 2; },
        message: 'Please enter your name.'
      },
      email: {
        validate: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); },
        message: 'Please enter a valid email address.'
      },
      phone: {
        // Optional field, but if provided must look like a UK number
        validate: function (v) {
          if (!v.trim()) return true;
          const digits = v.replace(/[\s()+-]/g, '');
          return /^(0|44)\d{9,10}$/.test(digits);
        },
        message: 'Please enter a valid UK phone number, or leave it blank.'
      },
      sector: {
        validate: function (v) { return v !== ''; },
        message: 'Please select a sector.'
      }
    };

    function getField(name) {
      return form.elements[name];
    }

    function showError(name, message) {
      const field = getField(name);
      const wrapper = field && field.closest('.field');
      const errorEl = form.querySelector('[data-error-for="' + name + '"]');
      if (wrapper) wrapper.classList.add('has-error');
      if (errorEl) errorEl.textContent = message || '';
      if (field) field.setAttribute('aria-invalid', 'true');
    }

    function clearError(name) {
      const field = getField(name);
      const wrapper = field && field.closest('.field');
      const errorEl = form.querySelector('[data-error-for="' + name + '"]');
      if (wrapper) wrapper.classList.remove('has-error');
      if (errorEl) errorEl.textContent = '';
      if (field) field.removeAttribute('aria-invalid');
    }

    function validateField(name) {
      const rule = rules[name];
      const field = getField(name);
      if (!rule || !field) return true;

      if (!rule.validate(field.value)) {
        showError(name, rule.message);
        return false;
      }
      clearError(name);
      return true;
    }

    // Live feedback once a field has been touched
    Object.keys(rules).forEach(function (name) {
      const field = getField(name);
      if (!field) return;
      field.addEventListener('blur', function () {
        if (field.value !== '' || field.required) validateField(name);
      });
      field.addEventListener('input', function () {
        if (field.closest('.field').classList.contains('has-error')) {
          validateField(name);
        }
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      statusEl.textContent = '';
      statusEl.className = 'form-status';

      // Validate everything, focusing the first invalid field
      let firstInvalid = null;
      Object.keys(rules).forEach(function (name) {
        const ok = validateField(name);
        if (!ok && !firstInvalid) firstInvalid = getField(name);
      });

      // Privacy consent check
      const consent = document.getElementById('privacy-consent');
      const consentWrap = consent && consent.closest('.field');
      const consentError = form.querySelector('[data-error-for="privacy"]');
      if (consent && !consent.checked) {
        if (consentWrap) consentWrap.classList.add('has-error');
        if (consentError) consentError.textContent = 'Please agree to the privacy policy to send your enquiry.';
        if (!firstInvalid) firstInvalid = consent;
      } else if (consentWrap) {
        consentWrap.classList.remove('has-error');
        if (consentError) consentError.textContent = '';
      }

      if (firstInvalid) {
        firstInvalid.focus();
        statusEl.textContent = 'Please check the highlighted fields.';
        statusEl.classList.add('failure');
        return;
      }

      // Collect the form data
      const data = {
        name: form.name.value.trim(),
        company: form.company.value.trim(),
        email: form.email.value.trim(),
        phone: form.phone.value.trim(),
        sector: form.sector.value,
        date: form.date.value,
        services: Array.from(form.querySelectorAll('input[name="services"]:checked')).map(function (cb) {
          return cb.value;
        }),
        message: form.message.value.trim()
      };

      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      // ---------------------------------------------------------
      // DEMO MODE: replace this block with a real submission.
      // Options: a form handler such as Formspree / Netlify Forms,
      // or a fetch() call to your own backend endpoint.
      //
      // Example:
      // fetch('https://formspree.io/f/your-id', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      //   body: JSON.stringify(data)
      // }).then(...)
      // ---------------------------------------------------------
      setTimeout(function () {
        console.info('Enquiry data (demo):', data);
        statusEl.textContent = 'Thank you! Diolch. We\u2019ll be in touch within one working day.';
        statusEl.classList.add('success');
        form.reset();
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send My Enquiry';
      }, 800);
    });
  }

  /* ---------- Privacy popup ---------- */
  const privacyPopup = document.getElementById('privacy-popup');
  const PRIVACY_KEY = 'ovalPrivacyNoticeSeen';

  if (privacyPopup && typeof privacyPopup.showModal === 'function') {
    function openPrivacy() {
      if (!privacyPopup.open) privacyPopup.showModal();
    }

    function closePrivacy() {
      privacyPopup.close();
    }

    // Remember the choice so the popup only shows once per browser
    privacyPopup.addEventListener('close', function () {
      try { localStorage.setItem(PRIVACY_KEY, '1'); } catch (err) { /* storage unavailable */ }
    });

    // Show once, after a short pause, on a first visit
    let alreadySeen = false;
    try { alreadySeen = localStorage.getItem(PRIVACY_KEY) === '1'; } catch (err) { /* ignore */ }

    if (!alreadySeen) {
      setTimeout(openPrivacy, 2500);
    }

    // Any element with data-open-privacy opens the popup
    document.querySelectorAll('[data-open-privacy]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        openPrivacy();
      });
    });

    privacyPopup.querySelectorAll('[data-close-privacy]').forEach(function (btn) {
      btn.addEventListener('click', closePrivacy);
    });

    // Clicking the backdrop closes the popup
    privacyPopup.addEventListener('click', function (e) {
      if (e.target === privacyPopup) closePrivacy();
    });
  }
})();