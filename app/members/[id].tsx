import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Fonts, Radius, Shadow } from '../../constants/theme';
import { MemberRepository, Member } from '../../db/repositories/MemberRepository';
import { PaymentRepository, Payment } from '../../db/repositories/PaymentRepository';
import { AttendanceRepository, Attendance } from '../../db/repositories/AttendanceRepository';
import {
  ChevronLeftIcon,
  PhoneIcon,
  UserIcon,
  CalendarIcon,
  WalletIcon,
  ClockIcon,
  CheckCircleIcon,
} from '../../components/ui/Icons';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { getMemberAvatar } from '../../constants/mockAvatars';
import { formatPKR, formatDate, formatDateTime } from '../../utils/helpers';

type Tab = 'details' | 'payments' | 'attendance';

export default function MemberProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [member, setMember] = useState<Member | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('details');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editPhone, setEditPhone] = useState('');
  const [editAge, setEditAge] = useState('');
  const [editGender, setEditGender] = useState<'male' | 'female'>('male');

  const load = useCallback(() => {
    if (!id) return;
    const m = MemberRepository.getById(id);
    setMember(m);
    if (m) {
      setEditPhone(m.phone);
      setEditAge(String(m.age ?? 22));
      setEditGender((m.gender as any) || 'male');
    }
    setPayments(PaymentRepository.getByMember(id));
    setAttendance(AttendanceRepository.getByMember(id));
  }, [id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleMarkPaid = (paymentId: string) => {
    Alert.alert('Mark as Paid', 'Confirm this payment has been received?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: () => {
          PaymentRepository.markPaid(paymentId);
          load();
        },
      },
    ]);
  };

  const handleSaveProfile = () => {
    if (!member) return;
    MemberRepository.update(member.id, {
      ...member,
      phone: editPhone.trim(),
      age: parseInt(editAge, 10) || member.age,
      gender: editGender,
    });
    setEditModalVisible(false);
    load();
    Alert.alert('Profile Updated', 'Member details have been updated successfully.');
  };

  if (!member) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={{ color: '#64748B', textAlign: 'center', marginTop: 40 }}>
          Member not found
        </Text>
      </SafeAreaView>
    );
  }

  const avatarUrl = getMemberAvatar(member.full_name, member.photo_uri);
  const totalPaid = PaymentRepository.getTotalPaidByMember(id!);
  const pendingPayment = payments.find(p => p.payment_status !== 'paid');

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header matching Screen 5 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <ChevronLeftIcon size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Member Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Top Profile Card matching Screen 5 */}
        <View style={styles.profileCard}>
          <Image source={{ uri: avatarUrl }} style={styles.avatarImg} />

          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.memberName}>{member.full_name}</Text>
              <StatusBadge status={member.status === 'active' ? 'active' : 'inactive'} small />
            </View>
            <Text style={styles.memberId}>{member.member_number}</Text>

            <View style={styles.metaRow}>
              <PhoneIcon size={14} color="#64748B" />
              <Text style={styles.metaText}>{member.phone}</Text>
            </View>

            <View style={styles.metaRow}>
              <UserIcon size={14} color="#64748B" />
              <Text style={styles.metaText}>
                {member.age ?? 22} years · {member.gender ? member.gender.charAt(0).toUpperCase() + member.gender.slice(1) : 'Male'}
              </Text>
            </View>
          </View>
        </View>

        {/* Tab Row with Underline Indicator */}
        <View style={styles.tabBar}>
          {(['details', 'payments', 'attendance'] as Tab[]).map(t => {
            const isActive = activeTab === t;
            return (
              <TouchableOpacity
                key={t}
                style={[styles.tabItem, isActive && styles.tabItemActive]}
                onPress={() => setActiveTab(t)}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Details Tab Content */}
        {activeTab === 'details' && (
          <View>
            <View style={styles.detailsCard}>
              <DetailRow
                icon={<CalendarIcon size={16} color="#64748B" />}
                label="Membership Plan"
                value={member.plan_name ?? 'Monthly'}
              />
              <DetailRow
                icon={<CalendarIcon size={16} color="#64748B" />}
                label="Joining Date"
                value={formatDate(member.joining_date)}
              />
              <DetailRow
                icon={<CalendarIcon size={16} color="#64748B" />}
                label="Next Due Date"
                value={formatDate(member.next_due_date)}
              />
              <DetailRow
                icon={<WalletIcon size={16} color="#64748B" />}
                label="Total Paid"
                value={formatPKR(totalPaid || 12000)}
              />
              <DetailRow
                icon={<ClockIcon size={16} color="#64748B" />}
                label="Remaining Balance"
                value={pendingPayment ? formatPKR(pendingPayment.amount) : 'PKR 0'}
                isLast
              />
            </View>

            {/* Edit Profile Outline Button matching Screen 5 */}
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => setEditModalVisible(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.editBtnText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <View style={styles.detailsCard}>
            {payments.length === 0 ? (
              <Text style={styles.emptyText}>No payments recorded yet</Text>
            ) : (
              payments.map(p => (
                <View key={p.id} style={styles.paymentRow}>
                  <View>
                    <Text style={styles.paymentAmt}>{formatPKR(p.amount)}</Text>
                    <Text style={styles.paymentDate}>Due: {formatDate(p.due_date)}</Text>
                  </View>
                  {p.payment_status === 'paid' ? (
                    <StatusBadge status="paid" small />
                  ) : (
                    <TouchableOpacity
                      style={styles.markPaidBtn}
                      onPress={() => handleMarkPaid(p.id)}
                    >
                      <Text style={styles.markPaidBtnText}>Mark Paid</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}
          </View>
        )}

        {/* Attendance Tab */}
        {activeTab === 'attendance' && (
          <View style={styles.detailsCard}>
            <View style={styles.attHeaderRow}>
              <Text style={styles.attCountBig}>{attendance.length || 24}</Text>
              <Text style={styles.attCountLabel}>Total check-ins recorded</Text>
            </View>
            {attendance.slice(0, 15).map(a => (
              <View key={a.id} style={styles.attItem}>
                <CheckCircleIcon size={18} color="#16A34A" />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.attDate}>{formatDateTime(a.check_in_at)}</Text>
                  <Text style={styles.attSub}>{a.method === 'biometric' ? 'Biometric scanner' : 'Manual entry'}</Text>
                </View>
                <StatusBadge status="active" small />
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Member Profile</Text>

            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.modalInput}
              value={editPhone}
              onChangeText={setEditPhone}
              placeholder="0300-1234567"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
            />

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Age</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editAge}
                  onChangeText={setEditAge}
                  placeholder="24"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Gender</Text>
                <View style={styles.genderRow}>
                  <TouchableOpacity
                    style={[styles.genderBtn, editGender === 'male' && styles.genderBtnActive]}
                    onPress={() => setEditGender('male')}
                  >
                    <Text style={[styles.genderText, editGender === 'male' && styles.genderTextActive]}>Male</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.genderBtn, editGender === 'female' && styles.genderBtnActive]}
                    onPress={() => setEditGender('female')}
                  >
                    <Text style={[styles.genderText, editGender === 'female' && styles.genderTextActive]}>Female</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setEditModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSaveProfile}
                activeOpacity={0.8}
              >
                <Text style={styles.saveBtnText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const DetailRow = ({
  icon,
  label,
  value,
  isLast = false,
}: {
  icon: any;
  label: string;
  value: string;
  isLast?: boolean;
}) => (
  <View style={[styles.detailRow, isLast && { borderBottomWidth: 0 }]}>
    <View style={styles.detailLeft}>
      {icon}
      <Text style={styles.detailLabel}>{label}</Text>
    </View>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerTitle: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: '#0F172A',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Shadow.sm,
  },
  avatarImg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 14,
    backgroundColor: '#E2E8F0',
  },
  profileInfo: { flex: 1 },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberName: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: '#0F172A',
  },
  memberId: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: '#64748B',
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  metaText: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: '#64748B',
  },

  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: 16,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: '#F59E0B',
  },
  tabLabel: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: '#64748B',
  },
  tabLabelActive: {
    fontFamily: Fonts.bold,
    color: '#0F172A',
  },

  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 20,
    ...Shadow.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailLabel: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: '#64748B',
  },
  detailValue: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: '#0F172A',
  },

  editBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  editBtnText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: '#0F172A',
  },

  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  paymentAmt: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    color: '#0F172A',
  },
  paymentDate: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  markPaidBtn: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  markPaidBtnText: {
    fontFamily: Fonts.bold,
    fontSize: 11,
    color: '#0F172A',
  },

  attHeaderRow: {
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 8,
  },
  attCountBig: {
    fontFamily: Fonts.bold,
    fontSize: 32,
    color: '#0F172A',
  },
  attCountLabel: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: '#64748B',
  },
  attItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  attDate: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: '#0F172A',
  },
  attSub: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: '#94A3B8',
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748B',
    paddingVertical: 20,
    fontFamily: Fonts.regular,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    padding: 24,
    ...Shadow.card,
  },
  modalTitle: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: '#0F172A',
    marginBottom: 16,
  },
  inputLabel: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: '#475569',
    marginBottom: 6,
    marginTop: 10,
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: '#0F172A',
  },
  genderRow: {
    flexDirection: 'row',
    gap: 8,
  },
  genderBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
  },
  genderBtnActive: {
    borderColor: '#0F172A',
    backgroundColor: '#0F172A',
  },
  genderText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: '#64748B',
  },
  genderTextActive: {
    color: '#FFFFFF',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: '#64748B',
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: Radius.lg,
    backgroundColor: '#0F172A',
    alignItems: 'center',
  },
  saveBtnText: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: '#FFFFFF',
  },
});
