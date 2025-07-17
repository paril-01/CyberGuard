// Simple chart initialization that exactly matches the reference image
window.addEventListener('DOMContentLoaded', function() {
    // Wait for Chart.js to load
    setTimeout(function() {
        initializeSimpleChart();
    }, 500);
});

function initializeSimpleChart() {
    // Get the canvas
    const canvas = document.getElementById('realTimeChart');
    if (!canvas) return;
    
    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
        console.error("Chart.js not loaded");
        return;
    }
    
    // Make sure any previous chart instance is destroyed
    if (Chart.getChart(canvas)) {
        Chart.getChart(canvas).destroy();
    }
    
    // Create chart with exact styling from the reference image
    const chart = new Chart(canvas, {
        type: 'line',
        data: {
            labels: ['20s ago', '11s ago', '2s ago'],
            datasets: [
                {
                    label: 'Network Traffic (MB/s)',
                    data: [60, 150, 35],
                    borderColor: '#00ff9d',
                    backgroundColor: 'transparent',
                    tension: 0.3,
                    pointBackgroundColor: '#00ff9d',
                    pointRadius: 8,
                    borderWidth: 3
                },
                {
                    label: 'Threat Activity (events/s)',
                    data: [15, 50, 10],
                    borderColor: '#ff073a',
                    backgroundColor: 'transparent',
                    tension: 0.3,
                    pointBackgroundColor: '#ff073a',
                    pointRadius: 8,
                    borderWidth: 3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            plugins: {
                title: {
                    display: true,
                    text: 'LIVE NETWORK ACTIVITY',
                    color: '#999999',
                    font: {
                        size: 20,
                        weight: 'bold'
                    },
                    padding: {
                        bottom: 30
                    }
                },
                legend: {
                    display: true,
                    position: 'top',
                    align: 'start',
                    labels: {
                        color: '#FFFFFF',
                        font: {
                            size: 16
                        },
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                }
            },
            scales: {
                y: {
                    min: 0,
                    max: 200,
                    grid: {
                        color: 'rgba(0, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#FFFFFF',
                        stepSize: 50,
                        font: {
                            size: 14
                        }
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(0, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#FFFFFF',
                        font: {
                            size: 14
                        }
                    }
                }
            }
        }
    });
}
