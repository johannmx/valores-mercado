import express from 'express';
import axios from 'axios';
import cors from 'cors';
import fs from 'fs';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_DIR = 'data';
const HISTORY_FILE = `${DATA_DIR}/history.json`;

// Security Middleware
app.use(helmet());
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

interface MarketData {
    ar_oficial_compra: number;
    ar_oficial_venta: number;
    ar_crypto_compra: number;
    ar_crypto_venta: number;
    ar_tarjeta_compra: number;
    ar_tarjeta_venta: number;
    ve_oficial: number;
    ve_paralelo: number;
    tasa_remesa: string;
    bitcoin: string;
    updated_at: string;
    all_ar_dolares?: any[];
    changes?: {
        ar_oficial_percent: number;
        ve_paralelo_percent: number;
        ar_crypto_percent: number;
        ve_oficial_percent: number;
        otros_dolares_percents: Record<string, number>;
        bitcoin_percent: number;
    };
    api_status: {
        dolar_api_ar: boolean;
        dolar_api_ve: boolean;
        binance_api: boolean;
    };
}

interface HistoryItem {
    date: string;
    ar_oficial_compra: number;
    ar_oficial_venta: number;
    ve_paralelo_venta: number;
    ar_crypto_venta?: number;
    ve_oficial?: number;
    otros_dolares?: Record<string, number>;
    bitcoin?: number;
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
            date: date.toISOString(),
            ar_oficial_compra: baseAr - 20,
            ar_oficial_venta: baseAr,
            ve_paralelo_venta: baseVe,
            ar_crypto_venta: baseAr + 50,
            ve_oficial: baseVe - 10,
            otros_dolares: { 'blue': baseAr + 200, 'bolsa': baseAr + 150 },
            bitcoin: 90000 + Math.random() * 500
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
            if (data.length > 0 && !data[0].ar_oficial_venta) {
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
        const [arOficial, veParalelo, arCrypto, veOficial, allArDolares, btcPrice] = await Promise.all([
            axios.get('https://dolarapi.com/v1/dolares/oficial'),
            axios.get('https://ve.dolarapi.com/v1/dolares/paralelo'),
            axios.get('https://dolarapi.com/v1/dolares/cripto').catch(e => ({ data: {} })),
            axios.get('https://ve.dolarapi.com/v1/dolares/oficial').catch(e => ({ data: {} })),
            axios.get('https://dolarapi.com/v1/dolares').catch(e => ({ data: [] })),
            axios.get('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT').catch(e => ({ data: { price: 0 } }))
        ]);

        const history: HistoryItem[] = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
        
        const otros_dolares: Record<string, number> = {};
        if (allArDolares.data && Array.isArray(allArDolares.data)) {
            allArDolares.data.forEach((d: any) => {
                if (d.casa !== 'oficial' && d.casa !== 'cripto') {
                    otros_dolares[d.casa] = d.venta || 0;
                }
            });
        }

        const newItem: HistoryItem = {
            date: new Date().toISOString(),
            ar_oficial_compra: arOficial.data.compra || 0,
            ar_oficial_venta: arOficial.data.venta || 0,
            ve_paralelo_venta: veParalelo.data.promedio || 0,
            ar_crypto_venta: arCrypto.data.venta || 0,
            ve_oficial: veOficial.data.promedio || 0,
            otros_dolares,
            bitcoin: btcPrice.data.price ? parseFloat(btcPrice.data.price) : 0
        };
        
        history.push(newItem);
        if (history.length > 300) history.shift();
        
        fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
    } catch (error) {
        console.error('Failed to save real history point:', error);
    }
};

initializeHistory();
setInterval(saveCurrentToHistory, 300000); // 5 minutes

