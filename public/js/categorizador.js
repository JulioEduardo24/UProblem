const descripcionInput = document.getElementById('descripcion');
const categoriaSelect = document.getElementById('categoria');
const categoriaSugeridaDiv = document.getElementById('categoriaSugerida');
const sugerenciasList = document.getElementById('sugerenciasList');

let timeoutId;
let categoriaSugeridaOriginal = null;
/*
console.log('Categorizador frontend cargado');
console.log('descripcionInput:', descripcionInput);
console.log('categoriaSelect:', categoriaSelect);*/

if (descripcionInput && categoriaSelect) {
    /*console.log('Elementos encontrados, agregando event listeners');*/
    
    descripcionInput.addEventListener('input', (e) => {
        clearTimeout(timeoutId);
        
        const descripcion = e.target.value.trim();
        /*console.log('Descripción escrita:', descripcion);*/
        
        if (descripcion.length < 3) {
            categoriaSugeridaDiv.style.display = 'none';
            return;
        }

        timeoutId = setTimeout(async () => {
            /*console.log('Enviando petición para categorizar:', descripcion);*/
            
            try {
                const response = await fetch('/gastos/sugerir-categoria', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ descripcion })
                });

                const data = await response.json();
                /*console.log('Respuesta recibida:', data);*/

                if (data.success && data.categoria) {
                    categoriaSugeridaOriginal = data.categoria;
                    
                    /*console.log('Asignando categoría al select:', data.categoria);*/
                    
                    // Asignar automáticamente al select
                    categoriaSelect.value = data.categoria;
                    /*console.log('Valor asignado al select:', categoriaSelect.value);*/
                    
                    // Agregar campo oculto con la sugerencia original
                    let hiddenInput = document.getElementById('categoria_sugerida_hidden');
                    if (!hiddenInput) {
                        hiddenInput = document.createElement('input');
                        hiddenInput.type = 'hidden';
                        hiddenInput.id = 'categoria_sugerida_hidden';
                        hiddenInput.name = 'categoria_sugerida';
                        document.querySelector('.gasto-form').appendChild(hiddenInput);
                    }
                    hiddenInput.value = data.categoria;
                    
                    // Agregar campo para categoria_manual (inicialmente false)
                    let hiddenManual = document.getElementById('categoria_manual_hidden');
                    if (!hiddenManual) {
                        hiddenManual = document.createElement('input');
                        hiddenManual.type = 'hidden';
                        hiddenManual.id = 'categoria_manual_hidden';
                        hiddenManual.name = 'categoria_manual_override';
                        hiddenManual.value = 'false';
                        document.querySelector('.gasto-form').appendChild(hiddenManual);
                    }
                    
                    if (data.sugerencias) {
                        mostrarSugerencias(data.sugerencias);
                    }
                }
            } catch (error) {
                console.error('Error al obtener sugerencias:', error);
            }
        }, 500);
    });
    
    // Detectar si el usuario cambia manualmente la categoría
    categoriaSelect.addEventListener('change', () => {
        /*console.log('Usuario cambió categoría a:', categoriaSelect.value);*/
        /*console.log('Categoría sugerida original era:', categoriaSugeridaOriginal);*/
        
        let hiddenManual = document.getElementById('categoria_manual_hidden');
        if (!hiddenManual) {
            hiddenManual = document.createElement('input');
            hiddenManual.type = 'hidden';
            hiddenManual.id = 'categoria_manual_hidden';
            hiddenManual.name = 'categoria_manual_override';
            document.querySelector('.gasto-form').appendChild(hiddenManual);
        }
        
        // Si el usuario cambió la categoría manualmente
        if (categoriaSugeridaOriginal && categoriaSelect.value !== categoriaSugeridaOriginal) {
            hiddenManual.value = 'true';
            /*console.log('Cambio manual detectado, categoria_manual = true');*/
        } else {
            hiddenManual.value = 'false';
            /*console.log('Usuario aceptó sugerencia, categoria_manual = false');*/
        }
    });
}

function mostrarSugerencias(sugerencias) {
    /*console.log('Mostrando sugerencias:', sugerencias);*/
    
    if (!sugerencias || sugerencias.length === 0) {
        categoriaSugeridaDiv.style.display = 'none';
        return;
    }

    sugerenciasList.innerHTML = '';
    
    sugerencias.forEach((sug, index) => {
        const sugerenciaBtn = document.createElement('button');
        sugerenciaBtn.type = 'button';
        sugerenciaBtn.className = 'sugerencia-btn' + (index === 0 ? ' primary' : '');
        sugerenciaBtn.innerHTML = `
            <span class="sugerencia-nombre">${sug.categoria}</span>
            <span class="sugerencia-confianza">${sug.confianza}%</span>
        `;
        
        sugerenciaBtn.addEventListener('click', () => {
            /*console.log('Usuario hizo clic en sugerencia:', sug.categoria);*/
            categoriaSelect.value = sug.categoria;
            
            // Actualizar el campo oculto con la nueva selección
            let hiddenInput = document.getElementById('categoria_sugerida_hidden');
            if (hiddenInput) {
                hiddenInput.value = sug.categoria;
            }
            
            categoriaSugeridaDiv.classList.add('selected');
            
            setTimeout(() => {
                categoriaSugeridaDiv.classList.remove('selected');
            }, 300);
        });
        
        sugerenciasList.appendChild(sugerenciaBtn);
    });

    categoriaSugeridaDiv.style.display = 'block';
}