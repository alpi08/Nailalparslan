/* ============================================================
   script.js — Alparslan Premium Portfolio
   GSAP, Lenis, Custom Cursor, Loader, Particles, Interactions
   ============================================================ */

(function () {
  'use strict';

  // ---------- DOM ELEMENTS ----------
  const body = document.body;
  const loader = document.getElementById('loader');
  const loaderPercent = document.getElementById('loaderPercentNum');
  const loaderBarFill = document.getElementById('loaderBarFill');
  const loaderTerminal = document.getElementById('loaderTerminal');
  const revealWipe = document.getElementById('revealWipe');
  const cursorRing = document.getElementById('cursorRing');
  const cursorDot = document.getElementById('cursorDot');
  const cursorTrailCanvas = document.getElementById('cursor-trail');
  const header = document.getElementById('siteHeader');
  const navToggle = document.getElementById('navToggle');
  const mobileNav = document.getElementById('mobileNav');
  const backToTop = document.getElementById('backToTop');
  const scrollProgressFill = document.getElementById('scrollProgressFill');
  const heroRoleText = document.getElementById('heroRoleText');
  const timelineFill = document.getElementById('timelineFill');
  const testimonialsTrack = document.getElementById('testimonialsTrack');
  const testimonialsDots = document.getElementById('testimonialsDots');
  const contactForm = document.getElementById('contactForm');
  const contactFormNote = document.getElementById('contactFormNote');
  const footerYear = document.getElementById('footerYear');
  const topbarTime = document.getElementById('topbarTime');

  // ---------- STATE ----------
  let isLoadingComplete = false;
  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;

  // ---------- HELPER: Check if touch device ----------
  const isTouchDevice = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // ---------- LOADING SCREEN ----------
  function initLoader() {
    if (!loader) return;

    const terminalMessages = [
      "> Sistem başlatılıyor...",
      "> Paketler yükleniyor: react, unity, python",
      "> Güvenlik duvarı aktif edildi.",
      "> Şifreleme anahtarları oluşturuldu.",
      "> Arayüz motoru render ediliyor.",
      "> Partikül sistemi başlatıldı.",
      "> Deneyim hazır, bağlanılıyor..."
    ];

    let progress = 0;
    const duration = 2800; // total loading ms
    const stepTime = duration / 100;

    const loadingInterval = setInterval(() => {
      progress += 1;
      if (progress > 100) progress = 100;

      loaderPercent.textContent = progress;
      loaderBarFill.style.width = progress + '%';

      // Update terminal messages based on progress
      const msgIndex = Math.min(Math.floor(progress / 15), terminalMessages.length - 1);
      loaderTerminal.innerHTML = terminalMessages.slice(0, msgIndex + 1).map(m => `<span>${m}</span>`).join('');

      if (progress === 100) {
        clearInterval(loadingInterval);
        completeLoading();
      }
    }, stepTime);

    // Loader particles canvas (simple)
    const canvas = document.getElementById('loaderParticles');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const particles = [];
      for (let i = 0; i < 60; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 1.5 + 0.5,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3
        });
      }
      function drawLoaderParticles() {
        if (isLoadingComplete) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(34, 232, 255, 0.5)';
        particles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0) p.x = canvas.width;
          if (p.x > canvas.width) p.x = 0;
          if (p.y < 0) p.y = canvas.height;
          if (p.y > canvas.height) p.y = 0;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        });
        requestAnimationFrame(drawLoaderParticles);
      }
      drawLoaderParticles();
    }
  }

  function completeLoading() {
    isLoadingComplete = true;
    // Hide loader with wipe
    if (revealWipe && loader) {
      const tl = gsap.timeline({
        onComplete: () => {
          loader.style.display = 'none';
          body.classList.add('loaded');
          initMainFeatures();
        }
      });
      tl.to(revealWipe.children, {
        scaleY: 0,
        duration: 0.9,
        stagger: 0.1,
        ease: 'power3.inOut',
        transformOrigin: 'bottom'
      });
    } else {
      loader.style.display = 'none';
      body.classList.add('loaded');
      initMainFeatures();
    }
  }

  // ---------- MAIN FEATURES INIT ----------
  function initMainFeatures() {
    initCustomCursor();
    initSmoothScroll();
    initScrollAnimations();
    initHeroAnimations();
    initTypingEffect();
    initParticleCanvases();
    initTiltEffect();
    initProjectFilter();
    initTestimonialSlider();
    initMobileNav();
    initContactForm();
    initMisc();
    initClock();
    initBackToTop();
  }

  // ---------- CUSTOM CURSOR ----------
  function initCustomCursor() {
    if (isTouchDevice()) {
      if (cursorRing) cursorRing.style.display = 'none';
      if (cursorDot) cursorDot.style.display = 'none';
      if (cursorTrailCanvas) cursorTrailCanvas.style.display = 'none';
      body.style.cursor = 'auto';
      return;
    }

    // Trail canvas
    const ctx = cursorTrailCanvas?.getContext('2d');
    let trailParticles = [];
    if (ctx) {
      cursorTrailCanvas.width = window.innerWidth;
      cursorTrailCanvas.height = window.innerHeight;
      window.addEventListener('resize', () => {
        cursorTrailCanvas.width = window.innerWidth;
        cursorTrailCanvas.height = window.innerHeight;
      });
      function drawTrail() {
        ctx.clearRect(0, 0, cursorTrailCanvas.width, cursorTrailCanvas.height);
        trailParticles = trailParticles.filter(p => p.life > 0);
        trailParticles.forEach(p => {
          p.life -= 0.02;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI*2);
          ctx.fillStyle = `rgba(34, 232, 255, ${p.life * 0.25})`;
          ctx.fill();
        });
        requestAnimationFrame(drawTrail);
      }
      drawTrail();
    }

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (trailParticles && Math.random() > 0.5) {
        trailParticles.push({ x: mouseX, y: mouseY, r: 2 + Math.random()*3, life: 1 });
      }
    });

    function updateCursor() {
      cursorX += (mouseX - cursorX) * 0.15;
      cursorY += (mouseY - cursorY) * 0.15;
      if (cursorRing) {
        cursorRing.style.left = cursorX + 'px';
        cursorRing.style.top = cursorY + 'px';
      }
      if (cursorDot) {
        cursorDot.style.left = mouseX + 'px';
        cursorDot.style.top = mouseY + 'px';
      }
      requestAnimationFrame(updateCursor);
    }
    updateCursor();

    // Hover effects for elements with data-cursor="hover"
    document.querySelectorAll('[data-cursor="hover"]').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursorRing?.classList.add('hover');
        cursorDot?.classList.add('hover');
      });
      el.addEventListener('mouseleave', () => {
        cursorRing?.classList.remove('hover');
        cursorDot?.classList.remove('hover');
      });
    });

    // Magnetic effect for data-magnetic
    document.querySelectorAll('[data-magnetic]').forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width/2;
        const y = e.clientY - rect.top - rect.height/2;
        gsap.to(el, {
          x: x * 0.2,
          y: y * 0.2,
          duration: 0.4,
          ease: 'power2.out'
        });
      });
      el.addEventListener('mouseleave', () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
      });
    });
  }

  // ---------- SMOOTH SCROLL (LENIS) ----------
  function initSmoothScroll() {
    if (typeof Lenis === 'undefined') return;
    const lenis = new Lenis({
      duration: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Sync ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // ---------- SCROLL ANIMATIONS ----------
  function initScrollAnimations() {
    gsap.registerPlugin(ScrollTrigger, SplitText);

    // Reveal elements
    document.querySelectorAll('[data-reveal]').forEach(el => {
      const direction = el.dataset.reveal;
      let props = { opacity: 0, duration: 1, ease: 'power3.out' };

      if (direction === 'up') {
        props.y = 50;
      } else if (direction === 'lines') {
        const split = new SplitText(el, { type: 'lines', linesClass: 'line' });
        gsap.set(split.lines, { opacity: 0, y: 30 });
        ScrollTrigger.create({
          trigger: el,
          start: 'top 85%',
          onEnter: () => gsap.to(split.lines, { opacity: 1, y: 0, stagger: 0.08, duration: 0.7, ease: 'power3.out' })
        });
        return;
      } else if (direction === 'mask') {
        gsap.set(el, { clipPath: 'inset(0 100% 0 0)', opacity: 1 });
        ScrollTrigger.create({
          trigger: el,
          start: 'top 80%',
          onEnter: () => gsap.to(el, { clipPath: 'inset(0 0% 0 0)', duration: 1.2, ease: 'power3.inOut' })
        });
        return;
      }

      ScrollTrigger.create({
        trigger: el,
        start: 'top 82%',
        onEnter: () => gsap.fromTo(el, { opacity: 0, ...props }, { opacity: 1, y: 0, ...props })
      });
    });

    // Timeline fill
    if (timelineFill) {
      ScrollTrigger.create({
        trigger: '.timeline',
        start: 'top 70%',
        end: 'bottom 30%',
        onUpdate: (self) => {
          gsap.to(timelineFill, { height: self.progress * 100 + '%', duration: 0.2 });
        }
      });
    }

    // Skill bars
    document.querySelectorAll('.skill-card__bar-fill').forEach(bar => {
      const level = bar.dataset.level;
      ScrollTrigger.create({
        trigger: bar,
        start: 'top 85%',
        onEnter: () => {
          gsap.to(bar, { width: level + '%', duration: 1.2, ease: 'power3.out' });
        }
      });
    });

    // Stats counter
    document.querySelectorAll('.stat__num[data-count]').forEach(stat => {
      const count = parseInt(stat.dataset.count);
      const suffix = stat.dataset.suffix || '';
      ScrollTrigger.create({
        trigger: stat,
        start: 'top 85%',
        onEnter: () => {
          gsap.to(stat, {
            duration: 2,
            innerText: count,
            snap: { innerText: 1 },
            onUpdate: function() {
              stat.textContent = Math.floor(stat.innerText) + suffix;
            },
            ease: 'power2.out'
          });
        }
      });
    });
  }

  // ---------- HERO CANVAS & ANIMATIONS ----------
  function initHeroAnimations() {
    // Floating elements parallax via CSS or slight mouse move
    const heroTitle = document.getElementById('heroTitle');
    if (heroTitle && !isTouchDevice()) {
      document.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 15;
        const y = (e.clientY / window.innerHeight - 0.5) * 15;
        gsap.to(heroTitle, { x, y, duration: 1.2, ease: 'power2.out' });
      });
    }
  }

  function initTypingEffect() {
    if (!heroRoleText) return;
    const roles = [
      'Yaratıcı Geliştirici',
      'Frontend Mühendisi',
      'Siber Güvenlik Meraklısı',
      'Simülasyon Tasarımcısı'
    ];
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function type() {
      const current = roles[roleIndex];
      heroRoleText.textContent = current.substring(0, charIndex);
      if (!isDeleting && charIndex < current.length) {
        charIndex++;
        setTimeout(type, 80);
      } else if (isDeleting && charIndex > 0) {
        charIndex--;
        setTimeout(type, 40);
      } else if (!isDeleting && charIndex === current.length) {
        setTimeout(() => { isDeleting = true; type(); }, 2000);
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        setTimeout(type, 400);
      }
    }
    type();
  }

  // ---------- PARTICLE CANVASES (Hero & Footer) ----------
  function initParticleCanvases() {
    const heroCanvas = document.getElementById('heroCanvas');
    const footerCanvas = document.getElementById('footerCanvas');

    function setupCanvas(canvas, color = '34, 232, 255', count = 80) {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;

      const particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 2 + 0.5,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4
        });
      }

      function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = `rgba(${color}, 0.6)`;
        particles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0) p.x = canvas.width;
          if (p.x > canvas.width) p.x = 0;
          if (p.y < 0) p.y = canvas.height;
          if (p.y > canvas.height) p.y = 0;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
          ctx.fill();
        });

        // Draw connecting lines occasionally
        ctx.strokeStyle = `rgba(${color}, 0.08)`;
        ctx.lineWidth = 0.4;
        for (let i = 0; i < particles.length; i+=2) {
          for (let j = i+2; j < particles.length; j+=2) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            if (Math.abs(dx) < 90 && Math.abs(dy) < 90) {
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }
        requestAnimationFrame(draw);
      }
      draw();

      window.addEventListener('resize', () => {
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;
      });
    }

    setupCanvas(heroCanvas, '34, 232, 255', 90);
    setupCanvas(footerCanvas, '168, 85, 247', 50);
  }

  // ---------- 3D TILT EFFECT ----------
  function initTiltEffect() {
    document.querySelectorAll('[data-tilt]').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 8;
        const rotateY = (centerX - x) / 8;
        gsap.to(card, {
          rotateX: rotateX,
          rotateY: rotateY,
          scale: 1.02,
          duration: 0.5,
          ease: 'power2.out'
        });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(card, { rotateX: 0, rotateY: 0, scale: 1, duration: 0.6, ease: 'power2.out' });
      });
    });
  }

  // ---------- PROJECT FILTER ----------
  function initProjectFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.project-card');

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        const filter = btn.dataset.filter;

        cards.forEach(card => {
          if (filter === 'all' || card.dataset.category === filter) {
            gsap.to(card, { scale: 1, opacity: 1, duration: 0.4, ease: 'power2.out', clearProps: 'transform' });
            card.style.display = '';
          } else {
            gsap.to(card, { scale: 0.9, opacity: 0, duration: 0.3, onComplete: () => card.style.display = 'none' });
          }
        });
      });
    });
  }

  // ---------- TESTIMONIAL SLIDER ----------
  function initTestimonialSlider() {
    if (!testimonialsTrack || !testimonialsDots) return;
    const cards = testimonialsTrack.querySelectorAll('.testimonial-card');
    let currentIndex = 0;

    function updateSlider(index) {
      const cardWidth = cards[0]?.offsetWidth + 32; // gap
      testimonialsTrack.scrollTo({ left: index * cardWidth, behavior: 'smooth' });
      updateDots(index);
    }

    function updateDots(index) {
      testimonialsDots.innerHTML = '';
      cards.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.style.cssText = `width:10px;height:10px;border-radius:50%;background:${i === index ? 'var(--cyan)' : 'rgba(255,255,255,0.2)'};border:none;cursor:none;transition:0.3s;`;
        dot.addEventListener('click', () => updateSlider(i));
        testimonialsDots.appendChild(dot);
      });
    }

    document.getElementById('testimonialPrev')?.addEventListener('click', () => {
      currentIndex = (currentIndex - 1 + cards.length) % cards.length;
      updateSlider(currentIndex);
    });
    document.getElementById('testimonialNext')?.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % cards.length;
      updateSlider(currentIndex);
    });

    updateDots(0);
  }

  // ---------- MOBILE NAV ----------
  function initMobileNav() {
    if (!navToggle || !mobileNav) return;
    navToggle.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', isOpen);
      body.style.overflow = isOpen ? 'hidden' : '';
    });

    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', false);
        body.style.overflow = '';
      });
    });
  }

  // ---------- CONTACT FORM ----------
  function initContactForm() {
    if (!contactForm) return;
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = document.getElementById('contactSubmit');
      btn.disabled = true;
      contactFormNote.textContent = 'Gönderiliyor...';
      contactFormNote.style.color = 'var(--cyan)';

      setTimeout(() => {
        contactFormNote.textContent = 'Mesajın iletildi! En kısa sürede dönüş yapacağım.';
        contactFormNote.style.color = '#4ade80';
        contactForm.reset();
        btn.disabled = false;
      }, 1500);
    });
  }

  // ---------- MISC ----------
  function initMisc() {
    // Scroll Progress
    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = (scrollTop / docHeight) * 100;
      if (scrollProgressFill) scrollProgressFill.style.width = scrolled + '%';
    });

    // Footer Year
    if (footerYear) footerYear.textContent = new Date().getFullYear();

    // Header background on scroll
    window.addEventListener('scroll', () => {
      if (window.scrollY > 100) {
        header?.classList.add('scrolled');
      } else {
        header?.classList.remove('scrolled');
      }
    });
  }

  function initClock() {
    if (!topbarTime) return;
    function updateClock() {
      const now = new Date();
      topbarTime.textContent = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
    updateClock();
    setInterval(updateClock, 1000);
  }

  function initBackToTop() {
    if (!backToTop) return;
    window.addEventListener('scroll', () => {
      if (window.scrollY > 600) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    });
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ---------- START EVERYTHING ----------
  document.addEventListener('DOMContentLoaded', () => {
    initLoader();
  });

})();
