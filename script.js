/* ============================================================
   script.js — Alparslan Portfolio | Balanced Interactions
   ============================================================ */
(function() {
  'use strict';

  // ---------- DOM refs ----------
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

  let isLoadingComplete = false;
  let mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0;

  const isTouch = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // ---------- LOADER ----------
  function initLoader() {
    if (!loader) return;
    const messages = [
      "> Sistem başlatılıyor...",
      "> Paketler yükleniyor: react, unity, python",
      "> Güvenlik duvarı aktif.",
      "> Arayüz motoru render ediliyor.",
      "> Deneyim hazır, bağlanılıyor..."
    ];
    let progress = 0;
    const interval = setInterval(() => {
      progress += 1;
      if (progress > 100) progress = 100;
      loaderPercent.textContent = progress;
      loaderBarFill.style.width = progress + '%';
      const idx = Math.min(Math.floor(progress / 20), messages.length - 1);
      loaderTerminal.innerHTML = messages.slice(0, idx + 1).map(m => `<span>${m}</span>`).join('');
      if (progress === 100) {
        clearInterval(interval);
        completeLoading();
      }
    }, 30);
  }

  function completeLoading() {
    isLoadingComplete = true;
    if (revealWipe && loader) {
      const tl = gsap.timeline({ onComplete: () => {
        loader.style.display = 'none';
        document.body.classList.add('loaded');
        initMainFeatures();
      }});
      tl.to(revealWipe.children, { scaleY: 0, duration: 0.9, stagger: 0.1, ease: 'power3.inOut', transformOrigin: 'bottom' });
    } else {
      if (loader) loader.style.display = 'none';
      document.body.classList.add('loaded');
      initMainFeatures();
    }
  }

  // ---------- MAIN INIT ----------
  function initMainFeatures() {
    initCustomCursor();
    initSmoothScroll();
    initScrollAnimations();
    initHeroEffects();
    initTyping();
    initParticleCanvases();
    initTilt();
    initProjectFilter();
    initTestimonialSlider();
    initMobileNav();
    initContactForm();
    initMisc();
    initClock();
    initBackToTop();
    populateDynamicContent();
  }

  // ---------- CUSTOM CURSOR ----------
  function initCustomCursor() {
    if (isTouch()) {
      if (cursorRing) cursorRing.style.display = 'none';
      if (cursorDot) cursorDot.style.display = 'none';
      if (cursorTrailCanvas) cursorTrailCanvas.style.display = 'none';
      document.body.style.cursor = 'auto';
      return;
    }
    const ctx = cursorTrailCanvas?.getContext('2d');
    let trail = [];
    if (ctx) {
      cursorTrailCanvas.width = window.innerWidth;
      cursorTrailCanvas.height = window.innerHeight;
      window.addEventListener('resize', () => {
        cursorTrailCanvas.width = window.innerWidth;
        cursorTrailCanvas.height = window.innerHeight;
      });
      function drawTrail() {
        ctx.clearRect(0, 0, cursorTrailCanvas.width, cursorTrailCanvas.height);
        trail = trail.filter(p => p.life > 0);
        trail.forEach(p => {
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
    document.addEventListener('mousemove', e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (trail && Math.random() > 0.5) trail.push({ x: mouseX, y: mouseY, r: 2 + Math.random()*3, life: 1 });
    });
    function updateCursor() {
      cursorX += (mouseX - cursorX) * 0.15;
      cursorY += (mouseY - cursorY) * 0.15;
      if (cursorRing) { cursorRing.style.left = cursorX + 'px'; cursorRing.style.top = cursorY + 'px'; }
      if (cursorDot) { cursorDot.style.left = mouseX + 'px'; cursorDot.style.top = mouseY + 'px'; }
      requestAnimationFrame(updateCursor);
    }
    updateCursor();
    document.querySelectorAll('[data-cursor="hover"]').forEach(el => {
      el.addEventListener('mouseenter', () => { cursorRing?.classList.add('hover'); cursorDot?.classList.add('hover'); });
      el.addEventListener('mouseleave', () => { cursorRing?.classList.remove('hover'); cursorDot?.classList.remove('hover'); });
    });
    document.querySelectorAll('[data-magnetic]').forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width/2;
        const y = e.clientY - rect.top - rect.height/2;
        gsap.to(el, { x: x*0.2, y: y*0.2, duration: 0.4, ease: 'power2.out' });
      });
      el.addEventListener('mouseleave', () => gsap.to(el, { x:0, y:0, duration:0.5, ease:'elastic.out(1,0.4)' }));
    });
  }

  // ---------- SMOOTH SCROLL ----------
  function initSmoothScroll() {
    if (typeof Lenis === 'undefined') return;
    const lenis = new Lenis({ duration: 1.5, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // ---------- SCROLL ANIMATIONS ----------
  function initScrollAnimations() {
    gsap.registerPlugin(ScrollTrigger, SplitText);
    document.querySelectorAll('[data-reveal]').forEach(el => {
      const dir = el.dataset.reveal;
      if (dir === 'lines') {
        const split = new SplitText(el, { type: 'lines', linesClass: 'line' });
        gsap.set(split.lines, { opacity: 0, y: 30 });
        ScrollTrigger.create({ trigger: el, start: 'top 85%', onEnter: () => gsap.to(split.lines, { opacity:1, y:0, stagger:0.08, duration:0.7, ease:'power3.out' }) });
      } else if (dir === 'mask') {
        gsap.set(el, { clipPath: 'inset(0 100% 0 0)', opacity:1 });
        ScrollTrigger.create({ trigger: el, start: 'top 80%', onEnter: () => gsap.to(el, { clipPath:'inset(0 0% 0 0)', duration:1.2, ease:'power3.inOut' }) });
      } else {
        const props = dir === 'up' ? { y: 50 } : {};
        ScrollTrigger.create({ trigger: el, start: 'top 82%', onEnter: () => gsap.fromTo(el, { opacity:0, ...props }, { opacity:1, y:0, duration:1, ease:'power3.out' }) });
      }
    });
    if (timelineFill) {
      ScrollTrigger.create({ trigger: '.timeline', start: 'top 70%', end: 'bottom 30%', onUpdate: self => gsap.to(timelineFill, { height: self.progress*100+'%', duration:0.2 }) });
    }
    document.querySelectorAll('.skill-card__bar-fill').forEach(bar => {
      ScrollTrigger.create({ trigger: bar, start: 'top 85%', onEnter: () => gsap.to(bar, { width: bar.dataset.level+'%', duration:1.2, ease:'power3.out' }) });
    });
    document.querySelectorAll('.stat__num[data-count]').forEach(stat => {
      const count = parseInt(stat.dataset.count);
      ScrollTrigger.create({ trigger: stat, start: 'top 85%', onEnter: () => {
        gsap.to(stat, { duration:2, innerText:count, snap:{ innerText:1 }, onUpdate() { stat.textContent = Math.floor(stat.innerText) + (stat.dataset.suffix||''); }, ease:'power2.out' });
      }});
    });
  }

  // ---------- HERO ----------
  function initHeroEffects() {
    const title = document.getElementById('heroTitle');
    if (title && !isTouch()) {
      document.addEventListener('mousemove', e => {
        const x = (e.clientX/window.innerWidth - 0.5) * 15;
        const y = (e.clientY/window.innerHeight - 0.5) * 15;
        gsap.to(title, { x, y, duration:1.2, ease:'power2.out' });
      });
    }
  }

  function initTyping() {
    if (!heroRoleText) return;
    const roles = ['Yaratıcı Geliştirici','Frontend Mühendisi','Siber Güvenlik Meraklısı','Simülasyon Tasarımcısı'];
    let roleIdx=0, charIdx=0, del=false;
    function type() {
      const cur = roles[roleIdx];
      heroRoleText.textContent = cur.substring(0,charIdx);
      if (!del && charIdx < cur.length) { charIdx++; setTimeout(type,80); }
      else if (del && charIdx > 0) { charIdx--; setTimeout(type,40); }
      else if (!del && charIdx === cur.length) { setTimeout(()=>{del=true;type();},2000); }
      else if (del && charIdx === 0) { del=false; roleIdx=(roleIdx+1)%roles.length; setTimeout(type,400); }
    }
    type();
  }

  // ---------- PARTICLES ----------
  function initParticleCanvases() {
    function setup(canvas, color, count) {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
      const particles = Array.from({length:count}, () => ({
        x: Math.random()*canvas.width, y: Math.random()*canvas.height,
        r: Math.random()*2+0.5, vx:(Math.random()-0.5)*0.4, vy:(Math.random()-0.5)*0.4
      }));
      function draw() {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle = `rgba(${color},0.6)`;
        particles.forEach(p => {
          p.x+=p.vx; p.y+=p.vy;
          if(p.x<0)p.x=canvas.width; if(p.x>canvas.width)p.x=0;
          if(p.y<0)p.y=canvas.height; if(p.y>canvas.height)p.y=0;
          ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
        });
        requestAnimationFrame(draw);
      }
      draw();
      window.addEventListener('resize', () => { canvas.width = canvas.parentElement.offsetWidth; canvas.height = canvas.parentElement.offsetHeight; });
    }
    setup(document.getElementById('heroCanvas'), '34, 232, 255', 90);
    setup(document.getElementById('footerCanvas'), '168, 85, 247', 50);
  }

  // ---------- TILT ----------
  function initTilt() {
    document.querySelectorAll('[data-tilt]').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left, y = e.clientY - rect.top;
        gsap.to(card, { rotateX:(y-rect.height/2)/8, rotateY:(rect.width/2-x)/8, scale:1.02, duration:0.5, ease:'power2.out' });
      });
      card.addEventListener('mouseleave', () => gsap.to(card, { rotateX:0, rotateY:0, scale:1, duration:0.6, ease:'power2.out' }));
    });
  }

  // ---------- PROJECT FILTER ----------
  function initProjectFilter() {
    const btns = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.project-card');
    btns.forEach(btn => btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const filter = btn.dataset.filter;
      cards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          gsap.to(card, { scale:1, opacity:1, duration:0.4, ease:'power2.out', clearProps:'transform' });
          card.style.display = '';
        } else {
          gsap.to(card, { scale:0.9, opacity:0, duration:0.3, onComplete:()=>card.style.display='none' });
        }
      });
    }));
  }

  // ---------- TESTIMONIAL SLIDER ----------
  function initTestimonialSlider() {
    if (!testimonialsTrack) return;
    const cards = testimonialsTrack.querySelectorAll('.testimonial-card');
    let idx = 0;
    function go(i) {
      const w = cards[0]?.offsetWidth + 32;
      testimonialsTrack.scrollTo({ left: i*w, behavior:'smooth' });
      updateDots(i);
    }
    function updateDots(i) {
      testimonialsDots.innerHTML = '';
      cards.forEach((_,j) => {
        const d = document.createElement('button');
        d.style.cssText = `width:10px;height:10px;border-radius:50%;background:${j===i?'var(--cyan)':'rgba(255,255,255,0.2)'};border:none;cursor:none;`;
        d.addEventListener('click', ()=>go(j));
        testimonialsDots.appendChild(d);
      });
    }
    document.getElementById('testimonialPrev')?.addEventListener('click', ()=>{ idx=(idx-1+cards.length)%cards.length; go(idx); });
    document.getElementById('testimonialNext')?.addEventListener('click', ()=>{ idx=(idx+1)%cards.length; go(idx); });
    updateDots(0);
  }

  // ---------- MOBILE NAV ----------
  function initMobileNav() {
    if (!navToggle || !mobileNav) return;
    navToggle.addEventListener('click', () => {
      const open = mobileNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      mobileNav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', false);
      document.body.style.overflow = '';
    }));
  }

  // ---------- CONTACT FORM ----------
  function initContactForm() {
    if (!contactForm) return;
    contactForm.addEventListener('submit', e => {
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
    window.addEventListener('scroll', () => {
      const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      if (scrollProgressFill) scrollProgressFill.style.width = scrolled + '%';
      header?.classList.toggle('scrolled', window.scrollY > 100);
    });
    if (footerYear) footerYear.textContent = new Date().getFullYear();
  }

  function initClock() {
    if (!topbarTime) return;
    const update = () => topbarTime.textContent = new Date().toLocaleTimeString('tr-TR', { hour:'2-digit', minute:'2-digit', second:'2-digit' });
    update(); setInterval(update, 1000);
  }

  function initBackToTop() {
    if (!backToTop) return;
    window.addEventListener('scroll', () => backToTop.classList.toggle('visible', window.scrollY > 600));
    backToTop.addEventListener('click', () => window.scrollTo({ top:0, behavior:'smooth' }));
  }

  // ---------- DYNAMIC CONTENT POPULATION ----------
  function populateDynamicContent() {
    const skills = [
      { icon:'<svg viewBox="0 0 32 32"><polyline points="9,8 4,16 9,24"/><polyline points="23,8 28,16 23,24"/><line x1="18" y1="6" x2="14" y2="26"/></svg>', title:'HTML & CSS3', desc:'Anlamsal, erişilebilir arayüzler.', level:98 },
      { icon:'<svg viewBox="0 0 32 32"><rect x="5" y="6" width="22" height="20" rx="4"/><text x="16" y="20" text-anchor="middle" fill="currentColor" font-size="10">JS</text></svg>', title:'JavaScript', desc:'Modern, modüler uygulama mantığı.', level:95 },
      { icon:'<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="2.4"/><ellipse cx="16" cy="16" rx="13" ry="5"/><ellipse cx="16" cy="16" rx="13" ry="5" transform="rotate(62 16 16)"/></svg>', title:'React.js', desc:'Bileşen tabanlı mimariler.', level:90 },
      { icon:'<svg viewBox="0 0 32 32"><path d="M11 8a5 5 0 0 0 0 16"/><path d="M21 8a5 5 0 0 1 0 16"/><line x1="11" y1="8" x2="21" y2="24"/></svg>', title:'Python', desc:'Otomasyon ve masaüstü uygulamalar.', level:88 },
      { icon:'<svg viewBox="0 0 32 32"><path d="M16 5 27 11.5v9L16 27 5 20.5v-9Z"/><path d="M16 5v22M5 11.5l11 6.5 11-6.5"/></svg>', title:'C# & Unity', desc:'Simülasyon ve oyun geliştirme.', level:82 },
      { icon:'<svg viewBox="0 0 32 32"><polygon points="16,4 27,10 27,22 16,28 5,22 5,10"/><circle cx="16" cy="16" r="3"/></svg>', title:'Node.js', desc:'Hafif backend servisleri.', level:78 },
      { icon:'<svg viewBox="0 0 32 32"><circle cx="9" cy="8" r="2.4"/><circle cx="9" cy="24" r="2.4"/><circle cx="23" cy="16" r="2.4"/><path d="M9 10.4V24M9 12c0 5 4 4 12 4"/></svg>', title:'Git & GitHub', desc:'Sürüm kontrolü ve iş birliği.', level:90 },
      { icon:'<svg viewBox="0 0 32 32"><path d="M5 22c5 0 4-14 9-14s2 14 9 14"/><circle cx="23" cy="22" r="1.6"/><circle cx="26.5" cy="19.5" r="1.1"/></svg>', title:'Motion & GSAP', desc:'Sinematik animasyonlar.', level:93 }
    ];
    const skillsGrid = document.getElementById('skillsGrid');
    if (skillsGrid) {
      skillsGrid.innerHTML = skills.map(s => `
        <article class="skill-card" data-tilt data-reveal="up">
          <span class="skill-card__border"></span>
          <div class="skill-card__icon">${s.icon}</div>
          <h3 class="skill-card__title">${s.title}</h3>
          <p class="skill-card__desc">${s.desc}</p>
          <div class="skill-card__bar"><div class="skill-card__bar-fill" data-level="${s.level}"></div></div>
          <span class="skill-card__level mono">${s.level}%</span>
        </article>
      `).join('');
    }

    const projects = [
      { cat:'web', tag:'WEB · E-TİCARET', title:'KAGE FORGE', desc:'Ninja estetiğinden ilham alan e-ticaret deneyimi.', tags:['GSAP','Animasyon','E-Ticaret'] },
      { cat:'web', tag:'WEB · KURUMSAL', title:'ALPİ', desc:'Glassmorphism temelli kurumsal web sitesi.', tags:['Glassmorphism','UI/UX','Kurumsal'] },
      { cat:'web', tag:'WEB · ÇOK DİLLİ', title:'Piccolo Cafe', desc:'3 boyutlu atom sahnesiyle açılan çok dilli kafe sitesi.', tags:['Çok Dilli','3D','Web'] },
      { cat:'oyun', tag:'OYUN · SİMÜLASYON', title:'Project Homeostasis', desc:'Altı hormonlu biyolojik simülasyon oyunu.', tags:['Unity','C#','Simülasyon'] },
      { cat:'yapayzeka', tag:'YAPAY ZEKÂ', title:'JARVIS AI', desc:'Sesle çalışan HUD arayüzlü kişisel asistan.', tags:['Python','AI','HUD'] },
      { cat:'masaustu', tag:'MASAÜSTÜ', title:'Nova Kütüphane', desc:'Katalog ve ödünç takip sistemi.', tags:['Python','Tkinter','Masaüstü'] }
    ];
    const projectsGrid = document.getElementById('projectsGrid');
    if (projectsGrid) {
      projectsGrid.innerHTML = projects.map(p => `
        <article class="project-card" data-category="${p.cat}" data-tilt data-reveal="up">
          <div class="project-card__thumb"><span class="thumb__tag mono">${p.tag}</span><div class="thumb__scan"></div></div>
          <div class="project-card__body">
            <h3 class="project-card__title">${p.title}</h3>
            <p class="project-card__desc">${p.desc}</p>
            <div class="project-card__tags">${p.tags.map(t=>`<span>${t}</span>`).join('')}</div>
            <div class="project-card__links">
              <a href="#" data-cursor="hover"><svg viewBox="0 0 24 24"><use href="#icon-github"/></svg></a>
              <a href="#" class="btn btn--sm btn--ghost" data-cursor="hover">Canlı Demo <svg viewBox="0 0 24 24"><use href="#icon-external"/></svg></a>
            </div>
          </div>
        </article>
      `).join('');
    }

    const services = [
      { iconA:'<rect x="4" y="6" width="24" height="20" rx="2.5"/><line x1="4" y1="12" x2="28" y2="12"/>', iconB:'<path d="M16 5 4 11v10l12 6 12-6V11Z"/><path d="M16 5v22M4 11l12 6 12-6"/>', title:'Web Tasarım & Geliştirme', desc:'Konseptten yayına hızlı, duyarlı web siteleri.' },
      { iconA:'<path d="M5 22c5 0 4-14 9-14s2 14 9 14"/>', iconB:'<path d="M6 16a10 10 0 0 1 20 0"/><circle cx="16" cy="16" r="2"/>', title:'Arayüz Animasyonları', desc:'GSAP ile sinematik scroll deneyimleri.' },
      { iconA:'<rect x="5" y="6" width="22" height="15" rx="2"/><line x1="11" y1="26" x2="21" y2="26"/>', iconB:'<circle cx="16" cy="14" r="9"/><path d="M16 9v5l3.5 2"/>', title:'Masaüstü Uygulamalar', desc:'Python ile gerçek ihtiyaçlara çözümler.' },
      { iconA:'<polygon points="16,4 27,10 27,22 16,28 5,22 5,10"/>', iconB:'<circle cx="11" cy="11" r="3"/><circle cx="21" cy="11" r="3"/><circle cx="16" cy="21" r="3"/>', title:'Oyun & Simülasyon', desc:'Unity C# ile etkileşimli sistemler.' },
      { iconA:'<circle cx="16" cy="16" r="6"/><line x1="16" y1="3" x2="16" y2="7"/>', iconB:'<rect x="7" y="7" width="18" height="18" rx="3"/><path d="M12 16h8M16 12v8"/>', title:'Yapay Zekâ Araçları', desc:'Dil modelleriyle entegre asistanlar.' },
      { iconA:'<rect x="6" y="6" width="20" height="20" rx="6"/>', iconB:'<path d="M16 4 6 9.5v8.7c0 6 4.3 8.6 10 9.8 5.7-1.2 10-3.8 10-9.8V9.5Z"/>', title:'Marka & Görsel Kimlik', desc:'Glassmorphism dijital kimlikler.' }
    ];
    const servicesGrid = document.getElementById('servicesGrid');
    if (servicesGrid) {
      servicesGrid.innerHTML = services.map(s => `
        <article class="service-card" data-reveal="up">
          <div class="service-card__icon">
            <svg class="icon-a" viewBox="0 0 32 32">${s.iconA}</svg>
            <svg class="icon-b" viewBox="0 0 32 32">${s.iconB}</svg>
          </div>
          <h3>${s.title}</h3><p>${s.desc}</p>
        </article>
      `).join('');
    }

    const timeline = [
      { idx:'01', title:'Temeller', desc:'HTML, CSS ve JavaScript ile ilk satırlar.' },
      { idx:'02', title:'Arayüz Zanaatı', desc:'React ve animasyon kütüphanelerine geçiş.' },
      { idx:'03', title:'Masaüstüne Açılış', desc:'Python ve Tkinter ile gerçek dünya araçları.' },
      { idx:'04', title:'Simülasyon & Oyun', desc:'Unity C# ile sistemik düşünme.' },
      { idx:'05', title:'Bugün — Freelance', desc:'Müşteri projeleri ve yapay zekâ entegrasyonları.' }
    ];
    const timelineContainer = document.getElementById('timelineContainer');
    if (timelineContainer) {
      timelineContainer.innerHTML = `
        <div class="timeline__line"><div class="timeline__line-fill" id="timelineFill"></div></div>
        ${timeline.map(t => `
          <div class="timeline__item" data-reveal="up">
            <span class="timeline__node"></span>
            <div class="timeline__content">
              <span class="timeline__index mono">${t.idx}</span>
              <h3>${t.title}</h3><p>${t.desc}</p>
            </div>
          </div>
        `).join('')}
      `;
    }

    const testimonials = [
      { quote:'Projeyi teslim aldığımızda ekibimiz hayrete düştü.', author:'ALPİ Marka Ekibi', role:'ALPİ Projesi', avatar:'AE' },
      { quote:'Karanlık tema ve hareket dili tam istediğimiz gibiydi.', author:'KAGE FORGE', role:'Kurucu Ortak', avatar:'KF' },
      { quote:'Üç dilli site uluslararası misafirlerimize kapı açtı.', author:'Piccolo Cafe', role:'İşletmeci', avatar:'PC' },
      { quote:'Nova ile kataloğumuzu dakikalar içinde tarıyoruz.', author:'Kütüphane Projesi', role:'Müşteri', avatar:'NK' }
    ];
    const track = document.getElementById('testimonialsTrack');
    if (track) {
      track.innerHTML = testimonials.map(t => `
        <article class="testimonial-card">
          <svg class="testimonial-card__quote" viewBox="0 0 32 24"><path d="M0 24V12.5C0 5 4.8 0 12 0v6c-3.6 0-6 2.4-6 6.5V13h6v11H0Zm18 0V12.5C18 5 22.8 0 30 0v6c-3.6 0-6 2.4-6 6.5V13h6v11H18Z"/></svg>
          <p>${t.quote}</p>
          <div class="testimonial-card__author">
            <span class="testimonial-card__avatar mono">${t.avatar}</span>
            <div><strong>${t.author}</strong><span>${t.role}</span></div>
          </div>
        </article>
      `).join('');
    }
  }

  // ---------- START ----------
  document.addEventListener('DOMContentLoaded', initLoader);
})();
