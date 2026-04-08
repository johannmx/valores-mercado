import express from 'express';
import axios from 'axios';
import cors from 'cors';
import fs from 'fs';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';

// Set a default timeout of 10 seconds for all external API requests to prevent hanging connections
axios.defaults.timeout = 10000;

// Security Enhancement: Set maximum response size to 500KB to prevent DoS via memory exhaustion from upstream APIs
axios.defaults.maxContentLength = 500000;
axios.defaults.maxBodyLength = 500000;

const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');
const PORT = process.env.PORT || 3001;
const DATA_DIR = 'data';
const HISTORY_FILE = `${DATA_DIR}/history.json`;

// Security Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://umami.johatech.ar"],
            connectSrc: ["'self'", "https://umami.johatech.ar"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:"],
            fontSrc: ["'self'", "data:"],
            frameAncestors: ["'none'"],
            objectSrc: ["'none'"],
        },
    },
    referrerPolicy: { policy: 'no-referrer-when-downgrade' },
    hsts: { maxAge: 31536000, includeSubDomains: true },
    xContentTypeOptions: true,
}));

app.use((req, res, next) => {
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), browsing-topics=()');
    next();
});
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : false,
    methods: ['GET'],
    allowedHeaders: ['Content-Type']
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' }
});

app.use('/api/', limiter);
app.use(express.json({ limit: '10kb' }));

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// URLs de APIs externas
const DOLAR_API_ARS_URL = 'https://dolarapi.com/v1/dolares';
const DOLAR_API_VES_URL = 'https://ve.dolarapi.com/v1/dolares/paralelo';
const DOLAR_API_VES_OFFICIAL_URL = 'https://ve.dolarapi.com/v1/dolares/oficial';
const DOLAR_API_UYU_URL = 'https://uy.dolarapi.com/v1/cotizaciones/usd';
const DOLAR_API_CLP_URL = 'https://cl.dolarapi.com/v1/cotizaciones/usd';
const DOLAR_API_BRL_URL = 'https://br.dolarapi.com/v1/cotacoes/usd';
const DOLAR_API_UYU_AR_URL = 'https://dolarapi.com/v1/cotizaciones/uyu';
const DOLAR_API_CLP_AR_URL = 'https://dolarapi.com/v1/cotizaciones/clp';
const DOLAR_API_BRL_AR_URL = 'https://dolarapi.com/v1/cotizaciones/brl';
const DOLAR_API_EURO_URL = 'https://dolarapi.com/v1/cotizaciones/eur';
const DOLAR_API_VES_EURO_OFFICIAL_URL = 'https://ve.dolarapi.com/v1/euros/oficial';
const DOLAR_API_VES_EURO_PARALELO_URL = 'https://ve.dolarapi.com/v1/euros/paralelo';
const DOLAR_API_STATUS_URL = 'https://dolarapi.com/v1/estado';
const BINANCE_API_URL = 'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT';

interface MarketData {
    timestamp: string;
    usd_oficial: number;
    usd_blue: number;
    usd_mep: number;
    usd_ccl: number;
    usd_cripto: number;
    usd_tarjeta: number;
    ves_oficial: number;
    ves_paralelo: number;
    ves_eur_oficial: number;
    ves_eur_paralelo: number;
    ves_compra: number;
    uyu_venta: number;
    uyu_compra: number;
    clp_venta: number;
    clp_compra: number;
    brl_venta: number;
    brl_compra: number;
    eur_venta: number;
    eur_compra: number;
    uyu_ar: number;
    clp_ar: number;
    brl_ar: number;
    btc_usd: number;
    changes: {
        usd_oficial_percent: number;
        usd_blue_percent: number;
        ves_oficial_percent: number;
        ves_paralelo_percent: number;
        ves_eur_oficial_percent: number;
        ves_eur_paralelo_percent: number;
        uyu_percent: number;
        clp_percent: number;
        brl_percent: number;
        eur_percent: number;
        uyu_ar_percent: number;
        clp_ar_percent: number;
        brl_ar_percent: number;
        otros_dolares_percents: Record<string, number>;
        bitcoin_percent: number;
    };
    api_status: {
        dolar_api_ar: boolean;
        dolar_api_ve: boolean;
        dolar_api_latam: boolean;
        binance_api: boolean;
    };
}

