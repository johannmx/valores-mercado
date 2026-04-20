import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  DollarSign, 
  TrendingUp, 
  ArrowRightLeft, 
  Bitcoin, 
  RefreshCw,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Globe,
  ShieldCheck,
  Monitor,
  CheckCircle2,
  Sun,
  Moon,
  ChevronDown,
  AlertTriangle,
  Github,
  Euro,
  X
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
import { isMarketOpen } from './utils/market';

declare global {
  interface Window {
    umami?: {
      track: (eventName: string, eventData?: Record<string, any>) => void;
    };
  }
}

interface AppNotification {
  id: number;
  message: string;
  type: 'up' | 'down';
  key: string;
}

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
  uyu_compra: number;
  uyu_venta: number;
  clp_compra: number;
  clp_venta: number;
  brl_compra: number;
  brl_venta: number;
  eur_compra: number;
  eur_venta: number;
  brl_ar: number;
  clp_ar: number;
  uyu_ar: number;
  changes: {
    usd_oficial_percent: number;
    usd_blue_percent: number;
    bitcoin_percent: number;
    ves_oficial_percent: number;
    ves_paralelo_percent: number;
    ves_eur_oficial_percent: number;
    ves_eur_paralelo_percent: number;
    uyu_percent: number;
    clp_percent: number;
    brl_percent: number;
    eur_percent: number;
    brl_ar_percent: number;
    clp_ar_percent: number;
    uyu_ar_percent: number;
    otros_dolares_percents: {
      tarjeta: number;
      mep: number;
      ccl: number;
    };
  };
  api_status: {
    dolar_api_ar: boolean;
    dolar_api_ve: boolean;
  };
}

interface HistoryItem {
  timestamp: string;
  [key: string]: any;
}

