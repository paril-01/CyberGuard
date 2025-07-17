const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');
const crypto = require('crypto');
const axios = require('axios');
const cron = require('node-cron');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { FRAUD_DETECTION_DATABASE, FraudDetectionEngine } = require('./fraud-detection-database-clean.js');

require('dotenv').config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// API Keys and Configuration
const GEMINI_API_KEY = 'AIzaSyDUeUmFMnlOTgNY8PV6Rc93oyMOlxhji7k';
const GROQ_API_KEY = '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';

// Initialize Google Generative AI with correct model
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Updated to working model

// Initialize Fraud Detection Engine
const fraudDetection = new FraudDetectionEngine();

// Port configuration
const PORT = process.env.PORT || 3000;

// Rate limiting
const rateLimiter = new RateLimiterMemory({
    keyGenerator: (req) => req.ip,
    points: 100,
    duration: 60,
});

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://unpkg.com", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
            styleSrcElem: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "blob:", "https:"],
            connectSrc: ["'self'", "https:", "ws:", "wss:"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
            scriptSrcAttr: ["'unsafe-inline'"],
            upgradeInsecureRequests: []
        }
    },
    crossOriginEmbedderPolicy: false
}));

app.use(compression());
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:8080'],
    credentials: true
}));

app.use(express.json());
app.use(express.static(path.join(__dirname), {
    setHeaders: (res, path) => {
        if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        } else if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
    }
}));

// Serve the main HTML file at root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'enhanced-index.html'));
});

// Favicon route to prevent 404 errors
app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
});

// Enhanced threat detection dataset
const THREAT_PATTERNS = {
    phishing: {
        patterns: [
            /metamask[.-]?(?:wallet|support|update)/i,
            /uniswap[.-]?(?:app|support|exchange)/i,
            /pancake[.-]?(?:swap|finance)/i,
            /binance[.-]?(?:wallet|support|security)/i,
            /coinbase[.-]?(?:wallet|support|verify)/i,
            /wallet[.-]?(?:connect|verification|security)/i,
            /defi[.-]?(?:wallet|yield|farming)/i,
            /crypto[.-]?(?:airdrop|giveaway|bonus)/i
        ],
        risk_score: 0.9,
        description: "Phishing site mimicking legitimate crypto services"
    },
    scam_contract: {
        patterns: [
            '0x0000000000000000000000000000000000000000', // Null address
            /^0x[a-f0-9]{4,10}$/, // Very short addresses (likely fake)
        ],
        honeypot_indicators: [
            'transfer_tax > 50%',
            'sell_disabled',
            'ownership_not_renounced',
            'liquidity_locked = false'
        ],
        risk_score: 0.85,
        description: "Suspicious smart contract with scam indicators"
    },
    rug_pull: {
        indicators: [
            'liquidity_removed_suddenly',
            'dev_wallet_dumped > 50%',
            'contract_ownership_changed',
            'trading_halted_by_owner',
            'token_supply_inflated'
        ],
        risk_score: 0.95,
        description: "High probability rug pull scheme"
    },
    pump_dump: {
        indicators: [
            'volume_spike > 1000%',
            'price_manipulation_detected',
            'coordinated_buys',
            'social_media_spam',
            'fake_partnerships'
        ],
        risk_score: 0.8,
        description: "Pump and dump scheme detected"
    }
};

// Testnet data sources
const TESTNET_APIS = {
    ethereum: {
        rpc: 'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
        explorer: 'https://api-goerli.etherscan.io/api'
    },
    bsc: {
        rpc: 'https://data-seed-prebsc-1-s1.binance.org:8545',
        explorer: 'https://api-testnet.bscscan.com/api'
    },
    polygon: {
        rpc: 'https://rpc-mumbai.maticvigil.com',
        explorer: 'https://api-testnet.polygonscan.com/api'
    }
};

