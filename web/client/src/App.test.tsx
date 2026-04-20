import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import axios from 'axios';
import App from './App';

vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

// Suppress known Recharts warnings and exact string mismatch errors
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('The width(-1) and height(-1) of chart should be greater than 0')) {
    return;
  }
  if (typeof args[0] === 'string' && args[0].includes('The width(0) and height(0) of chart should be greater than 0')) {
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

describe('App component', () => {
  const mockMarketData = {
    timestamp: new Date().toISOString(),
    usd_oficial: 100,
    usd_blue: 150,
    usd_mep: 140,
    usd_ccl: 145,
    usd_cripto: 148,
    usd_tarjeta: 160,
    ves_oficial: 35,
    ves_paralelo: 40,
    uyu_venta: 40,
    clp_venta: 900,
    brl_venta: 5,
    eur_venta: 110,
    changes: {
      usd_oficial_percent: 1,
      usd_blue_percent: -2,
    },
    api_status: {
      dolar_api_ar: true,
      dolar_api_ve: true,
    }
  };

  const mockHistoryData = [
    { timestamp: new Date(Date.now() - 3600000).toISOString(), usd_blue: 140, usd_oficial: 90 },
    { timestamp: new Date().toISOString(), usd_blue: 150, usd_oficial: 100 }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/api/rates')) {
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
    expect(screen.getByText(/Sincronizando Mercados/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText(/Sincronizando Mercados/i)).not.toBeInTheDocument();
    });
  });

  it('renders main dashboard after data loads', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.queryByText(/Sincronizando Mercados/i)).not.toBeInTheDocument();
    });

    expect(screen.getByText('Market')).toBeInTheDocument();
    expect(screen.getByText('Dash')).toBeInTheDocument();

    expect(screen.getByText('Dólar Oficial')).toBeInTheDocument();
    expect(screen.getAllByText(/100,00/).length).toBeGreaterThan(0);
  });

  it('renders API error state', async () => {
    mockedAxios.get.mockImplementation(() => Promise.reject(new Error('Network Error')));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Error de conexión con el servidor.')).toBeInTheDocument();
    });
  });

  it('renders different tabs and changes views', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.queryByText(/Sincronizando Mercados/i)).not.toBeInTheDocument();
    });

    expect(screen.getByText('Mercado Argentina')).toBeInTheDocument();

    const venezuelaTab = screen.getByRole('button', { name: /Venezuela/i });
    fireEvent.click(venezuelaTab);

    await waitFor(() => {
      expect(screen.getByText('Mercado Venezuela')).toBeInTheDocument();
    });

    // Check for VES text but not strict formatting
    expect(screen.getByText(/35,00/)).toBeInTheDocument();
    expect(screen.getAllByText(/VES/).length).toBeGreaterThan(0);

    const latamTab = screen.getByRole('button', { name: /LATAM/i });
    fireEvent.click(latamTab);

    await waitFor(() => {
      expect(screen.getByText('Peso Uruguayo')).toBeInTheDocument();
    });

    const calcTab = screen.getByRole('button', { name: /Calculadora/i });
    fireEvent.click(calcTab);

    await waitFor(() => {
      expect(screen.getByText('Conversor Rápido')).toBeInTheDocument();
    });
  });
});