const formatNumber = (num: number | string | undefined | null): string => {
  if (num === undefined || num === null || num === '') return '';
  const n = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(n)) return num.toString();
  return n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  subtitle, 
  buy, 
  sell, 
  change, 
  badge,
  pulseType 
}: { 
  title: string; 
  value: string; 
  icon: any; 
  color: string;
  subtitle?: string;
  buy?: string;
  sell?: string;
  change?: number;
  badge?: string;
  pulseType?: 'up' | 'down';
}) => (
  <div className={`group relative bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-none hover:-translate-y-1 overflow-hidden ${
    pulseType === 'up' ? 'ring-2 ring-emerald-500 animate-pulse' : 
    pulseType === 'down' ? 'ring-2 ring-red-500 animate-pulse' : ''
  }`}>
    {/* Decorative background gradient */}
    <div className={`absolute -right-12 -top-12 w-48 h-48 rounded-full opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-700 ${color}`} />
    
    <div className="relative flex justify-between items-start mb-8">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em]">{title}</h3>
          {badge && (
            <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[8px] font-black rounded uppercase tracking-tighter">
              {badge}
            </span>
          )}
        </div>
        {subtitle && <p className="text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-wider">{subtitle}</p>}
      </div>
      <div className={`p-3.5 rounded-2xl ${color} text-white shadow-lg shadow-current/20 group-hover:scale-110 transition-transform duration-500`}>
        <Icon className="w-5 h-5" strokeWidth={2.5} />
      </div>
    </div>

    <div className="relative space-y-6">
      <div className="flex items-baseline gap-3">
        <span className="text-4xl font-black text-slate-800 dark:text-white tracking-tight group-hover:tracking-normal transition-all duration-500">{value}</span>
        {change !== undefined && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black border ${
            change >= 0 
              ? 'text-emerald-600 bg-emerald-50/50 border-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/20 dark:border-emerald-800/30' 
              : 'text-red-600 bg-red-50/50 border-red-100 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800/30'
          }`}>
            {change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(change).toFixed(2)}%
          </div>
        )}
      </div>

      {(buy || sell) && (
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-colors group/sub">
            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Compra</span>
            <span className="text-sm font-black text-slate-700 dark:text-slate-200 group-hover/sub:text-blue-600 transition-colors">${buy}</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-colors group/sub">
            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Venta</span>
            <span className="text-sm font-black text-slate-700 dark:text-slate-200 group-hover/sub:text-blue-600 transition-colors">${sell}</span>
          </div>
        </div>
      )}
    </div>
  </div>
);

const RegionChart = ({ title, data, dataKey, color, icon: Icon, singleLine }: { 
  title: string; 
  data: any[]; 
  dataKey?: string; 
  color: { hex: string; text: string }; 
  icon: any;
  singleLine?: boolean;
}) => (
  <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 h-full flex flex-col group">
    <div className="flex justify-between items-center mb-8">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl bg-slate-50 dark:bg-slate-900 ${color.text}`}>
          <Icon className="w-4 h-4" />
        </div>
        <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{title}</h3>
      </div>
      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 dark:bg-slate-900 rounded-full border border-slate-100 dark:border-slate-700/50">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Live</span>
      </div>
    </div>
    <div className="flex-1 min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`gradient-${dataKey || 'multi'}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color.hex} stopOpacity={0.15}/>
              <stop offset="95%" stopColor={color.hex} stopOpacity={0.01}/>
            </linearGradient>
            {dataKey === 'oficial_paralelo' && (
              <linearGradient id="gradient-paralelo" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#eab308" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#eab308" stopOpacity={0.01}/>
              </linearGradient>
            )}
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-700/50" />
          <XAxis 
            dataKey="timestamp" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }}
            tickFormatter={(val) => new Date(val).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
            minTickGap={30}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }}
            width={40}
            domain={['auto', 'auto']}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '16px',
              border: 'none',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              padding: '12px',
              backdropFilter: 'blur(8px)'
            }}
            labelStyle={{ fontWeight: 800, color: '#64748b', fontSize: '10px', marginBottom: '4px' }}
          />
          {singleLine ? (
            <Area 
              type="monotone" 
              dataKey={dataKey!} 
              stroke={color.hex} 
              strokeWidth={3}
              fillOpacity={1} 
              fill={`url(#gradient-${dataKey || 'multi'})`}
              animationDuration={1500}
            />
          ) : dataKey === 'oficial_paralelo' ? (
            <>
              <Area 
                type="monotone" 
                dataKey="usd_oficial" 
                stroke={color.hex} 
                strokeWidth={3}
                fillOpacity={1} 
                fill={`url(#gradient-${dataKey})`}
              />
              <Area 
                type="monotone" 
                dataKey="usd_blue" 
                stroke="#eab308" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#gradient-paralelo)"
              />
            </>
          ) : null}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const Converter = ({ data }: { data: MarketData | null }) => {
  const [amount, setAmount] = useState<string>('1');
  const [from, setFrom] = useState<string>('USD');
  const [to, setTo] = useState<string>('ARS');
  const [result, setResult] = useState<number>(0);

  useEffect(() => {
    if (!data) return;
    const rates: any = {
      USD: 1,
      ARS: data.usd_oficial,
      BLUE: data.usd_blue,
      VES: 1 / data.ves_oficial, // normalized to USD
      BRL: 1 / (data.usd_oficial / data.brl_ar),
      EUR: data.eur_venta / data.usd_oficial
    };

    const val = parseFloat(amount) || 0;
    const usdVal = from === 'USD' ? val : 
                  from === 'ARS' ? val / rates.ARS :
                  from === 'BLUE' ? val / rates.BLUE :
                  from === 'VES' ? val * data.ves_oficial :
                  from === 'EUR' ? val * (data.usd_oficial / data.eur_venta) : val;

    const final = to === 'USD' ? usdVal :
                 to === 'ARS' ? usdVal * rates.ARS :
                 to === 'BLUE' ? usdVal * rates.BLUE :
                 to === 'VES' ? usdVal / (1 / data.ves_oficial) :
                 to === 'EUR' ? usdVal * (data.eur_venta / data.usd_oficial) : usdVal;

    setResult(final);
  }, [amount, from, to, data]);

  return (
    <div className="bg-white dark:bg-slate-800 p-10 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-700">
      <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em] mb-10 flex items-center gap-3">
        <RefreshCw className="w-4 h-4 text-indigo-500" /> Conversor Rápido
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Monto</label>
          <input 
            type="number" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 p-5 rounded-2xl outline-none transition-all font-black text-xl text-slate-700 dark:text-white"
            placeholder="0.00"
          />
        </div>
        <div className="grid grid-cols-2 gap-4 md:col-span-2">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Desde</label>
            <div className="relative group">
              <select 
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full appearance-none bg-slate-50 dark:bg-slate-900 border-2 border-transparent group-hover:border-slate-200 dark:group-hover:border-slate-700 p-5 rounded-2xl outline-none transition-all font-black text-slate-700 dark:text-white cursor-pointer"
              >
                <option value="USD">🇺🇸 USD - Dólar</option>
                <option value="ARS">🇦🇷 ARS - Peso Ofi</option>
                <option value="BLUE">🇦🇷 ARS - Peso Blue</option>
                <option value="VES">🇻🇪 VES - Bolívar</option>
                <option value="EUR">🇪🇺 EUR - Euro</option>
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-hover:text-indigo-500 transition-colors" />
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hacia</label>
            <div className="relative group">
              <select 
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full appearance-none bg-slate-50 dark:bg-slate-900 border-2 border-transparent group-hover:border-slate-200 dark:group-hover:border-slate-700 p-5 rounded-2xl outline-none transition-all font-black text-slate-700 dark:text-white cursor-pointer"
              >
                <option value="ARS">🇦🇷 ARS - Peso Ofi</option>
                <option value="USD">🇺🇸 USD - Dólar</option>
                <option value="BLUE">🇦🇷 ARS - Peso Blue</option>
                <option value="VES">🇻🇪 VES - Bolívar</option>
                <option value="EUR">🇪🇺 EUR - Euro</option>
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-hover:text-indigo-500 transition-colors" />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-10 p-8 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-[24px] border border-indigo-100/50 dark:border-indigo-800/30 flex flex-col md:flex-row justify-between items-center gap-4 group">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-indigo-100 dark:border-indigo-900/50 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em]">Resultado Estimado</span>
        </div>
        <span className="text-4xl font-black text-indigo-700 dark:text-indigo-300 tracking-tight">{formatNumber(result)} <span className="text-sm uppercase text-indigo-400">{to}</span></span>
      </div>
    </div>
  );
};

