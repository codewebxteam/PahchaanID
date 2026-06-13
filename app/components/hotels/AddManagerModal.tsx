import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Hotel } from './HotelCard';

interface AddManagerModalProps {
  visible: boolean;
  hotel: Hotel | null;
  onClose: () => void;
  onAdd: (hotelId: string, manager: { name: string; phone: string }) => void;
}

export interface ManagerData {
  name: string;
  email: string;
  mobile: string;
  designation: string;
}

const InputField = ({
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
  <View style={{ marginBottom: 14 }}>
    <Text style={fieldStyles.label}>{label}</Text>
    <View style={fieldStyles.inputRow}>
      <Ionicons name={icon as any} size={18} color={Colors.accent} />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#C0B8D8"
        value={value}
        onChangeText={onChange}
        keyboardType={keyboardType}
        selectionColor={Colors.accent}
        style={fieldStyles.input}
      />
    </View>
  </View>
);

const fieldStyles = StyleSheet.create({
  label: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.body,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 7,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    paddingHorizontal: 14,
    backgroundColor: '#F4F0FF',
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: '#DDD6FE',
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: Colors.heading,
    paddingVertical: 0,
  },
});

const AddManagerModal: React.FC<AddManagerModalProps> = ({
  visible,
  hotel,
  onClose,
  onAdd,
}) => {
  const [form, setForm] = useState<ManagerData>({
    name: '',
    email: '',
    mobile: '',
    designation: '',
  });

  const isValid = !!(form.name && form.email && form.mobile);

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!isValid || !hotel) return;
    setSubmitting(true);
    try {
      await onAdd(hotel.id, { name: form.name, phone: form.mobile });
      setForm({ name: '', email: '', mobile: '', designation: '' });
    } catch {
      // Error handled by parent
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconWrap}>
              <Ionicons name="person-add" size={22} color={Colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Add Manager</Text>
              {hotel && (
                <Text style={styles.hotelName} numberOfLines={1}>{hotel.name}</Text>
              )}
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={Colors.body} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <InputField
              icon="person-outline"
              label="Full Name"
              placeholder="Manager's full name"
              value={form.name}
              onChange={(v) => setForm((f) => ({ ...f, name: v }))}
            />
            <InputField
              icon="mail-outline"
              label="Email Address"
              placeholder="manager@hotel.com"
              value={form.email}
              onChange={(v) => setForm((f) => ({ ...f, email: v }))}
              keyboardType="email-address"
            />
            <InputField
              icon="call-outline"
              label="Mobile Number"
              placeholder="+91 XXXXX XXXXX"
              value={form.mobile}
              onChange={(v) => setForm((f) => ({ ...f, mobile: v }))}
              keyboardType="phone-pad"
            />
            <InputField
              icon="briefcase-outline"
              label="Designation (Optional)"
              placeholder="e.g. General Manager"
              value={form.designation}
              onChange={(v) => setForm((f) => ({ ...f, designation: v }))}
            />
          </ScrollView>

          <TouchableOpacity
            style={[styles.submitBtn, (!isValid || submitting) && styles.submitDisabled]}
            onPress={handleSubmit}
            disabled={!isValid || submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                <Text style={styles.submitText}>Add Manager</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(28, 28, 46, 0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 36,
    maxHeight: '88%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '900',
    color: Colors.heading,
  },
  hotelName: {
    fontSize: 12,
    color: Colors.body,
    fontWeight: '600',
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 99,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtn: {
    height: 54,
    borderRadius: 99,
    backgroundColor: Colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 8,
    elevation: 6,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  submitDisabled: {
    backgroundColor: '#DDD6FE',
    elevation: 0,
    shadowOpacity: 0,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  },
});

export default AddManagerModal;
