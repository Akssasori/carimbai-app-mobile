import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useStaffContext} from '../../context/StaffContext';
import StaffHomeTab from './StaffHomeTab';
import StaffScanTab from './StaffScanTab';
import StaffUsersTab from './StaffUsersTab';
import StaffSettingsTab from './StaffSettingsTab';
import {COLORS} from '../../utils/constants';

export interface HistoryItem {
  id: string;
  type: 'stamp' | 'redeem';
  cardId: string;
  stampsCount: number;
  maxStamps: number;
  rewardEarned: boolean;
  timestamp: string;
}

type TabParamList = {
  Home: undefined;
  Scan: undefined;
  Users: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const CLEAR_SENTINEL = '__clear__';

const StaffDashboardScreen: React.FC = () => {
  const {session, switchMerchant} = useStaffContext();
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const handleHistoryAdd = (item: HistoryItem) => {
    if (item.id === CLEAR_SENTINEL) {
      setHistory([]);
      return;
    }
    setHistory(prev => [item, ...prev].slice(0, 50));
  };

  const hasMerchants = (session?.merchants?.length ?? 0) > 1;

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Carimbai</Text>
          <Text style={styles.headerSub}>
            Staff #{session?.staffId} · {session?.role}
          </Text>
        </View>
      </View>

      {/* Merchant switcher */}
      {hasMerchants && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.merchantBar}>
          {session!.merchants.map(m => (
            <TouchableOpacity
              key={m.merchantId}
              onPress={() => switchMerchant(m.merchantId)}
              style={[
                styles.merchantPill,
                m.merchantId === session!.merchantId &&
                  styles.merchantPillActive,
              ]}>
              <Text
                style={[
                  styles.merchantPillText,
                  m.merchantId === session!.merchantId &&
                    styles.merchantPillTextActive,
                ]}>
                {m.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Tabs */}
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: COLORS.gradientStart,
          tabBarInactiveTintColor: COLORS.textMuted,
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabLabel,
        }}>
        <Tab.Screen
          name="Home"
          options={{tabBarLabel: 'Início', tabBarIcon: ({color}) => <Text style={{color, fontSize: 20}}>🏠</Text>}}>
          {() => <StaffHomeTab history={history} />}
        </Tab.Screen>
        <Tab.Screen
          name="Scan"
          options={{tabBarLabel: 'Scanner', tabBarIcon: ({color}) => <Text style={{color, fontSize: 20}}>📷</Text>}}>
          {() => <StaffScanTab onHistoryAdd={handleHistoryAdd} history={history} />}
        </Tab.Screen>
        <Tab.Screen
          name="Users"
          options={{tabBarLabel: 'Clientes', tabBarIcon: ({color}) => <Text style={{color, fontSize: 20}}>👥</Text>}}>
          {() => <StaffUsersTab />}
        </Tab.Screen>
        <Tab.Screen
          name="Settings"
          options={{tabBarLabel: 'Config', tabBarIcon: ({color}) => <Text style={{color, fontSize: 20}}>⚙️</Text>}}
          component={StaffSettingsTab}
        />
      </Tab.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: 'white',
  },
  headerSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  merchantBar: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.primaryDark,
    gap: 8,
  },
  merchantPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginRight: 8,
  },
  merchantPillActive: {
    backgroundColor: 'white',
  },
  merchantPillText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '600',
  },
  merchantPillTextActive: {
    color: COLORS.primaryDark,
  },
  tabBar: {
    borderTopWidth: 1,
    borderTopColor: '#e8e8e8',
    backgroundColor: 'white',
    height: 60,
    paddingBottom: 6,
  },
  tabLabel: {
    fontSize: 11,
  },
});

export default StaffDashboardScreen;
