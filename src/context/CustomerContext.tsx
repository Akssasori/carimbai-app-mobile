import React, {createContext, useContext} from 'react';
import {useCustomer} from '../hooks/useCustomer';
import type {CustomerData, CustomerLoginRequest} from '../types';

interface CustomerContextValue {
  customer: CustomerData | null;
  loading: boolean;
  loginOrRegister: (payload: CustomerLoginRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const CustomerContext = createContext<CustomerContextValue | null>(null);

export const CustomerProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const value = useCustomer();
  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  );
};

export function useCustomerContext(): CustomerContextValue {
  const ctx = useContext(CustomerContext);
  if (!ctx) {
    throw new Error('useCustomerContext must be used within CustomerProvider');
  }
  return ctx;
}