interface HistoryItem {
    timestamp: string;
    usd_blue: number;
    usd_oficial: number;
    usd_mep: number;
    usd_ccl: number;
    usd_cripto: number;
    usd_tarjeta: number;
    ves_oficial: number;
    ves_paralelo: number;
    ves_eur_oficial: number;
    ves_eur_paralelo: number;
    uyu_venta: number;
    clp_venta: number;
    brl_venta: number;
    eur_venta: number;
    uyu_ar: number;
    clp_ar: number;
    brl_ar: number;
    btc_usd: number;
}

const getVentaByCasa = (data: any[], casa: string): number => {
    return data.find((d: any) => d.casa === casa)?.venta || 0;
};

const calculateChange = (current: number, last: number): number => {
    if (!last || last === 0) return 0;
    return ((current - last) / last) * 100;
};

const generateMockHistory = () => {
    const history: HistoryItem[] = [];
    const today = new Date();
    for (let i = 24; i >= 0; i--) {
        const date = new Date(today);
        date.setHours(today.getHours() - i); 
        const baseAr = 1300 + Math.random() * 50;
        const baseVe = 580 + Math.random() * 20;
        history.push({
            timestamp: date.toISOString(),
            usd_oficial: baseAr - 20,
            usd_blue: baseAr,
            usd_mep: baseAr + 10,
            usd_ccl: baseAr + 20,
            usd_cripto: baseAr + 50,
            usd_tarjeta: baseAr + 30,
            ves_oficial: baseVe,
            ves_paralelo: baseVe + 5,
            ves_eur_oficial: baseVe + 10,
            ves_eur_paralelo: baseVe + 15,
            uyu_venta: 38 + Math.random() * 0.5,
            clp_venta: 950 + Math.random() * 10,
            brl_venta: 5 + Math.random() * 0.1,
            eur_venta: 1100 + Math.random() * 20,
            uyu_ar: 20 + Math.random() * 2,
            clp_ar: 1.2 + Math.random() * 0.2,
            brl_ar: 200 + Math.random() * 20,
            btc_usd: 90000 + Math.random() * 500
        });
    }
    return history;
};

const initializeHistory = () => {
    try {
        // Asegurar que el directorio de datos existe
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
        }

        let shouldReset = false;
        if (!fs.existsSync(HISTORY_FILE)) {
            shouldReset = true;
        } else {
            try {
                const data = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
                if (data.length > 0 && !data[0].usd_oficial) { // Check for new field
                    shouldReset = true;
                }
            } catch (e) {
                shouldReset = true;
            }
        }

        if (shouldReset) {
            fs.writeFileSync(HISTORY_FILE, JSON.stringify(generateMockHistory(), null, 2));
        }
    } catch (error) {
        console.error('CRITICAL: Failed to initialize history file due to permission errors.');
        console.error('Check if the "data" directory is writable by the user running the process.');
        console.error(error);
        // We don't crash here to allow the server to at least start,
        // though some features might fail.
    }
};

