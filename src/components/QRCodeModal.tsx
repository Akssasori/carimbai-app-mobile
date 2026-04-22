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
import type {QRTokenResponse, RedeemQrTokenResponse} from '../types';
import {formatCountdown} from '../utils/formatters';

interface QRCodeModalProps {
  qrToken?: QRTokenResponse | null;
  redeemQrToken?: RedeemQrTokenResponse | null;
  onClose: () => void;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({
  qrToken,
  redeemQrToken,
  onClose,
}) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  const isRedeem = !!redeemQrToken;
  const token = redeemQrToken ?? qrToken;
  const visible = !!token;

  useEffect(() => {
    if (!token) {
      return;
    }
    const expMs = token.exp * 1000;
    const calc = () => Math.max(0, Math.floor((expMs - Date.now()) / 1000));

    setTimeRemaining(calc());
    const interval = setInterval(() => {
      setTimeRemaining(calc());
    }, 1000);
    return () => clearInterval(interval);
  }, [token]);

  if (!visible) {
    return null;
  }

  const qrValue = isRedeem
    ? JSON.stringify({
        type: 'REDEEM_QR',
        payload: redeemQrToken,
      })
    : JSON.stringify(qrToken);

  const title = isRedeem ? 'QR de Resgate' : 'Seu QR Code';
  const hint = isRedeem
    ? 'Mostre este código ao lojista para resgatar seu prêmio'
    : 'Mostre este código para o estabelecimento adicionar um carimbo';
  const timerLabel =
    timeRemaining > 0
      ? `Válido por ${formatCountdown(timeRemaining)}`
      : 'Código expirado';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{hint}</Text>
          </View>

          <View style={styles.qrContainer}>
            <View style={styles.qrWrapper}>
              <QRCode value={qrValue} size={220} />
            </View>
          </View>

          <View style={styles.info}>
            <LinearGradient
              colors={isRedeem ? ['#ffd89b', '#e8742a'] : ['#667eea', '#764ba2']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.timer}>
              <Text style={styles.timerIcon}>{isRedeem ? '🎁' : '⏱️'}</Text>
              <Text style={styles.timerText}>{timerLabel}</Text>
            </LinearGradient>
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
    fontSize: 13,
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
    gap: 8,
  },
  timerIcon: {
    fontSize: 18,
  },
  timerText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
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
