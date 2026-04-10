/* ============================================================
   AccessiWeb — JavaScript
   Accessibility Toolbar, Navigation, Animations
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // ── Elements ──
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  const btnContrast = document.getElementById('btn-contrast');
  const btnTextIncrease = document.getElementById('btn-text-increase');
  const btnTextDecrease = document.getElementById('btn-text-decrease');
  const backToTop = document.getElementById('back-to-top');
  const reveals = document.querySelectorAll('.reveal');
  const sections = document.querySelectorAll('.section, .hero');

  // ── State ──
  let fontSizeStep = 0;
  const FONT_STEP_SIZE = 2; // px per step
  const MAX_STEPS = 5;
  const MIN_STEPS = 0;
  const BASE_FONT_SIZE = 16;

  // ── High Contrast Toggle ──
  function initContrast() {
    const saved = localStorage.getItem('a11y-high-contrast');
    if (saved === 'true') {
      document.body.classList.add('high-contrast');
    }
  }

  btnContrast.addEventListener('click', () => {
    document.body.classList.toggle('high-contrast');
    const isActive = document.body.classList.contains('high-contrast');
    localStorage.setItem('a11y-high-contrast', isActive);
    btnContrast.setAttribute('aria-pressed', isActive);
    announceToScreenReader(isActive ? 'High contrast mode enabled' : 'High contrast mode disabled');
  });

  // ── Text Resizing ──
  function initFontSize() {
    const saved = localStorage.getItem('a11y-font-step');
    if (saved !== null) {
      fontSizeStep = parseInt(saved, 10);
      applyFontSize();
    }
  }

  function applyFontSize() {
    const newSize = BASE_FONT_SIZE + fontSizeStep * FONT_STEP_SIZE;
    document.documentElement.style.fontSize = newSize + 'px';
  }

  btnTextIncrease.addEventListener('click', () => {
    if (fontSizeStep < MAX_STEPS) {
      fontSizeStep++;
      applyFontSize();
      localStorage.setItem('a11y-font-step', fontSizeStep);
      announceToScreenReader(`Text size increased to step ${fontSizeStep} of ${MAX_STEPS}`);
    } else {
      announceToScreenReader('Maximum text size reached');
    }
  });

  btnTextDecrease.addEventListener('click', () => {
    if (fontSizeStep > MIN_STEPS) {
      fontSizeStep--;
      applyFontSize();
      localStorage.setItem('a11y-font-step', fontSizeStep);
      announceToScreenReader(`Text size decreased to step ${fontSizeStep} of ${MAX_STEPS}`);
    } else {
      announceToScreenReader('Minimum text size reached');
    }
  });

  // ── Screen Reader Announcements ──
  function announceToScreenReader(message) {
    let announcer = document.getElementById('sr-announcer');
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'sr-announcer';
      announcer.setAttribute('role', 'status');
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.style.cssText = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;';
      document.body.appendChild(announcer);
    }
    announcer.textContent = '';
    // Use a small delay so the screen reader picks up the change
    setTimeout(() => {
      announcer.textContent = message;
    }, 100);
  }

  // ── Mobile Navigation ──
  navToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen);
  });

  // Close mobile nav on link click
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Close mobile nav on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('open')) {
      navMenu.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.focus();
    }
  });

  // ── Navbar Scroll Effect ──
  let lastScrollY = 0;
  function onScroll() {
    const scrollY = window.scrollY;

    // Navbar shadow
    if (scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Back to top
    if (scrollY > 600) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }

    // Active nav link
    updateActiveNav(scrollY);

    lastScrollY = scrollY;
  }

  window.addEventListener('scroll', throttle(onScroll, 100), { passive: true });

  // ── Active Navigation Link ──
  function updateActiveNav(scrollY) {
    let currentSection = '';
    sections.forEach(section => {
      const top = section.offsetTop - 100;
      const bottom = top + section.offsetHeight;
      if (scrollY >= top && scrollY < bottom) {
        currentSection = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + currentSection) {
        link.classList.add('active');
      }
    });
  }

  // ── Back to Top ──
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ── Scroll Reveal (Intersection Observer) ──
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -60px 0px',
    }
  );

  reveals.forEach(el => revealObserver.observe(el));

  // ── Smooth scroll for CTA ──
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth' });
        // Move focus for accessibility
        targetEl.setAttribute('tabindex', '-1');
        targetEl.focus({ preventScroll: true });
      }
    });
  });

  // ── Throttle Utility ──
  function throttle(fn, wait) {
    let time = Date.now();
    return function (...args) {
      if (Date.now() - time >= wait) {
        fn.apply(this, args);
        time = Date.now();
      }
    };
  }

  // ── Initialize ──
  initContrast();
  initFontSize();
  onScroll(); // Run once on load
});
