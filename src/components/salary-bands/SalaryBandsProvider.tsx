'use client';

import React, { createContext, useContext, useState } from 'react';
import { SalaryBandData } from '@/lib/compaRatioService';
import { SalaryBandsModal } from '@/components/salary-bands/SalaryBandsModal';
import { useRouter } from 'next/navigation';

interface SalaryBandsModalState {
  isOpen: boolean;
  band: SalaryBandData | null;
}

interface SalaryBandsContextType {
  modalState: SalaryBandsModalState;
  setModalState: React.Dispatch<React.SetStateAction<SalaryBandsModalState>>;
}

const SalaryBandsContext = createContext<SalaryBandsContextType | null>(null);

export function useSalaryBands() {
  const context = useContext(SalaryBandsContext);
  if (!context) {
    throw new Error('useSalaryBands must be used within a SalaryBandsProvider');
  }
  return context;
}

export function SalaryBandsProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [modalState, setModalState] = useState<SalaryBandsModalState>({
    isOpen: false,
    band: null,
  });

  const handleSuccess = () => {
    router.refresh();
  };

  return (
    <SalaryBandsContext.Provider value={{ modalState, setModalState }}>
      {children}
      
      {/* Centralized Modal */}
      <SalaryBandsModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, band: null })}
        band={modalState.band}
        onSuccess={handleSuccess}
      />
    </SalaryBandsContext.Provider>
  );
}
