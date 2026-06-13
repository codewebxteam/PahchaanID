import { StyleSheet } from 'react-native';
import { Colors } from '../../../constants/colors';

const tabStyles = StyleSheet.create({
  // Hotel Details
  heroCardCompact: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    backgroundColor: '#fff', borderRadius: 24, padding: 18, marginBottom: 24,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8,
  },
  heroIconWrapCompact: {
    width: 56, height: 56, borderRadius: 18, backgroundColor: '#F3F4FB',
    alignItems: 'center', justifyContent: 'center',
  },
  heroTitleCompact: { fontSize: 20, fontWeight: '900', color: Colors.heading, marginBottom: 4 },
  statusBadgeSmallCompact: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#ECFDF5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
    alignSelf: 'flex-start',
  },
  statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#059669' },
  statusTextSmall: { fontSize: 9, fontWeight: '900', color: '#059669', letterSpacing: 1 },

  infoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 10,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4,
  },
  infoIconWrap: {
    width: 38, height: 38, borderRadius: 11, backgroundColor: '#EDE9FE',
    alignItems: 'center', justifyContent: 'center',
  },
  infoLabel: { fontSize: 11, fontWeight: '700', color: Colors.body, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 14, fontWeight: '600', color: Colors.heading },
  sectionTitle: {
    fontSize: 12, fontWeight: '800', color: Colors.body,
    marginBottom: 12, marginTop: 10, letterSpacing: 1.5,
    textTransform: 'uppercase', paddingLeft: 4,
  },

  // Shared Stats
  statRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: { flex: 1, borderRadius: 16, padding: 14, alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: '900' },
  statLabel: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  emptyWrap: { alignItems: 'center', paddingTop: 40 },
  emptyIcon: { width: 64, height: 64, borderRadius: 20, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: Colors.heading, marginBottom: 6 },
  emptyBody: { fontSize: 13, color: Colors.body, textAlign: 'center', lineHeight: 20, paddingHorizontal: 16 },

  // Managers tab
  managerCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4,
  },
  managerAvatar: {
    width: 42, height: 42, borderRadius: 14, backgroundColor: '#EDE9FE',
    alignItems: 'center', justifyContent: 'center',
  },
  managerAvatarText: { fontSize: 16, fontWeight: '900', color: Colors.accent },
  managerName: { fontSize: 14, fontWeight: '800', color: Colors.heading, marginBottom: 2 },
  managerMeta: { fontSize: 12, color: Colors.body },
  activePill: { backgroundColor: '#ECFDF5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 },
  activePillText: { fontSize: 11, fontWeight: '700', color: '#059669' },

  // Logs tab
  logCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4,
  },
  logDot: { width: 10, height: 10, borderRadius: 5 },
  logGuest: { fontSize: 14, fontWeight: '700', color: Colors.heading, marginBottom: 2 },
  logMeta: { fontSize: 12, color: Colors.body },
  logBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 },
  logBadgeText: { fontSize: 11, fontWeight: '700' },

  // Subscription tab
  planCard: {
    borderRadius: 28, backgroundColor: Colors.accent,
    padding: 28, marginBottom: 20, overflow: 'hidden',
  },
  planLabel: {
    alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.18)', marginBottom: 16,
  },
  planLabelText: { color: '#fff', fontSize: 11, fontWeight: '900', letterSpacing: 2 },
  planPrice: { color: '#fff', fontSize: 40, fontWeight: '900', letterSpacing: -1 },
  planPriceSub: { color: 'rgba(255,255,255,0.7)', fontSize: 15, marginTop: 4 },
  planBadge: {
    marginTop: 16, alignSelf: 'flex-start',
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.15)',
  },
  planBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  // Validity Timer
  timerCard: {
    backgroundColor: '#fff', borderRadius: 24, padding: 20, marginBottom: 24,
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 10,
  },
  timerRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
  timerIconWrap: {
    width: 50, height: 50, borderRadius: 15, backgroundColor: '#EDE9FE',
    alignItems: 'center', justifyContent: 'center',
  },
  timerValue: { fontSize: 22, fontWeight: '900', color: Colors.heading },
  timerSub: { fontSize: 12, color: Colors.body, marginTop: 2 },
  progressContainer: { marginTop: 10 },
  progressTrack: { height: 8, backgroundColor: '#F3F4FB', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  progressBar: { height: '100%', backgroundColor: Colors.accent, borderRadius: 4 },
  progressLabel: { fontSize: 11, fontWeight: '700', color: Colors.body, letterSpacing: 0.5 },

  // Detail Modal & Digital Pass Card
  detailCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#F3F4FB',
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    overflow: 'hidden',
  },
  passHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4FB',
  },
  passName: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.heading,
    flex: 1,
    marginRight: 12,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1FAE5',
    zIndex: 10,
  },
  verifiedBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#059669',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  passBody: {
    padding: 20,
    gap: 16,
  },
  passDetailsRow: {
    flexDirection: 'row',
    gap: 20,
  },
  passItem: {
    flex: 1,
  },
  passLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  passValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.heading,
  },
  passFooterAddress: {
    padding: 20,
    paddingTop: 0,
  },
  addressBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  addressText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.body,
    flex: 1,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24,
  },
  modalContent: {
    backgroundColor: '#fff', borderRadius: 32, padding: 28,
    elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.2, shadowRadius: 15,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: Colors.heading },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  submitBtn: {
    height: 56, borderRadius: 16, backgroundColor: Colors.accent,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    elevation: 2,
  },
  submitBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },
});

export default tabStyles;
