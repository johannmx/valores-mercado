import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  ArrowRightLeft, 
  Bitcoin, 
  RefreshCw,
  TrendingDown,
  Info
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';

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

const StatCard = ({ title, value, icon: Icon, color, subtitle, buy, sell }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl ${color} shadow-sm`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{title}</span>
    </div>
    <div className="space-y-1">
      <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
      {subtitle && <p className="text-sm text-gray-500 font-medium">{subtitle}</p>}
      {(buy !== undefined || sell !== undefined) && (
        <div className="flex gap-4 mt-2 pt-2 border-t border-gray-50 text-xs font-bold uppercase">
          <div className="flex flex-col">
            <span className="text-gray-400">Compra</span>
            <span className="text-slate-700">{buy || '-'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-400">Venta</span>
            <span className="text-slate-700">{sell || '-'}</span>
          </div>
        </div>
      )}
    </div>
  </div>
);

const Converter = ({ data }: { data: MarketData | null }) => {
  const [amount, setAmount] = useState<number>(1);
  const [from, setFrom] = useState<'USD' | 'ARS' | 'VES'>('USD');

  if (!data) return null;

  const rates = {
    USD: 1,
    ARS: data.ar_oficial_venta, // Conversion using Official Venta as requested
    VES: data.ve_paralelo
  };

  const convert = (to: 'USD' | 'ARS' | 'VES') => {
    const usdAmount = amount / rates[from];
    const result = usdAmount * rates[to];
    
    // Custom formatting for ARS (thousands with dot)
    if (to === 'ARS') {
      return result.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    
    return result.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-full">
      <div className="flex items-center gap-2 mb-6">
        <ArrowRightLeft className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-bold text-gray-800">Conversor Rápido</h2>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Monto a convertir</label>
          <div className="flex gap-2">
            <input 
              type="number" 
              value={amount} 
              onChange={(e) => setAmount(Number(e.target.value))}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
            <select 
              value={from} 
              onChange={(e) => setFrom(e.target.value as any)}
              className="px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 font-bold outline-none cursor-pointer"
            >
              <option value="USD">USD</option>
              <option value="ARS">ARS</option>
              <option value="VES">VES</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 mt-6">
          {from !== 'USD' && (
            <div className="p-4 bg-blue-50 rounded-xl flex justify-between items-center">
              <span className="text-blue-700 font-medium">En Dólares</span>
              <span className="text-xl font-bold text-blue-800">$ {convert('USD')}</span>
            </div>
          )}
          {from !== 'ARS' && (
            <div className="p-4 bg-indigo-50 rounded-xl flex justify-between items-center">
              <span className="text-indigo-700 font-medium">En Pesos (Oficial)</span>
              <span className="text-xl font-bold text-indigo-800">$ {convert('ARS')}</span>
            </div>
          )}
          {from !== 'VES' && (
            <div className="p-4 bg-yellow-50 rounded-xl flex justify-between items-center">
              <span className="text-yellow-700 font-medium">En Bolívares</span>
              <span className="text-xl font-bold text-yellow-800">{convert('VES')} VES</span>
            </div>
          )}
        </div>
        <p className="text-[10px] text-gray-400 mt-2 font-medium italic">* Conversión calculada con Dólar Oficial AR</p>
      </div>
    </div>
  );
};

function App() {
  const [data, setData] = useState<MarketData | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const [ratesRes, historyRes] = await Promise.all([
        axios.get('http://localhost:3001/api/rates'),
        axios.get('http://localhost:3001/api/history')
      ]);
      setData(ratesRes.data);
      setHistory(historyRes.data);
      setError(null);
    } catch (err) {
      setError('Error de conexión con el servidor. Verifica que el Backend esté corriendo.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-500 font-medium">Cargando datos del mercado...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-black tracking-tight text-slate-900">
                Market<span className="text-blue-600">Dash</span>
              </h1>
            </div>
            <p className="mt-2 text-slate-500 font-medium">Tasas de cambio en tiempo real Argentina & Venezuela</p>
          </div>
          
          <div className="flex items-center gap-4">
            {data && (
              <div className="flex items-center gap-3 px-5 py-2.5 bg-white rounded-2xl shadow-sm border border-slate-100">
                <Clock className="w-5 h-5 text-blue-500" />
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">Última actualización</span>
                  <span className="text-sm font-bold text-slate-700">{new Date(data.updated_at).toLocaleTimeString()}</span>
                </div>
                <button 
                  onClick={fetchData}
                  className={`ml-2 p-1.5 rounded-lg hover:bg-slate-50 transition-colors ${isRefreshing ? 'animate-spin' : ''}`}
                >
                  <RefreshCw className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            )}
          </div>
        </header>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700">
            <TrendingDown className="w-5 h-5" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Stats & Charts */}
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatCard 
                title="Dólar Oficial (AR)" 
                value={`$${data?.ar_oficial_venta}`} 
                icon={TrendingUp} 
                color="bg-blue-600"
                subtitle="Tasa Banco Nación"
                buy={data?.ar_oficial_compra}
                sell={data?.ar_oficial_venta}
              />
              <StatCard 
                title="Dólar Paralelo (VE)" 
                value={`${data?.ve_paralelo} VES`} 
                icon={DollarSign} 
                color="bg-yellow-500"
                subtitle="Promedio EnParaleloVzla"
              />
              <StatCard 
                title="Tasa Remesa" 
                value={`${data?.tasa_remesa} VES`} 
                icon={ArrowRightLeft} 
                color="bg-emerald-500"
                subtitle="1 Peso AR Oficial = X VES"
              />
              <StatCard 
                title="Bitcoin (BTC)" 
                value={`$${data?.bitcoin}`} 
                icon={Bitcoin} 
                color="bg-orange-500"
                subtitle="Precio Binance BTC/USDT"
              />
            </div>

            {/* Chart Section */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                  Tendencias (USD)
                </h2>
                <div className="flex gap-4 text-xs font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1.5 text-indigo-600">
                    <div className="w-3 h-3 rounded-full bg-indigo-600" /> AR Oficial
                  </span>
                  <span className="flex items-center gap-1.5 text-yellow-500">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" /> VE Paralelo
                  </span>
                </div>
              </div>
              
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history}>
                    <defs>
                      <linearGradient id="colorAr" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorVe" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#eab308" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#94a3b8', fontSize: 12}}
                      dy={10}
                      tickFormatter={(str) => {
                        const date = new Date(str);
                        return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
                      }}
                    />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                      itemStyle={{fontWeight: 'bold'}}
                      formatter={(value: any) => value ? Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
                    />
                    <Area 
                      name="Dólar AR"
                      type="monotone" 
                      dataKey="ar_oficial" 
                      stroke="#4f46e5" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorAr)" 
                    />
                    <Area 
                      name="Dólar VE"
                      type="monotone" 
                      dataKey="ve_paralelo" 
                      stroke="#eab308" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorVe)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Right Column: Converter & Other Rates */}
          <div className="flex flex-col gap-8 h-full">
            <div className="flex-none">
              <Converter data={data} />
            </div>
            
            {/* Improved Other Rates Info Panel - Scrollable to match height */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex-1 flex flex-col min-h-[450px] lg:max-h-[500px]">
              <div className="flex items-center gap-2 mb-6 flex-none">
                <Info className="w-6 h-6 text-indigo-600" />
                <h2 className="text-xl font-bold text-gray-800">Otros Dólares (AR)</h2>
              </div>
              <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
                {data?.all_ar_dolares?.filter((d: any) => d.casa !== 'oficial').map((d: any) => (
                  <div key={d.casa} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-700 capitalize">{d.nombre}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Últ: {new Date(d.fechaActualizacion).toLocaleTimeString()}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-lg font-black text-indigo-600">$ {d.venta}</span>
                      <span className="text-[10px] text-slate-400 font-bold">COMPRA: {d.compra || '-'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        <footer className="text-center text-slate-400 text-sm mt-16 pb-8">
          <div className="flex justify-center items-center gap-6 mb-4">
            <span className="hover:text-slate-600 transition-colors cursor-pointer font-medium">DolarApi</span>
            <span className="hover:text-slate-600 transition-colors cursor-pointer font-medium">Binance API</span>
            <span className="hover:text-slate-600 transition-colors cursor-pointer font-medium">Recharts</span>
          </div>
          <p>© 2026 MarketDash • Monitoreo financiero en tiempo real</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
