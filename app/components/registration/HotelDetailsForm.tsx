import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { getDistricts } from '../../services/api';

const INDIAN_STATES = [
  'ANDHRA PRADESH', 'ARUNACHAL PRADESH', 'ASSAM', 'BIHAR', 'CHHATTISGARH',
  'GOA', 'GUJARAT', 'HARYANA', 'HIMACHAL PRADESH', 'JHARKHAND',
  'KARNATAKA', 'KERALA', 'MADHYA PRADESH', 'MAHARASHTRA', 'MANIPUR',
  'MEGHALAYA', 'MIZORAM', 'NAGALAND', 'ODISHA', 'PUNJAB',
  'RAJASTHAN', 'SIKKIM', 'TAMIL NADU', 'TELANGANA', 'TRIPURA',
  'UTTAR PRADESH', 'UTTARAKHAND', 'WEST BENGAL',
  'ANDAMAN AND NICOBAR ISLANDS', 'CHANDIGARH', 'DADRA AND NAGAR HAVELI AND DAMAN AND DIU',
  'DELHI', 'JAMMU AND KASHMIR', 'LADAKH', 'LAKSHADWEEP', 'PUDUCHERRY',
];

interface FormData {
  hotelName: string;
  address: string;
  pincode: string;
  city: string;
  state: string;
  districtId: string;
  districtName: string;
}

interface Props {
  data: FormData;
  onChange: (key: keyof FormData, value: string) => void;
}

const Field = ({
  icon,
  label,
  placeholder,
  value,
  onChange,
  keyboardType = 'default',
  multiline = false,
}: {
  icon: string;
  label: string;
  placeholder: string;
  value: string;
  onChange?: (v: string) => void;
  keyboardType?: any;
  multiline?: boolean;
}) => (
  <View style={{ marginBottom: 16 }}>
    <Text style={{ fontSize: 11, fontWeight: '800', color: Colors.body, letterSpacing: 1.5, marginBottom: 8, textTransform: 'uppercase' }}>
      {label}
    </Text>
    <View
      style={{
        minHeight: 52,
        flexDirection: 'row',
        alignItems: multiline ? 'flex-start' : 'center',
        paddingHorizontal: 16,
        paddingVertical: multiline ? 14 : 0,
        borderRadius: 14,
        backgroundColor: '#F4F0FF',
        borderWidth: 1.5,
        borderColor: '#DDD6FE',
      }}
    >
      <Ionicons name={icon as any} size={19} color={Colors.mintIcon} style={{ marginTop: multiline ? 2 : 0 }} />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChange}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        selectionColor={Colors.mintIcon}
        style={{
          flex: 1,
          marginLeft: 12,
          fontSize: 15,
          color: Colors.heading,
          textAlignVertical: multiline ? 'top' : 'center',
          paddingVertical: multiline ? 8 : 0,
        }}
      />
    </View>
  </View>
);

