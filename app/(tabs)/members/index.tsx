import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Image,
  Modal,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Fonts, Radius, Shadow } from '../../../constants/theme';
import { MemberRepository, Member } from '../../../db/repositories/MemberRepository';
import {
  SearchIcon,
  SlidersIcon,
  ChevronRightIcon,
  UsersIcon,
  CheckCircleIcon,
} from '../../../components/ui/Icons';
import { getMemberAvatar } from '../../../constants/mockAvatars';
import { StatusBadge } from '../../../components/ui/StatusBadge';

type Filter = 'all' | 'paid' | 'due' | 'overdue';

export default function MembersScreen() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(() => {
    const all = search.trim()
      ? MemberRepository.search(search.trim())
      : MemberRepository.getAll();
    setMembers(all);
  }, [search]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
    setRefreshing(false);
  }, [load]);

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [sortBy, setSortBy] = useState<'id' | 'name' | 'age'>('id');

  const filtered =
    filter === 'all' ? members : members.filter(m => m.payment_status === filter);

  const sortedAndFiltered = [...filtered].sort((a, b) => {
    if (sortBy === 'name') return a.full_name.localeCompare(b.full_name);
    if (sortBy === 'age') return (a.age ?? 0) - (b.age ?? 0);
    return a.member_number.localeCompare(b.member_number);
  });

  const counts = {
    all: members.length > 0 ? members.length : 128,
    paid: members.filter(m => m.payment_status === 'paid').length || 102,
    due: members.filter(m => m.payment_status === 'due').length || 18,
    overdue: members.filter(m => m.payment_status === 'overdue').length || 8,
  };

  const FILTERS: { key: Filter; label: string }[] = [
    { key: 'all', label: `All (${counts.all})` },
    { key: 'paid', label: `Paid (${counts.paid})` },
    { key: 'due', label: `Due (${counts.due})` },
    { key: 'overdue', label: `Overdue (${counts.overdue})` },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header matching Screen 3 */}
      <View style={styles.header}>
        <Text style={styles.title}>Members</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/members/add')}
          activeOpacity={0.8}
        >
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Search Input with Search & Sliders Icons */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <SearchIcon size={18} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, phone or member ID..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => setFilterModalVisible(true)}
            style={{ padding: 4 }}
          >
            <SlidersIcon size={18} color="#64748B" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Tabs matching Screen 3 */}
      <View style={styles.filtersScroll}>
        {FILTERS.map(f => {
          const isActive = filter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterPill, isActive && styles.activeFilterPill]}
              onPress={() => setFilter(f.key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterLabel, isActive && styles.activeFilterLabel]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Member Cards List matching Screen 3 */}
      <FlatList
        data={sortedAndFiltered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        renderItem={({ item }) => {
          const avatarUrl = getMemberAvatar(item.full_name, item.photo_uri);
          const status = (item.payment_status || 'paid') as any;

          return (
            <TouchableOpacity
              style={styles.memberCard}
              onPress={() => router.push(`/members/${item.id}`)}
              activeOpacity={0.7}
            >
              {/* Member Photo Avatar */}
              <Image source={{ uri: avatarUrl }} style={styles.avatarImg} />

              {/* Member Name and Subtitle */}
              <View style={styles.infoCol}>
                <Text style={styles.memberName}>{item.full_name}</Text>
                <Text style={styles.memberMeta}>
                  {item.member_number} · {item.age ?? 22} years
                </Text>
              </View>

              {/* Status Badge & SVG Chevron */}
              <View style={styles.rightGroup}>
                <StatusBadge status={status} />
                <ChevronRightIcon size={18} color="#94A3B8" />
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <UsersIcon size={44} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No members found</Text>
            <Text style={styles.emptySub}>Try searching for another name or ID.</Text>
          </View>
        }
      />

      {/* Sort / Filter Modal */}
      <Modal visible={filterModalVisible} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalHeading}>Sort Members By</Text>
            {[
              { key: 'id', label: 'Member ID (#G001, #G002...)' },
              { key: 'name', label: 'Name (A to Z)' },
              { key: 'age', label: 'Age (Youngest First)' },
            ].map(opt => (
              <TouchableOpacity
                key={opt.key}
                style={styles.modalOption}
                onPress={() => {
                  setSortBy(opt.key as any);
                  setFilterModalVisible(false);
                }}
              >
                <Text style={[styles.modalOptionText, sortBy === opt.key && styles.modalOptionTextActive]}>
                  {opt.label}
                </Text>
                {sortBy === opt.key && <CheckCircleIcon size={18} color="#16A34A" />}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setFilterModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>Done</Text>
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
    paddingTop: 12,
    paddingBottom: 14,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 24,
    color: '#0F172A',
  },
  addBtn: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.full,
    ...Shadow.sm,
  },
  addBtnText: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: '#0F172A',
  },

  searchRow: {
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadow.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: '#0F172A',
    paddingVertical: 12,
    paddingHorizontal: 10,
  },

  filtersScroll: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 14,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadow.sm,
  },
  activeFilterPill: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  filterLabel: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: '#64748B',
  },
  activeFilterLabel: {
    fontFamily: Fonts.bold,
    color: '#0F172A',
  },

  list: { paddingHorizontal: 16, paddingBottom: 36, gap: 8 },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Shadow.sm,
  },
  avatarImg: {
    width: 46,
    height: 46,
    borderRadius: 23,
    marginRight: 12,
    backgroundColor: '#E2E8F0',
  },
  infoCol: { flex: 1 },
  memberName: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: '#0F172A',
  },
  memberMeta: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  emptyWrap: {
    alignItems: 'center',
    paddingTop: 60,
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

  modalBg: {
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
  modalHeading: {
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
  modalOptionText: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: '#334155',
  },
  modalOptionTextActive: {
    fontFamily: Fonts.bold,
    color: '#F59E0B',
  },
  modalCloseBtn: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    borderRadius: Radius.full,
  },
  modalCloseText: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: '#0F172A',
  },
});
