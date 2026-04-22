import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {useStaffContext} from '../../context/StaffContext';
import type {HistoryItem} from './StaffDashboardScreen';
import {COLORS} from '../../utils/constants';

interface Props {
  history: HistoryItem[];
}

const StaffHomeTab: React.FC<Props> = ({history}) => {
  const {session} = useStaffContext();

  const today = new Date().toDateString();
  const todayItems = history.filter(
    item => new Date(item.timestamp).toDateString() === today,
  );
  const stampsToday = todayItems.filter(i => i.type === 'stamp').length;
  const rewardsToday = todayItems.filter(i => i.type === 'redeem').length;
  const uniqueCustomers = new Set(todayItems.map(i => i.cardId)).size;

  const stats = [
    {label: 'Carimbos hoje', value: stampsToday, icon: '📍'},
    {label: 'Resgates hoje', value: rewardsToday, icon: '🎁'},
    {label: 'Clientes únicos', value: uniqueCustomers, icon: '👥'},
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Resumo do dia</Text>

      <View style={styles.statsGrid}>
        {stats.map(stat => (
          <View key={stat.label} style={styles.statCard}>
            <Text style={styles.statIcon}>{stat.icon}</Text>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Sessão atual</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Funcionário</Text>
          <Text style={styles.infoValue}>#{session?.staffId}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Perfil</Text>
          <Text style={styles.infoValue}>{session?.role}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>E-mail</Text>
          <Text style={styles.infoValue}>{session?.email}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.gradientStart,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  infoCard: {
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
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
});

export default StaffHomeTab;
