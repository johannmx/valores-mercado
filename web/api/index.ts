import express from 'express';
import axios from 'axios';
import cors from 'cors';
import fs from 'fs';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';

const app = express();
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
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : true,
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
app.use(express.json());

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
const DOLAR_API_EURO_URL = 'https://dolarapi.com/v1/cotizaciones/eur';
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
    ves_compra: number;
    uyu_venta: number;
    uyu_compra: number;
    clp_venta: number;
    clp_compra: number;
    brl_venta: number;
    brl_compra: number;
    eur_venta: number;
    eur_compra: number;
    btc_usd: number;
    changes: {
        usd_blue_percent: number;
        ves_percent: number;
        uyu_percent: number;
        clp_percent: number;
        brl_percent: number;
        eur_percent: number;
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
    uyu_venta: number;
    clp_venta: number;
    brl_venta: number;
    eur_venta: number;
    btc_usd: number;
}

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
            uyu_venta: 38 + Math.random() * 0.5,
            clp_venta: 950 + Math.random() * 10,
            brl_venta: 5 + Math.random() * 0.1,
            eur_venta: 1100 + Math.random() * 20,
            btc_usd: 90000 + Math.random() * 500
        });
    }
    return history;
};

const initializeHistory = () => {
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
};

const saveCurrentToHistory = async () => {
    try {
        const [arsRes, vesRes, uyuRes, clpRes, brlRes, eurRes, btcRes] = await Promise.all([
            axios.get(DOLAR_API_ARS_URL).catch(e => ({ data: [] })),
            axios.get(DOLAR_API_VES_URL).catch(e => ({ data: {} })),
            axios.get(DOLAR_API_UYU_URL).catch(e => ({ data: {} })),
            axios.get(DOLAR_API_CLP_URL).catch(e => ({ data: {} })),
            axios.get(DOLAR_API_BRL_URL).catch(e => ({ data: {} })),
            axios.get(DOLAR_API_EURO_URL).catch(e => ({ data: {} })),
            axios.get(BINANCE_API_URL).catch(e => ({ data: { price: "0" } }))
        ]);

        const history: HistoryItem[] = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
        
        const arsData = arsRes.data as any[];
        const vesData = vesRes.data as any;
        const uyuData = uyuRes.data as any;
        const clpData = clpRes.data as any;
        const brlData = brlRes.data as any;
        const eurData = eurRes.data as any;
        const btcData = btcRes.data as any;

        const newItem: HistoryItem = {
            timestamp: new Date().toISOString(),
            usd_oficial: arsData.find((d: any) => d.casa === 'oficial')?.venta || 0,
            usd_blue: arsData.find((d: any) => d.casa === 'blue')?.venta || 0,
            usd_mep: arsData.find((d: any) => d.casa === 'mep')?.venta || 0,
            usd_ccl: arsData.find((d: any) => d.casa === 'ccl')?.venta || 0,
            usd_cripto: arsData.find((d: any) => d.casa === 'cripto')?.venta || 0,
            usd_tarjeta: arsData.find((d: any) => d.casa === 'tarjeta')?.venta || 0,
            ves_oficial: vesData.promedio || vesData.venta || 0,
            uyu_venta: uyuData.venta || 0,
            clp_venta: clpData.venta || 0,
            brl_venta: brlData.venda || 0,
            eur_venta: eurData.venta || 0,
            btc_usd: btcData.price ? parseFloat(btcData.price) : 0
        };
        
        history.push(newItem);
        if (history.length > 500) history.shift();
        fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
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
            axios.get(DOLAR_API_UYU_URL).catch(e => ({ data: {} })),
            axios.get(DOLAR_API_CLP_URL).catch(e => ({ data: {} })),
            axios.get(DOLAR_API_BRL_URL).catch(e => ({ data: {} })),
            axios.get(DOLAR_API_EURO_URL).catch(e => ({ data: {} })),
            axios.get(BINANCE_API_URL).then(r => { apiStatus.binance_api = true; return r; }).catch(e => { return {data: {price: "0"}}; }),
            axios.get(DOLAR_API_STATUS_URL).then(r => { apiStatus.api_health = r.data.estado || 'ok'; return r; }).catch(e => { return {data: {estado: 'error'}}; })
        ];

        const [arsRes, vesRes, uyuRes, clpRes, brlRes, eurRes, btcRes, statusRes] = await Promise.all(requests) as any[];

        const history: HistoryItem[] = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
        
        const arsData = arsRes.data;
        const vesData = vesRes.data;
        const uyuData = uyuRes.data;
        const clpData = clpRes.data;
        const brlData = brlRes.data;
        const eurData = eurRes.data;
        const btcData = btcRes.data;

        apiStatus.dolar_api_latam = uyuRes.status === 200 && clpRes.status === 200 && brlRes.status === 200;

        const last24h = history.length > 0 ? history[history.length - 1] : null;

        const calculateChange = (current: number, last: number) => {
            if (!last || last === 0) return 0;
            return ((current - last) / last) * 100;
        };

        const uyuChange = calculateChange(uyuData.venta, last24h?.uyu_venta || uyuData.compra);
        const clpChange = clpData.ultimoCierre ? calculateChange(clpData.venta, clpData.ultimoCierre) : calculateChange(clpData.venta, last24h?.clp_venta || clpData.compra);
        const brlChange = brlData.fechoAnterior ? calculateChange(brlData.venda, brlData.fechoAnterior) : calculateChange(brlData.venda, last24h?.brl_venta || brlData.compra);
        const eurChange = calculateChange(eurData.venta, last24h?.eur_venta || eurData.compra);

        const marketData: MarketData = {
            timestamp: new Date().toISOString(),
            usd_oficial: arsData.find((d: any) => d.casa === 'oficial')?.venta || 0,
            usd_blue: arsData.find((d: any) => d.casa === 'blue')?.venta || 0,
            usd_mep: arsData.find((d: any) => d.casa === 'mep')?.venta || 0,
            usd_ccl: arsData.find((d: any) => d.casa === 'ccl')?.venta || 0,
            usd_cripto: arsData.find((d: any) => d.casa === 'cripto')?.venta || 0,
            usd_tarjeta: arsData.find((d: any) => d.casa === 'tarjeta')?.venta || 0,
            ves_oficial: vesData.promedio || vesData.venta || 0,
            ves_compra: vesData.compra || 0,
            uyu_venta: uyuData.venta || 0,
            uyu_compra: uyuData.compra || 0,
            clp_venta: clpData.venta || 0,
            clp_compra: clpData.compra || 0,
            brl_venta: brlData.venda || 0,
            brl_compra: brlData.compra || 0,
            eur_venta: eurData.venta || 0,
            eur_compra: eurData.compra || 0,
            btc_usd: parseFloat(btcData.price) || 0,
            changes: {
                usd_blue_percent: calculateChange(arsData.find((d: any) => d.casa === 'blue')?.venta, last24h?.usd_blue || 0),
                ves_percent: calculateChange(vesData.venta || vesData.promedio, last24h?.ves_oficial || 0),
                uyu_percent: uyuChange,
                clp_percent: clpChange,
                brl_percent: brlChange,
                eur_percent: eurChange,
                otros_dolares_percents: {},
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
        const response = await axios.get(`https://dolarapi.com/v1/cotizaciones/dolares/${casa}`);
        res.json(response.data);
    } catch (error) {
        console.error('Historical Fetch Error:', error);
        res.status(500).json({ error: 'Failed to fetch historical data' });
    }
});

app.get('/api/history', (req, res) => {
    try {
        const data = fs.readFileSync(HISTORY_FILE, 'utf-8');
        res.json(JSON.parse(data));
    } catch (error) {
        res.status(500).json({ error: 'Failed to read history' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
