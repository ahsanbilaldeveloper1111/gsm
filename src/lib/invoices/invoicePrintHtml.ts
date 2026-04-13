import type { Invoice } from "@/models/Invoice";
import { showAppToast } from "@/lib/toast/appToast";

import { formatInvoiceDetailDate } from "./invoiceDetailDisplay";

const PRINT_STYLES = `body { font-family: Arial, sans-serif; margin: 20px; color: #333; line-height: 1.4; }
.header { display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 2px solid #007bff; padding-bottom: 20px; }
.company-info h2 { margin: 0; color: #333; font-size: 24px; }
.company-info p, .company-address p { margin: 5px 0; color: #666; }
.company-address strong { color: #495057; }
.invoice-info { text-align: right; }
.invoice-info h2 { margin: 0; color: #333; font-size: 24px; }
.invoice-info p { margin: 5px 0; color: #666; }
.invoice-details { margin: 20px 0; }
.invoice-details table { width: 100%; border-collapse: collapse; margin: 20px 0; }
.invoice-details th, .invoice-details td { border: 1px solid #ddd; padding: 12px 8px; text-align: left; }
.invoice-details th { background-color: #f8f9fa; font-weight: bold; color: #495057; }
.invoice-details tr:nth-child(even) { background-color: #f8f9fa; }
.totals { margin-top: 20px; text-align: right; }
.totals table { margin-left: auto; width: 300px; border-collapse: collapse; }
.totals td { padding: 8px 12px; border: 1px solid #ddd; }
.totals tr:first-child td { border-top: 2px solid #007bff; }
.total-row { font-weight: bold; font-size: 1.2em; background-color: #e9ecef; }
.notes { margin-top: 30px; padding: 15px; background-color: #f8f9fa; border-left: 4px solid #007bff; }
.notes h4 { margin-top: 0; color: #007bff; }
.footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #dee2e6; display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
.footer-section h4 { margin: 0 0 10px 0; color: #495057; font-size: 16px; }
.footer-section p { margin: 5px 0; color: #666; font-size: 14px; }
.footer-section .contact-info { line-height: 1.6; }
@media print { body { margin: 0; } .no-print { display: none; } .footer { page-break-inside: avoid; } }`;

function getPrintHeaderCompanyBlock(
  fromProfile: { address?: string; country?: string; tax_id?: string } | null | undefined,
  company: { email?: string; phone?: string; country?: string; tax_number?: string } | null | undefined,
): string {
  const parts: string[] = [];
  if (fromProfile?.address)
    parts.push(`<p><strong>Address:</strong><br>${fromProfile.address}</p>`);
  if (company?.email) parts.push(`<p><strong>Email:</strong> ${company.email}</p>`);
  if (company?.phone) parts.push(`<p><strong>Phone:</strong> ${company.phone}</p>`);
  const country = fromProfile?.country || company?.country;
  if (country) parts.push(`<p><strong>Country:</strong> ${country}</p>`);
  const taxId = fromProfile?.tax_id || company?.tax_number;
  if (taxId) parts.push(`<p><strong>Tax ID:</strong> ${taxId}</p>`);
  if (parts.length === 0) return "";
  return `<div class="company-address">${parts.join("")}</div>`;
}

function getPrintHeaderInvoiceBlock(
  inv: Invoice,
  billToDisplay: string,
  billToName?: string,
): string {
  const billTo = billToName
    ? `<p style="margin-bottom: 12px;"><strong>Bill To:</strong><br>${billToDisplay}</p>`
    : "";
  const recurring = inv.is_recurring
    ? `<p><strong>Recurring:</strong> ${inv.recurring_frequency ?? "Monthly"}</p>`
    : "";
  return `${billTo}
        <h2>Invoice #${inv.invoice_number}</h2>
        <p><strong>Date:</strong> ${formatInvoiceDetailDate(inv.invoice_date)}</p>
        <p><strong>Due:</strong> ${formatInvoiceDetailDate(inv.due_date)}</p>
        <p><strong>Status:</strong> ${inv.status}</p>
        <p><strong>Payment Mode:</strong> ${inv.payment_mode}</p>
        ${recurring}`;
}

