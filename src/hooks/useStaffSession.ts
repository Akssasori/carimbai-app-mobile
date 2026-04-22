import {useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {apiService} from '../services/api';
import type {StaffSession} from '../types';
import {STORAGE_KEYS} from '../utils/constants';

export function useStaffSession() {
  const [session, setSession] = useState<StaffSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.staffSession).then(raw => {
      if (raw) {
        try {
          setSession(JSON.parse(raw));
        } catch {}
      }
      setLoading(false);
    });
  }, []);

  async function login(email: string, password: string): Promise<void> {
    const response = await apiService.loginStaff(email, password);
    await AsyncStorage.setItem(
      STORAGE_KEYS.staffSession,
      JSON.stringify(response),
    );
    setSession(response);
  }

  async function switchMerchant(merchantId: number): Promise<void> {
    if (!session) {
      return;
    }
    const response = await apiService.switchMerchant(
      {merchantId},
      session.token,
    );
    await AsyncStorage.setItem(
      STORAGE_KEYS.staffSession,
      JSON.stringify(response),
    );
    setSession(response);
  }

  async function logout(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.staffSession);
    setSession(null);
  }

  return {session, loading, login, switchMerchant, logout};
}
