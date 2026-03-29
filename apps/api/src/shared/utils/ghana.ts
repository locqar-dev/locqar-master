import { config } from '../../config';

/** Normalise Ghana phone number to +233XXXXXXXXX */
export function normalisePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('233')) return `+${digits}`;
  if (digits.startsWith('0')) return `+233${digits.slice(1)}`;
  if (digits.length === 9) return `+233${digits}`;
  return `+${digits}`;
}

/** Format amount as Ghana Cedis */
export function formatGHS(amount: number): string {
  return `GH₵ ${amount.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Ghana income tax bands (2024 — GHS per year) */
const TAX_BANDS = [
  { upTo: 4380, rate: 0 },
  { upTo: 1320, rate: 0.05 },
  { upTo: 1560, rate: 0.1 },
  { upTo: 36000, rate: 0.175 },
  { upTo: 196740, rate: 0.25 },
  { upTo: Infinity, rate: 0.3 },
];

/** Calculate monthly income tax given monthly taxable income */
export function calcIncomeTax(monthlyTaxable: number): number {
  const annual = monthlyTaxable * 12;
  let tax = 0;
  let remaining = annual;

  for (const band of TAX_BANDS) {
    if (remaining <= 0) break;
    const applicable = Math.min(remaining, band.upTo);
    tax += applicable * band.rate;
    remaining -= applicable;
  }

  return parseFloat((tax / 12).toFixed(2));
}

/** Calculate SSNIT contributions */
export function calcSsnit(grossMonthly: number): { employee: number; employer: number } {
  return {
    employee: parseFloat((grossMonthly * config.ghana.ssnitEmployeeRate).toFixed(2)),
    employer: parseFloat((grossMonthly * config.ghana.ssnitEmployerRate).toFixed(2)),
  };
}

/** Calculate full payroll breakdown */
export function calcPayroll(gross: number) {
  const ssnit = calcSsnit(gross);
  const taxableIncome = gross - ssnit.employee;
  const incomeTax = calcIncomeTax(taxableIncome);
  const net = parseFloat((gross - ssnit.employee - incomeTax).toFixed(2));
  return { gross, ssnitEmployee: ssnit.employee, ssnitEmployer: ssnit.employer, incomeTax, net };
}
