// Threat Heatmap Implementation
window.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        initEnhancedThreatHeatmap();
    }, 500);
});

function initEnhancedThreatHeatmap() {
    const container = document.getElementById('threatHeatmap');
    if (!container) return;

    // Create more realistic threat data with proper distribution
    const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const threatLevels = generateThreatData(weekdays);
    
    // Create custom heat map visualization
    renderEnhancedHeatmap(container, threatLevels, weekdays);
}

function generateThreatData(weekdays) {
    // Generate realistic threat data with proper patterns
    const threatLevels = [];
    
    // For each weekday
    for (let i = 0; i < weekdays.length; i++) {
        const dayData = [];
        
        // Create data for different hours of the day
        // We'll create 24 data points (for each hour)
        for (let hour = 0; hour < 24; hour++) {
            // Generate threat level based on time of day patterns
            // Morning has lower threats, evening has higher threats
            let baseThreatLevel;
            
            if (hour >= 0 && hour < 6) {
                // Late night/early morning (lower activity)
                baseThreatLevel = 20 + Math.random() * 30;
            } else if (hour >= 6 && hour < 12) {
                // Morning (moderate activity)
                baseThreatLevel = 30 + Math.random() * 40;
            } else if (hour >= 12 && hour < 18) {
                // Afternoon (high activity)
                baseThreatLevel = 60 + Math.random() * 30;
            } else {
                // Evening (very high activity)
                baseThreatLevel = 70 + Math.random() * 30;
            }
            
            // Add some randomness to make it look realistic
            const threatLevel = Math.min(100, Math.floor(baseThreatLevel + (Math.random() * 20 - 10)));
            dayData.push(threatLevel);
        }
        
        threatLevels.push(dayData);
    }
    
    return threatLevels;
}

