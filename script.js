/**
 * JAVEX – Game Development Company
 * Interactive Engine & UI Script
 */

(function () {
  'use strict';

  // State Management
  const state = {
    audioEnabled: false,
    audioCtx: null,
    activeModal: null,
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
  };

  /* ==========================================================================
     1. Web Audio API - Sci-Fi Synthesizer Sound Engine
     ========================================================================== */
  function initAudioContext() {
    if (!state.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        state.audioCtx = new AudioContext();
      }
    }
    if (state.audioCtx && state.audioCtx.state === 'suspended') {
      state.audioCtx.resume();
    }
  }

  function playSound(type) {
    if (!state.audioEnabled || state.prefersReducedMotion) return;
    try {
      initAudioContext();
      if (!state.audioCtx) return;

      const ctx = state.audioCtx;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'hover') {
        // High soft blip
        osc.type = 'sine';
        osc.frequency.setValueAtTime(540, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.05);
        gain.gain.setValueAtTime(0.02, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
        osc.start(now);
        osc.stop(now + 0.06);
      } else if (type === 'click') {
        // Futuristic cyber click
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(1100, now + 0.08);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'success') {
        // Sci-fi chord chime
        const freqs = [523.25, 659.25, 783.99, 1046.50];
        freqs.forEach((freq, idx) => {
          const chordOsc = ctx.createOscillator();
          const chordGain = ctx.createGain();
          chordOsc.type = 'sine';
          chordOsc.frequency.setValueAtTime(freq, now + idx * 0.04);
          chordGain.gain.setValueAtTime(0.03, now + idx * 0.04);
          chordGain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 0.35);
          chordOsc.connect(chordGain);
          chordGain.connect(ctx.destination);
          chordOsc.start(now + idx * 0.04);
          chordOsc.stop(now + idx * 0.04 + 0.35);
        });
      } else if (type === 'modal') {
        // Deep whoosh
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.15);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
      }
    } catch (e) {
      // Graceful fallback if Web Audio is restricted
    }
  }

  function setupAudioToggle() {
    const audioBtn = document.getElementById('audio-toggle');
    if (!audioBtn) return;

    // Check localStorage
    const savedAudio = localStorage.getItem('javex_sound');
    if (savedAudio === 'on') {
      state.audioEnabled = true;
      audioBtn.classList.add('sound-on');
    }

    audioBtn.addEventListener('click', () => {
      initAudioContext();
      state.audioEnabled = !state.audioEnabled;
      localStorage.setItem('javex_sound', state.audioEnabled ? 'on' : 'off');
      audioBtn.classList.toggle('sound-on', state.audioEnabled);
      if (state.audioEnabled) {
        playSound('success');
      }
    });

    // Attach hover & click sounds to interactive items
    const interactives = document.querySelectorAll('.btn, .nav-link, .game-card, .feature-card, .service-card, .role-apply-btn, .social-btn');
    interactives.forEach(el => {
      el.addEventListener('mouseenter', () => playSound('hover'));
      el.addEventListener('click', () => playSound('click'));
    });
  }

  /* ==========================================================================
     2. Starfield & Cyber Particle Network Canvas
     ========================================================================== */
  function setupAmbientCanvas() {
    const canvas = document.getElementById('ambient-canvas');
    if (!canvas || state.prefersReducedMotion) return;

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouseX = width / 2;
    let mouseY = height / 2;
    let isMouseOver = false;

    // Responsive resize
    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    });

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      isMouseOver = true;
    });

    document.addEventListener('mouseleave', () => {
      isMouseOver = false;
    });

    // Particle Configuration
    const particleCount = Math.min(Math.floor((width * height) / 18000), 75);
    let particles = [];

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.45;
        this.vy = (Math.random() - 0.5) * 0.45;
        this.radius = Math.random() * 1.8 + 0.6;
        this.color = Math.random() > 0.5 ? 'rgba(0, 240, 255,' : 'rgba(168, 85, 247,';
        this.alpha = Math.random() * 0.5 + 0.2;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Wrap around screen
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;

        // Subtle mouse interaction
        if (isMouseOver) {
          const dx = mouseX - this.x;
          const dy = mouseY - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            this.x -= (dx / dist) * 0.8;
            this.y -= (dy / dist) * 0.8;
          }
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${this.color} ${this.alpha})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = this.color === 'rgba(0, 240, 255,' ? '#00f0ff' : '#a855f7';
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    function initParticles() {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    }

    initParticles();

    let animationFrameId;
    function animate() {
      ctx.clearRect(0, 0, width, height);

      // Draw constellation connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 115) {
            const alpha = (1 - dist / 115) * 0.16;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(168, 85, 247, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Update and draw particles
      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    }

    animate();
  }

  /* ==========================================================================
     3. Custom Glow Cursor Tracker (Desktop)
     ========================================================================== */
  function setupCursorGlow() {
    const glow = document.getElementById('cursor-glow');
    if (!glow || window.matchMedia('(pointer: coarse)').matches) {
      if (glow) glow.style.display = 'none';
      return;
    }

    let mouseX = -500;
    let mouseY = -500;
    let currentX = -500;
    let currentY = -500;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function renderGlow() {
      currentX += (mouseX - currentX) * 0.12;
      currentY += (mouseY - currentY) * 0.12;
      glow.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;
      requestAnimationFrame(renderGlow);
    }

    renderGlow();
  }

  /* ==========================================================================
     4. Header Scroll Spy & Sticky Behavior
     ========================================================================== */
  function setupHeaderScroll() {
    const header = document.getElementById('site-header');
    const navLinks = document.querySelectorAll('.desktop-nav .nav-link, .mobile-nav-links .nav-link');
    const sections = document.querySelectorAll('section[id]');

    function onScroll() {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;

      // Header shadow and blur
      if (scrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }

      // Scroll spy
      const scrollPos = scrollY + 140;
      sections.forEach((sec) => {
        const top = sec.offsetTop;
        const height = sec.offsetHeight;
        const id = sec.getAttribute('id');

        if (scrollPos >= top && scrollPos < top + height) {
          navLinks.forEach((link) => {
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ==========================================================================
     5. Mobile Menu Drawer
     ========================================================================== */
  function setupMobileMenu() {
    const toggle = document.getElementById('mobile-toggle');
    const drawer = document.getElementById('mobile-drawer');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    if (!toggle || !drawer) return;

    function toggleMenu(open) {
      const isExpanded = open !== undefined ? open : toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', isExpanded);
      drawer.setAttribute('aria-hidden', !isExpanded);
      drawer.classList.toggle('open', isExpanded);
      document.body.style.overflow = isExpanded ? 'hidden' : '';
    }

    toggle.addEventListener('click', () => toggleMenu());

    mobileLinks.forEach((link) => {
      link.addEventListener('click', () => toggleMenu(false));
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('open')) {
        toggleMenu(false);
      }
    });
  }

  /* ==========================================================================
     6. Scroll Reveal Observer
     ========================================================================== */
  function setupScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal-fade-up');
    if (!revealElements.length) return;

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('active');
            }
          });
        },
        {
          rootMargin: '0px 0px -60px 0px',
          threshold: 0.1
        }
      );

      revealElements.forEach((el) => observer.observe(el));
    } else {
      revealElements.forEach((el) => el.classList.add('active'));
    }
  }

  /* ==========================================================================
     7. Interactive 3D Card Tilt
     ========================================================================== */
  function setupCardTilt() {
    if (state.prefersReducedMotion || window.matchMedia('(pointer: coarse)').matches) return;

    const cards = document.querySelectorAll('[data-tilt], .game-card');

    cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -6;
        const rotateY = ((x - centerX) / centerX) * 6;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ==========================================================================
     8. Game Concept Details & Modal Dialog
     ========================================================================== */
  const gameData = {
    fantasy: {
      title: 'Aethelgard: The Shattered Realm',
      tag: 'Fantasy Adventure • Action RPG',
      image: 'assets/images/game-fantasy.jpg',
      lore: 'In the shattered celestial sky realms of Aethelgard, gravity has fragmented into floating citadel isles anchored only by primordial runes. As the last Runebound Sentinel, players venture across breathtaking archipelagos, scaling ancient floating palaces and wielding luminous rune-infused broadswords to prevent the realm from collapsing into the void.',
      features: [
        'Dynamic vertical exploration with celestial grappling and glider mechanics.',
        'Deep rune-crafting combat combining elemental parries and arcane spellweaving.',
        'Seamless co-op for up to 4 players with shared quest persistence.',
        'Built with Unreal Engine 5 Nanite geometry and real-time Lumen global illumination.'
      ],
      specs: {
        engine: 'Unreal Engine 5.4',
        platforms: 'PC (Steam/Epic), PlayStation 5, Xbox Series X|S',
        targetFPS: '4K @ 60 FPS / 1440p @ 120 FPS',
        status: 'Active Concept Prototyping'
      }
    },
    space: {
      title: 'Hyperion Zero: Void Drift',
      tag: 'Space Odyssey • Sci-Fi Simulation',
      image: 'assets/images/game-space.jpg',
      lore: 'Beyond the charted perimeter of the Solar Confederation lies the Hyperion Anomaly—a colossal, ancient interstellar jump gate orbiting a tempestuous ringed gas giant. Players navigate experimental modular explorer starships through uncharted solar systems, hazardous asteroid fields, and cosmic nebulas to uncover the technology of a disappeared precursor civilization.',
      features: [
        'Newtonian orbital physics seamlessly transitioning to quantum drift combat.',
        'Deep starship modular customization: reactors, hyperdrives, shields, and laser arrays.',
        'Dynamic universe events: cosmic solar storms, gravity collapses, and uncharted derelicts.',
        'Proprietary Spatial Raytracing audio simulating real cockpit acoustics and cosmic vibrations.'
      ],
      specs: {
        engine: 'Custom High-Performance C++ Simulation Core',
        platforms: 'PC, Next-Gen Consoles, Cloud VR Support',
        targetFPS: '120 FPS Seamless Simulation',
        status: 'Pre-Alpha Mechanics Sandbox'
      }
    },
    cyberpunk: {
      title: 'Neon Syndicate: Protocol X',
      tag: 'Cyberpunk Legends • Tactical Action',
      image: 'assets/images/game-cyberpunk.jpg',
      lore: 'In the rain-slicked vertical megalopolis of Neo-Minato, sovereign mega-corporations control neural networks while the underworld operates in the shadows. Step into the boots of a cybernetically enhanced infiltration operative, wielding high-frequency plasma katanas, optical cloaking, and synthetic neural overrides in high-stakes tactical contracts.',
      features: [
        'High-octane acrobatic combat blending wall-running, blade parries, and aerial takedowns.',
        'Real-time neural network hacking to turn enemy turrets, spinners, and cyberware against them.',
        'A living, breathing multi-tiered metropolis with dynamic AI crowds and corporate law enforcement.',
        'Full hardware raytraced reflections, volumetric neon fog, and atmospheric synthwave score.'
      ],
      specs: {
        engine: 'Unreal Engine 5 with Custom Neural Physics Plugin',
        platforms: 'PC, PlayStation 5, Xbox Series X',
        targetFPS: '60–120 FPS with Ultra Raytracing',
        status: 'Concept & Art Bible Phase'
      }
    }
  };

  function setupGameModal() {
    const modal = document.getElementById('game-modal');
    const slot = document.getElementById('modal-content-slot');
    const closeBtn = document.getElementById('modal-close-btn');
    const previewButtons = document.querySelectorAll('[data-open-modal]');

    if (!modal || !slot || !closeBtn) return;

    function openModal(gameKey) {
      const data = gameData[gameKey];
      if (!data) return;

      playSound('modal');

      slot.innerHTML = `
        <div style="margin-bottom: 1.5rem;">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 0.5rem; flex-wrap:wrap; gap:0.5rem;">
            <span style="font-family:var(--font-display); font-size:0.8rem; font-weight:700; color:var(--electric-blue); text-transform:uppercase; letter-spacing:0.1em; background:rgba(0,240,255,0.1); padding:0.3rem 0.75rem; border-radius:var(--radius-sm); border:1px solid rgba(0,240,255,0.3);">
              ${data.tag}
            </span>
            <span style="font-family:var(--font-display); font-size:0.75rem; color:var(--neon-purple); border:1px solid rgba(168,85,247,0.3); padding:0.25rem 0.6rem; border-radius:var(--radius-sm);">
              ${data.specs.status}
            </span>
          </div>
          <h2 style="font-size:clamp(1.75rem, 3.5vw, 2.5rem); margin-bottom:1rem; font-weight:800; text-transform:uppercase;">
            ${data.title}
          </h2>
        </div>

        <div style="border-radius:var(--radius-md); overflow:hidden; border:1px solid rgba(168,85,247,0.3); margin-bottom:1.75rem; box-shadow:0 15px 35px rgba(0,0,0,0.8);">
          <img src="${data.image}" alt="${data.title} Concept Showcase" style="width:100%; aspect-ratio:16/9; object-fit:cover; display:block;">
        </div>

        <div style="margin-bottom: 1.75rem;">
          <h4 style="font-family:var(--font-display); font-size:1.05rem; color:var(--text-white); margin-bottom:0.75rem; text-transform:uppercase; letter-spacing:0.05em;">
            World Synopsis & Lore
          </h4>
          <p style="color:var(--text-muted); font-size:1rem; line-height:1.7;">
            ${data.lore}
          </p>
        </div>

        <div style="margin-bottom: 2rem;">
          <h4 style="font-family:var(--font-display); font-size:1.05rem; color:var(--electric-blue); margin-bottom:0.75rem; text-transform:uppercase; letter-spacing:0.05em;">
            Core Gameplay Pillars
          </h4>
          <ul style="list-style:none; display:flex; flex-direction:column; gap:0.6rem;">
            ${data.features
              .map(
                (f) => `
              <li style="display:flex; align-items:flex-start; gap:0.65rem; color:var(--text-light); font-size:0.95rem;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" stroke-width="2.5" style="flex-shrink:0; margin-top:2px;">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>${f}</span>
              </li>
            `
              )
              .join('')}
          </ul>
        </div>

        <div style="background:rgba(7,9,20,0.7); border:1px solid rgba(255,255,255,0.08); border-radius:var(--radius-md); padding:1.25rem; display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:1rem; margin-bottom:2rem;">
          <div>
            <div style="font-size:0.75rem; color:var(--text-dim); text-transform:uppercase; font-family:var(--font-display);">Engine Core</div>
            <div style="font-weight:700; color:var(--text-white); margin-top:2px;">${data.specs.engine}</div>
          </div>
          <div>
            <div style="font-size:0.75rem; color:var(--text-dim); text-transform:uppercase; font-family:var(--font-display);">Target Platforms</div>
            <div style="font-weight:700; color:var(--text-white); margin-top:2px;">${data.specs.platforms}</div>
          </div>
          <div>
            <div style="font-size:0.75rem; color:var(--text-dim); text-transform:uppercase; font-family:var(--font-display);">Performance Spec</div>
            <div style="font-weight:700; color:var(--electric-blue); margin-top:2px;">${data.specs.targetFPS}</div>
          </div>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:1rem;">
          <a href="#contact" class="btn btn-primary" onclick="document.getElementById('modal-close-btn').click();">
            <span>Inquire About Co-Production</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </a>
        </div>
      `;

      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      state.activeModal = modal;
    }

    function closeModal() {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      state.activeModal = null;
    }

    previewButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const gameKey = btn.getAttribute('data-open-modal');
        openModal(gameKey);
      });
    });

    closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('open')) {
        closeModal();
      }
    });
  }

  /* ==========================================================================
     9. Careers Modal & Application Handling
     ========================================================================== */
  function setupCareersModal() {
    const modal = document.getElementById('career-modal');
    const closeBtn = document.getElementById('career-modal-close');
    const roleInput = document.getElementById('career-role-input');
    const applyButtons = document.querySelectorAll('.role-apply-btn');
    const generalApplyBtn = document.getElementById('open-general-careers-btn');
    const form = document.getElementById('career-application-form');
    const alertBox = document.getElementById('career-form-alert');

    if (!modal || !closeBtn || !form) return;

    function openCareersModal(roleTitle) {
      playSound('modal');
      roleInput.value = roleTitle || 'General Game Developer / Artist Application';
      if (alertBox) alertBox.style.display = 'none';
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      state.activeModal = modal;
    }

    function closeCareersModal() {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      state.activeModal = null;
    }

    applyButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const role = btn.getAttribute('data-role');
        openCareersModal(role);
      });
    });

    if (generalApplyBtn) {
      generalApplyBtn.addEventListener('click', () => {
        openCareersModal('General Speculative Application');
      });
    }

    closeBtn.addEventListener('click', closeCareersModal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeCareersModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('open')) {
        closeCareersModal();
      }
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      submitBtn.innerHTML = '<span>Transmitting Application...</span>';
      submitBtn.disabled = true;

      setTimeout(() => {
        playSound('success');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        form.reset();

        if (alertBox) {
          alertBox.className = 'form-alert success';
          alertBox.style.display = 'flex';
          alertBox.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span>Application transmitted to the JAVEX studio review board. We will reach out via email!</span>
          `;
        }

        setTimeout(() => {
          closeCareersModal();
        }, 2200);
      }, 900);
    });
  }

  /* ==========================================================================
     10. Contact Form Validation & Transmission
     ========================================================================== */
  function setupContactForm() {
    const form = document.getElementById('contact-form');
    const alertBox = document.getElementById('form-alert');
    const alertMsg = document.getElementById('form-alert-message');
    const submitBtn = document.getElementById('btn-submit-contact');
    const submitText = document.getElementById('btn-submit-text');

    if (!form || !submitBtn) return;

    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const subjectInput = document.getElementById('contact-subject');
    const messageInput = document.getElementById('contact-message');

    const nameFeedback = document.getElementById('name-feedback');
    const emailFeedback = document.getElementById('email-feedback');
    const subjectFeedback = document.getElementById('subject-feedback');
    const messageFeedback = document.getElementById('message-feedback');

    function validateEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;

      // Validate Name
      if (!nameInput.value.trim()) {
        nameFeedback.className = 'form-feedback error';
        isValid = false;
      } else {
        nameFeedback.className = 'form-feedback';
      }

      // Validate Email
      if (!validateEmail(emailInput.value.trim())) {
        emailFeedback.className = 'form-feedback error';
        isValid = false;
      } else {
        emailFeedback.className = 'form-feedback';
      }

      // Validate Subject
      if (!subjectInput.value) {
        subjectFeedback.className = 'form-feedback error';
        isValid = false;
      } else {
        subjectFeedback.className = 'form-feedback';
      }

      // Validate Message
      if (messageInput.value.trim().length < 15) {
        messageFeedback.className = 'form-feedback error';
        isValid = false;
      } else {
        messageFeedback.className = 'form-feedback';
      }

      if (!isValid) {
        if (alertBox) {
          alertBox.className = 'form-alert error';
          alertMsg.textContent = 'Please correct the highlighted fields before sending transmission.';
          alertBox.style.display = 'flex';
        }
        return;
      }

      // Simulated Transmission
      submitBtn.disabled = true;
      submitText.textContent = 'Encrypting & Sending...';

      setTimeout(() => {
        playSound('success');
        submitBtn.disabled = false;
        submitText.textContent = 'Send Message';

        if (alertBox) {
          alertBox.className = 'form-alert success';
          alertMsg.textContent = 'Transmission acknowledged! Our production team has received your message.';
          alertBox.style.display = 'flex';
        }

        form.reset();

        setTimeout(() => {
          if (alertBox) alertBox.style.display = 'none';
        }, 6000);
      }, 1000);
    });

    // Clear error on input
    [nameInput, emailInput, subjectInput, messageInput].forEach((input) => {
      input.addEventListener('input', () => {
        const feedback = input.parentElement.querySelector('.form-feedback');
        if (feedback) feedback.className = 'form-feedback';
      });
    });
  }

  /* ==========================================================================
     11. Newsletter Form Handling
     ========================================================================== */
  function setupNewsletter() {
    const form = document.getElementById('newsletter-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('.newsletter-input');
      const email = input.value.trim();

      if (email) {
        playSound('success');
        input.value = '';
        input.placeholder = 'Synchronized! Welcome aboard.';
        setTimeout(() => {
          input.placeholder = 'Your player email...';
        }, 3500);
      }
    });
  }

  /* ==========================================================================
     Initialise Engine
     ========================================================================== */
  document.addEventListener('DOMContentLoaded', () => {
    setupAudioToggle();
    setupAmbientCanvas();
    setupCursorGlow();
    setupHeaderScroll();
    setupMobileMenu();
    setupScrollReveal();
    setupCardTilt();
    setupGameModal();
    setupCareersModal();
    setupContactForm();
    setupNewsletter();
  });
})();
