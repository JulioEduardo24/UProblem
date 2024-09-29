window.onload = function() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');

    if (!isLoggedIn) {
        // Si no hay sesión activa, redirigir al inicio de sesión
        alert('Por favor, inicie sesión para acceder a esta página.');
        window.location.href = '/'; // Cambia esto a la URL de tu página de inicio de sesión
    }
};

document.getElementById('ingresoForm').addEventListener('submit', async function (event) {
    event.preventDefault(); // Evita el envío tradicional del formulario

    // Mostrar el loader
    const loader = document.getElementById('loader');
    const notificationContainer = document.getElementById('notificationContainer');

    // Mostrar el contenedor de notificaciones y el loader
    notificationContainer.style.display = 'block';
    loader.style.display = 'block'; // Muestra el loader

    // Obtener los valores del formulario
    const monto = document.getElementById('monto').value;
    const motivo = document.getElementById('motivo').value;

    // Obtener la fecha actual (FechaIngreso) en la zona horaria local
    const fechaActual = new Date();
    const year = fechaActual.getFullYear();
    const month = String(fechaActual.getMonth() + 1).padStart(2, '0'); // +1 porque getMonth() empieza desde 0
    const day = String(fechaActual.getDate()).padStart(2, '0'); // Asegurarse de que tenga dos dígitos

    const fechaFormateada = `${year}-${month}-${day}`; // Formato YYYY-MM-DD

    // Construir el objeto para enviar al API
    const datosIngreso = {
        Motivo: motivo,
        Monto: parseFloat(monto), // Asegurarse de que sea un número
        FechaIngreso: fechaFormateada,
    };

    const response = await fetch('/out/ingresos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosIngreso)
    });

    // Ocultar el loader
    loader.style.display = 'none'; // Oculta el loader

    // Limpiar el contenedor de notificaciones
    const notificationsContainer = document.getElementById('notificationsContainer');
    notificationsContainer.innerHTML = ''; // Limpiar notificaciones anteriores

    if (response.ok) {
        const data = await response.json();

        // Crear la notificación de éxito
        const successNotification = document.createElement('div');
        successNotification.className = 'success';
        successNotification.innerHTML = `
            <div class="flex">
                <div class="flex-shrink-0">
                    <svg aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" class="succes-svg">
                        <path clip-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" fill-rule="evenodd"></path>
                    </svg>
                </div>
                <div class="success-prompt-wrap">
                    <p class="success-prompt-heading">Gasto insertado correctamente!</p>
                    <div class="success-prompt-prompt">
                        <p>
                            Usted acaba de realizar un ingreso a sus gastos de manera correcta!
                        </p>
                    </div>
                </div>
            </div>
        `;

        // Agregar la notificación al contenedor
        notificationsContainer.appendChild(successNotification);

        // Eliminar la notificación de éxito después de 5 segundos
        setTimeout(() => {
            successNotification.remove();
        }, 5000); // 5000 ms = 5 segundos

        console.log('Respuesta del servidor:', data);
    } else {
        const errorData = await response.json();

        // Crear la notificación de error
        const errorNotification = document.createElement('div');
        errorNotification.className = 'error';
        errorNotification.innerHTML = `
            <div class="flex">
                <div class="flex-shrink-0">
                    <svg aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" class="error-svg">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-15a1 1 0 011 1v7a1 1 0 11-2 0V4a1 1 0 011-1zm0 12a1 1 0 100-2 1 1 0 000 2z"></path>
                    </svg>
                </div>
                <div class="error-prompt-wrap">
                    <p class="error-prompt-heading">Error al registrar el ingreso!</p>
                    <div class="error-prompt-prompt">
                        <p>${errorData.error}</p>
                    </div>
                </div>
            </div>
        `;

        // Agregar la notificación de error al contenedor
        notificationsContainer.appendChild(errorNotification);

        // Eliminar la notificación de error después de 5 segundos
        setTimeout(() => {
            errorNotification.remove();
        }, 5000); // 5000 ms = 5 segundos

        console.log('Error:', errorData);
    }
});

document.getElementById('logoutButton').addEventListener('click', async function() {
    try {
        const response = await fetch('/auth/logout', {
            method: 'POST',
            credentials: 'include' // Para incluir la sesión
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Error al cerrar sesión');
        }

        // Limpiar el localStorage y redirigir al inicio de sesión
        localStorage.removeItem('isLoggedIn');
        //alert(result.message);
        window.location.href = '/'; // Redirigir a la página de inicio de sesión

    } catch (error) {
        alert(error.message);
    }
});