// ===== FUNCIÓN PARA MOSTRAR NOTIFICACIONES ESTILIZADAS =====
function showNotification(type, title, message, duration = 5000) {
  const container = document.getElementById('notificationsContainer');
  
  // Crear el elemento de notificación
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  
  // HTML de la notificación
  notification.innerHTML = `
    <div class="notification-icon">
      ${getIconSVG(type)}
    </div>
    <div class="notification-content">
      <h3 class="notification-title">${title}</h3>
      <p class="notification-message">${message}</p>
    </div>
    <button class="notification-close">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
      </svg>
    </button>
    <div class="notification-progress"></div>
  `;
  
  // Añadir al contenedor
  container.appendChild(notification);
  
  // Mostrar el contenedor
  const notificationContainer = document.getElementById('notificationContainer');
  notificationContainer.style.display = 'block';
  
  // Botón de cerrar
  const closeBtn = notification.querySelector('.notification-close');
  closeBtn.addEventListener('click', () => {
    removeNotification(notification);
  });
  
  // Auto-cerrar después de la duración especificada
  setTimeout(() => {
    removeNotification(notification);
  }, duration);
}

function removeNotification(notification) {
  notification.classList.add('removing');
  setTimeout(() => {
    notification.remove();
    
    // Ocultar el contenedor si no hay más notificaciones
    const container = document.getElementById('notificationsContainer');
    if (container.children.length === 0) {
      document.getElementById('notificationContainer').style.display = 'none';
    }
  }, 300);
}

function getIconSVG(type) {
  const icons = {
    success: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    `,
    error: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
      </svg>
    `,
    warning: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
    `,
    info: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
    `
  };
  
  return icons[type] || icons.info;
}

// ===== VERIFICACIÓN DE SESIÓN =====
window.onload = function() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');

    if (!isLoggedIn) {
        alert('Por favor, inicie sesión para acceder a esta página.');
        window.location.href = '/';
    }
};

// ===== MANEJO DEL FORMULARIO =====
document.getElementById('ingresoForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    // Mostrar el loader
    const loader = document.getElementById('loader');
    const notificationContainer = document.getElementById('notificationContainer');

    notificationContainer.style.display = 'block';
    loader.style.display = 'block';

    // Obtener los valores del formulario
    const monto = document.getElementById('monto').value;
    const motivo = document.getElementById('motivo').value;
    const metodo = document.getElementById('opciones').value;
    const userEmailElement = document.getElementById('userEmail');
    const usuario = userEmailElement.textContent;

    // Obtener la fecha actual
    const fechaActual = new Date();
    const year = fechaActual.getFullYear();
    const month = String(fechaActual.getMonth() + 1).padStart(2, '0');
    const day = String(fechaActual.getDate()).padStart(2, '0');
    const fechaFormateada = `${year}-${month}-${day}`;

    // Construir el objeto para enviar al API
    const datosIngreso = {
        Motivo: motivo,
        Monto: parseFloat(monto),
        FechaIngreso: fechaFormateada,
        Metodo: metodo,
        Usuario: usuario
    };

    try {
        const response = await fetch('/out/ingresos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosIngreso)
        });

        // Ocultar el loader
        loader.style.display = 'none';

        // Limpiar notificaciones anteriores
        const notificationsContainer = document.getElementById('notificationsContainer');
        notificationsContainer.innerHTML = '';

        if (response.ok) {
            const data = await response.json();

            // Mostrar notificación de éxito
            showNotification(
                'success',
                '¡Gasto insertado correctamente!',
                'Usted acaba de realizar un ingreso a sus gastos de manera correcta!'
            );

            // Limpiar el formulario
            document.getElementById('ingresoForm').reset();
            
            // Resetear el select custom
            const customSelectTrigger = document.querySelector('.custom-select-trigger span');
            if (customSelectTrigger) {
                customSelectTrigger.textContent = 'Seleccione una opción';
            }
            
            // Remover la clase selected de las opciones
            document.querySelectorAll('.custom-option').forEach(opt => {
                opt.classList.remove('selected');
            });

        } else {
            const errorData = await response.json();

            // Mostrar notificación de error
            showNotification(
                'error',
                'Error al registrar el ingreso',
                errorData.error || 'Hubo un problema al procesar su solicitud.'
            );
        }
    } catch (error) {
        // Ocultar el loader en caso de error
        loader.style.display = 'none';

        // Mostrar notificación de error de conexión
        showNotification(
            'error',
            'Error de conexión',
            'No se pudo conectar con el servidor. Por favor, intente nuevamente.'
        );
    }
});

// ===== LOGOUT =====
document.getElementById('logoutButton').addEventListener('click', async function() {
    try {
        const response = await fetch('/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });

        if (response.headers.get('content-type').includes('application/json')) {
            const result = await response.json();

            if (!response.ok) {
                window.location.href = '/';
                return;
            }

            localStorage.removeItem('isLoggedIn');
            window.location.href = '/';
        } else {
            window.location.href = '/';
        }
        
    } catch (error) {
        window.location.href = '/';
    }
});

// ===== OBTENER EMAIL DEL USUARIO =====
async function fetchUserEmail() {
    try {
        const response = await fetch('/auth/perfil', {
            method: 'GET',
            credentials: 'include'
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Error al obtener el correo');
        }

        document.getElementById('userEmail').textContent = result.email;
    } catch (error) {
        // Silenciar error
    }
}

fetchUserEmail();

// ===== CARGAR MÉTODOS DE PAGO EN SELECT CUSTOM =====
document.addEventListener('DOMContentLoaded', () => {
    fetch('/out/paysMethod')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la petición');
            }
            return response.json();
        })
        .then(data => {
            const optionsContainer = document.querySelector('.custom-options');
            const hiddenInput = document.getElementById('opciones');
            const selectTrigger = document.querySelector('.custom-select-trigger');

            // Limpiar opciones existentes
            optionsContainer.innerHTML = '';

            // Agregar cada opción
            data.forEach(item => {
                const optionElement = document.createElement('div');
                optionElement.classList.add('custom-option');
                optionElement.textContent = item.NOMBRE;
                optionElement.dataset.value = item.ID;
                optionsContainer.appendChild(optionElement);
            });

            // Event listeners para las opciones
            optionsContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('custom-option')) {
                    const selectedValue = e.target.dataset.value;
                    const selectedText = e.target.textContent;
                    
                    selectTrigger.querySelector('span').textContent = selectedText;
                    hiddenInput.value = selectedValue;
                    
                    // Remover clase selected de todas las opciones
                    optionsContainer.querySelectorAll('.custom-option').forEach(opt => {
                        opt.classList.remove('selected');
                    });
                    
                    // Agregar clase selected a la opción clickeada
                    e.target.classList.add('selected');
                    
                    // Cerrar el dropdown
                    document.getElementById('customSelect').classList.remove('open');
                }
            });
        })
        .catch(error => {
            console.error('Error al cargar las opciones:', error);
            showNotification(
                'error',
                'Error al cargar opciones',
                'No se pudieron cargar los métodos de pago.'
            );
        });
});