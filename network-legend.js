// Create and add the enhanced network map legend
window.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        createNetworkMapLegend();
        addNetworkParticles();
        addPulsingEffect();
    }, 500);
});

function createNetworkMapLegend() {
    const container = document.getElementById('threeDVisualization');
    if (!container) return;
    
    // Create enhanced legend element with glass morphism effect
    const legend = document.createElement('div');
    legend.style.position = 'absolute';
    legend.style.top = '20px';
    legend.style.right = '20px';  // Positioned on the right for better visibility
    legend.style.background = 'rgba(13, 17, 23, 0.85)';
    legend.style.backdropFilter = 'blur(10px)';
    legend.style.webkitBackdropFilter = 'blur(10px)';
    legend.style.border = '1px solid #00ff9d';
    legend.style.borderRadius = '6px';
    legend.style.padding = '15px';
    legend.style.fontSize = '12px';
    legend.style.fontFamily = 'monospace';
    legend.style.color = '#00ff9d';
    legend.style.zIndex = '999';
    legend.style.minWidth = '230px';
    legend.style.maxWidth = '230px';
    legend.style.boxShadow = '0 0 20px rgba(0, 255, 157, 0.3)';
    legend.className = 'network-legend';

    legend.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 12px; color: #00ffff; font-size: 14px; letter-spacing: 0.5px; text-shadow: 0 0 5px #00ffff;">🌐 Network Activity</div>
        <div style="display: flex; align-items: center; margin: 8px 0;">
            <div class="node-indicator active" style="width: 14px; height: 14px; background: #00ff9d; border-radius: 50%; margin-right: 12px; box-shadow: 0 0 8px rgba(0, 255, 157, 0.8);"></div>
            <span>Active Nodes</span>
        </div>
        <div style="display: flex; align-items: center; margin: 8px 0;">
            <div class="node-indicator threat" style="width: 14px; height: 14px; background: #ff3333; border-radius: 50%; margin-right: 12px; box-shadow: 0 0 8px rgba(255, 51, 51, 0.8);"></div>
            <span>Threat Sources</span>
        </div>
        <div style="display: flex; align-items: center; margin: 8px 0;">
            <div class="node-indicator security" style="width: 14px; height: 14px; background: #00ffff; border-radius: 50%; margin-right: 12px; box-shadow: 0 0 8px rgba(0, 255, 255, 0.8);"></div>
            <span>Security Hubs</span>
        </div>
        <div style="height: 1px; background: linear-gradient(to right, transparent, #00ff9d, transparent); margin: 12px 0;"></div>
        <div style="font-size: 11px; color: #00d4ff; text-align: center; margin-top: 6px; letter-spacing: 0.5px; text-shadow: 0 0 3px #00d4ff;">
            🔗 Real-time Network Map
        </div>
    `;

    container.appendChild(legend);
    
    // Add animation to the legend
    animateLegend(legend);
}

function animateLegend(legend) {
    // Add subtle pulsing effect to the indicators
    const indicators = legend.querySelectorAll('.node-indicator');
    indicators.forEach(indicator => {
        setInterval(() => {
            indicator.style.transform = 'scale(1.2)';
            indicator.style.opacity = '1';
            
            setTimeout(() => {
                indicator.style.transform = 'scale(1)';
                indicator.style.opacity = '0.8';
            }, 500);
        }, 2000 + Math.random() * 1000); // Different timing for each indicator
    });
}

function addNetworkParticles() {
    const container = document.getElementById('threeDVisualization');
    if (!container) return;
    
    // Create decorative particles
    for (let i = 0; i < 40; i++) {
        const particle = document.createElement('div');
        particle.className = 'network-particle';
        particle.style.position = 'absolute';
        
        // Vary particle size more dramatically
        const size = (i % 5 === 0) ? (4 + Math.random() * 4) : (1 + Math.random() * 2.5);
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.borderRadius = '50%';
        
        // Enhanced color palette
        const colors = ['#00ff9d', '#00d4ff', '#ff3333', '#ffaa00', '#00ffff'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        particle.style.backgroundColor = color;
        particle.style.boxShadow = `0 0 ${size * 2.5}px ${color}`;
        
        // Better positioned with margins from edges
        particle.style.left = (5 + Math.random() * 90) + '%';
        particle.style.top = (5 + Math.random() * 90) + '%';
        
        // More varied animation
        const duration = (i % 3 === 0) ? (12 + Math.random() * 20) : (5 + Math.random() * 10);
        particle.style.animation = `float ${duration}s infinite linear`;
        
        // Varied opacity
        particle.style.opacity = (i % 5 === 0) ? (0.4 + Math.random() * 0.3) : (0.1 + Math.random() * 0.3);
        
        container.appendChild(particle);
    }
    
    // Add CSS for the floating animation
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        @keyframes float {
            0% {
                transform: translate(0, 0);
            }
            25% {
                transform: translate(${-20 + Math.random() * 40}px, ${-20 + Math.random() * 40}px);
            }
            50% {
                transform: translate(${-20 + Math.random() * 40}px, ${-20 + Math.random() * 40}px);
            }
            75% {
                transform: translate(${-20 + Math.random() * 40}px, ${-20 + Math.random() * 40}px);
            }
            100% {
                transform: translate(0, 0);
            }
        }
        
        .network-legend {
            transition: all 0.3s ease;
        }
        
        .network-legend:hover {
            transform: translateY(-5px);
            box-shadow: 0 0 25px rgba(0, 255, 157, 0.5);
        }
        
        .node-indicator {
            transition: all 0.5s ease;
        }
    `;
    document.head.appendChild(styleElement);
}

