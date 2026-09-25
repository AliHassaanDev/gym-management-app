import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Fonts, Radius, Shadow } from '../../constants/theme';
import { MemberRepository, Member } from '../../db/repositories/MemberRepository';
import { PaymentRepository, Payment } from '../../db/repositories/PaymentRepository';
import { AttendanceRepository, Attendance } from '../../db/repositories/AttendanceRepository';
import { AppModal } from '../../components/ui/AppModal';
import { NotificationService } from '../../services/NotificationService';
import {
  ChevronLeftIcon,
  PhoneIcon,
  UserIcon,
  CalendarIcon,
  WalletIcon,
  ClockIcon,
  CheckCircleIcon,
  AlertCircleIcon,
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

  // Modals & toast states
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedPaymentForPay, setSelectedPaymentForPay] = useState<Payment | null>(null);
  const [payMethod, setPayMethod] = useState<'cash' | 'bank_transfer'>('cash');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Edit form states
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

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleMarkPaid = (payment: Payment) => {
    setSelectedPaymentForPay(payment);
    setPayMethod('cash');
  };

  const confirmReceivePayment = () => {
    if (!selectedPaymentForPay) return;
    PaymentRepository.markPaid(selectedPaymentForPay.id, payMethod);

    const paidAmt = selectedPaymentForPay.amount;
    const memberName = member?.full_name ?? 'Member';
    const methodLabel = payMethod === 'cash' ? 'Cash' : 'Bank Transfer';

    // Push live dynamic notification
    NotificationService.add({
      category: 'payment',
      title: 'Payment Received',
      message: `Received PKR ${paidAmt.toLocaleString()} from ${memberName} via ${methodLabel}`,
    });

    setSelectedPaymentForPay(null);
    load();
    setSuccessToast(`Received PKR ${paidAmt.toLocaleString()} successfully! ✓`);
    setTimeout(() => {
      setSuccessToast(null), 3500;
    });
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
    setSuccessToast('Member details updated successfully! ✓');
    setTimeout(() => setSuccessToast(null), 3500);
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <ChevronLeftIcon size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Member Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Success Toast Banner */}
      {successToast && (
        <View style={styles.toastWrap}>
          <CheckCircleIcon size={16} color="#FFFFFF" />
          <Text style={styles.toastText}>{successToast}</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Top Profile Card */}
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

        {/* Pending Fee Due Quick Action Banner */}
        {pendingPayment && (
          <View style={styles.dueAlertCard}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <AlertCircleIcon size={16} color="#DC2626" />
                <Text style={styles.dueAlertTitle}>Fee Pending</Text>
              </View>
              <Text style={styles.dueAlertAmount}>
                {formatPKR(pendingPayment.amount)} · Due: {formatDate(pendingPayment.due_date)}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.dueAlertBtn}
              onPress={() => handleMarkPaid(pendingPayment)}
              activeOpacity={0.8}
            >
              <Text style={styles.dueAlertBtnText}>Mark Paid</Text>
            </TouchableOpacity>
          </View>
        )}

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
                value={formatPKR(totalPaid)}
              />
              <DetailRow
                icon={<ClockIcon size={16} color="#64748B" />}
                label="Remaining Balance"
                value={pendingPayment ? formatPKR(pendingPayment.amount) : 'PKR 0'}
                isLast
              />
            </View>

            {/* Edit Profile Outline Button */}
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
                      onPress={() => handleMarkPaid(p)}
                      activeOpacity={0.8}
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
              <Text style={styles.attCountBig}>{attendance.length}</Text>
              <Text style={styles.attCountLabel}>Total check-ins recorded</Text>
            </View>
            {attendance.length === 0 ? (
              <Text style={styles.emptyText}>No check-ins recorded yet for this member.</Text>
            ) : (
              attendance.slice(0, 15).map(a => (
                <View key={a.id} style={styles.attItem}>
                  <View style={styles.attIconCircle}>
                    <ClockIcon size={14} color="#16A34A" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.attDate}>{formatDateTime(a.check_in_at)}</Text>
                    <Text style={styles.attMethod}>
                      Method: {a.method === 'biometric' ? 'Biometric Scanner' : 'Manual Entry'}
                    </Text>
                  </View>
                  <Text style={styles.attTag}>Verified ✓</Text>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Payment Settlement In-Frame Modal */}
      <AppModal
        visible={Boolean(selectedPaymentForPay)}
        onClose={() => setSelectedPaymentForPay(null)}
      >
        <View style={styles.modalCard}>
          <View style={styles.modalIconCircle}>
            <WalletIcon size={28} color="#16A34A" />
          </View>
          <Text style={styles.modalHeading}>Receive Fee Payment</Text>
          <Text style={styles.modalSub}>
            Record payment for{' '}
            <Text style={{ fontWeight: '700', color: '#0F172A' }}>{member.full_name}</Text>{' '}
            ({member.member_number}).
          </Text>

          <View style={styles.amountBox}>
            <Text style={styles.amountBoxLabel}>Amount Due</Text>
            <Text style={styles.amountBoxVal}>
              PKR {selectedPaymentForPay?.amount.toLocaleString()}
            </Text>
          </View>

          <Text style={styles.methodLabel}>Payment Method</Text>
          <View style={styles.methodRow}>
            <TouchableOpacity
              style={[
                styles.methodBtn,
                payMethod === 'cash' && styles.methodBtnActive,
              ]}
              onPress={() => setPayMethod('cash')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.methodBtnText,
                  payMethod === 'cash' && styles.methodBtnTextActive,
                ]}
              >
                💵 Cash
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.methodBtn,
                payMethod === 'bank_transfer' && styles.methodBtnActive,
              ]}
              onPress={() => setPayMethod('bank_transfer')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.methodBtnText,
                  payMethod === 'bank_transfer' && styles.methodBtnTextActive,
                ]}
              >
                🏦 Online / Bank
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setSelectedPaymentForPay(null)}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmPayBtn}
              onPress={confirmReceivePayment}
              activeOpacity={0.85}
            >
              <Text style={styles.confirmPayBtnText}>Confirm Received</Text>
            </TouchableOpacity>
          </View>
        </View>
      </AppModal>

      {/* Edit Profile In-Frame Modal */}
      <AppModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
      >
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
      </AppModal>
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

  toastWrap: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toastText: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: '#FFFFFF',
    flex: 1,
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 12,
    ...Shadow.sm,
  },
  avatarImg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 14,
    backgroundColor: '#F1F5F9',
  },
  profileInfo: { flex: 1 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  memberName: {
    fontFamily: Fonts.bold,
    fontSize: 17,
    color: '#0F172A',
  },
  memberId: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: '#94A3B8',
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

  dueAlertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: Radius.lg,
    padding: 14,
    marginBottom: 12,
  },
  dueAlertTitle: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: '#DC2626',
  },
  dueAlertAmount: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: '#991B1B',
  },
  dueAlertBtn: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
  },
  dueAlertBtnText: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    color: '#FFFFFF',
  },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 4,
    marginBottom: 16,
    ...Shadow.sm,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: Radius.md,
  },
  tabItemActive: {
    backgroundColor: '#0F172A',
  },
  tabLabel: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: '#64748B',
  },
  tabLabelActive: {
    color: '#FFFFFF',
    fontFamily: Fonts.bold,
  },

  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 16,
    ...Shadow.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    paddingVertical: 13,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
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
    borderBottomColor: '#F8FAFC',
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
    paddingVertical: 7,
    borderRadius: Radius.full,
  },
  markPaidBtnText: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    color: '#0F172A',
  },

  attHeaderRow: {
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
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
    marginTop: 2,
  },
  attItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  attIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  attDate: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: '#0F172A',
  },
  attMethod: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: '#94A3B8',
  },
  attTag: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: '#16A34A',
  },

  emptyText: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    paddingVertical: 20,
  },

  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
  },
  modalIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 14,
  },
  modalHeading: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 6,
  },
  modalSub: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },
  amountBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  amountBoxLabel: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: '#64748B',
  },
  amountBoxVal: {
    fontFamily: Fonts.bold,
    fontSize: 22,
    color: '#0F172A',
    marginTop: 2,
  },
  methodLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: '#334155',
    marginBottom: 8,
  },
  methodRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  methodBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: Radius.md,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  methodBtnActive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  methodBtnText: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: '#64748B',
  },
  methodBtnTextActive: {
    color: '#92400E',
    fontFamily: Fonts.bold,
  },
  confirmPayBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: Radius.md,
    backgroundColor: '#16A34A',
    alignItems: 'center',
  },
  confirmPayBtnText: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: '#FFFFFF',
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
    marginTop: 20,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: Radius.md,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: '#64748B',
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: Radius.md,
    backgroundColor: '#0F172A',
    alignItems: 'center',
  },
  saveBtnText: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: '#FFFFFF',
  },
});
