'use client';

import React, { createContext, useContext, useState } from 'react';

interface PlanningContextType {
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const PlanningContext = createContext<PlanningContextType | null>(null);

export function usePlanningContext() {
  const context = useContext(PlanningContext);
  if (!context) throw new Error('usePlanningContext must be used within PlanningProvider');
  return context;
}

export function PlanningProvider({ children }: { children: React.ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <PlanningContext.Provider value={{ isModalOpen, setIsModalOpen }}>
      {children}
    </PlanningContext.Provider>
  );
}