const saveCurrentToHistory = async () => {
    try {
        const [arsRes, vesRes, vesOficialRes, uyuRes, clpRes, brlRes, eurRes, uyuArRes, clpArRes, brlArRes, vesEurOficialRes, vesEurParaleloRes, btcRes] = await Promise.all([
            axios.get(DOLAR_API_ARS_URL).catch(e => ({ data: [] })),
            axios.get(DOLAR_API_VES_URL).catch(e => ({ data: {} })),
            axios.get(DOLAR_API_VES_OFFICIAL_URL).catch(e => ({ data: {} })),
            axios.get(DOLAR_API_UYU_URL).catch(e => ({ data: {} })),
            axios.get(DOLAR_API_CLP_URL).catch(e => ({ data: {} })),
            axios.get(DOLAR_API_BRL_URL).catch(e => ({ data: {} })),
            axios.get(DOLAR_API_EURO_URL).catch(e => ({ data: {} })),
            axios.get(DOLAR_API_UYU_AR_URL).catch(e => ({ data: {} })),
            axios.get(DOLAR_API_CLP_AR_URL).catch(e => ({ data: {} })),
            axios.get(DOLAR_API_BRL_AR_URL).catch(e => ({ data: {} })),
            axios.get(DOLAR_API_VES_EURO_OFFICIAL_URL).catch(e => ({ data: {} })),
            axios.get(DOLAR_API_VES_EURO_PARALELO_URL).catch(e => ({ data: {} })),
            axios.get(BINANCE_API_URL).catch(e => ({ data: { price: "0" } }))
        ]);

        const history: HistoryItem[] = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
        
        const arsData = arsRes.data as any[];
        const vesData = vesRes.data as any;
        const vesOficialData = vesOficialRes.data as any;
        const uyuData = uyuRes.data as any;
        const clpData = clpRes.data as any;
        const brlData = brlRes.data as any;
        const eurData = eurRes.data as any;
        const uyuArData = uyuArRes.data as any;
        const clpArData = clpArRes.data as any;
        const brlArData = brlArRes.data as any;
        const vesEurOficialData = vesEurOficialRes.data as any;
        const vesEurParaleloData = vesEurParaleloRes.data as any;
        const btcData = btcRes.data as any;

        const newItem: HistoryItem = {
            timestamp: new Date().toISOString(),
            usd_oficial: getVentaByCasa(arsData, 'oficial'),
            usd_blue: getVentaByCasa(arsData, 'blue'),
            usd_mep: getVentaByCasa(arsData, 'bolsa'),
            usd_ccl: getVentaByCasa(arsData, 'contadoconliqui'),
            usd_cripto: getVentaByCasa(arsData, 'cripto'),
            usd_tarjeta: getVentaByCasa(arsData, 'tarjeta'),
            ves_oficial: vesOficialData.promedio || vesOficialData.venta || 0,
            ves_paralelo: vesData.promedio || vesData.venta || 0,
            uyu_venta: uyuData.venta || 0,
            clp_venta: clpData.venta || 0,
            brl_venta: brlData.venda || 0,
            eur_venta: eurData.venta || 0,
            uyu_ar: uyuArData.venta || 0,
            clp_ar: clpArData.venta || 0,
            brl_ar: brlArData.venta || 0,
            ves_eur_oficial: vesEurOficialData.promedio || vesEurOficialData.venta || 0,
            ves_eur_paralelo: vesEurParaleloData.promedio || vesEurParaleloData.venta || 0,
            btc_usd: btcData.price ? parseFloat(btcData.price) : 0
        };
        
        history.push(newItem);
        if (history.length > 500) history.shift();
        try {
            fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
        } catch (writeError) {
            console.error('Failed to write history file during background save:', (writeError as any).message);
        }
    } catch (error) {
        console.error('Error saving to history:', error);
    }
};

initializeHistory();
setInterval(saveCurrentToHistory, 300000); // 5 minutes