const HotelDetailsForm: React.FC<Props> = ({ data, onChange }) => {
  const [showStateList, setShowStateList] = useState(false);
  const [stateSearch, setStateSearch] = useState('');
  const [showDistrictList, setShowDistrictList] = useState(false);
  const [districts, setDistricts] = useState<Array<{ id: string; name: string; state: string }>>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  // Fetch districts when state changes
  useEffect(() => {
    if (!data.state) {
      setDistricts([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadingDistricts(true);
      try {
        const res = await getDistricts(data.state);
        if (!cancelled) setDistricts(res.districts || []);
      } catch {
        if (!cancelled) setDistricts([]);
      } finally {
        if (!cancelled) setLoadingDistricts(false);
      }
    })();
    return () => { cancelled = true; };
  }, [data.state]);

  const filteredStates = stateSearch
    ? INDIAN_STATES.filter(s => s.includes(stateSearch.toUpperCase()))
    : INDIAN_STATES;

  const selectState = (state: string) => {
    onChange('state', state);
    // Clear district when state changes
    onChange('districtId', '');
    onChange('districtName', '');
    setShowStateList(false);
    setStateSearch('');
  };

  const selectDistrict = (d: { id: string; name: string }) => {
    onChange('districtId', d.id);
    onChange('districtName', d.name);
    setShowDistrictList(false);
  };

  return (
    <View style={{ paddingHorizontal: 24, paddingTop: 8 }}>
      {/* Section Banner */}
      <View
        style={{
          flexDirection: 'row', alignItems: 'center', padding: 14,
          borderRadius: 16, backgroundColor: Colors.mint, marginBottom: 20,
        }}
      >
        <View
          style={{
            width: 38, height: 38, borderRadius: 12,
            backgroundColor: Colors.mintIcon + '25',
            alignItems: 'center', justifyContent: 'center', marginRight: 12,
          }}
        >
          <Ionicons name="business" size={18} color={Colors.mintIcon} />
        </View>
        <View>
          <Text style={{ fontSize: 14, fontWeight: '900', color: Colors.heading }}>Hotel Details</Text>
          <Text style={{ fontSize: 12, color: Colors.body }}>Tell us about your property</Text>
        </View>
      </View>

      <Field
        icon="business-outline"
        label="Hotel / Property Name"
        placeholder="e.g. The Grand Palace"
        value={data.hotelName}
        onChange={(v) => onChange('hotelName', v)}
      />

      <Field
        icon="location-outline"
        label="Full Address / Landmark"
        placeholder="Street, Area, Locality"
        value={data.address}
        onChange={(v) => onChange('address', v)}
        multiline
      />

      <Field
        icon="home-outline"
        label="City / Town"
        placeholder="e.g. Jaipur"
        value={data.city}
        onChange={(v) => onChange('city', v)}
      />

      <Field
        icon="pin-outline"
        label="Pincode"
        placeholder="6-digit Pincode (optional)"
        value={data.pincode}
        onChange={(v) => onChange('pincode', v.replace(/\D/g, '').slice(0, 6))}
        keyboardType="number-pad"
      />

      {/* ── State Selector ── */}
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 11, fontWeight: '800', color: Colors.body, letterSpacing: 1.5, marginBottom: 8, textTransform: 'uppercase' }}>
          State
        </Text>
        <TouchableOpacity
          onPress={() => { setShowStateList(!showStateList); setShowDistrictList(false); }}
          style={{
            minHeight: 52, flexDirection: 'row', alignItems: 'center',
            paddingHorizontal: 16, borderRadius: 14,
            backgroundColor: '#F4F0FF', borderWidth: 1.5, borderColor: '#DDD6FE',
          }}
        >
          <Ionicons name="earth-outline" size={19} color={Colors.mintIcon} />
          <Text style={{ flex: 1, marginLeft: 12, fontSize: 15, color: data.state ? Colors.heading : '#9CA3AF' }}>
            {data.state || 'Select State'}
          </Text>
          <Ionicons name={showStateList ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.mintIcon} />
        </TouchableOpacity>

        {showStateList && (
          <View style={{
            marginTop: 8, backgroundColor: '#fff', borderRadius: 14,
            borderWidth: 1.5, borderColor: '#DDD6FE', elevation: 4,
            shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1, shadowRadius: 4, maxHeight: 260,
          }}>
            {/* Search */}
            <View style={{
              flexDirection: 'row', alignItems: 'center',
              paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#F4F0FF',
            }}>
              <Ionicons name="search-outline" size={16} color="#9CA3AF" />
              <TextInput
                placeholder="Search state..."
                placeholderTextColor="#9CA3AF"
                value={stateSearch}
                onChangeText={setStateSearch}
                style={{ flex: 1, marginLeft: 8, fontSize: 14, color: Colors.heading, paddingVertical: 12 }}
                autoFocus
              />
            </View>
            <ScrollView nestedScrollEnabled style={{ maxHeight: 210 }} keyboardShouldPersistTaps="handled">
              {filteredStates.map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => selectState(s)}
                  style={{
                    paddingVertical: 12, paddingHorizontal: 16,
                    borderBottomWidth: 1, borderBottomColor: '#F9FAFB',
                    backgroundColor: data.state === s ? '#EDE9FE' : '#fff',
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: data.state === s ? '800' : '500', color: Colors.heading }}>
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
              {filteredStates.length === 0 && (
                <Text style={{ padding: 16, fontSize: 13, color: Colors.body, textAlign: 'center' }}>
                  No states found
                </Text>
              )}
            </ScrollView>
          </View>
        )}
      </View>

      {/* ── District Selector ── */}
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 11, fontWeight: '800', color: Colors.body, letterSpacing: 1.5, marginBottom: 8, textTransform: 'uppercase' }}>
          District
        </Text>
        <TouchableOpacity
          disabled={!data.state || loadingDistricts}
          onPress={() => { setShowDistrictList(!showDistrictList); setShowStateList(false); }}
          style={{
            minHeight: 52, flexDirection: 'row', alignItems: 'center',
            paddingHorizontal: 16, borderRadius: 14,
            backgroundColor: data.state ? '#F4F0FF' : '#F3F4F6',
            borderWidth: 1.5, borderColor: data.state ? '#DDD6FE' : '#E5E7EB',
          }}
        >
          <Ionicons name="map-outline" size={19} color={data.state ? Colors.mintIcon : '#9CA3AF'} />
          <Text style={{ flex: 1, marginLeft: 12, fontSize: 15, color: data.districtName ? Colors.heading : '#9CA3AF' }}>
            {loadingDistricts ? 'Loading districts...' : data.districtName || (data.state ? 'Select District' : 'Select state first')}
          </Text>
          {loadingDistricts ? (
            <ActivityIndicator size="small" color={Colors.mintIcon} />
          ) : data.state ? (
            <Ionicons name={showDistrictList ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.mintIcon} />
          ) : null}
        </TouchableOpacity>

        {showDistrictList && districts.length > 0 && (
          <View style={{
            marginTop: 8, backgroundColor: '#fff', borderRadius: 14,
            borderWidth: 1.5, borderColor: '#DDD6FE', elevation: 4,
            shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1, shadowRadius: 4, maxHeight: 220,
          }}>
            <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled">
              {districts.map((d) => (
                <TouchableOpacity
                  key={d.id}
                  onPress={() => selectDistrict(d)}
                  style={{
                    paddingVertical: 12, paddingHorizontal: 16,
                    borderBottomWidth: 1, borderBottomColor: '#F9FAFB',
                    backgroundColor: data.districtId === d.id ? '#EDE9FE' : '#fff',
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: data.districtId === d.id ? '800' : '500', color: Colors.heading }}>
                    {d.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {showDistrictList && !loadingDistricts && districts.length === 0 && data.state && (
          <View style={{
            marginTop: 8, backgroundColor: '#fff', borderRadius: 14, padding: 16,
            borderWidth: 1.5, borderColor: '#DDD6FE',
          }}>
            <Text style={{ fontSize: 13, color: Colors.body, textAlign: 'center' }}>
              No districts found for {data.state}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default HotelDetailsForm;
