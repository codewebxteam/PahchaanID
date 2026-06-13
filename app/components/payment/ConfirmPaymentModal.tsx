import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

interface ConfirmPaymentModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  amount?: string;
}

const ConfirmPaymentModal: React.FC<ConfirmPaymentModalProps> = ({
  visible,
  onConfirm,
  onCancel,
  amount = '₹27,000',
}) => {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Top Icon */}
          <View style={styles.iconWrap}>
            <Ionicons name="shield-checkmark" size={36} color={Colors.accent} />
          </View>

          <Text style={styles.title}>Confirm Payment</Text>
          <Text style={styles.subtitle}>
            You are about to activate your{'\n'}
            <Text style={{ fontWeight: '900', color: Colors.accent }}>Pahchaan ID Pro Plan</Text>
          </Text>

          {/* Summary Card */}
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Plan</Text>
              <Text style={styles.summaryValue}>Pro — Annual</Text>
            </View>
            <View style={[styles.summaryRow, { marginBottom: 0 }]}>
              <Text style={styles.summaryLabel}>Amount</Text>
              <Text style={[styles.summaryValue, { color: Colors.accent, fontWeight: '900' }]}>{amount}</Text>
            </View>
          </View>

          <Text style={styles.note}>
            Secured via Razorpay · SSL Encrypted
          </Text>

          {/* Buttons */}
          <TouchableOpacity style={styles.confirmBtn} onPress={onConfirm} activeOpacity={0.85}>
            <Ionicons name="card-outline" size={18} color="#fff" />
            <Text style={styles.confirmText}>Pay {amount}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} activeOpacity={0.75}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(28, 28, 46, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 28,
    width: '100%',
    alignItems: 'center',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.heading,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.body,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  summary: {
    width: '100%',
    backgroundColor: Colors.bgPrimary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 13,
    color: Colors.body,
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 14,
    color: Colors.heading,
    fontWeight: '700',
  },
  note: {
    fontSize: 11,
    color: Colors.body,
    marginBottom: 20,
    textAlign: 'center',
  },
  confirmBtn: {
    width: '100%',
    height: 54,
    borderRadius: 99,
    backgroundColor: Colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 12,
    elevation: 6,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  confirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  },
  cancelBtn: {
    width: '100%',
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    color: Colors.body,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ConfirmPaymentModal;
