import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Fonts, Radius, Shadow } from '../../constants/theme';
import { MemberRepository } from '../../db/repositories/MemberRepository';
import { PaymentRepository } from '../../db/repositories/PaymentRepository';
import { PlanRepository, Plan } from '../../db/repositories/PlanRepository';
import { AppModal } from '../../components/ui/AppModal';
import { NotificationService } from '../../services/NotificationService';
import {
  ChevronLeftIcon,
  ChevronDownIcon,
  CameraIcon,
  CalendarIcon,
  CheckCircleIcon,
  AlertCircleIcon,
} from '../../components/ui/Icons';
import { addDays } from '../../utils/helpers';

export default function AddMemberScreen() {
  const router = useRouter();
  const plans = PlanRepository.getAll();

  const todayStr = new Date().toISOString().split('T')[0];
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(plans[0] ?? null);
  const [joiningDate, setJoiningDate] = useState(todayStr);
  const [paymentOption, setPaymentOption] = useState<'paid' | 'due'>('paid');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'online'>('cash');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [planPickerOpen, setPlanPickerOpen] = useState(false);
  const [genderPickerOpen, setGenderPickerOpen] = useState(false);

  const pickPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Photo library permission is needed.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      if (!result.canceled && result.assets[0]) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch {
      // fallback
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim() || fullName.trim().length < 2) {
      newErrors.fullName = 'Please enter a valid full name (at least 2 letters)';
    }

    const cleanPhone = phone.trim().replace(/[\s-]/g, '');
    if (!cleanPhone || cleanPhone.length < 7) {
      newErrors.phone = 'Please enter a valid phone number (at least 7 digits)';
    }

    const parsedAge = parseInt(age.trim(), 10);
    if (!age.trim() || isNaN(parsedAge) || parsedAge < 10 || parsedAge > 95) {
      newErrors.age = 'Please enter a valid age between 10 and 95';
    }

    if (!gender) {
      newErrors.gender = 'Please select a gender';
    }

    if (!selectedPlan) {
      newErrors.plan = 'Please select a membership plan';
    }

    if (!joiningDate.trim()) {
      newErrors.joiningDate = 'Please enter joining date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [createdMember, setCreatedMember] = useState<{ id: string; name: string; number: string; status: string; amount: number } | null>(null);

  const handleSave = () => {
    if (!validate()) {
      return;
    }

    if (!selectedPlan) return;

    setLoading(true);
    setTimeout(() => {
      try {
        const isoJoinDate = joiningDate.trim() || todayStr;
        // If paid now, their next payment is in duration_days. If pay later, their payment is due today!
        const memberDueDate = paymentOption === 'paid'
          ? addDays(isoJoinDate, selectedPlan.duration_days)
          : isoJoinDate;
        const parsedAge = parseInt(age.trim(), 10);

        // 1. Insert member
        const member = MemberRepository.insert({
          full_name: fullName.trim(),
          phone: phone.trim(),
          age: parsedAge,
          gender: gender.toLowerCase(),
          photo_uri: photoUri,
          plan_id: selectedPlan.id,
          joining_date: isoJoinDate,
          next_due_date: memberDueDate,
          status: 'active',
        });

        // 2. Insert payment record
        if (paymentOption === 'paid') {
          PaymentRepository.insert({
            member_id: member.id,
            amount: selectedPlan.price,
            paid_at: new Date().toISOString(),
            due_date: memberDueDate,
            payment_status: 'paid',
            payment_method: paymentMethod,
            notes: 'Registration fee paid on joining',
          });
        } else {
          PaymentRepository.insert({
            member_id: member.id,
            amount: selectedPlan.price,
            paid_at: null,
            due_date: isoJoinDate,
            payment_status: 'due',
            payment_method: paymentMethod,
            notes: 'Pending initial registration fee',
          });
        }

        // 3. Trigger live dynamic notifications
        NotificationService.add({
          category: 'member',
          title: 'New Member Enrolled',
          message: `${member.full_name} (${member.member_number}) registered on ${selectedPlan.name}`,
        });
        if (paymentOption === 'paid') {
          NotificationService.add({
            category: 'payment',
            title: 'Payment Received',
            message: `Received PKR ${selectedPlan.price.toLocaleString()} from ${member.full_name} on enrollment`,
          });
        } else {
          NotificationService.add({
            category: 'payment',
            title: 'Fee Due Registered',
            message: `${member.full_name} enrolled with fee PKR ${selectedPlan.price.toLocaleString()} due`,
          });
        }

        // 4. Show in-frame success modal
        setCreatedMember({
          id: member.id,
          name: member.full_name,
          number: member.member_number,
          status: paymentOption === 'paid' ? 'Paid' : 'Due',
          amount: selectedPlan.price,
        });
      } catch (e: any) {
        Alert.alert('Error', e?.message ?? 'Failed to register member.');
      } finally {
        setLoading(false);
      }
    }, 250);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Top Header matching Screen 4 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <ChevronLeftIcon size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Member</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Profile Photo Placeholder with Camera Icon */}
        <TouchableOpacity style={styles.photoWrap} onPress={pickPhoto} activeOpacity={0.8}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photoImg} />
          ) : (
            <View style={styles.photoCircle}>
              <CameraIcon size={26} color="#64748B" />
            </View>
          )}
          <Text style={styles.addPhotoText}>
            {photoUri ? 'Change Photo' : 'Add Photo'}
          </Text>
        </TouchableOpacity>

        {/* Section Heading */}
        <Text style={styles.sectionTitle}>Personal Information</Text>

        {/* Full Name */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Full Name *</Text>
          <TextInput
            style={[styles.textInput, errors.fullName ? styles.inputError : null]}
            placeholder="Enter full name (e.g. Ali Raza)"
            placeholderTextColor="#94A3B8"
            value={fullName}
            onChangeText={(t) => {
              setFullName(t);
              if (errors.fullName) setErrors(prev => ({ ...prev, fullName: '' }));
            }}
          />
          {errors.fullName ? (
            <View style={styles.errorRow}>
              <AlertCircleIcon size={14} color="#EF4444" />
              <Text style={styles.errorSub}>{errors.fullName}</Text>
            </View>
          ) : null}
        </View>

        {/* Phone Number */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Phone Number *</Text>
          <TextInput
            style={[styles.textInput, errors.phone ? styles.inputError : null]}
            placeholder="Enter phone number (e.g. 0300 1234567)"
            placeholderTextColor="#94A3B8"
            value={phone}
            onChangeText={(t) => {
              setPhone(t);
              if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
            }}
            keyboardType="phone-pad"
          />
          {errors.phone ? (
            <View style={styles.errorRow}>
              <AlertCircleIcon size={14} color="#EF4444" />
              <Text style={styles.errorSub}>{errors.phone}</Text>
            </View>
          ) : null}
        </View>

        {/* Age & Gender (2-columns row) */}
        <View style={styles.twoColRow}>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={styles.fieldLabel}>Age *</Text>
            <TextInput
              style={[styles.textInput, errors.age ? styles.inputError : null]}
              placeholder="e.g. 24"
              placeholderTextColor="#94A3B8"
              value={age}
              onChangeText={(t) => {
                setAge(t);
                if (errors.age) setErrors(prev => ({ ...prev, age: '' }));
              }}
              keyboardType="numeric"
              maxLength={2}
            />
            {errors.age ? (
              <View style={styles.errorRow}>
                <Text style={styles.errorSub}>{errors.age}</Text>
              </View>
            ) : null}
          </View>

          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={styles.fieldLabel}>Gender *</Text>
            <TouchableOpacity
              style={styles.selectBtn}
              onPress={() => setGenderPickerOpen(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.selectText}>{gender}</Text>
              <ChevronDownIcon size={16} color="#64748B" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Membership Plan */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Membership Plan *</Text>
          <TouchableOpacity
            style={styles.selectBtn}
            onPress={() => setPlanPickerOpen(true)}
            activeOpacity={0.8}
          >
            <Text style={selectedPlan ? styles.selectText : styles.placeholderText}>
              {selectedPlan
                ? `${selectedPlan.name} · PKR ${selectedPlan.price.toLocaleString()}`
                : 'Select plan'}
            </Text>
            <ChevronDownIcon size={16} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Joining Date */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Joining Date (YYYY-MM-DD) *</Text>
          <View style={styles.dateInputWrap}>
            <TextInput
              style={styles.dateTextInput}
              value={joiningDate}
              onChangeText={setJoiningDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#94A3B8"
            />
            <CalendarIcon size={18} color="#64748B" />
          </View>
        </View>

        {/* Initial Payment Status Selector */}
        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>Initial Payment Status</Text>
          <View style={styles.paymentToggleRow}>
            <TouchableOpacity
              style={[
                styles.payToggleBtn,
                paymentOption === 'paid' && styles.payToggleBtnActivePaid,
              ]}
              onPress={() => setPaymentOption('paid')}
              activeOpacity={0.8}
            >
              <CheckCircleIcon
                size={16}
                color={paymentOption === 'paid' ? '#16A34A' : '#94A3B8'}
              />
              <Text
                style={[
                  styles.payToggleText,
                  paymentOption === 'paid' && styles.payToggleTextActivePaid,
                ]}
              >
                Paid Now
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.payToggleBtn,
                paymentOption === 'due' && styles.payToggleBtnActiveDue,
              ]}
              onPress={() => setPaymentOption('due')}
              activeOpacity={0.8}
            >
              <AlertCircleIcon
                size={16}
                color={paymentOption === 'due' ? '#D97706' : '#94A3B8'}
              />
              <Text
                style={[
                  styles.payToggleText,
                  paymentOption === 'due' && styles.payToggleTextActiveDue,
                ]}
              >
                Pay Later (Due)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Payment Method (if Paid Now) */}
          {paymentOption === 'paid' ? (
            <View style={styles.methodRow}>
              <Text style={styles.methodLabel}>Method:</Text>
              {(['cash', 'online'] as const).map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[
                    styles.methodPill,
                    paymentMethod === m && styles.methodPillActive,
                  ]}
                  onPress={() => setPaymentMethod(m)}
                >
                  <Text
                    style={[
                      styles.methodPillText,
                      paymentMethod === m && styles.methodPillTextActive,
                    ]}
                  >
                    {m.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
        </View>

        {/* Yellow "Save Member" Pill Button */}
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.saveBtnText}>
            {loading ? 'Registering...' : 'Save Member'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Plan Selection In-Frame Modal */}
      <AppModal
        visible={planPickerOpen}
        onClose={() => setPlanPickerOpen(false)}
      >
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Select Membership Plan</Text>
          {plans.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[
                styles.modalOption,
                selectedPlan?.id === p.id && styles.modalOptionActive,
              ]}
              onPress={() => {
                setSelectedPlan(p);
                setPlanPickerOpen(false);
              }}
            >
              <View>
                <Text style={styles.optionName}>{p.name}</Text>
                <Text style={styles.optionSub}>
                  {p.duration_days} days ·{' '}
                  {p.type === 'personal_training'
                    ? 'Personal Training'
                    : 'Gym Membership'}
                </Text>
              </View>
              <Text style={styles.optionPrice}>
                PKR {p.price.toLocaleString()}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.modalCloseBtn}
            onPress={() => setPlanPickerOpen(false)}
          >
            <Text style={styles.modalCloseText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </AppModal>

      {/* Gender Selection In-Frame Modal */}
      <AppModal
        visible={genderPickerOpen}
        onClose={() => setGenderPickerOpen(false)}
      >
        <View style={[styles.modalCard, { paddingBottom: 24 }]}>
          <Text style={styles.modalTitle}>Select Gender</Text>
          {(['Male', 'Female'] as const).map((g) => (
            <TouchableOpacity
              key={g}
              style={styles.modalOption}
              onPress={() => {
                setGender(g);
                setGenderPickerOpen(false);
              }}
            >
              <Text style={styles.optionName}>{g}</Text>
              {gender === g && <CheckCircleIcon size={18} color="#16A34A" />}
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.modalCloseBtn}
            onPress={() => setGenderPickerOpen(false)}
          >
            <Text style={styles.modalCloseText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </AppModal>

      {/* Member Registration Success In-Frame Modal */}
      <AppModal
        visible={Boolean(createdMember)}
        onClose={() => router.replace('/(tabs)/members')}
      >
        <View style={styles.successCard}>
          <View style={styles.successIconCircle}>
            <CheckCircleIcon size={36} color="#16A34A" />
          </View>
          <Text style={styles.successModalTitle}>Member Added! 🎉</Text>
          <Text style={styles.successModalSub}>
            <Text style={{ fontWeight: '700', color: '#0F172A' }}>{createdMember?.name}</Text> has been registered with ID{' '}
            <Text style={{ fontWeight: '700', color: '#0F172A' }}>{createdMember?.number}</Text>.
          </Text>

          {/* Payment Status Pill */}
          <View style={styles.successStatusRow}>
            <Text style={styles.successStatusLabel}>Initial Status:</Text>
            <View
              style={[
                styles.successStatusBadge,
                createdMember?.status === 'Paid'
                  ? styles.successStatusBadgePaid
                  : styles.successStatusBadgeDue,
              ]}
            >
              <Text
                style={[
                  styles.successStatusBadgeText,
                  createdMember?.status === 'Paid'
                    ? { color: '#16A34A' }
                    : { color: '#D97706' },
                ]}
              >
                {createdMember?.status === 'Paid'
                  ? `Paid (PKR ${createdMember?.amount.toLocaleString()})`
                  : `Payment Due (PKR ${createdMember?.amount.toLocaleString()})`}
              </Text>
            </View>
          </View>

          <View style={styles.successActions}>
            <TouchableOpacity
              style={styles.viewProfileBtn}
              onPress={() => router.replace(`/members/${createdMember?.id}`)}
              activeOpacity={0.8}
            >
              <Text style={styles.viewProfileBtnText}>View Member Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => router.replace('/(tabs)/members')}
              activeOpacity={0.8}
            >
              <Text style={styles.doneBtnText}>Back to Members List</Text>
            </TouchableOpacity>
          </View>
        </View>
      </AppModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },

  photoWrap: {
    alignItems: 'center',
    marginBottom: 20,
  },
  photoCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  photoImg: {
    width: 76,
    height: 76,
    borderRadius: 38,
    marginBottom: 6,
  },
  addPhotoText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: '#64748B',
  },

  sectionTitle: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    color: '#0F172A',
    marginBottom: 12,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: '#334155',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: '#0F172A',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  errorSub: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: '#DC2626',
  },

  twoColRow: {
    flexDirection: 'row',
    gap: 12,
  },
  selectBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 11,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: '#0F172A',
  },
  placeholderText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: '#94A3B8',
  },
  dateInputWrap: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateTextInput: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: '#0F172A',
  },

  paymentSection: {
    marginTop: 6,
    marginBottom: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: Radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  paymentToggleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  payToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: Radius.md,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  payToggleBtnActivePaid: {
    borderColor: '#16A34A',
    backgroundColor: '#F0FDF4',
  },
  payToggleBtnActiveDue: {
    borderColor: '#D97706',
    backgroundColor: '#FEF3C7',
  },
  payToggleText: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: '#64748B',
  },
  payToggleTextActivePaid: {
    color: '#16A34A',
    fontFamily: Fonts.bold,
  },
  payToggleTextActiveDue: {
    color: '#D97706',
    fontFamily: Fonts.bold,
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  methodLabel: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: '#64748B',
  },
  methodPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  methodPillActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  methodPillText: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: '#64748B',
  },
  methodPillTextActive: {
    color: '#FFFFFF',
    fontFamily: Fonts.bold,
  },

  saveBtn: {
    backgroundColor: '#F59E0B',
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    ...Shadow.sm,
  },
  saveBtnText: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    color: '#0F172A',
  },

  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    ...Shadow.card,
  },
  modalTitle: {
    fontFamily: Fonts.bold,
    fontSize: 17,
    color: '#0F172A',
    marginBottom: 14,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalOptionActive: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  optionName: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: '#0F172A',
  },
  optionSub: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  optionPrice: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: '#D97706',
  },
  modalCloseBtn: {
    marginTop: 14,
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalCloseText: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: '#64748B',
  },

  successCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    alignItems: 'center',
    ...Shadow.card,
  },
  successIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  successModalTitle: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    color: '#0F172A',
    marginBottom: 8,
  },
  successModalSub: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  successStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radius.md,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  successStatusLabel: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: '#64748B',
  },
  successStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  successStatusBadgePaid: {
    backgroundColor: '#DCFCE7',
  },
  successStatusBadgeDue: {
    backgroundColor: '#FEF3C7',
  },
  successStatusBadgeText: {
    fontFamily: Fonts.bold,
    fontSize: 12,
  },
  successActions: {
    width: '100%',
    gap: 10,
  },
  viewProfileBtn: {
    width: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    ...Shadow.sm,
  },
  viewProfileBtnText: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: '#0F172A',
  },
  doneBtn: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: Radius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  doneBtnText: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: '#64748B',
  },
});
