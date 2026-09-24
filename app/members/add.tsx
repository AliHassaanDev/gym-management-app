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
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Fonts, Radius, Shadow } from '../../constants/theme';
import { MemberRepository } from '../../db/repositories/MemberRepository';
import { PaymentRepository } from '../../db/repositories/PaymentRepository';
import { PlanRepository, Plan } from '../../db/repositories/PlanRepository';
import {
  ChevronLeftIcon,
  ChevronDownIcon,
  CameraIcon,
  CalendarIcon,
  CheckCircleIcon,
} from '../../components/ui/Icons';
import { addDays } from '../../utils/helpers';

export default function AddMemberScreen() {
  const router = useRouter();
  const plans = PlanRepository.getAll();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | ''>('Male');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(plans[0] ?? null);
  const [joiningDate, setJoiningDate] = useState('22-09-2025');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
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

  const handleSave = () => {
    if (!fullName.trim()) {
      Alert.alert('Missing Field', 'Please enter member full name.');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Missing Field', 'Please enter member phone number.');
      return;
    }
    if (!selectedPlan) {
      Alert.alert('Missing Field', 'Please select a membership plan.');
      return;
    }

    setLoading(true);
    try {
      const isoJoinDate = new Date().toISOString().split('T')[0];
      const nextDueDate = addDays(isoJoinDate, selectedPlan.duration_days);

      const member = MemberRepository.insert({
        full_name: fullName.trim(),
        phone: phone.trim(),
        age: age ? parseInt(age, 10) : 22,
        gender: gender.toLowerCase() || 'male',
        photo_uri: photoUri,
        plan_id: selectedPlan.id,
        joining_date: isoJoinDate,
        next_due_date: nextDueDate,
        status: 'active',
      });

      PaymentRepository.insert({
        member_id: member.id,
        amount: selectedPlan.price,
        paid_at: null,
        due_date: nextDueDate,
        payment_status: 'due',
        payment_method: 'cash',
        notes: null,
      });

      Alert.alert(
        'Member Added',
        `${fullName} has been registered successfully with ID ${member.member_number}.`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to register member.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Top Header matching Screen 4 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <ChevronLeftIcon size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Member</Text>
        <View style={{ width: 40 }} />
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
          <Text style={styles.addPhotoText}>Add Photo</Text>
        </TouchableOpacity>

        {/* Section Heading */}
        <Text style={styles.sectionTitle}>Personal Information</Text>

        {/* Full Name */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Full Name *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter full name"
            placeholderTextColor="#94A3B8"
            value={fullName}
            onChangeText={setFullName}
          />
        </View>

        {/* Phone Number */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Phone Number *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter phone number"
            placeholderTextColor="#94A3B8"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        {/* Age & Gender (2-columns row) */}
        <View style={styles.twoColRow}>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={styles.fieldLabel}>Age *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter age"
              placeholderTextColor="#94A3B8"
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
            />
          </View>

          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={styles.fieldLabel}>Gender *</Text>
            <TouchableOpacity
              style={styles.selectBtn}
              onPress={() => setGenderPickerOpen(true)}
              activeOpacity={0.8}
            >
              <Text style={gender ? styles.selectText : styles.placeholderText}>
                {gender || 'Select gender'}
              </Text>
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
              {selectedPlan ? `${selectedPlan.name} (PKR ${selectedPlan.price.toLocaleString()})` : 'Select plan'}
            </Text>
            <ChevronDownIcon size={16} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Joining Date */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Joining Date *</Text>
          <View style={styles.dateInputWrap}>
            <TextInput
              style={styles.dateTextInput}
              value={joiningDate}
              onChangeText={setJoiningDate}
              placeholder="DD-MM-YYYY"
              placeholderTextColor="#94A3B8"
            />
            <CalendarIcon size={18} color="#64748B" />
          </View>
        </View>

        {/* Yellow "Save Member" Pill Button */}
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.saveBtnText}>{loading ? 'Saving...' : 'Save Member'}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Plan Selection Modal */}
      <Modal visible={planPickerOpen} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select Membership Plan</Text>
            {plans.map(p => (
              <TouchableOpacity
                key={p.id}
                style={[styles.modalOption, selectedPlan?.id === p.id && styles.modalOptionActive]}
                onPress={() => {
                  setSelectedPlan(p);
                  setPlanPickerOpen(false);
                }}
              >
                <View>
                  <Text style={styles.optionName}>{p.name}</Text>
                  <Text style={styles.optionSub}>{p.duration_days} days · {p.type === 'personal_training' ? 'Personal Training' : 'Gym Membership'}</Text>
                </View>
                <Text style={styles.optionPrice}>PKR {p.price.toLocaleString()}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setPlanPickerOpen(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Gender Selection Modal */}
      <Modal visible={genderPickerOpen} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={[styles.modalCard, { paddingBottom: 24 }]}>
            <Text style={styles.modalTitle}>Select Gender</Text>
            {(['Male', 'Female'] as const).map(g => (
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
          </View>
        </View>
      </Modal>
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
    paddingTop: 20,
    paddingBottom: 40,
  },

  photoWrap: {
    alignItems: 'center',
    marginBottom: 24,
  },
  photoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  photoImg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  addPhotoText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: '#64748B',
  },

  sectionTitle: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: '#0F172A',
    marginBottom: 16,
  },
  fieldGroup: {
    marginBottom: 16,
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
    paddingVertical: 12,
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: '#0F172A',
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
    paddingVertical: 12,
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
    paddingVertical: 10,
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

  saveBtn: {
    backgroundColor: '#F59E0B',
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    ...Shadow.sm,
  },
  saveBtnText: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    color: '#0F172A',
  },

  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalTitle: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: '#0F172A',
    marginBottom: 16,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalOptionActive: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  optionName: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
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
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCloseText: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: '#64748B',
  },
});
