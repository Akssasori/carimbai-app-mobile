import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type {Card, QRTokenResponse} from '../types';
import {apiService} from '../services/api';

import QRCodeModal from '../components/QRCodeModal';
import LoyaltyCard from '../components/LoyaltyCards';

interface HomeScrenProps {
  customerId: number;
  customerName?: string;
}

const HomeScreen: React.FC<HomeScrenProps> = ({
  customerId,
  customerName = 'Cliente',
}) => {
  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrToken, setQrToken] = useState<QRTokenResponse | null>(null);
  const [loadingQR, setLoadingQR] = useState(false);

  useEffect(() => {
    fetchCard();
  }, [customerId]);

  const fetchCard = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCustomerCards(customerId);

      if (response.cards && response.cards.length > 0) {
        setCard(response.cards[0]);
      }
    } catch (err) {
      setError('Erro ao carregar cartão de fidelidade');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleShowQR = async () => {
    if (!card) return;

    try {
      setLoadingQR(true);
      const token = await apiService.getCardQR(card.cardId);
      setQrToken(token);
    } catch (err) {
      console.error('Erro ao gerar QR Code:', err);
      setError('Erro ao gerar QR Code. Tente novamente.');
    } finally {
      setLoadingQR(false);
    }
  };

  const handleCloseQR = () => {
    setQrToken(null);
  };

  if (loading) {
    return (
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.container}>
        <ActivityIndicator size="large" color="white" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </LinearGradient>
    );
  }

  if (error || !card) {
    return (
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.container}>
        <Text style={styles.errorText}>
          {error || 'Nenhum cartão encontrado'}
        </Text>
      </LinearGradient>
    );
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
          <Text style={styles.greeting}>Olá, {customerName}!</Text>
          <Text style={styles.subtitle}>
            Bem-vindo ao seu cartão de fidelidade
          </Text>
        </View>

        <LoyaltyCard card={card} />

        <View style={styles.actions}>
          <TouchableOpacity
            onPress={handleShowQR}
            disabled={loadingQR}
            activeOpacity={0.8}>
            <LinearGradient
              colors={['#ffffff', '#f8f9fa']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.button}>
              <Text style={styles.buttonIcon}>📱</Text>
              <Text style={styles.buttonText}>
                {loadingQR ? 'Gerando...' : 'Mostrar QR Code'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <QRCodeModal qrToken={qrToken} onClose={handleCloseQR} />
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
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '300',
  },
  actions: {
    paddingHorizontal: 16,
    paddingVertical: 32,
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 32,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 8,
    gap: 12,
  },
  buttonIcon: {
    fontSize: 24,
  },
  buttonText: {
    color: '#667eea',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
    marginTop: 16,
  },
  errorText: {
    color: '#ffcccc',
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

export default HomeScreen;