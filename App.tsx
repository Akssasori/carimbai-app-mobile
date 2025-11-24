import React, {useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  StatusBar,
} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import StaffScreen from './src/screens/StaffScreen';
import HomeScreen from './src/screens/HomeScreeen';

type Mode = 'customer' | 'staff';

function App(): React.JSX.Element {
  const [mode, setMode] = useState<Mode>('customer');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />

      {/* Mode Selector */}
      <View style={styles.modeSelector}>
        <TouchableOpacity
          style={styles.modeButtonContainer}
          onPress={() => setMode('customer')}
          activeOpacity={0.8}>
          <LinearGradient
            colors={
              mode === 'customer'
                ? ['#667eea', '#764ba2']
                : ['#e0e0e0', '#e0e0e0']
            }
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.modeButton}>
            <Text
              style={[
                styles.modeButtonText,
                mode === 'customer' && styles.modeButtonTextActive,
              ]}>
              👤 Cliente
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.modeButtonContainer}
          onPress={() => setMode('staff')}
          activeOpacity={0.8}>
          <LinearGradient
            colors={
              mode === 'staff'
                ? ['#667eea', '#764ba2']
                : ['#e0e0e0', '#e0e0e0']
            }
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.modeButton}>
            <Text
              style={[
                styles.modeButtonText,
                mode === 'staff' && styles.modeButtonTextActive,
              ]}>
              🏪 Lojista
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {mode === 'customer' ? (
          <HomeScreen customerId={1} customerName="Lucas" />
        ) : (
          <StaffScreen />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#667eea',
  },
  modeSelector: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  modeButtonContainer: {
    flex: 1,
  },
  modeButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  modeButtonTextActive: {
    color: 'white',
  },
  content: {
    flex: 1,
  },
});

export default App;