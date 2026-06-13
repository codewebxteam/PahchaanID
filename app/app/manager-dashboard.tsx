import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import { managerProfile } from '../services/api';

// Import Components
import HotelDetailsTab from '../components/manager/HotelDetailsTab';
import VerificationTab from '../components/manager/VerificationTab';
import HistoryTab from '../components/manager/HistoryTab';
import SubscriptionTab from '../components/manager/SubscriptionTab';

const TABS = [
  { key: 'verify', label: 'Verify', icon: 'scan' },
  { key: 'history', label: 'History', icon: 'time' },
  { key: 'details', label: 'Hotel', icon: 'business' },
  { key: 'subscription', label: 'Plan', icon: 'star' },
];

export default function ManagerDashboard() {
  const router = useRouter();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('verify');
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await managerProfile();
      setProfile(res.manager);
    } catch {
      // fallback to empty
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const hotelName = profile?.hotel?.name || 'Hotel';

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.bgPrimary} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bgPrimary} />

      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerSub}>Manager View</Text>
          <Text style={styles.headerTitle}>{hotelName}</Text>
        </View>
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => {
            logout();
            router.replace('/');
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={20} color={Colors.accent} />
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <View style={{ flex: 1 }}>
        {activeTab === 'verify' && <VerificationTab />}
        {activeTab === 'history' && <HistoryTab />}
        {activeTab === 'details' && <HotelDetailsTab profile={profile} />}
        {activeTab === 'subscription' && <SubscriptionTab subscription={profile?.hotel?.subscriptions?.[0] || null} />}
      </View>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabItem}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.8}
            >
              <View style={[styles.tabIconWrap, isActive && styles.tabIconWrapActive]}>
                <Ionicons
                  name={isActive ? (tab.icon as any) : `${tab.icon}-outline` as any}
                  size={20}
                  color={isActive ? Colors.accent : '#9CA3AF'}
                />
              </View>
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 14,
    gap: 12,
  },
  headerSub: { fontSize: 10, fontWeight: '700', letterSpacing: 2, color: Colors.body, textTransform: 'uppercase' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: Colors.heading },
  logoutBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#EDE9FE',
    alignItems: 'center', justifyContent: 'center',
  },
  tabBar: {
    flexDirection: 'row', backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#F0EAFF',
    paddingBottom: 8, paddingTop: 8, paddingHorizontal: 8,
  },
  tabItem: { flex: 1, alignItems: 'center', gap: 4 },
  tabIconWrap: { width: 44, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  tabIconWrapActive: {},
  tabLabel: { fontSize: 10, fontWeight: '600', color: '#9CA3AF' },
  tabLabelActive: { color: Colors.accent, fontWeight: '800' },
});
