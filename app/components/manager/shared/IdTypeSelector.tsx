import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/colors';
import tabStyles from './tabStyles';

export const ID_TYPES = [
  { key: 'aadhaar', label: 'Aadhaar', icon: 'finger-print-outline', hint: '12-digit Aadhaar number' },
  { key: 'pan', label: 'PAN', icon: 'document-text-outline', hint: 'PAN card number (e.g. ABCDE1234F)' },
  { key: 'licence', label: 'Licence', icon: 'car-outline', hint: 'Driving licence number' },
  { key: 'passport', label: 'Passport', icon: 'airplane-outline', hint: 'Passport number (e.g. A1234567)' },
  { key: 'voter', label: 'Voter ID', icon: 'people-circle-outline', hint: 'Voter ID card number' },
];

interface IdTypeSelectorProps {
  selected: string;
  onSelect: (key: string) => void;
  activeColor?: string;
}

const IdTypeSelector = ({ selected, onSelect, activeColor = Colors.accent }: IdTypeSelectorProps) => (
  <View style={{ marginBottom: 12 }}>
    <Text style={tabStyles.fieldLabel}>ID TYPE</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 4 }}>
      {ID_TYPES.map((t) => {
        const active = selected === t.key;
        return (
          <TouchableOpacity
            key={t.key}
            onPress={() => onSelect(t.key)}
            activeOpacity={0.8}
            style={[
              tabStyles.idChip,
              active && { backgroundColor: activeColor, borderColor: activeColor },
            ]}
          >
            <Ionicons name={t.icon as any} size={14} color={active ? '#fff' : Colors.body} />
            <Text style={[tabStyles.idChipText, active && tabStyles.idChipTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
    {selected && (
      <Text style={tabStyles.idHint}>
        {ID_TYPES.find(t => t.key === selected)?.hint}
      </Text>
    )}
  </View>
);

export default IdTypeSelector;
