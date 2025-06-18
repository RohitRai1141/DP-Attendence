import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Check } from 'lucide-react-native';
import { PinInput } from '@/components/PinInput';
import { AuthService } from '@/services/AuthService';

export default function SetupPinScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    if (step === 1) {
      if (newPin.length !== 4) {
        Alert.alert('Error', 'Please enter a 4-digit PIN');
        return;
      }
      setStep(2);
    } else {
      handleSetupPin();
    }
  };

  const handleSetupPin = async () => {
    if (confirmPin.length !== 4) {
      Alert.alert('Error', 'Please confirm your PIN');
      return;
    }

    if (newPin !== confirmPin) {
      Alert.alert('Error', 'PINs do not match. Please try again.');
      setConfirmPin('');
      return;
    }

    setLoading(true);
    try {
      await AuthService.setupQuickPin(newPin);
      Alert.alert(
        'Success',
        'Quick PIN has been set successfully!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to set PIN');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 1) {
      router.back();
    } else {
      setStep(1);
      setConfirmPin('');
    }
  };

  return (
    <LinearGradient
      colors={['#0f172a', '#1e293b', '#334155']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ArrowLeft size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.title}>Set Quick PIN</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <View style={styles.stepIndicator}>
            <View style={[styles.step, styles.stepActive]}>
              <Text style={styles.stepText}>1</Text>
            </View>
            <View style={styles.stepLine} />
            <View style={[styles.step, step === 2 && styles.stepActive]}>
              <Text style={[styles.stepText, step === 2 && styles.stepTextActive]}>2</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {step === 1 ? 'Create your PIN' : 'Confirm your PIN'}
            </Text>
            <Text style={styles.cardSubtitle}>
              {step === 1
                ? 'Enter a 4-digit PIN for quick access'
                : 'Re-enter your PIN to confirm'}
            </Text>

            <View style={styles.pinContainer}>
              <PinInput
                value={step === 1 ? newPin : confirmPin}
                onChangeText={step === 1 ? setNewPin : setConfirmPin}
                length={4}
                secureTextEntry={true}
              />
            </View>

            <TouchableOpacity
              style={[styles.nextButton, loading && styles.nextButtonDisabled]}
              onPress={handleNext}
              disabled={loading}
            >
              <Text style={styles.nextButtonText}>
                {loading ? 'Setting PIN...' : step === 1 ? 'Next' : 'Set PIN'}
              </Text>
              {step === 1 ? (
                <ArrowLeft size={20} color="#ffffff" style={{ transform: [{ rotate: '180deg' }] }} />
              ) : (
                <Check size={20} color="#ffffff" />
              )}
            </TouchableOpacity>
          </View>
        </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  step: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(100, 116, 139, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepActive: {
    backgroundColor: '#3b82f6',
  },
  stepText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#64748b',
  },
  stepTextActive: {
    color: '#ffffff',
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: 'rgba(100, 116, 139, 0.3)',
    marginHorizontal: 10,
  },
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 32,
  },
  pinContainer: {
    marginBottom: 32,
  },
  nextButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minWidth: 120,
  },
  nextButtonDisabled: {
    opacity: 0.6,
  },
  nextButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
});
