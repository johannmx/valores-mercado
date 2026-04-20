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
  ves_compra: number;
  uyu_venta: number;
  uyu_compra: number;
  clp_venta: number;
  clp_compra: number;
  brl_venta: number;
  brl_compra: number;
  eur_venta: number;
  eur_compra: number;
  uyu_ar: number;
  clp_ar: number;
  brl_ar: number;
  btc_usd: number;
  changes: {
    usd_oficial_percent: number;
    usd_blue_percent: number;
    ves_oficial_percent: number;
    ves_paralelo_percent: number;
    ves_eur_oficial_percent: number;
    ves_eur_paralelo_percent: number;
    uyu_percent: number;
    clp_percent: number;
    brl_percent: number;
    eur_percent: number;
    uyu_ar_percent: number;
    clp_ar_percent: number;
    brl_ar_percent: number;
    otros_dolares_percents: Record<string, number>;
    bitcoin_percent: number;
  };
  api_status: {
    dolar_api_ar: boolean;
    dolar_api_ve: boolean;
    dolar_api_latam: boolean;
    binance_api: boolean;
    api_health?: string;
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

export const formatNumber = (num: number | string | null | undefined) => {
  if (num === null || num === undefined || num === '') return '';
  const parsed = Number(num);
  if (isNaN(parsed)) return num;
  return parsed.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

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

  const baseClasses = \"bg-white dark:bg-slate-800 p-3 rounded-2xl transition-all duration-500 relative overflow-hidden group min-h-[100px]\";
  const pulseClasses = pulseType === 'up' 
    ? 'ring-2 ring-emerald-500 dark:ring-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] border-transparent' 
    : pulseType === 'down' 
    ? 'ring-2 ring-red-500 dark:ring-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)] border-transparent' 
    : 'border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md';

  return (
    <div className={`${baseClasses} ${pulseClasses}`}>
      <div className=\"flex items-center justify-between mb-2\">
        <div className={`p-3 rounded-xl ${color} shadow-sm group-hover:scale-110 transition-transform`}>
          <Icon className=\"w-6 h-6 text-white\" />
        </div>
        <div className=\"flex flex-col items-end gap-1\">
          <span className=\"text-[10px] font-black text-gray-400 uppercase tracking-widest leading-tight\">{title}</span>
          {change !== undefined && (
            <div className=\"flex flex-col items-end gap-1 mt-1\">
              <span className={`flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isNeutral ? 'text-slate-500 bg-slate-100 dark:bg-slate-700' :
                isPositive ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400' : 'text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {isNeutral ? <TrendingUp className=\"w-3 h-3 text-slate-400\" /> : isPositive ? <ArrowUpRight className=\"w-3 h-3\" /> : <ArrowDownRight className=\"w-3 h-3\" />}
                {Math.abs(change).toFixed(2)}%
              </span>
              {spread !== undefined && (
                <span className=\"text-[9px] font-black text-slate-400 uppercase tracking-tighter\">Spread: {spread}%</span>
              )}
            </div>
          )}
        </div>
      </div>
      <div className=\"space-y-1\">
        <h3 className=\"text-4xl font-black text-slate-800 dark:text-white tracking-tight leading-none\">{displayValue}</h3>
        {subtitle && <p className=\"text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tighter\">{subtitle}</p>}
        {(buy !== undefined || sell !== undefined || badge) && (
          <div className=\"flex justify-between items-end mt-4 pt-4 border-t border-slate-50 dark:border-slate-700/50 text-[10px] font-bold uppercase\">
            <div className=\"flex gap-4\">
              {buy !== undefined && (
                <div className=\"flex flex-col\">
                  <span className=\"text-slate-300 dark:text-slate-500 mb-0.5\">Compra</span>
                  <span className=\"text-slate-600 dark:text-slate-300\">$ {buy || '-'}</span>
                </div>
              )}
              {sell !== undefined && (
                <div className=\"flex flex-col\">
                  <span className=\"text-slate-300 dark:text-slate-500 mb-0.5\">Venta</span>
                  <span className=\"text-slate-600 dark:text-slate-300\">$ {sell || '-'}</span>
                </div>
              )}
            </div>
            {badge && (
              <span className=\"text-[9px] font-black uppercase tracking-widest bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full mb-0.5\">
                {badge}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const Converter = ({ data }: { data: MarketData | null }) => {
  const [amount, setAmount] = useState<number>(1);
  const [from, setFrom] = useState<'USD' | 'ARS_BLUE' | 'ARS_OFFICIAL' | 'CRYPTO' | 'VES' | 'VES_OFFICIAL' | 'UYU' | 'CLP' | 'BRL' | 'EUR'>('USD');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const OPTIONS = [
    { value: 'USD', label: 'USD - Dólar USA' },
    { value: 'ARS_OFFICIAL', label: 'ARS - Dólar Oficial' },
    { value: 'CRYPTO', label: 'ARS - Dólar Crypto' },
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
    VES: data.ves_paralelo,
    VES_OFFICIAL: data.ves_oficial,
    UYU: data.uyu_venta,
    CLP: data.clp_venta,
    BRL: data.brl_venta,
    EUR: data.eur_venta
  };

  const convert = (to: 'USD' | 'ARS_BLUE' | 'ARS_OFFICIAL' | 'CRYPTO' | 'VES' | 'VES_OFFICIAL' | 'UYU' | 'CLP' | 'BRL' | 'EUR') => {
    const usdAmount = amount / rates[from];
    const result = usdAmount * rates[to];
    
    if (to === 'ARS_BLUE' || to === 'ARS_OFFICIAL' || to === 'CRYPTO' || to === 'VES' || to === 'VES_OFFICIAL') {
      return result.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return result.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };


  const ResultCard = ({ title, items, icon: Icon, color }: ResultCardProps) => (
    <div className=\"bg-white dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-sm flex flex-col h-full hover:shadow-md transition-all duration-300\">
      <div className=\"flex items-center gap-2 mb-6\">
        <div className={`p-2 rounded-lg ${color.bg}`}>
          <Icon className={`w-4 h-4 ${color.text}`} />
        </div>
        <h3 className=\"text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]\">{title}</h3>
      </div>
      <div className=\"space-y-4 flex-1\">
        {items.map((item: ResultCardItem) => (
          <div key={item.label} className=\"flex justify-between items-center group\">
            <span className=\"text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tight group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors\">{item.label}</span>
            <div className=\"flex flex-col items-end\">
              <span className={`text-lg font-black ${item.highlight ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-white'}`}>
                {item.prefix && <span className=\"mr-1\">{item.prefix}</span>}
                {item.value}
                {item.suffix && <span className=\"ml-1 text-[10px] opacity-60\">{item.suffix}</span>}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className=\"space-y-8\">
      {/* Input Header Card */}
      <div className=\"bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700\">
        <div className=\"flex items-center gap-2 mb-6\">
          <ArrowRightLeft className=\"w-6 h-6 text-blue-600 dark:text-blue-400\" />
          <h2 className=\"text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter\">Conversor Rápido</h2>
        </div>
        
        <div className=\"bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-transparent dark:border-slate-700\">
          <label className=\"block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2\">Monto a convertir</label>
          <div className=\"flex flex-col sm:flex-row gap-3\">
            <input 
              type=\"number\" 
              value={amount.toString()} 
              onChange={(e) => {
                const val = e.target.value;
                if (val.length \u003e 15) return; // Security: Prevent excessive input length (DoS mitigation)
                if (val === '') {
                  setAmount(0);
                } else {
                  const noLeadingZeros = val.replace(/^0+(?=\d)/, '');
                  setAmount(Number(noLeadingZeros));
                }
              }}
              className=\"flex-1 min-w-0 px-6 py-3 border-0 bg-white dark:bg-slate-800 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-black text-2xl text-slate-800 dark:text-white\"
              placeholder=\"0.00\"
            />
            <div className=\"relative flex-shrink-0 min-w-[220px]\">
              <button
                type=\"button\"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className=\"w-full h-full flex items-center justify-between px-6 py-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-2xl font-black outline-none cursor-pointer transition-all shadow-sm text-sm\"
              >
                <span>{OPTIONS.find(o =\u003e o.value === from)?.label || 'Seleccionar moneda'}</span>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isDropdownOpen && (
                \u003c\u003e
                  \u003cdiv 
                    className=\"fixed inset-0 z-10\" 
                    onClick={() => setIsDropdownOpen(false)} 
                  /\u003e
                  \u003cdiv className=\"absolute z-20 w-full mt-2 py-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-xl max-h-[280px] overflow-y-auto overflow-x-hidden animate-in slide-in-from-top-2 fade-in duration-200\"\u003e
                    {OPTIONS.map(option =\u003e (
                      \u003cdiv
                        key={option.value}
                        onClick={() => {
                          setFrom(option.value as any);
                          setIsDropdownOpen(false);
                          if (window.umami) {
                            window.umami.track('Calculadora - Conversion', { moneda: option.value });
                          }
                        }}
                        className={`px-6 py-3 cursor-pointer text-sm font-black transition-colors flex items-center justify-between group ${from === option.value ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'}`}
                      \u003e
                        {option.label}
                        {from === option.value && \u003cCheckCircle2 className=\"w-4 h-4\" /\u003e}
                      \u003c/div\u003e
                    ))}
                  \u003c/div\u003e
                \u003c/\u003e
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      \u003cdiv className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6\"\u003e
        {/* Global/Base */}
        {from !== 'USD' && (
          \u003cResultCard 
            title=\"Global\" 
            icon={Globe} 
            color={{bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400'}}
            items={[
              { label: 'Dólar USA', value: convert('USD'), prefix: '$', highlight: true }
            ]}
          /\u003e
        )}

        {/* Argentina */}
        \u003cResultCard 
          title=\"Argentina\" 
          icon={ShieldCheck} 
          color={{bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-400'}}
          items={[
            ...(from !== 'ARS_OFFICIAL' ? [{ label: 'ARS (Oficial)', value: convert('ARS_OFFICIAL'), prefix: '$' }] : []),
            ...(from !== 'CRYPTO' ? [{ label: 'ARS (Crypto)', value: convert('CRYPTO'), prefix: '$' }] : [])
          ]}
        /\u003e

        {/* Venezuela */}
        \u003cResultCard 
          title=\"Venezuela\" 
          icon={TrendingUp} 
          color={{bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400'}}
          items={[
            ...(from !== 'VES' ? [{ label: 'VES (Paralelo)', value: convert('VES'), suffix: 'VES' }] : []),
            ...(from !== 'VES_OFFICIAL' ? [{ label: 'VES (Oficial)', value: convert('VES_OFFICIAL'), suffix: 'VES' }] : [])
          ]}
        /\u003e

        {/* LATAM */}
        \u003cResultCard 
          title=\"LATAM\" 
          icon={Globe} 
          color={{bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400'}}
          items={[
            ...(from !== 'UYU' ? [{ label: 'UYU (Peso)', value: convert('UYU'), prefix: '$' }] : []),
            ...(from !== 'BRL' ? [{ label: 'BRL (Real)', value: convert('BRL'), prefix: '$' }] : []),
            ...(from !== 'CLP' ? [{ label: 'CLP (Peso)', value: convert('CLP'), prefix: '$' }] : [])
          ]}
        /\u003e
      \u003c/div\u003e
    \u003c/div\u003e
  );
};



const RegionChart = ({ title, data, buyKey, sellKey, dataKey, color, icon: Icon, singleLine }: RegionChartProps) =\u003e (
  \u003cdiv className=\"bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col h-full min-h-[440px]\"\u003e
    \u003cdiv className=\"flex items-center justify-between mb-8\"\u003e
      \u003ch2 className=\"text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter flex items-center gap-2\"\u003e
        \u003cIcon className={`w-6 h-6 ${color.text}`} /\u003e
        {title}
      \u003c/h2\u003e
      \u003cdiv className=\"text-[10px] font-black text-slate-300 dark:text-slate-500 uppercase tracking-widest\"\u003eTendencia 24h\u003c/div\u003e
    \u003c/div\u003e
    
    \u003cdiv className=\"flex-1 w-full\"\u003e
      \u003cResponsiveContainer width=\"100%\" height=\"100%\"\u003e
        \u003cAreaChart data={data}\u003e
          \u003cdefs\u003e
            {singleLine ? (
              \u003clinearGradient id={`color-${dataKey}`} x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"\u003e
                \u003cstop offset=\"5%\" stopColor={color.hex} stopOpacity={0.2}/\u003e
                \u003cstop offset=\"95%\" stopColor={color.hex} stopOpacity={0}/\u003e
              \u003c/linearGradient\u003e
            ) : (
              \u003c\u003e
                \u003clinearGradient id={`color-buy-${buyKey}`} x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"\u003e
                  \u003cstop offset=\"5%\" stopColor={color.buyHex} stopOpacity={0.2}/\u003e
                  \u003cstop offset=\"95%\" stopColor={color.buyHex} stopOpacity={0}/\u003e
                \u003c/linearGradient\u003e
                \u003clinearGradient id={`color-sell-${sellKey}`} x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"\u003e
                  \u003cstop offset=\"5%\" stopColor={color.sellHex} stopOpacity={0.2}/\u003e
                  \u003cstop offset=\"95%\" stopColor={color.sellHex} stopOpacity={0}/\u003e
                \u003c/linearGradient\u003e
              \u003c/\u003e
            )}
          \u003c/defs\u003e
          \u003cCartesianGrid strokeDasharray=\"3 3\" vertical={false} stroke=\"#f1f5f9\" /\u003e
          \u003cXAxis 
            dataKey=\"timestamp\" 
            axisLine={false} 
            tickLine={false} 
            tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}}
            dy={10}
            tickFormatter={(str: string) =\u003e {
              try {
                return new Date(str).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              } catch (e) {
                return '';
              }
            }}
          /\u003e
          \u003cYAxis domain={['auto', 'auto']} hide /\u003e
          \u003cTooltip 
            contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
            itemStyle={{fontWeight: '900', textTransform: 'uppercase', fontSize: '10px'}}
            labelStyle={{fontWeight: '900', marginBottom: '8px', color: '#64748b'}}
            labelFormatter={(label: any) =\u003e {
              try {
                return label ? new Date(label).toLocaleString() : '';
              } catch (e) {
                return String(label);
              }
            }}
            formatter={(value: any) =\u003e [
              formatNumber(value),
              \"VALOR\"
            ] as [string, string]}
          /\u003e
          {!singleLine && \u003cLegend iconType=\"circle\" wrapperStyle={{paddingTop: '20px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase'}} /\u003e}
          
          {singleLine ? (
            \u003cArea 
              name=\"Valor\"
              type=\"monotone\" 
              dataKey={dataKey || 'value'} 
              stroke={color.hex} 
              strokeWidth={4}
              fillOpacity={1} 
              fill={`url(#color-${dataKey || 'value'})`}
              animationDuration={1500}
            /\u003e
          ) : (
            \u003c\u003e
              \u003cArea 
                type=\"monotone\" 
                dataKey=\"usd_blue\" 
                stroke=\"#3b82f6\" 
                strokeWidth={4}
                fillOpacity={1} 
                fill=\"url(#colorUsd)\" 
                name=\"Dólar Blue\"
                animationDuration={1500}
              /\u003e
              \u003cArea 
                type=\"monotone\" 
                dataKey=\"usd_oficial\" 
                stroke=\"#64748b\" 
                strokeWidth={2}
                strokeDasharray=\"5 5\"
                fillOpacity={0}
                name=\"Dólar Oficial\"
                animationDuration={1500}
              /\u003e
            \u003c/\u003e
          )}
        \u003c/AreaChart\u003e
      \u003c/ResponsiveContainer\u003e
    \u003c/div\u003e
    \u003cdiv className=\"mt-6 pt-4 border-t border-slate-50 dark:border-slate-700/50 text-[9px] text-slate-300 dark:text-slate-500 font-black uppercase tracking-widest text-center\"\u003e
      {singleLine ? 'Evolución del valor de mercado' : 'Evolución tasas de compra y venta'}
    \u003c/div\u003e
  \u003c/div\u003e
);

const ToastNotification = ({ note, onDismiss }: { note: AppNotification, onDismiss: (id: number, key: string) =\u003e void }) =\u003e {
  const [isClosing, setIsClosing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleClose = useCallback(() =\u003e {
    setIsClosing(true);
    setTimeout(() =\u003e {
      onDismiss(note.id, note.key);
    }, 400); // Allow time for exit animation
  }, [note.id, note.key, onDismiss]);

  useEffect(() =\u003e {
    if (isHovered) return;
    
    // Automatically dismiss after 8 seconds of no hovering
    const timer = setTimeout(() =\u003e {
      handleClose();
    }, 8000);

    return () =\u003e clearTimeout(timer);
  }, [isHovered, handleClose]);

  return (
    \u003cdiv 
      onMouseEnter={() =\u003e setIsHovered(true)} 
      onMouseLeave={() =\u003e setIsHovered(false)}
      className={`pointer-events-auto flex items-center gap-3 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 max-w-sm group transition-all duration-500 transform
        ${isClosing ? 'opacity-0 translate-x-12 scale-95 duration-300' : 'opacity-100 translate-x-0 scale-100 animate-in slide-in-from-right-8 fade-in'}`}
    \u003e
      \u003cdiv className={`p-2 rounded-full flex-shrink-0 ${note.type === 'up' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400'}`}\u003e
        {note.type === 'up' ? \u003cTrendingUp className=\"w-5 h-5\" /\u003e : \u003cTrendingDown className=\"w-5 h-5\" /\u003e}
      \u003c/div\u003e
      \u003cdiv className=\"flex-1 min-w-0 pr-2\"\u003e
        \u003cp className=\"text-xs font-black text-slate-800 dark:text-white uppercase tracking-tighter truncate\"\u003e{note.message}\u003c/p\u003e
        \u003cp className=\"text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5\"\u003eHace un momento\u003c/p\u003e
      \u003c/div\u003e
      \u003cbutton 
        onClick={handleClose}
        className=\"p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors\"
        aria-label=\"Cerrar notificación\"
      \u003e
        \u003cX className=\"w-3.5 h-3.5\" /\u003e
      \u003c/button\u003e
    \u003c/div\u003e
  );
};

function App() {
  const [data, setData] = useState\u003cMarketData | null\u003e(null);
  const [history, setHistory] = useState\u003cHistoryItem[]\u003e([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState\u003cstring | null\u003e(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [targetTime, setTargetTime] = useState(() =\u003e Date.now() + 300000);
  const [theme, setTheme] = useState\u003c'light' | 'dark' | 'system'\u003e(
    () =\u003e (localStorage.getItem('theme') as 'light' | 'dark' | 'system') || 'system'
  );
  const [activeTab, setActiveTab] = useState\u003c'Argentina' | 'Venezuela' | 'Conversor' | 'Latam'\u003e('Argentina');
  const [notifications, setNotifications] = useState\u003cAppNotification[]\u003e([]);
  const [changedKeys, setChangedKeys] = useState\u003cRecord\u003cstring, 'up' | 'down'\u003e\u003e({});

  const dismissNotification = (id: number, key: string) =\u003e {
    setNotifications(prev =\u003e prev.filter(n =\u003e n.id !== id));
    setChangedKeys(prev =\u003e {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const fetchData = async () =\u003e {
    setIsRefreshing(true);
    try {
      let baseURL = (window as any)._env_?.VITE_API_URL || import.meta.env.VITE_API_URL || '';
      
      // Sanitización: si la variable no se expandió correctamente o es el placeholder
      if (baseURL.includes('${VITE_API_URL}')) {
        baseURL = '';
      }
      
      // Limpiar slash final si existe
      if (baseURL.endsWith('/')) {
        baseURL = baseURL.slice(0, -1);
      }

      const [ratesRes, historyRes] = await Promise.all([
        axios.get(`${baseURL}/api/rates`),
        axios.get(`${baseURL}/api/history`)
      ]);
      const ratesData = ratesRes.data;
      const historyData = historyRes.data;

      // Append current data to history for the charts
      const currentAsHistory: HistoryItem = {
        timestamp: ratesData.timestamp,
        usd_blue: ratesData.usd_blue,
        usd_oficial: ratesData.usd_oficial,
        usd_mep: ratesData.usd_mep,
        usd_ccl: ratesData.usd_ccl,
        usd_cripto: ratesData.usd_cripto,
        usd_tarjeta: ratesData.usd_tarjeta,
        ves_oficial: ratesData.ves_oficial,
        ves_paralelo: ratesData.ves_paralelo,
        uyu_venta: ratesData.uyu_venta,
        clp_venta: ratesData.clp_venta,
        brl_venta: ratesData.brl_venta,
        eur_venta: ratesData.eur_venta,
        btc_usd: ratesData.btc_usd
      };

      setData(prevData =\u003e {
        if (prevData) {
          const newNotifications: AppNotification[] = [];
          const newChangedKeys: Record\u003cstring, 'up' | 'down'\u003e = {};

          const checkChange = (key: keyof MarketData, label: string, isVes = false) =\u003e {
            const oldVal = prevData[key] as number;
            const newVal = ratesData[key] as number;
            if (oldVal \u0026\u0026 newVal \u0026\u0026 oldVal !== newVal) {
              const type = newVal \u003e oldVal ? 'up' : 'down';
              newChangedKeys[key as string] = type;
              const prefix = isVes ? 'Bs. ' : '$';
              newNotifications.push({
                id: Date.now() + Math.random(),
                message: `${label} ${type === 'up' ? 'subió a' : 'bajó a'} ${prefix}${formatNumber(newVal)}`,
                type,
                key: key as string,
              });
            }
          };

          checkChange('usd_oficial', 'Dólar Oficial');
          checkChange('usd_blue', 'Dólar Blue');
          checkChange('usd_cripto', 'Dólar Cripto');
          checkChange('ves_paralelo', 'Bolívar Paralelo', true);
          checkChange('ves_oficial', 'Bolívar Oficial', true);

          if (newNotifications.length \u003e 0) {
            setNotifications(prev =\u003e [...prev, ...newNotifications]);
            setChangedKeys(prev =\u003e ({ ...prev, ...newChangedKeys }));
          }
        }
        return ratesData;
      });
      
      setHistory([...historyData, currentAsHistory]);
      setError(null);
    } catch (err) {
      setError('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
      setTargetTime(Date.now() + 300000);
      setTimeLeft(300);
      setProgress(0);
    }
  };

  useEffect(() =\u003e {
    fetchData();
  }, []);

  useEffect(() =\u003e {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const applyTheme = () =\u003e {
      root.classList.remove('light', 'dark');
      
      let activeTheme = theme;
      if (theme === 'system') {
        activeTheme = mediaQuery.matches ? 'dark' : 'light';
      }
      
      root.classList.add(activeTheme);
      localStorage.setItem('theme', theme);

      // Update theme-color meta tag for iOS Safari
      let metaThemeColor = document.querySelector('meta[name=\"theme-color\"]');
      if (!metaThemeColor) {
        metaThemeColor = document.createElement('meta');
        metaThemeColor.setAttribute('name', 'theme-color');
        document.head.appendChild(metaThemeColor);
      }
      metaThemeColor.setAttribute('content', activeTheme === 'dark' ? '#0f172a' : '#f8fafc');
    };

    applyTheme();

    // Listen for changes when in system mode
    const handleSystemChange = () =\u003e {
      if (theme === 'system') applyTheme();
    };

    const handleVisibilityChange = () =\u003e {
      if (document.visibilityState === 'visible' \u0026\u0026 theme === 'system') {
        applyTheme();
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () =\u003e {
      mediaQuery.removeEventListener('change', handleSystemChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [theme]);

  // Timer effect
  useEffect(() =\u003e {
    if (loading) return;

    const tick = () =\u003e {
      const remainingSeconds = Math.max(0, Math.floor((targetTime - Date.now()) / 1000));
      if (remainingSeconds \u003c= 0) {
        // Solo actualizamos de fondo si la pestaña está activa, 
        // de otra forma los toast y animaciones suceden sin que el usuario los vea
        if (document.visibilityState === 'visible') {
          fetchData();
        } else {
          setTimeLeft(0); // Dejamos listo para que cargue en el momento que vuelvan
        }
      } else {
        setTimeLeft(remainingSeconds);
      }
    };

    const timer = setInterval(tick, 1000);

    const handleVisibilityChange = () =\u003e {
      if (document.visibilityState === 'visible') {
        tick();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () =\u003e {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loading, targetTime]);

  // Update progress bar
  useEffect(() =\u003e {
    setProgress(((300 - timeLeft) / 300) * 100);
  }, [timeLeft]);

  if (loading) return (
    \u003cdiv className=\"min-h-screen flex items-center justify-center bg-slate-50\"\u003e
      \u003cdiv className=\"flex flex-col items-center gap-4\"\u003e
        \u003cRefreshCw className=\"w-10 h-10 text-blue-600 animate-spin\" /\u003e
        \u003cp className=\"text-slate-500 font-black tracking-widest uppercase text-xs\"\u003eSincronizando Mercados...\u003c/p\u003e
      \u003c/div\u003e
    \u003c/div\u003e
  );

  const formatTimeLeft = () =\u003e {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    \u003cdiv className=\"min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 py-10 px-4 sm:px-6 lg:px-8 font-sans text-slate-900 pb-10 lg:pb-48 overflow-x-hidden w-full\"\u003e
      \u003cdiv className=\"max-w-7xl mx-auto\"\u003e
        {/* Header */}
        \u003cheader className=\"flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6\"\u003e
          \u003cdiv\u003e
            \u003cdiv className=\"flex items-center gap-3\"\u003e
              \u003cdiv className=\"bg-slate-900 dark:bg-white p-2.5 rounded-2xl shadow-xl rotate-3\"\u003e
                \u003cTrendingUp className=\"w-7 h-7 text-blue-400 dark:text-blue-600\" /\u003e
              \u003c/div\u003e
              \u003ch1 className=\"text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase\"\u003e
                Market\u003cspan className=\"text-blue-600 dark:text-blue-400\"\u003eDash\u003c/span\u003e
              \u003c/h1\u003e
            \u003c/div\u003e
            \u003cp className=\"mt-2 text-slate-400 dark:text-slate-500 font-bold uppercase text-[10px] tracking-widest\"\u003eDólar al día: De Buenos Aires a Caracas\u003c/p\u003e
            
            {/* Modern Status Badge */}
            {(() =\u003e {
              const open = isMarketOpen();
              return (
                \u003cdiv className={`mt-4 flex items-center gap-2 ${open ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-100 dark:border-emerald-800/50' : 'bg-amber-50 dark:bg-amber-900/30 border-amber-100 dark:border-amber-800/50'} border px-3 py-1.5 rounded-full w-fit`}\u003e
                  \u003cdiv className={`w-2 h-2 rounded-full ${open ? 'bg-emerald-500' : 'bg-amber-500'} animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite] ${open ? 'shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'shadow-[0_0_8px_rgba(245,158,11,0.5)]'}`}\u003e\u003c/div\u003e
                  \u003cspan className={`text-[10px] uppercase font-black ${open ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'} tracking-widest flex items-center gap-1`}\u003e
                    {open ? \u003cCheckCircle2 className=\"w-3 h-3\" /\u003e : \u003cAlertTriangle className=\"w-3 h-3\" /\u003e}
                    {open ? 'Mercados Operando OK' : 'Mercados Cerrados'}
                  \u003c/span\u003e
                \u003c/div\u003e
              );
            })()}
          \u003c/div\u003e
          
          \u003cdiv className=\"flex items-center gap-4\"\u003e
            {/* Theme Toggle */}
            \u003cdiv className=\"flex bg-white dark:bg-slate-800 rounded-full shadow-sm border border-slate-100 dark:border-slate-700 p-1\"\u003e
              \u003cbutton 
                onClick={() =\u003e setTheme('light')}
                className={`p-2 rounded-full transition-all ${theme === 'light' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                title=\"Claro\"
              \u003e
                \u003cSun className=\"w-4 h-4\" /\u003e
              \u003c/button\u003e
              \u003cbutton 
                onClick={() =\u003e setTheme('system')}
                className={`p-2 rounded-full transition-all ${theme === 'system' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                title=\"Sistema\"
              \u003e
                \u003cMonitor className=\"w-4 h-4\" /\u003e
              \u003c/button\u003e
              \u003cbutton 
                onClick={() =\u003e setTheme('dark')}
                className={`p-2 rounded-full transition-all ${theme === 'dark' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                title=\"Oscuro\"
              \u003e
                \u003cMoon className=\"w-4 h-4\" /\u003e
              \u003c/button\u003e
            \u003c/div\u003e

            \u003cdiv className=\"flex flex-col gap-2\"\u003e
              \u003cdiv className=\"flex items-center gap-4 px-6 py-3 bg-white dark:bg-slate-800 rounded-full shadow-sm border border-slate-100 dark:border-slate-700\"\u003e
                \u003cdiv className=\"flex flex-col items-end\"\u003e
                  \u003cspan className=\"text-[9px] uppercase font-black text-slate-300 dark:text-slate-500 leading-none mb-1 tracking-tighter\"\u003e
                    {data ? 'Última Sincronización' : isRefreshing ? 'Sincronizando...' : 'Desconectado'}
                  \u003c/span\u003e
                  \u003cspan className=\"text-sm font-black text-slate-600 dark:text-white\"\u003e
                    {data ? new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                  \u003c/span\u003e
                \u003c/div\u003e
                \u003cbutton 
                  onClick={fetchData}
                  disabled={isRefreshing}
                  className={`p-2 rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 transition-all ${isRefreshing ? 'animate-spin' : 'hover:rotate-180'}`}
                \u003e
                  \u003cRefreshCw className={`w-5 h-5 ${isRefreshing ? 'text-blue-400' : 'text-blue-500'}`} /\u003e
                \u003c/button\u003e
              \u003c/div\u003e
              
              \u003cdiv className=\"px-2\"\u003e
                \u003cdiv className=\"flex justify-between items-center mb-1\"\u003e
                  \u003cspan className=\"text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest\"\u003ePróxima Sincronización\u003c/span\u003e
                  \u003cspan className=\"text-[10px] font-black text-blue-600 dark:text-blue-400\"\u003e{formatTimeLeft()}\u003c/span\u003e
                \u003c/div\u003e
                \u003cdiv className=\"h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden\"\u003e
                  \u003cdiv 
                    className=\"h-full bg-blue-500 transition-all duration-1000 ease-linear rounded-full\"
                    style={{ width: `${progress}%` }}
                  /\u003e
                \u003c/div\u003e
              \u003c/div\u003e
            \u003c/div\u003e
          \u003c/div\u003e
        \u003c/header\u003e

        {error \u0026\u0026 (
          \u003cdiv className=\"mb-8 p-5 bg-red-50 dark:bg-red-900/30 border-2 border-red-100 dark:border-red-800/50 rounded-3xl flex items-center gap-3 text-red-700 dark:text-red-400 animate-pulse max-w-7xl mx-auto\"\u003e
            \u003cTrendingDown className=\"w-6 h-6\" /\u003e
            \u003cspan className=\"font-black uppercase text-xs tracking-widest\"\u003e{error}\u003c/span\u003e
          \u003c/div\u003e
        )}

        {/* Tab Navigation (Pill Selector) */}
        \u003cdiv className=\"max-w-md mx-auto flex bg-slate-200/50 dark:bg-slate-800/50 p-1.5 rounded-full border border-slate-100 dark:border-slate-800 mb-12 transition-all duration-300 shadow-sm\"\u003e
          \u003cbutton 
            onClick={() =\u003e setActiveTab('Argentina')}
            data-umami-event=\"Tab - Argentina\"
            className={`flex-1 px-2 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 ${
              activeTab === 'Argentina' 
                ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          \u003e
            Argentina
          \u003c/button\u003e
          \u003cbutton 
            onClick={() =\u003e setActiveTab('Venezuela')}
            data-umami-event=\"Tab - Venezuela\"
            className={`flex-1 px-2 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 ${
              activeTab === 'Venezuela' 
                ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          \u003e
            Venezuela
          \u003c/button\u003e
          \u003cbutton 
            onClick={() =\u003e setActiveTab('Latam')}
            data-umami-event=\"Tab - Latam\"
            className={`flex-1 px-2 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 ${
              activeTab === 'Latam' 
                ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          \u003e
            LATAM
          \u003c/button\u003e
          \u003cbutton 
            onClick={() =\u003e setActiveTab('Conversor')}
            data-umami-event=\"Tab - Calculadora\"
            className={`flex-1 px-2 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 ${
              activeTab === 'Conversor' 
                ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          \u003e
            Calculadora
          \u003c/button\u003e
        \u003c/div\u003e


        {/* Main Content Sections */}
        \u003cdiv className=\"mb-24 pb-24\"\u003e
          
          {/* Argentina Section */}
          {activeTab === 'Argentina' \u0026\u0026 (
            \u003cdiv className=\"space-y-8 animate-in fade-in duration-700 slide-in-from-bottom-4\"\u003e
              \u003cdiv className=\"flex items-center gap-3 px-1\"\u003e
                \u003cdiv className=\"w-1.5 h-6 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.3)]\" /\u003e
                \u003ch2 className=\"text-xl font-black text-slate-800 dark:text-white uppercase tracking-[0.2em]\"\u003eMercado Argentina\u003c/h2\u003e
              \u003c/div\u003e

              \u003cdiv className=\"grid grid-cols-1 lg:grid-cols-2 gap-16\"\u003e
                \u003cdiv className=\"grid grid-cols-1 md:grid-cols-2 gap-8 lg:col-span-1\"\u003e
                  {/* Oficial Group */}
                  \u003cdiv className=\"space-y-8\"\u003e
                    \u003cStatCard 
                      title=\"Dólar Oficial\" 
                      value={`$${formatNumber(data?.usd_oficial)}`} 
                      icon={ShieldCheck} 
                      color=\"bg-slate-600\"
                      buy={formatNumber(data?.usd_oficial ? data.usd_oficial - 20 : 0)}
                      sell={formatNumber(data?.usd_oficial)}
                      change={data?.changes?.usd_oficial_percent}
                      pulseType={changedKeys['usd_oficial']}
                    /\u003e
                    \u003cdiv className=\"h-[440px]\"\u003e
                      \u003cRegionChart 
                        title=\"Tendencia AR (Oficial)\" 
                        data={history} 
                        dataKey=\"usd_oficial\" 
                        color={{hex: '#64748b', text: 'text-slate-600'}}
                        icon={TrendingUp}
                        singleLine={true}
                      /\u003e
                    \u003c/div\u003e
                  \u003c/div\u003e

                  {/* Cripto Group */}
                  \u003cdiv className=\"space-y-8\"\u003e
                    \u003cStatCard 
                      title=\"Dólar Cripto\" 
                      value={`$${formatNumber(data?.usd_cripto)}`} 
                      icon={Bitcoin} 
                      color=\"bg-purple-600\"
                      buy={formatNumber(data?.usd_cripto ? data.usd_cripto - 10 : 0)}
                      sell={formatNumber(data?.usd_cripto)}
                      change={data?.changes?.bitcoin_percent}
                      badge=\"24/7\"
                      pulseType={changedKeys['usd_cripto']}
                    /\u003e
                    \u003cdiv className=\"h-[440px]\"\u003e
                      \u003cRegionChart 
                        title=\"Tendencia AR (Cripto)\" 
                        data={history} 
                        dataKey=\"usd_cripto\" 
                        color={{hex: '#9333ea', text: 'text-purple-600'}}
                        icon={Bitcoin}
                        singleLine={true}
                      /\u003e
                    \u003c/div\u003e
                  \u003c/div\u003e
                \u003c/div\u003e

                \u003cdiv className=\"space-y-8 flex flex-col h-full\"\u003e
                  {/* Otros Dólares Card */}
                  \u003cdiv className=\"flex-1 bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col\"\u003e
                    \u003ch3 className=\"text-[10px] font-black text-slate-300 dark:text-slate-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-2\"\u003e
                      \u003cInfo className=\"w-4 h-4 text-slate-300 dark:text-slate-500\" /\u003e Otros Dólares AR
                    \u003c/h3\u003e
                    \u003cdiv className=\"grid grid-cols-1 gap-4\"\u003e
                      \u003cdiv className={`flex justify-between items-center p-5 rounded-2xl transition-all duration-500 group ${
                        changedKeys['usd_blue'] === 'up' ? 'bg-emerald-50 dark:bg-emerald-900/40 ring-2 ring-emerald-500 dark:ring-emerald-400' :
                        changedKeys['usd_blue'] === 'down' ? 'bg-red-50 dark:bg-red-900/40 ring-2 ring-red-500 dark:ring-red-400' :
                        'bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-transparent dark:border-slate-700/50'
                      }`}\u003e
                        \u003cspan className=\"font-black text-slate-500 uppercase text-xs tracking-tight\"\u003eDólar Blue\u003c/span\u003e
                        \u003cdiv className=\"flex flex-col items-end\"\u003e
                          \u003cspan className=\"font-black text-blue-700 dark:text-blue-400 text-lg group-hover:scale-110 transition-transform\"\u003e$ {formatNumber(data?.usd_blue)}\u003c/span\u003e
                          \u003cspan className={`text-[10px] font-bold ${(data?.changes?.usd_blue_percent ?? 0) \u003e= 0 ? 'text-emerald-500' : 'text-red-500'}`}\u003e
                            {(data?.changes?.usd_blue_percent ?? 0) \u003e= 0 ? '+' : ''}{(data?.changes?.usd_blue_percent ?? 0).toFixed(2)}%
                          \u003c/span\u003e
                        \u003c/div\u003e
                      \u003c/div\u003e
                      \u003cdiv className=\"flex justify-between items-center p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-transparent dark:border-slate-700/50 transition-all group\"\u003e
                        \u003cspan className=\"font-black text-slate-500 uppercase text-xs tracking-tight\"\u003eDólar Tarjeta\u003c/span\u003e
                        \u003cdiv className=\"flex flex-col items-end\"\u003e
                          \u003cspan className=\"font-black text-blue-700 dark:text-blue-400 text-lg group-hover:scale-110 transition-transform\"\u003e$ {formatNumber(data?.usd_tarjeta)}\u003c/span\u003e
                          \u003cspan className={`text-[10px] font-bold ${(data?.changes?.otros_dolares_percents?.tarjeta ?? 0) \u003e= 0 ? 'text-emerald-500' : 'text-red-500'}`}\u003e
                            {(data?.changes?.otros_dolares_percents?.tarjeta ?? 0) \u003e= 0 ? '+' : ''}{(data?.changes?.otros_dolares_percents?.tarjeta ?? 0).toFixed(2)}%
                          \u003c/span\u003e
                        \u003c/div\u003e
                      \u003c/div\u003e
                      \u003cdiv className=\"flex justify-between items-center p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-transparent dark:border-slate-700/50 transition-all group\"\u003e
                        \u003cspan className=\"font-black text-slate-500 uppercase text-xs tracking-tight\"\u003eDólar MEP (Bolsa)\u003c/span\u003e
                        \u003cdiv className=\"flex flex-col items-end\"\u003e
                          \u003cspan className=\"font-black text-blue-700 dark:text-blue-400 text-lg group-hover:scale-110 transition-transform\"\u003e$ {formatNumber(data?.usd_mep)}\u003c/span\u003e
                          \u003cspan className={`text-[10px] font-bold ${(data?.changes?.otros_dolares_percents?.mep ?? 0) \u003e= 0 ? 'text-emerald-500' : 'text-red-500'}`}\u003e
                            {(data?.changes?.otros_dolares_percents?.mep ?? 0) \u003e= 0 ? '+' : ''}{(data?.changes?.otros_dolares_percents?.mep ?? 0).toFixed(2)}%
                          \u003c/span\u003e
                        \u003c/div\u003e
                      \u003c/div\u003e
                      \u003cdiv className=\"flex justify-between items-center p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-transparent dark:border-slate-700/50 transition-all group\"\u003e
                        \u003cspan className=\"font-black text-slate-500 uppercase text-xs tracking-tight\"\u003eCCL\u003c/span\u003e
                        \u003cdiv className=\"flex flex-col items-end\"\u003e
                          \u003cspan className=\"font-black text-blue-700 dark:text-blue-400 text-lg group-hover:scale-110 transition-transform\"\u003e$ {formatNumber(data?.usd_ccl)}\u003c/span\u003e
                          \u003cspan className={`text-[10px] font-bold ${(data?.changes?.otros_dolares_percents?.ccl ?? 0) \u003e= 0 ? 'text-emerald-500' : 'text-red-500'}`}\u003e
                            {(data?.changes?.otros_dolares_percents?.ccl ?? 0) \u003e= 0 ? '+' : ''}{(data?.changes?.otros_dolares_percents?.ccl ?? 0).toFixed(2)}%
                          \u003c/span\u003e
                        \u003c/div\u003e
                      \u003c/div\u003e
                    \u003c/div\u003e
                  \u003c/div\u003e

                  {/* Otras Monedas Card */}
                  \u003cdiv className=\"flex-1 bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col\"\u003e
                    \u003ch3 className=\"text-[10px] font-black text-slate-300 dark:text-slate-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-2\"\u003e
                      \u003cGlobe className=\"w-4 h-4 text-slate-300 dark:text-slate-500\" /\u003e Otras Monedas
                    \u003c/h3\u003e
                    \u003cdiv className=\"grid grid-cols-1 gap-4\"\u003e
                      \u003cdiv className=\"flex justify-between items-center p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-transparent dark:border-slate-700/50 transition-all group\"\u003e
                        \u003cspan className=\"font-black text-slate-500 uppercase text-xs tracking-tight\"\u003eEuro Oficial\u003c/span\u003e
                        \u003cdiv className=\"flex flex-col items-end\"\u003e
                          \u003cspan className=\"font-black text-indigo-700 dark:text-indigo-400 text-lg group-hover:scale-110 transition-transform\"\u003e$ {formatNumber(data?.eur_venta)}\u003c/span\u003e
                          \u003cspan className={`text-[10px] font-bold ${(data?.changes?.eur_percent ?? 0) \u003e= 0 ? 'text-emerald-500' : 'text-red-500'}`}\u003e
                            {(data?.changes?.eur_percent ?? 0) \u003e= 0 ? '+' : ''}{(data?.changes?.eur_percent ?? 0).toFixed(2)}%
                          \u003c/span\u003e
                        \u003c/div\u003e
                      \u003c/div\u003e
                      \u003cdiv className=\"flex justify-between items-center p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-transparent dark:border-slate-700/50 transition-all group\"\u003e
                        \u003cspan className=\"font-black text-slate-500 uppercase text-xs tracking-tight\"\u003eReal Brasileño\u003c/span\u003e
                        \u003cdiv className=\"flex flex-col items-end\"\u003e
                          \u003cspan className=\"font-black text-emerald-700 dark:text-emerald-400 text-lg group-hover:scale-110 transition-transform\"\u003e$ {formatNumber(data?.brl_ar)}\u003c/span\u003e
                          \u003cspan className={`text-[10px] font-bold ${(data?.changes?.brl_ar_percent ?? 0) \u003e= 0 ? 'text-emerald-500' : 'text-red-500'}`}\u003e
                            {(data?.changes?.brl_ar_percent ?? 0) \u003e= 0 ? '+' : ''}{(data?.changes?.brl_ar_percent ?? 0).toFixed(2)}%
                          \u003c/span\u003e
                        \u003c/div\u003e
                      \u003c/div\u003e
                      \u003cdiv className=\"flex justify-between items-center p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-transparent dark:border-slate-700/50 transition-all group\"\u003e
                        \u003cspan className=\"font-black text-slate-500 uppercase text-xs tracking-tight\"\u003ePeso Chileno\u003c/span\u003e
                        \u003cdiv className=\"flex flex-col items-end\"\u003e
                          \u003cspan className=\"font-black text-red-700 dark:text-red-400 text-lg group-hover:scale-110 transition-transform\"\u003e$ {formatNumber(data?.clp_ar)}\u003c/span\u003e
                          \u003cspan className={`text-[10px] font-bold ${(data?.changes?.clp_ar_percent ?? 0) \u003e= 0 ? 'text-emerald-500' : 'text-red-500'}`}\u003e
                            {(data?.changes?.clp_ar_percent ?? 0) \u003e= 0 ? '+' : ''}{(data?.changes?.clp_ar_percent ?? 0).toFixed(2)}%
                          \u003c/span\u003e
                        \u003c/div\u003e
                      \u003c/div\u003e
                      \u003cdiv className=\"flex justify-between items-center p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-transparent dark:border-slate-700/50 transition-all group\"\u003e
                        \u003cspan className=\"font-black text-slate-500 uppercase text-xs tracking-tight\"\u003ePeso Uruguayo\u003c/span\u003e
                        \u003cdiv className=\"flex flex-col items-end\"\u003e
                          \u003cspan className=\"font-black text-sky-700 dark:text-sky-400 text-lg group-hover:scale-110 transition-transform\"\u003e$ {formatNumber(data?.uyu_ar)}\u003c/span\u003e
                          \u003cspan className={`text-[10px] font-bold ${(data?.changes?.uyu_ar_percent ?? 0) \u003e= 0 ? 'text-emerald-500' : 'text-red-500'}`}\u003e
                            {(data?.changes?.uyu_ar_percent ?? 0) \u003e= 0 ? '+' : ''}{(data?.changes?.uyu_ar_percent ?? 0).toFixed(2)}%
                          \u003c/span\u003e
                        \u003c/div\u003e
                      \u003c/div\u003e
                    \u003c/div\u003e
                  \u003c/div\u003e
                \u003c/div\u003e
              \u003c/div\u003e
            \u003c/div\u003e
          )}

          {/* Venezuela Section */}
          {activeTab === 'Venezuela' \u0026\u0026 (
            \u003cdiv className=\"space-y-8 animate-in fade-in duration-700\"\u003e
              \u003cdiv className=\"flex items-center gap-3 px-1\"\u003e
                \u003cdiv className=\"w-1.5 h-6 bg-yellow-400 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.3)]\" /\u003e
                \u003ch2 className=\"text-xl font-black text-slate-800 dark:text-white uppercase tracking-[0.2em]\"\u003eMercado Venezuela\u003c/h2\u003e
              \u003c/div\u003e

              \u003cdiv className=\"grid grid-cols-1 lg:grid-cols-2 gap-16\"\u003e
                \u003cdiv className=\"grid grid-cols-1 md:grid-cols-2 gap-8 lg:col-span-1\"\u003e
                  {/* Oficial Column */}
                  \u003cdiv className=\"space-y-8\"\u003e
                    \u003cStatCard 
                      title=\"Dólar Oficial\" 
                      value={`${formatNumber(data?.ves_oficial)} VES`} 
                      icon={ShieldCheck} 
                      color=\"bg-blue-500\"
                      subtitle=\"Tasa Oficial BCV\"
                      change={data?.changes?.ves_oficial_percent}
                      pulseType={changedKeys['ves_oficial']}
                    /\u003e
                    \u003cdiv className=\"h-[440px]\"\u003e
                      \u003cRegionChart 
                        title=\"Tendencia VE (Oficial)\" 
                        data={history} 
                        dataKey=\"ves_oficial\" 
                        color={{hex: '#3b82f6', text: 'text-blue-500'}}
                        icon={ShieldCheck}
                        singleLine={true}
                      /\u003e
                    \u003c/div\u003e
                  \u003c/div\u003e

                  {/* Paralelo Column */}
                  \u003cdiv className=\"space-y-8\"\u003e
                    \u003cStatCard 
                      title=\"Dólar Paralelo\" 
                      value={`${formatNumber(data?.ves_paralelo)} VES`} 
                      icon={DollarSign} 
                      color=\"bg-yellow-500\"
                      subtitle=\"Promedio Dólar Paralelo\"
                      change={data?.changes?.ves_paralelo_percent}
                      pulseType={changedKeys['ves_paralelo']}
                    /\u003e
                    \u003cdiv className=\"h-[440px]\"\u003e
                      \u003cRegionChart 
                        title=\"Tendencia VE (Paralelo)\" 
                        data={history} 
                        dataKey=\"ves_paralelo\" 
                        color={{hex: '#eab308', text: 'text-yellow-500'}}
                        icon={TrendingUp}
                        singleLine={true}
                      /\u003e
                    \u003c/div\u003e
                  \u003c/div\u003e
                \u003c/div\u003e

                \u003cdiv className=\"space-y-8 flex flex-col h-full\"\u003e
                  {/* Mercado Euro Card */}
                  \u003cdiv className=\"flex-1 bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col h-full\"\u003e
                    \u003ch3 className=\"text-[10px] font-black text-slate-300 dark:text-slate-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-2\"\u003e
                      \u003cEuro className=\"w-4 h-4 text-slate-300 dark:text-slate-500\" /\u003e Mercado Euro VE
                    \u003c/h3\u003e
                    \u003cdiv className=\"grid grid-cols-1 gap-4\"\u003e
                      \u003cdiv className=\"flex justify-between items-center p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-transparent dark:border-slate-700/50 transition-all group\"\u003e
                        \u003cspan className=\"font-black text-slate-500 uppercase text-xs tracking-tight\"\u003eEuro Oficial\u003c/span\u003e
                        \u003cdiv className=\"flex flex-col items-end\"\u003e
                          \u003cspan className=\"font-black text-blue-700 dark:text-blue-400 text-lg group-hover:scale-110 transition-transform\"\u003e{formatNumber(data?.ves_eur_oficial)} VES\u003c/span\u003e
                          \u003cspan className={`text-[10px] font-bold ${(data?.changes?.ves_eur_oficial_percent ?? 0) \u003e= 0 ? 'text-emerald-500' : 'text-red-500'}`}\u003e
                            {(data?.changes?.ves_eur_oficial_percent ?? 0) \u003e= 0 ? '+' : ''}{(data?.changes?.ves_eur_oficial_percent ?? 0).toFixed(2)}%
                          \u003c/span\u003e
                        \u003c/div\u003e
                      \u003c/div\u003e
                      \u003cdiv className=\"flex justify-between items-center p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-transparent dark:border-slate-700/50 transition-all group\"\u003e
                        \u003cspan className=\"font-black text-slate-500 uppercase text-xs tracking-tight\"\u003eEuro Paralelo\u003c/span\u003e
                        \u003cdiv className=\"flex flex-col items-end\"\u003e
                          \u003cspan className=\"font-black text-yellow-700 dark:text-yellow-400 text-lg group-hover:scale-110 transition-transform\"\u003e{formatNumber(data?.ves_eur_paralelo)} VES\u003c/span\u003e
                          \u003cspan className={`text-[10px] font-bold ${(data?.changes?.ves_eur_paralelo_percent ?? 0) \u003e= 0 ? 'text-emerald-500' : 'text-red-500'}`}\u003e
                            {(data?.changes?.ves_eur_paralelo_percent ?? 0) \u003e= 0 ? '+' : ''}{(data?.changes?.ves_eur_paralelo_percent ?? 0).toFixed(2)}%
                          \u003c/span\u003e
                        \u003c/div\u003e
                      \u003c/div\u003e
                    \u003c/div\u003e
                  \u003c/div\u003e
                \u003c/div\u003e
              \u003c/div\u003e
            \u003c/div\u003e
          )}

          {/* Latam Section */}
          {activeTab === 'Latam' \u0026\u0026 (
            \u003cdiv className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-700 slide-in-from-bottom-4\"\u003e
              {/* Uruguay Section */}
              \u003cdiv className=\"space-y-8\"\u003e
                \u003cdiv className=\"flex items-center gap-3 px-1\"\u003e
                  \u003cdiv className=\"w-1.5 h-6 bg-sky-500 rounded-full shadow-[0_0_10px_rgba(14,165,233,0.3)]\" /\u003e
                  \u003ch2 className=\"text-lg font-black text-slate-800 dark:text-white uppercase tracking-[0.2em]\"\u003eUruguay\u003c/h2\u003e
                \u003c/div\u003e
                \u003cStatCard 
                  title=\"Peso Uruguayo\" 
                  value={`${formatNumber(data?.uyu_venta)}`} 
                  subtitle=\"Valor del Dólar Oficial\"
                  icon={Globe} 
                  color=\"bg-sky-600\"
                  buy={formatNumber(data?.uyu_compra)}
                  sell={formatNumber(data?.uyu_venta)}
                  change={data?.changes?.uyu_percent}
                /\u003e
                \u003cdiv className=\"h-[440px]\"\u003e
                  \u003cRegionChart 
                    title=\"Tendencia UYU\" 
                    data={history} 
                    dataKey=\"uyu_venta\" 
                    color={{hex: '#0284c7', text: 'text-sky-600'}}
                    icon={TrendingUp}
                    singleLine={true}
                  /\u003e
                \u003c/div\u003e
              \u003c/div\u003e

              {/* Chile Section */}
              \u003cdiv className=\"space-y-8\"\u003e
                \u003cdiv className=\"flex items-center gap-3 px-1\"\u003e
                  \u003cdiv className=\"w-1.5 h-6 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.3)]\" /\u003e
                  \u003ch2 className=\"text-lg font-black text-slate-800 dark:text-white uppercase tracking-[0.2em]\"\u003eChile\u003c/h2\u003e
                \u003c/div\u003e
                \u003cStatCard 
                  title=\"Peso Chileno\" 
                  value={`${formatNumber(data?.clp_venta)}`} 
                  subtitle=\"Valor del Dólar Oficial\"
                  icon={Globe} 
                  color=\"bg-red-600\"
                  buy={formatNumber(data?.clp_compra)}
                  sell={formatNumber(data?.clp_venta)}
                  change={data?.changes?.clp_percent}
                /\u003e
                \u003cdiv className=\"h-[440px]\"\u003e
                  \u003cRegionChart 
                    title=\"Tendencia CLP\" 
                    data={history} 
                    dataKey=\"clp_venta\" 
                    color={{hex: '#dc2626', text: 'text-red-600'}}
                    icon={TrendingUp}
                    singleLine={true}
                  /\u003e
                \u003c/div\u003e
              \u003c/div\u003e

              {/* Brasil Section */}
              \u003cdiv className=\"space-y-8\"\u003e
                \u003cdiv className=\"flex items-center gap-3 px-1\"\u003e
                  \u003cdiv className=\"w-1.5 h-6 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]\" /\u003e
                  \u003ch2 className=\"text-lg font-black text-slate-800 dark:text-white uppercase tracking-[0.2em]\"\u003eBrasil\u003c/h2\u003e
                \u003c/div\u003e
                \u003cStatCard 
                   title=\"Real Brasileño\" 
                  value={`${formatNumber(data?.brl_venta)}`} 
                  subtitle=\"Valor del Dólar Oficial\"
                  icon={Globe} 
                  color=\"bg-emerald-600\"
                  buy={formatNumber(data?.brl_compra)}
                  sell={formatNumber(data?.brl_venta)}
                  change={data?.changes?.brl_percent}
                /\u003e
                \u003cdiv className=\"h-[440px]\"\u003e
                  \u003cRegionChart 
                    title=\"Tendencia BRL\" 
                    data={history} 
                    dataKey=\"brl_venta\" 
                    color={{hex: '#059669', text: 'text-emerald-600'}}
                    icon={TrendingUp}
                    singleLine={true}
                  /\u003e
                \u003c/div\u003e
              \u003c/div\u003e
            \u003c/div\u003e
          )}

          {/* Calculadora Section */}
          {activeTab === 'Conversor' \u0026\u0026 (
            \u003cdiv className=\"space-y-8 animate-in fade-in duration-700 slide-in-from-bottom-4\"\u003e
              \u003cdiv className=\"flex items-center gap-3 px-1\"\u003e
                \u003cdiv className=\"w-1.5 h-6 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.3)]\" /\u003e
                \u003ch2 className=\"text-xl font-black text-slate-800 dark:text-white uppercase tracking-[0.2em]\"\u003eCalculadora\u003c/h2\u003e
              \u003c/div\u003e
              \u003cConverter data={data} /\u003e
            \u003c/div\u003e
          )}

        \u003c/div\u003e

        {/* Global Footer with API Status and Contact */}
        \u003cfooter className=\"relative lg:fixed lg:bottom-0 lg:left-0 lg:right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 px-4 lg:px-8 py-2 lg:py-3 z-50 transition-colors duration-300\"\u003e
          \u003cdiv className=\"max-w-7xl mx-auto space-y-2 lg:space-y-3\"\u003e
            \u003cdiv className=\"flex flex-col md:flex-row items-center justify-between gap-3 lg:gap-4\"\u003e
              \u003cdiv className=\"flex items-center gap-4\"\u003e
                \u003cdiv className=\"flex items-center gap-2 px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl transition-all border border-indigo-100 dark:border-indigo-800/50 shadow-sm\"\u003e
                  \u003cdiv className={`w-2 h-2 rounded-full animate-pulse ${data?.api_status?.dolar_api_ar ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} /\u003e
                  \u003cspan className=\"text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em]\"\u003eDOLAR API\u003c/span\u003e
                \u003c/div\u003e
              \u003c/div\u003e
              
              \u003cdiv className=\"flex items-center gap-6\"\u003e
                \u003cdiv className=\"hidden md:flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50 dark:bg-slate-800/50 px-4 py-2 rounded-2xl border border-slate-100 dark:border-slate-700/50\"\u003e
                  \u003cspan className=\"text-blue-500\"\u003eBuilt with\u003c/span\u003e
                  \u003cdiv className=\"flex gap-2\"\u003e
                    \u003cspan className=\"px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded text-[8px]\"\u003eTypeScript\u003c/span\u003e
                    \u003cspan className=\"px-1.5 py-0.5 bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400 rounded text-[8px]\"\u003eReact\u003c/span\u003e
                    \u003cspan className=\"px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded text-[8px]\"\u003eTailwind\u003c/span\u003e
                    \u003cspan className=\"px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded text-[8px]\"\u003eFastify\u003c/span\u003e
                  \u003c/div\u003e
                \u003c/div\u003e
                
                \u003cdiv className=\"flex flex-col items-end gap-3\"\u003e
                  \u003cdiv className=\"flex flex-wrap justify-end gap-2\"\u003e
                    {/* Status pill removed from here to be more prominent above */}
                  \u003c/div\u003e
                  
                  \u003ca 
                    href=\"https://github.com/johannmx/valores-mercado\" 
                    target=\"_blank\" 
                    rel=\"noopener noreferrer\"
                    className=\"p-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl hover:scale-110 active:scale-95 transition-all shadow-lg shadow-slate-200 dark:shadow-none\"
                  \u003e
                    \u003cGithub className=\"w-5 h-5\" /\u003e
                  \u003c/a\u003e
                \u003c/div\u003e
              \u003c/div\u003e
            \u003c/div\u003e
            
            \u003cdiv className=\"flex flex-col md:flex-row items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/50\"\u003e
              \u003cdiv className=\"text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2\"\u003e
                \u003cGlobe className=\"w-3 h-3 text-blue-500\" /\u003e
                Realizado por \u003cspan className=\"text-slate-900 dark:text-white\"\u003e@johannmx\u003c/span\u003e
              \u003c/div\u003e
              \u003cdiv className=\"flex items-center gap-4 text-[9px] font-black text-slate-300 dark:text-slate-500 uppercase tracking-[0.3em] teacher-none\"\u003e
                © 2026 MarketDash • Financial Pulse
              \u003c/div\u003e
            \u003c/div\u003e
          \u003c/div\u003e
        \u003c/footer\u003e
      \u003c/div\u003e

      {/* Toast Notifications - Moved outside the overflow-x-hidden container */}
      \u003cdiv className=\"fixed bottom-24 right-4 md:right-8 z-[100] flex flex-col gap-3 pointer-events-none\"\u003e
        {notifications.map(note =\u003e (
          \u003cToastNotification
            key={note.id}
            note={note}
            onDismiss={dismissNotification}
          /\u003e
        ))}
      \u003c/div\u003e
    \u003c/div\u003e
  );
}

export default App;
