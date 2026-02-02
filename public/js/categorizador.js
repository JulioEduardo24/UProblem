const descripcionInput = document.getElementById('descripcion');
const categoriaSelect = document.getElementById('categoria');
const categoriaSugeridaDiv = document.getElementById('categoriaSugerida');
const sugerenciasList = document.getElementById('sugerenciasList');

let timeoutId;

if (descripcionInput) {
    descripcionInput.addEventListener('input', (e) => {
        clearTimeout(timeoutId);
        
        const descripcion = e.target.value.trim();
        
        if (descripcion.length < 3) {
            categoriaSugeridaDiv.style.display = 'none';
            return;
        }

        timeoutId = setTimeout(async () => {
            try {
                const response = await fetch('/gastos/sugerir-categoria', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ descripcion })
                });

                const data = await response.json();

                if (data.success && data.sugerencias) {
                    mostrarSugerencias(data.sugerencias);
                }
            } catch (error) {
                console.error('Error al obtener sugerencias:', error);
            }
        }, 500);
    });
}

function mostrarSugerencias(sugerencias) {
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
            categoriaSelect.value = sug.categoria;
            categoriaSugeridaDiv.classList.add('selected');
            
            setTimeout(() => {
                categoriaSugeridaDiv.classList.remove('selected');
            }, 300);
        });
        
        sugerenciasList.appendChild(sugerenciaBtn);
    });

    categoriaSugeridaDiv.style.display = 'block';
}