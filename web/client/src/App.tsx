import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  ArrowRightLeft, 
  Globe, 
  Github, 
  DollarSign, 
  Activity,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Clock,
  Zap,
  BarChart3,
  Moon,
  Sun,
  X,
  CheckCircle2,
  AlertCircle,
  Copy,
  LayoutDashboard,
  Coins,
  History as HistoryIcon,
  Search,
  Bell,
  Menu,
  MoreVertical,
  Filter,
  Download,
  Share2
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceLine
} from 'recharts';

// --- Types ---

interface MarketData {
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
  oficial_euro?: {
    value_buy: number;
    value_sell: number;
    date: string;
  };
  blue_euro?: {
    value_buy: number;
    value_sell: number;
    date: string;
  };
  ves_oficial?: number;
  ves_paralelo?: number;
  ves_eur_oficial?: number;
  ves_eur_paralelo?: number;
  uyu_ar?: number;
  clp_ar?: number;
  brl_ar?: number;
  eur_ar?: number;
  uyu_venta?: number;
  clp_venta?: number;
  brl_venta?: number;
  eur_venta?: number;
  btc_usd?: number;
  last_update?: string;
  api_status?: {
    dolar_api_ar: boolean;
    bcv_ves: boolean;
    bluelytics_ar: boolean;
  };
  changes?: {
    usd_blue_percent: number;
    ves_paralelo_percent: number;
    brl_ar_percent: number;
    clp_ar_percent: number;
    uyu_ar_percent: number;
  };
}

interface ResultCardItem {
  label: string;
  value: string | number;
  highlight?: boolean;
  prefix?: string;
  suffix?: string;
}

interface ResultCardProps {
  title: string;
  items: ResultCardItem[];
  icon: React.ElementType;
  color: {
    bg: string;
    text: string;
  };
}

interface RegionChartProps {
  title: string;
  data: HistoryItem[];
  buyKey?: string;
  sellKey?: string;
  dataKey?: string;
  color: {
    text: string;
    hex?: string;
    buyHex?: string;
    sellHex?: string;
  };
  icon: React.ElementType;
  singleLine?: boolean;
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
  uyu_venta: number;
  clp_venta: number;
  brl_venta: number;
  eur_venta: number;
  btc_usd: number;
}

export const formatNumber = (num: number | string | undefined | null): string => {
  if (num === undefined || num === null || num === '') return '';
  const n = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(n)) return num.toString();
  return n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// --- Components ---

const StatCard = ({ title, value, icon: Icon, color, subtitle, trend }: { 
  title: string, 
  value: string, 
  icon: any, 
  color: string, 
  subtitle?: string,
  trend?: { value: string, isUp: boolean }
}) => (
  <div className=\"group bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 overflow-hidden relative\">
    <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full opacity-[0.03] dark:opacity-[0.05] group-hover:scale-150 transition-transform duration-700 ${color}`} />
    
    <div className=\"relative z-10\">
      <div className=\"flex items-center justify-between mb-6\">
        <div className={`p-3 rounded-2xl ${color.replace('bg-', 'bg-opacity-10 ')} ${color.replace('bg-', 'text-')} transition-colors duration-300`}>
          <Icon className=\"w-6 h-6\" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider ${trend.isUp ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'}`}>
            {trend.isUp ? <TrendingUp className=\"w-3 h-3\" /> : <TrendingDown className=\"w-3 h-3\" />}
            {trend.value}
          </div>
        )}
      </div>
      
      <div className=\"space-y-1\">
        <h3 className=\"text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]\">{title}</h3>
        <div className=\"flex items-baseline gap-1\">
          <span className=\"text-2xl font-black text-slate-800 dark:text-white tracking-tighter\">{value}</span>
        </div>
        {subtitle && <p className=\"text-[10px] font-medium text-slate-400 dark:text-slate-500\">{subtitle}</p>}
      </div>
    </div>
  </div>
);

