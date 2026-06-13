import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import tabStyles from './shared/tabStyles';

interface SubscriptionTabProps {
  subscription: {
    id: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
  } | null;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' });
}

function getDaysLeft(endDate: string) {
  const end = new Date(endDate).getTime();
  const now = Date.now();
  const diff = end - now;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function getProgress(startDate: string, endDate: string) {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const now = Date.now();
  const total = end - start;
  if (total <= 0) return 0;
  const elapsed = now - start;
  const remaining = Math.max(0, Math.min(100, ((total - elapsed) / total) * 100));
  return Math.round(remaining);
}

const SubscriptionTab = ({ subscription }: SubscriptionTabProps) => {
  const daysLeft = subscription ? getDaysLeft(subscription.endDate) : 0;
  const progress = subscription ? getProgress(subscription.startDate, subscription.endDate) : 0;
  const isActive = subscription?.isActive && daysLeft > 0;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
      <View style={tabStyles.planCard}>
        <View style={{ position: 'absolute', top: -30, right: -30, width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(255,255,255,0.08)' }} />
        <View style={{ position: 'absolute', bottom: -20, left: -20, width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(255,255,255,0.06)' }} />
        <View style={tabStyles.planLabel}>
          <Text style={tabStyles.planLabelText}>✦ PRO PLAN</Text>
        </View>
        <Text style={tabStyles.planPrice}>₹27,000</Text>
        <Text style={tabStyles.planPriceSub}>per year · billed annually</Text>
        <View style={tabStyles.planBadge}>
          <Text style={tabStyles.planBadgeText}>
            {isActive ? 'Active' : subscription ? 'Expired' : 'No Subscription'}
          </Text>
        </View>
      </View>

      {subscription ? (
        <>
          {/* Validity Timer Section */}
          <Text style={tabStyles.sectionTitle}>Subscription Validity</Text>
          <View style={tabStyles.timerCard}>
            <View style={tabStyles.timerRow}>
              <View style={tabStyles.timerIconWrap}>
                <Ionicons name="time" size={24} color={isActive ? Colors.accent : '#DC2626'} />
              </View>
              <View>
                <Text style={tabStyles.timerValue}>
                  {daysLeft > 0 ? `${daysLeft} Day${daysLeft !== 1 ? 's' : ''} Left` : 'Expired'}
                </Text>
                <Text style={tabStyles.timerSub}>
                  Valid until {formatDate(subscription.endDate)}
                </Text>
              </View>
            </View>

            <View style={tabStyles.progressContainer}>
              <View style={tabStyles.progressTrack}>
                <View style={[tabStyles.progressBar, { width: `${progress}%` }]} />
              </View>
              <Text style={tabStyles.progressLabel}>
                {progress}% of plan period remaining
              </Text>
            </View>
          </View>

          <Text style={tabStyles.sectionTitle}>Plan Details</Text>
          {[
            { icon: 'calendar-outline', label: 'Plan Start', value: formatDate(subscription.startDate) },
            { icon: 'alarm-outline', label: 'Renewal Date', value: formatDate(subscription.endDate) },
            { icon: 'shield-checkmark-outline', label: 'Status', value: isActive ? 'Active' : 'Expired' },
          ].map((item, i) => (
            <View key={i} style={tabStyles.infoRow}>
              <View style={tabStyles.infoIconWrap}>
                <Ionicons name={item.icon as any} size={18} color={Colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={tabStyles.infoLabel}>{item.label}</Text>
                <Text style={tabStyles.infoValue}>{item.value}</Text>
              </View>
            </View>
          ))}
        </>
      ) : (
        <View style={{ alignItems: 'center', paddingTop: 40 }}>
          <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: '#FEF3C7', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <Ionicons name="alert-circle-outline" size={32} color="#D97706" />
          </View>
          <Text style={{ fontSize: 16, fontWeight: '800', color: Colors.heading, marginBottom: 6 }}>No Active Subscription</Text>
          <Text style={{ fontSize: 13, color: Colors.body, textAlign: 'center', lineHeight: 20 }}>Contact your hotel owner for subscription details.</Text>
        </View>
      )}
    </ScrollView>
  );
};

export default SubscriptionTab;
