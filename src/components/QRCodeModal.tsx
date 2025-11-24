import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import LinearGradient from 'react-native-linear-gradient';
import type {QRTokenResponse} from '../types';

interface QRCodeModalProps {
  qrToken: QRTokenResponse | null;
  onClose: () => void;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({qrToken, onClose}) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  useEffect(() => {
    if (!qrToken) return;

    const updateTimer = () => {
      const expiresAt = new Date(qrToken.exp * 1000);
      const now = new Date();
      const remaining = Math.floor(
        (expiresAt.getTime() - now.getTime()) / 1000 / 60,
      );
      setTimeRemaining(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 10000); // Atualiza a cada 10s

    return () => clearInterval(interval);
  }, [qrToken]);

  if (!qrToken) return null;

  const qrValue = JSON.stringify(qrToken);

  return (
    <Modal
      visible={!!qrToken}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Seu QR Code</Text>
            <Text style={styles.subtitle}>
              Mostre este código para o estabelecimento
            </Text>
          </View>

          <View style={styles.qrContainer}>
            <View style={styles.qrWrapper}>
              <QRCode value={qrValue} size={220} />
            </View>
          </View>

          <View style={styles.info}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.timer}>
              <Text style={styles.timerIcon}>⏱️</Text>
              <Text style={styles.timerText}>
                {timeRemaining > 0
                  ? `Válido por ${timeRemaining} minutos`
                  : 'Código expirado'}
              </Text>
            </LinearGradient>

            <Text style={styles.hint}>
              O estabelecimento irá escanear este código para adicionar um
              carimbo ao seu cartão
            </Text>
          </View>

          <TouchableOpacity onPress={onClose}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.closeModalButton}>
              <Text style={styles.closeModalButtonText}>Fechar</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const {width} = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 32,
    width: width - 32,
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 20},
    shadowOpacity: 0.4,
    shadowRadius: 60,
    elevation: 15,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#f0f0f0',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 28,
    color: '#666',
    lineHeight: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    color: '#333',
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  qrWrapper: {
    padding: 24,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  info: {
    alignItems: 'center',
    marginBottom: 24,
  },
  timer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    marginBottom: 16,
    gap: 8,
  },
  timerIcon: {
    fontSize: 20,
  },
  timerText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  hint: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  closeModalButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeModalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default QRCodeModal;