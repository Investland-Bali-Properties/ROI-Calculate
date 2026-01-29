import { useState, useCallback, Suspense } from 'react';
import { Header, Footer } from './components';
import { CalculatorSelector } from './components/CalculatorSelector';
import { CALCULATORS, getCalculatorById } from './calculators/registry';
import { WelcomePopup } from './components/ui/WelcomePopup';
import { AuthModal, type AuthMode } from './components/ui/AuthModal';

const ACTIVE_CALCULATOR_KEY = 'baliinvest_active_calculator';

function App() {
  const [activeCalculatorId, setActiveCalculatorId] = useState<string>(() => {
    const saved = localStorage.getItem(ACTIVE_CALCULATOR_KEY);
    return saved && getCalculatorById(saved) ? saved : 'xirr';
  });

  // Auth modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthMode>('signup');

  const handleCalculatorChange = useCallback((id: string) => {
    setActiveCalculatorId(id);
    localStorage.setItem(ACTIVE_CALCULATOR_KEY, id);
  }, []);

  const openAuthModal = useCallback((mode: AuthMode) => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  }, []);

  const activeCalculator = getCalculatorById(activeCalculatorId);
  const ActiveComponent = activeCalculator?.component;

  return (
    <div className="bg-background text-text-primary font-display min-h-screen flex flex-col">
      {/* Sticky header section */}
      <div className="sticky top-0 z-50 bg-white shadow-sm">
        <Header />
        <CalculatorSelector
          calculators={CALCULATORS}
          activeId={activeCalculatorId}
          onSelect={handleCalculatorChange}
        />
      </div>

      <main className="flex-grow w-full px-4 py-8 md:px-10 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-text-secondary">Loading calculator...</p>
                </div>
              </div>
            }
          >
            {ActiveComponent && <ActiveComponent />}
          </Suspense>
        </div>
      </main>

      <Footer onSelectCalculator={handleCalculatorChange} />

      {/* Welcome Popup - shows after 3s for first-time visitors */}
      <WelcomePopup
        onJoinWaitlist={() => openAuthModal('waitlist')}
        onSignUp={() => openAuthModal('signup')}
        onLogin={() => openAuthModal('login')}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </div>
  );
}

export default App;
