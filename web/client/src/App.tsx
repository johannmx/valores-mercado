import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  DollarSign, 
  TrendingUp, 
  ArrowRightLeft, 
  Bitcoin, 
  RefreshCw,
  TrendingDown,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  Globe,
  ShieldCheck
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

interface MarketData {
  ar_oficial_compra: number;
  ar_oficial_venta: number;
  ar_crypto_compra: number;
  ar_crypto_venta: number;
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
}

const formatNumber = (num: any) => {
  if (num === null || num === undefined || num === '') return '';
  const parsed = Number(num);
  if (isNaN(parsed)) return num;
  return parsed.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const StatCard = ({ title, value, icon: Icon, color, subtitle, buy, sell, change }: any) => {
  const isPositive = change > 0;
  const isNeutral = change === 0;
  const displayValue = value || '---';

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 relative overflow-hidden group h-full">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color} shadow-sm group-hover:scale-110 transition-transform`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{title}</span>
          {change !== undefined && (
            <span className={`flex items-center gap-0.5 text-[10px] font-bold mt-1 px-2 py-0.5 rounded-full ${
              isNeutral ? 'text-slate-500 bg-slate-100' :
              isPositive ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'
            }`}>
              {isNeutral ? <TrendingUp className="w-3 h-3 text-slate-400" /> : isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(change).toFixed(2)}%
            </span>
          )}
        </div>
      </div>
      <div className="space-y-1">
        <h3 className="text-3xl font-black text-slate-800 tracking-tight">{displayValue}</h3>
        {subtitle && <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">{subtitle}</p>}
        {(buy !== undefined || sell !== undefined) && (
          <div className="flex gap-4 mt-4 pt-4 border-t border-slate-50 text-[10px] font-bold uppercase">
            <div className="flex flex-col">
              <span className="text-slate-300 mb-0.5">Compra</span>
              <span className="text-slate-600">$ {buy || '-'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-300 mb-0.5">Venta</span>
              <span className="text-slate-600">$ {sell || '-'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Converter = ({ data }: { data: MarketData | null }) => {
  const [amount, setAmount] = useState<number>(1);
  const [from, setFrom] = useState<'USD' | 'ARS' | 'CRYPTO' | 'VES'>('USD');

  if (!data) return null;

  const rates = {
    USD: 1,
    ARS: data.ar_oficial_venta,
    CRYPTO: data.ar_crypto_venta,
    VES: data.ve_paralelo
  };

  const convert = (to: 'USD' | 'ARS' | 'CRYPTO' | 'VES') => {
    const usdAmount = amount / rates[from];
    const result = usdAmount * rates[to];
    
    if (to === 'ARS' || to === 'CRYPTO' || to === 'VES') {
      return result.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return result.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <ArrowRightLeft className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Conversor Rápido</h2>
      </div>
      
      <div className="space-y-4 flex-1">
        <div className="bg-slate-50 p-4 rounded-2xl">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Monto a convertir</label>
          <div className="flex gap-2">
            <input 
              type="number" 
              value={amount.toString()} 
              onChange={(e) => {
                const val = e.target.value;
                if (val === '') {
                  setAmount(0);
                } else {
                  // Remove leading zeros but keep single zero if that's all there is
                  const noLeadingZeros = val.replace(/^0+(?=\d)/, '');
                  setAmount(Number(noLeadingZeros));
                }
              }}
              className="flex-1 px-4 py-2 border-0 bg-white rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-black text-slate-700"
            />
            <select 
              value={from} 
              onChange={(e) => setFrom(e.target.value as any)}
              className="px-4 py-2 border-0 bg-slate-900 text-white rounded-xl font-black outline-none cursor-pointer"
            >
              <option value="USD">USD</option>
              <option value="ARS">ARS</option>
              <option value="CRYPTO">CRYPTO</option>
              <option value="VES">VES</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 mt-6">
          {from !== 'USD' && (
            <div className="p-4 bg-blue-50 rounded-2xl flex justify-between items-center border border-blue-100">
              <span className="text-blue-700 font-black text-xs uppercase">USD</span>
              <span className="text-xl font-black text-blue-800">$ {convert('USD')}</span>
            </div>
          )}
          {from !== 'ARS' && (
            <div className="p-4 bg-indigo-50 rounded-2xl flex justify-between items-center border border-indigo-100">
              <span className="text-indigo-700 font-black text-xs uppercase">ARS (Oficial)</span>
              <span className="text-xl font-black text-indigo-800">$ {convert('ARS')}</span>
            </div>
          )}
          {from !== 'CRYPTO' && (
            <div className="p-4 bg-purple-50 rounded-2xl flex justify-between items-center border border-purple-100">
              <span className="text-purple-700 font-black text-xs uppercase">ARS (Crypto)</span>
              <span className="text-xl font-black text-purple-800">$ {convert('CRYPTO')}</span>
            </div>
          )}
          {from !== 'VES' && (
            <div className="p-4 bg-yellow-50 rounded-2xl flex justify-between items-center border border-yellow-100">
              <span className="text-yellow-700 font-black text-xs uppercase">VES (Paralelo)</span>
              <span className="text-xl font-black text-yellow-800">{convert('VES')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const RegionChart = ({ title, data, buyKey, sellKey, dataKey, color, icon: Icon, singleLine }: any) => (
  <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col h-full min-h-[400px]">
    <div className="flex items-center justify-between mb-8">
      <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-2">
        <Icon className={`w-6 h-6 ${color.text}`} />
        {title}
      </h2>
      <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Tendencia 24h</div>
    </div>
    
    <div className="flex-1 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            {singleLine ? (
              <linearGradient id={`color-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color.hex} stopOpacity={0.2}/>
                <stop offset="95%" stopColor={color.hex} stopOpacity={0}/>
              </linearGradient>
            ) : (
              <>
                <linearGradient id={`color-buy-${buyKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color.buyHex} stopOpacity={0.2}/>
                  <stop offset="95%" stopColor={color.buyHex} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id={`color-sell-${sellKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color.sellHex} stopOpacity={0.2}/>
                  <stop offset="95%" stopColor={color.sellHex} stopOpacity={0}/>
                </linearGradient>
              </>
            )}
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}}
            dy={10}
            tickFormatter={(str) => {
              try {
                return new Date(str).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              } catch (e) {
                return '';
              }
            }}
          />
          <YAxis domain={['auto', 'auto']} hide />
          <Tooltip 
            contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
            itemStyle={{fontWeight: '900', textTransform: 'uppercase', fontSize: '10px'}}
            labelStyle={{fontWeight: '900', marginBottom: '8px', color: '#64748b'}}
            labelFormatter={(label) => new Date(label).toLocaleString()}
            formatter={(value: any) => [Number(value).toLocaleString('de-DE', {minimumFractionDigits: 2, maximumFractionDigits: 2}), "VALOR"]}
          />
          {!singleLine && <Legend iconType="circle" wrapperStyle={{paddingTop: '20px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase'}} />}
          
          {singleLine ? (
            <Area 
              name="Valor"
              type="monotone" 
              dataKey={dataKey} 
              stroke={color.hex} 
              strokeWidth={4}
              fillOpacity={1} 
              fill={`url(#color-${dataKey})`} 
              animationDuration={1500}
            />
          ) : (
            <>
              <Area 
                name="Compra"
                type="monotone" 
                dataKey={buyKey} 
                stroke={color.buyHex} 
                strokeWidth={4}
                fillOpacity={1} 
                fill={`url(#color-buy-${buyKey})`} 
                animationDuration={1500}
              />
              <Area 
                name="Venta"
                type="monotone" 
                dataKey={sellKey} 
                stroke={color.sellHex} 
                strokeWidth={4}
                fillOpacity={1} 
                fill={`url(#color-sell-${sellKey})`} 
                animationDuration={1500}
              />
            </>
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
    <div className="mt-6 pt-4 border-t border-slate-50 text-[9px] text-slate-300 font-black uppercase tracking-widest text-center">
      {singleLine ? 'Evolución del valor de mercado' : 'Evolución tasas de compra y venta'}
    </div>
  </div>
);

function App() {
  const [data, setData] = useState<MarketData | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const baseURL = (window as any)._env_?.VITE_API_URL || import.meta.env.VITE_API_URL || '';
      const [ratesRes, historyRes] = await Promise.all([
        axios.get(`${baseURL}/api/rates`),
        axios.get(`${baseURL}/api/history`)
      ]);
      const ratesData = ratesRes.data;
      const historyData = historyRes.data;

      // Append current data to history for the charts
      const currentAsHistory = {
        date: ratesData.updated_at,
        ar_oficial_compra: ratesData.ar_oficial_compra,
        ar_oficial_venta: ratesData.ar_oficial_venta,
        ve_paralelo_venta: ratesData.ve_paralelo
      };

      setData(ratesData);
      setHistory([...historyData, currentAsHistory]);
      setError(null);
    } catch (err) {
      setError('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
      setTimeLeft(300);
      setProgress(0);
    }
  };

  useEffect(() => {
    fetchData();
    // No longer using a simple setInterval here
  }, []);

  // Timer effect
  useEffect(() => {
    if (loading) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          fetchData();
          return 300;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading]);

  // Update progress bar
  useEffect(() => {
    setProgress(((300 - timeLeft) / 300) * 100);
  }, [timeLeft]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <RefreshCw className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-black tracking-widest uppercase text-xs">Sincronizando Mercados...</p>
      </div>
    </div>
  );

  const formatTimeLeft = () => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans text-slate-900 pb-48">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 p-2.5 rounded-2xl shadow-xl rotate-3">
                <TrendingUp className="w-7 h-7 text-blue-400" />
              </div>
              <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase">
                Market<span className="text-blue-600">Dash</span>
              </h1>
            </div>
            <p className="mt-2 text-slate-400 font-bold uppercase text-[10px] tracking-widest">Historial real y análisis de mercado</p>
          </div>
          
          <div className="flex items-center gap-4">
            {data && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-4 px-6 py-3 bg-white rounded-full shadow-sm border border-slate-100">
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] uppercase font-black text-slate-300 leading-none mb-1 tracking-tighter">Última Sincronización</span>
                    <span className="text-sm font-black text-slate-600">{new Date(data.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <button 
                    onClick={fetchData}
                    className={`p-2 rounded-full hover:bg-slate-50 transition-all ${isRefreshing ? 'animate-spin' : 'hover:rotate-180'}`}
                  >
                    <RefreshCw className="w-5 h-5 text-blue-500" />
                  </button>
                </div>
                
                <div className="px-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Próxima Sincronización</span>
                    <span className="text-[10px] font-black text-blue-600">{formatTimeLeft()}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-1000 ease-linear rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </header>

        {error && (
          <div className="mb-8 p-5 bg-red-50 border-2 border-red-100 rounded-3xl flex items-center gap-3 text-red-700 animate-pulse">
            <TrendingDown className="w-6 h-6" />
            <span className="font-black uppercase text-xs tracking-widest">{error}</span>
          </div>
        )}

        {/* Global Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
           <StatCard 
              title="Bitcoin Global" 
              value={`$${formatNumber(data?.bitcoin)} USD`} 
              icon={Bitcoin} 
              color="bg-orange-500"
              subtitle="BTC/USDT Binance"
              change={data?.changes?.bitcoin_percent}
            />
            <StatCard 
              title="Tasa Remesa (AR-VE)" 
              value={`${formatNumber(data?.tasa_remesa)} VES`} 
              icon={ArrowRightLeft} 
              color="bg-emerald-500"
              subtitle="1 Peso AR Oficial = X VES"
            />
            <div className="bg-slate-900 rounded-3xl p-6 text-white flex flex-col justify-center border-b-4 border-blue-600 shadow-xl">
               <span className="text-[10px] uppercase font-black text-slate-500 mb-1 tracking-widest">Status de Mercado</span>
               <p className="text-lg font-black leading-tight uppercase tracking-tighter">Mercados operando OK</p>
            </div>
        </div>

        {/* Split Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-12">
          
          {/* Argentina Section */}
          <div className="space-y-10 flex flex-col h-full">
            <div className="flex items-center gap-3">
              <div className="w-12 h-7 bg-blue-500 rounded-lg shadow-md" />
              <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Argentina</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatCard 
                title="Dólar Oficial" 
                value={`$${formatNumber(data?.ar_oficial_venta)}`} 
                icon={TrendingUp} 
                color="bg-blue-600"
                buy={formatNumber(data?.ar_oficial_compra)}
                sell={formatNumber(data?.ar_oficial_venta)}
                change={data?.changes?.ar_oficial_percent}
              />
              <StatCard 
                title="Dólar Crypto" 
                value={`$${formatNumber(data?.ar_crypto_venta)}`} 
                icon={Bitcoin} 
                color="bg-purple-600"
                buy={formatNumber(data?.ar_crypto_compra)}
                sell={formatNumber(data?.ar_crypto_venta)}
                change={data?.changes?.ar_crypto_percent}
              />
            </div>

            <div className="flex-none h-[400px]">
              <RegionChart 
                title="Tendencia AR (Oficial)" 
                data={history} 
                dataKey="ar_oficial_venta" 
                color={{hex: '#2563eb', text: 'text-blue-600'}}
                icon={TrendingUp}
                singleLine={true}
              />
            </div>

            <div className="flex-1 bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
              <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                <Info className="w-4 h-4 text-slate-300" /> Otros Dólares AR
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {data?.all_ar_dolares?.filter(d => d.casa !== 'oficial' && d.casa !== 'cripto').map((d) => {
                  const percent = data?.changes?.otros_dolares_percents?.[d.casa] || 0;
                  const isPositive = percent > 0;
                  const isNeutral = percent === 0;
                  
                  return (
                    <div key={d.casa} className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all group">
                      <span className="font-black text-slate-500 uppercase text-xs tracking-tight">{d.nombre}</span>
                      <div className="flex items-center gap-3">
                        {percent !== undefined && (
                          <span className={`flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isNeutral ? 'text-slate-500 bg-slate-100' :
                            isPositive ? 'text-emerald-600 bg-emerald-100' : 'text-red-600 bg-red-100'
                          }`}>
                            {isNeutral ? <TrendingUp className="w-3 h-3 text-slate-400" /> : isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {Math.abs(percent).toFixed(2)}%
                          </span>
                        )}
                        <span className="font-black text-blue-700 text-lg group-hover:scale-110 transition-transform">$ {formatNumber(d.venta)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Venezuela Section */}
          <div className="space-y-10 flex flex-col h-full">
            <div className="flex items-center gap-3">
              <div className="w-12 h-7 bg-yellow-400 rounded-lg shadow-md" />
              <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Venezuela</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatCard 
                title="Dólar Oficial" 
                value={`${formatNumber(data?.ve_oficial)} VES`} 
                icon={ShieldCheck} 
                color="bg-blue-500"
                subtitle="Tasa Oficial BCV"
                change={data?.changes?.ve_oficial_percent}
              />
              <StatCard 
                title="Dólar Paralelo" 
                value={`${formatNumber(data?.ve_paralelo)} VES`} 
                icon={DollarSign} 
                color="bg-yellow-500"
                subtitle="Promedio Dólar Paralelo"
                change={data?.changes?.ve_paralelo_percent}
              />
            </div>

            <div className="flex-none h-[400px]">
              <RegionChart 
                title="Tendencia VE (Paralelo)" 
                data={history} 
                dataKey="ve_paralelo_venta" 
                color={{hex: '#eab308', text: 'text-yellow-500'}}
                icon={TrendingUp}
                singleLine={true}
              />
            </div>

            <div className="flex-1">
              <Converter data={data} />
            </div>
          </div>

        </div>

        {/* Global Footer with API Status */}
        <footer className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 px-8 py-6 z-50">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                <div className={`w-2 h-2 rounded-full ${data?.api_status.dolar_api_ar ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]`} />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">DolarApi AR</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                <div className={`w-2 h-2 rounded-full ${data?.api_status.dolar_api_ve ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]`} />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">DolarApi VE</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                <div className={`w-2 h-2 rounded-full ${data?.api_status.binance_api ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]`} />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Binance API</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
              <Globe className="w-4 h-4 text-blue-500" />
              © 2026 MarketDash • Financial Pulse
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
