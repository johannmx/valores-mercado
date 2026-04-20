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
  BarChart,
  Bar,
  Cell
} from 'recharts';

// --- Components ---

const StatCard = ({ title, value, icon: Icon, color, subtitle, trend }: any) => (
  <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/50 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500 group relative overflow-hidden flex flex-col h-full">
    <div className={`absolute top-0 right-0 w-32 h-32 ${color.replace('bg-', 'bg-')}/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700`} />
    
    <div className="flex justify-between items-start mb-8 relative z-10">
      <div className={`p-4 ${color} rounded-2xl shadow-lg shadow-current/20 group-hover:scale-110 transition-transform duration-500`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      {trend && (
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black tracking-wider uppercase ${trend > 0 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30' : 'bg-red-50 text-red-600 dark:bg-red-900/30'}`}>
          {trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(trend).toFixed(1)}%
        </div>
      )}
    </div>

    <div className="relative z-10 mt-auto">
      <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em] mb-2">{title}</h3>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums">{value}</span>
      </div>
      {subtitle && <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-4 uppercase tracking-widest">{subtitle}</p>}
    </div>
  </div>
);

const RegionChart = ({ title, data, dataKey, buyKey, sellKey, color, icon: Icon }: any) => {
  const chartData = useMemo(() => {
    if (!data) return [];
    return data.slice(-15).map((d: any) => ({
      ...d,
      displayTime: new Date(d.timestamp).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
    }));
  }, [data]);

  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/50 flex flex-col h-full group">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${color.text.replace('text-', 'bg-')}/10 ${color.text}`}>
            {Icon ? <Icon className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
          </div>
          <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em]">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">En Tiempo Real</span>
        </div>
      </div>
      
      <div className="flex-1 min-h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color.hex} stopOpacity={0.15}/>
                <stop offset="95%" stopColor={color.hex} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={document.documentElement.classList.contains('dark') ? '#1e293b' : '#f1f5f9'} />
            <XAxis 
              dataKey="displayTime" 
              axisLine={false}
              tickLine={false}
              tick={{fill: '#94a3b8', fontSize: 9, fontWeight: 900}}
              dy={10}
            />
            <YAxis 
              hide 
              domain={['auto', 'auto']}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#0f172a', 
                border: 'none', 
                borderRadius: '16px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                padding: '12px'
              }}
              itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase' }}
              labelStyle={{ color: '#64748b', fontSize: '10px', marginBottom: '4px', fontWeight: '900' }}
            />
            {buyKey && (
              <Area 
                type="monotone" 
                dataKey={buyKey} 
                stroke="#10b981" 
                strokeWidth={4}
                fill="none"
                animationDuration={2000}
              />
            )}
            <Area 
              type="monotone" 
              dataKey={sellKey || dataKey} 
              stroke={color.hex} 
              strokeWidth={4}
              fill={`url(#grad-${title})`}
              animationDuration={2000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// --- Utils ---

export const formatNumber = (num: number | string | undefined | null): string => {
  if (num === undefined || num === null || num === '') return '';
  const n = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(n)) return num.toString();
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(n);
};

// --- Main Component ---

const App = () => {
  const [data, setData] = useState<any>(null);
  const [history, setHistory] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'Argentina' | 'Venezuela' | 'Latam' | 'Conversor'>('Argentina');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  
  // Conversor State
  const [amount, setAmount] = useState<number>(100);
  const [from, setFrom] = useState<'USD_BLUE' | 'USD_OFICIAL' | 'VES_PARALELO' | 'UYU' | 'CLP'>('USD_BLUE');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const addNotification = (message: string, type: 'info' | 'success' = 'info') => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      dismissNotification(id);
    }, 5000);
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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-8 transition-colors duration-500">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 border-8 border-indigo-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-8 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
          <Activity className="absolute inset-0 m-auto w-8 h-8 text-indigo-500 animate-pulse" />
        </div>
        <div className="mt-8 space-y-2 text-center">
          <h1 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-[0.4em] animate-pulse">MarketDash</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sincronizando Pulso Financiero...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 transition-colors duration-500 selection:bg-indigo-500 selection:text-white">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-[5%] left-[20%] w-[35%] h-[35%] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[110px] animate-pulse" />
      </div>

      <div className="relative flex flex-col min-h-screen">
        {/* Navigation Bar */}
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800/50 px-4 lg:px-8 py-4 transition-all duration-300">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4 group cursor-pointer" onClick={() => fetchData()}>
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl rotate-3 group-hover:rotate-12 transition-transform duration-500 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">MarketDash</h1>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">En Vivo • 1m update</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
                <button className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm transition-all">Dashboard</button>
                <button className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all">Alertas</button>
              </div>
              
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />
              
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all group"
              >
                {isDarkMode ? <Sun className="w-5 h-5 text-amber-400 group-hover:rotate-90 transition-transform duration-500" /> : <Moon className="w-5 h-5 text-indigo-600 group-hover:-rotate-12 transition-transform duration-500" />}
              </button>

              <button className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 sm:hidden">
                <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-12">
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="space-y-2">
              <h2 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] mb-3">
                {activeTab === 'Argentina' && 'Mercado Argentina'}
                {activeTab === 'Venezuela' && 'Mercado Venezuela'}
                {activeTab === 'Latam' && 'Latam'}
                {activeTab === 'Conversor' && 'Calculadora Global'}
              </h2>
              <div className="flex items-center gap-4">
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                  {activeTab === 'Conversor' ? 'Calculadora' : 'Dashboard'}
                </h1>
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    {data?.last_update ? new Date(data.last_update).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--:--'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden lg:flex flex-col items-end mr-4">
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Última Sincronización</div>
                <div className="text-xs font-black text-slate-600 dark:text-slate-300">
                  {data?.last_update ? new Date(data.last_update).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--:--'}
                </div>
              </div>
              <button 
                onClick={() => {
                  setLoading(true);
                  fetchData();
                  addNotification('Datos de mercado actualizados');
                }}
                className="p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95 group"
              >
                <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-8 p-5 bg-red-50 dark:bg-red-900/30 border-2 border-red-100 dark:border-red-800/50 rounded-3xl flex items-center gap-3 text-red-700 dark:text-red-400 animate-pulse max-w-7xl mx-auto">
              <TrendingDown className="w-6 h-6" />
              <span className="font-black uppercase text-xs tracking-widest">{error}</span>
            </div>
          )}

        {/* Navigation Tabs */}
        <nav className="flex justify-center mb-16">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-2 rounded-[28px] border border-white dark:border-slate-700/50 shadow-xl flex gap-1">
            {[
              { id: 'Argentina', label: 'Argentina' },
              { id: 'Venezuela', label: 'Venezuela' },
              { id: 'Latam', label: 'LATAM' },
              { id: 'Conversor', label: 'Conversor' }
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
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 animate-in fade-in zoom-in duration-500" />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>


        {/* Main Content Sections */}
        <div className="max-w-7xl mx-auto">
          
          {/* Argentina Section */}
          {activeTab === 'Argentina' && (
            <div className="space-y-12 animate-in fade-in duration-700 slide-in-from-bottom-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatCard 
                  title="Dólar Blue" 
                  value={`$ ${formatNumber(data?.blue?.value_sell)}`} 
                  icon={DollarSign} 
                  color="bg-indigo-600"
                  subtitle="Mercado Informal"
                  trend={data?.changes?.usd_blue_percent}
                />
                <StatCard 
                  title="Dólar Oficial" 
                  value={`$ ${formatNumber(data?.oficial?.value_sell)}`} 
                  icon={Globe} 
                  color="bg-emerald-500"
                  subtitle="Banco Central"
                />
                <StatCard 
                  title="Dólar MEP" 
                  value={`$ ${formatNumber(data?.mep?.value_sell)}`} 
                  icon={Activity} 
                  color="bg-blue-500"
                  subtitle="Bolsa Local"
                />
                <StatCard 
                  title="Bitcoin" 
                  value={`US$ ${formatNumber(data?.btc_usd)}`} 
                  icon={Coins} 
                  color="bg-orange-500"
                  subtitle="Crypto Market"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <RegionChart 
                    title="Tendencia Dólar Blue" 
                    data={history} 
                    buyKey="usd_oficial"
                    sellKey="usd_blue"
                    color={{hex: '#4f46e5', text: 'text-indigo-600'}}
                    icon={TrendingUp}
                  />
                </div>
                <div className="space-y-8">
                  <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/50 h-full flex flex-col group">
                    <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em] mb-8 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-emerald-500" /> Brecha Cambiaria
                    </h3>
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-2 group-hover:scale-105 transition-transform duration-500">
                        {data?.blue && data?.oficial ? (((data.blue.value_sell / data.oficial.value_sell) - 1) * 100).toFixed(1) : '0.0'}%
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-relaxed">
                        Diferencia porcentual entre la cotización del mercado informal y el oficial.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Venezuela Section */}
          {activeTab === 'Venezuela' && (
            <div className="space-y-12 animate-in fade-in duration-700 slide-in-from-bottom-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatCard 
                  title="Dólar Paralelo" 
                  value={`Bs. ${formatNumber(data?.ves_paralelo)}`} 
                  icon={TrendingUp} 
                  color="bg-amber-500"
                  subtitle="Promedio EnParalelo"
                  trend={data?.changes?.ves_paralelo_percent}
                />
                <StatCard 
                  title="Dólar BCV" 
                  value={`Bs. ${formatNumber(data?.ves_oficial)}`} 
                  icon={Globe} 
                  color="bg-blue-600"
                  subtitle="BCV (Referencia)"
                />
                <StatCard 
                  title="Brecha VES" 
                  value={`${data?.ves_paralelo && data?.ves_oficial ? (((data.ves_paralelo / data.ves_oficial) - 1) * 100).toFixed(1) : '0.0'}%`}
                  icon={Zap} 
                  color="bg-emerald-500"
                  subtitle="Diferencial Oficial"
                />
                <StatCard 
                  title="Bitcoin / USD" 
                  value={`US$ ${formatNumber(data?.btc_usd)}`} 
                  icon={Coins} 
                  color="bg-orange-500"
                  subtitle="Mercado Cripto"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <RegionChart 
                  title="Tendencia VES/USD" 
                  data={history} 
                  buyKey="ves_oficial"
                  sellKey="ves_paralelo"
                  color={{hex: '#f59e0b', text: 'text-amber-500', buyHex: '#10b981'}}
                  icon={Activity}
                />
                <div className="flex-1 bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/50 flex flex-col h-full">
                  <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-emerald-500" /> Mercado Euro (VES)
                  </h3>
                  <div className="flex-1 space-y-6 flex flex-col justify-center">
                    <div className="flex justify-between items-center p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all">
                      <span className="font-black text-slate-500 uppercase text-xs tracking-tight">Euro Paralelo</span>
                      <span className="font-black text-slate-800 dark:text-white text-xl">Bs. {formatNumber(data?.ves_eur_paralelo)}</span>
                    </div>
                    <div className="flex justify-between items-center p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all">
                      <span className="font-black text-slate-500 uppercase text-xs tracking-tight">Euro BCV</span>
                      <span className="font-black text-slate-800 dark:text-white text-xl">Bs. {formatNumber(data?.ves_eur_oficial)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LATAM Section */}
          {activeTab === 'Latam' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-700 slide-in-from-bottom-4">
              {/* Uruguay Section */}
              <div className="space-y-8">
                <div className="flex items-center gap-3 px-1">
                  <div className="w-1.5 h-6 bg-sky-500 rounded-full shadow-[0_0_10px_rgba(14,165,233,0.3)]" />
                  <h2 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-[0.2em]">Uruguay</h2>
                </div>
                <StatCard 
                  title="Peso Uruguayo" 
                  value={`$U ${formatNumber(data?.uyu_venta)}`} 
                  icon={Globe} 
                  color="bg-sky-500"
                  subtitle="Cotización Interbancaria"
                />
                <div className="h-[300px]">
                  <RegionChart 
                    title="Tendencia UYU" 
                    data={history} 
                    dataKey="uyu_venta" 
                    color={{hex: '#0ea5e9', text: 'text-sky-500'}}
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
                  value={`$ ${formatNumber(data?.clp_venta)}`} 
                  icon={Activity} 
                  color="bg-red-500"
                  subtitle="Tasa de Mercado"
                />
                <div className="h-[300px]">
                  <RegionChart 
                    title="Tendencia CLP" 
                    data={history} 
                    dataKey="clp_venta" 
                    color={{hex: '#ef4444', text: 'text-red-500'}}
                  />
                </div>
              </div>

              {/* Regional Overview */}
              <div className="bg-white dark:bg-slate-800 p-8 rounded-[40px] shadow-sm border border-slate-100 dark:border-slate-700/50 flex flex-col">
                <div className="flex items-center gap-3 mb-10">
                  <BarChart3 className="w-6 h-6 text-emerald-500" />
                  <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em]">Arbitraje ARS</h3>
                </div>
                <div className="space-y-6 flex-1 flex flex-col justify-center">
                  <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all group">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] font-black text-slate-500 uppercase tracking-tight">Real / Peso ARS</span>
                      <span className="text-xl font-black text-slate-800 dark:text-white tracking-tighter">$ {formatNumber(data?.brl_ar)}</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full w-[65%] group-hover:w-[70%] transition-all duration-1000" />
                    </div>
                  </div>
                  <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all group">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] font-black text-slate-500 uppercase tracking-tight">CLP / Peso ARS</span>
                      <span className="text-xl font-black text-slate-800 dark:text-white tracking-tighter">$ {formatNumber(data?.clp_ar)}</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full w-[45%] group-hover:w-[50%] transition-all duration-1000" />
                    </div>
                  </div>
                  <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all group">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] font-black text-slate-500 uppercase tracking-tight">UYU / Peso ARS</span>
                      <span className="text-xl font-black text-slate-800 dark:text-white tracking-tighter">$ {formatNumber(data?.uyu_ar)}</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-sky-500 h-full w-[80%] group-hover:w-[85%] transition-all duration-1000" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Calculadora Section */}
          {activeTab === 'Conversor' && (
            <div className="max-w-3xl mx-auto animate-in fade-in zoom-in duration-700">
              <Conversor data={data} amount={amount} setAmount={setAmount} from={from} setFrom={setFrom} isDropdownOpen={isDropdownOpen} setIsDropdownOpen={setIsDropdownOpen} />
            </div>
          )}

        </div>
        </main>

        {/* Dynamic Notifications */}
        <div className="fixed bottom-8 right-8 z-[100] space-y-4">
          {notifications.map(note => (
            <ToastNotification key={note.id} note={note} onDismiss={dismissNotification} />
          ))}
        </div>

        <footer className="mt-auto py-12 px-8 border-t border-slate-100 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-white dark:text-slate-900" />
              </div>
              <div>
                <div className="text-lg font-black text-slate-900 dark:text-white tracking-tighter leading-none">MarketDash</div>
                <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Premium Finance Analytics</div>
              </div>
            </div>
            <div className="flex items-center gap-8">
              <a href="https://github.com/johannmx/valores-mercado" className="text-[10px] font-black text-slate-400 hover:text-indigo-500 dark:hover:text-white uppercase tracking-widest transition-colors flex items-center gap-2 group">
                <Github className="w-4 h-4 group-hover:rotate-12 transition-transform" /> GitHub Repository
              </a>
              <div className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">© 2026 • Versión 2.0 Premium</div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

const Conversor = ({ data, amount, setAmount, from, setFrom, isDropdownOpen, setIsDropdownOpen }: any) => {
  const options = [
    { value: 'USD_BLUE', label: 'Dólar Blue', sub: 'Mercado Informal', rate: data?.blue?.value_sell },
    { value: 'USD_OFICIAL', label: 'Dólar Oficial', sub: 'Banco Central', rate: data?.oficial?.value_sell },
    { value: 'VES_PARALELO', label: 'Dólar Paralelo', sub: 'Promedio EnParalelo', rate: data?.ves_paralelo },
    { value: 'UYU', label: 'Peso Uruguayo', sub: 'Tasa Interbancaria', rate: data?.uyu_venta },
    { value: 'CLP', label: 'Peso Chileno', sub: 'Tasa de Mercado', rate: data?.clp_venta }
  ];

  const selectedOption = options.find(o => o.value === from);

  const results = useMemo(() => {
    if (!data || !selectedOption?.rate) return [];
    
    // Base amount in the currency itself (e.g. 100 USD or 100 VES)
    const baseAmount = amount;
    
    if (from.startsWith('USD')) {
      return [
        { label: 'Pesos Argentinos', value: formatNumber(baseAmount * (data.blue?.value_sell || 0)), prefix: '$' },
        { label: 'Bolívares (VES)', value: formatNumber(baseAmount * (data.ves_paralelo || 0)), prefix: 'Bs.' },
        { label: 'Pesos Uruguayos', value: formatNumber(baseAmount * (data.uyu_venta || 0)), prefix: '$U' },
        { label: 'Pesos Chilenos', value: formatNumber(baseAmount * (data.clp_venta || 0)), prefix: '$' }
      ];
    } else if (from === 'VES_PARALELO') {
      const inUsd = baseAmount / (data.ves_paralelo || 1);
      return [
        { label: 'Dólar USA', value: formatNumber(inUsd), prefix: 'US$' },
        { label: 'Pesos Argentinos', value: formatNumber(inUsd * (data.blue?.value_sell || 0)), prefix: '$' },
        { label: 'Pesos Uruguayos', value: formatNumber(inUsd * (data.uyu_venta || 0)), prefix: '$U' }
      ];
    } else {
      const inUsd = baseAmount / (selectedOption.rate || 1);
      return [
        { label: 'Dólar USA', value: formatNumber(inUsd), prefix: 'US$' },
        { label: 'Bolívares (VES)', value: formatNumber(inUsd * (data.ves_paralelo || 0)), prefix: 'Bs.' },
        { label: 'Pesos Argentinos', value: formatNumber(inUsd * (data.blue?.value_sell || 0)), prefix: '$' }
      ];
    }
  }, [data, amount, from, selectedOption]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-[48px] shadow-2xl border border-slate-100 dark:border-slate-700/50 overflow-hidden relative group">
      <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500" />
      
      <div className="p-10 lg:p-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12">
          <div className="space-y-6">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em] flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" /> Cantidad a Convertir
            </label>
            <div className="relative group/input">
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border-2 border-transparent focus:border-indigo-500 rounded-3xl px-8 py-6 text-3xl font-black text-slate-800 dark:text-white outline-none transition-all shadow-inner"
                placeholder="0.00"
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 font-black text-sm tracking-widest uppercase">Monto</div>
            </div>
          </div>

          <div className="space-y-6">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em] flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-emerald-500" /> Moneda de Origen
            </label>
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-700 rounded-3xl px-8 py-6 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-xl font-black text-indigo-600">
                    {selectedOption?.label.charAt(0)}
                  </div>
                  <div className="text-left">
                    <div className="font-black text-slate-800 dark:text-white text-lg">{selectedOption?.label}</div>
                    <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{selectedOption?.sub}</div>
                  </div>
                </div>
                <ChevronRight className={`w-6 h-6 text-slate-300 transition-transform duration-300 ${isDropdownOpen ? 'rotate-90' : ''}`} />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-4 bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700/50 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="p-2">
                    {options.map((option) => (
                      <div
                        key={option.value}
                        onClick={() => {
                          setFrom(option.value as any);
                          setIsDropdownOpen(false);
                        }}
                        className={`px-6 py-3 cursor-pointer text-sm font-black transition-colors flex items-center justify-between group ${from === option.value ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'}`}
                      >
                        {option.label}
                        {from === option.value && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/30 rounded-[32px] p-8 lg:p-10 space-y-8 border border-slate-100/50 dark:border-slate-800/50 shadow-inner">
          <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em] mb-4">Resultados Estimados</h4>
          <div className="space-y-6">
            {results.map((res, i) => (
              <div key={i} className="flex items-center justify-between p-5 bg-white dark:bg-slate-800/50 rounded-2xl border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/30 transition-all group">
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-tight">{res.label}</span>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 mr-1">{res.prefix}</span>
                  <span className="text-xl font-black text-slate-800 dark:text-white tracking-tighter group-hover:scale-110 inline-block transition-transform">{res.value}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
            <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase leading-relaxed tracking-widest text-center">
              Valores basados en la cotización actual del mercado paralelo y oficial.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ToastNotification = ({ note, onDismiss }: { note: any, onDismiss: (id: string) => void }) => {
  return (
    <div className="bg-slate-900 dark:bg-indigo-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-right-full duration-500 border border-white/10">
      {note.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-blue-400" />}
      <span className="text-xs font-black uppercase tracking-widest">{note.message}</span>
      <button onClick={() => onDismiss(note.id)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default App;
