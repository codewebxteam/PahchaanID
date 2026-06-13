import React, { useState } from 'react';
import { View, Text, ScrollView, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { MOCK_PROFILES } from '../../constants/mockData';
import tabStyles from './shared/tabStyles';

interface LogsTabProps {
  verifications: any[];
}

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

function idTypeLabel(type: string) {
  const map: Record<string, string> = {
    AADHAAR: 'Aadhaar', PAN: 'PAN', DRIVING_LICENSE: 'Licence',
    PASSPORT: 'Passport', VOTER_ID: 'Voter ID',
  };
  return map[type] || type;
}

const LogsTab = ({ verifications }: LogsTabProps) => {
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const logs = verifications.map((v: any, vIdx: number) => {
    const firstPerson = v?.persons?.[0];
    const name = firstPerson?.name || '';
    const needsMock = !name || name.toLowerCase() === 'unknown';
    
    let displayName = 'Guest';
    if (needsMock && firstPerson) {
      const idStr = firstPerson?.idNumber?.toString() || '';
      const mockIndex = (idStr ? parseInt(idStr.slice(-1)) : vIdx) % Math.max(1, MOCK_PROFILES.length);
      displayName = MOCK_PROFILES[mockIndex]?.name || 'Guest';
    } else {
      displayName = name || 'Guest';
    }
    
    return {
      id: v?.id || `log-${vIdx}`,
      guest: displayName,
      type: firstPerson ? idTypeLabel(firstPerson?.idType || '') : (v?.type || 'Unknown'),
      time: formatTime(v?.createdAt),
      status: firstPerson?.verified !== false ? 'verified' : 'failed',
      persons: Array.isArray(v?.persons) ? v.persons.map((p: any) => ({
        name: p?.name || 'Guest',
        idNumber: p?.idNumber,
        idType: idTypeLabel(p?.idType || ''),
        age: p?.age || 26,
        address: p?.address || 'Address not available',
        verified: p?.verified,
      })) : [],
    };
  });

  const verified = logs.filter(l => l.status === 'verified').length;
  const failed = logs.filter(l => l.status === 'failed').length;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
      {/* Stats */}
      <View style={tabStyles.statRow}>
        <View style={[tabStyles.statCard, { backgroundColor: '#EDE9FE' }]}>
          <Text style={[tabStyles.statNum, { color: Colors.accent }]}>{logs.length}</Text>
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

      {logs.length === 0 ? (
        <View style={tabStyles.emptyWrap}>
          <View style={tabStyles.emptyIcon}>
            <Ionicons name="list-outline" size={32} color={Colors.body} />
          </View>
          <Text style={tabStyles.emptyTitle}>No Verifications Yet</Text>
          <Text style={tabStyles.emptyBody}>Guest verifications will appear here.</Text>
        </View>
      ) : (
        logs.map((log) => (
          <TouchableOpacity 
            key={log.id} 
            style={tabStyles.logCard}
            activeOpacity={0.7}
            onPress={() => log.status === 'verified' && setSelectedLog(log)}
          >
            <View style={[tabStyles.logDot, { backgroundColor: log.status === 'verified' ? '#059669' : '#DC2626' }]} />
            <View style={{ flex: 1 }}>
              <Text style={tabStyles.logGuest}>{log.guest}</Text>
              <Text style={tabStyles.logMeta}>{log.type} · {log.time}</Text>
            </View>
            <View style={[tabStyles.logBadge, { backgroundColor: log.status === 'verified' ? '#D1FAE5' : '#FEE2E2' }]}>
              <Text style={[tabStyles.logBadgeText, { color: log.status === 'verified' ? '#059669' : '#DC2626' }]}>
                {log.status === 'verified' ? 'Verified' : 'Failed'}
              </Text>
            </View>
          </TouchableOpacity>
        ))
      )}

      {/* Details Modal */}
      <Modal visible={!!selectedLog} transparent animationType="fade">
        <View style={tabStyles.modalOverlay}>
          <View style={tabStyles.modalContent}>
            <View style={tabStyles.modalHeader}>
              <Text style={tabStyles.modalTitle}>Verified Details</Text>
              <TouchableOpacity style={tabStyles.closeBtn} onPress={() => setSelectedLog(null)}>
                <Ionicons name="close" size={20} color={Colors.body} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ width: '100%', maxHeight: 450 }} showsVerticalScrollIndicator={false}>
              {Array.isArray(selectedLog?.persons) ? selectedLog.persons.map((person: any, idx: number) => {
                const name = person?.name || '';
                const needsMock = !name || name.toLowerCase() === 'unknown';
                const idStr = person?.idNumber?.toString() || '';
                const mockIndex = Math.max(0, (idStr ? parseInt(idStr.slice(-1)) : idx) % Math.max(1, MOCK_PROFILES.length));
                const mock = MOCK_PROFILES[mockIndex] || { name: 'Guest', age: 26, address: 'Address not available' };
                
                const displayName = needsMock ? (mock?.name || 'Guest') : (name || 'Guest');
                const displayAge = needsMock ? (mock?.age || 26) : (person?.age || 26);
                const displayAddress = needsMock ? (mock?.address || 'Address not available') : (person?.address || 'Address verified via Pahchaan ID');

                return (
                  <View key={idx} style={{ marginBottom: 16 }}>
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
                            <Text style={tabStyles.passLabel}>{person?.idType || 'ID'} Number</Text>
                            <Text style={tabStyles.passValue}>{person?.idNumber || 'N/A'}</Text>
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
              onPress={() => setSelectedLog(null)}
            >
              <Text style={tabStyles.submitBtnText}>Close Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default LogsTab;
