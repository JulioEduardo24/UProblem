document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('loginForm').addEventListener('submit', async function(event) {
        event.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Puedes agregar un div con id="errorMessage" en el HTML para mostrar errores
        const errorMessage = document.getElementById('errorMessage');
        if (errorMessage) errorMessage.textContent = '';

        const datos = { email, password };

        try {
            const response = await fetch('/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datos),
            });

            const resultado = await response.json();

            if (!response.ok) {
                throw new Error(resultado.error || 'Error al iniciar sesión');
            }

            localStorage.setItem('isLoggedIn', 'true');
            window.location.href = '/out/';
        } catch (error) {
            if (errorMessage) errorMessage.textContent = error.message;
        }
    });
});
