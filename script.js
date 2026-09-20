/* ==========================================================================
   DERIS ALANDA (ABANG) - MATCH OF A LIFETIME INTERACTIVE SCRIPT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* ----------------------------------------------------------------------
       1. FLOATING SOCCER BALLS & HEARTS CANVAS BACKGROUND
       ---------------------------------------------------------------------- */
    const bgCanvas = document.getElementById('bgCanvas');
    const ctx = bgCanvas.getContext('2d');

    let width = bgCanvas.width = window.innerWidth;
    let height = bgCanvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = bgCanvas.width = window.innerWidth;
        height = bgCanvas.height = window.innerHeight;
    });

    const particles = [];
    const particleCount = 28;

    class FloatingParticle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width;
            this.y = height + 30;
            this.speed = 0.5 + Math.random() * 1.2;
            this.size = 14 + Math.random() * 20;
            this.type = Math.random() > 0.4 ? 'ball' : 'heart';
            this.opacity = 0.2 + Math.random() * 0.5;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotSpeed = (Math.random() - 0.5) * 0.02;
        }

        update() {
            this.y -= this.speed;
            this.rotation += this.rotSpeed;
            if (this.y < -40) {
                this.reset();
            }
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.globalAlpha = this.opacity;

            if (this.type === 'ball') {
                ctx.font = `${this.size}px serif`;
                ctx.fillText('⚽', -this.size / 2, this.size / 2);
            } else {
                ctx.font = `${this.size}px serif`;
                ctx.fillText('💙', -this.size / 2, this.size / 2);
            }

            ctx.restore();
        }
    }

    for (let i = 0; i < particleCount; i++) {
        const p = new FloatingParticle();
        p.y = Math.random() * height; // initial spread
        particles.push(p);
    }

    function animateBackground() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animateBackground);
    }
    animateBackground();


    /* ----------------------------------------------------------------------
       2. WEB AUDIO API - ROMANTIC BACKSOUND SYNTHESIZER & GOAL SOUND FX
       ---------------------------------------------------------------------- */
    let audioCtx = null;
    let isPlayingMusic = false;
    let musicInterval = null;

    const musicBtn = document.getElementById('musicToggleBtn');
    const musicIcon = document.getElementById('musicIcon');

    function initAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    // Play soft romantic chord progression in background
    const chords = [
        [261.63, 329.63, 392.00, 493.88], // Cmaj7
        [220.00, 261.63, 329.63, 392.00], // Am7
        [174.61, 220.00, 261.63, 329.63], // Fmaj7
        [196.00, 246.94, 293.66, 349.23]  // G7
    ];
    let chordIdx = 0;

    function playSoftNote(freq, duration = 2.5) {
        if (!audioCtx) return;
        try {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

            gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.04, audioCtx.currentTime + 0.3);
            gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start();
            osc.stop(audioCtx.currentTime + duration);
        } catch (e) {
            console.log('Audio note error:', e);
        }
    }

    function toggleMusic() {
        initAudio();
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        isPlayingMusic = !isPlayingMusic;

        if (isPlayingMusic) {
            musicBtn.style.background = 'linear-gradient(135deg, #00f2fe, #2563eb)';
            musicBtn.style.color = '#070d1e';
            musicIcon.className = 'fa-solid fa-compact-disc fa-spin';
            
            // Play initial chord
            chords[chordIdx].forEach(freq => playSoftNote(freq, 3.5));

            musicInterval = setInterval(() => {
                chordIdx = (chordIdx + 1) % chords.length;
                chords[chordIdx].forEach(freq => playSoftNote(freq, 3.5));
            }, 3500);

        } else {
            musicBtn.style.background = 'linear-gradient(135deg, #2563eb, #1d4ed8)';
            musicBtn.style.color = 'white';
            musicIcon.className = 'fa-solid fa-compact-disc';
            clearInterval(musicInterval);
        }
    }

    musicBtn.addEventListener('click', toggleMusic);

    // Goal Sound Effect (Cheer Whistle & Fanfare)
    function playGoalSound() {
        initAudio();
        if (audioCtx.state === 'suspended') audioCtx.resume();

        const notes = [392.00, 523.25, 659.25, 783.99]; // G4, C5, E5, G5
        notes.forEach((freq, idx) => {
            setTimeout(() => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

                gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);

                osc.connect(gain);
                gain.connect(audioCtx.destination);

                osc.start();
                osc.stop(audioCtx.currentTime + 0.6);
            }, idx * 120);
        });
    }


    /* ----------------------------------------------------------------------
       3. INTERACTIVE MINI-GAME: GOAL OF LOVE
       ---------------------------------------------------------------------- */
    const kickBtn = document.getElementById('kickBallBtn');
    const ball = document.getElementById('soccerBall');
    const gameMsg = document.getElementById('gameMessage');
    const goalModal = document.getElementById('goalModal');
    const closeGoalBtn = document.getElementById('closeGoalModal');

    let isKicking = false;

    kickBtn.addEventListener('click', () => {
        if (isKicking) return;
        isKicking = true;

        gameMsg.innerHTML = '⚡ <em>Bola sedang meluncur indah ke sudut gawang Abang...</em>';

        // Animate soccer ball moving up into goal target
        ball.style.transform = 'translateY(-230px) scale(0.6) rotate(720deg)';

        setTimeout(() => {
            playGoalSound();
            launchFireworks();
            gameMsg.innerHTML = '🎉 <strong>GOAL! GOL CINTA UNTUK DERIS ALANDA!</strong>';

            setTimeout(() => {
                goalModal.classList.add('active');
            }, 600);

        }, 800);
    });

    closeGoalBtn.addEventListener('click', () => {
        goalModal.classList.remove('active');
        // Reset ball position
        ball.style.transform = 'translateY(0) scale(1) rotate(0deg)';
        isKicking = false;
        gameMsg.innerHTML = 'Tekan tombol untuk menendang bola cinta lagi! ⚽';
    });


    /* ----------------------------------------------------------------------
       4. FIREWORKS CANVAS CELEBRATION
       ---------------------------------------------------------------------- */
    const fwCanvas = document.getElementById('fireworksCanvas');
    const fwCtx = fwCanvas.getContext('2d');
    fwCanvas.width = window.innerWidth;
    fwCanvas.height = window.innerHeight;

    let fireworksParticles = [];

    function launchFireworks() {
        fireworksParticles = [];
        const colors = ['#00f2fe', '#fbbf24', '#ec4899', '#3b82f6', '#ffffff'];

        for (let i = 0; i < 120; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 3 + Math.random() * 7;
            fireworksParticles.push({
                x: window.innerWidth / 2,
                y: window.innerHeight / 2,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                alpha: 1,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: 3 + Math.random() * 4
            });
        }
        animateFireworks();
    }

    function animateFireworks() {
        fwCtx.clearRect(0, 0, fwCanvas.width, fwCanvas.height);
        let alive = false;

        fireworksParticles.forEach(p => {
            if (p.alpha > 0) {
                alive = true;
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.08; // gravity
                p.alpha -= 0.015;

                fwCtx.save();
                fwCtx.globalAlpha = Math.max(0, p.alpha);
                fwCtx.fillStyle = p.color;
                fwCtx.beginPath();
                fwCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                fwCtx.fill();
                fwCtx.restore();
            }
        });

        if (alive) {
            requestAnimationFrame(animateFireworks);
        } else {
            fwCtx.clearRect(0, 0, fwCanvas.width, fwCanvas.height);
        }
    }


    /* ----------------------------------------------------------------------
       5. PHOTO LIGHTBOX MODAL
       ---------------------------------------------------------------------- */
    const photoModal = document.getElementById('photoModal');
    const modalImg = document.getElementById('modalImg');
    const modalTitle = document.getElementById('modalTitle');
    const modalDesc = document.getElementById('modalDesc');
    const modalClose = document.getElementById('modalClose');

    const galleryCards = document.querySelectorAll('.gallery-card');

    galleryCards.forEach(card => {
        card.addEventListener('click', () => {
            const imgSrc = card.getAttribute('data-img');
            const title = card.getAttribute('data-title');
            const desc = card.getAttribute('data-desc');

            modalImg.src = imgSrc;
            modalTitle.innerHTML = title;
            modalDesc.innerHTML = desc;

            photoModal.classList.add('active');
        });
    });

    modalClose.addEventListener('click', () => {
        photoModal.classList.remove('active');
    });

    photoModal.addEventListener('click', (e) => {
        if (e.target === photoModal) {
            photoModal.classList.remove('active');
        }
    });


    /* ----------------------------------------------------------------------
       6. FUT CARD 3D TILT EFFECT
       ---------------------------------------------------------------------- */
    const futCard = document.getElementById('futCard');
    if (futCard) {
        futCard.addEventListener('mousemove', (e) => {
            const rect = futCard.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            const rotateX = (-y / rect.height) * 20;
            const rotateY = (x / rect.width) * 20;

            futCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
        });

        futCard.addEventListener('mouseleave', () => {
            futCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
        });
    }

});