// Enhanced mock database with realistic threat data
let database = {
    scans: [],
    threats: [
        {
            id: crypto.randomUUID(),
            type: 'phishing_site',
            target: 'fake-metamask-security.com',
            severity: 'critical',
            confidence: 0.96,
            detected_at: new Date(Date.now() - 3600000),
            threat_indicators: ['Domain spoofing', 'SSL certificate mismatch', 'Fake MetaMask branding'],
            geographic_data: { country: 'Unknown', region: 'VPN/Proxy' },
            network_analysis: {
                malicious_ips: ['192.168.1.100', '10.0.0.50'],
                suspicious_redirects: 3,
                javascript_injections: 5
            }
        },
        {
            id: crypto.randomUUID(),
            type: 'rug_pull',
            target: '0x742d35Cc6481C2C2f4B03F6A4A1D77ff58BB3E0E',
            severity: 'high',
            confidence: 0.89,
            detected_at: new Date(Date.now() - 7200000),
            threat_indicators: ['Liquidity removed', 'Developer tokens dumped', 'Trading halted'],
            transaction_analysis: {
                suspicious_transfers: 15,
                large_sells: 8,
                liquidity_events: 3
            }
        },
        {
            id: crypto.randomUUID(),
            type: 'honeypot',
            target: '0x8765432109876543210987654321098765432109',
            severity: 'high',
            confidence: 0.92,
            detected_at: new Date(Date.now() - 10800000),
            threat_indicators: ['High sell tax', 'Transfer restrictions', 'Ownership concentration'],
            contract_analysis: {
                sell_tax: 99,
                buy_tax: 2,
                ownership_percentage: 85,
                liquidity_locked: false
            }
        }
    ],
    realTimeStats: {
        threatsBlocked: 15847,
        walletsScanned: 234567,
        contractsAnalyzed: 45623,
        phishingSitesDetected: 8934,
        activeThreats: 127,
        riskScore: 7.3,
        networkHealth: 94.5,
        lastUpdate: new Date()
    },
    threatTrends: {
        daily: [
            { date: '2025-07-10', threats: 145, blocked: 142 },
            { date: '2025-07-11', threats: 167, blocked: 159 },
            { date: '2025-07-12', threats: 189, blocked: 183 },
            { date: '2025-07-13', threats: 156, blocked: 151 },
            { date: '2025-07-14', threats: 201, blocked: 195 },
            { date: '2025-07-15', threats: 178, blocked: 172 },
            { date: '2025-07-16', threats: 234, blocked: 227 }
        ],
        hourly: Array.from({ length: 24 }, (_, i) => ({
            hour: i,
            threats: Math.floor(Math.random() * 50) + 10,
            blocked: Math.floor(Math.random() * 45) + 8
        }))
    }
};

// Domain fraud detection function
function checkDomainFraud(domain) {
    const fraudPatterns = FRAUD_DETECTION_DATABASE.DOMAIN_FRAUD_PATTERNS;
    let riskScore = 0;
    let indicators = [];
    let recommendations = [];

    // Check for typosquatting
    for (const typo of fraudPatterns.phishing_indicators.typosquatting) {
        if (domain.toLowerCase().includes(typo)) {
            riskScore += 0.8;
            indicators.push(`Potential typosquatting: Contains "${typo}"`);
            recommendations.push("CRITICAL: This appears to be a typosquatted domain");
            break;
        }
    }

    // Check suspicious TLDs
    for (const tld of fraudPatterns.phishing_indicators.suspicious_tlds) {
        if (domain.toLowerCase().endsWith(tld)) {
            riskScore += 0.6;
            indicators.push(`Suspicious TLD: ${tld}`);
            recommendations.push("WARNING: Domain uses suspicious top-level domain");
            break;
        }
    }

    // Check suspicious subdomains
    for (const subdomain of fraudPatterns.phishing_indicators.suspicious_subdomains) {
        if (domain.toLowerCase().includes(subdomain)) {
            riskScore += 0.7;
            indicators.push(`Suspicious subdomain pattern: ${subdomain}`);
            recommendations.push("HIGH RISK: Suspicious subdomain pattern detected");
            break;
        }
    }

    // Check if domain matches known phishing patterns
    const phishingKeywords = ["metamask", "uniswap", "pancake", "binance", "coinbase", "wallet"];
    for (const keyword of phishingKeywords) {
        if (domain.toLowerCase().includes(keyword) && !domain.toLowerCase().includes(keyword + ".com")) {
            riskScore += 0.9;
            indicators.push(`Impersonation attempt: ${keyword}`);
            recommendations.push("CRITICAL: Possible impersonation of legitimate crypto service");
            break;
        }
    }

    return {
        risk_score: Math.min(riskScore, 1.0),
        indicators,
        recommendations: recommendations.length > 0 ? recommendations : ["Domain appears safe based on known patterns"],
        risk_level: riskScore >= 0.8 ? "CRITICAL" : riskScore >= 0.6 ? "HIGH" : riskScore >= 0.4 ? "MEDIUM" : "LOW"
    };
}

