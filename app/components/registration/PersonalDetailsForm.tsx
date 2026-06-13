import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

interface FormData {
  fullName: string;
  email: string;
  mobile: string;
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
}: {
  icon: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  keyboardType?: any;
}) => (
  <View style={{ marginBottom: 16 }}>
    <Text style={{ fontSize: 11, fontWeight: '800', color: Colors.body, letterSpacing: 1.5, marginBottom: 8, textTransform: 'uppercase' }}>
      {label}
    </Text>
    <View
      style={{
        height: 52,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        borderRadius: 14,
        backgroundColor: '#F4F0FF',
        borderWidth: 1.5,
        borderColor: '#DDD6FE',
      }}
    >
      <Ionicons name={icon as any} size={19} color={Colors.accent} />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#C0B8D8"
        value={value}
        onChangeText={onChange}
        keyboardType={keyboardType}
        selectionColor={Colors.accent}
        style={{ 
          flex: 1, 
          marginLeft: 12, 
          fontSize: 15, 
          color: Colors.heading,
          paddingVertical: 0, // Prevent clipping on some Android versions
          height: '100%',     // Ensure it fills the container vertically
        }}
      />
    </View>
  </View>
);

// Only form fields — no button, no flex-1
const PersonalDetailsForm: React.FC<Props> = ({ data, onChange }) => {
  return (
    <View style={{ paddingHorizontal: 24, paddingTop: 8 }}>
      {/* Section Banner */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 14,
          borderRadius: 16,
          backgroundColor: Colors.peach,
          marginBottom: 20,
        }}
      >
        <View
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            backgroundColor: Colors.peachIcon + '25',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}
        >
          <Ionicons name="person" size={18} color={Colors.peachIcon} />
        </View>
        <View>
          <Text style={{ fontSize: 14, fontWeight: '900', color: Colors.heading }}>Personal Details</Text>
          <Text style={{ fontSize: 12, color: Colors.body }}>Tell us about yourself</Text>
        </View>
      </View>

      <Field icon="person-outline" label="Full Legal Name" placeholder="Enter your full name"
        value={data.fullName} onChange={(v) => onChange('fullName', v)} />
      <Field icon="mail-outline" label="Email Address" placeholder="you@example.com"
        value={data.email} onChange={(v) => onChange('email', v)} keyboardType="email-address" />
      <Field icon="call-outline" label="Mobile Number" placeholder="+91 XXXXX XXXXX"
        value={data.mobile} onChange={(v) => onChange('mobile', v)} keyboardType="phone-pad" />
    </View>
  );
};

export default PersonalDetailsForm;
