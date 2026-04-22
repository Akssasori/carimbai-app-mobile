export function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR');
}

export function formatCountdown(seconds: number): string {
  if (seconds <= 0) {
    return 'Expirado';
  }
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
