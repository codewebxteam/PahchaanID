import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import StepIndicator from '../components/registration/StepIndicator';
import PersonalDetailsForm from '../components/registration/PersonalDetailsForm';
import HotelDetailsForm from '../components/registration/HotelDetailsForm';
import PaymentStep from '../components/registration/PaymentStep';
import ConfirmPaymentModal from '../components/payment/ConfirmPaymentModal';
import {
  ownerRegister,
  ownerVerifyOtp,
  addHotel,
  subscribeHotel,
} from '../services/api';

const FULL_STEPS = ['Personal', 'Verify', 'Hotel', 'Payment'];
const ADD_HOTEL_STEPS = ['Hotel', 'Payment'];

const fullStepTitles = [
  { subtitle: 'Step 1 of 4', title: 'Personal Details' },
  { subtitle: 'Step 2 of 4', title: 'Verify Phone' },
  { subtitle: 'Step 3 of 4', title: 'Hotel Details' },
  { subtitle: 'Step 4 of 4', title: 'Choose Your Plan' },
];

const addHotelStepTitles: Record<number, { subtitle: string; title: string }> = {
  2: { subtitle: 'Step 1 of 2', title: 'Hotel Details' },
  3: { subtitle: 'Step 2 of 2', title: 'Choose Your Plan' },
};

