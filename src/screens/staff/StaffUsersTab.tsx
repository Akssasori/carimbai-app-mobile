import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useStaffContext} from '../../context/StaffContext';
import {apiService} from '../../services/api';
import QRScanner from '../../components/QRScanner';
import type {ProgramItem, QRCodeData} from '../../types';
import {COLORS} from '../../utils/constants';

const StaffUsersTab: React.FC = () => {
  const {session} = useStaffContext();
  const [scanning, setScanning] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [programs, setPrograms] = useState<ProgramItem[]>([]);
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [enrollingId, setEnrollingId] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadPrograms = async (id: string) => {
    if (!session || !id.trim()) {
      return;
    }
    setError(null);
    setSuccessMsg(null);
    setPrograms([]);
    try {
      setLoadingPrograms(true);
      const list = await apiService.getMerchantPrograms(session.merchantId);
      setPrograms(list);
    } catch (err: any) {
      setError(err?.message || 'Erro ao carregar programas');
    } finally {
      setLoadingPrograms(false);
    }
  };

  const handleScan = (data: string) => {
    setScanning(false);
    try {
      const qrData: QRCodeData = JSON.parse(data);
      if (qrData.type === 'CUSTOMER_ID' && qrData.customerId) {
        const id = String(qrData.customerId);
        setCustomerId(id);
        loadPrograms(id);
      } else {
        setError('QR Code não é um ID de cliente.');
      }
    } catch {
      setError('QR Code inválido.');
    }
  };

  const handleEnroll = async (program: ProgramItem) => {
    if (!customerId.trim()) {
      return;
    }
    setError(null);
    setSuccessMsg(null);
    try {
      setEnrollingId(program.id);
      await apiService.enrollCustomer(program.id, Number(customerId));
      setSuccessMsg(
        `Cliente inscrito em "${program.name}" com sucesso!`,
      );
      setPrograms([]);
      setCustomerId('');
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Erro ao inscrever cliente');
    } finally {
      setEnrollingId(null);
    }
  };

  if (scanning) {
    return <QRScanner onScan={handleScan} onCancel={() => setScanning(false)} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Inscrever cliente</Text>
        <Text style={styles.cardSubtitle}>
          Escaneie o QR do cliente ou informe o ID manualmente
        </Text>

        <TouchableOpacity
          onPress={() => setScanning(true)}
          activeOpacity={0.8}>
          <LinearGradient
            colors={[COLORS.gradientStart, COLORS.gradientEnd]}
            style={styles.scanButton}>
            <Text style={styles.scanIcon}>📷</Text>
            <Text style={styles.scanText}>Escanear QR do cliente</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.separator}>
          <View style={styles.separatorLine} />
          <Text style={styles.separatorText}>ou</Text>
          <View style={styles.separatorLine} />
        </View>

        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.inputFlex]}
            value={customerId}
            onChangeText={setCustomerId}
            placeholder="ID do cliente"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="numeric"
            returnKeyType="done"
            onSubmitEditing={() => loadPrograms(customerId)}
          />
          <TouchableOpacity
            onPress={() => loadPrograms(customerId)}
            disabled={loadingPrograms}
            style={styles.searchBtn}>
            {loadingPrograms ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.searchBtnText}>Buscar</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {successMsg ? (
        <View style={styles.successBox}>
          <Text style={styles.successText}>✅ {successMsg}</Text>
        </View>
      ) : null}

      {programs.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Programas disponíveis — Cliente #{customerId}
          </Text>
          {programs.map(program => (
            <View key={program.id} style={styles.programItem}>
              <View style={styles.programInfo}>
                <Text style={styles.programName}>{program.name}</Text>
                {program.description ? (
                  <Text style={styles.programDesc}>{program.description}</Text>
                ) : null}
                <Text style={styles.programReward}>
                  🎁 {program.rewardName} — {program.ruleTotalStamps} carimbos
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleEnroll(program)}
                disabled={enrollingId === program.id}
                style={styles.enrollBtn}>
                {enrollingId === program.id ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.enrollBtnText}>Inscrever</Text>
                )}
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
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
  },
  cardSubtitle: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 10,
  },
  scanIcon: {fontSize: 20},
  scanText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  separatorText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
  },
  inputFlex: {flex: 1},
  searchBtn: {
    backgroundColor: COLORS.gradientStart,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    minWidth: 70,
    alignItems: 'center',
  },
  searchBtnText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  errorBox: {
    backgroundColor: COLORS.errorBg,
    borderWidth: 1,
    borderColor: COLORS.errorBorder,
    borderRadius: 10,
    padding: 12,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
  },
  successBox: {
    backgroundColor: '#e8f5e9',
    borderWidth: 1,
    borderColor: '#a5d6a7',
    borderRadius: 10,
    padding: 12,
  },
  successText: {
    color: '#2e7d32',
    fontSize: 14,
    fontWeight: '600',
  },
  programItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12,
  },
  programInfo: {flex: 1, gap: 3},
  programName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  programDesc: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  programReward: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  enrollBtn: {
    backgroundColor: COLORS.gradientStart,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  enrollBtnText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '700',
  },
});

export default StaffUsersTab;