function renderEnhancedHeatmap(container, threatLevels, weekdays) {
    // Clear the container
    container.innerHTML = '';
    
    // Set container styles
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.backgroundColor = '#0d1117';
    container.style.borderRadius = '4px';
    container.style.overflow = 'auto';
    
    // Create header for days
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.padding = '10px 0';
    header.style.color = '#00ffff';
    header.style.borderBottom = '1px solid rgba(0, 255, 255, 0.3)';
    header.style.minWidth = 'fit-content';
    header.style.marginLeft = '40px';  // Leave space for hour labels
    header.style.marginRight = '10px';
    header.style.width = 'calc(100% - 50px)'; // Ensure proper width alignment with the grid
    
    // Add day labels
    weekdays.forEach(day => {
        const dayLabel = document.createElement('div');
        dayLabel.textContent = day;
        dayLabel.style.flex = '1';
        dayLabel.style.textAlign = 'center';
        dayLabel.style.fontWeight = 'bold';
        dayLabel.style.fontSize = '14px';
        dayLabel.style.textShadow = '0 0 5px rgba(0, 255, 255, 0.5)';
        header.appendChild(dayLabel);
    });
    
    container.appendChild(header);
    
    // Create the heatmap grid
    const grid = document.createElement('div');
    grid.style.display = 'flex';
    grid.style.flex = '1';
    grid.style.overflow = 'hidden';
    grid.style.position = 'relative';
    
    // Create hour labels column
    const hourLabels = document.createElement('div');
    hourLabels.style.width = '40px';
    hourLabels.style.display = 'flex';
    hourLabels.style.flexDirection = 'column';
    hourLabels.style.justifyContent = 'space-between';
    hourLabels.style.paddingTop = '10px';
    hourLabels.style.paddingBottom = '10px';
    
    // Add hour labels (we'll show fewer labels to avoid clutter)
    const hourMarks = [0, 6, 12, 18, 23];
    hourMarks.forEach(hour => {
        const hourLabel = document.createElement('div');
        hourLabel.textContent = `${hour}h`;
        hourLabel.style.color = '#00ffff';
        hourLabel.style.fontSize = '12px';
        hourLabel.style.opacity = '0.8';
        hourLabel.style.height = '20px';
        hourLabel.style.display = 'flex';
        hourLabel.style.alignItems = 'center';
        hourLabel.style.justifyContent = 'flex-end';
        hourLabel.style.paddingRight = '5px';
        hourLabel.style.position = 'absolute';
        hourLabel.style.left = '0';
        hourLabel.style.top = `${(hour / 24) * 100}%`;
        hourLabels.appendChild(hourLabel);
    });
    
    grid.appendChild(hourLabels);
    
    // Create heatmap columns for each day
    const heatmapGrid = document.createElement('div');
    heatmapGrid.style.display = 'flex';
    heatmapGrid.style.flex = '1';
    heatmapGrid.style.height = '100%';
    
    // For each weekday
    for (let dayIndex = 0; dayIndex < weekdays.length; dayIndex++) {
        const dayColumn = document.createElement('div');
        dayColumn.style.flex = '1';
        dayColumn.style.display = 'flex';
        dayColumn.style.flexDirection = 'column';
        dayColumn.style.height = '100%';
        dayColumn.style.marginLeft = '2px';
        dayColumn.style.minWidth = '60px';
        
        // Add cells for each hour
        for (let hour = 0; hour < 24; hour++) {
            const hourCell = document.createElement('div');
            hourCell.style.flex = '1';
            
            // Get threat level for this day and hour
            const threatLevel = threatLevels[dayIndex][hour];
            
            // Set color based on threat level
            let cellColor;
            if (threatLevel < 30) {
                // Low threat - green
                cellColor = `rgb(57, 255, 20)`;
            } else if (threatLevel < 60) {
                // Medium threat - yellow/orange
                cellColor = `rgb(255, 170, 0)`;
            } else {
                // High threat - red
                cellColor = `rgb(255, 51, 51)`;
            }
            
            hourCell.style.backgroundColor = cellColor;
            hourCell.style.opacity = 0.7 + (threatLevel / 100) * 0.3;
            hourCell.style.borderRadius = '1px';
            hourCell.style.margin = '1px';
            hourCell.style.boxShadow = 'inset 0 0 5px rgba(0, 0, 0, 0.3)';
            
            // Add tooltip with exact data
            hourCell.title = `${weekdays[dayIndex]} ${hour}:00 - Threat Level: ${threatLevel}%`;
            
            // Add hover effect
            hourCell.addEventListener('mouseenter', function() {
                this.style.opacity = '1';
                this.style.transform = 'scale(1.05)';
                this.style.boxShadow = `0 0 10px ${cellColor}, inset 0 0 8px rgba(255, 255, 255, 0.5)`;
                this.style.zIndex = '10';
            });
            
            hourCell.addEventListener('mouseleave', function() {
                this.style.opacity = 0.7 + (threatLevel / 100) * 0.3;
                this.style.transform = 'scale(1)';
                this.style.boxShadow = 'inset 0 0 5px rgba(0, 0, 0, 0.3)';
                this.style.zIndex = '1';
            });
            
            dayColumn.appendChild(hourCell);
        }
        
        heatmapGrid.appendChild(dayColumn);
    }
    
    grid.appendChild(heatmapGrid);
    container.appendChild(grid);
    
    // Add legend
    const legend = createHeatmapLegend();
    container.appendChild(legend);
}

function createHeatmapLegend() {
    const legend = document.createElement('div');
    legend.style.display = 'flex';
    legend.style.justifyContent = 'center';
    legend.style.padding = '10px 0';
    legend.style.borderTop = '1px solid rgba(0, 255, 255, 0.3)';
    
    const legendItems = [
        { color: '#39ff14', label: 'Low' },
        { color: '#ffaa00', label: 'Medium' },
        { color: '#ff3333', label: 'High' }
    ];
    
    legendItems.forEach(item => {
        const legendItem = document.createElement('div');
        legendItem.style.display = 'flex';
        legendItem.style.alignItems = 'center';
        legendItem.style.margin = '0 15px';
        
        const colorBox = document.createElement('div');
        colorBox.style.width = '15px';
        colorBox.style.height = '15px';
        colorBox.style.backgroundColor = item.color;
        colorBox.style.marginRight = '5px';
        colorBox.style.boxShadow = `0 0 5px ${item.color}`;
        
        const label = document.createElement('span');
        label.textContent = item.label;
        label.style.color = '#00ffff';
        label.style.fontSize = '12px';
        
        legendItem.appendChild(colorBox);
        legendItem.appendChild(label);
        legend.appendChild(legendItem);
    });
    
    return legend;
}
