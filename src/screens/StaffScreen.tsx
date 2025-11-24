import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {apiService} from '../services/api';
import QRScanner from '../components/QRScanner';

interface StampResult {
  cardId: string;
  stampsCount: number;
  maxStamps: number;
  rewardEarned: boolean;
  timestamp: string;
}

interface HistoryItem extends StampResult {
  id: string;
}

const StaffScreen: React.FC = () => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<StampResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const startScanning = () => {
    setScanning(true);
    setError(null);
    setResult(null);
  };

  const stopScanning = () => {
    setScanning(false);
  };

  const handleScan = async (data: string) => {
    setScanning(false);

    try {
      const qrData = JSON.parse(data);
      await applyStamp(qrData);
    } catch (err) {
      console.error(err);
      setError('QR Code inválido. Não foi possível ler os dados.');
      Alert.alert('Erro', 'QR Code inválido. Não foi possível ler os dados.');
    }
  };

  const applyStamp = async (qrData: any) => {
    try {
      const idempotencyKey = `${qrData.idRef}-${Date.now()}-${Math.random()}`;

      const response = await apiService.applyStamp(
        {
          type: 'CUSTOMER_QR',
          payload: {
            cardId: qrData.idRef,
            nonce: qrData.nonce,
            exp: qrData.exp,
            sig: qrData.sig,
          },
        },
        idempotencyKey,
      );

      const stampResult: StampResult = {
        cardId: response.cardId.toString(),
        stampsCount: response.stamps,
        maxStamps: response.needed,
        rewardEarned: response.rewardIssued,
        timestamp: new Date().toISOString(),
      };

      setResult(stampResult);

      const historyItem: HistoryItem = {
        ...stampResult,
        id: `${response.cardId}-${Date.now()}`,
      };

      setHistory(prev => [historyItem, ...prev]);

      Alert.alert(
        '✅ Sucesso!',
        `Carimbo aplicado! ${response.stamps}/${response.needed}`,
      );
    } catch (err: any) {
      console.error(err);
      const errorMsg = err.message || 'Erro ao processar carimbo';
      setError(errorMsg);
      Alert.alert('Erro', errorMsg);
    }
  };

  const clearHistory = () => {
    Alert.alert('Limpar Histórico', 'Deseja limpar todo o histórico?', [
      {text: 'Cancelar', style: 'cancel'},
      {
        text: 'Limpar',
        style: 'destructive',
        onPress: () => setHistory([]),
      },
    ]);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-BR');
  };

  if (scanning) {
    return <QRScanner onScan={handleScan} onCancel={stopScanning} />;
  }

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Painel do Comerciante</Text>
          <Text style={styles.subtitle}>
            Escaneie o QR Code do cliente para aplicar carimbos
          </Text>
        </View>

        <View style={styles.content}>
          {/* Scanner Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Scanner de QR Code</Text>

            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <TouchableOpacity onPress={startScanning} activeOpacity={0.8}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.scanButton}>
                <Text style={styles.scanButtonIcon}>📷</Text>
                <Text style={styles.scanButtonText}>Escanear QR Code</Text>
              </LinearGradient>
            </TouchableOpacity>

            {result && (
              <View
                style={[
                  styles.resultCard,
                  result.rewardEarned && styles.resultCardReward,
                ]}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultTitle}>✅ Carimbo Aplicado</Text>
                  <Text style={styles.resultTime}>
                    {formatTimestamp(result.timestamp)}
                  </Text>
                </View>

                <View style={styles.resultDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Cartão:</Text>
                    <Text style={styles.detailValue}>{result.cardId}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Carimbos:</Text>
                    <Text style={styles.detailValue}>
                      {result.stampsCount} / {result.maxStamps}
                    </Text>
                  </View>

                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${(result.stampsCount / result.maxStamps) * 100}%`,
                        },
                      ]}
                    />
                  </View>

                  {result.rewardEarned && (
                    <View style={styles.rewardBadge}>
                      <Text style={styles.rewardIcon}>🎉</Text>
                      <Text style={styles.rewardText}>Prêmio Conquistado!</Text>
                    </View>
                  )}
                </View>
              </View>
            )}
          </View>

          {/* History Section */}
          <View style={styles.section}>
            <View style={styles.historyHeader}>
              <Text style={styles.sectionTitle}>Histórico</Text>
              {history.length > 0 && (
                <TouchableOpacity onPress={clearHistory}>
                  <Text style={styles.clearButton}>Limpar</Text>
                </TouchableOpacity>
              )}
            </View>

            {history.length === 0 ? (
              <View style={styles.emptyHistory}>
                <Text style={styles.emptyText}>
                  Nenhum carimbo aplicado ainda
                </Text>
              </View>
            ) : (
              <View style={styles.historyList}>
                {history.map(item => (
                  <View key={item.id} style={styles.historyItem}>
                    <View style={styles.historyItemHeader}>
                      <Text style={styles.historyCardId}>{item.cardId}</Text>
                      <Text style={styles.historyTimestamp}>
                        {formatTimestamp(item.timestamp)}
                      </Text>
                    </View>
                    <View style={styles.historyItemStats}>
                      <Text style={styles.historyStamps}>
                        {item.stampsCount}/{item.maxStamps} carimbos
                      </Text>
                      {item.rewardEarned && (
                        <Text style={styles.historyReward}>🎁</Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 32,
    alignItems: 'center',
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: 16,
    gap: 24,
  },
  section: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  errorBox: {
    backgroundColor: '#fee',
    borderWidth: 1,
    borderColor: '#fcc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#c33',
    fontSize: 13,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
  },
  scanButtonIcon: {
    fontSize: 24,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultCard: {
    backgroundColor: '#f5f7fa',
    borderWidth: 2,
    borderColor: '#667eea',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  resultCardReward: {
    backgroundColor: '#ffecd2',
    borderColor: '#ff9a56',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  resultTime: {
    fontSize: 11,
    color: '#666',
  },
  resultDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#667eea',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#667eea',
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ff9a56',
    gap: 8,
  },
  rewardIcon: {
    fontSize: 18,
  },
  rewardText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ff9a56',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  clearButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
  },
  emptyHistory: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
  historyList: {
    gap: 12,
  },
  historyItem: {
    backgroundColor: '#f8f9fa',
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
    padding: 12,
    borderRadius: 8,
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyCardId: {
    fontSize: 14,
    fontWeight: '700',
    color: '#667eea',
  },
  historyTimestamp: {
    fontSize: 11,
    color: '#999',
  },
  historyItemStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyStamps: {
    fontSize: 12,
    color: '#666',
  },
  historyReward: {
    fontSize: 16,
  },
});

export default StaffScreen;