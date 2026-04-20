import { useState, useEffect, useMemo, type ElementType } from 'react';
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
  Clock,
  Zap,
  BarChart3,
  Moon,
  Sun,
  X,
  CheckCircle2,
  Coins,
  Menu,
  Bell
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
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
  blue_euro?: {
    value_buy: number;
    value_sell: number;
    date: string;
  };
  oficial_euro?: {
    value_buy: number;
    value_sell: number;
    date: string;
  };
  last_update?: string;
  clp_ar?: number;
  uyu_ar?: number;
  brl_ar?: number;
  api_status?: {
    dolar_api_ar: boolean;
    dolar_api_ve: boolean;
    dolar_api_uy: boolean;
    dolar_api_cl: boolean;
  };
  changes?: {
    usd_blue_percent: number;
    brl_ar_percent: number;
    clp_ar_percent: number;
    uyu_ar_percent: number;
  };
}

interface HistoryItem {
  timestamp: string;
  usd_blue: number;
  usd_oficial: number;
  usd_mep: number;
  usd_ccl: number;
}

interface HistoryData {
  history: HistoryItem[];
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
  icon: ElementType;
  singleLine?: boolean;
}

// --- Components ---

const RegionChart = ({ title, data, buyKey, sellKey, dataKey, color, icon: Icon, singleLine }: RegionChartProps) => {
  return (
    <div className=\"bg-white/80 dark:bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800/50 shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all duration-500 group relative overflow-hidden\">
      <div className=\"absolute top-0 right-0 p-8 opacity-[0.03] dark:opacity-[0.05] group-hover:scale-110 transition-transform duration-700\">
        <Icon className=\"w-32 h-32\" />
      </div>
      
      <div className=\"flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 relative\">
        <div className=\"flex items-center gap-5\">
          <div className={`p-4 rounded-3xl ${color.text.replace('text-', 'bg-').replace('700', '100').replace('400', '900/30')} transition-colors duration-500`}>
            <Icon className={`w-6 h-6 ${color.text}`} />
          </div>
          <div>
            <h3 className=\"text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em] mb-1\">Análisis de Mercado</h3>
            <h2 className=\"text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter\">{title}</h2>
          </div>
        </div>
        
        <div className=\"flex flex-wrap gap-3\">
          {!singleLine ? (
            <>
              <div className=\"px-5 py-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50\">
                <div className=\"flex items-center gap-2 mb-0.5\">
                  <div className=\"w-2 h-2 rounded-full\" style={{ backgroundColor: color.buyHex }} />
                  <span className=\"text-[10px] font-black text-slate-400 uppercase tracking-widest\">Compra</span>
                </div>
                <div className=\"text-lg font-black text-slate-700 dark:text-slate-200 tracking-tighter\">
                  $ {data.length > 0 ? (data[data.length - 1] as any)[buyKey!] : '---'}
                </div>
              </div>
              <div className=\"px-5 py-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50\">
                <div className=\"flex items-center gap-2 mb-0.5\">
                  <div className=\"w-2 h-2 rounded-full\" style={{ backgroundColor: color.sellHex }} />
                  <span className=\"text-[10px] font-black text-slate-400 uppercase tracking-widest\">Venta</span>
                </div>
                <div className=\"text-lg font-black text-slate-700 dark:text-slate-200 tracking-tighter\">
                  $ {data.length > 0 ? (data[data.length - 1] as any)[sellKey!] : '---'}
                </div>
              </div>
            </>
          ) : (
            <div className=\"px-5 py-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50\">
              <div className=\"flex items-center gap-2 mb-0.5\">
                <div className=\"w-2 h-2 rounded-full\" style={{ backgroundColor: color.hex }} />
                <span className=\"text-[10px] font-black text-slate-400 uppercase tracking-widest\">Cotización</span>
              </div>
              <div className=\"text-lg font-black text-slate-700 dark:text-slate-200 tracking-tighter\">
                $ {data.length > 0 ? (data[data.length - 1] as any)[dataKey!] : '---'}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className=\"h-[350px] w-full mt-4\">
        <ResponsiveContainer width=\"100%\" height=\"100%\">
          <AreaChart data={data}>
            <defs>
              {singleLine ? (
                <linearGradient id={`gradient-${title}`} x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\">
                  <stop offset=\"5%\" stopColor={color.hex} stopOpacity={0.3}/>
                  <stop offset=\"95%\" stopColor={color.hex} stopOpacity={0}/>
                </linearGradient>
              ) : (
                <>
                  <linearGradient id={`gradient-buy-${title}`} x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\">
                    <stop offset=\"5%\" stopColor={color.buyHex} stopOpacity={0.3}/>
                    <stop offset=\"95%\" stopColor={color.buyHex} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id={`gradient-sell-${title}`} x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\">
                    <stop offset=\"5%\" stopColor={color.sellHex} stopOpacity={0.3}/>
                    <stop offset=\"95%\" stopColor={color.sellHex} stopOpacity={0}/>
                  </linearGradient>
                </>
              )}
            </defs>
            <CartesianGrid strokeDasharray=\"3 3\" vertical={false} stroke=\"#f1f5f9\" />
            <XAxis 
              dataKey=\"timestamp\" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }}
              dy={10}
            />
            <YAxis 
              hide
              domain={['auto', 'auto']}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                borderRadius: '24px', 
                border: 'none', 
                boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
                padding: '16px 24px',
                fontWeight: 900
              }}
              itemStyle={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '10px' }}
            />
            {singleLine ? (
              <Area
                type=\"monotone\"
                dataKey={dataKey!}
                stroke={color.hex}
                strokeWidth={4}
                fillOpacity={1}
                fill={`url(#gradient-${title})`}
                animationDuration={2000}
              />
            ) : (
              <>
                <Area
                  type=\"monotone\"
                  dataKey={buyKey!}
                  stroke={color.buyHex}
                  strokeWidth={4}
                  fillOpacity={1}
                  fill={`url(#gradient-buy-${title})`}
                  animationDuration={2000}
                />
                <Area
                  type=\"monotone\"
                  dataKey={sellKey!}
                  stroke={color.sellHex}
                  strokeWidth={4}
                  fillOpacity={1}
                  fill={`url(#gradient-sell-${title})`}
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
  const [amount, setAmount] = useState<string>('1');
  const [from, setFrom] = useState<'ARS' | 'USD' | 'EUR'>('USD');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const options = [
    { value: 'USD', label: 'Dólar Blue', icon: DollarSign },
    { value: 'EUR', label: 'Euro Blue', icon: Globe },
    { value: 'ARS', label: 'Peso Argentino', icon: Activity }
  ];

  const currentOption = options.find(o => o.value === from);

  const convert = (val: string) => {
    if (!data || isNaN(parseFloat(val))) return { usd: 0, ars: 0, eur: 0 };
    const num = parseFloat(val);
    
    if (from === 'USD') {
      return {
        ars: num * (data.blue?.value_sell || 0),
        eur: (num * (data.blue?.value_sell || 0)) / (data.blue_euro?.value_sell || 1)
      };
    } else if (from === 'EUR') {
      return {
        ars: num * (data.blue_euro?.value_sell || 0),
        usd: (num * (data.blue_euro?.value_sell || 0)) / (data.blue?.value_sell || 1)
      };
    } else {
      return {
        usd: num / (data.blue?.value_buy || 1),
        eur: num / (data.blue_euro?.value_buy || 1)
      };
    }
  };

  const results = convert(amount);

  return (
    <div className=\"bg-white/80 dark:bg-slate-900/40 backdrop-blur-md rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800/50 shadow-sm relative overflow-hidden group\">
      <div className=\"absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-indigo-500/10 transition-colors duration-700\" />
      
      <div className=\"flex flex-col lg:flex-row gap-12 items-center relative\">
        <div className=\"w-full lg:w-1/2 space-y-8\">
          <div>
            <h3 className=\"text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-[0.3em] mb-3\">Conversor Inteligente</h3>
            <h2 className=\"text-4xl font-black text-slate-800 dark:text-white tracking-tighter leading-none\">CALCULADORA<br/>GLOBAL</h2>
          </div>
          
          <div className=\"space-y-4\">
            <div className=\"relative\">
              <input
                type=\"number\"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder=\"Monto a convertir\"
                className=\"w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-500/30 rounded-3xl px-8 py-6 text-2xl font-black text-slate-800 dark:text-white outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600\"
              />
              <div className=\"absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2\">
                <div className=\"relative\">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className=\"flex items-center gap-3 bg-white dark:bg-slate-700 px-5 py-3 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-600 hover:scale-105 transition-all\"
                  >
                    {currentOption && <currentOption.icon className=\"w-4 h-4 text-indigo-500\" />}
                    <span className=\"font-black text-sm\">{from}</span>
                    <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-90' : ''}`} />
                  </button>
                  
                  {isDropdownOpen && (
                    <div className=\"absolute right-0 mt-3 w-64 bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 py-3 z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden\">
                      {options.map((option) => (
                        <div
                          key={option.value}
                          onClick={() => {
                            setFrom(option.value as any);
                            setIsDropdownOpen(false);
                            if ((window as any).umami) {
                              (window as any).umami.track('Calculadora - Conversion', { moneda: option.value });
                            }
                          }}
                          className={`px-6 py-3 cursor-pointer text-sm font-black transition-colors flex items-center justify-between group ${from === option.value ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'}`}
                        >
                          {option.label}
                          {from === option.value && <CheckCircle2 className=\"w-4 h-4\" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className=\"w-full lg:w-1/2\">
          <div className=\"grid grid-cols-1 sm:grid-cols-2 gap-6\">
            {from === 'USD' && (
              <>
                <div className=\"bg-slate-900 dark:bg-indigo-600 p-8 rounded-[2.5rem] shadow-xl hover:translate-y-[-4px] transition-transform\">
                  <div className=\"text-[10px] font-black text-indigo-300/60 dark:text-white/60 uppercase tracking-widest mb-2\">Pesos Argentinos</div>
                  <div className=\"text-3xl font-black text-white tracking-tighter\">$ {formatNumber((results as any).ars)}</div>
                  <div className=\"mt-4 flex items-center gap-2\">
                    <div className=\"px-3 py-1 bg-white/10 rounded-full text-[8px] font-black text-white/80 uppercase tracking-widest\">Blue Sell</div>
                  </div>
                </div>
                <div className=\"bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm hover:translate-y-[-4px] transition-transform\">
                  <div className=\"text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2\">Euros</div>
                  <div className=\"text-3xl font-black text-slate-800 dark:text-white tracking-tighter\">€ {formatNumber((results as any).eur)}</div>
                  <div className=\"mt-4 flex items-center gap-2\">
                    <div className=\"px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest\">Blue Rate</div>
                  </div>
                </div>
              </>
            )}
            {from === 'EUR' && (
              <>
                <div className=\"bg-slate-900 dark:bg-indigo-600 p-8 rounded-[2.5rem] shadow-xl hover:translate-y-[-4px] transition-transform\">
                  <div className=\"text-[10px] font-black text-indigo-300/60 dark:text-white/60 uppercase tracking-widest mb-2\">Pesos Argentinos</div>
                  <div className=\"text-3xl font-black text-white tracking-tighter\">$ {formatNumber((results as any).ars)}</div>
                  <div className=\"mt-4 flex items-center gap-2\">
                    <div className=\"px-3 py-1 bg-white/10 rounded-full text-[8px] font-black text-white/80 uppercase tracking-widest\">Euro Blue</div>
                  </div>
                </div>
                <div className=\"bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm hover:translate-y-[-4px] transition-transform\">
                  <div className=\"text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2\">Dólares</div>
                  <div className=\"text-3xl font-black text-slate-800 dark:text-white tracking-tighter\">$ {formatNumber((results as any).usd)}</div>
                  <div className=\"mt-4 flex items-center gap-2\">
                    <div className=\"px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest\">Blue Rate</div>
                  </div>
                </div>
              </>
            )}
            {from === 'ARS' && (
              <>
                <div className=\"bg-slate-900 dark:bg-indigo-600 p-8 rounded-[2.5rem] shadow-xl hover:translate-y-[-4px] transition-transform\">
                  <div className=\"text-[10px] font-black text-indigo-300/60 dark:text-white/60 uppercase tracking-widest mb-2\">Dólares</div>
                  <div className=\"text-3xl font-black text-white tracking-tighter\">$ {formatNumber((results as any).usd)}</div>
                  <div className=\"mt-4 flex items-center gap-2\">
                    <div className=\"px-3 py-1 bg-white/10 rounded-full text-[8px] font-black text-white/80 uppercase tracking-widest\">Blue Buy</div>
                  </div>
                </div>
                <div className=\"bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm hover:translate-y-[-4px] transition-transform\">
                  <div className=\"text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2\">Euros</div>
                  <div className=\"text-3xl font-black text-slate-800 dark:text-white tracking-tighter\">€ {formatNumber((results as any).eur)}</div>
                  <div className=\"mt-4 flex items-center gap-2\">
                    <div className=\"px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest\">Euro Blue Buy</div>
                  </div>
                </div>
              </>
            )}
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

export const formatNumber = (num: number | string | null | undefined): string => {
  if (num === null || num === undefined || num === '') return '0.00';
  const n = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(n)) return '0.00';
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(n);
};

function App() {
  const [data, setData] = useState<MarketData | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<'Argentina' | 'Venezuela' | 'Latam' | 'Conversor'>('Argentina');
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<{id: string, message: string, type: 'info' | 'success'}[]>([]);

  const addNotification = (message: string, type: 'info' | 'success' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, message, type }]);
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  useEffect(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const fetchData = async () => {
    try {
      const [marketRes, historyRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL || ''}/api/market`),
        axios.get(`${import.meta.env.VITE_API_URL || ''}/api/history`)
      ]);
      setData(marketRes.data);
      setHistory(historyRes.data.history);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const brecha = useMemo(() => {
    if (!data?.blue || !data?.oficial) return 0;
    return ((data.blue.value_sell / data.oficial.value_sell) - 1) * 100;
  }, [data]);

  const tabs = [
    { id: 'Argentina', label: 'Argentina', icon: Activity },
    { id: 'Latam', label: 'Latam', icon: Globe },
    { id: 'Conversor', label: 'Conversor', icon: RefreshCw }
  ];

  if (loading) {
    return (
      <div className=\"min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-8\">
        <div className=\"relative\">
          <div className=\"w-24 h-24 border-8 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin\" />
          <div className=\"absolute inset-0 flex items-center justify-center\">
            <DollarSign className=\"w-8 h-8 text-indigo-500 animate-pulse\" />
          </div>
        </div>
        <div className=\"space-y-2 text-center\">
          <h1 className=\"text-2xl font-black text-slate-800 dark:text-white uppercase tracking-widest\">Iniciando Sistema</h1>
          <p className=\"text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em]\">Conectando con mercados globales...</p>
        </div>
      </div>
    );
  }

  return (
    <div className=\"min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 selection:bg-indigo-500 selection:text-white font-['Inter',system-ui,sans-serif]\">
      
      {/* Premium Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-r border-slate-100 dark:border-slate-800 transition-all duration-700 ease-out transform lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className=\"flex flex-col h-full p-8\">
          <div className=\"flex items-center justify-between mb-12\">
            <div className=\"flex items-center gap-4\">
              <div className=\"w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/20 group hover:rotate-12 transition-transform duration-500\">
                <Activity className=\"w-6 h-6 text-white\" />
              </div>
              <h1 className=\"text-xl font-black text-slate-900 dark:text-white tracking-tighter\">MarketDash</h1>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className=\"lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors\">
              <X className=\"w-6 h-6 text-slate-500\" />
            </button>
          </div>

          <nav className=\"space-y-2 flex-grow\">
            <div className=\"text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 px-4\">Navegación Principal</div>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-5 px-6 py-5 rounded-[2rem] transition-all duration-500 group relative ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-500/40 translate-x-2' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'}`}
              >
                <tab.icon className={`w-5 h-5 transition-transform duration-500 group-hover:scale-110 ${activeTab === tab.id ? 'text-white' : 'text-indigo-500'}`} />
                <span className=\"font-black uppercase text-xs tracking-widest\">{tab.label}</span>
                {activeTab === tab.id && (
                  <div className=\"absolute right-6 w-1.5 h-1.5 bg-white rounded-full animate-pulse\" />
                )}
              </button>
            ))}
          </nav>

          <div className=\"mt-auto space-y-6\">
            <div className=\"p-8 bg-indigo-50 dark:bg-indigo-900/20 rounded-[2.5rem] border border-indigo-100 dark:border-indigo-800/50 relative overflow-hidden group\">
              <div className=\"absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all duration-700\" />
              <div className=\"relative\">
                <div className=\"text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-2\">Status Sistema</div>
                <div className=\"flex items-center gap-3\">
                  <div className=\"w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.5)]\" />
                  <span className=\"text-xs font-black text-slate-800 dark:text-white uppercase tracking-tighter\">Operativo</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => {
                setDarkMode(!darkMode);
                addNotification(`Modo ${!darkMode ? 'oscuro' : 'claro'} activado`, 'success');
              }}
              className=\"w-full flex items-center justify-between p-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 group\"
            >
              <div className=\"flex items-center gap-4\">
                {darkMode ? <Sun className=\"w-5 h-5 text-amber-400\" /> : <Moon className=\"w-5 h-5 text-blue-400\" />}
                <span className=\"font-black uppercase text-xs tracking-[0.2em]\">{darkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>
              </div>
              <div className=\"w-8 h-8 rounded-full bg-white/10 dark:bg-slate-100 flex items-center justify-center group-hover:rotate-45 transition-transform duration-500\">
                <RefreshCw className=\"w-4 h-4\" />
              </div>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className=\"lg:ml-80 flex flex-col min-h-screen relative overflow-x-hidden\">
        
        {/* Header - Fixed Height on Mobile */}
        <header className=\"sticky top-0 z-40 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800/50 px-6 lg:px-12 py-6 lg:py-8\">
          <div className=\"max-w-7xl mx-auto flex items-center justify-between\">
            <div className=\"flex items-center gap-4\">
              <button onClick={() => setIsSidebarOpen(true)} className=\"lg:hidden p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm\">
                <Menu className=\"w-6 h-6 text-slate-600 dark:text-slate-300\" />
              </button>
              <div>
                <h2 className=\"text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-[0.4em] mb-1\">Market Dashboard</h2>
                <h3 className=\"text-2xl lg:text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter\">{activeTab}</h3>
              </div>
            </div>
            
            <div className=\"hidden md:flex items-center gap-6\">
              <div className=\"px-6 py-3 bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-end\">
                <span className=\"text-[8px] font-black text-slate-400 uppercase tracking-widest\">Última Actualización</span>
                <span className=\"text-xs font-black text-slate-800 dark:text-white uppercase\">{data?.last_update ? new Date(data.last_update).toLocaleTimeString() : '---'}</span>
              </div>
              <button 
                onClick={() => {
                  fetchData();
                  addNotification('Datos actualizados manualmente', 'success');
                }}
                className=\"p-4 bg-indigo-600 text-white rounded-2xl hover:scale-110 active:scale-95 transition-all shadow-xl shadow-indigo-500/20\"
              >
                <RefreshCw className=\"w-5 h-5\" />
              </button>
            </div>
          </div>
        </header>

        {/* Dynamic Content Grid */}
        <main className=\"flex-grow p-6 lg:p-12 pb-32\">
          <div className=\"max-w-7xl mx-auto\">
            
          {activeTab === 'Argentina' && (
            <div className=\"space-y-12\">
              {/* Quick Summary Cards */}
              <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6\">
                <div className=\"bg-slate-900 dark:bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-500/20 group hover:translate-y-[-8px] transition-all duration-500 relative overflow-hidden\">
                  <div className=\"absolute -right-4 -bottom-4 opacity-10 group-hover:scale-125 transition-transform duration-700\">
                    <TrendingUp className=\"w-32 h-32\" />
                  </div>
                  <div className=\"relative\">
                    <h4 className=\"text-[10px] font-black text-indigo-300 dark:text-white/60 uppercase tracking-widest mb-4\">Dólar Blue Venta</h4>
                    <div className=\"text-4xl font-black tracking-tighter mb-4\">$ {formatNumber(data?.blue?.value_sell)}</div>
                    <div className=\"flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full w-fit\">
                      <TrendingUp className=\"w-3 h-3 text-emerald-400\" />
                      <span className=\"text-[10px] font-black text-emerald-400\">{(data?.changes?.usd_blue_percent ?? 0) >= 0 ? '+' : ''}{(data?.changes?.usd_blue_percent ?? 0).toFixed(2)}%</span>
                    </div>
                  </div>
                </div>

                <div className=\"bg-white dark:bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800/50 shadow-sm group hover:translate-y-[-8px] transition-all duration-500\">
                  <h4 className=\"text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4\">Brecha Cambiaria</h4>
                  <div className=\"text-4xl font-black text-slate-800 dark:text-white tracking-tighter mb-4\">{brecha.toFixed(1)}%</div>
                  <div className=\"flex items-center gap-2 px-3 py-1 bg-amber-50 dark:bg-amber-900/20 rounded-full w-fit\">
                    <Activity className=\"w-3 h-3 text-amber-600 dark:text-amber-400\" />
                    <span className=\"text-[10px] font-black text-amber-600 dark:text-amber-400\">SPREAD RISK</span>
                  </div>
                </div>

                <div className=\"bg-white dark:bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800/50 shadow-sm group hover:translate-y-[-8px] transition-all duration-500\">
                  <h4 className=\"text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4\">Dólar MEP</h4>
                  <div className=\"text-4xl font-black text-slate-800 dark:text-white tracking-tighter mb-4\">$ {formatNumber(data?.mep?.value_sell)}</div>
                  <div className=\"w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden\">
                    <div className=\"h-full bg-blue-500 w-2/3\" />
                  </div>
                </div>

                <div className=\"bg-white dark:bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800/50 shadow-sm group hover:translate-y-[-8px] transition-all duration-500\">
                  <h4 className=\"text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4\">Dólar CCL</h4>
                  <div className=\"text-4xl font-black text-slate-800 dark:text-white tracking-tighter mb-4\">$ {formatNumber(data?.ccl?.value_sell)}</div>
                  <div className=\"flex items-center gap-2\">
                    <Zap className=\"w-3 h-3 text-indigo-500\" />
                    <span className=\"text-[10px] font-black text-indigo-500 uppercase tracking-widest\">Corporate Rate</span>
                  </div>
                </div>
              </div>

              {/* Main Charts Grid */}
              <div className=\"grid grid-cols-1 xl:grid-cols-2 gap-12\">
                <RegionChart 
                  title=\"Dólar Blue\" 
                  data={history} 
                  buyKey=\"usd_blue_buy\"
                  sellKey=\"usd_blue\"
                  color={{ text: 'text-indigo-700', buyHex: '#6366f1', sellHex: '#4338ca' }}
                  icon={TrendingUp}
                />
                <RegionChart 
                  title=\"Dólar Oficial\" 
                  data={history} 
                  buyKey=\"usd_oficial_buy\"
                  sellKey=\"usd_oficial\"
                  color={{ text: 'text-emerald-700', buyHex: '#10b981', sellHex: '#059669' }}
                  icon={DollarSign}
                />
                <RegionChart 
                  title=\"Dólar MEP\" 
                  data={history} 
                  buyKey=\"usd_mep_buy\"
                  sellKey=\"usd_mep\"
                  color={{ text: 'text-blue-700', buyHex: '#3b82f6', sellHex: '#1d4ed8' }}
                  icon={BarChart3}
                />
                <RegionChart 
                  title=\"Dólar CCL\" 
                  data={history} 
                  buyKey=\"usd_ccl_buy\"
                  sellKey=\"usd_ccl\"
                  color={{ text: 'text-amber-700', buyHex: '#f59e0b', sellHex: '#d97706' }}
                  icon={Activity}
                />
              </div>
            </div>
          )}

          {activeTab === 'Latam' && (
            <div className=\"space-y-12 animate-in fade-in duration-700\">
              <div className=\"grid grid-cols-1 xl:grid-cols-3 gap-12\">
                <div className=\"xl:col-span-2\">
                  <RegionChart 
                    title=\"Histórico Regional (UYU)\" 
                    data={history} 
                    dataKey=\"uyu_ar\"
                    color={{ text: 'text-sky-700', hex: '#0ea5e9' }}
                    icon={Globe}
                    singleLine={true}
                  />
                </div>
                
                <div className=\"bg-white/80 dark:bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-800/50 shadow-sm\">
                  <div className=\"flex items-center gap-4 mb-10\">
                    <div className=\"p-4 bg-blue-50 dark:bg-blue-900/30 rounded-3xl\">
                      <Coins className=\"w-6 h-6 text-blue-600 dark:text-blue-400\" />
                    </div>
                    <div>
                      <h3 className=\"text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1\">Comparativa</h3>
                      <h2 className=\"text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter\">Pesos vs ARS</h2>
                    </div>
                  </div>

                  <div className=\"space-y-6\">
                    <div className=\"flex justify-between items-center p-5 bg-indigo-500 rounded-2xl shadow-xl shadow-indigo-500/20 group transition-all cursor-default\">
                      <span className=\"font-black text-white/70 uppercase text-xs tracking-tight\">Dólar Blue</span>
                      <div className=\"flex flex-col items-end\">
                        <span className=\"font-black text-white text-lg\">$ {formatNumber(data?.blue?.value_sell)}</span>
                        <span className=\"text-[10px] font-bold text-white/60\">
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
      </main>

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
