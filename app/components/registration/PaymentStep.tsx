import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

const featureList = [
  { icon: 'shield-checkmark', label: 'Biometric-verified Guest IDs' },
  { icon: 'scan', label: 'Instant QR Check-in Verification' },
  { icon: 'lock-closed', label: 'Encrypted Guest Data Storage' },
  { icon: 'people', label: 'Unlimited Guest Registrations' },
  { icon: 'analytics', label: 'Verification Analytics Dashboard' },
  { icon: 'headset', label: 'Priority 24/7 Support' },
];

// No buttons — they live in register.tsx pinned at bottom
const PaymentStep: React.FC = () => {
  return (
    <View style={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 8 }}>
      {/* Plan Card */}
      <View
        style={{
          borderRadius: 28,
          backgroundColor: Colors.accent,
          padding: 28,
          marginBottom: 20,
          overflow: 'hidden',
          elevation: 14,
          shadowColor: Colors.accent,
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.3,
          shadowRadius: 18,
        }}
      >
        {/* Decorative circles */}
        <View style={{ position: 'absolute', top: -30, right: -30, width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(255,255,255,0.08)' }} />
        <View style={{ position: 'absolute', bottom: -20, left: -20, width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(255,255,255,0.06)' }} />

        <View style={{ alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.18)', marginBottom: 16 }}>
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: '900', letterSpacing: 2 }}>✦ PRO PLAN</Text>
        </View>

        <Text style={{ color: '#fff', fontSize: 40, fontWeight: '900', letterSpacing: -1 }}>₹27,000</Text>
        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, marginTop: 4 }}>per year · billed annually</Text>

        <View style={{ marginTop: 16, alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.15)' }}>
          <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>Save ₹6,000 vs monthly billing</Text>
        </View>
      </View>

      {/* Features List */}
      <View
        style={{
          borderRadius: 24,
          backgroundColor: Colors.sky,
          padding: 20,
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 11, fontWeight: '900', color: Colors.skyIcon, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>
          Everything Included
        </Text>
        {featureList.map((f, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: i < featureList.length - 1 ? 14 : 0 }}>
            <View style={{ width: 34, height: 34, borderRadius: 11, backgroundColor: Colors.skyIcon + '20', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
              <Ionicons name={f.icon as any} size={16} color={Colors.skyIcon} />
            </View>
            <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.heading, flex: 1 }}>{f.label}</Text>
          </View>
        ))}
      </View>

      {/* Trust badge */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name="lock-closed" size={13} color={Colors.body} />
        <Text style={{ fontSize: 12, color: Colors.body, marginLeft: 6 }}>
          Secured via Razorpay · SSL Encrypted · Cancel Anytime
        </Text>
      </View>
    </View>
  );
};

export default PaymentStep;
