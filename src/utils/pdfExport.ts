import jsPDF from 'jspdf';
import type { InvestmentData, XIRRResult } from '../types/investment';
import { EXIT_STRATEGIES } from '../types/exitStrategies';

interface PDFExportOptions {
  data: InvestmentData;
  result: XIRRResult;
  currency: string;
  symbol: string;
  formatDisplay: (idr: number) => string;
  formatAbbrev: (idr: number) => string;
  rate: number;
}

// Color palette matching the website
const COLORS = {
  background: [17, 34, 23] as [number, number, number],
  surface: [16, 34, 22] as [number, number, number],
  surfaceDark: [25, 51, 34] as [number, number, number],
  border: [50, 103, 68] as [number, number, number],
  primary: [19, 236, 91] as [number, number, number],
  textPrimary: [255, 255, 255] as [number, number, number],
  textSecondary: [146, 201, 164] as [number, number, number],
  cyan: [34, 211, 238] as [number, number, number],
  purple: [167, 139, 250] as [number, number, number],
  amber: [251, 191, 36] as [number, number, number],
  red: [248, 113, 113] as [number, number, number],
  green: [74, 222, 128] as [number, number, number],
};

const STRATEGY_COLORS = {
  'flip': COLORS.cyan,
  'rent-resell': COLORS.purple,
  'milk-cow': COLORS.amber,
};

// Helper to truncate text to fit width
function truncateText(doc: jsPDF, text: string, maxWidth: number): string {
  if (doc.getTextWidth(text) <= maxWidth) return text;
  let truncated = text;
  while (doc.getTextWidth(truncated + '...') > maxWidth && truncated.length > 0) {
    truncated = truncated.slice(0, -1);
  }
  return truncated + '...';
}