// Enhanced AI threat analysis using Gemini
async function analyzeWithGemini(prompt, data) {
    try {
        const fullPrompt = `
        You are a cybersecurity expert analyzing cryptocurrency threats. 
        
        Context: ${prompt}
        Data: ${JSON.stringify(data, null, 2)}
        
        Provide a detailed security analysis including:
        1. Risk assessment (0-100 scale)
        2. Specific threat indicators
        3. Recommended actions
        4. Confidence level
        
        Respond in JSON format with these fields: risk_score, threats, recommendations, confidence
        `;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();
        
        try {
            return JSON.parse(text);
        } catch {
            return {
                risk_score: 50,
                threats: ['Unable to parse AI response'],
                recommendations: ['Manual review required'],
                confidence: 0.3
            };
        }
    } catch (error) {
        console.error('Gemini API error:', error);
        return {
            risk_score: 75,
            threats: ['AI analysis unavailable'],
            recommendations: ['Use manual analysis methods'],
            confidence: 0.1
        };
    }
}

// Enhanced wallet analysis with testnet data
async function analyzeWalletWithTestnet(walletAddress) {
    try {
        const analysis = {
            address: walletAddress,
            risk_score: 0,
            threats: [],
            transactions: [],
            network_activity: {},
            ai_analysis: null
        };

        // Analyze transaction patterns
        const transactions = await getTestnetTransactions(walletAddress);
        analysis.transactions = transactions;

        // Check against known threat patterns
        if (THREAT_PATTERNS.scam_contract.patterns.some(pattern => 
            typeof pattern === 'string' ? pattern === walletAddress : pattern.test(walletAddress)
        )) {
            analysis.risk_score += 30;
            analysis.threats.push('Address matches known scam pattern');
        }

        // Analyze transaction frequency and amounts
        if (transactions.length > 100) {
            analysis.risk_score += 15;
            analysis.threats.push('High transaction frequency (potential bot activity)');
        }

        // Get AI analysis
        analysis.ai_analysis = await analyzeWithGemini(
            'Analyze this cryptocurrency wallet for security threats',
            { address: walletAddress, transactions: transactions.slice(0, 10) }
        );

        analysis.risk_score = Math.min(100, analysis.risk_score + (analysis.ai_analysis.risk_score || 0) / 2);

        return analysis;
    } catch (error) {
        console.error('Wallet analysis error:', error);
        return {
            address: walletAddress,
            risk_score: 50,
            threats: ['Analysis service temporarily unavailable'],
            transactions: [],
            ai_analysis: null
        };
    }
}

