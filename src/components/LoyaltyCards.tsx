import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type {Card} from '../types';

interface LoyaltyCardProps {
  card: Card;
}

const LoyaltyCard: React.FC<LoyaltyCardProps> = ({card}) => {
  const progress = (card.stampsCount / card.stampsNeeded) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.programName}>{card.programName}</Text>
          <Text style={styles.merchantName}>{card.merchantName}</Text>
          <Text style={styles.rewardInfo}>Recompensa: {card.rewardName}</Text>
        </View>

        <View style={styles.stampsGrid}>
          {[...Array(card.stampsNeeded)].map((_, index) => {
            const isFilled = index < card.stampsCount;
            return (
              <View
                key={index}
                style={[styles.stamp, isFilled && styles.stampFilled]}>
                {isFilled ? (
                  <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 1}}
                    style={styles.stampGradient}>
                    <Text style={styles.stampTextFilled}>✓</Text>
                  </LinearGradient>
                ) : (
                  <Text style={styles.stampText}>{index + 1}</Text>
                )}
              </View>
            );
          })}
        </View>

        <View style={styles.progressInfo}>
          <Text style={styles.stampsCount}>
            {card.stampsCount} de {card.stampsNeeded} carimbos
          </Text>
          <View style={styles.progressBar}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={[styles.progressFill, {width: `${progress}%`}]}
            />
          </View>
        </View>

        {card.hasReward && (
          <LinearGradient
            colors={['#ffd89b', '#19547b']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.rewardAvailable}>
            <Text style={styles.rewardBadge}>🎉</Text>
            <Text style={styles.rewardText}>
              Você tem uma recompensa disponível!
            </Text>
          </LinearGradient>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 20},
    shadowOpacity: 0.3,
    shadowRadius: 60,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  programName: {
    fontSize: 24,
    color: '#333',
    fontWeight: '600',
    marginBottom: 8,
  },
  merchantName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  rewardInfo: {
    fontSize: 13,
    color: '#999',
  },
  stampsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  stamp: {
    width: 50,
    height: 50,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
  },
  stampFilled: {
    borderColor: '#667eea',
  },
  stampGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stampText: {
    fontWeight: '600',
    fontSize: 16,
    color: '#999',
  },
  stampTextFilled: {
    fontWeight: '600',
    fontSize: 20,
    color: 'white',
  },
  progressInfo: {
    marginTop: 16,
  },
  stampsCount: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
    fontWeight: '500',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  rewardAvailable: {
    marginTop: 24,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  rewardBadge: {
    fontSize: 32,
    marginBottom: 8,
  },
  rewardText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
  },
});

export default LoyaltyCard;