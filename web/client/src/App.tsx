import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  Globe, 
  ArrowRightLeft, 
  Calculator, 
  AlertCircle,
  RefreshCw,
  Sun,
  Moon,
  ChevronRight,
  BarChart3,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Menu,
  Bell,
  X,
  Plus,
  ArrowRight,
  Flag,
  Percent,
  CheckCircle2,
  Coins,
  Scale
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
  PieChart,
  Pie
} from 'recharts';

// --- Types ---

interface MarketData {
  last_update: string;
  oficial?: {
    value_buy: number;
    value_sell: number;
    date: string;
  };
  blue?: {
    value_buy: number;
    value_sell: number;
    date: string;
  };
  mep?: {
    value_buy: number;
    value_sell: number;
    date: string;
  };
  ccl?: {
    value_buy: number;
    value_sell: number;
    date: string;
  };
  cripto?: {
    value_buy: number;
    value_sell: number;
    date: string;
  };
  tarjeta?: {
    value_buy: number;
    value_sell: number;
    date: string;
  };
  ves_oficial?: number;
  ves_paralelo?: number;
  ves_eur_oficial?: number;
  ves_eur_paralelo?: number;
  uyu_venta?: number;
  clp_venta?: number;
  brl_venta?: number;
  uyu_ar?: number;
  clp_ar?: number;
  brl_ar?: number;
  eur_ar?: number;
  btc_usd?: number;
  changes?: {
    usd_oficial_percent: number;
    usd_blue_percent: number;
    ves_paralelo_percent: number;
  };
  api_status?: {
    dolar_api_ar: boolean;
    dolar_api_ve: boolean;
    bluelytics_ar: boolean;
    bcv_ves: boolean;
  };
}

interface HistoryItem {
  timestamp: string;
  usd_blue: number;
  usd_oficial: number;
  ves_paralelo?: number;
  ves_oficial?: number;
}

// --- Utils ---

export const formatNumber = (num: number | string | undefined | null): string => {
  if (num === undefined || num === null || num === '') return '';
  const n = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(n)) return num.toString();
  return n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatTime = (isoString: string) => {
  return new Date(isoString).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
};

// --- Components ---

