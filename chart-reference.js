// Chart.js Configuration Reference for Live Network Activity

const chartConfig = {
    type: 'line',
    data: {
        labels: ['20s ago', '11s ago', '2s ago'],
        datasets: [
            {
                label: 'Network Traffic (MB/s)',
                data: [60, 150, 25],
                borderColor: '#00ff9d',
                backgroundColor: 'transparent',
                fill: false,
                tension: 0.2,
                pointBackgroundColor: '#00ff9d',
                pointBorderColor: '#00ff9d',
                pointRadius: 6,
                pointHoverRadius: 8,
                borderWidth: 3
            },
            {
                label: 'Threat Activity (events/s)',
                data: [15, 50, 10],
                borderColor: '#ff073a',
                backgroundColor: 'transparent',
                fill: false,
                tension: 0.2,
                pointBackgroundColor: '#ff073a',
                pointBorderColor: '#ff073a',
                pointRadius: 6,
                pointHoverRadius: 8,
                borderWidth: 3
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        devicePixelRatio: 3, // Higher clarity
        animation: {
            duration: 1000
        },
        interaction: {
            intersect: false,
            mode: 'index'
        },
        layout: {
            padding: {
                top: 15,
                bottom: 15,
                left: 15,
                right: 15
            }
        },
        plugins: {
            title: {
                display: true,
                text: 'LIVE NETWORK ACTIVITY',
                padding: {
                    top: 15,
                    bottom: 15
                },
                font: {
                    family: 'Arial, sans-serif',
                    size: 22,
                    weight: 'bold',
                    color: '#FFFFFF'
                }
            },
            legend: {
                display: true,
                position: 'top',
                align: 'center',
                labels: {
                    boxWidth: 18,
                    usePointStyle: true,
                    color: '#FFFFFF',
                    padding: 20,
                    font: {
                        size: 14,
                        weight: 'bold'
                    }
                }
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                titleFont: {
                    size: 16,
                    weight: 'bold'
                },
                bodyFont: {
                    size: 14
                },
                borderColor: '#00ffff',
                borderWidth: 1,
                padding: 12
            }
        },
        scales: {
            x: {
                ticks: {
                    color: '#FFFFFF',
                    font: {
                        size: 14,
                        weight: 'bold'
                    },
                    padding: 10
                },
                grid: {
                    display: true,
                    color: 'rgba(0, 255, 255, 0.15)',
                    lineWidth: 1
                }
            },
            y: {
                beginAtZero: true,
                suggestedMax: 160,
                ticks: {
                    color: '#FFFFFF',
                    font: {
                        size: 14,
                        weight: 'bold'
                    },
                    padding: 10
                },
                grid: {
                    display: true,
                    color: 'rgba(0, 255, 255, 0.15)',
                    lineWidth: 1
                }
            }
        },
        elements: {
            line: {
                borderJoinStyle: 'round',
                borderCapStyle: 'round',
                borderWidth: 3
            },
            point: {
                radius: 6,
                hoverRadius: 8,
                backgroundColor: function(context) {
                    return context.dataset.borderColor;
                },
                borderWidth: 2,
                borderColor: function(context) {
                    return context.dataset.borderColor;
                },
                hitRadius: 8
            }
        }
    }
};

// Canvas Setup for High Resolution and Proper Sizing
setTimeout(() => {
    const canvas = document.getElementById('realTimeChart');
    if (canvas) {
        // Make canvas crystal clear with higher DPI
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr * 2; // Double the width for clarity
        canvas.height = rect.height * dpr * 2; // Double the height for clarity
        
        // Style properties to fill the container perfectly
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.margin = '0';
        canvas.style.padding = '0';
        canvas.style.borderRadius = '0';
        
        // Force high quality rendering
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr * 2, dpr * 2); // Scale for higher resolution
        
        // Update chart with new dimensions
        chart.resize();
        chart.update();
    }
}, 200);

// CSS for Containers
/*
.feature-card {
    padding: 0; 
    margin: 0; 
    border: 2px solid #00ffff; 
    border-radius: 0; 
    box-shadow: 0 0 20px rgba(0, 255, 255, 0.5); 
    background: #0b111e;
    min-height: 600px;
    max-height: 600px;
    height: 600px;
}

.feature-header {
    margin: 0; 
    padding: 15px; 
    background: #0b111e; 
    border-bottom: 2px solid #00ffff;
}

.feature-header h3 {
    color: #00ffff; 
    margin: 0; 
    font-size: 20px; 
    font-weight: bold; 
    text-transform: uppercase; 
    text-shadow: 0 0 10px rgba(0, 255, 255, 0.7); 
    letter-spacing: 1px;
}

.chart-container {
    width: 100%; 
    height: calc(100% - 55px); 
    position: relative; 
    padding: 0; 
    margin: 0; 
    border: none; 
    background: #0b111e;
}

canvas#realTimeChart {
    width: 100% !important; 
    height: 100% !important; 
    position: absolute; 
    top: 0; 
    left: 0; 
    margin: 0; 
    padding: 0; 
    border-radius: 0;
}
*/
