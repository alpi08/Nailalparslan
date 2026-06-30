(function() {
  'use strict';

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
  const contactForm = document.getElementById('contactForm');
  const contactFormNote = document.getElementById('contactFormNote');
  const footerYear = document.getElementById('footerYear');
  const topbarTime = document.getElementById('topbarTime');

  let mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0;
  const isTouch = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // ---------- LOADER ----------
  function initLoader() {
    const messages = ["> Sistem başlatılıyor...", "> Paketler yükleniyor...", "> Arayüz hazır."];
    let progress = 0;
    const interval = setInterval(() => {
      progress += 1;
      if (progress > 100) progress = 100;
      loaderPercent.textContent = progress;
      loaderBarFill.style.width = progress + '%';
      const idx = Math.min(Math.floor(progress / 30), messages.length - 1);
      loaderTerminal.innerHTML = messages.slice(0, idx + 1).map(m => `<span>${m}</span>`).join('');
      if (progress === 100) { clearInterval(interval); completeLoading(); }
    }, 25);
  }

  function completeLoading() {
    const tl = gsap.timeline({ onComplete: () => {
      loader.style.display = 'none';
      document.body.classList.add('loaded');
      initMain();
    }});
    tl.to(revealWipe.children, { scaleY: 0, duration: 0.8, stagger: 0.08, ease: 'power3.inOut', transformOrigin: 'bottom' });
  }

  // ---------- MAIN ----------
  function initMain() {
    initCustomCursor();
    initSmoothScroll();
    initScrollAnimations();
    initTyping();
    initParticleCanvases();
    initTilt();
    initMobileNav();
    initContactForm();
    initMisc();
    initClock();
    initBackToTop();
    populateContent();
  }

  // ---------- CURSOR ----------
  function initCustomCursor() {
    if (isTouch()) { document.body.style.cursor = 'auto'; return; }
    const ctx = cursorTrailCanvas.getContext('2d');
    cursorTrailCanvas.width = window.innerWidth;
    cursorTrailCanvas.height = window.innerHeight;
    let trail = [];
    function drawTrail() {
      ctx.clearRect(0, 0, cursorTrailCanvas.width, cursorTrailCanvas.height);
      trail = trail.filter(p => p.life > 0);
      trail.forEach(p => {
        p.life -= 0.02;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI*2);
        ctx.fillStyle = `rgba(34,232,255,${p.life*0.2})`;
        ctx.fill();
      });
      requestAnimationFrame(drawTrail);
    }
    drawTrail();
    document.addEventListener('mousemove', e => {
      mouseX = e.clientX; mouseY = e.clientY;
      if (Math.random() > 0.5) trail.push({ x: mouseX, y: mouseY, r: 2+Math.random()*3, life: 1 });
    });
    function updateCursor() {
      cursorX += (mouseX - cursorX) * 0.15;
      cursorY += (mouseY - cursorY) * 0.15;
      cursorRing.style.left = cursorX + 'px'; cursorRing.style.top = cursorY + 'px';
      cursorDot.style.left = mouseX + 'px'; cursorDot.style.top = mouseY + 'px';
      requestAnimationFrame(updateCursor);
    }
    updateCursor();
    document.querySelectorAll('[data-cursor="hover"]').forEach(el => {
      el.addEventListener('mouseenter', () => { cursorRing.classList.add('hover'); cursorDot.classList.add('hover'); });
      el.addEventListener('mouseleave', () => { cursorRing.classList.remove('hover'); cursorDot.classList.remove('hover'); });
    });
  }

  // ---------- SMOOTH SCROLL ----------
  function initSmoothScroll() {
    if (typeof Lenis === 'undefined') return;
    const lenis = new Lenis({ duration: 1.5, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(time => lenis.raf(time * 1000));
  }

  // ---------- SCROLL ANIMATIONS ----------
  function initScrollAnimations() {
    gsap.registerPlugin(ScrollTrigger, SplitText);
    document.querySelectorAll('[data-reveal]').forEach(el => {
      const dir = el.dataset.reveal;
      if (dir === 'lines') {
        const split = new SplitText(el, { type: 'lines' });
        gsap.set(split.lines, { opacity: 0, y: 20 });
        ScrollTrigger.create({ trigger: el, start: 'top 85%', onEnter: () => gsap.to(split.lines, { opacity:1, y:0, stagger:0.06, duration:0.6 }) });
      } else if (dir === 'mask') {
        gsap.set(el, { clipPath: 'inset(0 100% 0 0)' });
        ScrollTrigger.create({ trigger: el, start: 'top 80%', onEnter: () => gsap.to(el, { clipPath:'inset(0 0% 0 0)', duration:1 }) });
      } else {
        gsap.set(el, { opacity:0, y: dir==='up'?30:0 });
        ScrollTrigger.create({ trigger: el, start: 'top 82%', onEnter: () => gsap.to(el, { opacity:1, y:0, duration:0.8 }) });
      }
    });
    document.querySelectorAll('.skill-card__bar-fill').forEach(bar => {
      ScrollTrigger.create({ trigger: bar, start: 'top 85%', onEnter: () => gsap.to(bar, { width: bar.dataset.level+'%', duration:1 }) });
    });
    document.querySelectorAll('.stat__num[data-count]').forEach(stat => {
      const count = parseInt(stat.dataset.count);
      ScrollTrigger.create({ trigger: stat, start: 'top 85%', onEnter: () => {
        gsap.to(stat, { duration:1.5, innerText:count, snap:{ innerText:1 }, onUpdate() { stat.textContent = Math.floor(stat.innerText) + (stat.dataset.suffix||''); } });
      }});
    });
  }

  function initTyping() {
    const roles = ['Yaratıcı Geliştirici','Frontend Mühendisi','Siber Güvenlik Meraklısı'];
    let idx=0, char=0, del=false;
    function type() {
      const cur = roles[idx];
      heroRoleText.textContent = cur.substring(0,char);
      if (!del && char < cur.length) { char++; setTimeout(type,80); }
      else if (del && char > 0) { char--; setTimeout(type,40); }
      else if (!del && char === cur.length) { setTimeout(()=>{del=true;type();},2000); }
      else if (del && char === 0) { del=false; idx=(idx+1)%roles.length; setTimeout(type,400); }
    }
    type();
  }

  function initParticleCanvases() {
    function setup(canvas, color, count) {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
      const particles = Array.from({length:count}, () => ({
        x:Math.random()*canvas.width, y:Math.random()*canvas.height, r:Math.random()*2+0.5,
        vx:(Math.random()-0.5)*0.3, vy:(Math.random()-0.5)*0.3
      }));
      function draw() {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle = `rgba(${color},0.5)`;
        particles.forEach(p => {
          p.x+=p.vx; p.y+=p.vy;
          if(p.x<0)p.x=canvas.width; if(p.x>canvas.width)p.x=0;
          if(p.y<0)p.y=canvas.height; if(p.y>canvas.height)p.y=0;
          ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
        });
        requestAnimationFrame(draw);
      }
      draw();
    }
    setup(document.getElementById('heroCanvas'), '34,232,255', 70);
    setup(document.getElementById('footerCanvas'), '168,85,247', 40);
  }

  function initTilt() {
    document.querySelectorAll('[data-tilt]').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        gsap.to(card, { rotateX:(e.clientY-rect.top-rect.height/2)/10, rotateY:(rect.width/2-(e.clientX-rect.left))/10, duration:0.4 });
      });
      card.addEventListener('mouseleave', () => gsap.to(card, { rotateX:0, rotateY:0, duration:0.5 }));
    });
  }

  function initMobileNav() {
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

  function initContactForm() {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      contactFormNote.textContent = 'Gönderiliyor...';
      setTimeout(() => {
        contactFormNote.textContent = 'Mesajın iletildi!';
        contactForm.reset();
      }, 1500);
    });
  }

  function initMisc() {
    window.addEventListener('scroll', () => {
      const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      scrollProgressFill.style.width = scrolled + '%';
      header.classList.toggle('scrolled', window.scrollY > 100);
    });
    footerYear.textContent = new Date().getFullYear();
  }

  function initClock() {
    const update = () => topbarTime.textContent = new Date().toLocaleTimeString('tr-TR', { hour:'2-digit', minute:'2-digit', second:'2-digit' });
    update(); setInterval(update, 1000);
  }

  function initBackToTop() {
    window.addEventListener('scroll', () => backToTop.classList.toggle('visible', window.scrollY > 500));
    backToTop.addEventListener('click', () => window.scrollTo({ top:0, behavior:'smooth' }));
  }

  // ---------- DYNAMIC CONTENT ----------
  function populateContent() {
    const skills = [
      { icon:'<svg viewBox="0 0 32 32"><polyline points="9,8 4,16 9,24"/><polyline points="23,8 28,16 23,24"/></svg>', title:'HTML & CSS3', desc:'Anlamsal, erişilebilir arayüzler.', level:98 },
      { icon:'<svg viewBox="0 0 32 32"><rect x="5" y="6" width="22" height="20" rx="4"/><text x="16" y="20" text-anchor="middle" fill="currentColor" font-size="10">JS</text></svg>', title:'JavaScript', desc:'Modern, modüler uygulama mantığı.', level:95 },
      { icon:'<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="2.4"/><ellipse cx="16" cy="16" rx="13" ry="5"/></svg>', title:'React.js', desc:'Bileşen tabanlı mimariler.', level:90 },
      { icon:'<svg viewBox="0 0 32 32"><path d="M11 8a5 5 0 0 0 0 16"/><path d="M21 8a5 5 0 0 1 0 16"/></svg>', title:'Python', desc:'Otomasyon ve masaüstü uygulamalar.', level:88 },
      { icon:'<svg viewBox="0 0 32 32"><path d="M16 5 27 11.5v9L16 27 5 20.5v-9Z"/></svg>', title:'C# & Unity', desc:'Simülasyon ve oyun geliştirme.', level:82 },
      { icon:'<svg viewBox="0 0 32 32"><polygon points="16,4 27,10 27,22 16,28 5,22 5,10"/></svg>', title:'Node.js', desc:'Hafif backend servisleri.', level:78 },
      { icon:'<svg viewBox="0 0 32 32"><circle cx="9" cy="8" r="2.4"/><circle cx="23" cy="16" r="2.4"/></svg>', title:'Git & GitHub', desc:'Sürüm kontrolü.', level:90 },
      { icon:'<svg viewBox="0 0 32 32"><path d="M5 22c5 0 4-14 9-14s2 14 9 14"/></svg>', title:'Motion & GSAP', desc:'Sinematik animasyonlar.', level:93 }
    ];
    document.getElementById('skillsGrid').innerHTML = skills.map(s => `
      <article class="skill-card" data-tilt data-reveal="up">
        <div class="skill-card__icon">${s.icon}</div>
        <h3 class="skill-card__title">${s.title}</h3>
        <p class="skill-card__desc">${s.desc}</p>
        <div class="skill-card__bar"><div class="skill-card__bar-fill" data-level="${s.level}"></div></div>
        <span class="skill-card__level mono">${s.level}%</span>
      </article>
    `).join('');

    const projects = [
      { cat:'web', tag:'WEB · E-TİCARET', title:'KAGE FORGE', desc:'Ninja estetiğinden ilham alan e-ticaret deneyimi.', tags:['GSAP','Animasyon'] },
      { cat:'web', tag:'WEB · KURUMSAL', title:'ALPİ', desc:'Glassmorphism temelli kurumsal web sitesi.', tags:['Glassmorphism','UI/UX'] },
      { cat:'web', tag:'WEB · ÇOK DİLLİ', title:'Piccolo Cafe', desc:'3 boyutlu atom sahnesiyle açılan çok dilli kafe sitesi.', tags:['Çok Dilli','3D'] },
      { cat:'oyun', tag:'OYUN · SİMÜLASYON', title:'Project Homeostasis', desc:'Altı hormonlu biyolojik simülasyon oyunu.', tags:['Unity','C#'] },
      { cat:'yapayzeka', tag:'YAPAY ZEKÂ', title:'JARVIS AI', desc:'Sesle çalışan HUD arayüzlü kişisel asistan.', tags:['Python','AI'] },
      { cat:'masaustu', tag:'MASAÜSTÜ', title:'Nova Kütüphane', desc:'Katalog ve ödünç takip sistemi.', tags:['Python','Tkinter'] }
    ];
    document.getElementById('projectsGrid').innerHTML = projects.map(p => `
      <article class="project-card" data-category="${p.cat}" data-tilt data-reveal="up">
        <div class="project-card__thumb"><span class="thumb__tag mono">${p.tag}</span></div>
        <div class="project-card__body">
          <h3 class="project-card__title">${p.title}</h3>
          <p class="project-card__desc">${p.desc}</p>
          <div class="project-card__tags">${p.tags.map(t=>`<span>${t}</span>`).join('')}</div>
        </div>
      </article>
    `).join('');

    const services = [
      { iconA:'<rect x="4" y="6" width="24" height="20" rx="2.5"/>', iconB:'<path d="M16 5 4 11v10l12 6 12-6V11Z"/>', title:'Web Tasarım', desc:'Konseptten yayına hızlı, duyarlı web siteleri.' },
      { iconA:'<path d="M5 22c5 0 4-14 9-14s2 14 9 14"/>', iconB:'<path d="M6 16a10 10 0 0 1 20 0"/>', title:'Animasyon', desc:'GSAP ile sinematik scroll deneyimleri.' },
      { iconA:'<rect x="5" y="6" width="22" height="15" rx="2"/>', iconB:'<circle cx="16" cy="14" r="9"/>', title:'Masaüstü', desc:'Python ile gerçek ihtiyaçlara çözümler.' },
      { iconA:'<polygon points="16,4 27,10 27,22 16,28 5,22 5,10"/>', iconB:'<circle cx="11" cy="11" r="3"/><circle cx="21" cy="11" r="3"/>', title:'Oyun/Sim', desc:'Unity C# ile etkileşimli sistemler.' },
      { iconA:'<circle cx="16" cy="16" r="6"/>', iconB:'<rect x="7" y="7" width="18" height="18" rx="3"/>', title:'Yapay Zekâ', desc:'Dil modelleriyle entegre asistanlar.' },
      { iconA:'<rect x="6" y="6" width="20" height="20" rx="6"/>', iconB:'<path d="M16 4 6 9.5v8.7c0 6 4.3 8.6 10 9.8"/>', title:'Marka Kimlik', desc:'Glassmorphism dijital kimlikler.' }
    ];
    document.getElementById('servicesGrid').innerHTML = services.map(s => `
      <article class="service-card" data-reveal="up">
        <div class="service-card__icon">
          <svg class="icon-a" viewBox="0 0 32 32">${s.iconA}</svg>
          <svg class="icon-b" viewBox="0 0 32 32">${s.iconB}</svg>
        </div>
        <h3>${s.title}</h3><p>${s.desc}</p>
      </article>
    `).join('');

    const timeline = [
      { idx:'01', title:'Temeller', desc:'HTML, CSS ve JavaScript ile ilk satırlar.' },
      { idx:'02', title:'Arayüz Zanaatı', desc:'React ve animasyon kütüphanelerine geçiş.' },
      { idx:'03', title:'Masaüstüne Açılış', desc:'Python ve Tkinter ile gerçek dünya araçları.' },
      { idx:'04', title:'Simülasyon & Oyun', desc:'Unity C# ile sistemik düşünme.' },
      { idx:'05', title:'Bugün — Freelance', desc:'Müşteri projeleri ve yapay zekâ.' }
    ];
    document.getElementById('timelineContainer').innerHTML = `
      <div class="timeline__line"><div class="timeline__line-fill" id="timelineFill"></div></div>
      ${timeline.map(t => `
        <div class="timeline__item" data-reveal="up">
          <span class="timeline__node"></span>
          <div class="timeline__content"><span class="timeline__index mono">${t.idx}</span><h3>${t.title}</h3><p>${t.desc}</p></div>
        </div>
      `).join('')}
    `;
    const timelineFill = document.getElementById('timelineFill');
    if (timelineFill) {
      ScrollTrigger.create({ trigger: '.timeline', start: 'top 70%', end: 'bottom 30%', onUpdate: self => gsap.to(timelineFill, { height: self.progress*100+'%', duration:0.2 }) });
    }
  }

  document.addEventListener('DOMContentLoaded', initLoader);
})();
