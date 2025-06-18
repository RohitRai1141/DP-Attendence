import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Building2, Eye, EyeOff, ArrowRight } from 'lucide-react-native';
import { AuthService } from '@/services/AuthService';
import { PinInput } from '@/components/PinInput';

export default function LoginScreen() {
  const router = useRouter();
  const [isQuickPinMode, setIsQuickPinMode] = useState(true);
  const [companyCode, setCompanyCode] = useState('DPWORLD');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [quickPin, setQuickPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (loading) return;

    if (isQuickPinMode) {
      if (quickPin.length !== 4) {
        Alert.alert('Error', 'Please enter a 4-digit PIN');
        return;
      }
      await loginWithQuickPin();
    } else {
      if (!username.trim() || !password.trim()) {
        Alert.alert('Error', 'Please enter username and password');
        return;
      }
      await loginWithCredentials();
    }
  };

  const loginWithCredentials = async () => {
    setLoading(true);
    try {
      await AuthService.login({
        companyCode,
        username,
        password,
      });
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const loginWithQuickPin = async () => {
    setLoading(true);
    try {
      await AuthService.loginWithQuickPin(quickPin);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Invalid PIN');
      setQuickPin('');
    } finally {
      setLoading(false);
    }
  };

  const handleSetupPin = () => {
    router.push('/auth/setup-pin');
  };

  return (
    <LinearGradient
      colors={['#2c3e50', '#34495e', '#3d566e']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image
                source={{ uri: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop' }}
                style={styles.logo}
                resizeMode="cover"
              />
            </View>
            <Text style={styles.title}>DP WORLD</Text>
            <Text style={styles.subtitle}>Log In With</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  !isQuickPinMode && styles.toggleButtonActive,
                ]}
                onPress={() => setIsQuickPinMode(false)}
              >
                <Text
                  style={[
                    styles.toggleText,
                    !isQuickPinMode && styles.toggleTextActive,
                  ]}
                >
                  User Login
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  isQuickPinMode && styles.toggleButtonActive,
                ]}
                onPress={() => setIsQuickPinMode(true)}
              >
                <Text
                  style={[
                    styles.toggleText,
                    isQuickPinMode && styles.toggleTextActive,
                  ]}
                >
                  Quick PIN
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Company Code</Text>
                <View style={styles.companyCodeContainer}>
                  <TextInput
                    style={styles.companyCodeInput}
                    value={companyCode}
                    onChangeText={setCompanyCode}
                    placeholder="DPWORLD"
                    placeholderTextColor="#7f8c8d"
                    autoCapitalize="characters"
                  />
                  <TouchableOpacity style={styles.clearButton}>
                    <Text style={styles.clearButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {!isQuickPinMode ? (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Username</Text>
                    <TextInput
                      style={styles.input}
                      value={username}
                      onChangeText={setUsername}
                      placeholder="Enter username"
                      placeholderTextColor="#7f8c8d"
                      autoCapitalize="none"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Password</Text>
                    <View style={styles.passwordContainer}>
                      <TextInput
                        style={styles.passwordInput}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Enter password"
                        placeholderTextColor="#7f8c8d"
                        secureTextEntry={!showPassword}
                      />
                      <TouchableOpacity
                        style={styles.eyeButton}
                        onPress={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff size={20} color="#7f8c8d" />
                        ) : (
                          <Eye size={20} color="#7f8c8d" />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                </>
              ) : (
                <View style={styles.pinContainer}>
                  <Text style={styles.pinLabel}>Enter your Quick PIN</Text>
                  <PinInput
                    value={quickPin}
                    onChangeText={setQuickPin}
                    length={4}
                  />
                  <View style={styles.pinActions}>
                    <TouchableOpacity onPress={handleSetupPin}>
                      <Text style={styles.linkText}>Set Quick PIN</Text>
                    </TouchableOpacity>
                    <TouchableOpacity>
                      <Text style={styles.linkText}>Forgot Quick PIN?</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <TouchableOpacity
                style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                onPress={handleLogin}
                disabled={loading}
              >
                <Text style={styles.loginButtonText}>
                  {loading ? 'Logging In...' : 'Log In'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {isQuickPinMode && (
            <View style={styles.punchButtonsContainer}>
              <TouchableOpacity style={[styles.punchButton, styles.punchInButton]}>
                <Text style={styles.punchButtonText}>Punch In</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.punchButton, styles.punchOutButton]}>
                <Text style={styles.punchButtonText}>Punch Out</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 120,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    padding: 8,
  },
  logo: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#bdc3c7',
  },
  card: {
    backgroundColor: 'rgba(52, 73, 94, 0.9)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(149, 165, 166, 0.3)',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(44, 62, 80, 0.8)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(149, 165, 166, 0.2)',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#3498db',
  },
  toggleText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#95a5a6',
  },
  toggleTextActive: {
    color: '#ffffff',
  },
  formContainer: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#ecf0f1',
  },
  input: {
    backgroundColor: 'rgba(44, 62, 80, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(149, 165, 166, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#ffffff',
  },
  companyCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(44, 62, 80, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(149, 165, 166, 0.3)',
    borderRadius: 12,
  },
  companyCodeInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#ffffff',
  },
  clearButton: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  clearButtonText: {
    fontSize: 20,
    color: '#3498db',
    fontFamily: 'Inter-Regular',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(44, 62, 80, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(149, 165, 166, 0.3)',
    borderRadius: 12,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#ffffff',
  },
  eyeButton: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  pinContainer: {
    alignItems: 'center',
    gap: 20,
  },
  pinLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#3498db',
    textAlign: 'center',
  },
  pinActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  linkText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#3498db',
  },
  loginButton: {
    backgroundColor: '#3498db',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  punchButtonsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 20,
  },
  punchButton: {
    flex: 1,
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  punchInButton: {
    backgroundColor: '#3498db',
  },
  punchOutButton: {
    backgroundColor: '#3498db',
  },
  punchButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
});