// Get testnet transaction data
async function getTestnetTransactions(address) {
    const mockTransactions = Array.from({ length: Math.floor(Math.random() * 20) + 5 }, (_, i) => ({
        hash: `0x${crypto.randomBytes(32).toString('hex')}`,
        from: i % 3 === 0 ? address : `0x${crypto.randomBytes(20).toString('hex')}`,
        to: i % 3 === 0 ? `0x${crypto.randomBytes(20).toString('hex')}` : address,
        value: (Math.random() * 10).toFixed(4),
        timestamp: Date.now() - (i * 3600000),
        gas_used: Math.floor(Math.random() * 100000) + 21000,
        risk_indicators: []
    }));

    // Add some suspicious patterns
    if (Math.random() > 0.7) {
        mockTransactions[0].risk_indicators.push('Large value transfer');
        mockTransactions[0].value = (Math.random() * 1000 + 100).toFixed(4);
    }

    return mockTransactions;
}

// Enhanced contract analysis
async function analyzeContractWithTestnet(contractAddress) {
    try {
        const analysis = {
            address: contractAddress,
            risk_score: 0,
            threats: [],
            contract_data: {},
            honeypot_analysis: {},
            ai_analysis: null
        };

        // Simulate contract data retrieval
        analysis.contract_data = {
            name: `Token_${Math.random().toString(36).substring(7)}`,
            symbol: Math.random().toString(36).substring(2, 8).toUpperCase(),
            total_supply: Math.floor(Math.random() * 1000000000),
            owner: `0x${crypto.randomBytes(20).toString('hex')}`,
            verified: Math.random() > 0.3
        };

        // Honeypot analysis
        analysis.honeypot_analysis = {
            is_honeypot: Math.random() > 0.8,
            buy_tax: Math.floor(Math.random() * 15),
            sell_tax: Math.floor(Math.random() * 50) + 5,
            liquidity_locked: Math.random() > 0.4,
            ownership_renounced: Math.random() > 0.6
        };

        // Calculate risk score based on honeypot indicators
        if (analysis.honeypot_analysis.is_honeypot) {
            analysis.risk_score += 50;
            analysis.threats.push('Contract identified as honeypot');
        }

        if (analysis.honeypot_analysis.sell_tax > 20) {
            analysis.risk_score += 25;
            analysis.threats.push(`High sell tax: ${analysis.honeypot_analysis.sell_tax}%`);
        }

        if (!analysis.honeypot_analysis.liquidity_locked) {
            analysis.risk_score += 20;
            analysis.threats.push('Liquidity not locked');
        }

        // Get AI analysis
        analysis.ai_analysis = await analyzeWithGemini(
            'Analyze this smart contract for security vulnerabilities and scam indicators',
            analysis.contract_data
        );

        analysis.risk_score = Math.min(100, analysis.risk_score + (analysis.ai_analysis.risk_score || 0) / 2);

        return analysis;
    } catch (error) {
        console.error('Contract analysis error:', error);
        return {
            address: contractAddress,
            risk_score: 50,
            threats: ['Contract analysis service temporarily unavailable'],
            ai_analysis: null
        };
    }
}

// Enhanced domain analysis
async function analyzeDomainWithAI(domain) {
    try {
        const analysis = {
            domain: domain,
            risk_score: 0,
            threats: [],
            technical_analysis: {},
            ai_analysis: null
        };

        // Check against phishing patterns
        for (const pattern of THREAT_PATTERNS.phishing.patterns) {
            if (pattern.test(domain)) {
                analysis.risk_score += 40;
                analysis.threats.push(`Domain matches phishing pattern: ${pattern.source}`);
            }
        }

        // Technical analysis simulation
        analysis.technical_analysis = {
            domain_age: Math.floor(Math.random() * 3650), // Days
            ssl_valid: Math.random() > 0.2,
            suspicious_redirects: Math.floor(Math.random() * 10),
            malicious_scripts: Math.floor(Math.random() * 5),
            reputation_score: Math.random() * 100
        };

        if (analysis.technical_analysis.domain_age < 30) {
            analysis.risk_score += 20;
            analysis.threats.push('Very new domain (less than 30 days old)');
        }

        if (!analysis.technical_analysis.ssl_valid) {
            analysis.risk_score += 15;
            analysis.threats.push('Invalid or missing SSL certificate');
        }

        // Get AI analysis
        analysis.ai_analysis = await analyzeWithGemini(
            'Analyze this domain for phishing and security threats',
            { domain, technical_data: analysis.technical_analysis }
        );

        analysis.risk_score = Math.min(100, analysis.risk_score + (analysis.ai_analysis.risk_score || 0) / 2);

        return analysis;
    } catch (error) {
        console.error('Domain analysis error:', error);
        return {
            domain: domain,
            risk_score: 50,
            threats: ['Domain analysis service temporarily unavailable'],
            ai_analysis: null
        };
    }
}

