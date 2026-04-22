import {useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {apiService} from '../services/api';
import type {CustomerData, CustomerLoginRequest} from '../types';
import {STORAGE_KEYS} from '../utils/constants';

export function useCustomer() {
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.customer).then(raw => {
      if (raw) {
        try {
          setCustomer(JSON.parse(raw));
        } catch {}
      }
      setLoading(false);
    });
  }, []);

  async function loginOrRegister(payload: CustomerLoginRequest): Promise<void> {
    const response = await apiService.loginOrRegisterCustomer(payload);
    const data: CustomerData = {
      customerId: response.customerId,
      name: response.name,
      email: response.email,
      phone: response.phone,
    };
    await AsyncStorage.setItem(STORAGE_KEYS.customer, JSON.stringify(data));
    setCustomer(data);
  }

  async function logout(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.customer);
    setCustomer(null);
  }

  return {customer, loading, loginOrRegister, logout};
}
