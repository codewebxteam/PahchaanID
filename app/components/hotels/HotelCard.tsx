import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

export interface Hotel {
  id: string;
  name: string;
  address: string;
  district: string;
  state: string;
  pincode: string;
  postOffice: string;
  managersCount?: number;
}

interface HotelCardProps {
  hotel: Hotel;
  onAddManager: (hotel: Hotel) => void;
  onPress?: () => void;
}

const HotelCard: React.FC<HotelCardProps> = ({ hotel, onAddManager, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Header row */}
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Ionicons name="business" size={22} color={Colors.mintIcon} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.hotelName} numberOfLines={1}>{hotel.name}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Ionicons name="people" size={11} color={Colors.accent} />
              <Text style={styles.badgeText}>
                {hotel.managersCount ?? 0} Manager{(hotel.managersCount ?? 0) !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Address Section */}
      <View style={styles.addressRow}>
        <Ionicons name="location-outline" size={14} color={Colors.body} style={{ marginTop: 1 }} />
        <Text style={styles.addressText} numberOfLines={2}>
          {hotel.address}, {hotel.postOffice}, {hotel.district}, {hotel.state} - {hotel.pincode}
        </Text>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Add Manager Button */}
      <TouchableOpacity
        style={styles.addManagerBtn}
        onPress={(e) => { e.stopPropagation?.(); onAddManager(hotel); }}
        activeOpacity={0.8}
      >
        <View style={styles.addManagerIcon}>
          <Ionicons name="person-add" size={16} color={Colors.accent} />
        </View>
        <Text style={styles.addManagerText}>Add Manager</Text>
        <Ionicons name="chevron-forward" size={16} color={Colors.accent} style={{ marginLeft: 'auto' }} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: Colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  hotelName: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.heading,
    marginBottom: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
    gap: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.accent,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 14,
    paddingLeft: 2,
  },
  addressText: {
    fontSize: 12,
    color: Colors.body,
    flex: 1,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0EAFF',
    marginBottom: 12,
  },
  addManagerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addManagerIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addManagerText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.accent,
  },
});

export default HotelCard;
