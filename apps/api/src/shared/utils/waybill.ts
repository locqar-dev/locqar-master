import { prisma } from '../../config/database';

export async function generateWaybill(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `LQ-${year}-`;

  // Find highest waybill for this year
  const last = await prisma.package.findFirst({
    where: { waybill: { startsWith: prefix } },
    orderBy: { waybill: 'desc' },
    select: { waybill: true },
  });

  let seq = 1;
  if (last) {
    const parts = last.waybill.split('-');
    seq = parseInt(parts[parts.length - 1], 10) + 1;
  }

  return `${prefix}${String(seq).padStart(5, '0')}`;
}
