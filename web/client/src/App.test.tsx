import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import axios from 'axios';
import App, { formatNumber } from './App';

vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

// Suppress known Recharts warnings
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  if (typeof args[0] === 'string' && (args[0].includes('chart should be greater than 0'))) {
    return;
  }
  originalConsoleWarn(...args);
};

// Suppress known Act warnings
const originalConsoleError = console.error;
console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('was not wrapped in act')) {
    return;
  }
  originalConsoleError(...args);
};

describe('formatNumber utility', () => {
  it('handles null, undefined, and empty string', () => {
    expect(formatNumber(null)).toBe('');
    expect(formatNumber(undefined)).toBe('');
    expect(formatNumber('')).toBe('');
  });

  it('handles regular numbers', () => {
    const result = formatNumber(1000.5);
    // Flexible matching for decimal/thousands separators
    expect(result).toMatch(/1[.,]000[.,]50/);
    expect(formatNumber(42)).toMatch(/42[.,]00/);
    expect(formatNumber(0)).toMatch(/0[.,]00/);
  });

  it('handles string numbers', () => {
    expect(formatNumber('1234.56')).toMatch(/1[.,]234[.,]56/);
    expect(formatNumber('0')).toMatch(/0[.,]00/);
  });

  it('handles non-numeric strings (NaN cases)', () => {
    expect(formatNumber('not a number')).toBe('not a number');
    expect(formatNumber('abc')).toBe('abc');
  });

  it('handles edge case formatting rounding', () => {
    expect(formatNumber(10.123)).toMatch(/10[.,]12/);
    expect(formatNumber(10.128)).toMatch(/10[.,]13/);
  });
});

describe('App component', () => {
  const mockMarketData = {
    last_update: new Date().toISOString(),
    oficial: { value_buy: 95, value_sell: 100, date: '2024-01-01' },
    blue: { value_buy: 145, value_sell: 150, date: '2024-01-01' },
    mep: { value_buy: 135, value_sell: 140, date: '2024-01-01' },
    ccl: { value_buy: 140, value_sell: 145, date: '2024-01-01' },
    ves_oficial: 35,
    ves_paralelo: 40,
    uyu_venta: 40,
    clp_venta: 900,
    brl_ar: 200,
    clp_ar: 1.5,
    uyu_ar: 25,
    btc_usd: 65000,
    changes: {
      usd_blue_percent: -2.5,
      ves_paralelo_percent: 1.2
    },
    api_status: {
      dolar_api_ar: true,
      bcv_ves: true,
      bluelytics_ar: true
    }
  };

  const mockHistoryData = [
    { timestamp: new Date(Date.now() - 3600000).toISOString(), usd_blue: 140, usd_oficial: 90 },
    { timestamp: new Date().toISOString(), usd_blue: 150, usd_oficial: 100 }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/api/market')) {
        return Promise.resolve({ data: mockMarketData });
      }
      if (url.includes('/api/history')) {
        return Promise.resolve({ data: mockHistoryData });
      }
      return Promise.reject(new Error('not found'));
    });
  });

  it('renders loading state initially', async () => {
    render(<App />);
    expect(screen.getByText(/Sincronizando/i)).toBeInTheDocument();
  });

  it('renders main dashboard after data loads', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.queryByText(/Sincronizando/i)).not.toBeInTheDocument();
    });
    expect(screen.getByRole('heading', { name: /MarketDash/i })).toBeInTheDocument();
    expect(screen.getByText('Dólar Oficial')).toBeInTheDocument();
  });

  it('renders API error state', async () => {
    mockedAxios.get.mockImplementation(() => Promise.reject(new Error('Network Error')));
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/Error al sincronizar/i)).toBeInTheDocument();
    });
  });

  it('renders different tabs and changes views', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.queryByText(/Sincronizando/i)).not.toBeInTheDocument();
    });

    // Initial state: Argentina
    expect(screen.getByText(/Mercado Argentina/i)).toBeInTheDocument();

    // Switch to Venezuela
    const venezuelaTab = screen.getByRole('button', { name: /Venezuela/i });
    fireEvent.click(venezuelaTab);
    await waitFor(() => {
      expect(screen.getByText(/Mercado Venezuela/i)).toBeInTheDocument();
    });

    // Switch to LATAM (Uruguay & Chile)
    const latamTab = screen.getByRole('button', { name: /LATAM/i });
    fireEvent.click(latamTab);
    await waitFor(() => {
      expect(screen.getByText(/^Uruguay$/i)).toBeInTheDocument();
    });

    // Switch to Conversor
    const convTab = screen.getByRole('button', { name: /Conversor/i });
    fireEvent.click(convTab);
    await waitFor(() => {
      expect(screen.getByText(/Calculadora Global/i)).toBeInTheDocument();
    });
  });
});
