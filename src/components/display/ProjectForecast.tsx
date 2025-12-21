import type { XIRRResult } from '../../types/investment';

interface Props {
  result: XIRRResult;
  currency: string;
  formatAbbrev: (idr: number) => string;
  onExportPDF?: () => void;
}

export function ProjectForecast({ result, currency, formatAbbrev, onExportPDF }: Props) {
  const xirrPercent = (result.rate * 100).toFixed(1);
  const isPositive = result.rate >= 0;

  return (
    <div className="sticky top-28 flex flex-col gap-6">
      {/* Main Card */}
      <div className="rounded-xl border border-border-dark bg-[#102216] p-6 shadow-xl">
        <h3 className="mb-4 text-lg font-bold text-white">Project Forecast</h3>
        
        {/* XIRR Display */}
        <div className="mb-6 rounded-lg bg-surface-dark p-4 text-center border border-border-dark">
          <p className="text-sm text-text-secondary mb-1">Estimated XIRR</p>
          <div className="flex items-end justify-center gap-2">
            <span className={`text-4xl font-black ${isPositive ? 'text-primary' : 'text-red-400'}`}>
              {xirrPercent}%
            </span>
            <span className={`text-xs mb-1.5 flex items-center ${isPositive ? 'text-primary' : 'text-red-400'}`}>
              <span className="material-symbols-outlined text-sm">
                {isPositive ? 'trending_up' : 'trending_down'}
              </span>
              Annualized
            </span>
          </div>
        </div>

        {/* Metrics */}
        <div className="space-y-4">
          <div className="flex justify-between border-b border-border-dark/50 pb-2">
            <span className="text-sm text-text-secondary">Total Invested</span>
            <span className="text-sm font-mono text-white">
              {formatAbbrev(result.totalInvested)} {currency}
            </span>
          </div>
          <div className="flex justify-between border-b border-border-dark/50 pb-2">
            <span className="text-sm text-text-secondary">Net Profit</span>
            <span className={`text-sm font-mono ${result.netProfit >= 0 ? 'text-primary' : 'text-red-400'}`}>
              {result.netProfit >= 0 ? '+' : ''}{formatAbbrev(result.netProfit)} {currency}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-text-secondary">Investment Period</span>
            <span className="text-sm text-white">{result.holdPeriodMonths} Months</span>
          </div>
        </div>

        {/* Export Button */}
        <div className="mt-6">
          <button
            onClick={onExportPDF}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-3 text-[#112217] font-bold hover:bg-[#10d652] transition-colors"
          >
            <span className="material-symbols-outlined">picture_as_pdf</span>
            Export PDF Report
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="rounded-lg bg-surface-dark/50 p-4 border border-border-dark/50">
        <div className="flex gap-3">
          <span className="material-symbols-outlined text-text-secondary">info</span>
          <p className="text-xs text-text-secondary">
            XIRR calculation uses irregular intervals. All values stored in IDR internally.
          </p>
        </div>
      </div>
    </div>
  );
}