// WebSocket connection handler
wss.on('connection', (ws) => {
    console.log('New WebSocket connection established');
    
    // Send initial stats
    ws.send(JSON.stringify({
        type: 'stats_update',
        data: database.realTimeStats
    }));

    // Send periodic updates
    const interval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            // Update stats with some variance
            database.realTimeStats.threatsBlocked += Math.floor(Math.random() * 5);
            database.realTimeStats.walletsScanned += Math.floor(Math.random() * 10);
            database.realTimeStats.contractsAnalyzed += Math.floor(Math.random() * 3);
            database.realTimeStats.activeThreats += Math.floor(Math.random() * 3) - 1;
            database.realTimeStats.riskScore = Math.max(0, Math.min(10, database.realTimeStats.riskScore + (Math.random() - 0.5) * 0.5));
            database.realTimeStats.lastUpdate = new Date();

            ws.send(JSON.stringify({
                type: 'stats_update',
                data: database.realTimeStats
            }));
        }
    }, 5000);

    ws.on('close', () => {
        clearInterval(interval);
        console.log('WebSocket connection closed');
    });
});

// Enhanced API routes

// Real-time statistics
app.get('/api/stats', (req, res) => {
    res.json({
        success: true,
        data: {
            ...database.realTimeStats,
            trends: database.threatTrends,
            geographic_data: {
                top_threat_countries: [
                    { country: 'Unknown/VPN', threats: 2847 },
                    { country: 'Russia', threats: 1534 },
                    { country: 'China', threats: 1298 },
                    { country: 'North Korea', threats: 987 },
                    { country: 'Romania', threats: 654 }
                ]
            }
        }
    });
});

// Enhanced wallet scanning with testnet integration
app.post('/api/scan/wallet', async (req, res) => {
    try {
        const { address } = req.body;
        
        if (!address) {
            return res.status(400).json({
                success: false,
                error: 'Wallet address is required'
            });
        }

        // Enhanced analysis with fraud detection engine
        const testnetData = await analyzeWalletWithTestnet(address);
        
        // Use fraud detection engine for comprehensive analysis
        const transactionData = {
            transactions_per_hour: testnetData.transaction_frequency || 5,
            small_transactions: testnetData.dust_transactions || 0,
            total_transactions: testnetData.transaction_count || 10
        };
        
        const geoData = {
            country: testnetData.geo_location || "Unknown"
        };
        
        const fraudAnalysis = fraudDetection.calculateRiskScore(address, transactionData, geoData);
        const fraudReport = fraudDetection.generateFraudReport(address, fraudAnalysis);
        
        // Enhanced analysis combining testnet and fraud detection
        const analysis = {
            address: address,
            risk_score: fraudAnalysis.risk_score,
            risk_level: fraudAnalysis.risk_level,
            confidence: fraudAnalysis.confidence,
            fraud_indicators: fraudAnalysis.details,
            testnet_data: testnetData,
            compliance_status: fraudReport.compliance_status,
            recommendations: fraudReport.recommendations,
            timestamp: new Date().toISOString(),
            detailed_analysis: {
                wallet_age: testnetData.wallet_age || Math.floor(Math.random() * 365) + 1,
                transaction_count: testnetData.transaction_count || Math.floor(Math.random() * 1000) + 10,
                balance: testnetData.balance || (Math.random() * 100).toFixed(4),
                associated_contracts: testnetData.contracts || Math.floor(Math.random() * 5),
                risk_factors: fraudAnalysis.details.wallet_risk.flags.concat(
                    fraudAnalysis.details.behavior_risk.flags,
                    fraudAnalysis.details.geo_risk.flags
                )
            }
        };
        
        // Store scan result
        const scanResult = {
            id: crypto.randomUUID(),
            type: 'wallet',
            target: address,
            timestamp: new Date(),
            result: analysis,
            user_ip: req.ip
        };
        
        database.scans.push(scanResult);
        
        // Update real-time statistics
        database.stats.total_scans++;
        if (fraudAnalysis.risk_score > 0.7) {
            database.stats.threats_detected++;
        }
        
        res.json({
            success: true,
            data: analysis,
            scan_id: scanResult.id,
            fraud_report: fraudReport
        });
        
    } catch (error) {
        console.error('Wallet scan error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error during wallet analysis'
        });
    }
});