export function generatePDFReport(options: PDFExportOptions): void {
  const { data, result, currency, symbol, formatDisplay, formatAbbrev, rate } = options;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let yPos = 0;

  // Fill entire page with dark background
  doc.setFillColor(...COLORS.background);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Header bar
  doc.setFillColor(...COLORS.surface);
  doc.rect(0, 0, pageWidth, 22, 'F');
  doc.setDrawColor(...COLORS.border);
  doc.line(0, 22, pageWidth, 22);

  // Logo
  doc.setFillColor(COLORS.primary[0] * 0.3, COLORS.primary[1] * 0.3, COLORS.primary[2] * 0.3);
  doc.roundedRect(margin, 5, 12, 12, 2, 2, 'F');
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('XIRR', margin + 6, 12.5, { align: 'center' });

  // Title
  doc.setTextColor(...COLORS.textPrimary);
  doc.setFontSize(12);
  doc.text('BaliInvest XIRR', margin + 16, 12);

  // Date
  doc.setTextColor(...COLORS.textSecondary);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(
    new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    pageWidth - margin,
    12,
    { align: 'right' }
  );

  yPos = 30;

  // Main title
  doc.setTextColor(...COLORS.textPrimary);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Investment Report', margin, yPos);
  yPos += 6;

  doc.setTextColor(...COLORS.textSecondary);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(truncateText(doc, data.property.projectName, contentWidth), margin, yPos);
  yPos += 8;

  // XIRR Result Card
  const xirrCardHeight = 32;
  doc.setFillColor(...COLORS.surface);
  doc.roundedRect(margin, yPos, contentWidth, xirrCardHeight, 2, 2, 'F');
  doc.setDrawColor(...COLORS.border);
  doc.roundedRect(margin, yPos, contentWidth, xirrCardHeight, 2, 2, 'S');

  const xirrPercent = (result.rate * 100).toFixed(1);
  const isPositive = result.rate >= 0;

  // Left section - XIRR
  doc.setTextColor(...COLORS.textSecondary);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Estimated XIRR', margin + 8, yPos + 10);

  doc.setTextColor(...(isPositive ? COLORS.primary : COLORS.red));
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(`${xirrPercent}%`, margin + 8, yPos + 22);

  doc.setTextColor(...(isPositive ? COLORS.primary : COLORS.red));
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Annualized', margin + 8, yPos + 27);

  // Right section - metrics in row
  const metricWidth = 42;
  const metricStartX = margin + 70;

  // Total Invested
  doc.setTextColor(...COLORS.textSecondary);
  doc.setFontSize(7);
  doc.text('Total Invested', metricStartX, yPos + 10);
  doc.setTextColor(...COLORS.textPrimary);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`${formatAbbrev(result.totalInvested)} ${currency}`, metricStartX, yPos + 18);

  // Net Profit
  doc.setTextColor(...COLORS.textSecondary);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Net Profit', metricStartX + metricWidth, yPos + 10);
  doc.setTextColor(...(result.netProfit >= 0 ? COLORS.primary : COLORS.red));
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`${result.netProfit >= 0 ? '+' : ''}${formatAbbrev(result.netProfit)} ${currency}`, metricStartX + metricWidth, yPos + 18);

  // Investment Period
  doc.setTextColor(...COLORS.textSecondary);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Investment Period', metricStartX + metricWidth * 2, yPos + 10);
  doc.setTextColor(...COLORS.textPrimary);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`${result.holdPeriodMonths} Months`, metricStartX + metricWidth * 2, yPos + 18);

  yPos += xirrCardHeight + 6;

  // Two column layout
  const colWidth = (contentWidth - 6) / 2;
  const leftColX = margin;
  const rightColX = margin + colWidth + 6;

  // Property Details Card
  const propCardHeight = 52;
  doc.setFillColor(...COLORS.surface);
  doc.roundedRect(leftColX, yPos, colWidth, propCardHeight, 2, 2, 'F');
  doc.setDrawColor(...COLORS.border);
  doc.roundedRect(leftColX, yPos, colWidth, propCardHeight, 2, 2, 'S');

  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Property Details', leftColX + 6, yPos + 10);

  const propLabelX = leftColX + 6;
  const propValueY1 = yPos + 18;
  const propValueY2 = yPos + 32;
  const propValueY3 = yPos + 46;
  const propMaxWidth = colWidth - 12;

  doc.setTextColor(...COLORS.textSecondary);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Project', propLabelX, propValueY1);
  doc.setTextColor(...COLORS.textPrimary);
  doc.setFontSize(8);
  doc.text(truncateText(doc, data.property.projectName, propMaxWidth), propLabelX, propValueY1 + 5);

  doc.setTextColor(...COLORS.textSecondary);
  doc.setFontSize(7);
  doc.text('Location', propLabelX, propValueY2);
  doc.setTextColor(...COLORS.textPrimary);
  doc.setFontSize(8);
  doc.text(truncateText(doc, data.property.location, propMaxWidth), propLabelX, propValueY2 + 5);

  doc.setTextColor(...COLORS.textSecondary);
  doc.setFontSize(7);
  doc.text('Total Price', propLabelX, propValueY3);
  doc.setTextColor(...COLORS.textPrimary);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(`${symbol}${formatDisplay(data.property.totalPrice)}`, propLabelX, propValueY3 + 5);

  // Handover on right side of property card
  doc.setTextColor(...COLORS.textSecondary);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Handover', propLabelX + propMaxWidth / 2 + 10, propValueY3);
  doc.setTextColor(...COLORS.textPrimary);
  doc.setFontSize(8);
  doc.text(new Date(data.property.handoverDate).toLocaleDateString(), propLabelX + propMaxWidth / 2 + 10, propValueY3 + 5);

  // Payment Terms Card
  doc.setFillColor(...COLORS.surface);
  doc.roundedRect(rightColX, yPos, colWidth, propCardHeight, 2, 2, 'F');
  doc.setDrawColor(...COLORS.border);
  doc.roundedRect(rightColX, yPos, colWidth, propCardHeight, 2, 2, 'S');

  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Terms', rightColX + 6, yPos + 10);

  const downPayment = data.property.totalPrice * (data.payment.downPaymentPercent / 100);
  const remaining = data.property.totalPrice - downPayment;

  doc.setTextColor(...COLORS.textSecondary);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');

  if (data.payment.type === 'full') {
    doc.text('Payment Type', rightColX + 6, propValueY1);
    doc.setTextColor(...COLORS.textPrimary);
    doc.setFontSize(8);
    doc.text('Full Payment (100%)', rightColX + 6, propValueY1 + 5);
  } else {
    doc.text('Down Payment', rightColX + 6, propValueY1);
    doc.setTextColor(...COLORS.textPrimary);
    doc.setFontSize(8);
    doc.text(`${data.payment.downPaymentPercent}% (${symbol}${formatDisplay(downPayment)})`, rightColX + 6, propValueY1 + 5);

    doc.setTextColor(...COLORS.textSecondary);
    doc.setFontSize(7);
    doc.text('Installments', rightColX + 6, propValueY2);
    doc.setTextColor(...COLORS.textPrimary);
    doc.setFontSize(8);
    const monthlyPayment = remaining / data.payment.installmentMonths;
    doc.text(`${data.payment.installmentMonths}x ${symbol}${formatDisplay(monthlyPayment)}`, rightColX + 6, propValueY2 + 5);
  }

  if (currency !== 'IDR') {
    doc.setTextColor(...COLORS.textSecondary);
    doc.setFontSize(6);
    doc.text(`Exchange: 1 ${currency} = ${rate.toLocaleString()} IDR`, rightColX + 6, propValueY3 + 5);
  }

  yPos += propCardHeight + 6;

  // Exit Strategy Card
  const strategy = EXIT_STRATEGIES.find(s => s.id === data.exit.strategyType);
  const strategyColor = STRATEGY_COLORS[data.exit.strategyType] || COLORS.primary;
  const exitCardHeight = 42;

  doc.setFillColor(...COLORS.surface);
  doc.roundedRect(margin, yPos, contentWidth, exitCardHeight, 2, 2, 'F');
  doc.setDrawColor(...COLORS.border);
  doc.roundedRect(margin, yPos, contentWidth, exitCardHeight, 2, 2, 'S');

  // Strategy badge
  doc.setFillColor(strategyColor[0] * 0.3, strategyColor[1] * 0.3, strategyColor[2] * 0.3);
  doc.setFontSize(7);
  const badgeText = strategy?.name || 'Exit Strategy';
  const badgeWidth = doc.getTextWidth(badgeText) + 6;
  doc.roundedRect(margin + 6, yPos + 5, badgeWidth, 8, 1.5, 1.5, 'F');
  doc.setTextColor(...strategyColor);
  doc.setFont('helvetica', 'bold');
  doc.text(badgeText, margin + 9, yPos + 10.5);

  // Exit details - 4 columns
  const appreciation = ((data.exit.projectedSalesPrice - data.property.totalPrice) / data.property.totalPrice) * 100;
  const closingCosts = data.exit.projectedSalesPrice * (data.exit.closingCostPercent / 100);

  const exitColWidth = contentWidth / 4;
  const exitRow1Y = yPos + 22;
  const exitRow2Y = yPos + 30;

  // Sale Price
  doc.setTextColor(...COLORS.textSecondary);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Sale Price', margin + 6, exitRow1Y);
  doc.setTextColor(...COLORS.textPrimary);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`${symbol}${formatDisplay(data.exit.projectedSalesPrice)}`, margin + 6, exitRow2Y);

  // Appreciation
  doc.setTextColor(...COLORS.textSecondary);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Appreciation', margin + exitColWidth, exitRow1Y);
  doc.setTextColor(...(appreciation >= 0 ? COLORS.green : COLORS.red));
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`${appreciation >= 0 ? '+' : ''}${appreciation.toFixed(1)}%`, margin + exitColWidth, exitRow2Y);

  // Sale Date
  doc.setTextColor(...COLORS.textSecondary);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Sale Date', margin + exitColWidth * 2, exitRow1Y);
  doc.setTextColor(...COLORS.textPrimary);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(new Date(data.exit.saleDate).toLocaleDateString(), margin + exitColWidth * 2, exitRow2Y);

  // Closing Costs
  doc.setTextColor(...COLORS.textSecondary);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(`Closing (${data.exit.closingCostPercent}%)`, margin + exitColWidth * 3, exitRow1Y);
  doc.setTextColor(...COLORS.textPrimary);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`${symbol}${formatDisplay(closingCosts)}`, margin + exitColWidth * 3, exitRow2Y);

  yPos += exitCardHeight + 6;

  // Additional Cash Flows
  if (data.additionalCashFlows.length > 0) {
    const cfRowHeight = 10;
    const cfHeaderHeight = 16;
    const cfCardHeight = cfHeaderHeight + data.additionalCashFlows.length * cfRowHeight + 4;

    doc.setFillColor(...COLORS.surface);
    doc.roundedRect(margin, yPos, contentWidth, cfCardHeight, 2, 2, 'F');
    doc.setDrawColor(...COLORS.border);
    doc.roundedRect(margin, yPos, contentWidth, cfCardHeight, 2, 2, 'S');

    doc.setTextColor(...COLORS.primary);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Additional Cash Flows', margin + 6, yPos + 10);

    let cfY = yPos + cfHeaderHeight + 4;
    data.additionalCashFlows.forEach(cf => {
      const isInflow = cf.type === 'inflow';

      doc.setTextColor(...COLORS.textSecondary);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text(new Date(cf.date).toLocaleDateString(), margin + 6, cfY);

      doc.setTextColor(...COLORS.textPrimary);
      doc.setFontSize(8);
      doc.text(truncateText(doc, cf.description, 80), margin + 35, cfY);

      doc.setTextColor(...(isInflow ? COLORS.green : COLORS.red));
      doc.setFont('helvetica', 'bold');
      const sign = isInflow ? '+' : '-';
      doc.text(`${sign}${symbol}${formatDisplay(cf.amount)}`, pageWidth - margin - 6, cfY, { align: 'right' });

      cfY += cfRowHeight;
    });

    yPos += cfCardHeight + 6;
  }

  // Footer
  doc.setDrawColor(...COLORS.border);
  doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

  doc.setTextColor(...COLORS.textSecondary);
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.text('Generated by BaliInvest XIRR Calculator', margin, pageHeight - 8);
  doc.text('XIRR uses irregular cash flow intervals for accurate annualized returns', pageWidth - margin, pageHeight - 8, { align: 'right' });

  // Save
  const fileName = `BaliInvest_${data.property.projectName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
