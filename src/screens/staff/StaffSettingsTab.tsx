import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useStaffContext} from '../../context/StaffContext';
import type {RootStackParamList} from '../../navigation/AppNavigator';
import {COLORS} from '../../utils/constants';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const StaffSettingsTab: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const {session, logout} = useStaffContext();

  const handleLogout = () => {
    Alert.alert('Sair', 'Deseja encerrar a sessão?', [
      {text: 'Cancelar', style: 'cancel'},
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await logout();
          navigation.replace('StaffLogin');
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Informações da sessão</Text>
        {[
          {label: 'Staff ID', value: `#${session?.staffId}`},
          {label: 'E-mail', value: session?.email ?? '-'},
          {label: 'Perfil', value: session?.role ?? '-'},
          {label: 'Merchant ID', value: `#${session?.merchantId}`},
        ].map(row => (
          <View key={row.label} style={styles.row}>
            <Text style={styles.rowLabel}>{row.label}</Text>
            <Text style={styles.rowValue}>{row.value}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
        <Text style={styles.logoutText}>Encerrar sessão</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    gap: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
  },
  rowLabel: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  rowValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  logoutBtn: {
    backgroundColor: '#dc3545',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#dc3545',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default StaffSettingsTab;