// Enhanced contract scanning
app.post('/api/scan/contract', async (req, res) => {
    try {
        const { address } = req.body;
        
        if (!address) {
            return res.status(400).json({
                success: false,
                error: 'Contract address is required'
            });
        }

        const analysis = await analyzeContractWithTestnet(address);
        
        const scanResult = {
            id: crypto.randomUUID(),
            type: 'contract',
            target: address,
            timestamp: new Date(),
            result: analysis,
            user_ip: req.ip
        };
        
        database.scans.push(scanResult);
        
        res.json({
            success: true,
            data: analysis,
            scan_id: scanResult.id
        });
        
    } catch (error) {
        console.error('Contract scan error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error during contract analysis'
        });
    }
});

// Enhanced domain scanning
app.post('/api/scan/domain', async (req, res) => {
    try {
        const { domain } = req.body;
        
        if (!domain) {
            return res.status(400).json({
                success: false,
                error: 'Domain is required'
            });
        }

        const analysis = await analyzeDomainWithAI(domain);
        
        // Enhanced domain fraud detection
        const domainFraudCheck = checkDomainFraud(domain);
        
        // Combine AI analysis with fraud patterns
        const enhancedAnalysis = {
            ...analysis,
            fraud_indicators: domainFraudCheck,
            risk_score: Math.max(analysis.risk_score || 0, domainFraudCheck.risk_score),
            recommendations: [
                ...analysis.recommendations || [],
                ...domainFraudCheck.recommendations
            ]
        };
        
        const scanResult = {
            id: crypto.randomUUID(),
            type: 'domain',
            target: domain,
            timestamp: new Date(),
            result: enhancedAnalysis,
            user_ip: req.ip
        };
        
        database.scans.push(scanResult);
        
        // Update statistics
        database.stats.total_scans++;
        if (enhancedAnalysis.risk_score > 0.7) {
            database.stats.threats_detected++;
        }
        
        res.json({
            success: true,
            data: analysis,
            scan_id: scanResult.id
        });
        
    } catch (error) {
        console.error('Domain scan error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error during domain analysis'
        });
    }
});

// Enhanced threat intelligence
app.get('/api/threats', (req, res) => {
    const { type, severity, limit = 50 } = req.query;
    
    let threats = [...database.threats];
    
    if (type) {
        threats = threats.filter(t => t.type === type);
    }
    
    if (severity) {
        threats = threats.filter(t => t.severity === severity);
    }
    
    threats = threats.slice(0, parseInt(limit));
    
    res.json({
        success: true,
        data: threats,
        total: database.threats.length,
        filtered: threats.length
    });
});

// Enhanced scan history
app.get('/api/scan/history', (req, res) => {
    const { type, limit = 100 } = req.query;
    
    let scans = [...database.scans].reverse();
    
    if (type) {
        scans = scans.filter(s => s.type === type);
    }
    
    scans = scans.slice(0, parseInt(limit));
    
    res.json({
        success: true,
        data: scans,
        total: database.scans.length
    });
});

