export const isMarketOpen = (now: Date = new Date()) => {
  // Argentina is UTC-3
  const utcHour = now.getUTCHours();
  const argHour = (utcHour - 3 + 24) % 24;
  const day = now.getUTCDay(); // 0=Sun, 6=Sat
  // Banking hours: Mon-Fri, 10:00-15:00 ART
  return day >= 1 && day <= 5 && argHour >= 10 && argHour < 15;
};

export const formatNumber = (num: number | string | null | undefined) => {
  if (num === null || num === undefined || num === '') return '';
  const parsed = Number(num);
  if (isNaN(parsed)) return num;
  return parsed.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

/**
 * Muestrea uniformemente un arreglo de datos para reducir el número de puntos
 * en el gráfico, aliviando el consumo de memoria/CPU en el renderizado SVG.
 */
export const downsampleData = <T>(data: T[], maxPoints: number): T[] => {
  if (data.length <= maxPoints) return data;
  const step = (data.length - 1) / (maxPoints - 1);
  const result: T[] = [];
  for (let i = 0; i < maxPoints; i++) {
    result.push(data[Math.round(i * step)]);
  }
  return result;
};
