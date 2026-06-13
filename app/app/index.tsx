import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  Animated,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
  StatusBar,
  Modal,
  StyleSheet,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import OnboardingItem, { Slide } from '../components/OnboardingItem';
import { Colors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';

const slides: Slide[] = [
  {
    id: '1',
    subtitle: 'Your Identity',
    title: 'One ID,\nEverywhere.',
    body: 'Store all your IDs securely in one place. Aadhaar, PAN, licence — always at your fingertips.',
    icon: 'id-card',
    bubbleBg: Colors.peach,
    iconColor: Colors.peachIcon,
  },
  {
    id: '2',
    subtitle: 'Instant Verify',
    title: 'Verify in\nSeconds.',
    body: 'Scan a QR code to share only what\'s needed. No paperwork, no waiting — just instant, trusted verification.',
    icon: 'scan',
    bubbleBg: Colors.mint,
    iconColor: Colors.mintIcon,
  },
  {
    id: '3',
    subtitle: 'Privacy First',
    title: 'You Control\nYour Data.',
    body: 'Share selectively and revoke access any time. Your data stays encrypted on your device — always.',
    icon: 'lock-closed',
    bubbleBg: Colors.sky,
    iconColor: Colors.skyIcon,
  },
];

export default function Index() {
  const { isAuthenticated, role } = useAuth();
  const { width } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showChoice, setShowChoice] = useState(false);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatRef = useRef<FlatList>(null);
  const router = useRouter();
  const onViewRef = useRef(({ viewableItems }: any) => {
    if (viewableItems[0]) setCurrentIndex(viewableItems[0].index);
  });
  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 });

  if (isAuthenticated) {
    return <Redirect href={role === 'manager' ? '/manager-dashboard' : '/hotels'} />;
  }

  const goNext = () => {
    if (currentIndex < slides.length - 1) {
      flatRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      setShowChoice(true);
    }
  };

  const skip = () => setShowChoice(true);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: Colors.bgPrimary }}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bgPrimary} />

      {/* ── Top bar ─────────────────────────── */}
      <View className="flex-row justify-between items-center px-8 pt-4">
        <View className="flex-row items-center gap-2">
            <Image
              source={require('../assets/images/icon.png')}
              style={{ width: 38, height: 38 }}
              resizeMode="contain"
            />
          <Text className="text-xl font-black tracking-widest" style={{ color: Colors.heading }}>
            Pahchaan ID
          </Text>
        </View>

        <TouchableOpacity
          onPress={skip}
          activeOpacity={0.7}
          className="px-5 py-2 rounded-full"
          style={{ backgroundColor: '#EDE9FE' }}
        >
          <Text className="text-sm font-bold" style={{ color: Colors.accent }}>
            Skip
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Slides ─────────────────────────── */}
      <View className="flex-1">
        <FlatList
          ref={flatRef}
          data={slides}
          renderItem={({ item }) => <OnboardingItem item={item} />}
          horizontal
          pagingEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(i) => i.id}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          onViewableItemsChanged={onViewRef.current}
          viewabilityConfig={viewConfig.current}
        />
      </View>

      {/* ── Footer ──────────────────────────── */}
      <View className="px-8 pb-12 flex-row items-center justify-between">
        <View className="flex-row items-center">
          {slides.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const dotW = scrollX.interpolate({
              inputRange,
              outputRange: [8, 28, 8],
              extrapolate: 'clamp',
            });
            const bg = scrollX.interpolate({
              inputRange,
              outputRange: [Colors.dotInactive, Colors.dotActive, Colors.dotInactive],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={i}
                style={{
                  width: dotW,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: bg,
                  marginRight: 6,
                }}
              />
            );
          })}
        </View>

        <TouchableOpacity
          onPress={goNext}
          activeOpacity={0.85}
          className="flex-row items-center gap-3 px-8 py-5 rounded-full"
          style={{ backgroundColor: Colors.accent, elevation: 10 }}
        >
          <Text className="text-base font-black" style={{ color: '#fff' }}>
            {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* ── Auth Choice Bottom Sheet ─────────── */}
      <Modal
        visible={showChoice}
        transparent
        animationType="slide"
        onRequestClose={() => setShowChoice(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setShowChoice(false)}
        />
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <Text style={styles.sheetTitle}>Welcome to Pahchaan ID</Text>
          <Text style={styles.sheetSubtitle}>New user or already have an account?</Text>

          {/* Register */}
          <TouchableOpacity
            style={[styles.optionBtn, { backgroundColor: Colors.accent }]}
            activeOpacity={0.85}
            onPress={() => { setShowChoice(false); router.push('/register'); }}
          >
            <View style={styles.optionIcon}>
              <Ionicons name="person-add-outline" size={20} color={Colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionTitle}>Create Account</Text>
              <Text style={styles.optionDescLight}>Register your hotel for the first time</Text>
            </View>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>

          {/* Login */}
          <TouchableOpacity
            style={[styles.optionBtn, styles.optionBtnOutline]}
            activeOpacity={0.85}
            onPress={() => { setShowChoice(false); router.push('/login'); }}
          >
            <View style={[styles.optionIcon, { backgroundColor: '#EDE9FE' }]}>
              <Ionicons name="log-in-outline" size={20} color={Colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.optionTitle, { color: Colors.heading }]}>Already Registered</Text>
              <Text style={styles.optionDescDark}>Sign in to your existing account</Text>
            </View>
            <Ionicons name="arrow-forward" size={18} color={Colors.accent} />
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingBottom: 44,
    paddingTop: 16,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 24,
  },
  sheetTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.heading,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  sheetSubtitle: {
    fontSize: 14,
    color: Colors.body,
    marginBottom: 28,
    lineHeight: 20,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  optionBtnOutline: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 2,
  },
  optionDescLight: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
  },
  optionDescDark: {
    fontSize: 12,
    color: Colors.body,
  },
});
