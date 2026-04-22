import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useStaffContext} from '../../context/StaffContext';
import {apiService} from '../../services/api';
import QRScanner from '../../components/QRScanner';
import type {QRCodeData, StampResponse, RedeemResponse} from '../../types';
import type {HistoryItem} from './StaffDashboardScreen';
import {COLORS} from '../../utils/constants';
import {formatTimestamp} from '../../utils/formatters';

interface Props {
  onHistoryAdd: (item: HistoryItem) => void;
  history: HistoryItem[];
}

type ScanResult =
  | {kind: 'stamp'; data: StampResponse; timestamp: string}
  | {kind: 'redeem'; data: RedeemResponse; timestamp: string};

const StaffScanTab: React.FC<Props> = ({onHistoryAdd, history}) => {
  const {session} = useStaffContext();
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [locationId, setLocationId] = useState('');
  const [cashierPin, setCashierPin] = useState('');
  const processingRef = useRef(false);

  const handleScan = async (data: string) => {
    if (processingRef.current) {
      return;
    }
    processingRef.current = true;
    setScanning(false);
    setError(null);
    setResult(null);

    try {
      const qrData: QRCodeData = JSON.parse(data);

      if (qrData.type === 'CUSTOMER_QR') {
        await applyStamp(qrData);
      } else if (qrData.type === 'REDEEM_QR') {
        await applyRedeem(qrData);
      } else {
        setError('QR Code inválido para esta operação.');
      }
    } catch {
      setError('QR Code inválido. Não foi possível ler os dados.');
    } finally {
      processingRef.current = false;
    }
  };

  const applyStamp = async (qrData: QRCodeData) => {
    const idempotencyKey = `${qrData.idRef}-${Date.now()}-${Math.random()}`;
    const response = await apiService.applyStamp(
      {
        type: 'CUSTOMER_QR',
        payload: {
          cardId: qrData.idRef!,
          nonce: qrData.nonce!,
          exp: qrData.exp!,
          sig: qrData.sig!,
        },
      },
      idempotencyKey,
      session?.token,
      locationId || undefined,
    );
    const timestamp = new Date().toISOString();
    setResult({kind: 'stamp', data: response, timestamp});
    onHistoryAdd({
      id: `${response.cardId}-${Date.now()}`,
      type: 'stamp',
      cardId: String(response.cardId),
      stampsCount: response.stamps,
      maxStamps: response.needed,
      rewardEarned: response.rewardIssued,
      timestamp,
    });
  };

  const applyRedeem = async (qrData: QRCodeData) => {
    if (!session) {
      setError('Sessão inválida.');
      return;
    }
    const payload = qrData as any;
    const redeemPayload = payload.payload ?? payload;
    const response = await apiService.redeemWithQr(
      {
        cardId: redeemPayload.cardId,
        locationId: locationId || undefined,
        redeemQr: {
          cardId: redeemPayload.cardId,
          nonce: redeemPayload.nonce,
          exp: redeemPayload.exp,
          sig: redeemPayload.sig,
        },
      },
      session.token,
      cashierPin || undefined,
    );
    const timestamp = new Date().toISOString();
    setResult({kind: 'redeem', data: response, timestamp});
    onHistoryAdd({
      id: `redeem-${redeemPayload.cardId}-${Date.now()}`,
      type: 'redeem',
      cardId: String(redeemPayload.cardId),
      stampsCount: response.stampsAfter,
      maxStamps: 0,
      rewardEarned: true,
      timestamp,
    });
  };

  const clearHistory = () => {
    Alert.alert('Limpar Histórico', 'Deseja limpar todo o histórico?', [
      {text: 'Cancelar', style: 'cancel'},
      {text: 'Limpar', style: 'destructive', onPress: () => onHistoryAdd({id: '__clear__', type: 'stamp', cardId: '', stampsCount: 0, maxStamps: 0, rewardEarned: false, timestamp: ''})},
    ]);
  };

  if (scanning) {
    return <QRScanner onScan={handleScan} onCancel={() => setScanning(false)} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Config inputs */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Configurações</Text>
        <View style={styles.row}>
          <View style={styles.inputWrap}>
            <Text style={styles.label}>Local (ID)</Text>
            <TextInput
              style={styles.input}
              value={locationId}
              onChangeText={setLocationId}
              placeholder="opcional"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>
          <View style={styles.inputWrap}>
            <Text style={styles.label}>PIN caixa</Text>
            <TextInput
              style={styles.input}
              value={cashierPin}
              onChangeText={setCashierPin}
              placeholder="opcional"
              placeholderTextColor={COLORS.textMuted}
              secureTextEntry
            />
          </View>
        </View>
      </View>

      {/* Scanner button */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Scanner QR</Text>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          onPress={() => {
            setResult(null);
            setError(null);
            setScanning(true);
          }}
          activeOpacity={0.8}>
          <LinearGradient
            colors={[COLORS.gradientStart, COLORS.gradientEnd]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.scanButton}>
            <Text style={styles.scanIcon}>📷</Text>
            <Text style={styles.scanText}>Escanear QR Code</Text>
          </LinearGradient>
        </TouchableOpacity>

        {result ? (
          <View
            style={[
              styles.resultCard,
              result.kind === 'redeem' && styles.resultCardRedeem,
              result.kind === 'stamp' && result.data.rewardIssued && styles.resultCardReward,
            ]}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>
                {result.kind === 'redeem' ? '🎁 Resgate processado' : '✅ Carimbo aplicado'}
              </Text>
              <Text style={styles.resultTime}>
                {formatTimestamp(result.timestamp)}
              </Text>
            </View>
            {result.kind === 'stamp' && (
              <>
                <Text style={styles.detail}>
                  Cartão #{result.data.cardId}
                </Text>
                <Text style={styles.detail}>
                  {result.data.stamps} / {result.data.needed} carimbos
                </Text>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {width: `${(result.data.stamps / result.data.needed) * 100}%`},
                    ]}
                  />
                </View>
                {result.data.rewardIssued && (
                  <Text style={styles.rewardText}>🎉 Prêmio conquistado!</Text>
                )}
              </>
            )}
            {result.kind === 'redeem' && (
              <Text style={styles.detail}>
                Cartão #{result.data.cardId} — {result.data.stampsAfter} carimbos restantes
              </Text>
            )}
          </View>
        ) : null}
      </View>

      {/* History */}
      <View style={styles.card}>
        <View style={styles.historyHeader}>
          <Text style={styles.cardTitle}>Histórico recente</Text>
          {history.length > 0 && (
            <TouchableOpacity onPress={clearHistory}>
              <Text style={styles.clearBtn}>Limpar</Text>
            </TouchableOpacity>
          )}
        </View>
        {history.length === 0 ? (
          <Text style={styles.empty}>Nenhuma operação ainda</Text>
        ) : (
          history.slice(0, 10).map(item => (
            <View key={item.id} style={styles.historyItem}>
              <View style={styles.historyLeft}>
                <Text style={styles.historyIcon}>
                  {item.type === 'redeem' ? '🎁' : '📍'}
                </Text>
                <View>
                  <Text style={styles.historyCard}>Cartão #{item.cardId}</Text>
                  <Text style={styles.historyStamps}>
                    {item.type === 'stamp'
                      ? `${item.stampsCount}/${item.maxStamps}`
                      : 'Resgate'}
                  </Text>
                </View>
              </View>
              <Text style={styles.historyTime}>
                {formatTimestamp(item.timestamp)}
              </Text>
            </View>
          ))
        )}
      </View>
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
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  inputWrap: {flex: 1},
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textLight,
    marginBottom: 4,
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
  errorBox: {
    backgroundColor: COLORS.errorBg,
    borderWidth: 1,
    borderColor: COLORS.errorBorder,
    borderRadius: 8,
    padding: 10,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
  },
  scanIcon: {fontSize: 22},
  scanText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultCard: {
    backgroundColor: '#f5f7fa',
    borderWidth: 2,
    borderColor: COLORS.gradientStart,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  resultCardReward: {
    backgroundColor: COLORS.rewardBg,
    borderColor: COLORS.reward,
  },
  resultCardRedeem: {
    backgroundColor: '#e8f5e9',
    borderColor: '#4caf50',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  resultTime: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  detail: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.gradientStart,
  },
  rewardText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.reward,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clearBtn: {
    fontSize: 13,
    color: COLORS.gradientStart,
    fontWeight: '600',
  },
  empty: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingVertical: 16,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  historyIcon: {fontSize: 18},
  historyCard: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  historyStamps: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  historyTime: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
});

export default StaffScanTab;
