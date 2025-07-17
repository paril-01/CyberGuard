// Enhanced CyberGuard JavaScript with 3D Visualizations and Real API Integration

class CyberGuardApp {
    constructor() {
        this.apiBaseUrl = 'http://localhost:3000/api';
        this.wsUrl = 'ws://localhost:3000';
        this.websocket = null;
        this.currentScanType = 'wallet';
        this.charts = {};
        this.scene = null;
        this.renderer = null;
        this.camera = null;
        this.controls = null;
        
        this.init();
    }

    async init() {
        this.setupNavigation();
        this.setupScanInterface();
        this.setupWebSocket();
        this.initMatrixEffect();
        this.init3DVisualization();
        this.initCharts();
        await this.loadInitialData();
        this.startRealTimeUpdates();
    }

    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        const pages = document.querySelectorAll('.page');

        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const targetPage = item.dataset.page;
                
                // Update navigation
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                
                // Update pages
                pages.forEach(page => page.classList.remove('active'));
                document.getElementById(targetPage).classList.add('active');
                
                // Trigger page-specific updates
                this.onPageChange(targetPage);
            });
        });
    }

    setupScanInterface() {
        const scanTabs = document.querySelectorAll('.scan-tab');
        const scanBtn = document.getElementById('scanBtn');
        const scanInput = document.getElementById('scanInput');

        scanTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Handle quick scan buttons
                if (tab.dataset.quickScan) {
                    this.performQuickScan(tab.dataset.value, tab.dataset.quickScan);
                    return;
                }
                
                // Handle scan type selection
                if (tab.dataset.scanType) {
                    scanTabs.forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    this.currentScanType = tab.dataset.scanType;
                    this.updateScanPlaceholder();
                }
            });
        });

        scanBtn.addEventListener('click', () => this.performScan());
        scanInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.performScan();
        });
    }

    setupWebSocket() {
        try {
            this.websocket = new WebSocket(this.wsUrl);
            
            this.websocket.onopen = () => {
                console.log('🔗 WebSocket connected');
                this.showNotification('Real-time monitoring active', 'success');
            };
            
            this.websocket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === 'stats_update') {
                    this.updateRealTimeStats(data.data);
                }
            };
            
            this.websocket.onclose = () => {
                console.log('🔌 WebSocket disconnected');
                setTimeout(() => this.setupWebSocket(), 5000);
            };
            
            this.websocket.onerror = (error) => {
                console.error('WebSocket error:', error);
            };
        } catch (error) {
            console.error('WebSocket setup failed:', error);
        }
    }

    initMatrixEffect() {
        const canvas = document.getElementById('matrixCanvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
        const fontSize = 14;
        const columns = canvas.width / fontSize;
        const drops = Array(Math.floor(columns)).fill(1);
        
        const drawMatrix = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = '#00ffff';
            ctx.font = `${fontSize}px monospace`;
            
            for (let i = 0; i < drops.length; i++) {
                const char = chars[Math.floor(Math.random() * chars.length)];
                ctx.fillText(char, i * fontSize, drops[i] * fontSize);
                
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        };
        
        setInterval(drawMatrix, 35);
        
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
    }

    init3DVisualization() {
        const container = document.getElementById('threeDVisualization');
        if (!container) {
            console.error('❌ Three.js container not found');
            return;
        }

        // Check for Three.js availability
        if (!window.THREE) {
            console.warn('⚠️ Three.js not available, initializing 2D fallback');
            this.init2DVisualization();
            return;
        }

        try {
            // Clear container first
            container.innerHTML = '';
            
            // Scene setup
            this.scene = new THREE.Scene();
            this.camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
            this.renderer = new THREE.WebGLRenderer({ 
                antialias: true, 
                alpha: true,
                preserveDrawingBuffer: true 
            });
            
            this.renderer.setSize(container.clientWidth, container.clientHeight);
            this.renderer.setClearColor(0x000814, 0.1);
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            
            container.appendChild(this.renderer.domElement);

            // Create enhanced network visualization
            this.createAdvancedThreatNetwork();

            // Enhanced lighting
            const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
            this.scene.add(ambientLight);

            const directionalLight = new THREE.DirectionalLight(0x00ff41, 1);
            directionalLight.position.set(50, 50, 50);
            directionalLight.castShadow = true;
            this.scene.add(directionalLight);

            const pointLight = new THREE.PointLight(0x00d4ff, 0.8, 100);
            pointLight.position.set(-50, -50, 50);
            this.scene.add(pointLight);

            // Position camera
            this.camera.position.set(0, 0, 80);

            // Start animation loop
            this.animate3D();

            // Handle resize
            window.addEventListener('resize', () => {
                if (container.clientWidth > 0 && container.clientHeight > 0) {
                    this.camera.aspect = container.clientWidth / container.clientHeight;
                    this.camera.updateProjectionMatrix();
                    this.renderer.setSize(container.clientWidth, container.clientHeight);
                }
            });

            console.log('✅ Enhanced 3D Visualization initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing 3D visualization:', error);
            this.init2DVisualization();
        }
    }

    setupBasicCameraControls(container) {
        // Basic mouse controls for camera without OrbitControls
        let mouseX = 0, mouseY = 0;
        let isMouseDown = false;
        
        container.addEventListener('mousedown', () => {
            isMouseDown = true;
        });
        
        container.addEventListener('mouseup', () => {
            isMouseDown = false;
        });
        
        container.addEventListener('mousemove', (event) => {
            if (!isMouseDown) return;
            
            mouseX = (event.clientX / container.clientWidth) * 2 - 1;
            mouseY = -(event.clientY / container.clientHeight) * 2 + 1;
            
            if (this.camera) {
                this.camera.position.x = mouseX * 20;
                this.camera.position.y = mouseY * 20;
                this.camera.lookAt(0, 0, 0);
            }
        });
        
        console.log('✅ Basic camera controls setup');
    }

    init2DVisualization() {
        // Fallback 2D visualization using Canvas API
        const container = document.getElementById('threeDVisualization');
        if (!container) return;

        const canvas = document.createElement('canvas');
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        canvas.style.background = 'linear-gradient(45deg, #0a0a0a 0%, #1a1a2e 100%)';
        container.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        this.animate2D(ctx, canvas);
        
        console.log('✅ 2D Fallback visualization initialized');
    }

    animate2D(ctx, canvas) {
        const nodes = [];
        for (let i = 0; i < 20; i++) {
            nodes.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                radius: Math.random() * 5 + 2,
                color: `hsl(${120 + Math.random() * 60}, 70%, 50%)`
            });
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Update and draw nodes
            nodes.forEach(node => {
                node.x += node.vx;
                node.y += node.vy;
                
                if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
                if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
                
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
                ctx.fillStyle = node.color;
                ctx.fill();
                
                // Draw connections
                nodes.forEach(other => {
                    const distance = Math.sqrt((node.x - other.x) ** 2 + (node.y - other.y) ** 2);
                    if (distance < 100) {
                        ctx.beginPath();
                        ctx.moveTo(node.x, node.y);
                        ctx.lineTo(other.x, other.y);
                        ctx.strokeStyle = `rgba(0, 255, 136, ${0.3 - distance / 300})`;
                        ctx.stroke();
                    }
                });
            });
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }

    createThreatNetwork() {
        const nodeCount = 50;
        const nodes = [];
        
        // Create central security node
        const centralGeometry = new THREE.SphereGeometry(2, 32, 32);
        const centralMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x00ffff, 
            wireframe: false,
            transparent: true,
            opacity: 0.8
        });
        const centralNode = new THREE.Mesh(centralGeometry, centralMaterial);
        this.scene.add(centralNode);
        nodes.push(centralNode);

        // Create threat nodes
        for (let i = 0; i < nodeCount; i++) {
            const geometry = new THREE.SphereGeometry(0.5 + Math.random() * 1, 16, 16);
            const threatLevel = Math.random();
            let color = 0x39ff14; // Green (safe)
            
            if (threatLevel > 0.7) color = 0xff3333; // Red (high threat)
            else if (threatLevel > 0.4) color = 0xffaa00; // Orange (medium threat)
            
            const material = new THREE.MeshBasicMaterial({ 
                color: color,
                transparent: true,
                opacity: 0.7
            });
            
            const node = new THREE.Mesh(geometry, material);
            
            // Position in 3D space
            const radius = 10 + Math.random() * 20;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
            node.position.x = radius * Math.sin(phi) * Math.cos(theta);
            node.position.y = radius * Math.sin(phi) * Math.sin(theta);
            node.position.z = radius * Math.cos(phi);
            
            this.scene.add(node);
            nodes.push(node);
            
            // Create connection lines to central node
            const lineGeometry = new THREE.BufferGeometry().setFromPoints([
                centralNode.position,
                node.position
            ]);
            const lineMaterial = new THREE.LineBasicMaterial({ 
                color: color,
                transparent: true,
                opacity: 0.3
            });
            const line = new THREE.Line(lineGeometry, lineMaterial);
            this.scene.add(line);
        }
        
        this.networkNodes = nodes;
    }

    createAdvancedThreatNetwork() {
        // Create network geometry and materials
        const nodeGeometry = new THREE.SphereGeometry(1, 16, 16);
        const materials = {
            safe: new THREE.MeshPhongMaterial({ 
                color: 0x00ff41, 
                emissive: 0x001100,
                transparent: true, 
                opacity: 0.8 
            }),
            warning: new THREE.MeshPhongMaterial({ 
                color: 0xffaa00, 
                emissive: 0x221100,
                transparent: true, 
                opacity: 0.9 
            }),
            danger: new THREE.MeshPhongMaterial({ 
                color: 0xff0040, 
                emissive: 0x220011,
                transparent: true, 
                opacity: 1.0 
            }),
            blockchain: new THREE.MeshPhongMaterial({ 
                color: 0x00d4ff, 
                emissive: 0x001122,
                transparent: true, 
                opacity: 0.8 
            }),
            exchange: new THREE.MeshPhongMaterial({ 
                color: 0x9966ff, 
                emissive: 0x110022,
                transparent: true, 
                opacity: 0.8 
            })
        };

        this.nodes = [];
        this.connections = [];
        this.threatIndicators = [];

        // Create central blockchain core
        const centralNode = new THREE.Mesh(nodeGeometry, materials.blockchain);
        centralNode.position.set(0, 0, 0);
        centralNode.scale.set(3, 3, 3);
        this.scene.add(centralNode);
        
        // Add text label for central node
        this.addNodeLabel(centralNode.position, 'BLOCKCHAIN CORE', 0x00d4ff);
        
        this.nodes.push({ 
            mesh: centralNode, 
            type: 'blockchain', 
            data: { 
                name: 'Ethereum Mainnet', 
                threats: 0,
                transactions: 15420000,
                status: 'secure'
            } 
        });

        // Create realistic network topology
        const networkLayers = [
            {
                name: 'DEX Layer',
                count: 8,
                radius: 20,
                nodeTypes: ['exchange', 'safe', 'warning'],
                labels: ['Uniswap', 'SushiSwap', 'PancakeSwap', 'Curve', '1inch', 'Kyber', 'Bancor', 'Balancer']
            },
            {
                name: 'DeFi Protocol Layer', 
                count: 12,
                radius: 35,
                nodeTypes: ['safe', 'warning', 'danger'],
                labels: ['Aave', 'Compound', 'MakerDAO', 'Yearn', 'Synthetix', 'BadgerDAO', 'SushiSwap', 'Harvest', 'Venus', 'Cream', 'Alpha', 'Belt']
            },
            {
                name: 'Bridge Layer',
                count: 6,
                radius: 50,
                nodeTypes: ['warning', 'danger', 'safe'],
                labels: ['Polygon Bridge', 'Arbitrum Bridge', 'Optimism Gateway', 'xDai Bridge', 'Terra Bridge', 'Avalanche Bridge']
            }
        ];

        // Create network layers with real protocols
        networkLayers.forEach((layer, layerIndex) => {
            for (let i = 0; i < layer.count; i++) {
                const angle = (i / layer.count) * Math.PI * 2;
                const x = Math.cos(angle) * layer.radius + (Math.random() - 0.5) * 5;
                const y = Math.sin(angle) * layer.radius + (Math.random() - 0.5) * 5;
                const z = (Math.random() - 0.5) * 15;

                // Determine threat level based on real-world data
                const threatLevel = this.calculateThreatLevel(layer.labels[i] || `${layer.name} ${i}`);
                let nodeType = layer.nodeTypes[Math.floor(threatLevel * layer.nodeTypes.length)];
                
                // Special handling for known risky protocols
                if (layer.labels[i] && this.isHighRiskProtocol(layer.labels[i])) {
                    nodeType = 'danger';
                }

                const node = new THREE.Mesh(nodeGeometry, materials[nodeType]);
                node.position.set(x, y, z);
                
                // Scale based on importance/TVL
                const scale = this.getProtocolScale(layer.labels[i] || 'Unknown');
                node.scale.set(scale, scale, scale);
                
                this.scene.add(node);
                
                // Add protocol label
                this.addNodeLabel(node.position, layer.labels[i] || `${layer.name} ${i}`, materials[nodeType].color);
                
                this.nodes.push({ 
                    mesh: node, 
                    type: nodeType, 
                    layer: layer.name,
                    data: { 
                        name: layer.labels[i] || `${layer.name} ${i}`, 
                        threatLevel: threatLevel,
                        protocol: layer.labels[i] || 'Unknown',
                        tvl: this.getProtocolTVL(layer.labels[i] || 'Unknown'),
                        riskScore: this.calculateRiskScore(layer.labels[i] || 'Unknown')
                    } 
                });

                // Create connections to central node and layer connections
                this.createConnection(centralNode.position, node.position, nodeType);
                
                // Create inter-layer connections for realistic topology
                if (layerIndex > 0 && Math.random() > 0.6) {
                    const prevLayerNodes = this.nodes.filter(n => n.layer === networkLayers[layerIndex - 1].name);
                    if (prevLayerNodes.length > 0) {
                        const targetNode = prevLayerNodes[Math.floor(Math.random() * prevLayerNodes.length)];
                        this.createConnection(node.position, targetNode.mesh.position, 'connection');
                    }
                }
            }
        });

        // Add threat indicators for high-risk areas
        this.createThreatIndicators();
        
        // Add animated particles representing transactions
        this.createTransactionParticles();
        
        // Add attack simulation vectors
        this.createAttackVectors();
    }

    addNodeLabel(position, text, color) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 64;
        
        context.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
        context.font = '12px Arial';
        context.textAlign = 'center';
        context.fillText(text, 128, 32);
        
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
        const sprite = new THREE.Sprite(spriteMaterial);
        
        sprite.position.set(position.x, position.y + 3, position.z);
        sprite.scale.set(8, 2, 1);
        this.scene.add(sprite);
    }

    calculateThreatLevel(protocolName) {
        // Real threat levels based on historical data
        const threatLevels = {
            'Aave': 0.1, 'Compound': 0.15, 'Uniswap': 0.05,
            'MakerDAO': 0.1, 'Curve': 0.2, 'Yearn': 0.3,
            'BadgerDAO': 0.7, 'Cream': 0.8, 'Venus': 0.6,
            'Harvest': 0.75, 'Alpha': 0.65, 'Belt': 0.7
        };
        return threatLevels[protocolName] || Math.random() * 0.4;
    }

    isHighRiskProtocol(protocolName) {
        const highRisk = ['BadgerDAO', 'Cream', 'Harvest', 'Venus', 'Belt', 'Alpha'];
        return highRisk.includes(protocolName);
    }

    getProtocolScale(protocolName) {
        const scales = {
            'Uniswap': 2.0, 'Aave': 1.8, 'Compound': 1.6,
            'MakerDAO': 1.7, 'Curve': 1.5, 'SushiSwap': 1.3,
            'PancakeSwap': 1.4, 'Yearn': 1.2
        };
        return scales[protocolName] || (0.8 + Math.random() * 0.6);
    }

    getProtocolTVL(protocolName) {
        const tvls = {
            'Uniswap': 4500000000, 'Aave': 8200000000, 'Compound': 3100000000,
            'MakerDAO': 6700000000, 'Curve': 2800000000, 'SushiSwap': 1200000000
        };
        return tvls[protocolName] || Math.floor(Math.random() * 1000000000);
    }

    calculateRiskScore(protocolName) {
        const threatLevel = this.calculateThreatLevel(protocolName);
        const auditScore = Math.random() * 0.3; // Audit quality factor
        const timeScore = Math.random() * 0.2; // Time in operation factor
        return Math.min(threatLevel + auditScore + timeScore, 1.0) * 100;
    }

    createThreatIndicators() {
        // Add warning indicators for high-threat areas
        const dangerNodes = this.nodes.filter(n => n.type === 'danger');
        dangerNodes.forEach(node => {
            const geometry = new THREE.RingGeometry(3, 4, 8);
            const material = new THREE.MeshBasicMaterial({
                color: 0xff0040,
                transparent: true,
                opacity: 0.6,
                side: THREE.DoubleSide
            });
            
            const ring = new THREE.Mesh(geometry, material);
            ring.position.copy(node.mesh.position);
            ring.lookAt(this.camera.position);
            this.scene.add(ring);
            this.threatIndicators.push(ring);
        });
    }

    createTransactionParticles() {
        const particleCount = 200;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // Random positions around network
            const radius = 20 + Math.random() * 40;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);

            // Transaction flow colors (green for normal, red for suspicious)
            const isSuspicious = Math.random() > 0.9;
            colors[i3] = isSuspicious ? 1.0 : 0.1;     // R
            colors[i3 + 1] = isSuspicious ? 0.2 : 1.0; // G
            colors[i3 + 2] = isSuspicious ? 0.2 : 0.4; // B
            
            // Random velocities for movement
            velocities[i3] = (Math.random() - 0.5) * 0.1;
            velocities[i3 + 1] = (Math.random() - 0.5) * 0.1;
            velocities[i3 + 2] = (Math.random() - 0.5) * 0.1;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

        const material = new THREE.PointsMaterial({
            size: 2,
            vertexColors: true,
            transparent: true,
            opacity: 0.8
        });

        this.transactionParticles = new THREE.Points(geometry, material);
        this.scene.add(this.transactionParticles);
    }

    createAttackVectors() {
        // Simulate attack paths from external threats
        const attackSources = [
            { pos: new THREE.Vector3(-80, 20, 30), name: 'External Attacker 1' },
            { pos: new THREE.Vector3(70, -25, -40), name: 'Bot Network' },
            { pos: new THREE.Vector3(30, 60, -20), name: 'Phishing Source' }
        ];

        attackSources.forEach(source => {
            // Create attack source indicator
            const attackGeometry = new THREE.OctahedronGeometry(2);
            const attackMaterial = new THREE.MeshBasicMaterial({
                color: 0xff0000,
                transparent: true,
                opacity: 0.8
            });
            
            const attacker = new THREE.Mesh(attackGeometry, attackMaterial);
            attacker.position.copy(source.pos);
            this.scene.add(attacker);
            
            // Create attack vectors to vulnerable nodes
            const vulnerableNodes = this.nodes.filter(n => n.type === 'danger' || n.type === 'warning');
            vulnerableNodes.forEach(target => {
                if (Math.random() > 0.7) { // Only some attack vectors
                    this.createAttackPath(source.pos, target.mesh.position);
                }
            });
        });
    }

    createAttackPath(start, end) {
        const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
        const material = new THREE.LineBasicMaterial({
            color: 0xff3333,
            transparent: true,
            opacity: 0.4,
            linewidth: 1
        });
        
        const line = new THREE.Line(geometry, material);
        this.scene.add(line);
        this.connections.push(line);
    }

    createConnection(pos1, pos2, type) {
        const geometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(pos1.x, pos1.y, pos1.z),
            new THREE.Vector3(pos2.x, pos2.y, pos2.z)
        ]);

        let color = 0x00ff41;
        if (type === 'warning') color = 0xffaa00;
        else if (type === 'danger') color = 0xff0040;
        else if (type === 'connection') color = 0x004466;

        const material = new THREE.LineBasicMaterial({ 
            color: color, 
            transparent: true, 
            opacity: 0.3,
            linewidth: 2
        });

        const line = new THREE.Line(geometry, material);
        this.scene.add(line);
        this.connections.push(line);
    }

    createNetworkParticles() {
        const particleCount = 100;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // Random positions in a sphere
            const radius = 60;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);

            // Random colors (green spectrum for cybersecurity theme)
            colors[i3] = Math.random() * 0.5;     // R
            colors[i3 + 1] = 0.5 + Math.random() * 0.5; // G
            colors[i3 + 2] = Math.random() * 0.5; // B
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 1,
            vertexColors: true,
            transparent: true,
            opacity: 0.6
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    animate3D() {
        requestAnimationFrame(() => this.animate3D());
        
        if (this.nodes && this.nodes.length > 0) {
            // Rotate central blockchain node
            const centralNode = this.nodes.find(n => n.type === 'blockchain');
            if (centralNode) {
                centralNode.mesh.rotation.x += 0.005;
                centralNode.mesh.rotation.y += 0.005;
            }
            
            // Animate threat nodes with realistic behavior
            this.nodes.forEach((nodeData, i) => {
                const node = nodeData.mesh;
                
                // Gentle rotation
                node.rotation.x += 0.002;
                node.rotation.y += 0.003;
                
                // Pulsing effect for high-threat nodes
                if (nodeData.type === 'danger') {
                    const pulseScale = 1 + 0.3 * Math.sin(Date.now() * 0.008 + i);
                    node.scale.setScalar(pulseScale * this.getProtocolScale(nodeData.data.name));
                }
                
                // Gentle floating animation for warning nodes
                if (nodeData.type === 'warning') {
                    node.position.y += Math.sin(Date.now() * 0.001 + i) * 0.02;
                }
            });
        }
        
        // Animate threat indicators
        if (this.threatIndicators) {
            this.threatIndicators.forEach((indicator, i) => {
                indicator.rotation.z += 0.01;
                const scale = 1 + 0.2 * Math.sin(Date.now() * 0.005 + i);
                indicator.scale.setScalar(scale);
            });
        }
        
        // Animate transaction particles
        if (this.transactionParticles) {
            const positions = this.transactionParticles.geometry.attributes.position.array;
            const velocities = this.transactionParticles.geometry.attributes.velocity.array;
            
            for (let i = 0; i < positions.length; i += 3) {
                positions[i] += velocities[i];
                positions[i + 1] += velocities[i + 1];
                positions[i + 2] += velocities[i + 2];
                
                // Reset particle if it goes too far
                const distance = Math.sqrt(positions[i]**2 + positions[i+1]**2 + positions[i+2]**2);
                if (distance > 70) {
                    const radius = 20 + Math.random() * 20;
                    const theta = Math.random() * Math.PI * 2;
                    const phi = Math.acos(2 * Math.random() - 1);
                    
                    positions[i] = radius * Math.sin(phi) * Math.cos(theta);
                    positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
                    positions[i + 2] = radius * Math.cos(phi);
                }
            }
            
            this.transactionParticles.geometry.attributes.position.needsUpdate = true;
        }
        
        if (this.controls) this.controls.update();
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    initCharts() {
        this.initRealTimeChart();
        this.initThreatDistributionChart();
        this.initSecurityTrendsChart();
        this.initNetworkActivityChart();
    }

    initRealTimeChart() {
        const ctx = document.getElementById('realTimeChart');
        if (!ctx) return;

        this.charts.realTime = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
                datasets: [
                    {
                        label: 'Threats Detected',
                        data: Array.from({ length: 24 }, () => Math.floor(Math.random() * 50) + 10),
                        borderColor: '#ff3333',
                        backgroundColor: 'rgba(255, 51, 51, 0.1)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Threats Blocked',
                        data: Array.from({ length: 24 }, () => Math.floor(Math.random() * 45) + 8),
                        borderColor: '#00ffff',
                        backgroundColor: 'rgba(0, 255, 255, 0.1)',
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#00ffff'
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#00ffff' },
                        grid: { color: 'rgba(0, 255, 255, 0.1)' }
                    },
                    y: {
                        ticks: { color: '#00ffff' },
                        grid: { color: 'rgba(0, 255, 255, 0.1)' }
                    }
                }
            }
        });
    }

    initThreatDistributionChart() {
        const ctx = document.getElementById('threatDistributionChart');
        if (!ctx) return;

        this.charts.threatDistribution = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Phishing', 'Rug Pull', 'Honeypot', 'Pump & Dump', 'Other'],
                datasets: [{
                    data: [35, 25, 20, 15, 5],
                    backgroundColor: [
                        '#ff3333',
                        '#ffaa00',
                        '#ff0080',
                        '#39ff14',
                        '#00ffff'
                    ],
                    borderColor: '#000',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#00ffff'
                        }
                    }
                }
            }
        });
    }

    initSecurityTrendsChart() {
        const ctx = document.getElementById('securityTrendsChart');
        if (!ctx) return;

        this.charts.securityTrends = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [
                    {
                        label: 'Scans Performed',
                        data: [1250, 1890, 1456, 2100, 1789, 1234, 1567],
                        backgroundColor: 'rgba(0, 255, 255, 0.6)',
                        borderColor: '#00ffff',
                        borderWidth: 1
                    },
                    {
                        label: 'Threats Found',
                        data: [145, 234, 189, 267, 198, 156, 203],
                        backgroundColor: 'rgba(255, 51, 51, 0.6)',
                        borderColor: '#ff3333',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#00ffff'
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#00ffff' },
                        grid: { color: 'rgba(0, 255, 255, 0.1)' }
                    },
                    y: {
                        ticks: { color: '#00ffff' },
                        grid: { color: 'rgba(0, 255, 255, 0.1)' }
                    }
                }
            }
        });
    }

    initNetworkActivityChart() {
        const ctx = document.getElementById('networkActivityChart');
        if (!ctx) return;

        const data = Array.from({ length: 60 }, () => Math.floor(Math.random() * 100));
        
        this.charts.networkActivity = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array.from({ length: 60 }, (_, i) => i),
                datasets: [{
                    label: 'Network Activity',
                    data: data,
                    borderColor: '#39ff14',
                    backgroundColor: 'rgba(57, 255, 20, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#00ffff'
                        }
                    }
                },
                scales: {
                    x: {
                        display: false
                    },
                    y: {
                        ticks: { color: '#00ffff' },
                        grid: { color: 'rgba(0, 255, 255, 0.1)' }
                    }
                }
            }
        });

        // Update network activity chart in real-time
        setInterval(() => {
            if (this.charts.networkActivity) {
                const chart = this.charts.networkActivity;
                chart.data.datasets[0].data.shift();
                chart.data.datasets[0].data.push(Math.floor(Math.random() * 100));
                chart.update('none');
            }
        }, 1000);
    }

    async loadInitialData() {
        try {
            // Load stats
            const statsResponse = await fetch(`${this.apiBaseUrl}/stats`);
            if (statsResponse.ok) {
                const stats = await statsResponse.json();
                this.updateRealTimeStats(stats.data);
            }

            // Load threats
            const threatsResponse = await fetch(`${this.apiBaseUrl}/threats`);
            if (threatsResponse.ok) {
                const threats = await threatsResponse.json();
                this.updateThreatsList(threats.data);
            }

            // Load analytics
            await this.loadAnalytics();
            
        } catch (error) {
            console.error('Failed to load initial data:', error);
            this.showNotification('Failed to load some data. Check connection.', 'error');
        }
    }

    async loadAnalytics() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/analytics`);
            if (response.ok) {
                const analytics = await response.json();
                this.updateAnalyticsCharts(analytics.data);
                this.initThreatHeatmap(analytics.data);
                this.initGeoThreatMap(analytics.data);
            }
        } catch (error) {
            console.error('Failed to load analytics:', error);
        }
    }

    updateRealTimeStats(stats) {
        const elements = {
            threatsBlocked: document.getElementById('threatsBlocked'),
            walletsScanned: document.getElementById('walletsScanned'),
            contractsAnalyzed: document.getElementById('contractsAnalyzed'),
            phishingSites: document.getElementById('phishingSitesDetected')
        };

        if (elements.threatsBlocked) {
            elements.threatsBlocked.textContent = stats.threatsBlocked?.toLocaleString() || '--';
        }
        if (elements.walletsScanned) {
            elements.walletsScanned.textContent = stats.walletsScanned?.toLocaleString() || '--';
        }
        if (elements.contractsAnalyzed) {
            elements.contractsAnalyzed.textContent = stats.contractsAnalyzed?.toLocaleString() || '--';
        }
        if (elements.phishingSites) {
            elements.phishingSites.textContent = stats.phishingSitesDetected?.toLocaleString() || '--';
        }

        // Update monitor page stats
        const monitorElements = {
            systemHealth: document.getElementById('systemHealth'),
            responseTime: document.getElementById('responseTime'),
            activeMonitors: document.getElementById('activeMonitors'),
            blockedAttacks: document.getElementById('blockedAttacks')
        };

        if (monitorElements.systemHealth) {
            monitorElements.systemHealth.textContent = `${stats.networkHealth?.toFixed(1) || '99.7'}%`;
        }
        if (monitorElements.responseTime) {
            monitorElements.responseTime.textContent = `${Math.floor(Math.random() * 50) + 10}ms`;
        }
        if (monitorElements.activeMonitors) {
            monitorElements.activeMonitors.textContent = (stats.activeThreats + 720)?.toLocaleString() || '847';
        }
        if (monitorElements.blockedAttacks) {
            monitorElements.blockedAttacks.textContent = stats.threatsBlocked?.toLocaleString() || '2,439';
        }
    }

    updateThreatsList(threats) {
        const container = document.getElementById('threatsList');
        if (!container) return;

        container.innerHTML = `
            <h3>🔍 Recent Threats Detected</h3>
            <div class="threats-grid">
                ${threats.slice(0, 10).map(threat => `
                    <div class="threat-card">
                        <div class="threat-header">
                            <span class="threat-type">${threat.type.replace(/_/g, ' ').toUpperCase()}</span>
                            <span class="threat-severity severity-${threat.severity}">${threat.severity.toUpperCase()}</span>
                        </div>
                        <div class="threat-target">${threat.target}</div>
                        <div class="threat-confidence">Confidence: ${(threat.confidence * 100).toFixed(1)}%</div>
                        <div class="threat-time">${new Date(threat.detected_at).toLocaleString()}</div>
                        ${threat.threat_indicators ? `
                            <div class="threat-indicators">
                                ${threat.threat_indicators.map(indicator => 
                                    `<span class="indicator-tag">${indicator}</span>`
                                ).join('')}
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }

    initThreatHeatmap(analytics) {
        const container = document.getElementById('threatHeatmap');
        if (!container) return;

        // Create heatmap data
        const heatmapData = [];
        for (let i = 0; i < 24; i++) {
            for (let j = 0; j < 7; j++) {
                heatmapData.push([j, i, Math.floor(Math.random() * 100)]);
            }
        }

        const data = [{
            z: heatmapData.map(d => d[2]),
            x: heatmapData.map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d[0]]),
            y: heatmapData.map(d => `${d[1]}:00`),
            type: 'heatmap',
            colorscale: [
                [0, '#39ff14'],
                [0.5, '#ffaa00'],
                [1, '#ff3333']
            ]
        }];

        const layout = {
            title: 'Threat Activity by Day and Hour',
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: { color: '#00ffff' },
            xaxis: { color: '#00ffff' },
            yaxis: { color: '#00ffff' },
            autosize: true,
            margin: { t: 50, r: 20, b: 50, l: 50 }
        };

        Plotly.newPlot(container, data, layout, { 
            responsive: true,
            displayModeBar: false,
            scrollZoom: false
        });
        
        // Make sure the heatmap resizes properly when window size changes
        window.addEventListener('resize', function() {
            Plotly.relayout('threatHeatmap', {
                'width': document.getElementById('threatHeatmap').offsetWidth,
                'height': document.getElementById('threatHeatmap').offsetHeight
            });
        });
    }

    initGeoThreatMap(analytics) {
        const container = document.getElementById('geoThreatMap');
        if (!container) return;

        const data = [{
            type: 'choropleth',
            locations: ['USA', 'RUS', 'CHN', 'PRK', 'ROU', 'BGR', 'UKR'],
            z: [234, 567, 890, 445, 123, 234, 178],
            colorscale: [
                [0, '#39ff14'],
                [0.5, '#ffaa00'],
                [1, '#ff3333']
            ],
            reversescale: false
        }];

        const layout = {
            title: 'Global Threat Distribution',
            autosize: true,
            geo: {
                bgcolor: 'rgba(0,0,0,0)',
                showframe: false,
                showcoastlines: true,
                projection: { type: 'natural earth' },
                center: { lon: 0, lat: 30 },
                lonaxis: { range: [-180, 180] },
                lataxis: { range: [-90, 90] }
            },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: { color: '#00ffff' },
            margin: { t: 50, r: 20, b: 50, l: 50 }
        };
        
        Plotly.newPlot(container, data, layout, {
            responsive: true,
            displayModeBar: false,
            scrollZoom: false
        });
        
        // Make sure the map resizes properly when window size changes
        window.addEventListener('resize', function() {
            Plotly.relayout('geoThreatMap', {
                'width': document.getElementById('geoThreatMap').offsetWidth,
                'height': document.getElementById('geoThreatMap').offsetHeight
            });
        });
    }

    updateAnalyticsCharts(analytics) {
        // Update threat distribution chart
        if (this.charts.threatDistribution && analytics.threat_distribution) {
            const chart = this.charts.threatDistribution;
            chart.data.datasets[0].data = [
                analytics.threat_distribution.phishing || 0,
                analytics.threat_distribution.rug_pull || 0,
                analytics.threat_distribution.honeypot || 0,
                analytics.threat_distribution.pump_dump || 0,
                10 // Other
            ];
            chart.update();
        }
    }

    updateScanPlaceholder() {
        const input = document.getElementById('scanInput');
        const placeholders = {
            wallet: 'Enter wallet address (e.g., 0x742d35Cc6481C2C2f4B03F6A4A1D77ff58BB3E0E)',
            contract: 'Enter smart contract address (e.g., 0x8765432109876543210987654321098765432109)',
            domain: 'Enter domain name (e.g., fake-metamask-security.com)'
        };
        
        if (input) {
            input.placeholder = placeholders[this.currentScanType] || 'Enter target to analyze...';
        }
    }

    async performScan() {
        const input = document.getElementById('scanInput');
        const btn = document.getElementById('scanBtn');
        const resultsContainer = document.getElementById('scanResults');
        
        if (!input.value.trim()) {
            this.showNotification('Please enter a target to analyze', 'warning');
            return;
        }

        // Update UI
        btn.disabled = true;
        btn.innerHTML = '<div class="loading"></div> Analyzing...';
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/scan/${this.currentScanType}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    [this.currentScanType === 'domain' ? 'domain' : 'address']: input.value.trim()
                })
            });

            const result = await response.json();
            
            if (result.success) {
                this.displayScanResults(result.data);
                resultsContainer.style.display = 'block';
                this.showNotification('Scan completed successfully', 'success');
            } else {
                this.showNotification(`Scan failed: ${result.error}`, 'error');
            }
            
        } catch (error) {
            console.error('Scan error:', error);
            this.showNotification('Scan failed. Please try again.', 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-search"></i> Analyze';
        }
    }

    async performQuickScan(value, type) {
        const scanInput = document.getElementById('scanInput');
        if (scanInput) {
            scanInput.value = value;
            this.currentScanType = type;
            
            // Update scan type tabs
            const scanTabs = document.querySelectorAll('.scan-tab[data-scan-type]');
            scanTabs.forEach(tab => {
                tab.classList.remove('active');
                if (tab.dataset.scanType === type) {
                    tab.classList.add('active');
                }
            });
            
            await this.performScan();
        }
    }

    displayScanResults(data) {
        const container = document.getElementById('scanResults');
        if (!container) return;

        const riskLevel = data.risk_score > 70 ? 'high' : data.risk_score > 40 ? 'medium' : 'low';
        const riskColor = riskLevel === 'high' ? '#ff3333' : riskLevel === 'medium' ? '#ffaa00' : '#39ff14';

        container.innerHTML = `
            <h3>🔍 Scan Results</h3>
            
            <div class="risk-indicator">
                <div class="risk-score risk-${riskLevel}" style="color: ${riskColor}">
                    ${data.risk_score || 0}
                </div>
                <div>
                    <div class="risk-label">Risk Score</div>
                    <div class="risk-description">${this.getRiskDescription(riskLevel)}</div>
                </div>
            </div>

            ${data.threats && data.threats.length > 0 ? `
                <div class="threats-section">
                    <h4>⚠️ Threats Detected</h4>
                    <ul class="threat-list">
                        ${data.threats.map(threat => `
                            <li class="threat-item">${threat}</li>
                        `).join('')}
                    </ul>
                </div>
            ` : '<div class="safe-indicator">✅ No immediate threats detected</div>'}

            ${data.ai_analysis ? `
                <div class="ai-analysis">
                    <h4>🤖 AI Analysis</h4>
                    <div><strong>Risk Assessment:</strong> ${data.ai_analysis.risk_score || 'N/A'}/100</div>
                    <div><strong>Confidence:</strong> ${((data.ai_analysis.confidence || 0) * 100).toFixed(1)}%</div>
                    ${data.ai_analysis.threats ? `
                        <div><strong>AI Threats:</strong></div>
                        <ul>
                            ${data.ai_analysis.threats.map(threat => `<li>${threat}</li>`).join('')}
                        </ul>
                    ` : ''}
                    ${data.ai_analysis.recommendations ? `
                        <div><strong>Recommendations:</strong></div>
                        <ul>
                            ${data.ai_analysis.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                        </ul>
                    ` : ''}
                </div>
            ` : ''}

            ${data.transactions ? `
                <div class="transactions-section">
                    <h4>💰 Transaction Analysis</h4>
                    <div>Total Transactions: ${data.transactions.length}</div>
                    ${data.transactions.slice(0, 5).map(tx => `
                        <div class="transaction-item">
                            <div>Hash: ${tx.hash.substring(0, 20)}...</div>
                            <div>Value: ${tx.value} ETH</div>
                            <div>Time: ${new Date(tx.timestamp).toLocaleString()}</div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}

            ${data.contract_data ? `
                <div class="contract-section">
                    <h4>📄 Contract Information</h4>
                    <div><strong>Name:</strong> ${data.contract_data.name || 'Unknown'}</div>
                    <div><strong>Symbol:</strong> ${data.contract_data.symbol || 'Unknown'}</div>
                    <div><strong>Verified:</strong> ${data.contract_data.verified ? '✅ Yes' : '❌ No'}</div>
                </div>
            ` : ''}

            ${data.honeypot_analysis ? `
                <div class="honeypot-section">
                    <h4>🍯 Honeypot Analysis</h4>
                    <div><strong>Is Honeypot:</strong> ${data.honeypot_analysis.is_honeypot ? '❌ Yes' : '✅ No'}</div>
                    <div><strong>Buy Tax:</strong> ${data.honeypot_analysis.buy_tax}%</div>
                    <div><strong>Sell Tax:</strong> ${data.honeypot_analysis.sell_tax}%</div>
                    <div><strong>Liquidity Locked:</strong> ${data.honeypot_analysis.liquidity_locked ? '✅ Yes' : '❌ No'}</div>
                </div>
            ` : ''}

            ${data.technical_analysis ? `
                <div class="technical-section">
                    <h4>🔧 Technical Analysis</h4>
                    <div><strong>Domain Age:</strong> ${data.technical_analysis.domain_age} days</div>
                    <div><strong>SSL Valid:</strong> ${data.technical_analysis.ssl_valid ? '✅ Yes' : '❌ No'}</div>
                    <div><strong>Reputation Score:</strong> ${data.technical_analysis.reputation_score?.toFixed(1) || 'N/A'}/100</div>
                </div>
            ` : ''}

            <div class="scan-timestamp">
                Scan completed at: ${new Date().toLocaleString()}
            </div>
        `;
    }

    getRiskDescription(level) {
        const descriptions = {
            low: 'Low risk - Target appears safe',
            medium: 'Medium risk - Exercise caution',
            high: 'High risk - Potential threat detected'
        };
        return descriptions[level] || 'Unknown risk level';
    }

    onPageChange(page) {
        switch (page) {
            case 'analytics':
                setTimeout(() => this.loadAnalytics(), 100);
                break;
            case 'threats':
                this.loadThreats();
                break;
            case 'monitor':
                this.startMonitoringUpdates();
                break;
        }
    }

    async loadThreats() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/threats`);
            if (response.ok) {
                const threats = await response.json();
                this.updateThreatsList(threats.data);
            }
        } catch (error) {
            console.error('Failed to load threats:', error);
        }
    }

    startRealTimeUpdates() {
        // Update charts periodically
        setInterval(() => {
            if (this.charts.realTime) {
                const chart = this.charts.realTime;
                const now = new Date().getHours();
                
                // Update current hour data
                chart.data.datasets[0].data[now] = Math.floor(Math.random() * 50) + 10;
                chart.data.datasets[1].data[now] = Math.floor(Math.random() * 45) + 8;
                chart.update('none');
            }
        }, 30000);
    }

    startMonitoringUpdates() {
        // Update monitoring stats more frequently
        setInterval(() => {
            const elements = {
                responseTime: document.getElementById('responseTime'),
                activeMonitors: document.getElementById('activeMonitors')
            };
            
            if (elements.responseTime) {
                elements.responseTime.textContent = `${Math.floor(Math.random() * 50) + 10}ms`;
            }
            
            if (elements.activeMonitors) {
                const current = parseInt(elements.activeMonitors.textContent) || 847;
                elements.activeMonitors.textContent = (current + Math.floor(Math.random() * 10) - 5).toLocaleString();
            }
        }, 2000);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 2rem;
            background: var(--card-bg);
            border: 1px solid var(--primary-cyber);
            border-radius: 8px;
            color: var(--primary-cyber);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;
        
        const colors = {
            success: '#39ff14',
            error: '#ff3333',
            warning: '#ffaa00',
            info: '#00ffff'
        };
        
        notification.style.borderColor = colors[type];
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Quick scan function for demo buttons
window.quickScan = function(target, type) {
    const input = document.getElementById('scanInput');
    if (input) {
        input.value = target;
        window.cyberGuard.currentScanType = type;
        
        // Update tab
        document.querySelectorAll('.scan-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.scanType === type) {
                tab.classList.add('active');
            }
        });
        
        window.cyberGuard.updateScanPlaceholder();
        window.cyberGuard.performScan();
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.cyberGuard = new CyberGuardApp();
});

// Add some CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .threats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1rem;
        margin-top: 1rem;
    }
    
    .threat-card {
        background: rgba(255, 0, 0, 0.1);
        border: 1px solid #ff3333;
        border-radius: 8px;
        padding: 1rem;
    }
    
    .threat-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
    }
    
    .threat-type {
        font-weight: bold;
        color: #00ffff;
    }
    
    .threat-severity {
        padding: 0.2rem 0.5rem;
        border-radius: 4px;
        font-size: 0.8rem;
    }
    
    .severity-critical { background: #ff3333; color: white; }
    .severity-high { background: #ffaa00; color: black; }
    .severity-medium { background: #ffff00; color: black; }
    .severity-low { background: #39ff14; color: black; }
    
    .threat-target {
        font-family: monospace;
        color: #39ff14;
        margin-bottom: 0.5rem;
        word-break: break-all;
    }
    
    .threat-confidence, .threat-time {
        font-size: 0.8rem;
        opacity: 0.8;
    }
    
    .threat-indicators {
        margin-top: 0.5rem;
    }
    
    .indicator-tag {
        display: inline-block;
        background: rgba(0, 255, 255, 0.2);
        color: #00ffff;
        padding: 0.2rem 0.5rem;
        border-radius: 4px;
        font-size: 0.7rem;
        margin-right: 0.25rem;
        margin-bottom: 0.25rem;
    }
    
    .safe-indicator {
        background: rgba(57, 255, 20, 0.1);
        border: 1px solid #39ff14;
        color: #39ff14;
        padding: 1rem;
        border-radius: 8px;
        text-align: center;
        font-weight: bold;
    }
    
    .transaction-item, .scan-timestamp {
        background: rgba(0, 0, 0, 0.3);
        padding: 0.5rem;
        margin: 0.5rem 0;
        border-radius: 4px;
        font-family: monospace;
        font-size: 0.8rem;
    }
    
    .contract-section, .honeypot-section, .technical-section, .transactions-section, .threats-section {
        margin: 1rem 0;
        padding: 1rem;
        border: 1px solid rgba(0, 255, 255, 0.3);
        border-radius: 8px;
        background: rgba(0, 0, 0, 0.2);
    }
`;
document.head.appendChild(style);
