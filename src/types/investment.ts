export interface PropertyDetails {
  projectName: string;
  location: string;
  totalPrice: number;
  handoverDate: string;
  currency: 'IDR' | 'USD' | 'AUD' | 'EUR';
}

export interface PaymentTerms {
  type: 'full' | 'plan';
  downPaymentPercent: number;
  installmentMonths: number;
}

export interface ExitStrategy {
  projectedSalesPrice: number;
  closingCostPercent: number;
}

export interface CashFlowEntry {
  id: string;
  date: string;
  description: string;
  type: 'inflow' | 'outflow';
  amount: number;
}

export interface InvestmentData {
  property: PropertyDetails;
  payment: PaymentTerms;
  exit: ExitStrategy;
  additionalCashFlows: CashFlowEntry[];
}

export interface XIRRResult {
  rate: number;
  totalInvested: number;
  netProfit: number;
  holdPeriodMonths: number;
}

export interface CashFlow {
  date: Date;
  amount: number;
}
