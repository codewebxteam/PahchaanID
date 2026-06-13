import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import tabStyles from './shared/tabStyles';

interface HotelDetailsTabProps {
  params: {
    hotelName?: string;
    address?: string;
    postOffice?: string;
    district?: string;
    state?: string;
    pincode?: string;
  };
}

const HotelDetailsTab = ({ params }: HotelDetailsTabProps) => (
  <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
    <View style={tabStyles.heroCardCompact}>
      <View style={tabStyles.heroIconWrapCompact}>
        <Ionicons name="business" size={28} color={Colors.accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={tabStyles.heroTitleCompact}>{params.hotelName}</Text>
        <View style={tabStyles.statusBadgeSmallCompact}>
          <View style={tabStyles.statusDot} />
          <Text style={tabStyles.statusTextSmall}>ACTIVE · PRO PLAN</Text>
        </View>
      </View>
    </View>

    {/* Info Fields */}
    {[
      { icon: 'location-outline', label: 'Address', value: params.address },
      { icon: 'pin-outline', label: 'Post Office', value: params.postOffice },
      { icon: 'map-outline', label: 'District', value: params.district },
      { icon: 'earth-outline', label: 'State', value: params.state },
      { icon: 'barcode-outline', label: 'Pincode', value: params.pincode },
    ].map((item, i) => (
      <View key={i} style={tabStyles.infoRow}>
        <View style={tabStyles.infoIconWrap}>
          <Ionicons name={item.icon as any} size={18} color={Colors.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={tabStyles.infoLabel}>{item.label}</Text>
          <Text style={tabStyles.infoValue}>{item.value || '—'}</Text>
        </View>
      </View>
    ))}
  </ScrollView>
);

export default HotelDetailsTab;
