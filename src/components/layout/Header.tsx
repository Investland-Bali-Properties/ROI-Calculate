interface HeaderProps {
  onSaveDraft?: () => void;
  onClearAll?: () => void;
  isSaving?: boolean;
  showClearConfirm?: boolean;
}

export function Header({ onSaveDraft, onClearAll, isSaving, showClearConfirm }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-surface/95 backdrop-blur-sm px-6 py-4 lg:px-10">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center size-8 rounded bg-primary-light text-primary">
            <span className="material-symbols-outlined text-2xl">ssid_chart</span>
          </div>
          <h2 className="text-text-primary text-lg font-bold leading-tight tracking-[-0.015em]">
            BaliInvest XIRR
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onClearAll}
            className={`hidden sm:flex items-center justify-center gap-2 overflow-hidden rounded-lg h-9 px-4 transition-colors text-sm font-medium ${
              showClearConfirm
                ? 'bg-negative border border-negative text-white animate-pulse'
                : 'bg-transparent border border-negative/30 text-negative hover:bg-negative-light'
            }`}
          >
            <span className="material-symbols-outlined text-sm">delete_forever</span>
            <span>{showClearConfirm ? 'Click to Confirm' : 'Clear All'}</span>
          </button>
          <button
            onClick={onSaveDraft}
            disabled={isSaving}
            className="hidden sm:flex items-center justify-center gap-2 overflow-hidden rounded-lg h-9 px-4 bg-transparent border border-primary text-primary hover:bg-primary-light transition-colors text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Draft</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
