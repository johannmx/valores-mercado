import { useState, useEffect, useCallback, useMemo, memo } from 'react';
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
  const [from, setFrom] = useState<'USD' | 'ARS' | 'VES' | 'UYU' | 'CLP' | 'BRL' | 'EUR'>('USD');
  const [arsRateType, setArsRateType] = useState<'CRYPTO' | 'WALLBIT' | 'ARS_OFFICIAL'>('CRYPTO');
  const [vesRateType, setVesRateType] = useState<'VES' | 'VES_OFFICIAL'>('VES');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const OPTIONS = [
    { value: 'USD', label: 'USD - Dólar USA' },
    { value: 'ARS', label: 'ARS - Peso Argentino' },
    { value: 'VES', label: 'VES - Bolívar Venezolano' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'UYU', label: 'UYU - Peso Uruguayo' },
    { value: 'CLP', label: 'CLP - Peso Chileno' },
    { value: 'BRL', label: 'BRL - Real Brasileño' }
  ];

  if (!data) return null;

  const rates: Record<string, number> = {
    USD: 1,
    ARS_BLUE: data.usd_blue || 1,
    ARS_OFFICIAL: data.usd_oficial || 1,
    CRYPTO: data.usd_cripto || 1,
    WALLBIT: data.usd_wallbit || 1,
    VES: data.ves_paralelo || 1,
    VES_OFFICIAL: data.ves_oficial || 1,
    UYU: data.uyu_venta || 1,
    CLP: data.clp_venta || 1,
    BRL: data.brl_venta || 1,
    EUR: data.eur_venta || 1
  };

  const getUsdAmount = () => {
    if (from === 'USD') return amount;
    if (from === 'ARS') {
      const selectedRateKey = arsRateType === 'ARS_OFFICIAL' ? 'ARS_OFFICIAL' : arsRateType === 'WALLBIT' ? 'WALLBIT' : 'CRYPTO';
      const rate = rates[selectedRateKey] || 1;
      return amount / rate;
    }
    if (from === 'VES') {
      const selectedRateKey = vesRateType === 'VES_OFFICIAL' ? 'VES_OFFICIAL' : 'VES';
      const rate = rates[selectedRateKey] || 1;
      return amount / rate;
    }
    const rate = rates[from] || 1;
    return amount / rate;
  };

  const convertUsdTo = (toKey: keyof typeof rates) => {
    const usdAmount = getUsdAmount();
    const targetRate = rates[toKey] || 1;
    const result = usdAmount * targetRate;
    
    if (['ARS_BLUE', 'ARS_OFFICIAL', 'CRYPTO', 'WALLBIT', 'VES', 'VES_OFFICIAL'].includes(toKey)) {
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

          {/* Sub-selector para ARS cuando la moneda base ingresada es ARS */}
          {from === 'ARS' && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700/50 flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Cotización base para ARS:</span>
              <div className="inline-flex rounded-xl bg-slate-200 dark:bg-slate-800 p-1 gap-1">
                <button
                  type="button"
                  onClick={() => setArsRateType('CRYPTO')}
                  className={`px-3 py-1 text-xs font-black rounded-lg transition-all ${
                    arsRateType === 'CRYPTO' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Crypto
                </button>
                <button
                  type="button"
                  onClick={() => setArsRateType('WALLBIT')}
                  className={`px-3 py-1 text-xs font-black rounded-lg transition-all ${
                    arsRateType === 'WALLBIT' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Wallbit
                </button>
                <button
                  type="button"
                  onClick={() => setArsRateType('ARS_OFFICIAL')}
                  className={`px-3 py-1 text-xs font-black rounded-lg transition-all ${
                    arsRateType === 'ARS_OFFICIAL' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Oficial
                </button>
              </div>
            </div>
          )}

          {/* Sub-selector para VES cuando la moneda base ingresada es VES */}
          {from === 'VES' && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700/50 flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Cotización base para VES:</span>
              <div className="inline-flex rounded-xl bg-slate-200 dark:bg-slate-800 p-1 gap-1">
                <button
                  type="button"
                  onClick={() => setVesRateType('VES')}
                  className={`px-3 py-1 text-xs font-black rounded-lg transition-all ${
                    vesRateType === 'VES' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Paralelo
                </button>
                <button
                  type="button"
                  onClick={() => setVesRateType('VES_OFFICIAL')}
                  className={`px-3 py-1 text-xs font-black rounded-lg transition-all ${
                    vesRateType === 'VES_OFFICIAL' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Oficial
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Global/USD */}
        {from !== 'USD' ? (
          <ResultCard 
            title="Global" 
            icon={Globe} 
            color={{bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400'}}
            items={[
              { label: 'Dólar USA (USD)', value: convertUsdTo('USD'), prefix: '$', highlight: true }
            ]}
          />
        ) : (
          <ResultCard 
            title="Europa" 
            icon={Globe} 
            color={{bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400'}}
            items={[
              { label: 'EUR (Euro)', value: convertUsdTo('EUR'), prefix: '€', highlight: true }
            ]}
          />
        )}

        {/* Argentina */}
        <ResultCard 
          title="Argentina" 
          icon={ShieldCheck} 
          color={{bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-400'}}
          items={[
            ...(from !== 'ARS' || arsRateType !== 'ARS_OFFICIAL' ? [{ label: 'ARS (Oficial)', value: convertUsdTo('ARS_OFFICIAL'), prefix: '$' }] : []),
            ...(from !== 'ARS' || arsRateType !== 'CRYPTO' ? [{ label: 'ARS (Crypto)', value: convertUsdTo('CRYPTO'), prefix: '$' }] : []),
            ...(from !== 'ARS' || arsRateType !== 'WALLBIT' ? [{ label: 'ARS (Wallbit)', value: convertUsdTo('WALLBIT'), prefix: '$' }] : [])
          ]}
        />

        {/* Venezuela */}
        <ResultCard 
          title="Venezuela" 
          icon={TrendingUp} 
          color={{bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400'}}
          items={[
            ...(from !== 'VES' || vesRateType !== 'VES' ? [{ label: 'VES (Paralelo)', value: convertUsdTo('VES'), suffix: 'VES' }] : []),
            ...(from !== 'VES' || vesRateType !== 'VES_OFFICIAL' ? [{ label: 'VES (Oficial)', value: convertUsdTo('VES_OFFICIAL'), suffix: 'VES' }] : [])
          ]}
        />

        {/* LATAM */}
        <ResultCard 
          title="LATAM" 
          icon={Globe} 
          color={{bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400'}}
          items={[
            ...(from !== 'UYU' ? [{ label: 'UYU (Peso)', value: convertUsdTo('UYU'), prefix: '$' }] : []),
            ...(from !== 'BRL' ? [{ label: 'BRL (Real)', value: convertUsdTo('BRL'), prefix: '$' }] : []),
            ...(from !== 'CLP' ? [{ label: 'CLP (Peso)', value: convertUsdTo('CLP'), prefix: '$' }] : [])
          ]}
        />
      </div>
    </div>
  );
};

const timeCache = new Map<string, string>();
const dateTimeCache = new Map<string, string>();

const formatTime = (str: string) => {
  let cached = timeCache.get(str);
  if (!cached) {
    cached = new Date(str).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    timeCache.set(str, cached);
  }
  return cached;
};

const formatDateTime = (str: string) => {
  let cached = dateTimeCache.get(str);
  if (!cached) {
    cached = new Date(str).toLocaleString('es-AR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    });
    dateTimeCache.set(str, cached);
  }
  return cached;
};

const CustomTooltip = memo(({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const formattedLabel = formatDateTime(label);

    return (
      <div className="bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-xl border border-slate-800 text-xs">
        <p className="text-slate-400 mb-2 font-bold flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          {formattedLabel}
        </p>
        <div className="space-y-1.5">
          {payload.map((entry: any, index: number) => {
            if (entry.value === undefined || entry.value === null) return null;
            return (
              <div key={`item-${index}`} className="flex items-center justify-between gap-4 font-bold">
                <span style={{ color: entry.color }} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                  {entry.name}:
                </span>
                <span className="font-mono text-sm">${entry.value.toLocaleString('de-DE')}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
});

const RegionChart = memo(({ title, data, buyKey, sellKey, dataKey, color, icon: Icon, singleLine, onExpand, subtitle, hideHeader }: RegionChartProps) => {
  const chartData = useMemo(() => downsampleData(data, 30), [data]);

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm transition-all duration-300 flex flex-col justify-between h-full">
      {!hideHeader && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50 ${color.text}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight text-sm">{title}</h3>
              {subtitle && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{subtitle}</p>}
            </div>
          </div>
          {onExpand && (
            <button 
              onClick={onExpand}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              title="Ver gráfico completo"
            >
              <Maximize className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              {singleLine ? (
                <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color.hex || '#3b82f6'} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={color.hex || '#3b82f6'} stopOpacity={0}/>
                </linearGradient>
              ) : (
                <>
                  <linearGradient id={`grad-buy-${title}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color.buyHex || '#10b981'} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={color.buyHex || '#10b981'} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id={`grad-sell-${title}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color.sellHex || '#ef4444'} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={color.sellHex || '#ef4444'} stopOpacity={0}/>
                  </linearGradient>
                </>
              )}
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
            <XAxis 
              dataKey="timestamp" 
              tickFormatter={formatTime}
              stroke="#94a3b8" 
              fontSize={10} 
              tickLine={false}
              axisLine={false}
              dy={5}
            />
            <YAxis 
              stroke="#94a3b8" 
              fontSize={10} 
              tickLine={false}
              axisLine={false}
              domain={['auto', 'auto']}
              tickFormatter={(val) => `$${val}`}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {singleLine ? (
              <Area 
                type="monotone" 
                dataKey={dataKey || 'value'} 
                name="Cotización"
                stroke={color.hex || '#3b82f6'} 
                strokeWidth={2}
                fillOpacity={1} 
                fill={`url(#grad-${title})`} 
              />
            ) : (
              <>
                <Area 
                  type="monotone" 
                  dataKey={buyKey || 'buy'} 
                  name="Compra"
                  stroke={color.buyHex || '#10b981'} 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill={`url(#grad-buy-${title})`} 
                />
                <Area 
                  type="monotone" 
                  dataKey={sellKey || 'sell'} 
                  name="Venta"
                  stroke={color.sellHex || '#ef4444'} 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill={`url(#grad-sell-${title})`} 
                />
              </>
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

export default function App() {
  const { data, history, loading, error, isRefetching, notifications, dismissNotification, refetch } = useMarketData();
  const [activeTab, setActiveTab] = useState<'argentina' | 'venezuela' | 'latam' | 'calculator'>('argentina');
  const [expandedChart, setExpandedChart] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const marketStatus = useMemo(() => isMarketOpen(), []);

  const handleTabChange = useCallback((tab: 'argentina' | 'venezuela' | 'latam' | 'calculator') => {
    setActiveTab(tab);
    if (window.umami) {
      window.umami.track('Tab Switch', { tab });
    }
  }, []);

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
        <div className="relative flex items-center justify-center mb-6">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          <DollarSign className="w-6 h-6 text-blue-500 absolute" />
        </div>
        <h2 className="text-xl font-black uppercase tracking-widest text-slate-200 mb-2">Sincronizando Mercados</h2>
        <p className="text-xs font-bold text-slate-500 tracking-wider uppercase">Obteniendo cotizaciones en tiempo real...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-3xl max-w-md text-center">
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-4" />
          <h2 className="text-lg font-black uppercase tracking-tight mb-2">{error}</h2>
          <p className="text-xs text-slate-400 mb-6">No se pudo establecer conexión con las fuentes de datos. Revisa tu conexión a internet.</p>
          <button 
            onClick={refetch}
            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-red-500/25"
          >
            Reintentar Conexión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {notifications.map((n: AppNotification) => (
          <div 
            key={n.id} 
            className={`pointer-events-auto p-4 rounded-2xl shadow-xl border backdrop-blur-md flex items-start gap-3 transition-all animate-in slide-in-from-top-5 duration-300 ${
              n.type === 'error' ? 'bg-red-900/90 border-red-700 text-white' :
              n.type === 'warning' ? 'bg-amber-900/90 border-amber-700 text-white' :
              'bg-slate-900/90 border-slate-700 text-white'
            }`}
          >
            <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
              n.type === 'error' ? 'text-red-400' : 'text-amber-400'
            }`} />
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-black uppercase tracking-wider mb-1">{n.title}</h4>
              <p className="text-xs text-slate-300">{n.message}</p>
            </div>
            <button 
              onClick={() => dismissNotification(n.id)}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/20">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
                  Market<span className="text-blue-600 dark:text-blue-400">Dash</span>
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full border border-blue-100 dark:border-blue-800/50">LATAM</span>
                </h1>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Monitoreo de Divisas en Tiempo Real</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Market Status Indicator */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold">
                <span className={`w-2 h-2 rounded-full ${marketStatus.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                <span className="text-slate-600 dark:text-slate-300">{marketStatus.isOpen ? 'Mercado Abierto' : 'Mercado Cerrado'}</span>
              </div>

              {/* Refetch Button */}
              <button
                onClick={refetch}
                disabled={isRefetching}
                className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all cursor-pointer disabled:opacity-50"
                title="Actualizar Datos"
              >
                <RefreshCw className={`w-5 h-5 ${isRefetching ? 'animate-spin text-blue-500' : ''}`} />
              </button>

              {/* Theme Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
                title="Cambiar Tema"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto no-scrollbar gap-2 p-1.5 bg-slate-200/60 dark:bg-slate-900/60 rounded-3xl border border-slate-200/50 dark:border-slate-800/50">
          <button
            onClick={() => handleTabChange('argentina')}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'argentina' 
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-md' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Argentina
          </button>

          <button
            onClick={() => handleTabChange('venezuela')}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'venezuela' 
                ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-md' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Venezuela
          </button>

          <button
            onClick={() => handleTabChange('latam')}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'latam' 
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-md' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4" />
            LATAM
          </button>

          <button
            onClick={() => handleTabChange('calculator')}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'calculator' 
                ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-md' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            Calculadora
          </button>
        </div>

        {/* Tab: Argentina */}
        {activeTab === 'argentina' && data && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-500" />
                Mercado Argentina
              </h2>
              {data.timestamp && (
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Actualizado: {formatDateTime(data.timestamp)}
                </span>
              )}
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard
                title="Dólar Oficial"
                value={`$${formatNumber(data.usd_oficial)}`}
                icon={DollarSign}
                color="bg-blue-600"
                change={data.changes?.usd_oficial_percent}
              />
              <StatCard
                title="Dólar Blue"
                value={`$${formatNumber(data.usd_blue)}`}
                icon={TrendingUp}
                color="bg-emerald-600"
                change={data.changes?.usd_blue_percent}
              />
              <StatCard
                title="Dólar MEP"
                value={`$${formatNumber(data.usd_mep)}`}
                icon={TrendingUp}
                color="bg-indigo-600"
              />
              <StatCard
                title="Dólar CCL"
                value={`$${formatNumber(data.usd_ccl)}`}
                icon={TrendingUp}
                color="bg-purple-600"
              />
              <StatCard
                title="Dólar Cripto"
                value={`$${formatNumber(data.usd_cripto)}`}
                icon={Bitcoin}
                color="bg-amber-600"
              />
              {data.usd_wallbit && (
                <StatCard
                  title="Dólar Wallbit"
                  value={`$${formatNumber(data.usd_wallbit)}`}
                  icon={ShieldCheck}
                  color="bg-cyan-600"
                  badge="Wallbit"
                />
              )}
            </div>

            {/* Charts Section */}
            {history.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">Tendencia de Cotizaciones (24h)</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <RegionChart
                    title="Dólar Blue (ARS)"
                    data={history}
                    dataKey="usd_blue"
                    singleLine
                    color={{ text: 'text-emerald-500', hex: '#10b981' }}
                    icon={TrendingUp}
                    onExpand={() => setExpandedChart('usd_blue')}
                  />
                  <RegionChart
                    title="Dólar Oficial (ARS)"
                    data={history}
                    dataKey="usd_oficial"
                    singleLine
                    color={{ text: 'text-blue-500', hex: '#3b82f6' }}
                    icon={DollarSign}
                    onExpand={() => setExpandedChart('usd_oficial')}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab: Venezuela */}
        {activeTab === 'venezuela' && data && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-500" />
                Mercado Venezuela
              </h2>
              {data.timestamp && (
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Actualizado: {formatDateTime(data.timestamp)}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <StatCard
                title="Dólar Paralelo"
                value={`${formatNumber(data.ves_paralelo)} VES`}
                subtitle="Promedio Monitor"
                icon={TrendingUp}
                color="bg-amber-600"
              />
              <StatCard
                title="Dólar Oficial BCV"
                value={`${formatNumber(data.ves_oficial)} VES`}
                subtitle="Banco Central de Venezuela"
                icon={ShieldCheck}
                color="bg-blue-600"
              />
            </div>
          </div>
        )}

        {/* Tab: LATAM */}
        {activeTab === 'latam' && data && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-500" />
                Cotizaciones Latinoamérica
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Peso Uruguayo"
                value={`$${formatNumber(data.uyu_venta)} UYU`}
                subtitle="Cotización Venta"
                icon={Globe}
                color="bg-sky-600"
              />
              <StatCard
                title="Peso Chileno"
                value={`$${formatNumber(data.clp_venta)} CLP`}
                subtitle="Cotización Venta"
                icon={Globe}
                color="bg-red-600"
              />
              <StatCard
                title="Real Brasileño"
                value={`R$${formatNumber(data.brl_venta)} BRL`}
                subtitle="Cotización Venta"
                icon={Globe}
                color="bg-emerald-600"
              />
              <StatCard
                title="Euro"
                value={`€${formatNumber(data.eur_venta)} EUR`}
                subtitle="Cotización Venta"
                icon={Euro}
                color="bg-indigo-600"
              />
            </div>
          </div>
        )}

        {/* Tab: Calculator */}
        {activeTab === 'calculator' && (
          <div className="animate-in fade-in duration-300">
            <Converter data={data} />
          </div>
        )}
      </main>

      {/* Expanded Chart Modal */}
      {expandedChart && history.length > 0 && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-lg uppercase tracking-tight text-slate-800 dark:text-white">
                Gráfico Detallado: {expandedChart === 'usd_blue' ? 'Dólar Blue' : 'Dólar Oficial'}
              </h3>
              <button 
                onClick={() => setExpandedChart(null)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="h-96 w-full">
              <RegionChart
                title={expandedChart}
                data={history}
                dataKey={expandedChart}
                singleLine
                color={expandedChart === 'usd_blue' ? { text: 'text-emerald-500', hex: '#10b981' } : { text: 'text-blue-500', hex: '#3b82f6' }}
                icon={TrendingUp}
                hideHeader
              />
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/60 mt-16 py-8 bg-white/40 dark:bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center sm:text-left">
            MarketDash LATAM &copy; {new Date().getFullYear()} &bull; Datos provistos por DolarApi &amp; Binance
          </p>
          <div className="flex items-center gap-4">
            <a 
              href="https://github.com/johannmx/valores-mercado" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
