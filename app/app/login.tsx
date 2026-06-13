import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import {
  ownerLogin,
  ownerVerifyOtp,
  managerLogin,
  managerVerifyOtp,
} from '../services/api';

type LoginStep = 'phone' | 'otp';
type Role = 'owner' | 'manager';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [step, setStep] = useState<LoginStep>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [role, setRole] = useState<Role>('manager');
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [otpFocused, setOtpFocused] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpHint, setOtpHint] = useState('');

  const canSendOtp = phone.trim().length === 10;
  const canVerify = otp.trim().length === 6;

  const handleSendOtp = async () => {
    if (!canSendOtp) return;
    setError('');
    setLoading(true);
    try {
      const fullPhone = `+91${phone.trim()}`;
      const loginFn = role === 'owner' ? ownerLogin : managerLogin;
      const res = await loginFn(fullPhone);
      // Backend returns OTP in dev mode
      setOtpHint(res.otp || '');
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!canVerify) return;
    setError('');
    setLoading(true);
    try {
      const fullPhone = `+91${phone.trim()}`;
      const verifyFn = role === 'owner' ? ownerVerifyOtp : managerVerifyOtp;
      const res = await verifyFn(fullPhone, otp.trim());
      login(res.token, role);
      router.replace(role === 'owner' ? '/hotels' : '/manager-dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bgPrimary} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back */}
          <TouchableOpacity
            onPress={() => {
              if (step === 'otp') {
                setStep('phone');
                setOtp('');
                setError('');
                setOtpHint('');
              } else {
                router.back();
              }
            }}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color={Colors.heading} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.headerBlock}>
            <Image
              source={require('../assets/images/icon.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.welcomeLabel}>WELCOME BACK</Text>
            <Text style={styles.heading}>
              {step === 'phone' ? 'Sign in to\nyour account' : 'Verify\nOTP'}
            </Text>
            <Text style={styles.subheading}>
              {step === 'phone'
                ? 'Select your role and enter your mobile number.'
                : `Enter the 6-digit OTP sent to +91 ${phone}.`}
            </Text>
          </View>

          {/* Form card */}
          <View style={styles.card}>
            {step === 'phone' ? (
              <>
                {/* Role Selector */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>LOGIN AS</Text>
                  <View style={styles.roleRow}>
                    {(['manager', 'owner'] as Role[]).map((r) => (
                      <TouchableOpacity
                        key={r}
                        style={[styles.roleBtn, role === r && styles.roleBtnActive]}
                        onPress={() => { setRole(r); setError(''); }}
                        activeOpacity={0.8}
                      >
                        <Ionicons
                          name={r === 'owner' ? 'business' : 'people'}
                          size={16}
                          color={role === r ? '#fff' : Colors.body}
                        />
                        <Text style={[styles.roleBtnText, role === r && styles.roleBtnTextActive]}>
                          {r === 'owner' ? 'Owner' : 'Manager'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Phone */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>MOBILE NUMBER</Text>
                  <View style={[styles.inputRow, phoneFocused && styles.inputRowFocused]}>
                    <Ionicons
                      name="call-outline"
                      size={18}
                      color={phoneFocused ? Colors.accent : '#9CA3AF'}
                      style={styles.inputIcon}
                    />
                    <Text style={styles.prefix}>+91 </Text>
                    <TextInput
                      style={[styles.input, { flex: 1 }]}
                      placeholder="XXXXX XXXXX"
                      placeholderTextColor="#C4C9D4"
                      value={phone}
                      onChangeText={(t) => {
                        setError('');
                        setPhone(t.replace(/\D/g, '').slice(0, 10));
                      }}
                      onFocus={() => setPhoneFocused(true)}
                      onBlur={() => setPhoneFocused(false)}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>
              </>
            ) : (
              /* OTP */
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>OTP CODE</Text>
                <View style={[styles.inputRow, otpFocused && styles.inputRowFocused]}>
                  <Ionicons
                    name="key-outline"
                    size={18}
                    color={otpFocused ? Colors.accent : '#9CA3AF'}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter 6-digit OTP"
                    placeholderTextColor="#C4C9D4"
                    value={otp}
                    onChangeText={(t) => {
                      setError('');
                      setOtp(t.replace(/\D/g, '').slice(0, 6));
                    }}
                    onFocus={() => setOtpFocused(true)}
                    onBlur={() => setOtpFocused(false)}
                    keyboardType="number-pad"
                    autoFocus
                  />
                </View>
              </View>
            )}

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          {/* CTA */}
          {step === 'phone' ? (
            <TouchableOpacity
              style={[styles.loginBtn, (!canSendOtp || loading) && styles.loginBtnDisabled]}
              activeOpacity={canSendOtp && !loading ? 0.85 : 1}
              onPress={handleSendOtp}
              disabled={!canSendOtp || loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.loginBtnText}>Send OTP</Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.loginBtn, (!canVerify || loading) && styles.loginBtnDisabled]}
              activeOpacity={canVerify && !loading ? 0.85 : 1}
              onPress={handleVerifyOtp}
              disabled={!canVerify || loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.loginBtnText}>Verify & Login</Text>
                  <Ionicons name="log-in-outline" size={20} color="#fff" />
                </>
              )}
            </TouchableOpacity>
          )}

          {/* OTP Hint (dev mode - backend returns OTP) */}
          {step === 'otp' && otpHint ? (
            <View style={styles.hintBox}>
              <Text style={styles.hintTitle}>Dev OTP:</Text>
              <Text style={styles.hintText}>{otpHint}</Text>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  backBtn: {
    marginTop: 8,
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBlock: {
    marginTop: 28,
    marginBottom: 32,
  },
  logoImage: {
    width: 60,
    height: 60,
    marginBottom: 20,
  },
  welcomeLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2.5,
    color: Colors.accent,
    marginBottom: 10,
  },
  heading: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.heading,
    lineHeight: 44,
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  subheading: {
    fontSize: 15,
    fontWeight: '400',
    color: Colors.body,
    lineHeight: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    gap: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  roleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 46,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  roleBtnActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  roleBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.body,
  },
  roleBtnTextActive: {
    color: '#fff',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    height: 54,
  },
  inputRowFocused: {
    borderColor: Colors.accent,
    backgroundColor: '#FDFBFF',
  },
  inputIcon: {
    marginRight: 10,
  },
  prefix: {
    fontSize: 15,
    color: Colors.heading,
    fontWeight: '600',
    marginRight: 2,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.heading,
    fontWeight: '500',
  },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 58,
    borderRadius: 99,
    backgroundColor: Colors.accent,
    marginBottom: 20,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 8,
  },
  loginBtnDisabled: {
    backgroundColor: '#C4B5FD',
    shadowOpacity: 0,
    elevation: 0,
  },
  loginBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
    marginTop: -8,
    marginLeft: 4,
  },
  hintBox: {
    marginTop: 10,
    padding: 16,
    backgroundColor: '#F3F4FB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  hintTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.heading,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  hintText: {
    fontSize: 18,
    color: Colors.accent,
    fontWeight: '800',
    letterSpacing: 4,
  },
});
