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
    ar_blue_compra: number;
    ar_blue_venta: number;
    ar_tarjeta_compra: number;
    ar_tarjeta_venta: number;
    ve_paralelo: number;
    tasa_remesa: string;
    bitcoin: string;
    updated_at: string;
    all_ar_dolares?: any[];
}

interface HistoryItem {
    date: string;
    ar_oficial: number;
    ve_paralelo: number;
}

const initializeHistory = () => {
    if (!fs.existsSync(HISTORY_FILE)) {
        const history: HistoryItem[] = [];
        const today = new Date();
        for (let i = 10; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            history.push({
                date: date.toISOString().split('T')[0],
                ar_oficial: 1300 + Math.random() * 100,
                ve_paralelo: 580 + Math.random() * 50
            });
        }
        fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
    }
};

initializeHistory();

app.get('/api/rates', async (req, res) => {
    try {
        const [arOficial, arBlue, arTarjeta, allArDolares, veParalelo, btcPrice] = await Promise.all([
            axios.get('https://dolarapi.com/v1/dolares/oficial'),
            axios.get('https://dolarapi.com/v1/dolares/blue'),
            axios.get('https://dolarapi.com/v1/dolares/tarjeta'),
            axios.get('https://dolarapi.com/v1/dolares'),
            axios.get('https://ve.dolarapi.com/v1/dolares/paralelo'),
            axios.get('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT')
        ]);

        const ve_promedio = veParalelo.data.promedio;
        const ar_oficial_venta = arOficial.data.venta;
        
        // Use AR Oficial Venta for Tasa Remesa as requested
        let tasa_remesa = "N/A";
        if (ve_promedio && ar_oficial_venta) {
            tasa_remesa = (ve_promedio / ar_oficial_venta).toFixed(2);
        }

        const data: MarketData = {
            ar_oficial_compra: arOficial.data.compra,
            ar_oficial_venta: arOficial.data.venta,
            ar_blue_compra: arBlue.data.compra,
            ar_blue_venta: arBlue.data.venta,
            ar_tarjeta_compra: arTarjeta.data.compra,
            ar_tarjeta_venta: arTarjeta.data.venta,
            ve_paralelo: ve_promedio,
            tasa_remesa,
            bitcoin: parseFloat(btcPrice.data.price).toFixed(2),
            updated_at: new Date().toISOString(),
            all_ar_dolares: allArDolares.data
        };

        res.json(data);
    } catch (error) {
        console.error('Error fetching rates:', error);
        res.status(500).json({ error: 'Failed to fetch market data' });
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
