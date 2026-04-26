import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  FlatList,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useCustomerContext} from '../context/CustomerContext';
import {apiService} from '../services/api';
import LoyaltyCard from '../components/LoyaltyCards';
import QRCodeModal from '../components/QRCodeModal';
import type {Card, QRTokenResponse, RedeemQrTokenResponse} from '../types';
import {COLORS} from '../utils/constants';

const CustomerHomeScreen: React.FC = () => {
  const {customer, logout} = useCustomerContext();
  const insets = useSafeAreaInsets();

  const [cards, setCards] = useState<Card[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [qrToken, setQrToken] = useState<QRTokenResponse | null>(null);
  const [redeemQrToken, setRedeemQrToken] =
    useState<RedeemQrTokenResponse | null>(null);
  const [loadingQR, setLoadingQR] = useState(false);
  const [loadingRedeemQR, setLoadingRedeemQR] = useState(false);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevStampsRef = useRef<number | null>(null);

  const fetchCards = useCallback(async () => {
    if (!customer) {
      return;
    }
    try {
      const response = await apiService.getCustomerCards(customer.customerId);
      setCards(response.cards || []);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Erro ao carregar cartões');
    } finally {
      setLoading(false);
    }
  }, [customer]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  useEffect(() => {
    const isQrOpen = !!qrToken || !!redeemQrToken;
    if (isQrOpen) {
      pollRef.current = setInterval(async () => {
        if (!customer) {
          return;
        }
        try {
          const response = await apiService.getCustomerCards(
            customer.customerId,
          );
          const updated = response.cards || [];
          const card = updated[selectedIndex];
          const prev = prevStampsRef.current;
          if (card && prev !== null && card.stampsCount !== prev) {
            setCards(updated);
            setQrToken(null);
            setRedeemQrToken(null);
            prevStampsRef.current = card.stampsCount;
          } else if (card) {
            prevStampsRef.current = card.stampsCount;
          }
        } catch {}
      }, 2000);
    } else {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    }
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [qrToken, redeemQrToken, customer, selectedIndex]);

  const handleShowQR = async () => {
    const card = cards[selectedIndex];
    if (!card) {
      return;
    }
    try {
      setLoadingQR(true);
      prevStampsRef.current = card.stampsCount;
      const token = await apiService.getCardQR(card.cardId);
      setQrToken(token);
    } catch (err: any) {
      setError(err?.message || 'Erro ao gerar QR Code');
    } finally {
      setLoadingQR(false);
    }
  };

  const handleShowRedeemQR = async () => {
    const card = cards[selectedIndex];
    if (!card) {
      return;
    }
    try {
      setLoadingRedeemQR(true);
      prevStampsRef.current = card.stampsCount;
      const token = await apiService.getRedeemQR(card.cardId);
      setRedeemQrToken(token);
    } catch (err: any) {
      setError(err?.message || 'Erro ao gerar QR de resgate');
    } finally {
      setLoadingRedeemQR(false);
    }
  };

  if (loading) {
    return (
      <LinearGradient
        colors={[COLORS.gradientStart, COLORS.gradientEnd]}
        style={styles.centered}>
        <ActivityIndicator size="large" color="white" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </LinearGradient>
    );
  }

  const card = cards[selectedIndex] ?? null;
  const customerIdQr = JSON.stringify({
    type: 'CUSTOMER_ID',
    customerId: customer?.customerId,
  });
  const initials = (customer?.name || customer?.email || '?')
    .charAt(0)
    .toUpperCase();

  return (
    <LinearGradient
      colors={[COLORS.gradientStart, COLORS.gradientEnd]}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.container}>
      {/* Top nav */}
      <View style={[styles.navbar, {paddingTop: insets.top + 8}]}>
        <Text style={styles.navBrand}>🏷️ Carimbai</Text>
        <View style={styles.navRight}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <TouchableOpacity
            onPress={logout}
            style={styles.logoutBtn}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        {/* Welcome */}
        <View style={styles.welcome}>
          <Text style={styles.greeting}>
            Olá, {customer?.name || 'Cliente'}!
          </Text>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        {cards.length === 0 ? (
          /* Empty state: show customer ID QR for enrollment */
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Nenhum cartão ainda</Text>
            <Text style={styles.emptySubtitle}>
              Mostre este QR ao lojista para se inscrever em um programa
            </Text>
            <View style={styles.qrBox}>
              <QRCode value={customerIdQr} size={180} />
            </View>
            <Text style={styles.emptyHint}>ID: {customer?.customerId}</Text>
          </View>
        ) : (
          <>
            {/* Card tabs */}
            {cards.length > 1 && (
              <FlatList
                data={cards}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={item => String(item.cardId)}
                contentContainerStyle={styles.tabs}
                renderItem={({item, index}) => (
                  <TouchableOpacity
                    onPress={() => setSelectedIndex(index)}
                    style={[
                      styles.tab,
                      index === selectedIndex && styles.tabActive,
                    ]}>
                    <Text
                      style={[
                        styles.tabText,
                        index === selectedIndex && styles.tabTextActive,
                      ]}>
                      {item.programName}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            )}

            {/* Loyalty card */}
            {card ? <LoyaltyCard card={card} /> : null}

            {/* Action button */}
            <View style={styles.actions}>
              {card?.status === 'READY_TO_REDEEM' ? (
                <TouchableOpacity
                  onPress={handleShowRedeemQR}
                  disabled={loadingRedeemQR}
                  activeOpacity={0.85}>
                  <LinearGradient
                    colors={['#ffd89b', '#e8742a']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 1}}
                    style={styles.actionButton}>
                    <Text style={styles.actionIcon}>🎁</Text>
                    <Text style={styles.actionText}>
                      {loadingRedeemQR ? 'Gerando...' : 'Resgatar Prêmio'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={handleShowQR}
                  disabled={loadingQR}
                  activeOpacity={0.85}>
                  <LinearGradient
                    colors={['#ffffff', '#f8f9fa']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 1}}
                    style={styles.actionButton}>
                    <Text style={styles.actionIcon}>📱</Text>
                    <Text style={[styles.actionText, styles.actionTextPurple]}>
                      {loadingQR ? 'Gerando...' : 'Mostrar QR Code'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </>
        )}
      </ScrollView>

      <QRCodeModal
        qrToken={qrToken}
        redeemQrToken={redeemQrToken}
        onClose={() => {
          setQrToken(null);
          setRedeemQrToken(null);
        }}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 12,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  navBrand: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  navRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  logoutBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  logoutText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  scroll: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  welcome: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  greeting: {
    fontSize: 26,
    fontWeight: '700',
    color: 'white',
  },
  errorText: {
    color: '#ffd4d4',
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
  },
  emptyCard: {
    margin: 16,
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  qrBox: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 16,
  },
  emptyHint: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  tabs: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginRight: 8,
  },
  tabActive: {
    backgroundColor: 'white',
  },
  tabText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: COLORS.gradientStart,
  },
  actions: {
    paddingHorizontal: 16,
    paddingTop: 24,
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 32,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 6,
    gap: 12,
  },
  actionIcon: {
    fontSize: 22,
  },
  actionText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '700',
  },
  actionTextPurple: {
    color: COLORS.gradientStart,
  },
});

export default CustomerHomeScreen;
