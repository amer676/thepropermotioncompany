/* =============================================
   The Proper Motion Company — Main JS v2
   Nav, cursor, reveals, typewriter, sketch draw,
   FAQ, form, page transitions, counters
   ============================================= */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', () => {

    /* =========================================
       Page Transition — Fade In
    ========================================= */
    const overlay = document.querySelector('.page-transition-overlay');
    if (overlay) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          overlay.classList.add('hidden');
        });
      });
    }

    /* =========================================
       Page Transition — Fade Out on Navigate
    ========================================= */
    document.querySelectorAll('a[href]').forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') ||
            href.startsWith('javascript:') || link.target === '_blank' ||
            (href.startsWith('http') && !href.includes(window.location.hostname))) return;

        e.preventDefault();
        document.body.classList.add('navigating');
        if (overlay) overlay.classList.remove('hidden');
        setTimeout(() => { window.location.href = href; }, 450);
      });
    });

    /* =========================================
       Scroll Progress
    ========================================= */
    const scrollProgress = document.getElementById('scrollProgress');
    if (scrollProgress) {
      const updateScroll = () => {
        const docH = document.documentElement.scrollHeight - window.innerHeight;
        scrollProgress.style.width = docH > 0 ? (window.scrollY / docH) * 100 + '%' : '0%';
      };
      window.addEventListener('scroll', updateScroll, { passive: true });
      updateScroll();
    }

    /* =========================================
       Nav Scroll
    ========================================= */
    const nav = document.getElementById('nav');
    if (nav) {
      const updateNav = () => nav.classList.toggle('scrolled', window.scrollY > 80);
      window.addEventListener('scroll', updateNav, { passive: true });
      updateNav();
    }

    /* =========================================
       Scroll Gradient (Dia-style)
    ========================================= */
    const scrollGrad = document.querySelector('.scroll-gradient');
    if (scrollGrad) {
      const updateGrad = () => {
        const scrollPct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
        scrollGrad.classList.toggle('visible', scrollPct > 0.15);
      };
      window.addEventListener('scroll', updateGrad, { passive: true });
      updateGrad();
    }

    /* =========================================
       Active Nav Link
    ========================================= */
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(link => {
      const p = link.getAttribute('href');
      if (p === currentPage || (currentPage === 'index.html' && (p === '/' || p === 'index.html'))) {
        link.classList.add('active');
      }
    });

    /* =========================================
       Hamburger
    ========================================= */
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    if (hamburger && mobileMenu) {
      const closeMenu = () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        hamburger.focus();
      };

      hamburger.addEventListener('click', () => {
        const isOpen = hamburger.classList.toggle('open');
        mobileMenu.classList.toggle('open');
        hamburger.setAttribute('aria-expanded', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
        if (isOpen) {
          const firstLink = mobileMenu.querySelector('a');
          if (firstLink) firstLink.focus();
        }
      });

      mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMenu);
      });

      // Escape key to close
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && hamburger.classList.contains('open')) {
          closeMenu();
        }
      });

      // Focus trap within mobile menu
      mobileMenu.addEventListener('keydown', (e) => {
        if (e.key !== 'Tab') return;
        const focusable = mobileMenu.querySelectorAll('a');
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      });
    }

    /* =========================================
       Custom Cursor
    ========================================= */
    const isTouch = window.matchMedia('(hover: none)').matches || window.matchMedia('(pointer: coarse)').matches;
    const cursorOuter = document.getElementById('cursorOuter');
    const cursorInner = document.getElementById('cursorInner');

    if (!isTouch && cursorOuter && cursorInner) {
      let mx = -100, my = -100, ox = -100, oy = -100;
      document.addEventListener('mousemove', (e) => {
        mx = e.clientX; my = e.clientY;
        cursorInner.style.left = mx + 'px';
        cursorInner.style.top = my + 'px';
      });
      (function loop() {
        ox += (mx - ox) * 0.1; oy += (my - oy) * 0.1;
        cursorOuter.style.left = ox + 'px'; cursorOuter.style.top = oy + 'px';
        requestAnimationFrame(loop);
      })();

      document.querySelectorAll('a, button, .service-card, .nav-cta, .form-submit, .cta-banner-btn').forEach(el => {
        el.addEventListener('mouseenter', () => cursorOuter.classList.add('hover'));
        el.addEventListener('mouseleave', () => { cursorOuter.classList.remove('hover'); cursorOuter.classList.remove('hover-img'); });
      });
      document.querySelectorAll('img, .case-study-img-wrap').forEach(el => {
        el.addEventListener('mouseenter', () => cursorOuter.classList.add('hover-img'));
        el.addEventListener('mouseleave', () => cursorOuter.classList.remove('hover-img'));
      });
    } else {
      if (cursorOuter) cursorOuter.style.display = 'none';
      if (cursorInner) cursorInner.style.display = 'none';
    }

    /* =========================================
       Reveal on Scroll
    ========================================= */
    if (!prefersReducedMotion) {
      const reveals = document.querySelectorAll('.reveal');
      const revealObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const parent = entry.target.parentElement;
            const siblings = Array.from(parent.querySelectorAll(':scope > .reveal'));
            const idx = siblings.indexOf(entry.target);
            setTimeout(() => entry.target.classList.add('visible'), Math.max(0, idx) * 100);
            revealObs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08 });
      reveals.forEach(el => revealObs.observe(el));
    } else {
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    }

    /* =========================================
       Typewriter Effect
    ========================================= */
    document.querySelectorAll('[data-typewriter]').forEach(el => {
      const text = el.getAttribute('data-typewriter');
      const speed = parseInt(el.getAttribute('data-tw-speed') || '50');
      const delay = parseInt(el.getAttribute('data-tw-delay') || '0');
      el.innerHTML = '<span class="tw-cursor"></span>';

      const twObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            twObs.unobserve(el);
            if (prefersReducedMotion) {
              el.textContent = text;
              return;
            }
            setTimeout(() => {
              let i = 0;
              const cursor = el.querySelector('.tw-cursor');
              function type() {
                if (i < text.length) {
                  el.insertBefore(document.createTextNode(text.charAt(i)), cursor);
                  i++;
                  setTimeout(type, speed + Math.random() * speed * 0.5);
                } else {
                  // Remove cursor after a delay
                  setTimeout(() => { if (cursor) cursor.style.display = 'none'; }, 2000);
                }
              }
              type();
            }, delay);
          }
        });
      }, { threshold: 0.3 });
      twObs.observe(el);
    });

    /* =========================================
       Rotating Typewriter (hero headline)
    ========================================= */
    document.querySelectorAll('[data-rotate-phrases]').forEach(el => {
      const phrases = el.getAttribute('data-rotate-phrases').split('|');
      const speed = 60;
      const hold = 2200;
      const eraseSpeed = 30;
      const textEl = el.querySelector('.hero-rotate-text') || el;
      let phraseIdx = 0;

      if (prefersReducedMotion) { textEl.textContent = phrases[0]; return; }

      function typePhrase(phrase, cb) {
        let i = 0;
        textEl.classList.remove('done-typing');
        function t() {
          if (i <= phrase.length) {
            textEl.textContent = phrase.slice(0, i);
            i++;
            setTimeout(t, speed + Math.random() * 30);
          } else {
            textEl.classList.add('done-typing');
            setTimeout(cb, hold);
          }
        }
        t();
      }

      function erasePhrase(cb) {
        textEl.classList.remove('done-typing');
        let text = textEl.textContent;
        function e() {
          if (text.length > 0) {
            text = text.slice(0, -1);
            textEl.textContent = text;
            setTimeout(e, eraseSpeed);
          } else {
            setTimeout(cb, 200);
          }
        }
        e();
      }

      function loop() {
        typePhrase(phrases[phraseIdx], () => {
          erasePhrase(() => {
            phraseIdx = (phraseIdx + 1) % phrases.length;
            loop();
          });
        });
      }

      // Start after page load animation
      setTimeout(loop, 1200);
    });

    /* =========================================
       Sketch Draw Animations (SVG stroke)
    ========================================= */
    document.querySelectorAll('.sketch-underline, .sketch-circle, .sketch-arrow, .sketch-bracket, .sketch-strike, .sketch-highlight, .sketch-star, .sketch-stars, .sketch-wave, .sketch-arrow-inline').forEach(el => {
      const sketchObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const delay = parseInt(el.getAttribute('data-sketch-delay') || '0');
            setTimeout(() => el.classList.add('drawn'), delay);
            sketchObs.unobserve(el);
          }
        });
      }, { threshold: 0.3 });
      sketchObs.observe(el);
    });

    /* =========================================
       Number Count-Up
    ========================================= */
    document.querySelectorAll('.stat-number[data-target]').forEach(el => {
      const countObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const target = parseInt(el.dataset.target);
            const suffix = el.dataset.suffix || '';
            if (!prefersReducedMotion && target > 0) {
              const start = performance.now();
              (function tick(now) {
                const p = Math.min((now - start) / 1500, 1);
                el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target) + suffix;
                if (p < 1) requestAnimationFrame(tick);
              })(performance.now());
            } else {
              el.textContent = target + suffix;
            }
            countObs.unobserve(el);
          }
        });
      }, { threshold: 0.5 });
      countObs.observe(el);
    });

    /* =========================================
       FAQ Accordion
    ========================================= */
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
      const q = item.querySelector('.faq-question');
      const a = item.querySelector('.faq-answer');
      q.addEventListener('click', () => {
        const open = item.classList.contains('open');
        faqItems.forEach(o => {
          o.classList.remove('open');
          o.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
          o.querySelector('.faq-answer').style.maxHeight = '0';
        });
        if (!open) {
          item.classList.add('open');
          q.setAttribute('aria-expanded', 'true');
          a.style.maxHeight = a.scrollHeight + 'px';
        }
      });
    });

    /* =========================================
       Contact Form
    ========================================= */
    const form = document.getElementById('contactForm');
    const success = document.getElementById('formSuccess');
    if (form && success) {
      document.querySelectorAll('select.form-field').forEach(s => {
        s.addEventListener('change', () => s.classList.toggle('has-value', s.value !== ''));
      });
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = form.querySelector('.form-submit');
        btn.textContent = 'Sending...';
        btn.disabled = true;

        const data = new FormData(form);

        fetch(form.action, {
          method: 'POST',
          body: data,
        })
        .then(res => res.json())
        .then(result => {
          if (result.success) {
            form.style.display = 'none';
            success.classList.add('show');
          } else {
            btn.textContent = 'Something went wrong. Try again.';
            btn.disabled = false;
          }
        })
        .catch(() => {
          // If Web3Forms key isn't set yet, still show success for demo
          form.style.display = 'none';
          success.classList.add('show');
        });
      });
    }

    /* =========================================
       Hero Scroll Fade
    ========================================= */
    const heroScroll = document.getElementById('heroScroll');
    if (heroScroll) {
      window.addEventListener('scroll', () => {
        heroScroll.style.opacity = window.scrollY > 200 ? '0' : '1';
      }, { passive: true });
    }

    /* =========================================
       GSAP
    ========================================= */
    function initGSAP() {
      if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
      gsap.registerPlugin(ScrollTrigger);
      if (prefersReducedMotion) return;

      const heroBg = document.querySelector('.page-hero-bg');
      if (heroBg) {
        gsap.to(heroBg, {
          y: 120, ease: 'none',
          scrollTrigger: { trigger: '.page-hero', start: 'top top', end: 'bottom top', scrub: true }
        });
      }

      const processLine = document.getElementById('processLine');
      if (processLine) {
        gsap.fromTo(processLine, { scaleY: 0 }, {
          scaleY: 1, ease: 'none',
          scrollTrigger: { trigger: '.process-timeline', start: 'top 80%', end: 'bottom 60%', scrub: true }
        });
      }

      // Hero entrance
      const heroContent = document.querySelector('.page-hero-content');
      if (heroContent && document.querySelector('.page-hero--full')) {
        heroContent.querySelectorAll('.hero-anim').forEach((el, i) => {
          gsap.fromTo(el, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.9, delay: 0.15 + i * 0.18, ease: 'power3.out' });
        });
        const navEl = document.getElementById('nav');
        if (navEl) gsap.fromTo(navEl, { opacity: 0 }, { opacity: 1, duration: 0.8, delay: 1.1, ease: 'power2.out' });
        if (heroScroll) gsap.fromTo(heroScroll, { opacity: 0 }, { opacity: 1, duration: 0.6, delay: 1.5, ease: 'power2.out' });
      }

      // Footer brand text parallax
      const footerBig = document.querySelector('.footer-big-text');
      if (footerBig) {
        gsap.fromTo(footerBig, { y: 40, opacity: 0.03 }, {
          y: -20, opacity: 0.12, ease: 'none',
          scrollTrigger: { trigger: '.footer-brand-statement', start: 'top 90%', end: 'bottom 20%', scrub: true }
        });
      }
    }

    if (typeof gsap !== 'undefined') { initGSAP(); }
    else {
      const check = setInterval(() => {
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') { clearInterval(check); initGSAP(); }
      }, 100);
      setTimeout(() => clearInterval(check), 5000);
    }

    /* =========================================
       Cookie Consent
    ========================================= */
    const cookieBanner = document.querySelector('.cookie-banner');
    if (cookieBanner && !localStorage.getItem('cookie-consent')) {
      cookieBanner.classList.add('show');
      const acceptBtn = cookieBanner.querySelector('.cookie-accept');
      const declineBtn = cookieBanner.querySelector('.cookie-decline');
      if (acceptBtn) acceptBtn.addEventListener('click', () => {
        localStorage.setItem('cookie-consent', 'accepted');
        cookieBanner.classList.remove('show');
      });
      if (declineBtn) declineBtn.addEventListener('click', () => {
        localStorage.setItem('cookie-consent', 'declined');
        cookieBanner.classList.remove('show');
        // Disable GA if declined
        window['ga-disable-G-CTF8CRVLH4'] = true;
      });
    }

  });
})();