const StatCard = ({ title, value, icon: Icon, color, subtitle, trend, loading }: any) => (
  <div className=\"relative group\">
    <div className=\"absolute -inset-0.5 bg-gradient-to-r from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-3xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200\" />
    <div className=\"relative bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800/50 hover:border-indigo-500/30 dark:hover:border-indigo-500/30 transition-all duration-500\">
      <div className=\"flex justify-between items-start mb-4\">
        <div className={`p-3 rounded-2xl ${color} bg-opacity-10 dark:bg-opacity-20`}>
          <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black ${trend.isUp ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'}`}>
            {trend.isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {trend.value}
          </div>
        )}
      </div>
      <div>
        <h3 className=\"text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]\">{title}</h3>
        <div className=\"mt-1 flex items-baseline gap-2\">
          <span className=\"text-3xl font-black text-slate-900 dark:text-white tracking-tight\">
            {loading ? <div className=\"h-8 w-24 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg\" /> : value}
          </span>
        </div>
        {subtitle && <p className=\"mt-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest\">{subtitle}</p>}
      </div>
    </div>
  </div>
);

const RegionChart = ({ title, data, dataKey, buyKey, sellKey, color, icon: Icon, singleLine = false }: any) => (
  <div className=\"bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800/50 shadow-sm\">
    <div className=\"flex items-center justify-between mb-8\">
      <div className=\"flex items-center gap-4\">
        <div className={`p-2.5 rounded-xl ${color.text.replace('text-', 'bg-')} bg-opacity-10`}>
          <Icon className={`w-5 h-5 ${color.text}`} />
        </div>
        <h3 className=\"text-xs font-black text-slate-800 dark:text-white uppercase tracking-[0.2em]\">{title}</h3>
      </div>
      <div className=\"flex items-center gap-2\">
        <div className=\"flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/50\">
          <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: color.hex }} />
          <span className=\"text-[10px] font-black text-slate-500 uppercase tracking-wider\">Venta</span>
        </div>
        {!singleLine && (
          <div className=\"flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/50\">
            <div className=\"w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600\" />
            <span className=\"text-[10px] font-black text-slate-500 uppercase tracking-wider\">Compra</span>
          </div>
        )}
      </div>
    </div>
    <div className=\"h-[300px] w-full\">
      <ResponsiveContainer width=\"100%\" height=\"100%\">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id={`gradient-${title}`} x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\">
              <stop offset=\"5%\" stopColor={color.hex} stopOpacity={0.15}/>
              <stop offset=\"95%\" stopColor={color.hex} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray=\"3 3\" vertical={false} stroke=\"rgba(148, 163, 184, 0.1)\" />
          <XAxis 
            dataKey=\"timestamp\" 
            tickFormatter={formatTime}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 9, fontWeight: 800, fill: '#94a3b8' }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 9, fontWeight: 800, fill: '#94a3b8' }}
            domain={['auto', 'auto']}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#0f172a', 
              border: 'none', 
              borderRadius: '16px', 
              fontSize: '11px',
              fontWeight: 800,
              color: '#fff',
              boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
            }}
            itemStyle={{ color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}
            labelStyle={{ display: 'none' }}
          />
          {!singleLine && (
            <Area
              type=\"monotone\"
              dataKey={buyKey || \"usd_blue_buy\"}
              stroke=\"#94a3b8\"
              strokeWidth={2}
              strokeDasharray=\"5 5\"
              fill=\"transparent\"
            />
          )}
          <Area 
            type=\"monotone\" 
            dataKey={sellKey || dataKey} 
            stroke={color.hex} 
            strokeWidth={4}
            fillOpacity={1} 
            fill={`url(#gradient-${title})`} 
            animationDuration={2000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const Converter = ({ data }: { data: MarketData | null }) => {
  const [amount, setAmount] = useState<string>('100');
  const [sourceCurrency, setSourceCurrency] = useState('USD');
  const [targetCurrency, setTargetCurrency] = useState('ARS');

  const rates = useMemo(() => {
    if (!data) return {};
    return {
      USD: 1,
      ARS: data.blue?.value_sell || 1,
      VES: data.ves_paralelo || 1,
      UYU: data.uyu_ar ? (data.blue?.value_sell || 1) / data.uyu_ar : 1,
      BRL: data.brl_ar ? (data.blue?.value_sell || 1) / data.brl_ar : 1,
    };
  }, [data]);

  const result = useMemo(() => {
    const val = parseFloat(amount) || 0;
    const fromRate = (rates as any)[sourceCurrency] || 1;
    const toRate = (rates as any)[targetCurrency] || 1;
    return (val / fromRate) * toRate;
  }, [amount, sourceCurrency, targetCurrency, rates]);

  const currencies = [
    { code: 'USD', name: 'Dólar US', flag: '🇺🇸' },
    { code: 'ARS', name: 'Peso Argentino', flag: '🇦🇷' },
    { code: 'VES', name: 'Bolívar Digital', flag: '🇻🇪' },
    { code: 'UYU', name: 'Peso Uruguayo', flag: '🇺🇾' },
    { code: 'BRL', name: 'Real Brasileño', flag: '🇧🇷' },
  ];

  return (
    <div className=\"bg-white dark:bg-slate-900 rounded-[32px] p-8 lg:p-12 border border-slate-100 dark:border-slate-800/50 shadow-2xl\">
      <div className=\"flex flex-col lg:flex-row gap-12 items-center\">
        <div className=\"flex-1 w-full space-y-8\">
          <div className=\"space-y-4\">
            <label className=\"text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1\">Monto a Convertir</label>
            <div className=\"relative group\">
              <div className=\"absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500\" />
              <input
                type=\"number\"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className=\"relative w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-blue-500/50 rounded-2xl px-6 py-5 text-2xl font-black text-slate-800 dark:text-white outline-none transition-all\"
                placeholder=\"0.00\"
              />
            </div>
          </div>

          <div className=\"grid grid-cols-1 md:grid-cols-2 gap-6 relative\">
            <div className=\"space-y-4\">
              <label className=\"text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1\">De</label>
              <select 
                value={sourceCurrency}
                onChange={(e) => setSourceCurrency(e.target.value)}
                className=\"w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 font-bold text-slate-700 dark:text-slate-200 appearance-none outline-none focus:ring-2 focus:ring-blue-500/20\"
              >
                {currencies.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
              </select>
            </div>
            
            <div className=\"absolute left-1/2 top-[55%] -translate-x-1/2 -translate-y-1/2 z-10 hidden md:flex w-10 h-10 bg-blue-600 rounded-full items-center justify-center text-white shadow-lg\">
              <ArrowRightLeft size={16} />
            </div>

            <div className=\"space-y-4\">
              <label className=\"text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1\">A</label>
              <select 
                value={targetCurrency}
                onChange={(e) => setTargetCurrency(e.target.value)}
                className=\"w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 font-bold text-slate-700 dark:text-slate-200 appearance-none outline-none focus:ring-2 focus:ring-blue-500/20\"
              >
                {currencies.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className=\"w-full lg:w-px h-px lg:h-64 bg-slate-100 dark:bg-slate-800\" />

        <div className=\"flex-1 w-full text-center lg:text-left\">
          <div className=\"space-y-2\">
            <p className=\"text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]\">Resultado Estimado</p>
            <div className=\"flex items-center justify-center lg:justify-start gap-4\">
              <h2 className=\"text-5xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter\">
                {formatNumber(result)}
              </h2>
              <span className=\"text-2xl font-black text-blue-600\">{targetCurrency}</span>
            </div>
          </div>
          
          <div className=\"mt-12 grid grid-cols-2 gap-4\">
            {currencies.filter(c => c.code !== sourceCurrency).slice(0, 4).map(c => {
              const res = (parseFloat(amount) || 0) / (rates as any)[sourceCurrency] * (rates as any)[c.code];
              return (
                <div key={i} className=\"flex items-center justify-between p-5 bg-white dark:bg-slate-800/50 rounded-2xl border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/30 transition-all group\">
                  <span className=\"text-[11px] font-black text-slate-500 uppercase tracking-tight\">{res.label}</span>
                  <div className=\"text-right\">
                    <span className=\"text-[10px] font-bold text-slate-400 mr-1\">{res.prefix}</span>
                    <span className=\"text-xl font-black text-slate-800 dark:text-white tracking-tighter group-hover:scale-110 inline-block transition-transform\">{res.value}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className=\"pt-6 border-t border-slate-200 dark:border-slate-800\">
            <p className=\"text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase leading-relaxed tracking-widest text-center\">
              Valores basados en la cotización actual del mercado paralelo y oficial.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ToastNotification = ({ note, onDismiss }: { note: any, onDismiss: (id: string) => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(note.id), 5000);
    return () => clearTimeout(timer);
  }, [note.id, onDismiss]);

  return (
    <div className=\"bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-right-full duration-500 pointer-events-auto border border-white/10 dark:border-slate-200\">
      <div className=\"p-2 bg-indigo-500 rounded-xl\">
        <Bell className=\"w-4 h-4 text-white\" />
      </div>
      <div>
        <div className=\"text-[10px] font-black uppercase tracking-widest opacity-50 mb-0.5\">Notificación</div>
        <div className=\"text-sm font-bold\">{note.message}</div>
      </div>
      <button onClick={() => onDismiss(note.id)} className=\"ml-4 p-1 hover:bg-white/10 dark:hover:bg-slate-100 rounded-lg transition-colors\">
        <X className=\"w-4 h-4\" />
      </button>
    </div>
  );
};

// --- Main App Component ---

function App() {
  const [data, setData] = useState<MarketData | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'Argentina' | 'Venezuela' | 'Conversor' | 'Latam'>('Argentina');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [notifications, setNotifications] = useState<{id: string, message: string}[]>([]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const addNotification = (message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, message }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const fetchData = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const [marketRes, historyRes] = await Promise.all([
        axios.get(`${apiUrl}/api/market`),
        axios.get(`${apiUrl}/api/history`)
      ]);
      
      setData(marketRes.data);
      setHistory(historyRes.data);
      setError(null);
      addNotification('Datos actualizados correctamente');
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Error al sincronizar con los mercados financieros');
      addNotification('Error en la sincronización');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div className=\"min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] flex flex-col items-center justify-center p-8 transition-colors duration-500\">
        <div className=\"relative\">
          <div className=\"w-24 h-24 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin\" />
          <div className=\"absolute inset-0 flex items-center justify-center\">
            <Activity className=\"w-8 h-8 text-blue-600 animate-pulse\" />
          </div>
        </div>
        <div className=\"mt-8 text-center space-y-2\">
          <h2 className=\"text-2xl font-black text-slate-800 dark:text-white tracking-tight\">MarketDash</h2>
          <p className=\"text-[10px] font-black text-slate-400 uppercase tracking-widest\">Sincronizando Pulso Financiero...</p>
        </div>
      </div>
    );
  }

  return (
    <div className=\"min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 transition-colors duration-500 selection:bg-indigo-500 selection:text-white\">
      {/* Dynamic Background Elements */}
      <div className=\"fixed inset-0 overflow-hidden pointer-events-none\">
        <div className=\"absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[120px] animate-pulse\" />
        <div className=\"absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[100px]\" />
        <div className=\"absolute -bottom-[5%] left-[20%] w-[35%] h-[35%] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[110px] animate-pulse\" />
      </div>

      <div className=\"relative flex flex-col min-h-screen\">
        {/* Navigation Bar */}
        <header className=\"sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800/50 px-4 lg:px-8 py-4 transition-all duration-300\">
          <div className=\"max-w-7xl mx-auto flex items-center justify-between\">
            <div className=\"flex items-center gap-4 group cursor-pointer\" onClick={() => fetchData()}>
              <div className=\"relative\">
                <div className=\"w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl rotate-3 group-hover:rotate-12 transition-transform duration-500 shadow-lg shadow-indigo-500/20 flex items-center justify-center\">
                  <Activity className=\"w-6 h-6 text-white\" />
                </div>
                <div className=\"absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full\" />
              </div>
              <div className=\"hidden sm:block\">
                <h1 className=\"text-xl font-black text-slate-900 dark:text-white tracking-tighter\">MarketDash</h1>
                <div className=\"flex items-center gap-2\">
                  <span className=\"w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse\" />
                  <span className=\"text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest\">En Vivo • 1m update</span>
                </div>
              </div>
            </div>

            <div className=\"flex items-center gap-2 sm:gap-4\">
              <div className=\"hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-700/50\">
                <button className=\"px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm transition-all\">Dashboard</button>
                <button className=\"px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all\">Alertas</button>
              </div>
              
              <div className=\"h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block\" />
              
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className=\"p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all group\"
              >
                {isDarkMode ? <Sun className=\"w-5 h-5 text-amber-400 group-hover:rotate-90 transition-transform duration-500\" /> : <Moon className=\"w-5 h-5 text-indigo-600 group-hover:-rotate-12 transition-transform duration-500\" />}
              </button>

              <button className=\"p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 sm:hidden\">
                <Menu className=\"w-5 h-5 text-slate-600 dark:text-slate-400\" />
              </button>
            </div>
          </div>
        </header>

        <main className=\"flex-1 w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-12\">
          {/* Dashboard Header */}
          <div className=\"flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12\">
            <div className=\"space-y-2\">
              <div className=\"flex items-center gap-2\">
                <span className=\"px-2.5 py-1 bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-blue-200/30 dark:border-blue-500/20\">
                  Real-time Markets
                </span>
                {error && (
                  <span className=\"px-2.5 py-1 bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-rose-200/30 dark:border-rose-500/20 flex items-center gap-1.5 animate-pulse\">
                    <AlertCircle size={10} /> Sync Error
                  </span>
                )}
              </div>
              <h2 className=\"text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tighter\">
                {activeTab === 'Argentina' && 'Mercado Argentina'}
                {activeTab === 'Venezuela' && 'Mercado Venezuela'}
                {activeTab === 'Latam' && 'Mercados Regionales'}
                {activeTab === 'Conversor' && 'Calculadora Global'}
              </h2>
            </div>

            <button 
              onClick={() => fetchData()}
              disabled={loading}
              className=\"group flex items-center gap-2 px-6 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 dark:shadow-none hover:scale-105 active:scale-95 transition-all\"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'} />
              Actualizar
            </button>
          </div>

          {/* Centered Navigation */}
          <nav className=\"flex justify-center mb-16\">
            <div className=\"bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-2 rounded-[28px] border border-white dark:border-slate-700/50 shadow-xl flex gap-1\">
              {[
                { id: 'Argentina', label: 'Argentina' },
                { id: 'Venezuela', label: 'Venezuela' },
                { id: 'Latam', label: 'LATAM' },
                { id: 'Conversor', label: 'Calculadora' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-8 py-3 rounded-2xl text-sm font-black transition-all duration-500 relative overflow-hidden group ${
                    activeTab === tab.id 
                      ? 'text-white shadow-lg' 
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  {activeTab === tab.id && (
                    <div className=\"absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 animate-in fade-in zoom-in duration-500\" />
                  )}
                  <span className=\"relative z-10\">{tab.label}</span>
                </button>
              ))}
            </div>
          </nav>


          {/* Main Content Sections */}
          <div className=\"max-w-7xl mx-auto\">
            
            {/* Argentina Section */}
            {activeTab === 'Argentina' && (
              <div className=\"space-y-12 animate-in fade-in duration-700 slide-in-from-bottom-4\">
                <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8\">
                  <StatCard 
                    title=\"Dólar Blue\" 
                    value={`$ ${formatNumber(data?.blue?.value_sell)}`} 
                    icon={DollarSign} 
                    color=\"bg-blue-600\"
                    subtitle=\"Cotización Informal\"
                    trend={{ value: `${(data?.changes?.usd_blue_percent ?? 0).toFixed(2)}%`, isUp: (data?.changes?.usd_blue_percent ?? 0) >= 0 }}
                  />
                  <StatCard 
                    title=\"Dólar MEP\" 
                    value={`$ ${formatNumber(data?.mep?.value_sell)}`} 
                    icon={Activity} 
                    color=\"bg-indigo-500\"
                    subtitle=\"Bolsa\"
                  />
                  <StatCard 
                    title=\"Dólar CCL\" 
                    value={`$ ${formatNumber(data?.ccl?.value_sell)}`} 
                    icon={Globe} 
                    color=\"bg-emerald-500\"
                    subtitle=\"Contado con Liqui\"
                  />
                  <StatCard 
                    title=\"Dólar Oficial\" 
                    value={`$ ${formatNumber(data?.oficial?.value_sell)}`} 
                    icon={CheckCircle2} 
                    color=\"bg-slate-600\"
                    subtitle=\"Banco Nación\"
                  />
                </div>

                <div className=\"grid grid-cols-1 lg:grid-cols-2 gap-8\">
                  <RegionChart 
                    title=\"Dólar Blue (Tendencia)\" 
                    data={history} 
                    buyKey=\"usd_blue_buy\"
                    sellKey=\"usd_blue\"
                    color={{hex: '#2563eb', text: 'text-blue-500', buyHex: '#94a3b8'}}
                    icon={TrendingUp}
                  />
                  <RegionChart 
                    title=\"Brecha Cambiaria %\" 
                    data={history.map(h => ({
                      ...h,
                      gap: ((h.usd_blue / h.usd_oficial) - 1) * 100
                    }))} 
                    dataKey=\"gap\" 
                    color={{hex: '#6366f1', text: 'text-indigo-500'}}
                    icon={ArrowRightLeft}
                    singleLine={true}
                  />
                </div>
              </div>
            )}

            {/* Venezuela Section */}
            {activeTab === 'Venezuela' && (
              <div className=\"space-y-12 animate-in fade-in duration-700 slide-in-from-bottom-4\">
                <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8\">
                  <StatCard 
                    title=\"Dólar Paralelo\" 
                    value={`Bs. ${formatNumber(data?.ves_paralelo)}`} 
                    icon={Zap} 
                    color=\"bg-amber-500\"
                    subtitle=\"EnParaleloVzla\"
                    trend={{ value: `${(data?.changes?.ves_paralelo_percent ?? 0).toFixed(2)}%`, isUp: (data?.changes?.ves_paralelo_percent ?? 0) >= 0 }}
                  />
                  <StatCard 
                    title=\"Dólar Oficial\" 
                    value={`Bs. ${formatNumber(data?.ves_oficial)}`} 
                    icon={Globe} 
                    color=\"bg-emerald-600\"
                    subtitle=\"BCV (Referencia)\"
                  />
                  <StatCard 
                    title=\"Bitcoin / USD\" 
                    value={`US$ ${formatNumber(data?.btc_usd)}`} 
                    icon={Coins} 
                    color=\"bg-orange-500\"
                    subtitle=\"Mercado Cripto\"
                  />
                </div>

                <div className=\"grid grid-cols-1 lg:grid-cols-2 gap-8\">
                  <RegionChart 
                    title=\"Tendencia VES/USD\" 
                    data={history} 
                    buyKey=\"ves_oficial\"
                    sellKey=\"ves_paralelo\"
                    color={{hex: '#f59e0b', text: 'text-amber-500', buyHex: '#10b981'}}
                    icon={Activity}
                  />
                  <div className=\"flex-1 bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col h-full\">
                    <h3 className=\"text-[10px] font-black text-slate-300 dark:text-slate-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-2\">
                      <BarChart3 className=\"w-4 h-4 text-emerald-500\" /> Mercado Euro (VES)
                    </h3>
                    <div className=\"flex-1 space-y-6 flex flex-col justify-center\">
                      <div className=\"flex justify-between items-center p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all\">
                        <span className=\"font-black text-slate-500 uppercase text-xs tracking-tight\">Euro Paralelo</span>
                        <span className=\"font-black text-slate-800 dark:text-white text-xl\">Bs. {formatNumber(data?.ves_eur_paralelo)}</span>
                      </div>
                      <div className=\"flex justify-between items-center p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all\">
                        <span className=\"font-black text-slate-500 uppercase text-xs tracking-tight\">Euro BCV</span>
                        <span className=\"font-black text-slate-800 dark:text-white text-xl\">Bs. {formatNumber(data?.ves_eur_oficial)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* LATAM Section */}
            {activeTab === 'Latam' && (
              <div className=\"grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-700 slide-in-from-bottom-4\">
                {/* Uruguay Section */}
                <div className=\"space-y-8\">
                  <div className=\"flex items-center gap-3 px-1\">
                    <div className=\"w-1.5 h-6 bg-sky-500 rounded-full shadow-[0_0_10px_rgba(14,165,233,0.3)]\" />
                    <h2 className=\"text-lg font-black text-slate-800 dark:text-white uppercase tracking-[0.2em]\">Uruguay</h2>
                  </div>
                  <StatCard 
                    title=\"Peso Uruguayo\" 
                    value={`$U ${formatNumber(data?.uyu_venta)}`} 
                    icon={Globe} 
                    color=\"bg-sky-500\"
                    subtitle=\"Cotización Interbancaria\"
                  />
                  <div className=\"h-[300px]\">
                    <RegionChart 
                      title=\"Tendencia UYU\" 
                      data={history} 
                      dataKey=\"uyu_venta\" 
                      color={{hex: '#0ea5e9', text: 'text-sky-500'}}
                      icon={Activity}
                      singleLine={true}
                    />
                  </div>
                </div>

                {/* Chile Section */}
                <div className=\"space-y-8\">
                  <div className=\"flex items-center gap-3 px-1\">
                    <div className=\"w-1.5 h-6 bg-rose-500 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.3)]\" />
                    <h2 className=\"text-lg font-black text-slate-800 dark:text-white uppercase tracking-[0.2em]\">Chile</h2>
                  </div>
                  <StatCard 
                    title=\"Peso Chileno\" 
                    value={`CLP$ ${formatNumber(data?.clp_venta)}`} 
                    icon={TrendingUp} 
                    color=\"bg-rose-500\"
                    subtitle=\"Valor del Día\"
                  />
                  <div className=\"h-[300px]\">
                    <RegionChart 
                      title=\"Tendencia CLP\" 
                      data={history} 
                      dataKey=\"clp_venta\" 
                      color={{hex: '#f43f5e', text: 'text-rose-500'}}
                      icon={TrendingUp}
                      singleLine={true}
                    />
                  </div>
                </div>

                {/* Regional Stats */}
                <div className=\"space-y-8\">
                  <div className=\"flex items-center gap-3 px-1\">
                    <div className=\"w-1.5 h-6 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.3)]\" />
                    <h2 className=\"text-lg font-black text-slate-800 dark:text-white uppercase tracking-[0.2em]\">Estadísticas</h2>
                  </div>
                  <div className=\"bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-12\">
                    <div className=\"space-y-6\">
                      <h3 className=\"text-[10px] font-black text-slate-400 uppercase tracking-widest\">Índice de Confianza</h3>
                      <div className=\"flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl\">
                        <PieChart width={120} height={120}>
                          <Pie
                            data={[
                              { name: 'Oficial', value: 30 },
                              { name: 'Blue', value: 70 },
                            ]}
                            innerRadius={45}
                            outerRadius={60}
                            paddingAngle={5}
                            dataKey=\"value\"
                          >
                            <Cell fill=\"#2563eb\" />
                            <Cell fill=\"#f59e0b\" />
                          </Pie>
                        </PieChart>
                      </div>
                    </div>
                    <div className=\"space-y-6\">
                      <h3 className=\"text-[10px] font-black text-slate-400 uppercase tracking-widest\">Sincronización API</h3>
                      <div className=\"space-y-4\">
                        {['DolarAPI AR', 'BCV VES', 'Bluelytics'].map((api, i) => (
                          <div key={i} className=\"flex items-center justify-between\">
                            <span className=\"text-xs font-bold text-slate-600 dark:text-slate-400\">{api}</span>
                            <div className=\"flex items-center gap-2\">
                              <div className=\"w-2 h-2 bg-emerald-500 rounded-full\" />
                              <span className=\"text-[10px] font-black text-emerald-600 uppercase\">Activo</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Conversor Section */}
            {activeTab === 'Conversor' && (
              <div className=\"animate-in fade-in duration-700 slide-in-from-bottom-4\">
                <Converter data={data} />
              </div>
            )}

          </div>
        </main>

        <footer className=\"relative lg:fixed lg:bottom-0 lg:left-0 lg:right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 px-4 lg:px-8 py-2 lg:py-3 z-50 transition-colors duration-300\">
          <div className=\"max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2\">
            <div className=\"flex items-center gap-4 text-[9px] font-black text-slate-300 dark:text-slate-500 uppercase tracking-[0.3em] teacher-none\">
              © 2026 MarketDash • Financial Pulse
            </div>
            
            <div className=\"flex items-center gap-6\">
              <div className=\"flex items-center gap-4\">
                <div className=\"flex items-center gap-2 group\">
                  <div className=\"w-2 h-2 bg-emerald-500 rounded-full group-hover:scale-125 transition-transform\" />
                  <span className=\"text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest\">
                    Server: <span className=\"text-emerald-500\">Online</span>
                  </span>
                </div>
              </div>
              <div className=\"h-4 w-px bg-slate-200 dark:bg-slate-800\" />
              <a 
                href=\"https://github.com/johannmx/valores-mercado\" 
                target=\"_blank\" 
                rel=\"noopener noreferrer\"
                className=\"p-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl hover:scale-110 active:scale-95 transition-all shadow-lg shadow-slate-200 dark:shadow-none\"
              >
                <Globe size={14} />
              </a>
            </div>
          </div>
        </footer>

        {/* Notifications Area */}
        <div className=\"fixed top-24 right-8 z-[100] flex flex-col gap-4 pointer-events-none\">
          {notifications.map(note => (
            <ToastNotification 
              key={note.id} 
              note={note} 
              onDismiss={removeNotification} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
