/* ============================================================
   ALPARSLAN — PORTFOLYO — script.js
   Vanilla JS + GSAP/ScrollTrigger/SplitText/ScrambleText + Lenis
   ============================================================ */
(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover:none),(pointer:coarse)').matches;
  const hasGSAP = typeof window.gsap !== 'undefined';

  if (hasGSAP && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  if (hasGSAP && window.SplitText) gsap.registerPlugin(SplitText);
  if (hasGSAP && window.ScrambleTextPlugin) gsap.registerPlugin(ScrambleTextPlugin);

  /* ---------------------------------------------------------
     1. LENIS SMOOTH SCROLL
  --------------------------------------------------------- */
  let lenis = null;
  function initLenis() {
    if (reduceMotion || typeof window.Lenis === 'undefined') return;
    lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.2,
    });
    lenis.on('scroll', () => {
      if (hasGSAP && window.ScrollTrigger) ScrollTrigger.update();
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Anchor links use Lenis scrollTo
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        if (!id || id === '#' || id.length < 2) return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, { offset: -70, duration: 1.3 });
        closeMobileNav();
      });
    });
  }

  /* ---------------------------------------------------------
     2. CUSTOM CURSOR + TRAIL
  --------------------------------------------------------- */
  function initCursor() {
    if (isTouch) return;
    const ring = document.getElementById('cursorRing');
    const dot = document.getElementById('cursorDot');
    const canvas = document.getElementById('cursor-trail');
    if (!ring || !dot) return;
    const ctx = canvas ? canvas.getContext('2d') : null;

    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;
    let trail = [];

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    window.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
      trail.push({ x: mx, y: my, life: 1 });
      if (trail.length > 18) trail.shift();
    });

    document.querySelectorAll('a, button, [data-cursor="hover"]').forEach((el) => {
      el.addEventListener('mouseenter', () => ring.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => ring.classList.remove('is-hover'));
    });
    window.addEventListener('mousedown', () => { ring.classList.add('is-down'); dot.classList.add('is-down'); });
    window.addEventListener('mouseup', () => { ring.classList.remove('is-down'); dot.classList.remove('is-down'); });

    function loop() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;

      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        for (let i = 0; i < trail.length; i++) {
          const p = trail[i];
          p.life -= 0.06;
        }
        trail = trail.filter((p) => p.life > 0);
        for (let i = 1; i < trail.length; i++) {
          const p0 = trail[i - 1], p1 = trail[i];
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.strokeStyle = `rgba(34,232,255,${p1.life * 0.35})`;
          ctx.lineWidth = 1.4;
          ctx.stroke();
        }
      }
      requestAnimationFrame(loop);
    }
    loop();
  }

  /* ---------------------------------------------------------
     3. LOADER — terminal lines, percent, bar, reveal wipe
  --------------------------------------------------------- */
  function initLoader() {
    const loader = document.getElementById('loader');
    const barFill = document.getElementById('loaderBarFill');
    const percentNum = document.getElementById('loaderPercentNum');
    const terminal = document.getElementById('loaderTerminal');
    const wipe = document.getElementById('revealWipe');
    if (!loader) return;

    const lines = [
      '> initializing environment...',
      '> connecting to core systems',
      '> compiling glassmorphism layers',
      '> caching cinematic transitions',
      '> loading particle engine',
      '> decrypting portfolio assets',
      '> access granted',
    ];
    let lineIndex = 0;
    const lineTimer = setInterval(() => {
      if (!terminal || lineIndex >= lines.length) { clearInterval(lineTimer); return; }
      const span = document.createElement('span');
      span.textContent = lines[lineIndex];
      terminal.appendChild(span);
      requestAnimationFrame(() => span.classList.add('is-in'));
      if (terminal.children.length > 4) terminal.removeChild(terminal.firstElementChild);
      lineIndex++;
    }, 260);

    let progress = 0;
    const target = { v: 0 };
    const progressTimer = setInterval(() => {
      progress += Math.random() * 14 + 6;
      if (progress >= 100) { progress = 100; clearInterval(progressTimer); finishLoad(); }
      if (barFill) barFill.style.right = `${100 - progress}%`;
      if (percentNum) percentNum.textContent = Math.floor(progress);
    }, 180);

    function finishLoad() {
      setTimeout(() => {
        loader.classList.add('is-done');
        if (hasGSAP) {
          gsap.to(loader, {
            opacity: 0, duration: 0.6, ease: 'power2.out',
            onComplete: () => { loader.style.display = 'none'; playRevealWipe(); startHeroSequence(); },
          });
        } else {
          loader.style.transition = 'opacity .5s ease';
          loader.style.opacity = '0';
          setTimeout(() => { loader.style.display = 'none'; playRevealWipe(); startHeroSequence(); }, 500);
        }
        document.body.style.overflow = '';
      }, 320);
    }

    function playRevealWipe() {
      if (!wipe) return;
      const spans = wipe.querySelectorAll('span');
      if (hasGSAP) {
        gsap.to(spans, {
          yPercent: -100, duration: 0.9, ease: 'power4.inOut', stagger: 0.08,
          onComplete: () => { wipe.style.display = 'none'; },
        });
      } else {
        spans.forEach((s) => { s.style.transition = 'transform .8s ease'; s.style.transform = 'translateY(-100%)'; });
        setTimeout(() => { wipe.style.display = 'none'; }, 900);
      }
    }

    document.body.style.overflow = 'hidden';
    // Failsafe: force finish if something stalls
    setTimeout(() => { if (progress < 100) finishLoad(); }, 4200);
  }

  /* ---------------------------------------------------------
     4. SCROLL PROGRESS + HEADER CONDENSE + TOPBAR CLOCK
  --------------------------------------------------------- */
  function initChrome() {
    const fill = document.getElementById('scrollProgressFill');
    const header = document.getElementById('siteHeader');
    const backToTop = document.getElementById('backToTop');

    function onScroll() {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      if (fill) fill.style.width = `${pct}%`;
      if (header) header.classList.toggle('is-condensed', window.scrollY > 40);
      if (backToTop) backToTop.classList.toggle('is-visible', window.scrollY > 600);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (backToTop) {
      backToTop.addEventListener('click', () => {
        if (lenis) lenis.scrollTo(0, { duration: 1.2 });
        else window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    const clock = document.getElementById('topbarTime');
    if (clock) {
      function tick() {
        const now = new Date();
        clock.textContent = now.toLocaleTimeString('tr-TR', { hour12: false });
      }
      tick();
      setInterval(tick, 1000);
    }

    const yearEl = document.getElementById('footerYear');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  /* ---------------------------------------------------------
     5. MOBILE NAV
  --------------------------------------------------------- */
  function closeMobileNav() {
    const nav = document.getElementById('mobileNav');
    const toggle = document.getElementById('navToggle');
    if (nav) nav.classList.remove('is-open');
    if (toggle) { toggle.classList.remove('is-active'); toggle.setAttribute('aria-expanded', 'false'); }
  }
  function initMobileNav() {
    const toggle = document.getElementById('navToggle');
    const nav = document.getElementById('mobileNav');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', () => {
      const open = !nav.classList.contains('is-open');
      nav.classList.toggle('is-open', open);
      toggle.classList.toggle('is-active', open);
      toggle.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('.mobile-nav__link').forEach((l) => l.addEventListener('click', closeMobileNav));
  }

  /* ---------------------------------------------------------
     6. MAGNETIC BUTTONS
  --------------------------------------------------------- */
  function initMagnetic() {
    if (isTouch) return;
    document.querySelectorAll('[data-magnetic]').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        if (hasGSAP) {
          gsap.to(el, { x: x * 0.35, y: y * 0.5, duration: 0.4, ease: 'power3.out' });
        } else {
          el.style.transform = `translate(${x * 0.3}px, ${y * 0.4}px)`;
        }
      });
      el.addEventListener('mouseleave', () => {
        if (hasGSAP) gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1,0.4)' });
        else el.style.transform = 'translate(0,0)';
      });
    });
  }

  /* ---------------------------------------------------------
     7. TILT CARDS (skills + projects) + spotlight vars
  --------------------------------------------------------- */
  function initTilt() {
    if (isTouch) return;
    document.querySelectorAll('[data-tilt]').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const rotX = (0.5 - py) * 10;
        const rotY = (px - 0.5) * 12;
        card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px)`;
        card.style.setProperty('--mx', `${px * 100}%`);
        card.style.setProperty('--my', `${py * 100}%`);
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(900px) rotateX(0) rotateY(0) translateY(0)';
      });
    });
  }

  /* ---------------------------------------------------------
     8. HERO CANVAS — particle field
  --------------------------------------------------------- */
  function initHeroCanvas() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, particles = [];
    const COUNT = window.innerWidth < 720 ? 45 : 90;

    function resize() {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    }
    function makeParticles() {
      particles = Array.from({ length: COUNT }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.6 + 0.4,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        hue: Math.random() > 0.5 ? '34,232,255' : '139,92,246',
        a: Math.random() * 0.5 + 0.15,
      }));
    }
    resize(); makeParticles();
    window.addEventListener('resize', () => { resize(); makeParticles(); });

    let mouseX = w / 2, mouseY = h / 2;
    canvas.addEventListener('mousemove', (e) => {
      const r = canvas.getBoundingClientRect();
      mouseX = e.clientX - r.left; mouseY = e.clientY - r.top;
    });

    function draw() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        const dx = mouseX - p.x, dy = mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140) { p.x -= dx * 0.004; p.y -= dy * 0.004; }
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.hue},${p.a})`;
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }
    if (!reduceMotion) draw();
  }

  /* ---------------------------------------------------------
     9. LOADER PARTICLES (small canvas behind loader content)
  --------------------------------------------------------- */
  function initLoaderCanvas() {
    const canvas = document.getElementById('loaderParticles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    resize(); window.addEventListener('resize', resize);
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.3,
      vy: Math.random() * 0.3 + 0.08,
    }));
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.y -= p.vy;
        if (p.y < 0) p.y = canvas.height;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(34,232,255,0.5)';
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }
    if (!reduceMotion) draw();
  }

  /* ---------------------------------------------------------
     10. FOOTER CANVAS — soft floating particles
  --------------------------------------------------------- */
  function initFooterCanvas() {
    const canvas = document.getElementById('footerCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h;
    function resize() { w = canvas.width = canvas.offsetWidth; h = canvas.height = canvas.offsetHeight; }
    resize(); window.addEventListener('resize', resize);
    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 1.3 + 0.3,
      vx: (Math.random() - 0.5) * 0.0003,
      vy: (Math.random() - 0.5) * 0.0003,
    }));
    function draw() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > 1) p.vx *= -1;
        if (p.y < 0 || p.y > 1) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(139,92,246,0.4)';
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }
    if (!reduceMotion) draw();
  }

  /* ---------------------------------------------------------
     11. HERO SEQUENCE — title split reveal, typing role, CTA
  --------------------------------------------------------- */
  const ROLES = [
    'Yaratıcı Geliştirici',
    'Frontend Mühendisi',
    'Simülasyon Meraklısı',
    'Bağımsız Yazılımcı',
  ];

  function startHeroSequence() {
    const titleLine = document.querySelector('.hero__title-line');
    const tl = hasGSAP ? gsap.timeline({ defaults: { ease: 'power4.out' } }) : null;

    if (hasGSAP && window.SplitText && titleLine) {
      const split = new SplitText(titleLine, { type: 'chars' });
      gsap.set(split.chars, { yPercent: 120, opacity: 0 });
      tl.to(split.chars, { yPercent: 0, opacity: 1, duration: 1, stagger: 0.035 });
      tl.from('.hero__eyebrow', { opacity: 0, y: 10, duration: 0.5 }, '-=0.7');
      tl.from('.hero__role', { opacity: 0, y: 10, duration: 0.5 }, '-=0.5');
      tl.from('.hero__desc', { opacity: 0, y: 14, duration: 0.6 }, '-=0.4');
      tl.from('.hero__cta > *', { opacity: 0, y: 14, duration: 0.5, stagger: 0.1 }, '-=0.35');
      tl.from('.hero__scroll', { opacity: 0, duration: 0.6 }, '-=0.3');
    } else if (hasGSAP) {
      tl.from('.hero__eyebrow, .hero__title, .hero__role, .hero__desc, .hero__cta > *, .hero__scroll',
        { opacity: 0, y: 18, duration: 0.7, stagger: 0.1 });
    }

    typeRoles();
  }

  function typeRoles() {
    const el = document.getElementById('heroRoleText');
    if (!el) return;
    let roleIndex = 0;

    function typeWord(word, cb) {
      let i = 0;
      const t = setInterval(() => {
        el.textContent = word.slice(0, i + 1);
        i++;
        if (i > word.length) { clearInterval(t); setTimeout(cb, 1400); }
      }, 55);
    }
    function eraseWord(cb) {
      let text = el.textContent;
      const t = setInterval(() => {
        text = text.slice(0, -1);
        el.textContent = text;
        if (text.length === 0) { clearInterval(t); cb(); }
      }, 30);
    }
    function cycle() {
      typeWord(ROLES[roleIndex], () => {
        eraseWord(() => {
          roleIndex = (roleIndex + 1) % ROLES.length;
          cycle();
        });
      });
    }
    cycle();
  }

  /* ---------------------------------------------------------
     12. SCROLL REVEALS (data-reveal="lines|up|mask")
  --------------------------------------------------------- */
  function initReveals() {
    if (!hasGSAP || !window.ScrollTrigger) return;

    document.querySelectorAll('[data-reveal="up"]').forEach((el) => {
      gsap.fromTo(el, { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%' },
      });
    });

    document.querySelectorAll('[data-reveal="mask"]').forEach((el) => {
      gsap.fromTo(el, { clipPath: 'inset(0 0 100% 0)', opacity: 0.4 }, {
        clipPath: 'inset(0 0 0% 0)', opacity: 1, duration: 1.1, ease: 'power4.out',
        scrollTrigger: { trigger: el, start: 'top 85%' },
      });
    });

    document.querySelectorAll('[data-reveal="lines"]').forEach((el) => {
      if (window.SplitText && el.tagName !== 'DIV') {
        try {
          const split = new SplitText(el, { type: 'lines', linesClass: 'split-line' });
          gsap.set(split.lines, { overflow: 'hidden' });
          gsap.fromTo(split.lines, { yPercent: 100, opacity: 0 }, {
            yPercent: 0, opacity: 1, duration: 0.8, stagger: 0.08, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 90%' },
          });
          return;
        } catch (e) { /* fall through to generic reveal */ }
      }
      gsap.fromTo(el, { opacity: 0, y: 24 }, {
        opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 90%' },
      });
    });

    // Skill / project / service card staggers
    ['.skills__grid', '.projects__grid', '.services__grid'].forEach((sel) => {
      const grid = document.querySelector(sel);
      if (!grid) return;
      gsap.fromTo(grid.children, { opacity: 0, y: 34 }, {
        opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out',
        scrollTrigger: { trigger: grid, start: 'top 85%' },
      });
    });
  }

  /* ---------------------------------------------------------
     13. ANIMATED STAT COUNTERS
  --------------------------------------------------------- */
  function initCounters() {
    const stats = document.querySelectorAll('.stat__num');
    if (!stats.length) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.dataset.count || '0');
        const suffix = el.dataset.suffix || '';
        const obj = { v: 0 };
        if (hasGSAP) {
          gsap.to(obj, {
            v: target, duration: 1.6, ease: 'power2.out',
            onUpdate: () => { el.textContent = Math.floor(obj.v) + suffix; },
          });
        } else {
          let v = 0;
          const t = setInterval(() => {
            v += Math.ceil(target / 40);
            if (v >= target) { v = target; clearInterval(t); }
            el.textContent = v + suffix;
          }, 30);
        }
        obs.unobserve(el);
      });
    }, { threshold: 0.5 });
    stats.forEach((s) => obs.observe(s));
  }

  /* ---------------------------------------------------------
     14. SKILL BARS
  --------------------------------------------------------- */
  function initSkillBars() {
    const bars = document.querySelectorAll('.skill-card__bar-fill');
    if (!bars.length) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const level = el.dataset.level || '0';
        requestAnimationFrame(() => { el.style.width = `${level}%`; });
        obs.unobserve(el);
      });
    }, { threshold: 0.4 });
    bars.forEach((b) => {
      b.style.transition = 'width 1.1s cubic-bezier(.16,1,.3,1)';
      obs.observe(b);
    });
  }

  /* ---------------------------------------------------------
     15. PROJECT FILTER
  --------------------------------------------------------- */
  function initFilters() {
    const bar = document.getElementById('filterBar');
    const grid = document.getElementById('projectsGrid');
    if (!bar || !grid) return;
    const cards = grid.querySelectorAll('.project-card');
    bar.querySelectorAll('.filter-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        bar.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        const filter = btn.dataset.filter;
        cards.forEach((card) => {
          const match = filter === 'all' || card.dataset.category === filter;
          if (hasGSAP) {
            gsap.to(card, {
              opacity: match ? 1 : 0,
              scale: match ? 1 : 0.92,
              duration: 0.35,
              ease: 'power2.out',
              onStart: () => { if (match) card.style.display = ''; },
              onComplete: () => { card.style.display = match ? '' : 'none'; },
            });
          } else {
            card.style.display = match ? '' : 'none';
          }
        });
      });
    });
  }

  /* ---------------------------------------------------------
     16. TIMELINE — scroll-linked fill + active node
  --------------------------------------------------------- */
  function initTimeline() {
    const timeline = document.querySelector('.timeline');
    const fill = document.getElementById('timelineFill');
    if (!timeline || !fill) return;
    const items = timeline.querySelectorAll('.timeline__item');

    if (hasGSAP && window.ScrollTrigger) {
      gsap.to(fill, {
        height: '100%', ease: 'none',
        scrollTrigger: { trigger: timeline, start: 'top 60%', end: 'bottom 70%', scrub: 0.6 },
      });
      items.forEach((item) => {
        ScrollTrigger.create({
          trigger: item, start: 'top 65%', end: 'bottom 65%',
          onEnter: () => item.classList.add('is-active'),
          onEnterBack: () => item.classList.add('is-active'),
        });
      });
    } else {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('is-active'); });
      }, { threshold: 0.5 });
      items.forEach((i) => obs.observe(i));
    }
  }

  /* ---------------------------------------------------------
     17. TESTIMONIALS CAROUSEL
  --------------------------------------------------------- */
  function initTestimonials() {
    const track = document.getElementById('testimonialsTrack');
    const dotsWrap = document.getElementById('testimonialsDots');
    const prev = document.getElementById('testimonialPrev');
    const next = document.getElementById('testimonialNext');
    if (!track || !dotsWrap) return;
    const cards = track.children;
    let index = 0;
    let perView = 1;

    function calcPerView() {
      const w = track.parentElement.offsetWidth;
      const cardW = cards[0].offsetWidth + 22.4; // gap
      perView = Math.max(1, Math.floor(w / cardW));
    }
    function maxIndex() { return Math.max(0, cards.length - perView); }

    function buildDots() {
      dotsWrap.innerHTML = '';
      const dotCount = maxIndex() + 1;
      for (let i = 0; i < dotCount; i++) {
        const dot = document.createElement('span');
        if (i === index) dot.classList.add('is-active');
        dot.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(dot);
      }
    }
    function update() {
      const cardW = cards[0].offsetWidth + 22.4;
      track.style.transform = `translateX(-${index * cardW}px)`;
      [...dotsWrap.children].forEach((d, i) => d.classList.toggle('is-active', i === index));
    }
    function goTo(i) {
      index = Math.min(Math.max(i, 0), maxIndex());
      update();
    }

    if (prev) prev.addEventListener('click', () => goTo(index - 1 < 0 ? maxIndex() : index - 1));
    if (next) next.addEventListener('click', () => goTo(index + 1 > maxIndex() ? 0 : index + 1));

    window.addEventListener('resize', () => { calcPerView(); buildDots(); update(); });
    calcPerView(); buildDots(); update();

    let autoplay = setInterval(() => { goTo(index + 1 > maxIndex() ? 0 : index + 1); }, 5500);
    track.parentElement.addEventListener('mouseenter', () => clearInterval(autoplay));
    track.parentElement.addEventListener('mouseleave', () => {
      autoplay = setInterval(() => { goTo(index + 1 > maxIndex() ? 0 : index + 1); }, 5500);
    });
  }

  /* ---------------------------------------------------------
     18. CONTACT FORM — client-side validation + liquid submit
  --------------------------------------------------------- */
  function initContactForm() {
    const form = document.getElementById('contactForm');
    const note = document.getElementById('contactFormNote');
    const submitBtn = document.getElementById('contactSubmit');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.querySelector('#cf-name');
      const email = form.querySelector('#cf-email');
      const message = form.querySelector('#cf-message');
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());

      if (!name.value.trim() || !emailOk || !message.value.trim()) {
        if (note) {
          note.textContent = 'Lütfen ad, geçerli bir e-posta ve mesaj alanlarını doldurun.';
          note.classList.add('is-visible');
        }
        return;
      }

      if (submitBtn) {
        const label = submitBtn.querySelector('.btn--liquid__text');
        submitBtn.disabled = true;
        if (label) label.textContent = 'Gönderiliyor...';
        setTimeout(() => {
          if (label) label.textContent = 'Mesaj Gönderildi ✓';
          if (note) {
            note.textContent = 'Teşekkürler! Mesajın ulaştı, en kısa sürede dönüş yapılacak.';
            note.classList.add('is-visible');
          }
          setTimeout(() => {
            form.reset();
            submitBtn.disabled = false;
            if (label) label.textContent = 'Mesajı Gönder';
          }, 2600);
        }, 900);
      }
    });
  }

  /* ---------------------------------------------------------
     INIT
  --------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    initLenis();
    initCursor();
    initLoaderCanvas();
    initLoader();
    initChrome();
    initMobileNav();
    initMagnetic();
    initTilt();
    initHeroCanvas();
    initFooterCanvas();
    initReveals();
    initCounters();
    initSkillBars();
    initFilters();
    initTimeline();
    initTestimonials();
    initContactForm();
  });
})();