function addPulsingEffect() {
    const container = document.getElementById('threeDVisualization');
    if (!container) return;
    
    // Create a pulsing central hub effect
    const pulsingHub = document.createElement('div');
    pulsingHub.style.position = 'absolute';
    pulsingHub.style.left = '50%';
    pulsingHub.style.top = '50%';
    pulsingHub.style.transform = 'translate(-50%, -50%)';
    pulsingHub.style.width = '50px';
    pulsingHub.style.height = '50px';
    pulsingHub.style.borderRadius = '50%';
    pulsingHub.style.backgroundColor = 'transparent';
    pulsingHub.style.border = '2px solid rgba(0, 255, 255, 0.7)';
    pulsingHub.style.boxShadow = '0 0 30px rgba(0, 255, 255, 0.4)';
    pulsingHub.style.animation = 'pulse 4s infinite';
    pulsingHub.style.zIndex = '1';
    
    // Create secondary pulse
    const secondaryPulse = document.createElement('div');
    secondaryPulse.style.position = 'absolute';
    secondaryPulse.style.left = '50%';
    secondaryPulse.style.top = '50%';
    secondaryPulse.style.transform = 'translate(-50%, -50%)';
    secondaryPulse.style.width = '30px';
    secondaryPulse.style.height = '30px';
    secondaryPulse.style.borderRadius = '50%';
    secondaryPulse.style.backgroundColor = 'rgba(0, 255, 157, 0.1)';
    secondaryPulse.style.border = '1px solid rgba(0, 255, 157, 0.6)';
    secondaryPulse.style.boxShadow = '0 0 20px rgba(0, 255, 157, 0.4)';
    secondaryPulse.style.animation = 'pulse2 3s infinite 0.5s';
    secondaryPulse.style.zIndex = '2';
    
    // Add enhanced pulse animations
    const pulseStyle = document.createElement('style');
    pulseStyle.textContent = `
        @keyframes pulse {
            0% {
                transform: translate(-50%, -50%) scale(0.5);
                opacity: 0.9;
                border-color: rgba(0, 255, 255, 0.7);
            }
            50% {
                transform: translate(-50%, -50%) scale(2.5);
                opacity: 0;
                border-color: rgba(0, 255, 255, 0.1);
            }
            100% {
                transform: translate(-50%, -50%) scale(0.5);
                opacity: 0.9;
                border-color: rgba(0, 255, 255, 0.7);
            }
        }
        
        @keyframes pulse2 {
            0% {
                transform: translate(-50%, -50%) scale(0.7);
                opacity: 0.8;
            }
            60% {
                transform: translate(-50%, -50%) scale(2);
                opacity: 0;
            }
            100% {
                transform: translate(-50%, -50%) scale(0.7);
                opacity: 0.8;
            }
        }
    `;
    document.head.appendChild(pulseStyle);
    
    container.appendChild(pulsingHub);
    container.appendChild(secondaryPulse);
}
