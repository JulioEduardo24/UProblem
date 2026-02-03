const montoTotalInput = document.getElementById('monto_total');
const categoriasInputs = document.querySelectorAll('.categoria-porcentaje');
const totalPorcentajeSpan = document.getElementById('totalPorcentaje');
const sinAsignarSpan = document.getElementById('sinAsignar');
const categoriasJsonInput = document.getElementById('categorias_json');
const form = document.getElementById('presupuestoForm');

// Calcular montos y porcentajes en tiempo real
function actualizarCalculos() {
    const montoTotal = parseFloat(montoTotalInput.value) || 0;
    let totalPorcentaje = 0;
    const categorias = [];

    categoriasInputs.forEach(input => {
        const porcentaje = parseFloat(input.value) || 0;
        const categoria = input.getAttribute('data-categoria');
        const montoCalculado = (montoTotal * porcentaje) / 100;

        // Actualizar el monto calculado en la UI
        const montoSpan = document.querySelector(`.monto-calculado[data-categoria="${categoria}"]`);
        if (montoSpan) {
            montoSpan.textContent = `S/ ${montoCalculado.toFixed(2)}`;
        }

        // Agregar a la lista si tiene porcentaje
        if (porcentaje > 0) {
            totalPorcentaje += porcentaje;
            categorias.push({
                categoria: categoria,
                porcentaje: porcentaje
            });
        }
    });

    // Actualizar resumen
    totalPorcentajeSpan.textContent = `${totalPorcentaje.toFixed(0)}%`;
    const sinAsignar = 100 - totalPorcentaje;
    sinAsignarSpan.textContent = `${sinAsignar.toFixed(0)}%`;

    // Cambiar color si excede 100%
    if (totalPorcentaje > 100) {
        totalPorcentajeSpan.style.color = '#c53030';
        sinAsignarSpan.style.color = '#c53030';
    } else {
        totalPorcentajeSpan.style.color = '';
        sinAsignarSpan.style.color = '';
    }

    // Actualizar campo oculto con JSON
    categoriasJsonInput.value = JSON.stringify(categorias);
}

// Event listeners
montoTotalInput.addEventListener('input', actualizarCalculos);
categoriasInputs.forEach(input => {
    input.addEventListener('input', actualizarCalculos);
});

// Calcular al cargar la página
actualizarCalculos();

// Validación antes de enviar
form.addEventListener('submit', (e) => {
    const montoTotal = parseFloat(montoTotalInput.value) || 0;
    
    if (montoTotal <= 0) {
        e.preventDefault();
        alert('El monto total debe ser mayor a 0');
        return;
    }

    let totalPorcentaje = 0;
    categoriasInputs.forEach(input => {
        totalPorcentaje += parseFloat(input.value) || 0;
    });

    if (totalPorcentaje > 100) {
        e.preventDefault();
        alert('La suma de porcentajes no puede exceder 100%');
        return;
    }
});

// Distribución rápida (opcional)
function distribuirEquitativamente() {
    const numCategorias = 8; // Total de categorías
    const porcentajePorCategoria = Math.floor(100 / numCategorias);
    
    categoriasInputs.forEach((input, index) => {
        if (index < numCategorias) {
            input.value = porcentajePorCategoria;
        }
    });
    
    actualizarCalculos();
}

// Limpiar distribución
function limpiarDistribucion() {
    categoriasInputs.forEach(input => {
        input.value = '';
    });
    actualizarCalculos();
}

// Agregar botones de ayuda (opcional)
const distribucionSection = document.querySelector('.form-section');
if (distribucionSection) {
    const botonesAyuda = document.createElement('div');
    botonesAyuda.className = 'botones-ayuda';
    botonesAyuda.innerHTML = `
        <button type="button" class="btn-ayuda" onclick="distribuirEquitativamente()">
            Distribuir equitativamente
        </button>
        <button type="button" class="btn-ayuda" onclick="limpiarDistribucion()">
            Limpiar
        </button>
    `;
    distribucionSection.querySelector('.section-header').appendChild(botonesAyuda);
}