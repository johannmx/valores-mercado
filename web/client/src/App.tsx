import { useState, useEffect, useCallback } from 'react';
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
  X,
  Maximize
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
import { isMarketOpen, formatNumber, downsampleData } from './utils/market';
import { useMarketData } from './hooks/useMarketData';
import type { MarketData, HistoryItem, AppNotification } from './hooks/useMarketData';

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
  onExpand?: () => void;
  subtitle?: string;
  hideHeader?: boolean;
}




interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  subtitle?: string;
  buy?: string | number;
  sell?: string | number;
  change?: number;
  badge?: string;
  spread?: number | string;
  pulseType?: 'up' | 'down';
}

const StatCard = ({ title, value, icon: Icon, color, subtitle, buy, sell, change, badge, spread, pulseType }: StatCardProps) => {
  const isPositive = change !== undefined && change > 0;
  const isNeutral = change === 0;
  const displayValue = value || '---';

  const baseClasses = "bg-white dark:bg-slate-800 p-3 rounded-2xl transition-all duration-500 relative overflow-hidden group min-h-[100px]";
  const pulseClasses = pulseType === 'up' 
    ? 'ring-2 ring-emerald-500 dark:ring-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] border-transparent' 
    : pulseType === 'down' 
    ? 'ring-2 ring-red-500 dark:ring-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)] border-transparent' 
    : 'border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md';

  return (
    <div className={`${baseClasses} ${pulseClasses}`}>
      <div className="flex items-center justify-between mb-2">
        <div className={`p-3 rounded-xl ${color} shadow-sm group-hover:scale-110 transition-transform`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-tight">{title}</span>
          {change !== undefined && (
            <div className="flex flex-col items-end gap-1 mt-1">
              <span className={`flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isNeutral ? 'text-slate-500 bg-slate-100 dark:bg-slate-700' :
                isPositive ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400' : 'text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {isNeutral ? <TrendingUp className="w-3 h-3 text-slate-400" /> : isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(change).toFixed(2)}%
              </span>
              {spread !== undefined && (
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Spread: {spread}%</span>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="space-y-1">
        <h3 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight leading-none">{displayValue}</h3>
        {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tighter">{subtitle}</p>}
        {(buy !== undefined || sell !== undefined || badge) && (
          <div className="flex justify-between items-end mt-4 pt-4 border-t border-slate-50 dark:border-slate-700/50 text-[10px] font-bold uppercase">
            <div className="flex gap-4">
              {buy !== undefined && (
                <div className="flex flex-col">
                  <span className="text-slate-300 dark:text-slate-500 mb-0.5">Compra</span>
                  <span className="text-slate-600 dark:text-slate-300">$ {buy || '-'}</span>
                </div>
              )}
              {sell !== undefined && (
                <div className="flex flex-col">
                  <span className="text-slate-300 dark:text-slate-500 mb-0.5">Venta</span>
                  <span className="text-slate-600 dark:text-slate-300">$ {sell || '-'}</span>
                </div>
              )}
            </div>
            {badge && (
              <span className="text-[9px] font-black uppercase tracking-widest bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full mb-0.5">
                {badge}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

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
  const [from, setFrom] = useState<'USD' | 'ARS_BLUE' | 'ARS_OFFICIAL' | 'CRYPTO' | 'WALLBIT' | 'VES' | 'VES_OFFICIAL' | 'UYU' | 'CLP' | 'BRL' | 'EUR'>('USD');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const OPTIONS = [
    { value: 'USD', label: 'USD - Dólar USA' },
    { value: 'ARS_OFFICIAL', label: 'ARS - Dólar Oficial' },
    { value: 'CRYPTO', label: 'ARS - Dólar Crypto' },
    { value: 'WALLBIT', label: 'ARS - Dólar Wallbit' },
    { value: 'VES', label: 'VES - Bolívar Paralelo' },
    { value: 'VES_OFFICIAL', label: 'VES - Bolívar Oficial' },
    { value: 'UYU', label: 'UYU - Peso Uruguayo' },
    { value: 'CLP', label: 'CLP - Peso Chileno' },
    { value: 'BRL', label: 'BRL - Real Brasileño' }
  ];

  if (!data) return null;

  const rates: Record<string, number> = {
    USD: 1,
    ARS_BLUE: data.usd_blue,
    ARS_OFFICIAL: data.usd_oficial,
    CRYPTO: data.usd_cripto,
    WALLBIT: data.usd_wallbit,
    VES: data.ves_paralelo,
    VES_OFFICIAL: data.ves_oficial,
    UYU: data.uyu_venta,
    CLP: data.clp_venta,
    BRL: data.brl_venta,
    EUR: data.eur_venta
  };

  const convert = (to: 'USD' | 'ARS_BLUE' | 'ARS_OFFICIAL' | 'CRYPTO' | 'WALLBIT' | 'VES' | 'VES_OFFICIAL' | 'UYU' | 'CLP' | 'BRL' | 'EUR') => {
    const usdAmount = amount / rates[from];
    const result = usdAmount * rates[to];
    
    if (to === 'ARS_BLUE' || to === 'ARS_OFFICIAL' || to === 'CRYPTO' || to === 'WALLBIT' || to === 'VES' || to === 'VES_OFFICIAL') {
      return result.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return result.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };


  return (
    <div className="space-y-8">
      {/* Input Header Card */}
      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2 mb-6">
          <ArrowRightLeft className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Conversor Rápido</h2>
        </div>
        
        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-transparent dark:border-slate-700">
          <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Monto a convertir</label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input 
              type="number" 
              value={amount.toString()} 
              onChange={(e) => {
                const val = e.target.value;
                if (val.length > 15) return; // Security: Prevent excessive input length (DoS mitigation)
                if (val === '') {
                  setAmount(0);
                } else {
                  const noLeadingZeros = val.replace(/^0+(?=\d)/, '');
                  setAmount(Number(noLeadingZeros));
                }
              }}
              className="flex-1 min-w-0 px-6 py-3 border-0 bg-white dark:bg-slate-800 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-black text-2xl text-slate-800 dark:text-white"
              placeholder="0.00"
            />
            <div className="relative flex-shrink-0 min-w-[220px]">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full h-full flex items-center justify-between px-6 py-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-2xl font-black outline-none cursor-pointer transition-all shadow-sm text-sm"
              >
                <span>{OPTIONS.find(o => o.value === from)?.label || 'Seleccionar moneda'}</span>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setIsDropdownOpen(false)} 
                  />
                  <div className="absolute z-20 w-full mt-2 py-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-xl max-h-[280px] overflow-y-auto overflow-x-hidden animate-in slide-in-from-top-2 fade-in duration-200">
                    {OPTIONS.map(option => (
                      <div
                        key={option.value}
                        onClick={() => {
                          setFrom(option.value as typeof from);
                          setIsDropdownOpen(false);
                          if (window.umami) {
                            window.umami.track('Calculadora - Conversion', { moneda: option.value });
                          }
                        }}
                        className={`px-6 py-3 cursor-pointer text-sm font-black transition-colors flex items-center justify-between group ${from === option.value ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'}`}
                      >
                        {option.label}
                        {from === option.value && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Global/Base */}
        {from !== 'USD' && (
          <ResultCard 
            title="Global" 
            icon={Globe} 
            color={{bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400'}}
            items={[
              { label: 'Dólar USA', value: convert('USD'), prefix: '$', highlight: true }
            ]}
          />
        )}

        {/* Argentina */}
        <ResultCard 
          title="Argentina" 
          icon={ShieldCheck} 
          color={{bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-400'}}
          items={[
            ...(from !== 'ARS_OFFICIAL' ? [{ label: 'ARS (Oficial)', value: convert('ARS_OFFICIAL'), prefix: '$' }] : []),
            ...(from !== 'CRYPTO' ? [{ label: 'ARS (Crypto)', value: convert('CRYPTO'), prefix: '$' }] : []),
            ...(from !== 'WALLBIT' ? [{ label: 'ARS (Wallbit)', value: convert('WALLBIT'), prefix: '$' }] : [])
          ]}
        />

        {/* Venezuela */}
        <ResultCard 
          title="Venezuela" 
          icon={TrendingUp} 
          color={{bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400'}}
          items={[
            ...(from !== 'VES' ? [{ label: 'VES (Paralelo)', value: convert('VES'), suffix: 'VES' }] : []),
            ...(from !== 'VES_OFFICIAL' ? [{ label: 'VES (Oficial)', value: convert('VES_OFFICIAL'), suffix: 'VES' }] : [])
          ]}
        />

        {/* LATAM */}
        <ResultCard 
          title="LATAM" 
          icon={Globe} 
          color={{bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400'}}
          items={[
            ...(from !== 'UYU' ? [{ label: 'UYU (Peso)', value: convert('UYU'), prefix: '$' }] : []),
            ...(from !== 'BRL' ? [{ label: 'BRL (Real)', value: convert('BRL'), prefix: '$' }] : []),
            ...(from !== 'CLP' ? [{ label: 'CLP (Peso)', value: convert('CLP'), prefix: '$' }] : [])
          ]}
        />
      </div>
    </div>
  );
};



const RegionChart = ({ title, data, buyKey, sellKey, dataKey, color, icon: Icon, singleLine, onExpand, subtitle = "Tendencia 24h", hideHeader }: RegionChartProps) => (
  <div className={`bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col h-full min-h-[440px] ${hideHeader ? 'p-0 border-none shadow-none bg-transparent dark:bg-transparent' : 'p-6'}`}>
    {!hideHeader && (
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter flex items-center gap-2">
          <Icon className={`w-6 h-6 ${color.text}`} />
          {title}
        </h2>
        <div className="flex items-center gap-3">
          <div className="text-[10px] font-black text-slate-300 dark:text-slate-500 uppercase tracking-widest">{subtitle}</div>
          {onExpand && (
            <button 
              onClick={onExpand}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors group"
              title="Ver Historial"
            >
              <Maximize className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>
          )}
        </div>
      </div>
    )}
    
    <div className="flex-1 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={downsampleData(data, 350)}>
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
            dataKey="timestamp" 
            axisLine={false} 
            tickLine={false} 
            tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}}
            dy={10}
            tickFormatter={(str: string) => {
              try {
                return new Date(str).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              } catch {
                return '';
              }
            }}
          />
          <YAxis domain={['auto', 'auto']} hide />
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
          {!singleLine && <Legend iconType="circle" wrapperStyle={{paddingTop: '20px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase'}} />}
          
          {singleLine ? (
            <Area 
              name="Valor"
              type="monotone" 
              dataKey={dataKey || 'value'} 
              stroke={color.hex} 
              strokeWidth={4}
              fillOpacity={1} 
              fill={`url(#color-${dataKey || 'value'})`}
              isAnimationActive={false}
            />
          ) : (
            <>
              <Area 
                type="monotone" 
                dataKey="usd_blue" 
                stroke="#3b82f6" 
                strokeWidth={4}
                fillOpacity={1} 
                fill="url(#colorUsd)" 
                name="Dólar Blue"
                isAnimationActive={false}
              />
              <Area 
                type="monotone" 
                dataKey="usd_oficial" 
                stroke="#64748b" 
                strokeWidth={2}
                strokeDasharray="5 5"
                fillOpacity={0}
                name="Dólar Oficial"
                isAnimationActive={false}
              />
            </>
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
    <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-700/50 text-[9px] text-slate-300 dark:text-slate-500 font-black uppercase tracking-widest text-center">
      {singleLine ? 'Evolución del valor de mercado' : 'Evolución tasas de compra y venta'}
    </div>
  </div>
);

const ToastNotification = ({ note, onDismiss }: { note: AppNotification, onDismiss: (id: number, key: string) => void }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onDismiss(note.id, note.key);
    }, 400); // Allow time for exit animation
  }, [note.id, note.key, onDismiss]);

  useEffect(() => {
    if (isHovered) return;
    
    // Automatically dismiss after 8 seconds of no hovering
    const timer = setTimeout(() => {
      handleClose();
    }, 8000);

    return () => clearTimeout(timer);
  }, [isHovered, handleClose]);

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => setIsHovered(false)}
      className={`pointer-events-auto flex items-center gap-3 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 max-w-sm group transition-all duration-500 transform
        ${isClosing ? 'opacity-0 translate-x-12 scale-95 duration-300' : 'opacity-100 translate-x-0 scale-100 animate-in slide-in-from-right-8 fade-in'}`}
    >
      <div className={`p-2 rounded-full flex-shrink-0 ${note.type === 'up' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400'}`}>
        {note.type === 'up' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
      </div>
      <div className="flex-1 min-w-0 pr-2">
        <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tighter truncate">{note.message}</p>
        <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">Hace un momento</p>
      </div>
      <button 
        onClick={handleClose}
        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
        aria-label="Cerrar notificación"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

function App() {
  const { data, history, loading, error, isRefreshing, fetchData, notifications, changedKeys, dismissNotification } = useMarketData();
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [targetTime, setTargetTime] = useState(() => Date.now() + 300000);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(
    () => (localStorage.getItem('theme') as 'light' | 'dark' | 'system') || 'system'
  );
  const [activeTab, setActiveTab] = useState<'Argentina' | 'Venezuela' | 'Conversor' | 'Latam'>('Argentina');
  const handleRefresh = async () => {
    await fetchData();
    setTargetTime(Date.now() + 300000);
    setTimeLeft(300);
    setProgress(0);
  };

  const [modalChart, setModalChart] = useState<{ title: string; dataKey: string; color: { hex?: string; text: string; buyHex?: string; sellHex?: string }; icon: React.ElementType; singleLine?: boolean; } | null>(null);

  
  
  
  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const applyTheme = () => {
      root.classList.remove('light', 'dark');
      
      let activeTheme = theme;
      if (theme === 'system') {
        activeTheme = mediaQuery.matches ? 'dark' : 'light';
      }
      
      root.classList.add(activeTheme);
      localStorage.setItem('theme', theme);

      // Update theme-color meta tag for iOS Safari
      let metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (!metaThemeColor) {
        metaThemeColor = document.createElement('meta');
        metaThemeColor.setAttribute('name', 'theme-color');
        document.head.appendChild(metaThemeColor);
      }
      metaThemeColor.setAttribute('content', activeTheme === 'dark' ? '#0f172a' : '#f8fafc');
    };

    applyTheme();

    // Listen for changes when in system mode
    const handleSystemChange = () => {
      if (theme === 'system') applyTheme();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && theme === 'system') {
        applyTheme();
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [theme]);

  // Timer effect
  useEffect(() => {
    if (loading) return;

    const tick = () => {
      const remainingSeconds = Math.max(0, Math.floor((targetTime - Date.now()) / 1000));
      if (remainingSeconds <= 0) {
        // Solo actualizamos de fondo si la pestaña está activa, 
        // de otra forma los toast y animaciones suceden sin que el usuario los vea
        if (document.visibilityState === 'visible') {
          handleRefresh();
        } else {
          setTimeLeft(0); // Dejamos listo para que cargue en el momento que vuelvan
        }
      } else {
        setTimeLeft(remainingSeconds);
      }
    };

    const timer = setInterval(tick, 1000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        tick();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loading, targetTime]);

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 py-10 px-4 sm:px-6 lg:px-8 font-sans text-slate-900 pb-10 lg:pb-48 overflow-x-hidden w-full">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 dark:bg-white p-2.5 rounded-2xl shadow-xl rotate-3">
                <TrendingUp className="w-7 h-7 text-blue-400 dark:text-blue-600" />
              </div>
              <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">
                Market<span className="text-blue-600 dark:text-blue-400">Dash</span>
              </h1>
            </div>
            <p className="mt-2 text-slate-400 dark:text-slate-500 font-bold uppercase text-[10px] tracking-widest">Dólar al día: De Buenos Aires a Caracas</p>
            
            {/* Modern Status Badge */}
            {(() => {
              const open = isMarketOpen();
              return (
                <div className={`mt-4 flex items-center gap-2 ${open ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-100 dark:border-emerald-800/50' : 'bg-amber-50 dark:bg-amber-900/30 border-amber-100 dark:border-amber-800/50'} border px-3 py-1.5 rounded-full w-fit`}>
                  <div className={`w-2 h-2 rounded-full ${open ? 'bg-emerald-500' : 'bg-amber-500'} animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite] ${open ? 'shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'shadow-[0_0_8px_rgba(245,158,11,0.5)]'}`}></div>
                  <span className={`text-[10px] uppercase font-black ${open ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'} tracking-widest flex items-center gap-1`}>
                    {open ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                    {open ? 'Mercados Operando OK' : 'Mercados Cerrados'}
                  </span>
                </div>
              );
            })()}
          </div>
          
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <div className="flex bg-white dark:bg-slate-800 rounded-full shadow-sm border border-slate-100 dark:border-slate-700 p-1">
              <button 
                onClick={() => setTheme('light')}
                className={`p-2 rounded-full transition-all ${theme === 'light' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                title="Claro"
              >
                <Sun className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setTheme('system')}
                className={`p-2 rounded-full transition-all ${theme === 'system' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                title="Sistema"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setTheme('dark')}
                className={`p-2 rounded-full transition-all ${theme === 'dark' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                title="Oscuro"
              >
                <Moon className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-4 px-6 py-3 bg-white dark:bg-slate-800 rounded-full shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex flex-col items-end">
                  <span className="text-[9px] uppercase font-black text-slate-300 dark:text-slate-500 leading-none mb-1 tracking-tighter">
                    {data ? 'Última Sincronización' : isRefreshing ? 'Sincronizando...' : 'Desconectado'}
                  </span>
                  <span className="text-sm font-black text-slate-600 dark:white">
                    {data ? new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                  </span>
                </div>
                <button 
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className={`p-2 rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 transition-all ${isRefreshing ? 'animate-spin' : 'hover:rotate-180'}`}
                >
                  <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'text-blue-400' : 'text-blue-500'}`} />
                </button>
              </div>
              
              <div className="px-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Próxima Sincronización</span>
                  <span className="text-[10px] font-black text-blue-600 dark:text-blue-400">{formatTimeLeft()}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-1000 ease-linear rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-8 p-5 bg-red-50 dark:bg-red-900/30 border-2 border-red-100 dark:border-red-800/50 rounded-3xl flex items-center gap-3 text-red-700 dark:text-red-400 animate-pulse max-w-7xl mx-auto">
            <TrendingDown className="w-6 h-6" />
            <span className="font-black uppercase text-xs tracking-widest">{error}</span>
          </div>
        )}

        {/* Tab Navigation (Pill Selector) */}
        <div className="max-w-md mx-auto flex bg-slate-200/50 dark:bg-slate-800/50 p-1.5 rounded-full border border-slate-100 dark:border-slate-800 mb-12 transition-all duration-300 shadow-sm">
          <button 
            onClick={() => setActiveTab('Argentina')}
            data-umami-event="Tab - Argentina"
            className={`flex-1 px-2 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 ${
              activeTab === 'Argentina' 
                ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Argentina
          </button>
          <button 
            onClick={() => setActiveTab('Venezuela')}
            data-umami-event="Tab - Venezuela"
            className={`flex-1 px-2 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 ${
              activeTab === 'Venezuela' 
                ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Venezuela
          </button>
          <button 
            onClick={() => setActiveTab('Latam')}
            data-umami-event="Tab - Latam"
            className={`flex-1 px-2 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 ${
              activeTab === 'Latam' 
                ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            LATAM
          </button>
          <button 
            onClick={() => setActiveTab('Conversor')}
            data-umami-event="Tab - Calculadora"
            className={`flex-1 px-2 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 ${
              activeTab === 'Conversor' 
                ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Calculadora
          </button>
        </div>


        {/* Main Content Sections */}
        <div className="mb-24 pb-24">
          
          {/* Argentina Section */}
          {activeTab === 'Argentina' && (
            <div className="space-y-8 animate-in fade-in duration-700 slide-in-from-bottom-4">
              <div className="flex items-center gap-3 px-1">
                <div className="w-1.5 h-6 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.3)]" />
                <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-[0.2em]">Mercado Argentina</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:col-span-1">
                  {/* Oficial Group */}
                  <div className="space-y-8">
                    <StatCard 
                      title="Dólar Oficial" 
                      value={`$${formatNumber(data?.usd_oficial)}`} 
                      icon={ShieldCheck} 
                      color="bg-slate-600"
                      buy={formatNumber(data?.usd_oficial ? data.usd_oficial - 20 : 0)}
                      sell={formatNumber(data?.usd_oficial)}
                      change={data?.changes?.usd_oficial_percent}
                      pulseType={changedKeys['usd_oficial']}
                    />
                    <div className="h-[440px]">
                      <RegionChart 
                        title="Tendencia AR (Oficial)" 
                        data={history} 
                        dataKey="usd_oficial" 
                        color={{hex: '#64748b', text: 'text-slate-600'}}
                        icon={TrendingUp}
                        singleLine={true}
                        onExpand={() => setModalChart({ title: 'Tendencia AR (Oficial)', dataKey: 'usd_oficial', color: {hex: '#64748b', text: 'text-slate-600'}, icon: TrendingUp, singleLine: true })}
                      />
                    </div>
                  </div>

                  {/* Cripto Group */}
                  <div className="space-y-8">
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
                        onExpand={() => setModalChart({ title: 'Tendencia AR (Cripto)', dataKey: 'usd_cripto', color: {hex: '#9333ea', text: 'text-purple-600'}, icon: Bitcoin, singleLine: true })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-8 flex flex-col h-full">
                  {/* Otros Dólares Card */}
                  <div className="flex-1 bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col">
                    <h3 className="text-[10px] font-black text-slate-300 dark:text-slate-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                      <Info className="w-4 h-4 text-slate-300 dark:text-slate-500" /> Otros Dólares AR
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
                      <div className={`flex justify-between items-center p-5 rounded-2xl transition-all duration-500 group ${
                        changedKeys['usd_wallbit'] === 'up' ? 'bg-emerald-50 dark:bg-emerald-900/40 ring-2 ring-emerald-500 dark:ring-emerald-400' :
                        changedKeys['usd_wallbit'] === 'down' ? 'bg-red-50 dark:bg-red-900/40 ring-2 ring-red-500 dark:ring-red-400' :
                        'bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-transparent dark:border-slate-700/50'
                      }`}>
                        <span className="font-black text-slate-500 uppercase text-xs tracking-tight">Dólar Wallbit</span>
                        <div className="flex flex-col items-end">
                          <span className="font-black text-blue-700 dark:text-blue-400 text-lg group-hover:scale-110 transition-transform">$ {formatNumber(data?.usd_wallbit)}</span>
                          <span className={`text-[10px] font-bold ${(data?.changes?.otros_dolares_percents?.wallbit ?? 0) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {(data?.changes?.otros_dolares_percents?.wallbit ?? 0) >= 0 ? '+' : ''}{(data?.changes?.otros_dolares_percents?.wallbit ?? 0).toFixed(2)}%
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
                        onExpand={() => setModalChart({ title: 'Tendencia VE (Oficial)', dataKey: 'ves_oficial', color: {hex: '#3b82f6', text: 'text-blue-500'}, icon: ShieldCheck, singleLine: true })}
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
                        onExpand={() => setModalChart({ title: 'Tendencia VE (Paralelo)', dataKey: 'ves_paralelo', color: {hex: '#eab308', text: 'text-yellow-500'}, icon: TrendingUp, singleLine: true })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-8 flex flex-col h-full">
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

      {/* Full History Modal */}
      {modalChart && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
            onClick={() => setModalChart(null)} 
          />
          <div className="relative w-full max-w-5xl h-[80vh] flex flex-col bg-slate-50 dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between p-6 sm:p-8 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700`}>
                  <modalChart.icon className={`w-6 h-6 ${modalChart.color.text}`} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">
                    {modalChart.title}
                  </h2>
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
                    Historial Completo (Hasta 7 Días)
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setModalChart(null)}
                className="p-2 sm:p-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 p-6 sm:p-8 min-h-0 w-full">
              <RegionChart 
                title={modalChart.title}
                subtitle="Evolución Histórica (7 Días)"
                data={history} 
                dataKey={modalChart.dataKey} 
                color={modalChart.color}
                icon={modalChart.icon}
                singleLine={modalChart.singleLine}
                hideHeader={true}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
