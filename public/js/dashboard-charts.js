// Configuración global de Chart.js
Chart.defaults.font.family = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
Chart.defaults.color = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim();

// Detectar tema
const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
const gridColor = isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

// Gráfico de barras - Gastos por Categoría
if (document.getElementById('categoriasChart') && datosGraficos.categorias.length > 0) {
    const ctx1 = document.getElementById('categoriasChart').getContext('2d');
    new Chart(ctx1, {
        type: 'bar',
        data: {
            labels: datosGraficos.categorias,
            datasets: [{
                label: 'Gasto (S/)',
                data: datosGraficos.montos,
                backgroundColor: datosGraficos.colores,
                borderRadius: 8,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: isDarkTheme ? '#1f2937' : '#ffffff',
                    titleColor: isDarkTheme ? '#f9fafb' : '#111827',
                    bodyColor: isDarkTheme ? '#f9fafb' : '#111827',
                    borderColor: isDarkTheme ? '#374151' : '#e5e7eb',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            return 'S/ ' + context.parsed.y.toFixed(2);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: gridColor
                    },
                    ticks: {
                        callback: function(value) {
                            return 'S/ ' + value;
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Gráfico de dona - Distribución del Gasto
if (document.getElementById('donutChart') && datosGraficos.categorias.length > 0) {
    const ctx2 = document.getElementById('donutChart').getContext('2d');
    new Chart(ctx2, {
        type: 'doughnut',
        data: {
            labels: datosGraficos.categorias,
            datasets: [{
                data: datosGraficos.montos,
                backgroundColor: datosGraficos.colores,
                borderWidth: 2,
                borderColor: isDarkTheme ? '#1a1a1a' : '#ffffff',
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 12
                        },
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: isDarkTheme ? '#1f2937' : '#ffffff',
                    titleColor: isDarkTheme ? '#f9fafb' : '#111827',
                    bodyColor: isDarkTheme ? '#f9fafb' : '#111827',
                    borderColor: isDarkTheme ? '#374151' : '#e5e7eb',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return label + ': S/ ' + value.toFixed(2) + ' (' + percentage + '%)';
                        }
                    }
                }
            }
        }
    });
}

// Gráfico de progreso del presupuesto
if (document.getElementById('presupuestoChart') && typeof progresoPresupuesto !== 'undefined' && progresoPresupuesto.categorias.length > 0) {
    const ctx3 = document.getElementById('presupuestoChart').getContext('2d');
    
    const categorias = progresoPresupuesto.categorias.map(c => c.categoria);
    const gastado = progresoPresupuesto.categorias.map(c => c.gastado);
    const presupuesto = progresoPresupuesto.categorias.map(c => c.presupuesto);
    
    new Chart(ctx3, {
        type: 'bar',
        data: {
            labels: categorias,
            datasets: [
                {
                    label: 'Gastado',
                    data: gastado,
                    backgroundColor: '#ef4444',
                    borderRadius: 6,
                    borderSkipped: false,
                },
                {
                    label: 'Presupuesto',
                    data: presupuesto,
                    backgroundColor: '#10b981',
                    borderRadius: 6,
                    borderSkipped: false,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        padding: 15,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: isDarkTheme ? '#1f2937' : '#ffffff',
                    titleColor: isDarkTheme ? '#f9fafb' : '#111827',
                    bodyColor: isDarkTheme ? '#f9fafb' : '#111827',
                    borderColor: isDarkTheme ? '#374151' : '#e5e7eb',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': S/ ' + context.parsed.y.toFixed(2);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: gridColor
                    },
                    ticks: {
                        callback: function(value) {
                            return 'S/ ' + value;
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Actualizar gráficos cuando cambia el tema
document.getElementById('themeToggle')?.addEventListener('click', () => {
    setTimeout(() => {
        location.reload();
    }, 100);
});