function getPrintItemRow(
  item: NonNullable<Invoice["items"]>[number],
  index: number,
  currencyCode: string,
): string {
  const productName = item?.product?.name ? item.product.name : "Product";
  const itemDescription = item.description || item.product?.description || "";
  const unitPrice =
    typeof item?.unit_price === "number"
      ? item.unit_price
      : Number.parseFloat(String(item?.unit_price)) || 0;
  const quantity =
    typeof item?.quantity === "number"
      ? item.quantity
      : Number.parseFloat(String(item?.quantity)) || 0;
  const lineTotal = unitPrice * quantity;
  const taxRate =
    typeof item?.tax_rate === "number"
      ? item.tax_rate
      : Number.parseFloat(String(item?.tax_rate ?? 0)) || 0;
  const useComputedTax =
    typeof item?.tax_amount !== "number" || item.tax_amount == null;
  const itemTaxAmount = useComputedTax
    ? (lineTotal * taxRate) / 100
    : (item.tax_amount ?? 0);
  const totalPrice = lineTotal + itemTaxAmount;
  const descSuffix = itemDescription
    ? `<br><small style="color: #6c757d;">${itemDescription}</small>`
    : "";
  return `<tr><td>${index + 1}</td><td>${productName}${descSuffix}</td><td style="text-align: right;">${quantity}</td><td style="text-align: right;">${unitPrice.toFixed(2)} ${currencyCode}</td><td style="text-align: right;">${itemTaxAmount.toFixed(2)} ${currencyCode}</td><td style="text-align: right;"><strong>${lineTotal.toFixed(2)} ${currencyCode}</strong></td><td style="text-align: right;"><strong>${totalPrice.toFixed(2)} ${currencyCode}</strong></td></tr>`;
}

function getPrintItemsRows(items: NonNullable<Invoice["items"]>, currencyCode: string): string {
  if (!items?.length)
    return '<tr><td colspan="7" style="text-align: center; padding: 20px;">No items found</td></tr>';
  return items.map((item, index) => getPrintItemRow(item, index, currencyCode)).join("");
}

function getPrintTotalsRows(
  inv: Invoice,
  subtotal: number,
  taxAmount: number,
  totalAmount: number,
  paidAmount: number,
  outstandingAmount: number,
): string {
  const taxPct =
    subtotal > 0 ? ((taxAmount / subtotal) * 100).toFixed(1) : "0.0";
  let rows = `<tr><td><strong>Subtotal:</strong></td><td><strong>${subtotal.toFixed(2)} ${inv.currency_code}</strong></td></tr>
        <tr><td><strong>Tax (${taxPct}%):</strong></td><td><strong>${taxAmount.toFixed(2)} ${inv.currency_code}</strong></td></tr>
        <tr class="total-row"><td><strong>Total Amount:</strong></td><td><strong>${totalAmount.toFixed(2)} ${inv.currency_code}</strong></td></tr>`;
  if (paidAmount > 0)
    rows += `<tr><td><strong>Paid Amount:</strong></td><td><strong style="color: #28a745;">${paidAmount.toFixed(2)} ${inv.currency_code}</strong></td></tr>`;
  if (outstandingAmount > 0)
    rows += `<tr style="background-color: #fff3cd;"><td><strong>Outstanding:</strong></td><td><strong style="color: #856404;">${outstandingAmount.toFixed(2)} ${inv.currency_code}</strong></td></tr>`;
  return rows;
}

function getPrintFooterCompanyBlock(
  company: {
    email?: string;
    phone?: string | number;
    country?: string;
    tax_number?: string;
    tax_rate?: number;
  } | null | undefined,
  sellerNameStr: string,
): string {
  if (!company) return "<p>Company information not available</p>";
  const parts = [`<p><strong>${sellerNameStr}</strong></p>`];
  if (company.email) parts.push(`<p>Email: ${company.email}</p>`);
  if (company.phone != null && company.phone !== "")
    parts.push(`<p>Phone: ${String(company.phone)}</p>`);
  if (company.country) parts.push(`<p>Country: ${company.country}</p>`);
  if (company.tax_number) parts.push(`<p>Tax ID: ${company.tax_number}</p>`);
  if (company.tax_rate != null)
    parts.push(`<p>Tax Rate: ${company.tax_rate}%</p>`);
  return parts.join("");
}

function getPrintFooterInvoiceBlock(inv: Invoice, sellerNameStr: string): string {
  const po = inv.po_number
    ? `<p><strong>PO Number:</strong> ${inv.po_number}</p>`
    : "";
  const recurring = inv.is_recurring
    ? `<p><strong>Recurring:</strong> ${inv.recurring_frequency ?? "Monthly"}</p>`
    : "";
  return `<p><strong>Invoice #:</strong> ${inv.invoice_number}</p>
          ${po}
          <p><strong>Date:</strong> ${formatInvoiceDetailDate(inv.invoice_date)}</p>
          <p><strong>Due Date:</strong> ${formatInvoiceDetailDate(inv.due_date)}</p>
          <p><strong>Status:</strong> ${inv.status}</p>
          <p><strong>Currency:</strong> ${inv.currency_code}</p>
          ${recurring}
          <p><strong>Cheque in favor of:</strong> ${sellerNameStr}</p>`;
}

