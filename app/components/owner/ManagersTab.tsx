import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, Linking, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import tabStyles from './shared/tabStyles';
import { addManagerToHotel } from '../../services/api';

interface ManagersTabProps {
  managers: any[];
  hotelId: string;
  onManagerAdded: () => void;
}

const ManagersTab = ({ managers, hotelId, onManagerAdded }: ManagersTabProps) => {
  const [selected, setSelected] = useState<any>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!name.trim() || phone.trim().length < 10) return;
    setAdding(true);
    try {
      const fullPhone = phone.startsWith('+91') ? phone : `+91${phone.replace(/\D/g, '')}`;
      await addManagerToHotel(hotelId, name.trim(), fullPhone);
      setShowAdd(false);
      setName('');
      setPhone('');
      onManagerAdded();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to add manager');
    } finally {
      setAdding(false);
    }
  };

  const canAdd = name.trim().length > 0 && phone.replace(/\D/g, '').length >= 10;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
        {/* Stats */}
        <View style={tabStyles.statRow}>
          <View style={[tabStyles.statCard, { backgroundColor: '#EDE9FE' }]}>
            <Text style={[tabStyles.statNum, { color: Colors.accent }]}>{managers.length}</Text>
            <Text style={[tabStyles.statLabel, { color: Colors.accent }]}>Total</Text>
          </View>
          <View style={[tabStyles.statCard, { backgroundColor: '#D1FAE5' }]}>
            <Text style={[tabStyles.statNum, { color: '#059669' }]}>{managers.filter(m => m.hotelId).length}</Text>
            <Text style={[tabStyles.statLabel, { color: '#059669' }]}>Active</Text>
          </View>
          <View style={[tabStyles.statCard, { backgroundColor: '#FEF3C7' }]}>
            <Text style={[tabStyles.statNum, { color: '#D97706' }]}>{managers.filter(m => !m.hotelId).length}</Text>
            <Text style={[tabStyles.statLabel, { color: '#D97706' }]}>Inactive</Text>
          </View>
        </View>

        {managers.length === 0 ? (
          <View style={tabStyles.emptyWrap}>
            <View style={tabStyles.emptyIcon}>
              <Ionicons name="people-outline" size={32} color={Colors.body} />
            </View>
            <Text style={tabStyles.emptyTitle}>No Managers Yet</Text>
            <Text style={tabStyles.emptyBody}>Tap the button below to add your first manager.</Text>
          </View>
        ) : (
          managers.map((m) => (
            <TouchableOpacity
              key={m?.id}
              style={tabStyles.managerCard}
              activeOpacity={0.7}
              onPress={() => setSelected(m)}
            >
              <View style={tabStyles.managerAvatar}>
                <Text style={tabStyles.managerAvatarText}>{(m?.name || 'M')[0].toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={tabStyles.managerName}>{m?.name || 'Manager'}</Text>
                <Text style={tabStyles.managerMeta}>{m?.phone || 'N/A'} · Since {m?.createdAt ? new Date(m.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'Unknown'}</Text>
              </View>
              <View style={tabStyles.activePill}>
                <Text style={tabStyles.activePillText}>{m?.hotelId ? 'Active' : 'Inactive'}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Add Manager FAB */}
      <TouchableOpacity
        style={{
          position: 'absolute', bottom: 20, right: 24, left: 24,
          height: 52, borderRadius: 99, backgroundColor: Colors.accent,
          flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
          elevation: 6, shadowColor: Colors.accent, shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3, shadowRadius: 8,
        }}
        activeOpacity={0.85}
        onPress={() => setShowAdd(true)}
      >
        <Ionicons name="person-add" size={20} color="#fff" />
        <Text style={{ color: '#fff', fontSize: 15, fontWeight: '900' }}>Add Manager</Text>
      </TouchableOpacity>

      {/* Add Manager Modal */}
      <Modal transparent animationType="slide" visible={showAdd} onRequestClose={() => setShowAdd(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(28,28,46,0.55)', justifyContent: 'flex-end' }}>
          <View style={{
            backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32,
            padding: 24, paddingBottom: 36,
          }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB', alignSelf: 'center', marginBottom: 20 }} />

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 12 }}>
              <View style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: '#EDE9FE', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="person-add" size={22} color={Colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 17, fontWeight: '900', color: Colors.heading }}>Add Manager</Text>
                <Text style={{ fontSize: 12, color: Colors.body, fontWeight: '600', marginTop: 2 }}>Assign to this hotel</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowAdd(false)}
                style={{ width: 36, height: 36, borderRadius: 99, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' }}
              >
                <Ionicons name="close" size={20} color={Colors.body} />
              </TouchableOpacity>
            </View>

            {/* Name */}
            <Text style={{ fontSize: 10, fontWeight: '800', color: Colors.body, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 7 }}>Full Name</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', height: 50, paddingHorizontal: 14, backgroundColor: '#F4F0FF', borderRadius: 13, borderWidth: 1.5, borderColor: '#DDD6FE', gap: 10, marginBottom: 14 }}>
              <Ionicons name="person-outline" size={18} color={Colors.accent} />
              <TextInput
                placeholder="Manager's full name"
                placeholderTextColor="#C0B8D8"
                value={name}
                onChangeText={setName}
                style={{ flex: 1, fontSize: 14, color: Colors.heading, paddingVertical: 0 }}
              />
            </View>

            {/* Phone */}
            <Text style={{ fontSize: 10, fontWeight: '800', color: Colors.body, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 7 }}>Mobile Number</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', height: 50, paddingHorizontal: 14, backgroundColor: '#F4F0FF', borderRadius: 13, borderWidth: 1.5, borderColor: '#DDD6FE', gap: 10, marginBottom: 20 }}>
              <Ionicons name="call-outline" size={18} color={Colors.accent} />
              <Text style={{ fontSize: 14, color: Colors.heading, fontWeight: '600' }}>+91</Text>
              <TextInput
                placeholder="XXXXX XXXXX"
                placeholderTextColor="#C0B8D8"
                value={phone}
                onChangeText={(t) => setPhone(t.replace(/\D/g, '').slice(0, 10))}
                keyboardType="phone-pad"
                style={{ flex: 1, fontSize: 14, color: Colors.heading, paddingVertical: 0 }}
              />
            </View>

            <TouchableOpacity
              style={{
                height: 54, borderRadius: 99, backgroundColor: canAdd && !adding ? Colors.accent : '#DDD6FE',
                flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
                elevation: canAdd ? 6 : 0,
              }}
              onPress={handleAdd}
              disabled={!canAdd || adding}
              activeOpacity={0.85}
            >
              {adding ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900' }}>Add Manager</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Manager Detail Modal */}
      <Modal visible={!!selected} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 }}>
          <View style={{
            backgroundColor: '#fff', borderRadius: 32, padding: 28,
            elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.2, shadowRadius: 15,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <Text style={{ fontSize: 20, fontWeight: '900', color: Colors.heading }}>Manager Info</Text>
              <TouchableOpacity
                style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' }}
                onPress={() => setSelected(null)}
              >
                <Ionicons name="close" size={20} color={Colors.body} />
              </TouchableOpacity>
            </View>

            {selected && (
              <>
                <View style={{ alignItems: 'center', marginBottom: 24 }}>
                  <View style={{
                    width: 72, height: 72, borderRadius: 24, backgroundColor: '#EDE9FE',
                    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
                  }}>
                    <Text style={{ fontSize: 28, fontWeight: '900', color: Colors.accent }}>
                      {(selected?.name || 'M')[0].toUpperCase()}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 20, fontWeight: '900', color: Colors.heading, marginBottom: 4 }}>
                    {selected?.name || 'Manager'}
                  </Text>
                  <View style={{
                    flexDirection: 'row', alignItems: 'center', gap: 6,
                    backgroundColor: selected?.hotelId ? '#ECFDF5' : '#FEF3C7',
                    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 99,
                  }}>
                    <View style={{
                      width: 7, height: 7, borderRadius: 4,
                      backgroundColor: selected?.hotelId ? '#059669' : '#D97706',
                    }} />
                    <Text style={{
                      fontSize: 11, fontWeight: '800',
                      color: selected?.hotelId ? '#059669' : '#D97706',
                    }}>
                      {selected?.hotelId ? 'ACTIVE' : 'INACTIVE'}
                    </Text>
                  </View>
                </View>

                <View style={tabStyles.infoRow}>
                  <View style={tabStyles.infoIconWrap}>
                    <Ionicons name="call-outline" size={18} color={Colors.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={tabStyles.infoLabel}>Phone</Text>
                    <Text style={tabStyles.infoValue}>{selected?.phone || 'N/A'}</Text>
                  </View>
                </View>

                <View style={tabStyles.infoRow}>
                  <View style={tabStyles.infoIconWrap}>
                    <Ionicons name="calendar-outline" size={18} color={Colors.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={tabStyles.infoLabel}>Added On</Text>
                    <Text style={tabStyles.infoValue}>
                      {selected?.createdAt ? new Date(selected.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
                    </Text>
                  </View>
                </View>

                {selected?.phoneVerified !== undefined && (
                  <View style={tabStyles.infoRow}>
                    <View style={tabStyles.infoIconWrap}>
                      <Ionicons name="shield-checkmark-outline" size={18} color={Colors.accent} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={tabStyles.infoLabel}>Phone Verified</Text>
                      <Text style={tabStyles.infoValue}>{selected?.phoneVerified ? 'Yes' : 'No'}</Text>
                    </View>
                  </View>
                )}

                <View style={{ flexDirection: 'row', gap: 12, marginTop: 14 }}>
                  <TouchableOpacity
                    style={{
                      flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
                      height: 48, borderRadius: 14, backgroundColor: '#E0F2FE',
                    }}
                    activeOpacity={0.7}
                    onPress={() => selected?.phone && Linking.openURL(`tel:${selected.phone}`)}
                  >
                    <Ionicons name="call" size={18} color="#0EA5E9" />
                    <Text style={{ fontSize: 14, fontWeight: '800', color: '#0EA5E9' }}>Call</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
                      height: 48, borderRadius: 14, backgroundColor: '#DCFCE7',
                    }}
                    activeOpacity={0.7}
                    onPress={() => {
                      const num = (selected?.phone || '').replace(/[^0-9]/g, '');
                      if (num) Linking.openURL(`https://wa.me/${num}`);
                    }}
                  >
                    <Ionicons name="logo-whatsapp" size={18} color="#22C55E" />
                    <Text style={{ fontSize: 14, fontWeight: '800', color: '#22C55E' }}>WhatsApp</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ManagersTab;