const ToastNotification = ({ note, onDismiss }: { note: AppNotification; onDismiss: (id: number) => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(note.id), 5000);
    return () => clearTimeout(timer);
  }, [note.id, onDismiss]);

  return (
    <div className="flex items-center gap-4 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl p-4 pr-6 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 animate-in slide-in-from-right-full fade-in duration-500 pointer-events-auto">
      <div className={`p-2 rounded-xl ${note.type === 'up' ? 'bg-emerald-500' : 'bg-red-500'} text-white shadow-lg`}>
        {note.type === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
      </div>
      <div className="flex flex-col">
        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Actualización</span>
        <span className="text-[11px] font-black text-slate-700 dark:text-slate-200">{note.message}</span>
      </div>
      <button onClick={() => onDismiss(note.id)} className="ml-2 text-slate-300 hover:text-slate-500 transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

function App() {
  const [data, setData] = useState<MarketData | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [targetTime, setTargetTime] = useState(() => Date.now() + 300000);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    if (typeof localStorage !== 'undefined') {
      return (localStorage.getItem('theme') as 'light' | 'dark' | 'system') || 'system';
    }
    return 'system';
  });
  const [activeTab, setActiveTab] = useState<'Argentina' | 'Venezuela' | 'Conversor' | 'Latam'>('Argentina');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [changedKeys, setChangedKeys] = useState<Record<string, 'up' | 'down'>>({});

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    setTheme(nextTheme);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('theme', nextTheme);
    }
  };

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.toggle('dark', systemTheme === 'dark');
    } else {
      root.classList.toggle('dark', theme === 'dark');
    }
  }, [theme]);

  const addNotification = useCallback((message: string, type: 'up' | 'down', key: string) => {
    const id = Date.now();
    setNotifications(prev => [{ id, message, type, key }, ...prev].slice(0, 5));
    
    setChangedKeys(prev => ({ ...prev, [key]: type }));
    setTimeout(() => {
      setChangedKeys(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }, 5000);
  }, []);

  const dismissNotification = useCallback((id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const fetchData = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      
      const API_URL = (import.meta as any).env.VITE_API_URL || '';
      
      const [ratesRes, historyRes] = await Promise.all([
        axios.get(`${API_URL}/api/rates`),
        axios.get(`${API_URL}/api/history`)
      ]);

      if (data && ratesRes.data) {
        const keys = ['usd_blue', 'usd_oficial', 'ves_paralelo', 'usd_cripto'];
        keys.forEach(key => {
          if (ratesRes.data[key] > data[key as keyof MarketData]!) {
            addNotification(`${key.split('_').join(' ').toUpperCase()} subió a ${formatNumber(ratesRes.data[key])}`, 'up', key);
          } else if (ratesRes.data[key] < data[key as keyof MarketData]!) {
            addNotification(`${key.split('_').join(' ').toUpperCase()} bajó a ${formatNumber(ratesRes.data[key])}`, 'down', key);
          }
        });
      }

      setData(ratesRes.data);
      setHistory(historyRes.data);
      setLastUpdate(new Date());
      setTargetTime(Date.now() + 300000);
      setError(null);
      if (isInitial) setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Error de conexión con el servidor.');
      setLoading(false);
    }
  }, [data, addNotification]);

  useEffect(() => {
    fetchData(true);
    const interval = setInterval(() => fetchData(), 300000); // 5 min
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((targetTime - now) / 1000));
      setTimeLeft(remaining);
      setProgress(((300 - remaining) / 300) * 100);
      
      if (remaining === 0) {
        fetchData();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [targetTime, fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col items-center justify-center p-8 transition-colors duration-500">
        <div className="relative mb-12">
          <div className="w-24 h-24 border-8 border-indigo-50 dark:border-slate-800 rounded-full animate-pulse" />
          <div className="absolute inset-0 w-24 h-24 border-t-8 border-indigo-600 rounded-full animate-spin" />
        </div>
        <div className="text-center space-y-3">
          <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-widest">Sincronizando Mercados</h2>
          <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-[0.3em]">Financial Intelligence • Live Analysis</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-8">
        <div className="bg-white dark:bg-slate-800 p-12 rounded-[40px] shadow-2xl border border-red-100 dark:border-red-900/20 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-red-50 dark:bg-red-900/30 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-4 uppercase tracking-tighter">{error}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-10 leading-relaxed">No pudimos establecer conexión con los servicios de datos. Por favor, verifica tu conexión.</p>
          <button 
            onClick={() => fetchData(true)}
            className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-5 rounded-2xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-200 dark:shadow-none"
          >
            Reintentar Conexión
          </button>
        </div>
      </div>
    );
  }

  const marketOpen = isMarketOpen();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-700 selection:bg-indigo-100 selection:text-indigo-700 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-32">
        
        {/* Superior Status Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-4 rounded-[32px] border border-white dark:border-slate-700/50 shadow-sm">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 group cursor-pointer">
              <div className="bg-slate-900 dark:bg-white p-2.5 rounded-2xl group-hover:rotate-12 transition-transform duration-500">
                <Monitor className="w-5 h-5 text-white dark:text-slate-900" />
              </div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">Market<span className="text-indigo-600">Dash</span></h1>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden md:block" />
            <div className="hidden md:flex items-center gap-3">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
                marketOpen 
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-800/30 dark:text-emerald-400'
                  : 'bg-slate-100 border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${marketOpen ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-400'}`} />
                <span className="text-[10px] font-black uppercase tracking-widest">{marketOpen ? 'Mercado Abierto' : 'Mercado Cerrado'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex-1 md:w-48 space-y-1.5">
              <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <span>Próxima Sincro</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}s</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden p-[2px]">
                <div 
                  className="h-full bg-indigo-500 rounded-full transition-all duration-1000 ease-linear shadow-[0_0_8px_rgba(99,102,241,0.4)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <button 
              onClick={toggleTheme}
              className="p-3.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-700 transition-all hover:scale-110 active:rotate-45"
              title="Cambiar Tema"
            >
              {theme === 'light' ? <Sun className="w-5 h-5" /> : theme === 'dark' ? <Moon className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex justify-center mb-16">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-2 rounded-[28px] border border-white dark:border-slate-700/50 shadow-xl flex gap-1">
            {(['Argentina', 'Venezuela', 'Latam', 'Conversor'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  window.umami?.track('Tab Change', { tab });
                }}
                className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.25em] transition-all duration-500 ${
                  activeTab === tab 
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl shadow-slate-900/20 dark:shadow-white/10 scale-105' 
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </nav>

        {/* Content Area */}
        <div className="space-y-16">
          
          {/* Argentina Section */}
          {activeTab === 'Argentina' && (
            <div className="space-y-8 animate-in fade-in duration-700">
              <div className="flex items-center gap-3 px-1">
                <div className="w-1.5 h-6 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.3)]" />
                <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-[0.2em]">Mercado Argentina</h2>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-8">
                    <StatCard 
                      title="Dólar Oficial" 
                      value={`$${formatNumber(data?.usd_oficial)}`} 
                      icon={ShieldCheck} 
                      color="bg-blue-600"
                      subtitle="Tasa de Referencia BNA"
                      buy={formatNumber(data?.usd_oficial ? data.usd_oficial - 5 : 0)}
                      sell={formatNumber(data?.usd_oficial)}
                      change={data?.changes?.usd_oficial_percent}
                      pulseType={changedKeys['usd_oficial']}
                    />
                    <StatCard 
                      title="Dólar Blue" 
                      value={`$${formatNumber(data?.usd_blue)}`} 
                      icon={DollarSign} 
                      color="bg-yellow-500"
                      subtitle="Mercado Informal (Promedio)"
                      buy={formatNumber(data?.usd_blue ? data.usd_blue - 20 : 0)}
                      sell={formatNumber(data?.usd_blue)}
                      change={data?.changes?.usd_blue_percent}
                      pulseType={changedKeys['usd_blue']}
                    />
                  </div>
                  
                  <div className="space-y-8 h-full">
                    <div className="h-full">
                      <RegionChart 
                        title="Tendencia AR (Oficial vs Blue)" 
                        data={history} 
                        dataKey="oficial_paralelo" 
                        color={{hex: '#2563eb', text: 'text-blue-600'}}
                        icon={TrendingUp}
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <StatCard 
                      title="Dólar Cripto" 
                      value={`$${formatNumber(data?.usd_cripto)}`} 
                      icon={Bitcoin} 
                      color="bg-purple-600"
                      buy={formatNumber(data?.usd_cripto ? data.usd_cripto - 10 : 0)}
                      sell={formatNumber(data?.usd_cripto)}
                      change={data?.changes?.bitcoin_percent}
                      badge="24/7"
                      pulseType={changedKeys['usd_cripto']}
                    />
                    <div className="h-[440px]">
                      <RegionChart 
                        title="Tendencia AR (Cripto)" 
                        data={history} 
                        dataKey="usd_cripto" 
                        color={{hex: '#9333ea', text: 'text-purple-600'}}
                        icon={Bitcoin}
                        singleLine={true}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-8 flex flex-col h-full">
                  {/* Otros Dólares Card */}
                  <div className="flex-1 bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col">
                    <h3 className="text-[10px] font-black text-slate-300 dark:text-slate-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                      <Monitor className="w-4 h-4 text-slate-300 dark:text-slate-500" /> Otros Dólares AR
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className={`flex justify-between items-center p-5 rounded-2xl transition-all duration-500 group ${
                        changedKeys['usd_blue'] === 'up' ? 'bg-emerald-50 dark:bg-emerald-900/40 ring-2 ring-emerald-500 dark:ring-emerald-400' :
                        changedKeys['usd_blue'] === 'down' ? 'bg-red-50 dark:bg-red-900/40 ring-2 ring-red-500 dark:ring-red-400' :
                        'bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-transparent dark:border-slate-700/50'
                      }`}>
                        <span className="font-black text-slate-500 uppercase text-xs tracking-tight">Dólar Blue</span>
                        <div className="flex flex-col items-end">
                          <span className="font-black text-blue-700 dark:text-blue-400 text-lg group-hover:scale-110 transition-transform">$ {formatNumber(data?.usd_blue)}</span>
                          <span className={`text-[10px] font-bold ${(data?.changes?.usd_blue_percent ?? 0) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {(data?.changes?.usd_blue_percent ?? 0) >= 0 ? '+' : ''}{(data?.changes?.usd_blue_percent ?? 0).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-transparent dark:border-slate-700/50 transition-all group">
                        <span className="font-black text-slate-500 uppercase text-xs tracking-tight">Dólar Tarjeta</span>
                        <div className="flex flex-col items-end">
                          <span className="font-black text-blue-700 dark:text-blue-400 text-lg group-hover:scale-110 transition-transform">$ {formatNumber(data?.usd_tarjeta)}</span>
                          <span className={`text-[10px] font-bold ${(data?.changes?.otros_dolares_percents?.tarjeta ?? 0) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {(data?.changes?.otros_dolares_percents?.tarjeta ?? 0) >= 0 ? '+' : ''}{(data?.changes?.otros_dolares_percents?.tarjeta ?? 0).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-transparent dark:border-slate-700/50 transition-all group">
                        <span className="font-black text-slate-500 uppercase text-xs tracking-tight">Dólar MEP (Bolsa)</span>
                        <div className="flex flex-col items-end">
                          <span className="font-black text-blue-700 dark:text-blue-400 text-lg group-hover:scale-110 transition-transform">$ {formatNumber(data?.usd_mep)}</span>
                          <span className={`text-[10px] font-bold ${(data?.changes?.otros_dolares_percents?.mep ?? 0) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {(data?.changes?.otros_dolares_percents?.mep ?? 0) >= 0 ? '+' : ''}{(data?.changes?.otros_dolares_percents?.mep ?? 0).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-transparent dark:border-slate-700/50 transition-all group">
                        <span className="font-black text-slate-500 uppercase text-xs tracking-tight">CCL</span>
                        <div className="flex flex-col items-end">
                          <span className="font-black text-blue-700 dark:text-blue-400 text-lg group-hover:scale-110 transition-transform">$ {formatNumber(data?.usd_ccl)}</span>
                          <span className={`text-[10px] font-bold ${(data?.changes?.otros_dolares_percents?.ccl ?? 0) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {(data?.changes?.otros_dolares_percents?.ccl ?? 0) >= 0 ? '+' : ''}{(data?.changes?.otros_dolares_percents?.ccl ?? 0).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Otras Monedas Card */}
                  <div className="flex-1 bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col">
                    <h3 className="text-[10px] font-black text-slate-300 dark:text-slate-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-slate-300 dark:text-slate-500" /> Otras Monedas
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex justify-between items-center p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-transparent dark:border-slate-700/50 transition-all group">
                        <span className="font-black text-slate-500 uppercase text-xs tracking-tight">Euro Oficial</span>
                        <div className="flex flex-col items-end">
                          <span className="font-black text-indigo-700 dark:text-indigo-400 text-lg group-hover:scale-110 transition-transform">$ {formatNumber(data?.eur_venta)}</span>
                          <span className={`text-[10px] font-bold ${(data?.changes?.eur_percent ?? 0) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {(data?.changes?.eur_percent ?? 0) >= 0 ? '+' : ''}{(data?.changes?.eur_percent ?? 0).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-transparent dark:border-slate-700/50 transition-all group">
                        <span className="font-black text-slate-500 uppercase text-xs tracking-tight">Real Brasileño</span>
                        <div className="flex flex-col items-end">
                          <span className="font-black text-emerald-700 dark:text-emerald-400 text-lg group-hover:scale-110 transition-transform">$ {formatNumber(data?.brl_ar)}</span>
                          <span className={`text-[10px] font-bold ${(data?.changes?.brl_ar_percent ?? 0) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {(data?.changes?.brl_ar_percent ?? 0) >= 0 ? '+' : ''}{(data?.changes?.brl_ar_percent ?? 0).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-transparent dark:border-slate-700/50 transition-all group">
                        <span className="font-black text-slate-500 uppercase text-xs tracking-tight">Peso Chileno</span>
                        <div className="flex flex-col items-end">
                          <span className="font-black text-red-700 dark:text-red-400 text-lg group-hover:scale-110 transition-transform">$ {formatNumber(data?.clp_ar)}</span>
                          <span className={`text-[10px] font-bold ${(data?.changes?.clp_ar_percent ?? 0) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {(data?.changes?.clp_ar_percent ?? 0) >= 0 ? '+' : ''}{(data?.changes?.clp_ar_percent ?? 0).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-transparent dark:border-slate-700/50 transition-all group">
                        <span className="font-black text-slate-500 uppercase text-xs tracking-tight">Peso Uruguayo</span>
                        <div className="flex flex-col items-end">
                          <span className="font-black text-sky-700 dark:text-sky-400 text-lg group-hover:scale-110 transition-transform">$ {formatNumber(data?.uyu_ar)}</span>
                          <span className={`text-[10px] font-bold ${(data?.changes?.uyu_ar_percent ?? 0) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {(data?.changes?.uyu_ar_percent ?? 0) >= 0 ? '+' : ''}{(data?.changes?.uyu_ar_percent ?? 0).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Venezuela Section */}
          {activeTab === 'Venezuela' && (
            <div className="space-y-8 animate-in fade-in duration-700">
              <div className="flex items-center gap-3 px-1">
                <div className="w-1.5 h-6 bg-yellow-400 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.3)]" />
                <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-[0.2em]">Mercado Venezuela</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:col-span-1">
                  {/* Oficial Column */}
                  <div className="space-y-8">
                    <StatCard 
                      title="Dólar Oficial" 
                      value={`${formatNumber(data?.ves_oficial)} VES`} 
                      icon={ShieldCheck} 
                      color="bg-blue-500"
                      subtitle="Tasa Oficial BCV"
                      change={data?.changes?.ves_oficial_percent}
                      pulseType={changedKeys['ves_oficial']}
                    />
                    <div className="h-[440px]">
                      <RegionChart 
                        title="Tendencia VE (Oficial)" 
                        data={history} 
                        dataKey="ves_oficial" 
                        color={{hex: '#3b82f6', text: 'text-blue-500'}}
                        icon={ShieldCheck}
                        singleLine={true}
                      />
                    </div>
                  </div>

                  {/* Paralelo Column */}
                  <div className="space-y-8">
                    <StatCard 
                      title="Dólar Paralelo" 
                      value={`${formatNumber(data?.ves_paralelo)} VES`} 
                      icon={DollarSign} 
                      color="bg-yellow-500"
                      subtitle="Promedio Dólar Paralelo"
                      change={data?.changes?.ves_paralelo_percent}
                      pulseType={changedKeys['ves_paralelo']}
                    />
                    <div className="h-[440px]">
                      <RegionChart 
                        title="Tendencia VE (Paralelo)" 
                        data={history} 
                        dataKey="ves_paralelo" 
                        color={{hex: '#eab308', text: 'text-yellow-500'}}
                        icon={TrendingUp}
                        singleLine={true}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-8 flex flex-col h-full">
                  {/* Brecha Cambiaria Card */}
                  <div className="flex flex-col gap-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <StatCard 
                        title="Brecha Dólar" 
                        value={`${((data?.ves_paralelo && data?.ves_oficial) ? ((data.ves_paralelo / data.ves_oficial) - 1) * 100 : 0).toFixed(2)}%`} 
                        icon={ArrowRightLeft} 
                        color="bg-indigo-500"
                        subtitle="Diferencia Paralelo vs BCV"
                      />
                      <StatCard 
                        title="Brecha Euro" 
                        value={`${((data?.ves_eur_paralelo && data?.ves_eur_oficial) ? ((data.ves_eur_paralelo / data.ves_eur_oficial) - 1) * 100 : 0).toFixed(2)}%`} 
                        icon={ArrowRightLeft} 
                        color="bg-emerald-500"
                        subtitle="Diferencia Paralelo vs BCV"
                      />
                    </div>
                    
                    <div className="h-[300px]">
                      <RegionChart 
                        title="Tendencia (Brecha Cambiaria)" 
                        data={history.map(h => ({
                          ...h,
                          gap: (h.ves_oficial && h.ves_paralelo) ? ((h.ves_paralelo / h.ves_oficial) - 1) * 100 : 0
                        }))} 
                        dataKey="gap" 
                        color={{hex: '#6366f1', text: 'text-indigo-500'}}
                        icon={TrendingUp}
                        singleLine={true}
                      />
                    </div>
                  </div>

                  {/* Mercado Euro Card */}
                  <div className="flex-1 bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col h-full">
                    <h3 className="text-[10px] font-black text-slate-300 dark:text-slate-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                      <Euro className="w-4 h-4 text-slate-300 dark:text-slate-500" /> Mercado Euro VE
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex justify-between items-center p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-transparent dark:border-slate-700/50 transition-all group">
                        <span className="font-black text-slate-500 uppercase text-xs tracking-tight">Euro Oficial</span>
                        <div className="flex flex-col items-end">
                          <span className="font-black text-blue-700 dark:text-blue-400 text-lg group-hover:scale-110 transition-transform">{formatNumber(data?.ves_eur_oficial)} VES</span>
                          <span className={`text-[10px] font-bold ${(data?.changes?.ves_eur_oficial_percent ?? 0) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {(data?.changes?.ves_eur_oficial_percent ?? 0) >= 0 ? '+' : ''}{(data?.changes?.ves_eur_oficial_percent ?? 0).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-transparent dark:border-slate-700/50 transition-all group">
                        <span className="font-black text-slate-500 uppercase text-xs tracking-tight">Euro Paralelo</span>
                        <div className="flex flex-col items-end">
                          <span className="font-black text-yellow-700 dark:text-yellow-400 text-lg group-hover:scale-110 transition-transform">{formatNumber(data?.ves_eur_paralelo)} VES</span>
                          <span className={`text-[10px] font-bold ${(data?.changes?.ves_eur_paralelo_percent ?? 0) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {(data?.changes?.ves_eur_paralelo_percent ?? 0) >= 0 ? '+' : ''}{(data?.changes?.ves_eur_paralelo_percent ?? 0).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Latam Section */}
          {activeTab === 'Latam' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-700 slide-in-from-bottom-4">
              {/* Uruguay Section */}
              <div className="space-y-8">
                <div className="flex items-center gap-3 px-1">
                  <div className="w-1.5 h-6 bg-sky-500 rounded-full shadow-[0_0_10px_rgba(14,165,233,0.3)]" />
                  <h2 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-[0.2em]">Uruguay</h2>
                </div>
                <StatCard 
                  title="Peso Uruguayo" 
                  value={`${formatNumber(data?.uyu_venta)}`} 
                  subtitle="Valor del Dólar Oficial"
                  icon={Globe} 
                  color="bg-sky-600"
                  buy={formatNumber(data?.uyu_compra)}
                  sell={formatNumber(data?.uyu_venta)}
                  change={data?.changes?.uyu_percent}
                />
                <div className="h-[440px]">
                  <RegionChart 
                    title="Tendencia UYU" 
                    data={history} 
                    dataKey="uyu_venta" 
                    color={{hex: '#0284c7', text: 'text-sky-600'}}
                    icon={TrendingUp}
                    singleLine={true}
                  />
                </div>
              </div>

              {/* Chile Section */}
              <div className="space-y-8">
                <div className="flex items-center gap-3 px-1">
                  <div className="w-1.5 h-6 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.3)]" />
                  <h2 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-[0.2em]">Chile</h2>
                </div>
                <StatCard 
                  title="Peso Chileno" 
                  value={`${formatNumber(data?.clp_venta)}`} 
                  subtitle="Valor del Dólar Oficial"
                  icon={Globe} 
                  color="bg-red-600"
                  buy={formatNumber(data?.clp_compra)}
                  sell={formatNumber(data?.clp_venta)}
                  change={data?.changes?.clp_percent}
                />
                <div className="h-[440px]">
                  <RegionChart 
                    title="Tendencia CLP" 
                    data={history} 
                    dataKey="clp_venta" 
                    color={{hex: '#dc2626', text: 'text-red-600'}}
                    icon={TrendingUp}
                    singleLine={true}
                  />
                </div>
              </div>

              {/* Brasil Section */}
              <div className="space-y-8">
                <div className="flex items-center gap-3 px-1">
                  <div className="w-1.5 h-6 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                  <h2 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-[0.2em]">Brasil</h2>
                </div>
                <StatCard 
                   title="Real Brasileño" 
                  value={`${formatNumber(data?.brl_venta)}`} 
                  subtitle="Valor del Dólar Oficial"
                  icon={Globe} 
                  color="bg-emerald-600"
                  buy={formatNumber(data?.brl_compra)}
                  sell={formatNumber(data?.brl_venta)}
                  change={data?.changes?.brl_percent}
                />
                <div className="h-[440px]">
                  <RegionChart 
                    title="Tendencia BRL" 
                    data={history} 
                    dataKey="brl_venta" 
                    color={{hex: '#059669', text: 'text-emerald-600'}}
                    icon={TrendingUp}
                    singleLine={true}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Calculadora Section */}
          {activeTab === 'Conversor' && (
            <div className="space-y-8 animate-in fade-in duration-700 slide-in-from-bottom-4">
              <div className="flex items-center gap-3 px-1">
                <div className="w-1.5 h-6 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.3)]" />
                <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-[0.2em]">Calculadora</h2>
              </div>
              <Converter data={data} />
            </div>
          )}

        </div>

        {/* Global Footer with API Status and Contact */}
        <footer className="relative lg:fixed lg:bottom-0 lg:left-0 lg:right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 px-4 lg:px-8 py-2 lg:py-3 z-50 transition-colors duration-300">
          <div className="max-w-7xl mx-auto space-y-2 lg:space-y-3">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 lg:gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl transition-all border border-indigo-100 dark:border-indigo-800/50 shadow-sm">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${data?.api_status?.dolar_api_ar ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
                  <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em]">DOLAR API</span>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="hidden md:flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50 dark:bg-slate-800/50 px-4 py-2 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                  <span className="text-blue-500">Built with</span>
                  <div className="flex gap-2">
                    <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded text-[8px]">TypeScript</span>
                    <span className="px-1.5 py-0.5 bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400 rounded text-[8px]">React</span>
                    <span className="px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded text-[8px]">Tailwind</span>
                    <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded text-[8px]">Fastify</span>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-3">
                  <div className="flex flex-wrap justify-end gap-2">
                    {/* Status pill removed from here to be more prominent above */}
                  </div>
                  
                  <a 
                    href="https://github.com/johannmx/valores-mercado" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl hover:scale-110 active:scale-95 transition-all shadow-lg shadow-slate-200 dark:shadow-none"
                  >
                    <Github className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/50">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Globe className="w-3 h-3 text-blue-500" />
                Realizado por <span className="text-slate-900 dark:text-white">@johannmx</span>
              </div>
              <div className="flex items-center gap-4 text-[9px] font-black text-slate-300 dark:text-slate-500 uppercase tracking-[0.3em] teacher-none">
                © 2026 MarketDash • Financial Pulse
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Toast Notifications - Moved outside the overflow-x-hidden container */}
      <div className="fixed bottom-24 right-4 md:right-8 z-[100] flex flex-col gap-3 pointer-events-none">
        {notifications.map(note => (
          <ToastNotification
            key={note.id}
            note={note}
            onDismiss={dismissNotification}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