export function generatePrintContent(
  inv: Invoice,
  sellerNameForPrint?: string,
  billToName?: string,
): string {
  const company = inv.company ?? null;
  const vendor = company?.vendor ?? null;
  const items = inv.items ?? [];
  const sellerNameStr =
    sellerNameForPrint ?? (vendor?.name ?? company?.name ?? "N/A");
  const billToDisplay =
    billToName ??
    (inv.customer?.name ??
      inv.customer?.email ??
      company?.name ??
      "N/A");
  const sellerProfile = vendor?.profile;
  const subtotal =
    typeof inv.subtotal === "number"
      ? inv.subtotal
      : Number.parseFloat(String(inv.subtotal)) || 0;
  const taxAmount =
    typeof inv.tax_amount === "number"
      ? inv.tax_amount
      : Number.parseFloat(String(inv.tax_amount)) || 0;
  const totalAmount =
    typeof inv.total_amount === "number"
      ? inv.total_amount
      : Number.parseFloat(String(inv.total_amount)) || 0;
  const paidAmount = inv.paid_amount ?? 0;
  const outstandingAmount = inv.amount_due ?? totalAmount;

  const companyAddressBlock =
    vendor || sellerProfile
      ? getPrintHeaderCompanyBlock(sellerProfile, vendor)
      : "";
  const invoiceInfoBlock = getPrintHeaderInvoiceBlock(
    inv,
    billToDisplay,
    billToName,
  );
  const itemsRows = getPrintItemsRows(items, inv.currency_code);
  const totalsRows = getPrintTotalsRows(
    inv,
    subtotal,
    taxAmount,
    totalAmount,
    paidAmount,
    outstandingAmount,
  );
  const footerCompanyBlock = getPrintFooterCompanyBlock(
    vendor ?? company,
    sellerNameStr,
  );
  const footerInvoiceBlock = getPrintFooterInvoiceBlock(inv, sellerNameStr);

  return `<!DOCTYPE html>
  <html>
  <head>
    <title>Invoice #${inv.invoice_number}</title>
    <style>${PRINT_STYLES}</style>
  </head>
  <body>
    <div class="header">
      <div class="company-info">
        <h2>${sellerNameStr}</h2>
        ${companyAddressBlock}
      </div>
      <div class="invoice-info">
        ${invoiceInfoBlock}
      </div>
    </div>
    <div class="invoice-details">
      <table>
        <thead>
          <tr><th>#</th><th>Description</th><th>Qty</th><th>Unit Price</th><th>Tax</th><th>Amount</th><th>Total Price</th></tr>
        </thead>
        <tbody>${itemsRows}</tbody>
      </table>
    </div>
    <div class="totals">
      <table>${totalsRows}</table>
    </div>
    <div class="footer">
      <div class="footer-section">
        <h4>Company Information</h4>
        <div class="contact-info">${footerCompanyBlock}</div>
      </div>
      <div class="footer-section">
        <h4>Invoice Details</h4>
        <div class="contact-info">${footerInvoiceBlock}</div>
      </div>
    </div>
  </body>
  </html>`;
}

export function executePrint(printContent: string): void {
  const blob = new Blob([printContent], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(
    url,
    "_blank",
    "width=800,height=600,scrollbars=yes,resizable=yes",
  );
  if (printWindow) {
    printWindow.onload = () => {
      try {
        URL.revokeObjectURL(url);
        printWindow.focus();
        printWindow.print();
        setTimeout(() => {
          if (!printWindow.closed) printWindow.close();
        }, 1000);
        showAppToast("Print dialog opened", "success");
      } catch (printError) {
        console.error("Print error:", printError);
        showAppToast("Failed to trigger print dialog", "error");
      }
    };
    return;
  }
  URL.revokeObjectURL(url);
  const iframe = document.createElement("iframe");
  iframe.style.position = "absolute";
  iframe.style.left = "-9999px";
  iframe.style.top = "-9999px";
  iframe.style.width = "800px";
  iframe.style.height = "600px";
  document.body.appendChild(iframe);
  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (iframeDoc) {
    iframe.srcdoc = printContent;
    iframe.onload = () => {
      try {
        iframe.contentWindow?.print();
        showAppToast("Print dialog opened", "success");
      } catch (printError) {
        console.error("Print error:", printError);
        showAppToast("Failed to trigger print dialog", "error");
      }
      setTimeout(() => iframe.remove(), 2000);
    };
    return;
  }
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = printContent;
  tempDiv.style.position = "absolute";
  tempDiv.style.left = "-9999px";
  tempDiv.style.top = "-9999px";
  tempDiv.style.width = "800px";
  document.body.appendChild(tempDiv);
  try {
    globalThis.print();
    showAppToast("Print dialog opened", "success");
  } catch (printError) {
    console.error("Print error:", printError);
    showAppToast(
      "Print blocked. Use Ctrl+P (Windows) or Cmd+P (Mac) to print this page",
      "error",
    );
  }
  setTimeout(() => {
    if (document.body.contains(tempDiv)) tempDiv.remove();
  }, 1000);
}
