export const isMarketOpen = (now: Date = new Date()) => {
  // Argentina is UTC-3
  const utcHour = now.getUTCHours();
  const argHour = (utcHour - 3 + 24) % 24;
  const day = now.getUTCDay(); // 0=Sun, 6=Sat
  // Banking hours: Mon-Fri, 10:00-15:00 ART
  return day >= 1 && day <= 5 && argHour >= 10 && argHour < 15;
};