app.get('/api/rates', async (req, res) => {
    let apiStatus = {
        dolar_api_ar: false,
        dolar_api_ve: false,
        binance_api: false
    };

    try {
        const requests = [
            axios.get('https://dolarapi.com/v1/dolares/oficial').then(r => { apiStatus.dolar_api_ar = true; return r; }).catch(e => { return {data: {}}; }),
            axios.get('https://dolarapi.com/v1/dolares/cripto').catch(e => { return {data: {}}; }),
            axios.get('https://dolarapi.com/v1/dolares').catch(e => { return {data: []}; }),
            axios.get('https://ve.dolarapi.com/v1/dolares/paralelo').then(r => { apiStatus.dolar_api_ve = true; return r; }).catch(e => { return {data: {}}; }),
            axios.get('https://ve.dolarapi.com/v1/dolares/oficial').catch(e => { return {data: {}}; }),
            axios.get('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT').then(r => { apiStatus.binance_api = true; return r; }).catch(e => { return {data: {price: "0"}}; })
        ];

        const [arOficial, arCrypto, allArDolares, veParalelo, veOficial, btcPrice] = await Promise.all(requests);

        const history: HistoryItem[] = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
        
        const currentAr = arOficial?.data?.venta || 0;
        const currentVeParalelo = veParalelo?.data?.promedio || 0;
        const currentArCrypto = arCrypto?.data?.venta || 0;
        const currentVeOficial = veOficial?.data?.promedio || 0;
        const currentOtrosDolares = allArDolares?.data || [];
        const currentBtc = btcPrice?.data?.price ? parseFloat(btcPrice.data.price) : 0;

        // Helper: find the last history value that differs from the current value for a given field
        const findPrevValue = (field: keyof HistoryItem, currentValue: number): number | null => {
            for (let i = history.length - 1; i >= 0; i--) {
                const entry = history[i];
                if (!entry) continue;
                const val = entry[field];
                if (typeof val === 'number' && val !== currentValue) {
                    return val;
                }
            }
            return null;
        };

        const calcPercent = (field: keyof HistoryItem, currentValue: number): number => {
            const prev = findPrevValue(field, currentValue);
            if (prev !== null && prev !== 0) {
                return ((currentValue - prev) / prev) * 100;
            }
            return 0;
        };
        
        const ar_oficial_percent = calcPercent('ar_oficial_venta', currentAr);
        const ve_paralelo_percent = calcPercent('ve_paralelo_venta', currentVeParalelo);
        const ar_crypto_percent = calcPercent('ar_crypto_venta', currentArCrypto);
        const ve_oficial_percent = calcPercent('ve_oficial', currentVeOficial);
        const bitcoin_percent = calcPercent('bitcoin', currentBtc);
        
        let otros_dolares_percents: Record<string, number> = {};
        // For otros_dolares, find the last history entry that has otros_dolares data with a different value
        currentOtrosDolares.forEach((d: any) => {
            if (d.casa === 'oficial' || d.casa === 'cripto') {
                otros_dolares_percents[d.casa] = 0;
                return;
            }
            const currentVal = d.venta || 0;
            let prevVal: number | null = null;
            for (let i = history.length - 1; i >= 0; i--) {
                const entry = history[i];
                if (!entry || !entry.otros_dolares) continue;
                const hVal = entry.otros_dolares[d.casa];
                if (typeof hVal === 'number' && hVal !== currentVal) {
                    prevVal = hVal;
                    break;
                }
            }
            if (prevVal !== null && prevVal !== 0) {
                otros_dolares_percents[d.casa] = ((currentVal - prevVal) / prevVal) * 100;
            } else {
                otros_dolares_percents[d.casa] = 0;
            }
        });

        const data: MarketData = {
            ar_oficial_compra: arOficial?.data?.compra || 0,
            ar_oficial_venta: arOficial?.data?.venta || 0,
            ar_crypto_compra: arCrypto?.data?.compra || 0,
            ar_crypto_venta: arCrypto?.data?.venta || 0,
            ar_tarjeta_compra: 0, 
            ar_tarjeta_venta: 0,
            ve_oficial: veOficial?.data?.promedio || 0,
            ve_paralelo: currentVeParalelo,
            tasa_remesa: currentAr > 0 ? (currentVeParalelo / currentAr).toFixed(2) : "0",
            bitcoin: btcPrice?.data?.price ? parseFloat(btcPrice.data.price).toFixed(2) : "0",
            updated_at: new Date().toISOString(),
            all_ar_dolares: allArDolares?.data,
            changes: {
                ar_oficial_percent,
                ve_paralelo_percent,
                ar_crypto_percent,
                ve_oficial_percent,
                otros_dolares_percents,
                bitcoin_percent
            },
            api_status: apiStatus
        };

        res.json(data);
    } catch (error) {
        console.error('Error in rates endpoint:', error);
        res.status(500).json({ error: 'Internal server error' });
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
