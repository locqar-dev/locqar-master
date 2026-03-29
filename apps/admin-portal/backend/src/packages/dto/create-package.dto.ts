export class CreatePackageDto {
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    lockerId?: string;
    // terminalId?  // Schema package didn't have terminalId directly, accessed via locker usually or I need to add it to schema if needed for "At Warehouse" status.
    // Schema has: lockerId String? locker Locker?
    // It didn't have terminalId. If status is AT_WAREHOUSE, maybe no terminal or a Warehouse Terminal?
    // For now let's stick to what schema has.
}
