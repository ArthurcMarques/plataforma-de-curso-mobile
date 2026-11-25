// Soma meses a uma data ISO sem depender de uma lib de datas.
export function addMonths(isoDate: string, months: number): string {
  const date = new Date(isoDate);
  date.setMonth(date.getMonth() + months);
  return date.toISOString();
}
