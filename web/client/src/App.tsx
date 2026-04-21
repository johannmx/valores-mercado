import { useState, useEffect, useCallback } from 'react';
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
import { isMarketOpen, formatNumber } from './utils/market';

declare global {
  interface Window {
    umami?: {
      track: (eventName: string, eventData?: Record<string, string | number | boolean>) => void;
    };
    _env_?: {
      VITE_API_URL?: string;
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
  usd_oficial?: number;
  usd_blue?: number;
  usd_mep?: number;
  usd_ccl?: number;
  usd_cripto?: number;
  usd_tarjeta?: number;
  ves_oficial?: number;
  ves_paralelo?: number;
  ves_eur_oficial?: number;
  ves_eur_paralelo?: number;
  uyu_venta?: number;
  uyu_compra?: number;
  clp_venta?: number;
  clp_compra?: number;
  brl_venta?: number;
  brl_compra?: number;
  eur_venta?: number;
  btc_usd?: number;
  brl_ar?: number;
  clp_ar?: number;
  uyu_ar?: number;
  changes?: {
    usd_oficial_percent?: number;
    usd_blue_percent?: number;
    usd_mep_percent?: number;
    usd_ccl_percent?: number;
    usd_cripto_percent?: number;
    usd_tarjeta_percent?: number;
    ves_oficial_percent?: number;
    ves_paralelo_percent?: number;
    ves_eur_oficial_percent?: number;
    ves_eur_paralelo_percent?: number;
    uyu_percent?: number;
    clp_percent?: number;
    brl_percent?: number;
    eur_percent?: number;
    btc_percent?: number;
    brl_ar_percent?: number;
    clp_ar_percent?: number;
    uyu_ar_percent?: number;
  };
  api_status?: {
    dolar_api_ar?: boolean;
    dolar_api_ve?: boolean;
  };
}

interface HistoryItem {
  timestamp: string;
  usd_blue: number;
  usd_oficial: number;
  btc_usd: number;
}


interface StatCardProps {
  title: string;
  value: string;
  icon: any;
  color: string;
  subtitle?: string;
  buy?: string;
  sell?: string;
  change?: number;
  pulseType?: 'up' | 'down';
}

const StatCard = ({ title, value, icon: Icon, color, subtitle, buy, sell, change, pulseType }: StatCardProps) => {
  const isPositive = change !== undefined && change >= 0;
  
  return (
    <div className={`bg-white dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden h-full ${pulseType === 'up' ? 'ring-2 ring-emerald-500/50' : pulseType === 'down' ? 'ring-2 ring-red-500/50' : ''}`}>
      {pulseType && (
        <div className={`absolute inset-0 ${pulseType === 'up' ? 'bg-emerald-500/5' : 'bg-red-500/5'} animate-pulse`} />
      )}
      
      <div className="flex justify-between items-start mb-6">
        <div className={`p-3.5 rounded-2xl ${color} bg-opacity-10 dark:bg-opacity-20 group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
          <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black tracking-wider uppercase ${isPositive ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'}`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {isPositive ? '+' : ''}{change.toFixed(2)}%
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{title}</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter">
            {value}
          </span>
        </div>
        {subtitle && <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pt-1">{subtitle}</p>}
      </div>

      {(buy || sell) && (
        <div className="mt-6 pt-6 border-t border-slate-50 dark:border-slate-700/50 flex justify-between gap-4">
          <div className="flex-1">
            <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Compra</p>
            <p className="text-base font-black text-slate-700 dark:text-slate-200">{buy || '-'}</p>
          </div>
          <div className="w-px h-8 bg-slate-100 dark:bg-slate-700/50 self-end" />
          <div className="flex-1 text-right">
            <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Venta</p>
            <p className="text-base font-black text-slate-700 dark:text-slate-200">{sell || '-'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

interface ResultCardItem {
  label: string;
  value: string;
  highlight?: boolean;
  prefix?: string;
  suffix?: string;
}

interface ResultCardProps {
  title: string;
  items: ResultCardItem[];
  icon: any;
  color: {
    bg: string;
    text: string;
  };
}

const ResultCard = ({ title, items, icon: Icon, color }: ResultCardProps) => (
  <div className="bg-white dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-sm flex flex-col h-full hover:shadow-md transition-all duration-300">
    <div className="flex items-center gap-2 mb-6">
      <div className={`p-2 rounded-lg ${color.bg}`}>
        <Icon className={`w-4 h-4 ${color.text}`} />
      </div>
      <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{title}</h3>
    </div>
    <div className="space-y-4 flex-1">
      {items.map((item: ResultCardItem) => (
        <div key={item.label} className="flex justify-between items-center group">
          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tight group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">{item.label}</span>
          <div className="flex flex-col items-end">
            <span className={`text-lg font-black ${item.highlight ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-white'}`}>
              {item.prefix && <span className="mr-1">{item.prefix}</span>}
              {item.value}
              {item.suffix && <span className="ml-1 text-[10px] opacity-60">{item.suffix}</span>}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const Converter = ({ data }: { data: MarketData | null }) => {
  const [amount, setAmount] = useState<number>(1);
  const [from, setFrom] = useState<'USD' | 'ARS_BLUE' | 'ARS_OFFICIAL' | 'CRYPTO' | 'VES' | 'VES_OFFICIAL' | 'UYU' | 'CLP' | 'BRL' | 'EUR'>('USD');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const getRate = (type: string) => {
    if (!data) return 1;
    switch (type) {
      case 'ARS_BLUE': return data.usd_blue || 1;
      case 'ARS_OFFICIAL': return data.usd_oficial || 1;
      case 'CRYPTO': return data.usd_cripto || 1;
      case 'VES': return data.ves_paralelo || 1;
      case 'VES_OFFICIAL': return data.ves_oficial || 1;
      case 'UYU': return data.uyu_venta || 1;
      case 'CLP': return data.clp_venta || 1;
      case 'BRL': return data.brl_venta || 1;
      case 'EUR': return data.eur_venta || 1;
      default: return 1;
    }
  };

  const convert = (toType: string) => {
    const fromRate = getRate(from);
    const toRate = getRate(toType);
    
    // Si la moneda de origen es USD, simplemente multiplicamos por el destino
    if (from === 'USD') return amount * toRate;
    
    // Si la moneda de destino es USD, dividimos el monto por su tasa
    if (toType === 'USD') return amount / fromRate;
    
    // Si ninguna es USD, convertimos a USD primero y luego al destino
    const inUSD = amount / fromRate;
    return inUSD * toRate;
  };


  return (
    <div className="space-y-8">
      {/* Input Header Card */}
      <div className="bg-white dark:bg-slate-800/50 p-8 rounded-[40px] border border-slate-100 dark:border-slate-700/50 shadow-xl shadow-blue-500/5">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-1 w-full space-y-3">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2">Monto a Convertir</label>
            <div className="relative group">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-700/50 rounded-3xl py-6 px-8 text-3xl font-black text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-all placeholder:text-slate-300"
                placeholder="0.00"
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <div className="w-px h-10 bg-slate-200 dark:bg-slate-700/50 mr-4" />
                
                {/* Custom Currency Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-3 bg-white dark:bg-slate-800 px-5 py-3 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all active:scale-95"
                  >
                    <span className="text-sm font-black text-slate-700 dark:text-white uppercase tracking-wider">{from.replace('_', ' ')}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-2xl z-50 overflow-hidden py-2 animate-in fade-in zoom-in duration-200">
                      {[
                        { label: 'Dólar (USD)', value: 'USD' },
                        { label: 'Blue (ARS)', value: 'ARS_BLUE' },
                        { label: 'Oficial (ARS)', value: 'ARS_OFFICIAL' },
                        { label: 'Cripto (USDT)', value: 'CRYPTO' },
                        { label: 'Euro (EUR)', value: 'EUR' },
                        { label: 'Paralelo (VES)', value: 'VES' },
                        { label: 'Oficial (VES)', value: 'VES_OFFICIAL' },
                        { label: 'Peso Uruguayo', value: 'UYU' },
                        { label: 'Peso Chileno', value: 'CLP' },
                        { label: 'Real Brasil', value: 'BRL' }
                      ].map((option) => (
                        <div
                          key={option.value}
                          onClick={() => {
                            setFrom(option.value as typeof from);
                            setIsDropdownOpen(false);
                            if (window.umami) {
                              window.umami.track('Calculadora - Conversion', { moneda: option.value });
                            }
                          }}
                          className={`px-6 py-3.5 text-xs font-black uppercase tracking-wider cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${from === option.value ? 'text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-400/10' : 'text-slate-500 dark:text-slate-400'}`}
                        >
                          {option.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="hidden md:flex bg-blue-500 p-4 rounded-full text-white shadow-lg shadow-blue-500/20 active:rotate-180 transition-transform duration-500">
            <ArrowRightLeft className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <ResultCard 
          title="Argentina (ARS)"
          icon={Globe}
          color={{ bg: 'bg-sky-50 dark:bg-sky-500/10', text: 'text-sky-600 dark:text-sky-400' }}
          items={[
            { label: 'Dólar Blue', value: formatNumber(convert('ARS_BLUE')), prefix: '$', highlight: true },
            { label: 'Dólar Oficial', value: formatNumber(convert('ARS_OFFICIAL')), prefix: '$' },
            { label: 'Dólar Cripto', value: formatNumber(convert('CRYPTO')), prefix: '$' }
          ]}
        />
        
        <ResultCard 
          title="Venezuela (VES)"
          icon={ShieldCheck}
          color={{ bg: 'bg-yellow-50 dark:bg-yellow-500/10', text: 'text-yellow-600 dark:text-yellow-400' }}
          items={[
            { label: 'Dólar Paralelo', value: formatNumber(convert('VES')), suffix: 'VES', highlight: true },
            { label: 'Tasa Oficial BCV', value: formatNumber(convert('VES_OFFICIAL')), suffix: 'VES' }
          ]}
        />

        <ResultCard 
          title="Región & Mundo"
          icon={Globe}
          color={{ bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400' }}
          items={[
            { label: 'Euro Oficial', value: formatNumber(convert('EUR')), prefix: '€' },
            { label: 'Uruguay (UYU)', value: formatNumber(convert('UYU')), prefix: '$' },
            { label: 'Chile (CLP)', value: formatNumber(convert('CLP')), prefix: '$' },
            { label: 'Brasil (BRL)', value: formatNumber(convert('BRL')), prefix: 'R$' }
          ]}
        />
      </div>
    </div>
  );
};

interface RegionChartProps {
  title: string;
  data: any[];
  buyKey: string;
  sellKey: string;
  dataKey: string;
  color: string;
  icon: any;
}

const RegionChart = ({ title, data, buyKey, sellKey, dataKey, color, icon: Icon, }: RegionChartProps) => {
  return (
    <div className="bg-white dark:bg-slate-800/50 p-8 rounded-[40px] border border-slate-100 dark:border-slate-700/50 shadow-sm h-full flex flex-col group">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 group-hover:scale-110 transition-transform">
            <Icon className="w-5 h-5 text-slate-400" />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{title}</h3>
            <p className="text-[10px] font-bold text-slate-300 dark:text-slate-500 uppercase tracking-widest">Histórico 24 Horas</p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 w-full min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`color-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.15}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
            <XAxis 
              dataKey="timestamp" 
              hide={false}
              axisLine={false}
              tickLine={false}
              tick={{fontSize: 9, fontWeight: '900', fill: '#94a3b8'}}
              tickFormatter={(str: string) => {
                try {
                  return new Date(str).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                } catch {
                  return '';
                }
              }}
              minTickGap={30}
            />
            <YAxis hide domain={['auto', 'auto']} />
            <Tooltip 
              contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
              itemStyle={{fontWeight: '900', textTransform: 'uppercase', fontSize: '10px'}}
              labelStyle={{fontWeight: '900', marginBottom: '8px', color: '#64748b'}}
              labelFormatter={(label) => {
                try {
                  return label ? new Date(label as string).toLocaleString() : '';
                } catch {
                  return String(label);
                }
              }}
              formatter={(value) => [
                formatNumber(value as number),
                "VALOR"
              ] as [string, string]}
            />
            <Area 
              type="monotone" 
              dataKey={dataKey} 
              stroke={color} 
              strokeWidth={4}
              fillOpacity={1} 
              fill={`url(#color-${dataKey})`} 
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 flex gap-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{backgroundColor: color}} />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor Venta</span>
        </div>
      </div>
    </div>
  );
};

const ToastNotification = ({ note, onDismiss }: { note: AppNotification, onDismiss: (id: number) => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(note.id), 5000);
    return () => clearTimeout(timer);
  }, [note.id, onDismiss]);

  const isUp = note.type === 'up';

  return (
    <div 
      className={`flex items-center gap-4 p-4 rounded-2xl border shadow-2xl animate-in slide-in-from-right-full duration-500 pointer-events-auto bg-white dark:bg-slate-800 ${isUp ? 'border-emerald-100 dark:border-emerald-500/20 shadow-emerald-500/10' : 'border-red-100 dark:border-red-500/20 shadow-red-500/10'}`}
    >
      <div className={`p-2 rounded-xl ${isUp ? 'bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10' : 'bg-red-50 text-red-500 dark:bg-red-500/10'}`}>
        {isUp ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{note.key.replace('_', ' ')}</p>
        <p className="text-xs font-black text-slate-800 dark:text-white uppercase">{note.message}</p>
      </div>
      <button 
        onClick={() => onDismiss(note.id)}
        className="ml-4 p-1 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
      >
        <X className="w-4 h-4 text-slate-300" />
      </button>
    </div>
  );
};

function App() {
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<'AR' | 'VE' | 'LATAM' | 'CALC'>('AR');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [changedKeys, setChangedKeys] = useState<Record<string, 'up' | 'down'>>({});
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const addNotification = (key: string, type: 'up' | 'down', message: string) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, key, type, message }]);
  };

  const dismissNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      let baseURL = window._env_?.VITE_API_URL || import.meta.env.VITE_API_URL || '';
      
      // Sanitización: si la variable no se expandió correctamente o es el placeholder
      if (baseURL.includes('${VITE_API_URL}')) {
        baseURL = 'http://localhost:3001';
      }

      const [ratesRes, historyRes] = await Promise.all([
        axios.get(`${baseURL}/api/rates`),
        axios.get(`${baseURL}/api/history`)
      ]);
      
      const newData = ratesRes.data;
      const historyData = historyRes.data;

      // Check for significant changes to pulse cards and show notifications
      if (data) {
        const keysToTrack = ['usd_blue', 'usd_oficial', 'ves_paralelo', 'btc_usd'];
        const newChangedKeys: Record<string, 'up' | 'down'> = {};
        
        keysToTrack.forEach(key => {
          const oldVal = (data as any)[key];
          const newVal = (newData as any)[key];
          
          if (oldVal && newVal && oldVal !== newVal) {
            const type = newVal > oldVal ? 'up' : 'down';
            newChangedKeys[key] = type;
            addNotification(key, type, `Nuevo valor: ${formatNumber(newVal)}`);
          }
        });
        
        setChangedKeys(newChangedKeys);
        setTimeout(() => setChangedKeys({}), 3000);
      }

      setData(newData);
      setLastUpdated(new Date());
      
      // Merge current data into history for the charts
      const currentAsHistory = {
        timestamp: new Date().toISOString(),
        usd_blue: newData.usd_blue,
        usd_oficial: newData.usd_oficial,
        btc_usd: newData.btc_usd
      };
      
      setHistory([...historyData, currentAsHistory]);
      setError(null);
    } catch {
      setError('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="relative">
          <div className="w-24 h-24 border-[6px] border-blue-500/10 border-t-blue-500 rounded-full animate-spin" />
          <RefreshCw className="absolute inset-0 m-auto w-8 h-8 text-blue-500 animate-pulse" />
        </div>
        <div className="mt-10 space-y-3">
          <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-widest">Sincronizando Mercados</h2>
          <p className="text-slate-400 dark:text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em] animate-pulse">Obteniendo tasas en tiempo real...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 font-sans selection:bg-blue-500/30">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 md:py-12">
        {/* Header - More Premium and Minimal */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-8 mb-16">
          <div className="flex flex-col items-center md:items-start gap-1">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2.5 rounded-2xl shadow-xl shadow-blue-600/20 rotate-3">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white flex items-center gap-1">
                MARKET<span className="text-blue-600">DASH</span>
              </h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] ml-1.5">Inteligencia Financiera Real</p>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-3">
            <div className="bg-white dark:bg-slate-900/50 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center shadow-sm">
              <button 
                onClick={() => setActiveTab('AR')}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'AR' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
              >
                Argentina
              </button>
              <button 
                onClick={() => setActiveTab('VE')}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'VE' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
              >
                Venezuela
              </button>
              <button 
                onClick={() => setActiveTab('LATAM')}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'LATAM' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
              >
                LATAM
              </button>
              <button 
                onClick={() => setActiveTab('CALC')}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'CALC' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
              >
                Calculadora
              </button>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-3.5 bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-slate-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 shadow-sm transition-all active:scale-95"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button 
                onClick={fetchData} 
                disabled={isRefreshing}
                className={`p-3.5 bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-slate-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 shadow-sm transition-all active:scale-95 ${isRefreshing ? 'animate-spin' : ''}`}
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-8 p-6 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-[32px] flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="bg-red-500 p-2 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black text-red-400 dark:text-red-500 uppercase tracking-widest mb-0.5">Sistema en Alerta</p>
              <p className="text-sm font-black text-red-600 dark:text-red-400 uppercase">{error}</p>
            </div>
          </div>
        )}

        {/* Tab Content */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {activeTab === 'AR' && (
            <div className="space-y-12">
              <div className="flex items-center gap-4 px-4">
                <div className="w-1.5 h-6 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.3)]" />
                <h2 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-[0.2em]">Mercado Argentina</h2>
                <div className={`ml-auto flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800 ${isMarketOpen() ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' : 'bg-slate-50 text-slate-400 dark:bg-slate-800'}`}>
                  <div className={`w-2 h-2 rounded-full ${isMarketOpen() ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                  <span className="text-[9px] font-black uppercase tracking-widest">{isMarketOpen() ? 'Abierto' : 'Cerrado'}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <StatCard 
                  title="Dólar Blue" 
                  value={`$${formatNumber(data?.usd_blue)}`} 
                  subtitle="Valor de Mercado Informal"
                  icon={DollarSign} 
                  color="bg-blue-600"
                  change={data?.changes?.usd_blue_percent}
                  pulseType={changedKeys['usd_blue']}
                />
                <StatCard 
                  title="Dólar Oficial" 
                  value={`$${formatNumber(data?.usd_oficial)}`} 
                  subtitle="Tasa de Referencia BCRA"
                  icon={ShieldCheck} 
                  color="bg-sky-500"
                  change={data?.changes?.usd_oficial_percent}
                  pulseType={changedKeys['usd_oficial']}
                />
                <StatCard 
                  title="Dólar MEP" 
                  value={`$${formatNumber(data?.usd_mep)}`} 
                  subtitle="Bolsa (Dólar Financiero)"
                  icon={TrendingUp} 
                  color="bg-indigo-500"
                  change={data?.changes?.usd_mep_percent}
                />
                <StatCard 
                  title="Dólar Cripto" 
                  value={`$${formatNumber(data?.usd_cripto)}`} 
                  subtitle="Promedio USDT / P2P"
                  icon={Bitcoin} 
                  color="bg-orange-500"
                  change={data?.changes?.usd_cripto_percent}
                />
                <StatCard 
                  title="Dólar Tarjeta" 
                  value={`$${formatNumber(data?.usd_tarjeta)}`} 
                  subtitle="Oficial + Impuestos"
                  icon={Globe} 
                  color="bg-emerald-500"
                  change={data?.changes?.usd_tarjeta_percent}
                />
                <StatCard 
                  title="Euro Oficial" 
                  value={`$${formatNumber(data?.eur_venta)}`} 
                  subtitle="Referencia BCRA"
                  icon={Euro} 
                  color="bg-purple-500"
                  change={data?.changes?.eur_percent}
                />
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <RegionChart 
                  title="Evolución Dólar Blue" 
                  data={history} 
                  dataKey="usd_blue"
                  buyKey="usd_blue"
                  sellKey="usd_blue"
                  color="#2563eb" 
                  icon={TrendingUp}
                />
                <RegionChart 
                  title="Evolución Dólar Oficial" 
                  data={history} 
                  dataKey="usd_oficial"
                  buyKey="usd_oficial"
                  sellKey="usd_oficial"
                  color="#0ea5e9" 
                  icon={ShieldCheck}
                />
              </div>
            </div>
          )}

          {activeTab === 'VE' && (
            <div className="space-y-12">
              <div className="flex items-center gap-4 px-4">
                <div className="w-1.5 h-6 bg-yellow-500 rounded-full shadow-[0_0_10px_rgba(234,179,8,0.3)]" />
                <h2 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-[0.2em]">Mercado Venezuela</h2>
              </div>
              
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
                  
                  <div className="bg-white dark:bg-slate-800/50 p-8 rounded-[40px] border border-slate-100 dark:border-slate-700/50 shadow-sm">
                    <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                      <Euro className="w-3 h-3" />
                      Tasas Complementarias Oficiales
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
                    </div>
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
                  
                  <div className="bg-white dark:bg-slate-800/50 p-8 rounded-[40px] border border-slate-100 dark:border-slate-700/50 shadow-sm">
                    <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                      <Euro className="w-3 h-3" />
                      Tasas Complementarias Paralelas
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
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

          {activeTab === 'LATAM' && (
            <div className="space-y-12">
              <div className="flex items-center gap-4 px-4">
                <div className="w-1.5 h-6 bg-slate-500 rounded-full shadow-[0_0_10px_rgba(100,116,139,0.3)]" />
                <h2 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-[0.2em]">Mercado Regional</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                <div className="space-y-8">
                  <div className="flex items-center gap-3 px-4">
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
                      buyKey="uyu_venta"
                      sellKey="uyu_venta"
                      color="#0ea5e9" 
                      icon={TrendingUp}
                    />
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="flex items-center gap-3 px-4">
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
                      buyKey="clp_venta"
                      sellKey="clp_venta"
                      color="#ef4444" 
                      icon={TrendingUp}
                    />
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="flex items-center gap-3 px-4">
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
                      buyKey="brl_venta"
                      sellKey="brl_venta"
                      color="#10b981" 
                      icon={TrendingUp}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'CALC' && (
            <div className="space-y-12">
              <div className="flex items-center gap-4 px-4">
                <div className="w-1.5 h-6 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.3)]" />
                <h2 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-[0.2em]">Conversor Rápido</h2>
              </div>
              <Converter data={data} />
            </div>
          )}
        </div>

        {/* Footer - Premium Styling */}
        <footer className="mt-24 pt-12 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="flex flex-col items-center md:items-start gap-4">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.3em]">Market Dash</h3>
                <div className="w-1 h-1 rounded-full bg-blue-500" />
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">v2.4.0 Stable</span>
              </div>
              <div className="flex gap-4">
                <a href="https://github.com/johannmx/valores-mercado" target="_blank" rel="noopener noreferrer" className="p-3 bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-400 hover:text-blue-600 transition-colors shadow-sm">
                  <Github className="w-4 h-4" />
                </a>
                <a href="#" className="p-3 bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-400 hover:text-blue-600 transition-colors shadow-sm">
                  <Info className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="flex flex-col items-center md:items-end gap-2">
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
