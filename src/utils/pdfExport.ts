import jsPDF from 'jspdf';
import type { InvestmentData, XIRRResult } from '../types/investment';

interface PDFExportOptions {
  data: InvestmentData;
  result: XIRRResult;
  currency: string;
  symbol: string;
  formatDisplay: (idr: number) => string;
  formatAbbrev: (idr: number) => string;
  rate: number;
}

export function generatePDFReport(options: PDFExportOptions): void {
  const { data, result, currency, symbol, formatDisplay, formatAbbrev, rate } = options;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  let yPos = 20;

  // Helper to add text
  const addText = (text: string, size: number, style: 'normal' | 'bold' = 'normal', x = 20) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', style);
    doc.text(text, x, yPos);
    yPos += size * 0.5;
  };

  // Header
  doc.setFillColor(34, 197, 94); // Primary green
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(17, 34, 23); // Dark green text
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('BaliInvest XIRR Report', pageWidth / 2, 20, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), pageWidth / 2, 30, { align: 'center' });

  yPos = 55;
  doc.setTextColor(0, 0, 0);

  // Project Details Section
  addText('Project Details', 16, 'bold');
  yPos += 2;
  doc.setDrawColor(34, 197, 94);
  doc.line(20, yPos, pageWidth - 20, yPos);
  yPos += 8;

  addText(`Project Name: ${data.property.projectName}`, 11, 'normal');
  yPos += 2;
  addText(`Location: ${data.property.location}`, 11, 'normal');
  yPos += 2;
  addText(`Total Price: ${symbol}${formatDisplay(data.property.totalPrice)}`, 11, 'normal');
  yPos += 2;
  addText(`Handover Date: ${new Date(data.property.handoverDate).toLocaleDateString()}`, 11, 'normal');
  yPos += 2;

  if (currency !== 'IDR') {
    const idrValue = data.property.totalPrice;
    addText(`(IDR ${idrValue.toLocaleString()} at rate 1 ${currency} = ${rate.toLocaleString()} IDR)`, 9, 'normal');
    yPos += 2;
  }

  yPos += 6;

  // Payment Terms Section
  addText('Payment Terms', 16, 'bold');
  yPos += 2;
  doc.line(20, yPos, pageWidth - 20, yPos);
  yPos += 8;

  const downPayment = data.property.totalPrice * (data.payment.downPaymentPercent / 100);
  const remaining = data.property.totalPrice - downPayment;

  if (data.payment.type === 'full') {
    addText('Payment Type: Full Payment (100% upfront)', 11, 'normal');
    yPos += 2;
  } else {
    addText(`Down Payment: ${data.payment.downPaymentPercent}% (${symbol}${formatDisplay(downPayment)})`, 11, 'normal');
    yPos += 2;
    addText(`Installments: ${data.payment.installmentMonths} monthly payments of ${symbol}${formatDisplay(remaining / data.payment.installmentMonths)}`, 11, 'normal');
    yPos += 2;
  }

  yPos += 6;

  // Exit Strategy Section
  addText('Exit Strategy', 16, 'bold');
  yPos += 2;
  doc.line(20, yPos, pageWidth - 20, yPos);
  yPos += 8;

  const appreciation = ((data.exit.projectedSalesPrice - data.property.totalPrice) / data.property.totalPrice) * 100;
  const closingCosts = data.exit.projectedSalesPrice * (data.exit.closingCostPercent / 100);
  const netSaleProceeds = data.exit.projectedSalesPrice - closingCosts;

  addText(`Projected Sale Price: ${symbol}${formatDisplay(data.exit.projectedSalesPrice)}`, 11, 'normal');
  yPos += 2;
  addText(`Appreciation: ${appreciation >= 0 ? '+' : ''}${appreciation.toFixed(1)}%`, 11, 'normal');
  yPos += 2;
  addText(`Closing Costs: ${data.exit.closingCostPercent}% (${symbol}${formatDisplay(closingCosts)})`, 11, 'normal');
  yPos += 2;
  addText(`Net Proceeds: ${symbol}${formatDisplay(netSaleProceeds)}`, 11, 'bold');
  yPos += 2;

  yPos += 6;

  // Additional Cash Flows Section
  if (data.additionalCashFlows.length > 0) {
    addText('Additional Cash Flows', 16, 'bold');
    yPos += 2;
    doc.line(20, yPos, pageWidth - 20, yPos);
    yPos += 8;

    data.additionalCashFlows.forEach(cf => {
      const sign = cf.type === 'outflow' ? '-' : '+';
      const date = new Date(cf.date).toLocaleDateString();
      addText(`${date} - ${cf.description}: ${sign}${symbol}${formatDisplay(cf.amount)}`, 10, 'normal');
      yPos += 4;
    });

    yPos += 2;
  }

  // XIRR Results Section (highlighted)
  doc.setFillColor(240, 253, 244); // Light green background
  doc.rect(15, yPos - 5, pageWidth - 30, 55, 'F');
  doc.setDrawColor(34, 197, 94);
  doc.rect(15, yPos - 5, pageWidth - 30, 55, 'S');

  addText('Investment Return Analysis (XIRR)', 16, 'bold');
  yPos += 6;

  const xirrPercent = (result.rate * 100).toFixed(2);
  doc.setTextColor(34, 197, 94);
  addText(`Annual Return (XIRR): ${xirrPercent}%`, 14, 'bold');
  doc.setTextColor(0, 0, 0);
  yPos += 4;

  addText(`Total Invested: ${formatAbbrev(result.totalInvested)} ${currency}`, 11, 'normal');
  yPos += 4;

  const profitSign = result.netProfit >= 0 ? '+' : '';
  addText(`Net Profit: ${profitSign}${formatAbbrev(result.netProfit)} ${currency}`, 11, 'normal');
  yPos += 4;

  addText(`Hold Period: ${result.holdPeriodMonths} months`, 11, 'normal');
  yPos += 6;

  // Footer
  yPos += 10;
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('Generated by BaliInvest XIRR Calculator', pageWidth / 2, yPos, { align: 'center' });
  yPos += 4;
  doc.text('https://baliinvest-xirr.vercel.app', pageWidth / 2, yPos, { align: 'center' });
  yPos += 4;
  doc.text('Note: XIRR calculation uses irregular intervals. All values stored internally in IDR.', pageWidth / 2, yPos, { align: 'center' });

  // Save the PDF
  const fileName = `BaliInvest_XIRR_${data.property.projectName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
