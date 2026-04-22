import React, {createContext, useContext} from 'react';
import {useStaffSession} from '../hooks/useStaffSession';
import type {StaffSession} from '../types';

interface StaffContextValue {
  session: StaffSession | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  switchMerchant: (merchantId: number) => Promise<void>;
  logout: () => Promise<void>;
}

const StaffContext = createContext<StaffContextValue | null>(null);

export const StaffProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const value = useStaffSession();
  return (
    <StaffContext.Provider value={value}>{children}</StaffContext.Provider>
  );
};

export function useStaffContext(): StaffContextValue {
  const ctx = useContext(StaffContext);
  if (!ctx) {
    throw new Error('useStaffContext must be used within StaffProvider');
  }
  return ctx;
}
