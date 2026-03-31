(function() {
    'use strict';
    
    // Variables de control
    let tiempoInicio = null;
    let cronometroActivo = false;
    let intervalo = null;
    
    // Elementos del DOM
    const campoDescripcion = document.getElementById('descripcion');
    const campoTiempoRegistro = document.getElementById('tiempoRegistro');
    const formulario = document.getElementById('gastoForm');
    
    // Verificar que existen los elementos necesarios
    if (!campoDescripcion || !campoTiempoRegistro || !formulario) {
        //console.warn('Cronómetro: No se encontraron todos los elementos necesarios');
        return;
    }
    
    /**
     * Inicia el cronómetro
     */
    function iniciarCronometro() {
        if (cronometroActivo) {
            return; // Ya está activo, no hacer nada
        }
        
        tiempoInicio = Date.now();
        cronometroActivo = true;
        
        //console.log('Cronómetro iniciado');
        
        // Actualizar cada segundo (opcional, para debug)
        intervalo = setInterval(() => {
            const tiempoTranscurrido = Math.floor((Date.now() - tiempoInicio) / 1000);
            //console.log(`Tiempo transcurrido: ${tiempoTranscurrido}s`);
        }, 1000);
    }
    
    /**
     * Detiene el cronómetro y calcula el tiempo total
     */
    function detenerCronometro() {
        if (!cronometroActivo) {
            return 0;
        }
        
        clearInterval(intervalo);
        const tiempoTotal = Math.floor((Date.now() - tiempoInicio) / 1000);
        cronometroActivo = false;
        
        //console.log(`Cronómetro detenido. Tiempo total: ${tiempoTotal}s`);
        
        return tiempoTotal;
    }
    
    /**
     * Formatea segundos a formato legible
     */

    function formatearTiempo(segundos) {
        const minutos = Math.floor(segundos / 60);
        const segs = segundos % 60;
        return `${minutos}m ${segs}s`;
    }

    campoDescripcion.addEventListener('input', function(e) {
        if (e.target.value.trim().length > 0 && !cronometroActivo) {
            iniciarCronometro();
        }
    }, { once: false });
    
    campoDescripcion.addEventListener('focus', function() {
        if (!cronometroActivo) {
            iniciarCronometro();
        }
    }, { once: true });
    
    formulario.addEventListener('submit', function(e) {
        const tiempoTotal = detenerCronometro();
        
        // Guardar en el campo oculto
        campoTiempoRegistro.value = tiempoTotal;
        
        //console.log(`Formulario enviado. Tiempo de registro: ${formatearTiempo(tiempoTotal)} (${tiempoTotal}s)`);
        
    });
    window.addEventListener('beforeunload', function() {
        if (intervalo) {
            clearInterval(intervalo);
        }
    });
    //console.log('Cronómetro de registro cargado correctamente');
    
})();