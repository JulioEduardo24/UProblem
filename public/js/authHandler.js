
/*
document.getElementById('loginForm').addEventListener('submit', async function (event) {
    event.preventDefault(); // Evitar el envío del formulario

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');

    // Limpiar mensajes de error previos
    errorMessage.textContent = '';

    // Crear objeto con datos a enviar
    const datos = {
        email,
        password,
    };

    try {
        const response = await fetch('/auth/login', { // Cambia esto por la URL de tu API
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
        window.location.href = '/out'; // Redirigir a la página de destino

    } catch (error) {
        errorMessage.textContent = error.message;
    }
});*/


document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Evitar el envío del formulario

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');

    // Limpiar mensajes de error previos
    errorMessage.textContent = '';

    // Crear objeto con datos a enviar
    const datos = {
        email,
        password,
    };

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

        // Almacenar una bandera en localStorage indicando que el usuario está logueado
        localStorage.setItem('isLoggedIn', 'true');
        
        //alert('Inicio de sesión exitoso!');
        window.location.href = '/out/'; // Redirigir a la página de destino

    } catch (error) {
        errorMessage.textContent = error.message;
    }
});