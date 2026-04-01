document.addEventListener('DOMContentLoaded', function () {

    // ════════════════════════════════════════════════
    //  RAYOS ANIMADOS EN EL FONDO
    // ════════════════════════════════════════════════

    const canvas = document.getElementById('lightning-bg');
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Genera segmentos de rayo mediante desplazamiento de punto medio
    function generateBolt(segments, x1, y1, x2, y2, spread, depth) {
        if (depth === 0 || spread < 2) {
            segments.push([x1, y1, x2, y2]);
            return;
        }
        const mx = (x1 + x2) / 2 + (Math.random() - 0.5) * spread;
        const my = (y1 + y2) / 2 + (Math.random() - 0.5) * spread * 0.22;
        generateBolt(segments, x1, y1, mx, my, spread / 2, depth - 1);
        generateBolt(segments, mx, my, x2, y2, spread / 2, depth - 1);
        // Ramas secundarias aleatorias
        if (depth > 3 && Math.random() < 0.38) {
            const ex = mx + (Math.random() - 0.5) * spread * 1.4;
            const ey = my + spread * (0.3 + Math.random() * 0.9);
            generateBolt(segments, mx, my, ex, ey, spread / 3, depth - 3);
        }
    }

    let ltAlpha = 0;
    let ltSegments = [];
    let ltAnimating = false;

    function triggerLightning() {
        ltSegments = [];
        const w = canvas.width;
        const h = canvas.height;
        const sx = w * (0.15 + Math.random() * 0.7);
        const ex = sx + (Math.random() - 0.5) * w * 0.32;
        const ey = h * (0.25 + Math.random() * 0.55);
        generateBolt(ltSegments, sx, -10, ex, ey, 130, 8);
        ltAlpha = 1.0;
        if (!ltAnimating) {
            ltAnimating = true;
            animateLightning();
        }
        // 30 % de probabilidad de doble destello
        if (Math.random() < 0.3) {
            setTimeout(triggerLightning, 80 + Math.random() * 130);
        }
    }

    function drawLightningFrame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (ltAlpha <= 0) return;

        // Flash tenue de fondo
        ctx.fillStyle = `rgba(155, 185, 255, ${ltAlpha * 0.032})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.lineCap = 'round';

        // Halo exterior
        ctx.lineWidth = 5;
        ctx.strokeStyle = `rgba(80, 120, 255, ${ltAlpha * 0.22})`;
        ctx.shadowColor = '#3355ff';
        ctx.shadowBlur = 28;
        for (const [x1, y1, x2, y2] of ltSegments) {
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }

        // Núcleo brillante
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = `rgba(215, 228, 255, ${ltAlpha})`;
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 10;
        for (const [x1, y1, x2, y2] of ltSegments) {
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }

        ctx.restore();
    }

    function animateLightning() {
        drawLightningFrame();
        ltAlpha -= 0.065;
        if (ltAlpha > 0) {
            requestAnimationFrame(animateLightning);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ltAnimating = false;
        }
    }

    function scheduleLightning() {
        const delay = 3500 + Math.random() * 7500;
        setTimeout(() => {
            triggerLightning();
            scheduleLightning();
        }, delay);
    }

    // Primer rayo entre 1.5 y 3 segundos después de cargar
    setTimeout(scheduleLightning, 1500 + Math.random() * 1500);


    // ════════════════════════════════════════════════
    //  LIBRO RESPONSIVO CON PAGE-FLIP
    // ════════════════════════════════════════════════

    const book = document.getElementById('book');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const pageCounter = document.getElementById('page-counter');

    // Calcula las dimensiones óptimas de página según el viewport
    function computeDimensions() {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const isMobile = vw < 768;
        const ratio = 1.5; // alto/ancho de página (600/400)

        if (isMobile) {
            const hPad = 28;           // padding horizontal total
            const vReserve = 130;      // espacio para controles + padding
            const maxW = Math.min(vw - hPad, 400);
            const maxH = vh - vReserve;
            let w = Math.min(maxW, maxH / ratio);
            let h = w * ratio;
            return { width: Math.floor(w), height: Math.floor(h), portrait: true };
        } else {
            const hPad = 80;
            const vReserve = 130;
            const availW = vw - hPad;
            const availH = vh - vReserve;
            // En escritorio el libro abre dos páginas: ancho total = 2 × pageW
            let pageW = Math.min(Math.floor(availW / 2), 450);
            let pageH = Math.min(Math.floor(pageW * ratio), availH);
            pageW = Math.min(pageW, Math.floor(pageH / ratio));
            return { width: Math.floor(pageW), height: Math.floor(pageH), portrait: false };
        }
    }

    const dims = computeDimensions();
    const isMobile = window.innerWidth < 768;

    // Establece tamaño inicial del contenedor para evitar saltos de layout
    book.style.width  = isMobile ? `${dims.width}px`      : `${dims.width * 2}px`;
    book.style.height = `${dims.height}px`;

    const pageFlip = new St.PageFlip(book, {
        width:              dims.width,
        height:             dims.height,
        size:               'fixed',
        maxShadowOpacity:   0.8,
        showCover:          true,
        mobileScrollSupport: false,
        usePortrait:        dims.portrait,
        useMouseEvents:     true,
        startPage:          0
    });

    pageFlip.loadFromHTML(document.querySelectorAll('.page'));

    // ── Contador de página ──────────────────────────
    const totalPages = document.querySelectorAll('.page').length;

    function updateCounter() {
        const idx = pageFlip.getCurrentPageIndex();
        pageCounter.textContent = `${idx + 1} / ${totalPages}`;
    }

    pageFlip.on('flip', updateCounter);
    updateCounter();

    // ── Botones ─────────────────────────────────────
    prevBtn.addEventListener('click', () => pageFlip.flipPrev());
    nextBtn.addEventListener('click', () => pageFlip.flipNext());

    // ── Deslizamiento táctil (swipe) en móvil ───────
    let touchStartX = 0;
    let touchStartY = 0;

    book.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    book.addEventListener('touchend', (e) => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        // Solo actuar si es un swipe claramente horizontal y suficientemente largo
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 55) {
            if (dx < 0) pageFlip.flipNext();
            else        pageFlip.flipPrev();
        }
    }, { passive: true });

});
