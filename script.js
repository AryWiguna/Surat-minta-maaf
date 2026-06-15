/* ============================================================
   ROMANTIC APOLOGY WEBSITE — MAIN SCRIPT
   Handles: state management, animations, particle systems,
            typewriter effect, runaway button, falling petals
   ============================================================ */

;(function () {
  'use strict';

  // ────────── State Management ──────────
  const State = {
    current: 'envelope', // 'envelope' | 'message' | 'celebration'
    envelopeClicked: false,
    typingComplete: false,
    questionShown: false,
  };

  // ────────── DOM References ──────────
  const DOM = {
    // Sections
    envelopeSection: document.getElementById('envelope-section'),
    messageSection: document.getElementById('message-section'),
    poemSection: document.getElementById('poem-section'),

    // Poem specific elements
    poemText: document.getElementById('poem-text'),

    // Envelope
    envelopeContainer: document.getElementById('envelope-container'),
    envelopeImg: document.getElementById('envelope-img'),
    envelopeHint: document.getElementById('envelope-hint'),
    ambientParticles: document.getElementById('ambient-particles'),

    // Explosion
    explosionCanvas: document.getElementById('explosion-canvas'),

    // Message
    messageText: document.getElementById('message-text'),
    messageQuestion: document.getElementById('message-question'),
    buttonsContainer: document.getElementById('buttons-container'),
    btnYes: document.getElementById('btn-yes'),
    btnNo: document.getElementById('btn-no'),

    // Poem
    poemTextEl: document.getElementById('poem-text'),

    // Media & UI
    bgMusic: document.getElementById('bg-music'),
    bgVideo: document.getElementById('bg-video'),
    muteBtn: document.getElementById('mute-btn'),
    muteIconOn: document.getElementById('mute-icon-on'),
    muteIconOff: document.getElementById('mute-icon-off'),
  };

  // ────────── Configuration ──────────
  const CONFIG = {
    apologyText:
      'Hai Laksmi, maafin aku ya soal kemarin... aku malah keasyikan main game dan bikin kamu ngerasa dihiraukan. Padahal sama sekali nggak ada niat buat nyuekin kamu.',
    questionText: 'Maukah kamu jalan bareng aku di hari Sabtu? 🌸',
    poemText: `Di antara detak yang tak kuundang, di sela tawa yang kukira angin lalu, kau hadir seperti gerimis akhir Juni-tak diharapkan, tapi memaksa payung terbuka.

Aku yang biasa
menghitung jarak
kini tersesat di labirin matamu. sial, ternyata aku menyukaimu,
padahal kau hanya singgah, bukan tujuan.

Semesta mungkin tertawa, melihatku merangkai sejuta alasan untuk tetap diam,
sementara jantung berteriak namamu berkali-kali.

Pada akhirnya,
kutelan kata-kata ini bersama kopi yang mendingin.
Cinta memang tak selalu perlu jawaban-cukup aku yang tahu:

sial, ternyata aku menyukaimu.`,
    typewriterSpeed: 38, // ms per character
    typewriterPoemSpeed: 60, // slightly slower for poem
    explosionParticleCount: 80,
    petalCount: 25,
    runawayDistance: 140, // px — how far the "no" button runs
  };

  // ============================================================
  // 1. AMBIENT FLOATING PARTICLES (Envelope background)
  // ============================================================

  function createAmbientParticles() {
    const container = DOM.ambientParticles;
    const count = 20;

    if (!container) return; // safety check

    for (let i = 0; i < count; i++) {
      const dot = document.createElement('div');
      dot.classList.add('ambient-dot');

      const size = Math.random() * 4 + 2;
      const left = Math.random() * 100;
      const duration = Math.random() * 8 + 8;
      const delay = Math.random() * 10;

      dot.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${left}%;
        animation-duration: ${duration}s;
        animation-delay: ${delay}s;
      `;

      // Randomize color between orchid, rose, lavender
      const colors = [
        'rgba(218,112,214,0.5)',
        'rgba(232,160,191,0.5)',
        'rgba(184,169,232,0.5)',
      ];
      const color = colors[Math.floor(Math.random() * colors.length)];
      dot.style.background = `radial-gradient(circle, ${color}, transparent)`;

      container.appendChild(dot);
    }
  }

  // ============================================================
  // 2. ORCHID PARTICLE EXPLOSION (Envelope → Message transition)
  // ============================================================

  /**
   * Creates a particle explosion effect using the orchid (bunga.png) image.
   * Particles burst from the envelope center, fill the viewport,
   * then smoothly fade out to reveal the message section.
   */
  function triggerExplosion() {
    const canvas = DOM.explosionCanvas;
    const ctx = canvas.getContext('2d');

    // Set canvas to full viewport
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.classList.add('active');

    // Load the orchid image for particles
    const bungaImg = new Image();
    bungaImg.src = 'image/bunga.png';

    bungaImg.onload = function () {
      runExplosionAnimation(canvas, ctx, bungaImg);
    };

    // Fallback if image doesn't load
    bungaImg.onerror = function () {
      runExplosionAnimation(canvas, ctx, null);
    };
  }

  function runExplosionAnimation(canvas, ctx, img) {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const particles = [];
    const particleCount = CONFIG.explosionParticleCount;

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 2;
      const size = Math.random() * 50 + 25;
      const rotationSpeed = (Math.random() - 0.5) * 0.1;

      // Random crop from the orchid image for variety
      let sx = 0, sy = 0, sw = 100, sh = 100;
      if (img) {
        sx = Math.random() * (img.width - 150);
        sy = Math.random() * (img.height - 150);
        sw = Math.random() * 100 + 80;
        sh = Math.random() * 100 + 80;
      }

      particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: size,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: rotationSpeed,
        alpha: 1,
        sx, sy, sw, sh,
        life: 1,
        decay: Math.random() * 0.003 + 0.003,
        gravity: 0.02,
      });
    }

    // Additional "burst" particles — smaller, faster
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 10 + 5;
      particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 15 + 5,
        rotation: 0,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        alpha: 1,
        sx: img ? Math.random() * (img.width - 80) : 0,
        sy: img ? Math.random() * (img.height - 80) : 0,
        sw: 60,
        sh: 60,
        life: 1,
        decay: Math.random() * 0.008 + 0.006,
        gravity: 0.04,
        isBurst: true,
      });
    }

    let frameCount = 0;
    const maxFrames = 200;
    let globalAlpha = 1;

    function animate() {
      frameCount++;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background flash effect on first frames
      if (frameCount < 15) {
        const flashAlpha = Math.max(0, 1 - frameCount / 15) * 0.3;
        ctx.fillStyle = `rgba(218, 112, 214, ${flashAlpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Update & draw particles
      let aliveCount = 0;

      for (const p of particles) {
        if (p.life <= 0) continue;
        aliveCount++;

        // Physics
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.995;
        p.rotation += p.rotationSpeed;
        p.life -= p.decay;
        p.alpha = Math.max(0, p.life) * globalAlpha;

        // Draw
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.alpha;

        if (img) {
          // Draw a cropped piece of the orchid image
          try {
            ctx.drawImage(
              img,
              p.sx, p.sy, p.sw, p.sh,
              -p.size / 2, -p.size / 2, p.size, p.size
            );
          } catch (e) {
            // Fallback to colored circle
            drawFallbackParticle(ctx, p.size);
          }
        } else {
          drawFallbackParticle(ctx, p.size);
        }

        ctx.restore();
      }

      // Begin fading out after particles thin out
      if (frameCount > 100) {
        globalAlpha = Math.max(0, 1 - (frameCount - 100) / 80);
      }

      // Continue or finish
      if (frameCount < maxFrames && (aliveCount > 0 || frameCount < 120)) {
        requestAnimationFrame(animate);
      } else {
        // Clean up and transition
        canvas.classList.remove('active');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        transitionToMessage();
      }
    }

    // Small delay for dramatic effect
    gsap.to(DOM.envelopeContainer, {
      scale: 1.1,
      opacity: 0,
      duration: 0.5,
      ease: 'power2.in',
      onComplete: () => {
        animate();
      },
    });
  }

  function drawFallbackParticle(ctx, size) {
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size / 2);
    gradient.addColorStop(0, 'rgba(218, 112, 214, 0.8)');
    gradient.addColorStop(0.5, 'rgba(232, 160, 191, 0.5)');
    gradient.addColorStop(1, 'rgba(184, 169, 232, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // ============================================================
  // 3. SECTION TRANSITIONS
  // ============================================================

  function transitionToMessage() {
    State.current = 'message';

    // Hide envelope, show message
    DOM.envelopeSection.classList.remove('active');
    DOM.messageSection.classList.add('active');

    // MEMAINKAN DAN MEMUNCULKAN VIDEO BACKGROUND BUNGA
    DOM.bgVideo.play();
    DOM.bgVideo.classList.add('active');

    // Start typewriter after a beat
    setTimeout(() => {
      startTypewriter();
    }, 600);
  }

function transitionToPoem() {
  State.current = 'poem';

  // 1. Hilangkan section pesan menggunakan autoAlpha
  gsap.to(DOM.messageSection, {
    autoAlpha: 0, // Mengurus opacity: 0 & visibility: hidden sekaligus
    duration: 0.6,
    onComplete: () => {
      DOM.messageSection.classList.remove('active');

      // 2. Siapkan section puisi
      if (DOM.poemSection) {
        DOM.poemSection.classList.add('active');
        
        // 3. Munculkan puisi & foto dengan mulus
        gsap.fromTo(DOM.poemSection, 
          { autoAlpha: 0, y: 20 }, // Mulai dari transparan & posisinya sedikit di bawah
          { 
            autoAlpha: 1, // Memastikan opacity: 1 & visibility: visible
            y: 0,
            duration: 0.8, 
            ease: 'power2.out',
            onComplete: () => {
               // 4. Jaga-jaga kalau fungsi ketik puisi namanya berbeda di kodemu, 
               // kita buat fallback darurat agar teksnya PASTI muncul tanpa error.
               if (typeof showPoem === "function") {
                   showPoem();
               } else if (typeof typePoem === "function") {
                   typePoem();
               } else if (typeof startTypewriter === "function") {
                   startTypewriter(); // Jalankan kalau ini nama fungsi aslimu
               } else {
                   // Fallback: Langsung tembak teksnya ke HTML jika fungsi efek ngetik tidak ketemu
                   if (DOM.poemTextEl) {
                       DOM.poemTextEl.innerHTML = CONFIG.poemText.replace(/\n/g, '<br>');
                   }
               }
            }
          }
        );
      }
    }
  });
}

  // ============================================================
  // 4. TYPEWRITER EFFECT
  // ============================================================

  function startTypewriter() {
    const text = CONFIG.apologyText;
    let index = 0;
    const textEl = DOM.messageText;

    // Add cursor
    textEl.innerHTML = '<span class="cursor-blink"></span>';

    function type() {
      if (index < text.length) {
        // Remove cursor, add char, re-add cursor
        const cursor = textEl.querySelector('.cursor-blink');
        if (cursor) cursor.remove();

        textEl.innerHTML =
          text.substring(0, index + 1) +
          '<span class="cursor-blink"></span>';

        index++;
        setTimeout(type, CONFIG.typewriterSpeed);
      } else {
        // Typing complete — remove cursor after a beat
        State.typingComplete = true;
        setTimeout(() => {
          const cursor = textEl.querySelector('.cursor-blink');
          if (cursor) {
            gsap.to(cursor, {
              opacity: 0,
              duration: 0.5,
              onComplete: () => cursor.remove(),
            });
          }
          showQuestion();
        }, 800);
      }
    }

    type();
  }

  // ============================================================
  // 5. SHOW QUESTION & BUTTONS
  // ============================================================

  function showQuestion() {
    DOM.messageQuestion.textContent = CONFIG.questionText;

    // Animate question in
    setTimeout(() => {
      DOM.messageQuestion.classList.add('visible');
    }, 200);

    // Animate buttons in
    setTimeout(() => {
      DOM.buttonsContainer.classList.add('visible');
      State.questionShown = true;
      initRunawayButton();
    }, 800);
  }

  // ============================================================
  // 6. RUNAWAY "NO" BUTTON
  // ============================================================

  /**
   * The "Nggak." button actively dodges the cursor/touch.
   * On mobile, it responds to touch events near the button.
   */
  function initRunawayButton() {
    const btn = DOM.btnNo;
    const container = DOM.buttonsContainer;

    // Make container positioned relative for absolute child
    container.style.position = 'relative';
    container.style.minHeight = '160px';

    // Center the no button initially
    btn.style.left = '50%';
    btn.style.top = '80px';
    btn.style.transform = 'translateX(-50%)';

    // ── Desktop: mouseover ──
    btn.addEventListener('mouseover', () => {
      runAway(btn, container);
    });

    // ── Mobile: touchstart near button ──
    btn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      runAway(btn, container);
    });

    // Also detect touch/mouse approaching the button
    container.addEventListener('mousemove', (e) => {
      if (!State.questionShown) return;
      const rect = btn.getBoundingClientRect();
      const btnCx = rect.left + rect.width / 2;
      const btnCy = rect.top + rect.height / 2;
      const dist = Math.hypot(e.clientX - btnCx, e.clientY - btnCy);

      if (dist < CONFIG.runawayDistance) {
        runAway(btn, container);
      }
    });

    container.addEventListener(
      'touchmove',
      (e) => {
        if (!State.questionShown) return;
        const touch = e.touches[0];
        const rect = btn.getBoundingClientRect();
        const btnCx = rect.left + rect.width / 2;
        const btnCy = rect.top + rect.height / 2;
        const dist = Math.hypot(touch.clientX - btnCx, touch.clientY - btnCy);

        if (dist < CONFIG.runawayDistance) {
          runAway(btn, container);
        }
      },
      { passive: true }
    );
  }

  function runAway(btn, container) {
    const containerRect = container.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();

    // Calculate safe bounds
    const maxX = containerRect.width - btnRect.width - 10;
    const maxY = 150;

    // Random new position
    let newX = Math.random() * maxX;
    let newY = Math.random() * maxY + 20;

    // Make sure it actually moves away (at least 60px from current)
    const currentX = parseFloat(btn.style.left) || containerRect.width / 2;
    const currentY = parseFloat(btn.style.top) || 80;

    let attempts = 0;
    while (Math.hypot(newX - currentX, newY - currentY) < 60 && attempts < 10) {
      newX = Math.random() * maxX;
      newY = Math.random() * maxY + 20;
      attempts++;
    }

    btn.style.transform = 'none';
    btn.style.left = newX + 'px';
    btn.style.top = newY + 'px';
  }

  // ============================================================
  // 7. POEM — DISPLAY & TYPEWRITER
  // ============================================================

  function showPoem() {
    // Entrance animations for poem card
    gsap.from('.poem-card', {
      y: 50,
      opacity: 0,
      duration: 1.2,
      ease: 'power3.out',
    });

    gsap.from('.poem-photo-wrapper', {
      scale: 0,
      opacity: 0,
      duration: 1,
      delay: 0.5,
      ease: 'back.out(1.5)',
      onComplete: () => {
        startPoemTypewriter();
      }
    });
  }


  // ============================================================
  // FUNGSI ANIMASI MENGETIK PUISI
  // ============================================================
  function startPoemTypewriter() {
    const text = `Kamu dan cantikmu itu. barang kali semesta sedang berada dalam suasana paling baiknya, lalu dengan penuh ketelitian.

menciptakanmu. menyusun setiap indah pada tempatnya, menitipkan lembut pada tatapanmu, dan menaruh tenang pada senyummu.
maka tak heran jika setiap kali memandangmu, aku selalu berpikir hal yang sama:

semesta pasti sedang berbaik hati saat menciptakanmu`;
    
    if (!DOM.poemText) return;
    
    DOM.poemText.innerHTML = '<span class="cursor-blink"></span>';
    let i = 0;
    
    function typeWriter() {
      if (i < text.length) {
        // Hapus kursor sementara
        DOM.poemText.innerHTML = DOM.poemText.innerHTML.replace('<span class="cursor-blink"></span>', '');
        
        // Cek jika ada baris baru (enter)
        if (text.charAt(i) === '\n') {
          DOM.poemText.innerHTML += '<br>';
        } else {
          DOM.poemText.innerHTML += text.charAt(i);
        }
        
        // Tambahkan kursor lagi
        DOM.poemText.innerHTML += '<span class="cursor-blink"></span>';
        i++;
        
        // Kecepatan ketik: 40 milidetik (bisa kamu ubah lebih cepat/lambat)
        setTimeout(typeWriter, 50); 
      } else {
        // Hapus kursor jika sudah selesai mengetik
        setTimeout(() => {
          DOM.poemText.innerHTML = DOM.poemText.innerHTML.replace('<span class="cursor-blink"></span>', '');
        }, 3000);
      }
    }
    
    // Mulai ngetik
    typeWriter();
  }

  // ============================================================
  // 9. EVENT LISTENERS
  // ============================================================

  function initEventListeners() {
    // ── Envelope Click ──
    DOM.envelopeContainer.addEventListener('click', handleEnvelopeClick);
    DOM.envelopeContainer.addEventListener('touchend', (e) => {
      e.preventDefault();
      handleEnvelopeClick();
    });

    // ── "Yes" Button ──
    DOM.btnYes.addEventListener('click', handleYesClick);

    // ── Mute Button ──
    if (DOM.muteBtn) {
      DOM.muteBtn.addEventListener('click', toggleMute);
    }

    // ── Window Resize (resize explosion canvas if needed) ──
    window.addEventListener('resize', () => {
      DOM.explosionCanvas.width = window.innerWidth;
      DOM.explosionCanvas.height = window.innerHeight;
    });
  }

  function handleEnvelopeClick() {
    if (State.envelopeClicked) return;
    State.envelopeClicked = true;

    // Play music & video
    if (DOM.bgMusic) {
      DOM.bgMusic.volume = 0.5;
      DOM.bgMusic.play().catch(e => console.log('Audio play failed:', e));
    }
    if (DOM.bgVideo) {
      DOM.bgVideo.play().catch(e => console.log('Video play failed:', e));
      DOM.bgVideo.classList.add('active');
    }
    if (DOM.muteBtn) DOM.muteBtn.classList.add('visible');

    // Haptic feedback on mobile (if supported)
    if (navigator.vibrate) navigator.vibrate(50);

    triggerExplosion();
  }

  function toggleMute() {
    if (DOM.bgMusic) {
      if (DOM.bgMusic.muted) {
        DOM.bgMusic.muted = false;
        DOM.muteIconOn.style.display = 'block';
        DOM.muteIconOff.style.display = 'none';
      } else {
        DOM.bgMusic.muted = true;
        DOM.muteIconOn.style.display = 'none';
        DOM.muteIconOff.style.display = 'block';
      }
    }
  }

  function handleYesClick() {
    if (State.current === 'poem') return;

    // Send Discord Webhook
    const webhookUrl = "https://discord.com/api/webhooks/1508847261457842296/KETY0FQj37dtnCdUVHftn1ZRyZ0iElXS-fuGtiZYroE-nNQER3VVwDGD4bRhg8afckq-";
    fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: "💖 Laksmi bilang **Iya, mau!** 💖\nDia setuju untuk jalan bareng hari Sabtu!"
      })
    }).catch(console.error);

    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate([50, 50, 50]);

    // Button press animation
    gsap.to(DOM.btnYes, {
      scale: 0.92,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        transitionToPoem();
      },
    });
  }

  function createFallingEmojis() {
    const container = document.getElementById('falling-emojis-container');
    if (!container) return;

    const emojis = ['🌸', '🌺', '🌷', '🏵️', '💐', '🌸', '🌼', '🌻']; // Pilihan emoji bunga
    const totalEmojis = 25; // Jumlah bunga yang turun

    for (let i = 0; i < totalEmojis; i++) {
      const emojiEl = document.createElement('div');
      emojiEl.classList.add('falling-emoji');
      
      // Pilih emoji secara acak
      emojiEl.innerText = emojis[Math.floor(Math.random() * emojis.length)];
      
      // Posisi X awal secara acak di lebar layar
      const startX = Math.random() * window.innerWidth;
      emojiEl.style.left = `${startX}px`;

      // Ukuran acak agar terlihat lebih natural (15px - 35px)
      const size = 15 + Math.random() * 20; 
      emojiEl.style.fontSize = `${size}px`;

      container.appendChild(emojiEl);

      // --- ANIMASI MENGGUNAKAN GSAP ---
      gsap.to(emojiEl, {
        y: window.innerHeight + 100, // Jatuh sampai melewati layar bawah
        x: startX + (Math.random() * 150 - 75), // Efek angin (goyang kiri-kanan)
        rotation: Math.random() * 360, // Berputar saat jatuh
        duration: 4 + Math.random() * 6, // Kecepatan acak (4 - 10 detik)
        ease: "none", // Gerakan konstan seperti benda jatuh
        repeat: -1, // Ulangi terus menerus (loop)
        delay: Math.random() * 5, // Mulai di waktu yang berbeda-beda
      });
    }
  }

  // ============================================================
  // 10. INITIALIZATION
  // ============================================================

  function init() {
    createAmbientParticles();
    createFallingEmojis();
    initEventListeners();

    // Entrance animation for envelope
    gsap.from(DOM.envelopeImg, {
      scale: 0.8,
      opacity: 0,
      y: 30,
      duration: 1.2,
      ease: 'power3.out',
      delay: 0.3
    });

    gsap.from(DOM.envelopeHint, {
      opacity: 0,
      y: 15,
      duration: 0.8,
      ease: 'power2.out',
      delay: 1,
    });
  }

  // Start the app when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
