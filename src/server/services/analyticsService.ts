export type AnalyticsSummary = {
  eventsOverTime: Array<{ts: number; count: number}>;
  topCategories: Array<{name: string; value: number}>;
  recentActivity: Array<{ts: number; label: string}>;
};

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  // Placeholder implementation; replace with real DB aggregation.
  const now = Date.now();
  const eventsOverTime = Array.from({length: 12}).map((_, i) => ({
    ts: now - (11 - i) * 1000 * 60 * 60,
    count: Math.floor(Math.random() * 200),
  }));

  const topCategories = [
    {name: 'signup', value: 340},
    {name: 'purchase', value: 210},
    {name: 'support', value: 95},
  ];

  const recentActivity = Array.from({length: 10}).map((_, i) => ({
    ts: now - i * 1000 * 60 * 5,
    label: `event_${i}`,
  }));

  return {eventsOverTime, topCategories, recentActivity};
}
