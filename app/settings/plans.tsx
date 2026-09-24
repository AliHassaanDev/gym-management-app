import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Fonts, Radius, Shadow } from '../../constants/theme';
import { PlanRepository, Plan } from '../../db/repositories/PlanRepository';
import { ChevronLeftIcon, CalendarIcon } from '../../components/ui/Icons';
import { formatPKR } from '../../utils/helpers';

export default function PlansScreen() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState<'membership' | 'personal_training'>('membership');
  const [durationDays, setDurationDays] = useState('30');
  const [price, setPrice] = useState('3000');

  const loadPlans = useCallback(() => {
    const all = PlanRepository.getAll();
    setPlans(all);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPlans();
    }, [loadPlans])
  );

  const openAddModal = () => {
    setEditingPlan(null);
    setName('');
    setType('membership');
    setDurationDays('30');
    setPrice('3000');
    setModalVisible(true);
  };

  const openEditModal = (plan: Plan) => {
    setEditingPlan(plan);
    setName(plan.name);
    setType(plan.type);
    setDurationDays(String(plan.duration_days));
    setPrice(String(plan.price));
    setModalVisible(true);
  };

  const handleSavePlan = () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter a plan name.');
      return;
    }
    const days = parseInt(durationDays, 10);
    const p = parseFloat(price);

    if (isNaN(days) || days <= 0) {
      Alert.alert('Validation Error', 'Please enter valid duration in days.');
      return;
    }
    if (isNaN(p) || p < 0) {
      Alert.alert('Validation Error', 'Please enter a valid price in PKR.');
      return;
    }

    if (editingPlan) {
      PlanRepository.update(editingPlan.id, {
        name: name.trim(),
        type,
        duration_days: days,
        price: p,
      });
    } else {
      PlanRepository.insert({
        name: name.trim(),
        type,
        duration_days: days,
        price: p,
        is_active: 1,
      });
    }

    setModalVisible(false);
    loadPlans();
  };

  const handleDelete = (plan: Plan) => {
    Alert.alert('Delete Plan', `Are you sure you want to remove "${plan.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          PlanRepository.softDelete(plan.id);
          loadPlans();
        },
      },
    ]);
  };

  const membershipPlans = plans.filter(p => p.type === 'membership');
  const ptPlans = plans.filter(p => p.type === 'personal_training');

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <ChevronLeftIcon size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.title}>Membership Plans</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAddModal} activeOpacity={0.8}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Section 1: Membership Plans */}
        <View style={styles.sectionHeader}>
          <CalendarIcon size={18} color="#0F172A" />
          <Text style={styles.sectionTitle}>General Membership Plans</Text>
        </View>

        {membershipPlans.length === 0 ? (
          <Text style={styles.emptyNote}>No membership plans created yet.</Text>
        ) : (
          membershipPlans.map(plan => (
            <View key={plan.id} style={styles.planCard}>
              <View style={styles.planInfo}>
                <Text style={styles.planName}>{plan.name}</Text>
                <Text style={styles.planDetails}>
                  {plan.duration_days} days validity ·{' '}
                  <Text style={styles.planPrice}>{formatPKR(plan.price)}</Text>
                </Text>
              </View>
              <View style={styles.planActions}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => openEditModal(plan)}
                >
                  <Text style={styles.editBtnText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(plan)}
                >
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {/* Section 2: Personal Training Plans */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <CalendarIcon size={18} color="#0F172A" />
          <Text style={styles.sectionTitle}>Personal Training Plans</Text>
        </View>

        {ptPlans.length === 0 ? (
          <Text style={styles.emptyNote}>No personal training plans created yet.</Text>
        ) : (
          ptPlans.map(plan => (
            <View key={plan.id} style={styles.planCard}>
              <View style={styles.planInfo}>
                <Text style={styles.planName}>{plan.name}</Text>
                <Text style={styles.planDetails}>
                  {plan.duration_days} days validity ·{' '}
                  <Text style={styles.planPrice}>{formatPKR(plan.price)}</Text>
                </Text>
              </View>
              <View style={styles.planActions}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => openEditModal(plan)}
                >
                  <Text style={styles.editBtnText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(plan)}
                >
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add / Edit Plan Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalTop}>
              <Text style={styles.modalHeading}>
                {editingPlan ? 'Edit Plan' : 'Create New Plan'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Type selector */}
            <Text style={styles.inputLabel}>Plan Category</Text>
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeTab,
                  type === 'membership' && styles.activeTypeTab,
                ]}
                onPress={() => setType('membership')}
              >
                <Text
                  style={[
                    styles.typeTabText,
                    type === 'membership' && styles.activeTypeTabText,
                  ]}
                >
                  Membership
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeTab,
                  type === 'personal_training' && styles.activeTypeTab,
                ]}
                onPress={() => setType('personal_training')}
              >
                <Text
                  style={[
                    styles.typeTabText,
                    type === 'personal_training' && styles.activeTypeTabText,
                  ]}
                >
                  Personal Training
                </Text>
              </TouchableOpacity>
            </View>

            {/* Name */}
            <Text style={styles.inputLabel}>Plan Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Monthly Standard, PT 1-on-1"
              placeholderTextColor="#94A3B8"
              value={name}
              onChangeText={setName}
            />

            {/* Duration */}
            <Text style={styles.inputLabel}>Validity Duration (Days)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 30, 90, 365"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={durationDays}
              onChangeText={setDurationDays}
            />

            {/* Price */}
            <Text style={styles.inputLabel}>Price in PKR</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 3000"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />

            {/* Save Button */}
            <TouchableOpacity style={styles.saveBtn} onPress={handleSavePlan}>
              <Text style={styles.saveBtnText}>
                {editingPlan ? 'Update Plan' : 'Save Plan'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  title: { fontFamily: Fonts.bold, fontSize: 18, color: '#0F172A' },
  addBtn: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.full,
  },
  addBtnText: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: '#0F172A',
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    color: '#0F172A',
  },
  emptyNote: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 12,
  },

  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Shadow.sm,
  },
  planInfo: { flex: 1 },
  planName: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: '#0F172A',
  },
  planDetails: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
  },
  planPrice: {
    fontFamily: Fonts.bold,
    color: '#D97706',
  },
  planActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editBtn: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  editBtnText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: '#0F172A',
  },
  deleteBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: '#FEE2E2',
  },
  deleteBtnText: {
    fontSize: 11,
    color: '#DC2626',
    fontFamily: Fonts.medium,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalHeading: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: '#0F172A',
  },
  closeIcon: {
    fontSize: 18,
    color: '#64748B',
    padding: 4,
  },
  inputLabel: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: '#334155',
    marginBottom: 6,
    marginTop: 8,
  },
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: Radius.full,
    padding: 3,
    marginBottom: 8,
  },
  typeTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: Radius.full,
  },
  activeTypeTab: {
    backgroundColor: '#FFFFFF',
    ...Shadow.sm,
  },
  typeTabText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: '#64748B',
  },
  activeTypeTabText: {
    color: '#0F172A',
    fontFamily: Fonts.bold,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  saveBtn: {
    backgroundColor: '#F59E0B',
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
    ...Shadow.sm,
  },
  saveBtnText: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    color: '#0F172A',
  },
});
