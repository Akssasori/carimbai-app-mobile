import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useStaffContext} from '../context/StaffContext';
import type {RootStackParamList} from '../navigation/AppNavigator';
import {COLORS} from '../utils/constants';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const StaffLoginScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const {login} = useStaffContext();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError('Informe e-mail e senha.');
      return;
    }
    try {
      setLoading(true);
      await login(email.trim(), password);
    } catch (err: any) {
      console.log(
        '[staff-login-error]',
        err?.response?.status,
        err?.response?.data,
        err?.message,
      );
      setError(err?.response?.data?.message || err?.message || 'Credenciais inválidas.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[COLORS.primaryDark, COLORS.gradientEnd, COLORS.gradientStart]}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled">
          <View style={styles.brand}>
            <Text style={styles.logo}>🏪</Text>
            <Text style={styles.brandName}>Área do Lojista</Text>
            <Text style={styles.tagline}>Carimbai — Gestão de fidelidade</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Entrar</Text>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.field}>
              <Text style={styles.label}>E-mail</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="seu@email.com"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Senha</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
            </View>

            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
              style={styles.buttonWrapper}>
              <LinearGradient
                colors={[COLORS.gradientStart, COLORS.gradientEnd]}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.button}>
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>Entrar</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('CustomerOnboarding')}
            style={styles.backLink}>
            <Text style={styles.backLinkText}>← Área do Cliente</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  flex: {flex: 1},
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  brand: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    fontSize: 56,
    marginBottom: 8,
  },
  brandName: {
    fontSize: 30,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 20,
  },
  errorBox: {
    backgroundColor: COLORS.errorBg,
    borderWidth: 1,
    borderColor: COLORS.errorBorder,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textLight,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
    backgroundColor: '#fafafa',
  },
  buttonWrapper: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  button: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 12,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  backLink: {
    alignItems: 'center',
    marginTop: 24,
    paddingVertical: 8,
  },
  backLinkText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default StaffLoginScreen;
