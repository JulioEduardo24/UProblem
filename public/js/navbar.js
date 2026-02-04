// Menu toggle para móvil
(function() {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    const menuIcon = menuToggle?.querySelector('.menu-icon');
    const closeIcon = menuToggle?.querySelector('.close-icon');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            navMenu.classList.toggle('active');
            
            if (navMenu.classList.contains('active')) {
                menuIcon.style.display = 'none';
                closeIcon.style.display = 'block';
            } else {
                menuIcon.style.display = 'block';
                closeIcon.style.display = 'none';
            }
        });
        
        // Cerrar menú al hacer click en un enlace
        navMenu.querySelectorAll('a, button').forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    navMenu.classList.remove('active');
                    menuIcon.style.display = 'block';
                    closeIcon.style.display = 'none';
                }
            });
        });
        
        // Cerrar menú al hacer click fuera
        document.addEventListener('click', function(e) {
            if (window.innerWidth <= 768 && 
                navMenu.classList.contains('active') && 
                !navMenu.contains(e.target) && 
                !menuToggle.contains(e.target)) {
                navMenu.classList.remove('active');
                menuIcon.style.display = 'block';
                closeIcon.style.display = 'none';
            }
        });
    }
})();