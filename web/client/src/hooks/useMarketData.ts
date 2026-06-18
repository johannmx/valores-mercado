import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

export interface MarketData {
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
  usd_wallbit: number;
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
    otros_dolares_percents: {
      mep: number;
      ccl: number;
      tarjeta: number;
      wallbit: number;
    };
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

export interface HistoryItem {
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

export interface AppNotification {
  id: number;
  message: string;
  type: 'up' | 'down';
  key: string;
}

const MAX_HISTORY_POINTS = 2016;

export const useMarketData = () => {
  const [data, setData] = useState<MarketData | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [changedKeys, setChangedKeys] = useState<Record<string, 'up' | 'down'>>({});
  
  const hasFetchedHistory = useRef(false);

  const formatNumber = (num: number) => {
    return num.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const fetchData = useCallback(async (abortSignal?: AbortSignal) => {
    setIsRefreshing(true);
    try {
      let baseURL = window._env_?.VITE_API_URL || import.meta.env.VITE_API_URL || '';
      if (baseURL.includes('${VITE_API_URL}')) baseURL = '';
      if (baseURL.endsWith('/')) baseURL = baseURL.slice(0, -1);

      // Only fetch history on the first load to save bandwidth and memory
      const fetchPromises: Promise<unknown>[] = [
        axios.get(`${baseURL}/api/rates`, { signal: abortSignal })
      ];

      if (!hasFetchedHistory.current) {
        fetchPromises.push(axios.get(`${baseURL}/api/history`, { signal: abortSignal }));
      }

      const results = await Promise.all(fetchPromises);
      const ratesData = (results[0] as { data: MarketData }).data;

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

      setData(prevData => {
        if (prevData) {
          const newNotifications: AppNotification[] = [];
          const newChangedKeys: Record<string, 'up' | 'down'> = {};

          const checkChange = (key: keyof MarketData, label: string, isVes = false) => {
            const oldVal = prevData[key] as number;
            const newVal = ratesData[key] as number;
            if (oldVal && newVal && oldVal !== newVal) {
              const type = newVal > oldVal ? 'up' : 'down';
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
          checkChange('usd_wallbit', 'Dólar Wallbit');
          checkChange('ves_paralelo', 'Bolívar Paralelo', true);
          checkChange('ves_oficial', 'Bolívar Oficial', true);

          if (newNotifications.length > 0) {
            setNotifications(prev => [...prev, ...newNotifications]);
            setChangedKeys(prev => ({ ...prev, ...newChangedKeys }));
          }
        }
        return ratesData;
      });

      if (!hasFetchedHistory.current) {
        const historyData = (results[1] as { data: HistoryItem[] }).data;
        setHistory([...historyData, currentAsHistory].slice(-MAX_HISTORY_POINTS));
        hasFetchedHistory.current = true;
      } else {
        // Circular buffer buffer behavior
        setHistory(prev => [...prev.slice(-(MAX_HISTORY_POINTS - 1)), currentAsHistory]);
      }

      setError(null);
    } catch (err) {
      if (!axios.isCancel(err)) {
        setError('Error de conexión con el servidor.');
      }
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  }, []);

  const dismissNotification = useCallback((id: number, key: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    setChangedKeys(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  // Initial fetch with AbortController for cleanup
  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    
    return () => {
      controller.abort();
    };
  }, [fetchData]);

  return {
    data,
    history,
    loading,
    error,
    isRefreshing,
    fetchData,
    notifications,
    changedKeys,
    dismissNotification
  };
};
