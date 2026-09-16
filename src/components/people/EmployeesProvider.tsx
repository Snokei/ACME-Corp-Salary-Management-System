'use client';

import React, { createContext, useContext, useState } from 'react';
import { Employee } from '@/types';
import { useRouter } from 'next/navigation';

interface EmployeesModalState {
  type: 'add' | 'edit' | 'view' | null;
  employee: Employee | null;
}

interface EmployeesContextType {
  modalState: EmployeesModalState;
  setModalState: React.Dispatch<React.SetStateAction<EmployeesModalState>>;
  checkedIds: Set<string>;
  setCheckedIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  filteredEmployeesRef: React.MutableRefObject<Employee[]>; // To allow bulk operations to access the current dataset
}

const EmployeesContext = createContext<EmployeesContextType | null>(null);

export function useEmployeesContext() {
  const context = useContext(EmployeesContext);
  if (!context) throw new Error('useEmployeesContext must be used within EmployeesProvider');
  return context;
}

export function EmployeesProvider({ children }: { children: React.ReactNode }) {
  const [modalState, setModalState] = useState<EmployeesModalState>({ type: null, employee: null });
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const filteredEmployeesRef = React.useRef<Employee[]>([]);

  return (
    <EmployeesContext.Provider value={{ modalState, setModalState, checkedIds, setCheckedIds, filteredEmployeesRef }}>
      {children}
    </EmployeesContext.Provider>
  );
}
