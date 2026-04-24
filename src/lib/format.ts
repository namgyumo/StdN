export function formatDate(date: Date | string, locale: string = 'ko-KR'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

export function formatShortDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yy}.${mm}.${dd}`;
}

export function readingTime(text: string): string {
  const wordsPerMinute = 250;
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / wordsPerMinute));
  return `${minutes}분`;
}