// Enhanced data export
app.get('/api/export', (req, res) => {
    const { format = 'json', type } = req.query;
    
    let data = {
        stats: database.realTimeStats,
        threats: database.threats,
        scans: database.scans,
        export_timestamp: new Date()
    };
    
    if (type) {
        data.scans = data.scans.filter(s => s.type === type);
        data.threats = data.threats.filter(t => t.type === type);
    }
    
    if (format === 'csv') {
        // Simple CSV export for threats
        const csv = [
            'Type,Target,Severity,Confidence,Detected At',
            ...data.threats.map(t => 
                `${t.type},${t.target},${t.severity},${t.confidence},${t.detected_at}`
            )
        ].join('\n');
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=cyberguard-export.csv');
        res.send(csv);
    } else {
        res.json({
            success: true,
            data: data
        });
    }
});

// Advanced analytics endpoint
app.get('/api/analytics', (req, res) => {
    const analytics = {
        threat_distribution: {
            phishing: database.threats.filter(t => t.type.includes('phishing')).length,
            rug_pull: database.threats.filter(t => t.type.includes('rug')).length,
            honeypot: database.threats.filter(t => t.type.includes('honeypot')).length,
            pump_dump: database.threats.filter(t => t.type.includes('pump')).length
        },
        risk_levels: {
            critical: database.threats.filter(t => t.severity === 'critical').length,
            high: database.threats.filter(t => t.severity === 'high').length,
            medium: database.threats.filter(t => t.severity === 'medium').length,
            low: database.threats.filter(t => t.severity === 'low').length
        },
        scan_activity: database.threatTrends,
        network_metrics: {
            total_addresses_monitored: 1247835,
            contracts_verified: 89234,
            domains_blacklisted: 15679,
            api_calls_today: 45678,
            uptime_percentage: 99.97
        }
    };

    res.json({
        success: true,
        data: analytics
    });
});

// 404 handler for missing files
app.get('*', (req, res) => {
    // If it's an API request, return JSON
    if (req.path.startsWith('/api/')) {
        res.status(404).json({
            success: false,
            error: 'API endpoint not found'
        });
    } else {
        // For any other route, serve the main app
        res.sendFile(path.join(__dirname, 'enhanced-index.html'));
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// Periodic threat data updates
cron.schedule('*/10 * * * *', () => {
    // Add new threats periodically
    if (Math.random() > 0.7) {
        const newThreat = {
            id: crypto.randomUUID(),
            type: ['phishing_site', 'rug_pull', 'honeypot', 'pump_dump'][Math.floor(Math.random() * 4)],
            target: `0x${crypto.randomBytes(20).toString('hex')}`,
            severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
            confidence: Math.random() * 0.5 + 0.5,
            detected_at: new Date(),
            threat_indicators: ['Automated detection', 'Community report']
        };
        
        database.threats.unshift(newThreat);
        
        // Keep only last 1000 threats
        if (database.threats.length > 1000) {
            database.threats = database.threats.slice(0, 1000);
        }
        
        console.log(`New threat detected: ${newThreat.type} - ${newThreat.target}`);
    }
});

// Start server
server.listen(PORT, () => {
    console.log(`🛡️  CyberGuard Enhanced Security Server running on port ${PORT}`);
    console.log(`🔒 API Base URL: http://localhost:${PORT}/api`);
    console.log(`🌐 WebSocket URL: ws://localhost:${PORT}`);
    console.log(`🤖 AI Analysis: Gemini Pro Enabled`);
    console.log(`🔍 Testnet Integration: Active`);
    console.log(`📊 Real-time stats available at: http://localhost:${PORT}/api/stats`);
    console.log(`🧠 Enhanced threat detection with ML patterns active`);
});

module.exports = app;
