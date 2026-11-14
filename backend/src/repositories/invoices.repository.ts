import { catalystClient } from "../infrastructure/persistence/zoho-catalyst/catalyst.client.js";
import { InvoiceRecord } from "../infrastructure/persistence/zoho-catalyst/catalyst.types.js";

export class InvoicesRepository {
  static async findByOrg(orgId: string): Promise<InvoiceRecord[]> {
    return catalystClient.find<InvoiceRecord>("Invoices", { organizationId: orgId });
  }

  static async findById(invoiceId: string, orgId?: string): Promise<InvoiceRecord | null> {
    const query: Record<string, any> = { invoiceId };
    if (orgId) query.organizationId = orgId;
    const invs = await catalystClient.find<InvoiceRecord>("Invoices", query);
    if (invs.length > 0) return invs[0];

    // Fallback search by invoiceNumber or ROWID
    const byNum = await catalystClient.find<InvoiceRecord>("Invoices", orgId ? { invoiceNumber: invoiceId, organizationId: orgId } : { invoiceNumber: invoiceId });
    if (byNum.length > 0) return byNum[0];

    const byRow = await catalystClient.find<InvoiceRecord>("Invoices", orgId ? { ROWID: invoiceId, organizationId: orgId } : { ROWID: invoiceId });
    return byRow.length > 0 ? byRow[0] : null;
  }

  static async findByStripeId(stripeInvoiceId: string): Promise<InvoiceRecord | null> {
    const invs = await catalystClient.find<InvoiceRecord>("Invoices", { stripeInvoiceId });
    return invs.length > 0 ? invs[0] : null;
  }

  static async create(data: Omit<InvoiceRecord, "ROWID" | "createdAt">): Promise<InvoiceRecord> {
    const invoiceId = data.invoiceId || `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    return catalystClient.insertRow<InvoiceRecord>("Invoices", { ...data, invoiceId });
  }

  static async update(invoiceId: string, orgId: string, data: Partial<InvoiceRecord>): Promise<InvoiceRecord> {
    return catalystClient.updateRow<InvoiceRecord>("Invoices", invoiceId, data);
  }
}
