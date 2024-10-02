
document.getElementById('regisForm').addEventListener('submit', async function (event) {
    event.preventDefault(); // Evita el envío tradicional del formulario

    // Mostrar el loader
    const loader = document.getElementById('loader');
    const notificationContainer = document.getElementById('notificationContainer');

    // Mostrar el contenedor de notificaciones y el loader
    notificationContainer.style.display = 'block';
    loader.style.display = 'block'; // Muestra el loader

    // Obtener los valores del formulario
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    // Construir el objeto para enviar al API
    const datosIngreso = {
        username: name,
        email: email, // Asegurarse de que sea un número
        password: password
    };

    const response = await fetch('/auth/registerUser', {
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
                    <p class="success-prompt-heading">Usuario registrado correctamente!</p>
                    <div class="success-prompt-prompt">
                        <p>
                            Usted se acaba de registrar de manera correcta!
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
    } else {
        const errorData = await response.json();

        // Crear la notificación de error
        const errorNotification = document.createElement('div');
        errorNotification.className = 'error-prompt';
        errorNotification.innerHTML = `
            <div class="flex">
                <div class="flex-shrink-0">
                    <svg aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" class="error-svg">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"></path>
                    </svg>
                </div>
                <div class="error-prompt-wrap">
                    <p class="error-prompt-heading">Error al registrar!</p>
                    <div class="error-prompt-prompt">
                        <p>
                        ${errorData.error}
                        </p>
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
    }
});


// Aquí deshabilitas la consola
Object.defineProperty(window, 'console', {
    get: function () {
      throw new Error('Console is disabled');
    }
  });