app.get('/api/rates', async (req, res) => {
    const apiStatus = {
        dolar_api_ar: false,
        dolar_api_ve: false,
        dolar_api_latam: false,
        binance_api: false,
        api_health: 'unknown'
    };

    try {
        const requests = [
            axios.get(DOLAR_API_ARS_URL).then(r => { apiStatus.dolar_api_ar = true; return r; }).catch(e => { return {data: []}; }),
            axios.get(DOLAR_API_VES_URL).then(r => { apiStatus.dolar_api_ve = true; return r; }).catch(e => { return {data: {}}; }),
            axios.get(DOLAR_API_VES_OFFICIAL_URL).catch(e => { return {data: {}}; }),
            axios.get(DOLAR_API_UYU_URL).catch(e => ({ data: {} })),
            axios.get(DOLAR_API_CLP_URL).catch(e => ({ data: {} })),
            axios.get(DOLAR_API_BRL_URL).catch(e => ({ data: {} })),
            axios.get(DOLAR_API_EURO_URL).catch(e => ({ data: {} })),
            axios.get(DOLAR_API_UYU_AR_URL).catch(e => ({ data: {} })),
            axios.get(DOLAR_API_CLP_AR_URL).catch(e => ({ data: {} })),
            axios.get(DOLAR_API_BRL_AR_URL).catch(e => ({ data: {} })),
            axios.get(DOLAR_API_VES_EURO_OFFICIAL_URL).catch(e => ({ data: {} })),
            axios.get(DOLAR_API_VES_EURO_PARALELO_URL).catch(e => ({ data: {} })),
            axios.get(BINANCE_API_URL).then(r => { apiStatus.binance_api = true; return r; }).catch(e => { return {data: {price: "0"}}; }),
            axios.get(DOLAR_API_STATUS_URL).then(r => { apiStatus.api_health = r.data.estado || 'ok'; return r; }).catch(e => { return {data: {estado: 'error'}}; })
        ];

        const [arsRes, vesRes, vesOficialRes, uyuRes, clpRes, brlRes, eurRes, uyuArRes, clpArRes, brlArRes, vesEurOficialRes, vesEurParaleloRes, btcRes, statusRes] = await Promise.all(requests) as any[];

        const history: HistoryItem[] = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
        
        const arsData = arsRes.data;
        const vesData = vesRes.data;
        const vesOficialData = vesOficialRes.data;
        const uyuData = uyuRes.data;
        const clpData = clpRes.data;
        const brlData = brlRes.data;
        const eurData = eurRes.data;
        const uyuArData = uyuArRes.data;
        const clpArData = clpArRes.data;
        const brlArData = brlArRes.data;
        const vesEurOficialData = vesEurOficialRes.data;
        const vesEurParaleloData = vesEurParaleloRes.data;
        const btcData = btcRes.data;

        apiStatus.dolar_api_latam = uyuRes.status === 200 && clpRes.status === 200 && brlRes.status === 200;

        const now = new Date();
        const targetTime = now.getTime() - (24 * 60 * 60 * 1000);
        const last24h = history.length > 0 ? (history.find(h => new Date(h.timestamp).getTime() >= targetTime) || history[0]) : null;

        const uyuChange = calculateChange(uyuData.venta, last24h?.uyu_venta || uyuData.compra);
        const clpChange = clpData.ultimoCierre ? calculateChange(clpData.venta, clpData.ultimoCierre) : calculateChange(clpData.venta, last24h?.clp_venta || clpData.compra);
        const brlChange = brlData.fechoAnterior ? calculateChange(brlData.venda, brlData.fechoAnterior) : calculateChange(brlData.venda, last24h?.brl_venta || brlData.compra);
        const eurChange = calculateChange(eurData.venta, last24h?.eur_venta || eurData.compra);
        const uyuArChange = calculateChange(uyuArData.venta, last24h?.uyu_ar || uyuArData.compra);
        const clpArChange = calculateChange(clpArData.venta, last24h?.clp_ar || clpArData.compra);
        const brlArChange = calculateChange(brlArData.venta, last24h?.brl_ar || brlArData.compra);

        const marketData: MarketData = {
            timestamp: new Date().toISOString(),
            usd_oficial: getVentaByCasa(arsData, 'oficial'),
            usd_blue: getVentaByCasa(arsData, 'blue'),
            usd_mep: getVentaByCasa(arsData, 'bolsa'),
            usd_ccl: getVentaByCasa(arsData, 'contadoconliqui'),
            usd_cripto: getVentaByCasa(arsData, 'cripto'),
            usd_tarjeta: getVentaByCasa(arsData, 'tarjeta'),
            ves_oficial: vesOficialData.promedio || vesOficialData.venta || 0,
            ves_paralelo: vesData.promedio || vesData.venta || 0,
            ves_compra: vesOficialData.promedio || vesOficialData.venta || 0,
            uyu_venta: uyuData.venta || 0,
            uyu_compra: uyuData.compra || 0,
            clp_venta: clpData.venta || 0,
            clp_compra: clpData.compra || 0,
            brl_venta: brlData.venda || 0,
            brl_compra: brlData.compra || 0,
            eur_venta: eurData.venta || 0,
            eur_compra: eurData.compra || 0,
            uyu_ar: uyuArData.venta || 0,
            clp_ar: clpArData.venta || 0,
            brl_ar: brlArData.venta || 0,
            ves_eur_oficial: vesEurOficialData.promedio || vesEurOficialData.venta || 0,
            ves_eur_paralelo: vesEurParaleloData.promedio || vesEurParaleloData.venta || 0,
            btc_usd: parseFloat(btcData.price) || 0,
            changes: {
                usd_oficial_percent: calculateChange(getVentaByCasa(arsData, 'oficial'), last24h?.usd_oficial || 0),
                usd_blue_percent: calculateChange(getVentaByCasa(arsData, 'blue'), last24h?.usd_blue || 0),
                ves_oficial_percent: calculateChange(vesOficialData.promedio || vesOficialData.venta, last24h?.ves_oficial || 0),
                ves_paralelo_percent: calculateChange(vesData.promedio || vesData.venta, last24h?.ves_paralelo || 0),
                ves_eur_oficial_percent: calculateChange(vesEurOficialData.promedio || vesEurOficialData.venta, last24h?.ves_eur_oficial || 0),
                ves_eur_paralelo_percent: calculateChange(vesEurParaleloData.promedio || vesEurParaleloData.venta, last24h?.ves_eur_paralelo || 0),
                uyu_percent: uyuChange,
                clp_percent: clpChange,
                brl_percent: brlChange,
                eur_percent: eurChange,
                uyu_ar_percent: uyuArChange,
                clp_ar_percent: clpArChange,
                brl_ar_percent: brlArChange,
                otros_dolares_percents: {
                    mep: calculateChange(getVentaByCasa(arsData, 'bolsa'), last24h?.usd_mep || 0),
                    ccl: calculateChange(getVentaByCasa(arsData, 'contadoconliqui'), last24h?.usd_ccl || 0),
                    tarjeta: calculateChange(getVentaByCasa(arsData, 'tarjeta'), last24h?.usd_tarjeta || 0)
                },
                bitcoin_percent: calculateChange(parseFloat(btcData.price), last24h?.btc_usd || 0)
            },
            api_status: apiStatus
        };

        res.json(marketData);
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Failed to fetch market data' });
    }
});

