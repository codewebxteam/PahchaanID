import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import tabStyles from './shared/tabStyles';

interface HotelDetailsTabProps {
  profile?: any;
}

const HotelDetailsTab = ({ profile }: HotelDetailsTabProps) => {
  const hotel = profile?.hotel || {};
  const hotelName = hotel.name || 'Hotel';
  const address = hotel.address || '-';
  const city = hotel.city || '';
  const state = hotel.state || '';
  const pincode = hotel.pincode || '';
  const district = hotel.district?.name || city;
  const status = hotel.status || 'PENDING_PLAN';
  const hasActiveSub = hotel.subscriptions?.length > 0 && hotel.subscriptions[0].isActive;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
      <View style={tabStyles.heroCardCompact}>
        <View style={tabStyles.heroIconWrapCompact}>
          <Ionicons name="business" size={28} color={Colors.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={tabStyles.heroTitleCompact}>{hotelName}</Text>
          <View style={tabStyles.statusBadgeSmallCompact}>
            <View style={[tabStyles.statusDot, { backgroundColor: status === 'ACTIVE' ? '#10B981' : '#F59E0B' }]} />
            <Text style={tabStyles.statusTextSmall}>
              {status === 'ACTIVE' ? 'ACTIVE' : 'PENDING'}{hasActiveSub ? ' · PRO PLAN' : ''}
            </Text>
          </View>
        </View>
      </View>

      {/* Manager Info */}
      {profile && (
        <>
          <Text style={tabStyles.sectionTitle}>Your Info</Text>
          <View style={tabStyles.ownerCard}>
            <View style={tabStyles.ownerHeader}>
              <View style={[tabStyles.ownerAvatar, { backgroundColor: '#EDE9FE', alignItems: 'center', justifyContent: 'center' }]}>
                <Text style={{ fontSize: 20, fontWeight: '900', color: Colors.accent }}>{(profile.name || 'M')[0].toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={tabStyles.ownerName}>{profile.name}</Text>
                <Text style={tabStyles.ownerDesignation}>{profile.phone}</Text>
              </View>
            </View>
          </View>
        </>
      )}

      <Text style={tabStyles.sectionTitle}>Location Details</Text>
      {[
        { icon: 'location-outline', label: 'Address', value: address },
        { icon: 'map-outline', label: 'District', value: district },
        { icon: 'earth-outline', label: 'State', value: state },
        { icon: 'barcode-outline', label: 'Pincode', value: pincode },
      ].filter(item => item.value).map((item, i) => (
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
    </ScrollView>
  );
};

export default HotelDetailsTab;
