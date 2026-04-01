document.addEventListener('DOMContentLoaded', function () {

    // ════════════════════════════════════════════════
    //  RAYOS ANIMADOS EN EL FONDO
    //  – Flash rápido → se mantiene brillante → fade suave
    // ════════════════════════════════════════════════

    const canvas = document.getElementById('lightning-bg');
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Genera segmentos por desplazamiento de punto medio (ramificado)
    function generateBolt(segs, x1, y1, x2, y2, spread, depth) {
        if (depth === 0 || spread < 2) {
            segs.push([x1, y1, x2, y2]);
            return;
        }
        const mx = (x1 + x2) / 2 + (Math.random() - 0.5) * spread;
        const my = (y1 + y2) / 2 + (Math.random() - 0.5) * spread * 0.2;
        generateBolt(segs, x1, y1, mx, my, spread / 2, depth - 1);
        generateBolt(segs, mx, my, x2, y2, spread / 2, depth - 1);
        // Rama secundaria
        if (depth > 3 && Math.random() < 0.4) {
            const ex = mx + (Math.random() - 0.5) * spread * 1.5;
            const ey = my + spread * (0.3 + Math.random() * 0.9);
            generateBolt(segs, mx, my, ex, ey, spread / 3, depth - 3);
        }
    }

    let ltAlpha      = 0;
    let ltPhase      = 'idle'; // 'hold' | 'fade'
    let ltHoldLeft   = 0;
    let ltSegs       = [];
    let ltAnimating  = false;

    function triggerLightning() {
        ltSegs = [];
        const w  = canvas.width;
        const h  = canvas.height;
        const sx = w * (0.08 + Math.random() * 0.84);
        const ex = sx + (Math.random() - 0.5) * w * 0.42;
        const ey = h * (0.2  + Math.random() * 0.62);
        generateBolt(ltSegs, sx, -10, ex, ey, 145, 8);

        ltAlpha    = 1.0;
        ltPhase    = 'hold';
        ltHoldLeft = 10 + Math.floor(Math.random() * 10); // 10-20 frames (~165-330 ms a 60fps)

        if (!ltAnimating) {
            ltAnimating = true;
            animateLightning();
        }

        // 38 % de probabilidad de destello secundario inmediato
        if (Math.random() < 0.38) {
            setTimeout(triggerLightning, 55 + Math.random() * 110);
        }
    }

    function drawFrame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (ltAlpha <= 0) return;

        // Flash de fondo sutil
        ctx.fillStyle = `rgba(148, 178, 255, ${ltAlpha * 0.028})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.lineCap = 'round';

        // Halo exterior
        ctx.lineWidth   = 5;
        ctx.strokeStyle = `rgba(80, 120, 255, ${ltAlpha * 0.22})`;
        ctx.shadowColor = '#3355ee';
        ctx.shadowBlur  = 30;
        for (const [x1, y1, x2, y2] of ltSegs) {
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }

        // Núcleo brillante
        ctx.lineWidth   = 1.5;
        ctx.strokeStyle = `rgba(215, 228, 255, ${ltAlpha})`;
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur  = 10;
        for (const [x1, y1, x2, y2] of ltSegs) {
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }

        ctx.restore();
    }

    function animateLightning() {
        if (ltPhase === 'hold') {
            // Mantiene brillo con leve parpadeo
            ltAlpha = 0.88 + Math.random() * 0.16;
            drawFrame();
            ltHoldLeft--;
            if (ltHoldLeft <= 0) {
                ltPhase = 'fade';
                ltAlpha = 0.88;
            }
            requestAnimationFrame(animateLightning);
        } else {
            // Fade suave
            drawFrame();
            ltAlpha -= 0.028;
            if (ltAlpha > 0) {
                requestAnimationFrame(animateLightning);
            } else {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ltAnimating = false;
            }
        }
    }

    function scheduleLightning() {
        // Más frecuente: cada 1.2 – 3.8 segundos
        const delay = 1200 + Math.random() * 2600;
        setTimeout(() => {
            triggerLightning();
            scheduleLightning();
        }, delay);
    }

    setTimeout(scheduleLightning, 800 + Math.random() * 800);


    // ════════════════════════════════════════════════
    //  LIBRO RESPONSIVO CON PAGE-FLIP
    // ════════════════════════════════════════════════

    const book        = document.getElementById('book');
    const prevBtn     = document.getElementById('prev-btn');
    const nextBtn     = document.getElementById('next-btn');
    const pageCounter = document.getElementById('page-counter');

    function computeDimensions() {
        const vw     = window.innerWidth;
        const vh     = window.innerHeight;
        const mobile = vw < 768;
        const ratio  = 1.5;

        if (mobile) {
            const maxW   = Math.min(vw - 28, 400);
            const maxH   = vh - 52 - 120; // 52px tabs + 120px controles+padding
            let w = Math.min(maxW, maxH / ratio);
            let h = w * ratio;
            return { width: Math.floor(w), height: Math.floor(h), portrait: true };
        } else {
            const availW = vw - 80 - 114; // 114px reservados para tabs laterales
            const availH = vh - 130;     // controles + padding
            let pageW = Math.min(Math.floor(availW / 2), 450);
            let pageH = Math.min(Math.floor(pageW * ratio), availH);
            pageW     = Math.min(pageW, Math.floor(pageH / ratio));
            return { width: Math.floor(pageW), height: Math.floor(pageH), portrait: false };
        }
    }

    const dims    = computeDimensions();
    const isMobile = window.innerWidth < 768;

    book.style.width  = isMobile ? `${dims.width}px`      : `${dims.width * 2}px`;
    book.style.height = `${dims.height}px`;

    const pageFlip = new St.PageFlip(book, {
        width:               dims.width,
        height:              dims.height,
        size:                'fixed',
        maxShadowOpacity:    0.75,
        showCover:           true,
        mobileScrollSupport: false,
        usePortrait:         dims.portrait,
        useMouseEvents:      true,
        startPage:           0,
        flippingTime:        700   // flip más fluido y rápido (ms)
    });

    pageFlip.loadFromHTML(document.querySelectorAll('.page'));

    // ── Contador y seal nav ──────────────────────────
    const totalPages = document.querySelectorAll('.page').length;
    const bookScene  = document.querySelector('.book-scene');

    // Sellos
    const sealBtns  = document.querySelectorAll('.seal-btn');
    const sealTrack = document.getElementById('seal-track');
    const sealPrev  = document.getElementById('seal-prev');
    const sealNext  = document.getElementById('seal-next');

    // Páginas que pertenecen a cada sello (índice 0-based de PageFlip, orden estrictamente secuencial)
    const sealPages = [
        [1],                              // ⚓ Historia
        [2],                              // 🍹 Cócteles
        [3, 4, 5, 6],                     // 🍺 Cervezas + Artesanales + Cósmica + Jarras
        [7, 8, 9, 10, 11, 12, 13],        // 💀 Licores (Aguard. Whisky Brandy Ron Shots Bebidas Varios)
        [14, 15, 16, 17]                  // ☠  Parches + Redes + Frase + Contratapa
    ];

    const SEAL_STEP  = 82;  // 72px moneda + 10px gap
    const MAX_OFFSET = Math.max(0, sealBtns.length - 3);
    let   sealOffset = 0;

    function updateSealArrows() {
        if (sealPrev) sealPrev.disabled = sealOffset === 0;
        if (sealNext) sealNext.disabled = sealOffset >= MAX_OFFSET;
    }

    function slideSeal(dir) {
        sealOffset = Math.max(0, Math.min(MAX_OFFSET, sealOffset + dir));
        if (sealTrack) sealTrack.style.transform = `translateX(-${sealOffset * SEAL_STEP}px)`;
        updateSealArrows();
    }

    function updateSealActive(idx) {
        let activeSealIdx = -1;
        sealBtns.forEach((btn, i) => {
            const isActive = sealPages[i].includes(idx);
            btn.classList.toggle('active', isActive);
            if (isActive) activeSealIdx = i;
        });
        // Auto-scroll carrusel si el sello activo quedó fuera de la ventana visible
        if (activeSealIdx >= 0 && sealBtns.length > 3) {
            const visibleEnd = sealOffset + 2;
            if (activeSealIdx < sealOffset || activeSealIdx > visibleEnd) {
                sealOffset = Math.max(0, Math.min(MAX_OFFSET, activeSealIdx - 1));
                if (sealTrack) sealTrack.style.transform = `translateX(-${sealOffset * SEAL_STEP}px)`;
                updateSealArrows();
            }
        }
    }

    sealBtns.forEach(btn => {
        btn.addEventListener('click', () => pageFlip.flip(parseInt(btn.dataset.page)));
    });

    if (sealPrev) sealPrev.addEventListener('click', () => slideSeal(-1));
    if (sealNext) sealNext.addEventListener('click', () => slideSeal(1));
    updateSealArrows();

    function updateUI() {
        const idx = pageFlip.getCurrentPageIndex();
        pageCounter.textContent = `${idx + 1} / ${totalPages}`;
        bookScene.classList.toggle('book-open', idx > 0);
        updateSealActive(idx);
    }

    pageFlip.on('flip', updateUI);
    updateUI();

    // ── Botones Anterior / Siguiente ─────────────────
    prevBtn.addEventListener('click', () => pageFlip.flipPrev());
    nextBtn.addEventListener('click', () => pageFlip.flipNext());

    // ── Swipe táctil ─────────────────────────────────
    let touchStartX = 0;
    let touchStartY = 0;

    book.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    book.addEventListener('touchend', (e) => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
            if (dx < 0) pageFlip.flipNext();
            else        pageFlip.flipPrev();
        }
    }, { passive: true });

});