export default function Register() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  // Lock at mount — don't let login() mid-flow change the step layout
  const [isAddingHotel] = useState(isAuthenticated);
  const scrollRef = useRef<ScrollView>(null);
  const [step, setStep] = useState(isAddingHotel ? 2 : 0);
  const [loading, setLoading] = useState(false);

  const [personal, setPersonal] = useState({
    fullName: '', email: '', mobile: '',
  });

  const [hotel, setHotel] = useState({
    hotelName: '',
    address: '',
    pincode: '',
    city: '',
    state: '',
    districtId: '',
    districtName: '',
  });

  // OTP state
  const [otp, setOtp] = useState('');
  const [otpHint, setOtpHint] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpFocused, setOtpFocused] = useState(false);

  // Stored after registration
  const [createdHotelId, setCreatedHotelId] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const goNext = () => {
    if (step < FULL_STEPS.length - 1) {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      setStep((s) => s + 1);
    }
  };

  const goBack = () => {
    if (step === 1) {
      return;
    }
    if (isAddingHotel && step === 2) {
      router.back();
      return;
    }
    if (step > 0) {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      setStep((s) => s - 1);
    } else {
      router.back();
    }
  };

  // Step 0 → 1: Register owner, get OTP
  const handlePersonalNext = async () => {
    setLoading(true);
    try {
      const fullPhone = `+91${personal.mobile.trim()}`;
      const regRes = await ownerRegister(
        personal.fullName.trim(),
        fullPhone,
        personal.email.trim() || undefined,
      );
      // Backend returns OTP in dev mode
      setOtpHint(regRes.otp || '');
      setOtp('');
      setOtpError('');
      goNext();
    } catch (err: any) {
      Alert.alert('Registration Failed', err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Step 1 → 2: Verify OTP
  const handleOtpVerify = async () => {
    setLoading(true);
    setOtpError('');
    try {
      const fullPhone = `+91${personal.mobile.trim()}`;
      const verifyRes = await ownerVerifyOtp(fullPhone, otp.trim());
      login(verifyRes.token, 'owner');
      goNext();
    } catch (err: any) {
      setOtpError(err.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  // Step 2 → 3: Create hotel
  const handleHotelNext = async () => {
    setLoading(true);
    try {
      const res = await addHotel({
        name: hotel.hotelName.trim(),
        address: hotel.address.trim(),
        city: hotel.city.trim() || undefined,
        state: hotel.state.trim() || undefined,
        pincode: hotel.pincode.trim() || undefined,
        districtId: hotel.districtId || undefined,
        latitude: 0,
        longitude: 0,
      });
      setCreatedHotelId(res.hotel.id);
      goNext();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not create hotel');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = () => {
    setShowConfirm(true);
  };

  // Step 3: Subscribe hotel then navigate
  const confirmPayment = async () => {
    setShowConfirm(false);
    setLoading(true);
    try {
      if (createdHotelId) {
        await subscribeHotel(createdHotelId);
      }
      router.replace('/hotels');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Subscription failed');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (step === 0) handlePersonalNext();
    else if (step === 1) handleOtpVerify();
    else if (step === 2) handleHotelNext();
    else handlePayment();
  };

  // Validation
  const isStep0Valid = !!(personal.fullName && personal.mobile && personal.mobile.length === 10);
  const isStep1Valid = otp.trim().length === 6;
  const isStep2Valid = !!(hotel.hotelName && hotel.address && hotel.state && hotel.districtId);

  const canProceed =
    step === 0 ? isStep0Valid :
    step === 1 ? isStep1Valid :
    step === 2 ? isStep2Valid :
    true;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bgPrimary }}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bgPrimary} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 }}>
          <TouchableOpacity
            onPress={goBack}
            disabled={!isAddingHotel && step === 1}
            style={{
              width: 42, height: 42, borderRadius: 14,
              backgroundColor: '#EDE9FE',
              alignItems: 'center', justifyContent: 'center', marginRight: 12,
              opacity: !isAddingHotel && step === 1 ? 0.4 : 1,
            }}
          >
            <Ionicons name="chevron-back" size={22} color={Colors.accent} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, fontWeight: '800', color: Colors.accent, letterSpacing: 2, textTransform: 'uppercase' }}>
              {(isAddingHotel ? addHotelStepTitles[step] : fullStepTitles[step]).subtitle}
            </Text>
            <Text style={{ fontSize: 22, fontWeight: '900', color: Colors.heading, lineHeight: 28 }}>
              {(isAddingHotel ? addHotelStepTitles[step] : fullStepTitles[step]).title}
            </Text>
          </View>
          <Image
            source={require('../assets/images/icon.png')}
            style={{ width: 38, height: 38 }}
            resizeMode="contain"
          />
        </View>

        {/* Step Indicator */}
        <StepIndicator currentStep={isAddingHotel ? step - 2 : step} steps={isAddingHotel ? ADD_HOTEL_STEPS : FULL_STEPS} />

        {/* Scrollable Step Content */}
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          {step === 0 && (
            <PersonalDetailsForm
              data={personal}
              onChange={(k, v) => setPersonal((p) => ({ ...p, [k]: v }))}
            />
          )}
          {step === 1 && (
            <View style={{ paddingHorizontal: 24, paddingTop: 8 }}>
              {/* OTP Banner */}
              <View style={s.banner}>
                <View style={s.bannerIcon}>
                  <Ionicons name="chatbubble-ellipses" size={18} color={Colors.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.bannerTitle}>OTP Sent</Text>
                  <Text style={s.bannerBody}>
                    A 6-digit code was sent to +91 {personal.mobile}
                  </Text>
                </View>
              </View>

              {/* OTP Input */}
              <Text style={s.label}>ENTER OTP</Text>
              <View style={[s.inputRow, otpFocused && s.inputRowFocused]}>
                <Ionicons
                  name="key-outline"
                  size={18}
                  color={otpFocused ? Colors.accent : '#9CA3AF'}
                  style={{ marginRight: 10 }}
                />
                <TextInput
                  style={s.input}
                  placeholder="Enter 6-digit OTP"
                  placeholderTextColor="#C4C9D4"
                  value={otp}
                  onChangeText={(t) => {
                    setOtpError('');
                    setOtp(t.replace(/\D/g, '').slice(0, 6));
                  }}
                  onFocus={() => setOtpFocused(true)}
                  onBlur={() => setOtpFocused(false)}
                  keyboardType="number-pad"
                  autoFocus
                />
              </View>

              {otpError ? (
                <Text style={s.error}>{otpError}</Text>
              ) : null}

              {/* Dev hint */}
              {otpHint ? (
                <View style={s.hintBox}>
                  <Text style={s.hintTitle}>Dev OTP:</Text>
                  <Text style={s.hintCode}>{otpHint}</Text>
                </View>
              ) : null}
            </View>
          )}
          {step === 2 && (
            <HotelDetailsForm
              data={hotel}
              onChange={(k, v) => setHotel((h) => ({ ...h, [k]: v }))}
            />
          )}
          {step === 3 && (
            <PaymentStep />
          )}
        </ScrollView>

        {/* Pinned Bottom Buttons */}
        <View style={{ paddingHorizontal: 24, paddingVertical: 16, flexDirection: 'row', gap: 12, borderTopWidth: 1, borderTopColor: '#F0EAFF', backgroundColor: Colors.bgPrimary }}>
          {step > 1 && (
            <TouchableOpacity
              onPress={goBack}
              disabled={loading}
              style={{
                flex: 1, height: 56, borderRadius: 99,
                borderWidth: 2, borderColor: Colors.accent,
                alignItems: 'center', justifyContent: 'center', flexDirection: 'row',
                opacity: loading ? 0.5 : 1,
              }}
            >
              <Ionicons name="arrow-back" size={17} color={Colors.accent} />
              <Text style={{ color: Colors.accent, fontWeight: '900', fontSize: 15, marginLeft: 6 }}>Back</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={handleContinue}
            disabled={!canProceed || loading}
            style={{
              flex: step > 1 ? 2 : 1,
              height: 56, borderRadius: 99,
              backgroundColor: canProceed && !loading ? Colors.accent : '#DDD6FE',
              alignItems: 'center', justifyContent: 'center', flexDirection: 'row',
              elevation: canProceed && !loading ? 8 : 0,
              shadowColor: Colors.accent,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
            }}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : step === 3 ? (
              <>
                <Ionicons name="card-outline" size={18} color="#fff" />
                <Text style={{ color: '#fff', fontWeight: '900', fontSize: 15, marginLeft: 8 }}>Pay ₹27,000</Text>
              </>
            ) : step === 1 ? (
              <>
                <Ionicons name="shield-checkmark-outline" size={18} color="#fff" />
                <Text style={{ color: '#fff', fontWeight: '900', fontSize: 15, marginLeft: 8 }}>Verify OTP</Text>
              </>
            ) : (
              <>
                <Text style={{ color: '#fff', fontWeight: '900', fontSize: 15, marginRight: 8 }}>Continue</Text>
                <Ionicons name="arrow-forward" size={17} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>

      {/* Payment Confirmation Modal */}
      <ConfirmPaymentModal
        visible={showConfirm}
        onConfirm={confirmPayment}
        onCancel={() => setShowConfirm(false)}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  banner: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    borderRadius: 16, backgroundColor: '#EDE9FE', marginBottom: 24, gap: 12,
  },
  bannerIcon: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: Colors.accent + '20',
    alignItems: 'center', justifyContent: 'center',
  },
  bannerTitle: { fontSize: 14, fontWeight: '900', color: Colors.heading },
  bannerBody: { fontSize: 12, color: Colors.body, marginTop: 2 },
  label: {
    fontSize: 10, fontWeight: '800', letterSpacing: 2, color: '#9CA3AF',
    marginBottom: 8, marginLeft: 4, textTransform: 'uppercase',
  },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F9FAFB', borderRadius: 14,
    borderWidth: 1.5, borderColor: '#E5E7EB',
    paddingHorizontal: 14, height: 54, marginBottom: 12,
  },
  inputRowFocused: {
    borderColor: Colors.accent,
    backgroundColor: '#FDFBFF',
  },
  input: {
    flex: 1, fontSize: 18, color: Colors.heading,
    fontWeight: '700', letterSpacing: 4,
  },
  error: {
    color: '#EF4444', fontSize: 12, fontWeight: '600', marginLeft: 4, marginBottom: 12,
  },
  hintBox: {
    marginTop: 8, padding: 16, backgroundColor: '#F3F4FB',
    borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB',
  },
  hintTitle: {
    fontSize: 12, fontWeight: '800', color: Colors.heading,
    marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1,
  },
  hintCode: {
    fontSize: 22, color: Colors.accent, fontWeight: '900', letterSpacing: 6,
  },
});
