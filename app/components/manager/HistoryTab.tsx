import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { MOCK_PROFILES } from '../../constants/mockData';
import tabStyles from './shared/tabStyles';
import { getManagerVerifications } from '../../services/api';

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();
  const time = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  if (isToday) return `Today, ${time}`;
  if (isYesterday) return `Yesterday, ${time}`;
  return `${d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}, ${time}`;
}

function typeLabel(type: string) {
  const map: Record<string, string> = {
    FAMILY: 'Family', COUPLE: 'Couple', PROFESSIONAL: 'Professional', STUDENT: 'Student',
  };
  return map[type] || type;
}

function idTypeLabel(type: string) {
  const map: Record<string, string> = {
    AADHAAR: 'Aadhaar', PAN: 'PAN', DRIVING_LICENSE: 'Licence',
    PASSPORT: 'Passport', VOTER_ID: 'Voter ID',
  };
  return map[type] || type;
}

const HistoryTab = () => {
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getManagerVerifications();
        setVerifications(res.verifications || []);
      } catch {
        // empty
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const history = verifications.map((v: any) => {
    const label = typeLabel(v?.type || '');
    const persons = Array.isArray(v?.persons) ? v.persons.filter((p: any) => p) : [];
    const allVerified = persons.length > 0 && persons.every((p: any) => p?.verified !== false);
    const memberCount = v?.type === 'COUPLE' ? '2 guests' : `${(v?.adults || 1) + (v?.children || 0)} member(s)`;
    
    // Helper to get name with mock fallback (null-safe)
    const getGuestName = (p: any, idx: number): string => {
      // Handle undefined or null person
      if (!p) {
        const mockIndex = Math.max(0, idx % Math.max(1, MOCK_PROFILES.length));
        return MOCK_PROFILES[mockIndex]?.name || 'Guest';
      }
      const name = p?.name || '';
      const needsMock = !name || name.toLowerCase() === 'unknown';
      if (!needsMock) return name;
      const idStr = p?.idNumber?.toString() || '';
      const mockIndex = (idStr ? parseInt(idStr.slice(-1)) : idx) % Math.max(1, MOCK_PROFILES.length);
      return MOCK_PROFILES[mockIndex]?.name || 'Guest';
    };

    const firstName = persons.length > 0 ? getGuestName(persons[0], 0) : getGuestName(null, 0);
    const displayName = (v?.type === 'COUPLE' && persons.length >= 2)
      ? `${getGuestName(persons[0], 0)} & ${getGuestName(persons[1] || null, 1)}`
      : v?.type === 'FAMILY'
        ? `${firstName} Family`
        : firstName || 'Guest';

    return {
      id: v?.id || '',
      name: displayName || 'Guest',
      type: label || 'Unknown',
      members: memberCount || '0 members',
      time: formatTime(v?.createdAt || new Date().toISOString()),
      status: allVerified ? 'verified' : 'failed',
      guests: Array.isArray(persons) ? persons.map((p: any) => ({
        name: p?.name || 'Guest',
        idNumber: p?.idNumber,
        idType: idTypeLabel(p?.idType || ''),
        verified: p?.verified,
      })) : [],
    };
  });

  const verified = history.filter(h => h.status === 'verified').length;
  const failed = history.filter(h => h.status === 'failed').length;

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
      <View style={tabStyles.statRow}>
        <View style={[tabStyles.statCard, { backgroundColor: '#EDE9FE' }]}>
          <Text style={[tabStyles.statNum, { color: Colors.accent }]}>{history.length}</Text>
          <Text style={[tabStyles.statLabel, { color: Colors.accent }]}>Total</Text>
        </View>
        <View style={[tabStyles.statCard, { backgroundColor: '#D1FAE5' }]}>
          <Text style={[tabStyles.statNum, { color: '#059669' }]}>{verified}</Text>
          <Text style={[tabStyles.statLabel, { color: '#059669' }]}>Verified</Text>
        </View>
        <View style={[tabStyles.statCard, { backgroundColor: '#FEE2E2' }]}>
          <Text style={[tabStyles.statNum, { color: '#DC2626' }]}>{failed}</Text>
          <Text style={[tabStyles.statLabel, { color: '#DC2626' }]}>Failed</Text>
        </View>
      </View>

      {history.length === 0 ? (
        <View style={tabStyles.emptyWrap}>
          <View style={tabStyles.emptyIcon}>
            <Ionicons name="time-outline" size={32} color={Colors.body} />
          </View>
          <Text style={tabStyles.emptyTitle}>No History Yet</Text>
          <Text style={tabStyles.emptyBody}>Completed verifications will appear here.</Text>
        </View>
      ) : (
        history.map((h) => (
          <TouchableOpacity
            key={h.id}
            style={tabStyles.historyCard}
            activeOpacity={0.7}
            onPress={() => h.status === 'verified' && setSelectedUser(h)}
          >
            <View style={[tabStyles.historyTypeWrap, { backgroundColor: h.type === 'Family' ? '#EDE9FE' : h.type === 'Couple' ? '#FCE7F3' : '#E0F2FE' }]}>
              <Ionicons
                name={h.type === 'Family' ? 'people' : h.type === 'Couple' ? 'heart' : 'person'}
                size={20}
                color={h.type === 'Family' ? Colors.accent : h.type === 'Couple' ? '#DB2777' : '#0EA5E9'}
              />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingRight: 4 }}>
                <Text style={[tabStyles.historyName, { flexShrink: 1 }]} numberOfLines={1}>
                  {h.name}
                </Text>
                <View style={[tabStyles.historyTypeBadge, { backgroundColor: h.type === 'Family' ? '#EDE9FE' : h.type === 'Couple' ? '#FCE7F3' : '#E0F2FE' }]}>
                  <Text style={[tabStyles.historyTypeBadgeText, { color: h.type === 'Family' ? Colors.accent : h.type === 'Couple' ? '#DB2777' : '#0EA5E9' }]}>{h.type}</Text>
                </View>
              </View>
              <Text style={tabStyles.historyMeta}>{h.members} · {h.time}</Text>
            </View>
            <View style={[tabStyles.historyStatus, { backgroundColor: h.status === 'verified' ? '#D1FAE5' : '#FEE2E2' }]}>
              <Ionicons name={h.status === 'verified' ? 'checkmark' : 'close'} size={13} color={h.status === 'verified' ? '#059669' : '#DC2626'} />
            </View>
          </TouchableOpacity>
        ))
      )}

      {/* Details Modal */}
      <Modal visible={!!selectedUser} transparent animationType="fade">
        <View style={tabStyles.modalOverlay}>
          <View style={tabStyles.modalContent}>
            <View style={tabStyles.modalHeader}>
              <Text style={tabStyles.modalTitle}>Verified Details</Text>
              <TouchableOpacity style={tabStyles.closeBtn} onPress={() => setSelectedUser(null)}>
                <Ionicons name="close" size={20} color={Colors.body} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ width: '100%', maxHeight: 450 }} showsVerticalScrollIndicator={false}>
              {Array.isArray(selectedUser?.guests) ? selectedUser.guests.map((guest: any, idx: number) => {
                const name = guest?.name || '';
                const needsMock = !name || name.toLowerCase() === 'unknown';
                const idStr = guest?.idNumber?.toString() || '';
                const mockIndex = Math.max(0, (idStr ? parseInt(idStr.slice(-1)) : idx) % Math.max(1, MOCK_PROFILES.length));
                const mock = MOCK_PROFILES[mockIndex] || { name: 'Guest', age: 26, address: 'Address not available' };
                
                const displayName = needsMock ? (mock?.name || 'Guest') : (name || 'Guest');
                const displayAge = needsMock ? (mock?.age || 26) : (guest?.age || 26);
                const displayAddress = needsMock ? (mock?.address || 'Address not available') : (guest?.address || 'Address verified via Pahchaan ID');

                return (
                  <View key={idx} style={{ marginBottom: 16 }}>
                    {selectedUser?.type === 'Couple' && (
                      <Text style={tabStyles.guestLabel}>Guest {idx + 1}</Text>
                    )}
                    <View style={tabStyles.detailCard}>
                      <View style={tabStyles.passHeader}>
                        <Text style={tabStyles.passName} numberOfLines={1}>{displayName}</Text>
                        <View style={tabStyles.verifiedBadge}>
                          <Ionicons name="shield-checkmark-outline" size={10} color="#059669" />
                          <Text style={tabStyles.verifiedBadgeText}>VERIFIED</Text>
                        </View>
                      </View>

                      <View style={tabStyles.passBody}>
                        <View style={tabStyles.passDetailsRow}>
                          <View style={tabStyles.passItem}>
                            <Text style={tabStyles.passLabel}>{guest?.idType || 'ID'} Number</Text>
                            <Text style={tabStyles.passValue}>{guest?.idNumber || 'N/A'}</Text>
                          </View>
                          <View style={{ width: 1, backgroundColor: '#F3F4FB' }} />
                          <View style={{ width: 40 }}>
                            <Text style={tabStyles.passLabel}>Age</Text>
                            <Text style={tabStyles.passValue}>{displayAge}</Text>
                          </View>
                        </View>
                      </View>

                      <View style={tabStyles.passFooterAddress}>
                        <View style={tabStyles.addressBox}>
                          <Ionicons name="location-outline" size={16} color="#9CA3AF" />
                          <Text style={tabStyles.addressText} numberOfLines={2}>{displayAddress}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              }) : null}
            </ScrollView>

            <TouchableOpacity
              style={[tabStyles.submitBtn, { marginTop: 20 }]}
              onPress={() => setSelectedUser(null)}
            >
              <Text style={tabStyles.submitBtnText}>Close Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default HistoryTab;
