export function formatPhone(value: string): string {
  if (!value) return '';
  // Remove non-numeric characters
  const numbers = value.replace(/\D/g, '').slice(0, 11);
  
  if (numbers.length <= 2) {
    return numbers.length > 0 ? `(${numbers}` : '';
  }
  if (numbers.length <= 6) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  }
  if (numbers.length <= 10) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  }
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
}

export function formatDateTime(isoString?: string): string {
  if (!isoString) return 'Data não informada';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo',
    }).format(date).replace(',', ' às');
  } catch {
    return isoString;
  }
}

export function formatPriceMask(value: string | number): string {
  if (value === undefined || value === null || value === '') return '';
  const clean = String(value).replace(/\D/g, '');
  if (!clean) return '';
  const num = parseInt(clean, 10);
  return 'R$ ' + num.toLocaleString('pt-BR');
}

export function parsePriceMask(value: string | number): number {
  if (value === undefined || value === null || value === '') return 0;
  const clean = String(value).replace(/\D/g, '');
  return clean ? parseInt(clean, 10) : 0;
}
