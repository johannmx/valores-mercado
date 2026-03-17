import express from 'express';
import axios from 'axios';
import cors from 'cors';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 3001;
const HISTORY_FILE = 'history.json';

app.use(cors());
app.use(express.json());

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
            otros_dolares: { 'blue': baseAr + 200, 'bolsa': baseAr + 150 }
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
        const [arOficial, veParalelo, arCrypto, veOficial, allArDolares] = await Promise.all([
            axios.get('https://dolarapi.com/v1/dolares/oficial'),
            axios.get('https://ve.dolarapi.com/v1/dolares/paralelo'),
            axios.get('https://dolarapi.com/v1/dolares/cripto').catch(e => ({ data: {} })),
            axios.get('https://ve.dolarapi.com/v1/dolares/oficial').catch(e => ({ data: {} })),
            axios.get('https://dolarapi.com/v1/dolares').catch(e => ({ data: [] }))
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
            otros_dolares
        };
        
        history.push(newItem);
        if (history.length > 200) history.shift();
        
        fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
    } catch (error) {
        console.error('Failed to save real history point:', error);
    }
};

initializeHistory();
setInterval(saveCurrentToHistory, 3600000);

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
        const lastEntry = history[history.length - 1];
        
        const currentAr = arOficial.data.venta || 0;
        const currentVeParalelo = veParalelo.data.promedio || 0;
        const currentArCrypto = arCrypto.data.venta || 0;
        const currentVeOficial = veOficial.data.promedio || 0;
        const currentOtrosDolares = allArDolares.data || [];
        
        let ar_oficial_percent = 0;
        let ve_paralelo_percent = 0;
        let ar_crypto_percent = 0;
        let ve_oficial_percent = 0;
        let otros_dolares_percents: Record<string, number> = {};
        
        if (lastEntry) {
            ar_oficial_percent = lastEntry.ar_oficial_venta ? ((currentAr - lastEntry.ar_oficial_venta) / lastEntry.ar_oficial_venta) * 100 : 0;
            ve_paralelo_percent = lastEntry.ve_paralelo_venta ? ((currentVeParalelo - lastEntry.ve_paralelo_venta) / lastEntry.ve_paralelo_venta) * 100 : 0;
            ar_crypto_percent = lastEntry.ar_crypto_venta ? ((currentArCrypto - lastEntry.ar_crypto_venta) / lastEntry.ar_crypto_venta) * 100 : 0;
            ve_oficial_percent = lastEntry.ve_oficial ? ((currentVeOficial - lastEntry.ve_oficial) / lastEntry.ve_oficial) * 100 : 0;
            
            if (lastEntry.otros_dolares) {
                currentOtrosDolares.forEach((d: any) => {
                    if (d.casa !== 'oficial' && d.casa !== 'cripto' && lastEntry.otros_dolares && lastEntry.otros_dolares[d.casa]) {
                        otros_dolares_percents[d.casa] = ((d.venta - lastEntry.otros_dolares[d.casa]) / lastEntry.otros_dolares[d.casa]) * 100;
                    } else {
                        otros_dolares_percents[d.casa] = 0;
                    }
                });
            } else {
                currentOtrosDolares.forEach((d: any) => { otros_dolares_percents[d.casa] = 0; });
            }
        }

        const data: MarketData = {
            ar_oficial_compra: arOficial.data.compra || 0,
            ar_oficial_venta: arOficial.data.venta || 0,
            ar_crypto_compra: arCrypto.data.compra || 0,
            ar_crypto_venta: arCrypto.data.venta || 0,
            ar_tarjeta_compra: 0, 
            ar_tarjeta_venta: 0,
            ve_oficial: veOficial.data.promedio || 0,
            ve_paralelo: currentVeParalelo,
            tasa_remesa: currentAr > 0 ? (currentVeParalelo / currentAr).toFixed(2) : "0",
            bitcoin: btcPrice.data.price ? parseFloat(btcPrice.data.price).toFixed(2) : "0",
            updated_at: new Date().toISOString(),
            all_ar_dolares: allArDolares.data,
            changes: {
                ar_oficial_percent,
                ve_paralelo_percent,
                ar_crypto_percent,
                ve_oficial_percent,
                otros_dolares_percents
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