const RegionChart = ({ title, data, buyKey, sellKey, dataKey, color, icon: Icon, singleLine }: RegionChartProps) => {
  const chartColor = color.hex || '#6366f1';
  
  return (
    <div className=\"bg-white dark:bg-slate-800 p-8 rounded-[32px] border border-slate-100 dark:border-slate-700/50 shadow-sm flex flex-col h-full group hover:shadow-xl transition-all duration-500\">
      <div className=\"flex items-center justify-between mb-8\">
        <div className=\"flex items-center gap-4\">
          <div className={`p-2.5 rounded-xl ${color.text.replace('text-', 'bg-').replace('500', '50')} dark:${color.text.replace('text-', 'bg-').replace('500', '900/30')} ${color.text} transition-colors duration-300`}>
            <Icon className=\"w-5 h-5\" />
          </div>
          <h3 className=\"text-xs font-black text-slate-800 dark:text-white uppercase tracking-[0.2em]\">{title}</h3>
        </div>
        <div className=\"flex gap-2\">
          <div className=\"w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700\" />
          <div className=\"w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700\" />
        </div>
      </div>
      
      <div className=\"flex-1 min-h-[240px] w-full\">
        <ResponsiveContainer width=\"100%\" height=\"100%\">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`gradient-${title}`} x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\">
                <stop offset=\"5%\" stopColor={chartColor} stopOpacity={0.15}/>
                <stop offset=\"95%\" stopColor={chartColor} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray=\"3 3\" vertical={false} stroke=\"#f1f5f9\" className=\"dark:stroke-slate-700/50\" />
            <XAxis 
              dataKey=\"timestamp\" 
              hide 
            />
            <YAxis 
              hide 
              domain={['auto', 'auto']}
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '20px', 
                border: 'none', 
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                padding: '12px 16px'
              }}
              labelStyle={{ display: 'none' }}
              itemStyle={{ fontWeight: '900', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
            />
            {singleLine ? (
              <Area
                type=\"monotone\"
                dataKey={dataKey || ''}
                stroke={chartColor}
                strokeWidth={4}
                fillOpacity={1}
                fill={`url(#gradient-${title})`}
                animationDuration={2000}
              />
            ) : (
              <>
                <Area
                  type=\"monotone\"
                  dataKey={buyKey || ''}
                  stroke={color.buyHex || chartColor}
                  strokeWidth={4}
                  fill=\"transparent\"
                  animationDuration={1500}
                />
                <Area
                  type=\"monotone\"
                  dataKey={sellKey || ''}
                  stroke={color.sellHex || '#10b981'}
                  strokeWidth={4}
                  fillOpacity={1}
                  fill={`url(#gradient-${title})`}
                  animationDuration={2000}
                />
              </>
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const Converter = ({ data }: { data: MarketData | null }) => {
  const [amount, setAmount] = useState<string>('100');
  const [from, setFrom] = useState<'ARS' | 'USD_BLUE' | 'USD_OFICIAL' | 'VES_PARALELO' | 'VES_OFICIAL'>('USD_BLUE');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const options = [
    { value: 'USD_BLUE', label: 'Dólar Blue', sub: 'Argentina' },
    { value: 'USD_OFICIAL', label: 'Dólar Oficial', sub: 'Argentina' },
    { value: 'VES_PARALELO', label: 'Dólar Paralelo', sub: 'Venezuela' },
    { value: 'VES_OFICIAL', label: 'Dólar BCV', sub: 'Venezuela' },
    { value: 'ARS', label: 'Pesos Argentinos', sub: 'Argentina' }
  ];

  const results = useMemo(() => {
    const val = parseFloat(amount) || 0;
    if (!data) return [];

    let usdValue = 0;
    if (from === 'USD_BLUE') usdValue = val;
    else if (from === 'USD_OFICIAL') usdValue = val; // simplified
    else if (from === 'ARS') usdValue = val / (data.blue?.value_sell || 1);
    else if (from === 'VES_PARALELO') usdValue = val / (data.ves_paralelo || 1);
    else if (from === 'VES_OFICIAL') usdValue = val / (data.ves_oficial || 1);

    return [
      { 
        label: 'Pesos Argentinos (Blue)', 
        value: formatNumber(usdValue * (data.blue?.value_sell || 0)), 
        prefix: '$', 
        color: 'indigo' 
      },
      { 
        label: 'Bolívares (Paralelo)', 
        value: formatNumber(usdValue * (data.ves_paralelo || 0)), 
        prefix: 'Bs.', 
        color: 'emerald' 
      },
      { 
        label: 'Dólares Americanos', 
        value: formatNumber(usdValue), 
        prefix: 'US$', 
        color: 'blue' 
      },
      { 
        label: 'Pesos Uruguayos', 
        value: formatNumber(usdValue * (data.uyu_venta || 0)), 
        prefix: '$U', 
        color: 'sky' 
      }
    ];
  }, [amount, from, data]);

  const selectedOption = options.find(o => o.value === from);

  return (
    <div className=\"bg-white dark:bg-slate-800 rounded-[40px] p-8 lg:p-12 shadow-xl border border-slate-100 dark:border-slate-700/50 relative overflow-hidden group\">
      <div className=\"absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-indigo-500/10 transition-colors duration-700\" />
      
      <div className=\"grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 relative z-10\">
        <div className=\"space-y-10\">
          <div className=\"space-y-6\">
            <label className=\"text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em] flex items-center gap-2\">
              <Coins className=\"w-4 h-4 text-indigo-500\" /> Cantidad a Convertir
            </label>
            <div className=\"relative\">
              <input
                type=\"number\"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className=\"w-full bg-slate-50 dark:bg-slate-900/50 border-2 border-transparent focus:border-indigo-500 rounded-3xl px-8 py-6 text-3xl font-black text-slate-800 dark:text-white outline-none transition-all shadow-inner\"
                placeholder=\"0.00\"
              />
              <div className=\"absolute right-6 top-1/2 -translate-y-1/2 flex gap-2\">
                <div className=\"w-2 h-2 rounded-full bg-indigo-500/20\" />
                <div className=\"w-2 h-2 rounded-full bg-indigo-500/40\" />
                <div className=\"w-2 h-2 rounded-full bg-indigo-500\" />
              </div>
            </div>
          </div>

          <div className=\"space-y-6\">
            <label className=\"text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em] flex items-center gap-2\">
              <ArrowRightLeft className=\"w-4 h-4 text-emerald-500\" /> Moneda de Origen
            </label>
            <div className=\"relative\">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className=\"w-full flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-700 rounded-3xl px-8 py-6 transition-all group\"
              >
                <div className=\"flex items-center gap-4\">
                  <div className=\"w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-xl font-black text-indigo-600\">
                    {selectedOption?.label.charAt(0)}
                  </div>
                  <div className=\"text-left\">
                    <div className=\"font-black text-slate-800 dark:text-white text-lg\">{selectedOption?.label}</div>
                    <div className=\"text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest\">{selectedOption?.sub}</div>
                  </div>
                </div>
                <ChevronRight className={`w-6 h-6 text-slate-300 transition-transform duration-300 ${isDropdownOpen ? 'rotate-90' : ''}`} />
              </button>
              
              {isDropdownOpen && (
                <div className=\"absolute top-full left-0 right-0 mt-4 bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700/50 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-300\">
                  <div className=\"p-2\">
                    {options.map((option) => (
                      <div
                        key={option.value}
                        onClick={() => {
                          setFrom(option.value as any);
                          setIsDropdownOpen(false);
                          if (window.umami) {
                            window.umami.track('Calculadora - Conversion', { moneda: option.value });
                          }
                        }}
                        className={`px-6 py-3 cursor-pointer text-sm font-black transition-colors flex items-center justify-between group ${from === option.value ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'}`}
                      >
                        {option.label}
                        {from === option.value && <CheckCircle2 className=\"w-4 h-4\" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className=\"bg-slate-50 dark:bg-slate-900/30 rounded-[32px] p-8 lg:p-10 space-y-8 border border-slate-100/50 dark:border-slate-800/50 shadow-inner\">
          <h4 className=\"text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em] mb-4\">Resultados Estimados</h4>
          <div className=\"space-y-6\">
            {results.map((res, i) => (
              <div key={i} className=\"flex items-center justify-between p-5 bg-white dark:bg-slate-800/50 rounded-2xl border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/30 transition-all group\">
                <span className=\"text-[11px] font-black text-slate-500 uppercase tracking-tight\">{res.label}</span>
                <div className=\"text-right\">
                  <span className=\"text-[10px] font-bold text-slate-400 mr-1\">{res.prefix}</span>
                  <span className=\"text-xl font-black text-slate-800 dark:text-white tracking-tighter group-hover:scale-110 inline-block transition-transform\">{res.value}</span>
                </div>
              </div>
            ))}
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

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const fetchData = async () => {
    try {
      const apiUrl = (import.meta.env.VITE_API_URL || 'https://valores-mercado-api.onrender.com').replace(/\/$/, '');
      const [marketRes, historyRes] = await Promise.all([
        axios.get(`${apiUrl}/api/market`),
        axios.get(`${apiUrl}/api/history`)
      ]);
      setData(marketRes.data);
      setHistory(historyRes.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Error al sincronizar con los mercados financieros');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className=\"min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-8 transition-colors duration-500\">
        <div className=\"relative w-24 h-24\">
          <div className=\"absolute inset-0 border-8 border-indigo-500/20 rounded-full\"></div>
          <div className=\"absolute inset-0 border-8 border-indigo-500 rounded-full border-t-transparent animate-spin\"></div>
          <Activity className=\"absolute inset-0 m-auto w-8 h-8 text-indigo-500 animate-pulse\" />
        </div>
        <div className=\"mt-8 space-y-2 text-center\">
          <h1 className=\"text-xl font-black text-slate-800 dark:text-white uppercase tracking-[0.4em] animate-pulse\">MarketDash</h1>
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
              <div className=\"flex items-center gap-2 text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em]\">
                <BarChart3 className=\"w-3 h-3\" /> Financial Overview
              </div>
              <h2 className=\"text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tighter\">
                {activeTab === 'Argentina' && 'Mercado Argentina'}
                {activeTab === 'Venezuela' && 'Mercado Venezuela'}
                {activeTab === 'Latam' && 'Mercado Regional'}
                {activeTab === 'Conversor' && 'Calculadora Global'}
              </h2>
              <p className=\"text-slate-500 dark:text-slate-400 text-sm font-medium\">
                Cotizaciones en tiempo real actualizadas cada 60 segundos.
              </p>
            </div>
            
            <div className=\"flex items-center gap-4\">
              <div className=\"flex flex-col items-end\">
                <span className=\"text-[9px] font-black text-slate-400 uppercase tracking-widest\">Última Actualización</span>
                <div className=\"flex items-center gap-2 text-sm font-black text-slate-700 dark:text-slate-300\">
                  <Clock className=\"w-4 h-4 text-indigo-500\" />
                  {data?.last_update ? new Date(data.last_update).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--:--'}
                </div>
              </div>
              <button 
                onClick={() => {
                  setLoading(true);
                  fetchData();
                  addNotification('Datos de mercado actualizados');
                }}
                className=\"p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95 group\"
              >
                <RefreshCw className=\"w-5 h-5 group-hover:rotate-180 transition-transform duration-700\" />
              </button>
            </div>
          </div>

          {error && (
            <div className=\"mb-8 p-5 bg-red-50 dark:bg-red-900/30 border-2 border-red-100 dark:border-red-800/50 rounded-3xl flex items-center gap-3 text-red-700 dark:text-red-400 animate-pulse max-w-7xl mx-auto\">
              <TrendingDown className=\"w-6 h-6\" />
              <span className=\"font-black uppercase text-xs tracking-widest\">{error}</span>
            </div>
          )}

        {/* Navigation Tabs */}
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
                    icon={TrendingUp}
                    singleLine={true}
                  />
                </div>
              </div>

              {/* Chile Section */}
              <div className=\"space-y-8\">
                <div className=\"flex items-center gap-3 px-1\">
                  <div className=\"w-1.5 h-6 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.3)]\" />
                  <h2 className=\"text-lg font-black text-slate-800 dark:text-white uppercase tracking-[0.2em]\">Chile</h2>
                </div>
                <StatCard 
                  title=\"Peso Chileno\" 
                  value={`CLP ${formatNumber(data?.clp_venta)}`} 
                  icon={Globe} 
                  color=\"bg-red-500\"
                  subtitle=\"Cotización Observado\"
                />
                <div className=\"h-[300px]\">
                  <RegionChart 
                    title=\"Tendencia CLP\" 
                    data={history} 
                    dataKey=\"clp_venta\" 
                    color={{hex: '#ef4444', text: 'text-red-500'}}
                    icon={TrendingUp}
                    singleLine={true}
                  />
                </div>
              </div>

              {/* Cross-Rates Section */}
              <div className=\"space-y-8 flex flex-col h-full\">
                  {/* Mercado Euro Card */}
                  <div className=\"flex-1 bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col h-full\">
                    <h3 className=\"text-[10px] font-black text-slate-300 dark:text-slate-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-2\">
                      <BarChart3 className=\"w-4 h-4 text-indigo-500\" /> Paridad Argentina (ARS)
                    </h3>
                    <div className=\"flex-1 space-y-4 flex flex-col justify-center\">
                    <div className=\"flex justify-between items-center p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-transparent dark:border-slate-700/50 transition-all group\">
                      <span className=\"font-black text-slate-500 uppercase text-xs tracking-tight\">Dólar AR / USD Blue</span>
                      <div className=\"flex flex-col items-end\">
                        <span className=\"font-black text-indigo-700 dark:text-indigo-400 text-lg group-hover:scale-110 transition-transform\">$ {formatNumber(data?.blue?.value_sell)}</span>
                        <span className={`text-[10px] font-bold ${(data?.changes?.usd_blue_percent ?? 0) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {(data?.changes?.usd_blue_percent ?? 0) >= 0 ? '+' : ''}{(data?.changes?.usd_blue_percent ?? 0).toFixed(2)}%
                        </span>
                      </div>
                    </div>
                    <div className=\"flex justify-between items-center p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-transparent dark:border-slate-700/50 transition-all group\">
                      <span className=\"font-black text-slate-500 uppercase text-xs tracking-tight\">Real Brasileño</span>
                      <div className=\"flex flex-col items-end\">
                        <span className=\"font-black text-emerald-700 dark:text-emerald-400 text-lg group-hover:scale-110 transition-transform\">$ {formatNumber(data?.brl_ar)}</span>
                        <span className={`text-[10px] font-bold ${(data?.changes?.brl_ar_percent ?? 0) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {(data?.changes?.brl_ar_percent ?? 0) >= 0 ? '+' : ''}{(data?.changes?.brl_ar_percent ?? 0).toFixed(2)}%
                        </span>
                      </div>
                    </div>
                    <div className=\"flex justify-between items-center p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-transparent dark:border-slate-700/50 transition-all group\">
                      <span className=\"font-black text-slate-500 uppercase text-xs tracking-tight\">Peso Chileno</span>
                      <div className=\"flex flex-col items-end\">
                        <span className=\"font-black text-red-700 dark:text-red-400 text-lg group-hover:scale-110 transition-transform\">$ {formatNumber(data?.clp_ar)}</span>
                        <span className={`text-[10px] font-bold ${(data?.changes?.clp_ar_percent ?? 0) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {(data?.changes?.clp_ar_percent ?? 0) >= 0 ? '+' : ''}{(data?.changes?.clp_ar_percent ?? 0).toFixed(2)}%
                        </span>
                      </div>
                    </div>
                    <div className=\"flex justify-between items-center p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-transparent dark:border-slate-700/50 transition-all group\">
                      <span className=\"font-black text-slate-500 uppercase text-xs tracking-tight\">Peso Uruguayo</span>
                      <div className=\"flex flex-col items-end\">
                        <span className=\"font-black text-sky-700 dark:text-sky-400 text-lg group-hover:scale-110 transition-transform\">$ {formatNumber(data?.uyu_ar)}</span>
                        <span className={`text-[10px] font-bold ${(data?.changes?.uyu_ar_percent ?? 0) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {(data?.changes?.uyu_ar_percent ?? 0) >= 0 ? '+' : ''}{(data?.changes?.uyu_ar_percent ?? 0).toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Calculadora Section */}
          {activeTab === 'Conversor' && (
            <div className=\"space-y-8 animate-in fade-in duration-700 slide-in-from-bottom-4\">
              <div className=\"flex items-center gap-3 px-1\">
                <div className=\"w-1.5 h-6 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.3)]\" />
                <h2 className=\"text-xl font-black text-slate-800 dark:text-white uppercase tracking-[0.2em]\">Calculadora</h2>
              </div>
              <Converter data={data} />
            </div>
          )}

        </div>

        {/* Global Footer with API Status and Contact */}
        <footer className=\"relative lg:fixed lg:bottom-0 lg:left-0 lg:right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 px-4 lg:px-8 py-2 lg:py-3 z-50 transition-colors duration-300\">
          <div className=\"max-w-7xl mx-auto space-y-2 lg:space-y-3\">
            <div className=\"flex flex-col md:flex-row items-center justify-between gap-3 lg:gap-4\">
              <div className=\"flex items-center gap-4\">
                <div className=\"flex items-center gap-2 px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl transition-all border border-indigo-100 dark:border-indigo-800/50 shadow-sm\">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${data?.api_status?.dolar_api_ar ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
                  <span className=\"text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em]\">DOLAR API</span>
                </div>
              </div>
              
              <div className=\"flex items-center gap-6\">
                <div className=\"hidden md:flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50 dark:bg-slate-800/50 px-4 py-2 rounded-2xl border border-slate-100 dark:border-slate-700/50\">
                  <span className=\"text-blue-500\">Built with</span>
                  <div className=\"flex gap-2\">
                    <span className=\"px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded text-[8px]\">TypeScript</span>
                    <span className=\"px-1.5 py-0.5 bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400 rounded text-[8px]\">React</span>
                    <span className=\"px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded text-[8px]\">Tailwind</span>
                    <span className=\"px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded text-[8px]\">Fastify</span>
                  </div>
                </div>
                
                <div className=\"flex flex-col items-end gap-3\">
                  <div className=\"flex flex-wrap justify-end gap-2\">
                    {/* Status pill removed from here to be more prominent above */}
                  </div>
                  
                  <a 
                    href=\"https://github.com/johannmx/valores-mercado\" 
                    target=\"_blank\" 
                    rel=\"noopener noreferrer\"
                    className=\"p-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl hover:scale-110 active:scale-95 transition-all shadow-lg shadow-slate-200 dark:shadow-none\"
                  >
                    <Github className=\"w-5 h-5\" />
                  </a>
                </div>
              </div>
            </div>
            
            <div className=\"flex flex-col md:flex-row items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/50\">
              <div className=\"text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2\">
                <Globe className=\"w-3 h-3 text-blue-500\" />
                Realizado por <span className=\"text-slate-900 dark:text-white\">@johannmx</span>
              </div>
              <div className=\"flex items-center gap-4 text-[9px] font-black text-slate-300 dark:text-slate-500 uppercase tracking-[0.3em] teacher-none\">
                © 2026 MarketDash • Financial Pulse
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Toast Notifications - Moved outside the overflow-x-hidden container */}
      <div className=\"fixed bottom-24 right-4 md:right-8 z-[100] flex flex-col gap-3 pointer-events-none\">
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
