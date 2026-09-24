import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Alert,
  Image,
  Modal,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Fonts, Radius } from '../../constants/theme';
import { AttendanceRepository, Attendance } from '../../db/repositories/AttendanceRepository';
import { MemberRepository, Member } from '../../db/repositories/MemberRepository';
import { BiometricService } from '../../services/BiometricService';
import { AppModal } from '../../components/ui/AppModal';
import {
  ChevronLeftIcon,
  FingerprintIcon,
} from '../../components/ui/Icons';
import { getMemberAvatar } from '../../constants/mockAvatars';

type AttendanceFilter = 'all' | 'present' | 'absent';

export default function AttendanceScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<AttendanceFilter>('present');
  const [members, setMembers] = useState<Member[]>([]);
  const [todayAttendances, setTodayAttendances] = useState<Attendance[]>([]);
  const [scanning, setScanning] = useState(false);
  const [memberPickerVisible, setMemberPickerVisible] = useState(false);

  const loadData = useCallback(() => {
    const all = MemberRepository.getAll();
    setMembers(all);
    const todayList = AttendanceRepository.getToday();
    setTodayAttendances(todayList);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleBiometricScan = async () => {
    try {
      setScanning(true);
      const isAvailable = await BiometricService.isAvailable();
      if (!isAvailable) {
        // Fallback for web/laptop testing: allow selecting member directly
        setMemberPickerVisible(true);
        return;
      }

      const success = await BiometricService.authenticate('Scan fingerprint for gym check-in');
      if (success) {
        setMemberPickerVisible(true);
      } else {
        Alert.alert('Scan Cancelled', 'Fingerprint verification was not completed.');
      }
    } catch {
      setMemberPickerVisible(true);
    } finally {
      setScanning(false);
    }
  };

  const handleCheckInMember = (member: Member) => {
    try {
      if (AttendanceRepository.hasCheckedInToday(member.id)) {
        Alert.alert('Already Checked In', `${member.full_name} has already checked in today.`);
        setMemberPickerVisible(false);
        return;
      }

      AttendanceRepository.markAttendance(member.id, 'biometric');
      setMemberPickerVisible(false);
      loadData();
      Alert.alert('Attendance Marked ✓', `${member.full_name} checked in successfully!`);
    } catch (e: any) {
      Alert.alert('Notice', e?.message ?? 'Could not record attendance');
    }
  };

  // Calculate dynamic present & absent lists
  const todayAttendancesMap = new Map<string, Attendance>();
  todayAttendances.forEach(a => todayAttendancesMap.set(a.member_id, a));

  const totalMembersCount = members.length;
  const presentCount = todayAttendances.length;
  const attendanceRate = totalMembersCount > 0 ? Math.min(100, Math.round((presentCount / totalMembersCount) * 100)) : 0;

  // Build items list
  const memberItems = members.map(m => {
    const att = todayAttendancesMap.get(m.id);
    const isPresent = Boolean(att);
    let checkInTime = 'Not checked in';
    if (att) {
      const d = new Date(att.check_in_at);
      let h = d.getHours();
      const mins = String(d.getMinutes()).padStart(2, '0');
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      checkInTime = `${String(h).padStart(2, '0')}:${mins} ${ampm}`;
    }
    return {
      id: m.id,
      name: m.full_name,
      number: m.member_number,
      age: m.age ?? 22,
      time: checkInTime,
      status: isPresent ? 'present' : 'absent',
      member: m,
    };
  });

  const displayItems = memberItems.filter(item => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header matching Screen 8 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <ChevronLeftIcon size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Attendance</Text>
        <TouchableOpacity
          style={styles.deviceBtn}
          onPress={() => router.push('/settings/biometric-device' as any)}
          activeOpacity={0.7}
        >
          <View style={styles.devicePulseDot} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Big Glowing Neon Green Fingerprint Scanner matching Screen 8 */}
        <View style={styles.scannerWrapper}>
          <TouchableOpacity
            style={styles.scannerOuterRing}
            activeOpacity={0.8}
            onPress={handleBiometricScan}
          >
            <View style={styles.scannerInnerRing}>
              <FingerprintIcon size={52} color="#10B981" strokeWidth={2} />
            </View>
          </TouchableOpacity>

          <Text style={styles.scannerTitle}>Scan Fingerprint</Text>
          <Text style={styles.scannerSubtitle}>
            {scanning ? 'Scanning biometric sensor...' : 'Place your finger on the scanner to mark attendance'}
          </Text>
        </View>

        {/* Today's Attendance Progress Card matching Screen 8 */}
        <View style={styles.todayCard}>
          <View style={styles.todayHeader}>
            <Text style={styles.todayLabel}>{"Today's Attendance"}</Text>
            <Text style={styles.todayPct}>{attendanceRate}%</Text>
          </View>

          <Text style={styles.todayFraction}>
            {presentCount} <Text style={styles.todayFractionTotal}>/ {totalMembersCount}</Text>
          </Text>

          {/* Green Progress Bar */}
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${attendanceRate}%` }]} />
          </View>
        </View>

        {/* Filter Pills matching Screen 8 */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterPill, filter === 'all' && styles.filterPillActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
              All ({memberItems.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterPill, filter === 'present' && styles.filterPillActive]}
            onPress={() => setFilter('present')}
          >
            <Text style={[styles.filterText, filter === 'present' && styles.filterTextActive]}>
              Present ({presentCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterPill, filter === 'absent' && styles.filterPillActive]}
            onPress={() => setFilter('absent')}
          >
            <Text style={[styles.filterText, filter === 'absent' && styles.filterTextActive]}>
              Absent ({Math.max(0, totalMembersCount - presentCount)})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Attendance Records List matching Screen 8 */}
        <View style={styles.recordsList}>
          {displayItems.map(item => {
            const avatarUrl = getMemberAvatar(item.name);
            return (
              <View key={item.id} style={styles.recordItem}>
                <Image source={{ uri: avatarUrl }} style={styles.recordAvatar} />

                <View style={styles.recordInfo}>
                  <Text style={styles.recordName}>{item.name}</Text>
                  <Text style={styles.recordSub}>
                    {item.number} · {item.age} years
                  </Text>
                </View>

                <View style={styles.recordRight}>
                  {item.status === 'present' ? (
                    <>
                      <Text style={styles.recordTime}>{item.time}</Text>
                      <View style={styles.presentBadge}>
                        <Text style={styles.presentBadgeText}>Present</Text>
                      </View>
                    </>
                  ) : (
                    <TouchableOpacity
                      style={styles.quickCheckInBtn}
                      onPress={() => handleCheckInMember(item.member)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.quickCheckInText}>+ Check In</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Member Picker In-Frame Modal */}
      <AppModal
        visible={memberPickerVisible}
        onClose={() => setMemberPickerVisible(false)}
      >
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Select Member to Check In</Text>
          <FlatList
            data={members}
            keyExtractor={m => m.id}
            style={{ maxHeight: 360 }}
            renderItem={({ item }) => {
              const avatarUrl = getMemberAvatar(item.full_name, item.photo_uri);
              const alreadyIn = AttendanceRepository.hasCheckedInToday(item.id);
              return (
                <TouchableOpacity
                  style={[styles.modalItem, alreadyIn && { opacity: 0.6 }]}
                  onPress={() => handleCheckInMember(item)}
                  disabled={alreadyIn}
                >
                  <Image source={{ uri: avatarUrl }} style={styles.modalAvatar} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalMemberName}>{item.full_name}</Text>
                    <Text style={styles.modalMemberSub}>{item.member_number}</Text>
                  </View>
                  <Text style={[styles.modalCheckInText, alreadyIn && { color: '#10B981' }]}>
                    {alreadyIn ? 'Present ✓' : 'Check In →'}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
          <TouchableOpacity
            style={styles.modalCloseBtn}
            onPress={() => setMemberPickerVisible(false)}
          >
            <Text style={styles.modalCloseText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </AppModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0B0F15' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#161F2E',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#161F2E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  headerTitle: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: '#FFFFFF',
  },
  deviceBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#161F2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  devicePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },

  scannerWrapper: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  scannerOuterRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
  },
  scannerInnerRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F291E',
  },
  scannerTitle: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  scannerSubtitle: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    paddingHorizontal: 24,
  },

  todayCard: {
    backgroundColor: '#111827',
    borderRadius: Radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1F2937',
    marginBottom: 20,
  },
  todayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  todayLabel: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: '#94A3B8',
  },
  todayPct: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: '#10B981',
  },
  todayFraction: {
    fontFamily: Fonts.bold,
    fontSize: 22,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  todayFractionTotal: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: '#94A3B8',
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1F2937',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },

  filterRow: {
    flexDirection: 'row',
    backgroundColor: '#161F2E',
    borderRadius: Radius.full,
    padding: 4,
    marginBottom: 16,
  },
  filterPill: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: Radius.full,
  },
  filterPillActive: {
    backgroundColor: '#F59E0B',
  },
  filterText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: '#94A3B8',
  },
  filterTextActive: {
    color: '#0F172A',
    fontFamily: Fonts.bold,
  },

  recordsList: {
    gap: 8,
  },
  recordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  recordAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#1F2937',
  },
  recordInfo: { flex: 1 },
  recordName: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  recordSub: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  recordRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  recordTime: {
    fontFamily: Fonts.regular,
    fontSize: 10,
    color: '#94A3B8',
  },
  presentBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  presentBadgeText: {
    fontFamily: Fonts.semiBold,
    fontSize: 10,
    color: '#10B981',
  },
  quickCheckInBtn: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  quickCheckInText: {
    fontFamily: Fonts.bold,
    fontSize: 11,
    color: '#0F172A',
  },

  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#161F2E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalTitle: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  modalAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  modalMemberName: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  modalMemberSub: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: '#94A3B8',
  },
  modalCheckInText: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    color: '#F59E0B',
  },
  modalCloseBtn: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCloseText: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: '#94A3B8',
  },
});
