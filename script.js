document.addEventListener('DOMContentLoaded', function() {
    const book = document.getElementById('book');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    // Inicializar el motor de físicas de papel 3D
    const pageFlip = new St.PageFlip(book, {
        width: 400, // Ancho base de la página
        height: 600, // Alto base de la página
        size: "stretch", // Permite que se estire según contenedor si es necesario
        minWidth: 315,
        maxWidth: 400,
        minHeight: 420,
        maxHeight: 600,
        maxShadowOpacity: 0.8, // Sombra profunda pirata
        showCover: true, // Portadas se comportan de forma realista
        mobileScrollSupport: false,
        useMouseEvents: true // Permite jalar la esquina con el cursor/dedo
    });

    // Cargar las páginas de la estructura HTML que repintamos
    pageFlip.loadFromHTML(document.querySelectorAll('.page'));

    // Asignar los botones Inferiores
    prevBtn.addEventListener('click', () => {
        pageFlip.flipPrev();
    });

    nextBtn.addEventListener('click', () => {
        pageFlip.flipNext();
    });
});
