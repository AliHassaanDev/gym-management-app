import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Fonts, Radius, Shadow } from '../../constants/theme';
import { PaymentRepository, Payment } from '../../db/repositories/PaymentRepository';
import { ChevronLeftIcon, ChevronRightIcon, WalletIcon, CheckCircleIcon } from '../../components/ui/Icons';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { getMemberAvatar } from '../../constants/mockAvatars';
import { formatPKR } from '../../utils/helpers';
import { AppModal } from '../../components/ui/AppModal';
import { NotificationService } from '../../services/NotificationService';

type StatusTab = 'paid' | 'due' | 'overdue';

export default function PaymentStatusScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ tab?: string }>();
  const initialTab: StatusTab = (params.tab as StatusTab) || 'paid';

  const [activeTab, setActiveTab] = useState<StatusTab>(initialTab);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [counts, setCounts] = useState({ paid: 102, due: 18, overdue: 8 });
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(() => {
    PaymentRepository.refreshOverdueStatuses();
    const allPayments = PaymentRepository.getAll();
    const paidList = allPayments.filter(p => p.payment_status === 'paid');
    const dueList = allPayments.filter(p => p.payment_status === 'due');
    const overdueList = allPayments.filter(p => p.payment_status === 'overdue');

    setCounts({
      paid: paidList.length,
      due: dueList.length,
      overdue: overdueList.length,
    });

    if (activeTab === 'paid') {
      setPayments(paidList);
    } else if (activeTab === 'due') {
      setPayments(dueList);
    } else {
      setPayments(overdueList);
    }
  }, [activeTab]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
    setRefreshing(false);
  }, [loadData]);

  const [selectedPaymentForPay, setSelectedPaymentForPay] = useState<Payment | null>(null);
  const [payMethod, setPayMethod] = useState<'cash' | 'online'>('cash');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const handleMarkPaid = (payment: Payment) => {
    setSelectedPaymentForPay(payment);
    setPayMethod('cash');
  };

  const confirmReceivePayment = () => {
    if (!selectedPaymentForPay) return;
    PaymentRepository.markPaid(selectedPaymentForPay.id, payMethod);
    const paidMemberName = selectedPaymentForPay.member_name ?? 'Member';
    const paidAmt = selectedPaymentForPay.amount;
    const methodLabel = payMethod === 'cash' ? 'Cash' : 'Bank Transfer';

    NotificationService.add({
      category: 'payment',
      title: 'Payment Received',
      message: `Received PKR ${paidAmt.toLocaleString()} from ${paidMemberName} via ${methodLabel}`,
    });

    setSelectedPaymentForPay(null);
    loadData();
    setSuccessToast(`Received PKR ${paidAmt.toLocaleString()} from ${paidMemberName}! ✓`);
    setTimeout(() => {
      setSuccessToast(null);
    }, 4000);
  };

  const formatDueNotice = (item: Payment) => {
    if (item.payment_status === 'paid') {
      return 'Paid';
    }
    if (!item.due_date) return 'Due soon';
    const due = new Date(item.due_date);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `Overdue by ${Math.abs(diffDays)} days`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else {
      return `Due in ${diffDays} days`;
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header matching Screen 6 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <ChevronLeftIcon size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Status</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Filter Tabs matching Screen 6 */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterPill, activeTab === 'paid' && styles.filterPillActive]}
          onPress={() => setActiveTab('paid')}
          activeOpacity={0.8}
        >
          <Text style={[styles.filterText, activeTab === 'paid' && styles.filterTextActive]}>
            Paid ({counts.paid})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterPill, activeTab === 'due' && styles.filterPillActive]}
          onPress={() => setActiveTab('due')}
          activeOpacity={0.8}
        >
          <Text style={[styles.filterText, activeTab === 'due' && styles.filterTextActive]}>
            Due ({counts.due})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterPill, activeTab === 'overdue' && styles.filterPillActive]}
          onPress={() => setActiveTab('overdue')}
          activeOpacity={0.8}
        >
          <Text style={[styles.filterText, activeTab === 'overdue' && styles.filterTextActive]}>
            Overdue ({counts.overdue})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Payment Items List matching Screen 6 */}
      <FlatList
        data={payments}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        renderItem={({ item }) => {
          const avatarUrl = getMemberAvatar(item.member_name ?? 'Member', item.photo_uri);

          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => item.member_id && router.push(`/members/${item.member_id}`)}
              activeOpacity={0.7}
            >
              {/* Avatar Photo */}
              <Image source={{ uri: avatarUrl }} style={styles.avatarImg} />

              {/* Info Column */}
              <View style={styles.infoCol}>
                <Text style={styles.memberName}>{item.member_name ?? 'Member'}</Text>
                <Text style={styles.memberId}>{item.member_number ?? '#G001'}</Text>
                <Text style={styles.amountText}>{formatPKR(item.amount)}</Text>
                <Text style={styles.dueNotice}>{formatDueNotice(item)}</Text>
              </View>

              {/* Action / Badge Column */}
              <View style={styles.rightCol}>
                {item.payment_status === 'paid' ? (
                  <StatusBadge status="paid" small />
                ) : (
                  <TouchableOpacity
                    style={styles.markPaidBtn}
                    onPress={() => handleMarkPaid(item)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.markPaidText}>Mark Paid</Text>
                  </TouchableOpacity>
                )}
                <ChevronRightIcon size={18} color="#94A3B8" />
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <WalletIcon size={44} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No payments in this tab</Text>
            <Text style={styles.emptySub}>All members in this category are settled.</Text>
          </View>
        }
      />

      {/* Toast Notification Banner */}
      {successToast && (
        <View style={styles.toastWrap}>
          <CheckCircleIcon size={16} color="#FFFFFF" />
          <Text style={styles.toastText}>{successToast}</Text>
        </View>
      )}

      {/* Payment Settlement In-Frame Modal */}
      <AppModal
        visible={Boolean(selectedPaymentForPay)}
        onClose={() => setSelectedPaymentForPay(null)}
      >
        <View style={styles.modalCard}>
          <View style={styles.modalIconCircle}>
            <WalletIcon size={28} color="#16A34A" />
          </View>
          <Text style={styles.modalHeading}>Receive Payment</Text>
          <Text style={styles.modalSub}>
            Record payment for{' '}
            <Text style={{ fontWeight: '700', color: '#0F172A' }}>
              {selectedPaymentForPay?.member_name ?? 'Member'}
            </Text>{' '}
            ({selectedPaymentForPay?.member_number ?? '#G000'}).
          </Text>

          <View style={styles.amountBox}>
            <Text style={styles.amountBoxLabel}>Amount Due</Text>
            <Text style={styles.amountBoxVal}>
              PKR {selectedPaymentForPay?.amount.toLocaleString()}
            </Text>
          </View>

          <Text style={styles.methodHeader}>Select Payment Method</Text>
          <View style={styles.methodPillRow}>
            {(['cash', 'online'] as const).map((m) => (
              <TouchableOpacity
                key={m}
                style={[
                  styles.methodBtn,
                  payMethod === m && styles.methodBtnActive,
                ]}
                onPress={() => setPayMethod(m)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.methodBtnText,
                    payMethod === m && styles.methodBtnTextActive,
                  ]}
                >
                  {m === 'cash' ? '💵 Cash Payment' : '💳 Online / Bank'}
                </Text>
              </TouchableOpacity>
            ))}
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
              activeOpacity={0.8}
            >
              <Text style={styles.confirmPayBtnText}>Confirm Received</Text>
            </TouchableOpacity>
          </View>
        </View>
      </AppModal>
    </SafeAreaView>
  );
}

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

  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  filterPill: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: Radius.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadow.sm,
  },
  filterPillActive: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  filterText: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: '#64748B',
  },
  filterTextActive: {
    color: '#0F172A',
    fontFamily: Fonts.bold,
  },

  list: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Shadow.sm,
  },
  avatarImg: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 14,
    backgroundColor: '#E2E8F0',
  },
  infoCol: { flex: 1 },
  memberName: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: '#0F172A',
  },
  memberId: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  amountText: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: '#0F172A',
    marginTop: 3,
  },
  dueNotice: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  rightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  markPaidBtn: {
    backgroundColor: '#F59E0B',
    borderRadius: Radius.full,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  markPaidText: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    color: '#0F172A',
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyTitle: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: '#0F172A',
    marginTop: 12,
  },
  emptySub: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },

  toastWrap: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: '#0F172A',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radius.full,
    zIndex: 99999,
    ...Shadow.card,
  },
  toastText: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: '#FFFFFF',
  },

  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    alignItems: 'center',
    ...Shadow.card,
  },
  modalIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modalHeading: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    color: '#0F172A',
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
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  amountBoxLabel: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2,
  },
  amountBoxVal: {
    fontFamily: Fonts.bold,
    fontSize: 22,
    color: '#0F172A',
  },
  methodHeader: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: '#334155',
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  methodPillRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginBottom: 20,
  },
  methodBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  methodBtnActive: {
    borderColor: '#16A34A',
    backgroundColor: '#F0FDF4',
  },
  methodBtnText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: '#64748B',
  },
  methodBtnTextActive: {
    fontFamily: Fonts.bold,
    color: '#16A34A',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  cancelBtnText: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: '#64748B',
  },
  confirmPayBtn: {
    flex: 1.5,
    paddingVertical: 14,
    borderRadius: Radius.md,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    ...Shadow.sm,
  },
  confirmPayBtnText: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: '#FFFFFF',
  },
});