app.get('/api/historical/:casa', async (req, res) => {
    try {
        const { casa } = req.params;
        const allowedCasas = ['oficial', 'blue', 'bolsa', 'contadoconliqui', 'cripto', 'tarjeta'];
        
        if (!allowedCasas.includes(casa)) {
            return res.status(400).json({ error: 'Invalid casa parameter' });
        }

        const response = await axios.get(`https://api.argentinadatos.com/v1/cotizaciones/dolares/${casa}`);
        res.json(response.data);
    } catch (error) {
        console.error('Historical Fetch Error:', (error as any).message);
        res.status(500).json({ error: 'Failed to fetch historical data' });
    }
});

app.get('/api/history', (req, res) => {
    try {
        const fileContent = fs.readFileSync(HISTORY_FILE, 'utf-8');
        const history = JSON.parse(fileContent);
        
        // Backfill ves_paralelo for legacy data if needed
        const processedHistory = history.map((item: any) => ({
            ...item,
            ves_paralelo: item.ves_paralelo ?? item.ves_oficial
        }));
        
        res.json(processedHistory);
    } catch (error) {
        res.status(500).json({ error: 'Failed to read history' });
    }
});

// Global Error Handler to prevent stack trace leaks
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled Server Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
});

const server = app.listen(PORT, () => {
    console.log(`🚀 [API] Server running on port ${PORT}`);
});

// Graceful shutdown handlers
process.on('SIGTERM', () => {
    console.log('🛑 [API] SIGTERM received. Starting graceful shutdown...');
    server.close(() => {
        console.log('✅ [API] Server closed. Process terminated.');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('🛑 [API] SIGINT received. Cleaning up resources...');
    server.close(() => {
        console.log('✅ [API] Server closed. Process interrupted.');
        process.exit(0);
    });
});
