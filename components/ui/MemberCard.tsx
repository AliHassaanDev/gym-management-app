import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Colors, Fonts, Radius, Spacing, Shadow } from '../../constants/theme';
import { StatusBadge } from './StatusBadge';
import { ChevronRightIcon } from './Icons';
import { getMemberAvatar } from '../../constants/mockAvatars';
import { Member } from '../../db/repositories/MemberRepository';

interface MemberCardProps {
  member: Member;
  onPress: () => void;
}

export const MemberCard = ({ member, onPress }: MemberCardProps) => {
  const avatarUrl = getMemberAvatar(member.full_name, member.photo_uri);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {/* Avatar Photo */}
      <View style={styles.avatarWrap}>
        <Image
          source={{ uri: avatarUrl }}
          style={styles.avatar}
          defaultSource={{ uri: avatarUrl }}
        />
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{member.full_name}</Text>
        <Text style={styles.meta}>
          {member.member_number} · {member.age ?? 22} years
        </Text>
      </View>

      {/* Badge + SVG Chevron */}
      <View style={styles.right}>
        <StatusBadge status={(member.payment_status as any) ?? 'paid'} />
        <ChevronRightIcon size={18} color="#94A3B8" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Shadow.sm,
  },
  avatarWrap: { marginRight: Spacing.md },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E2E8F0',
  },
  info: { flex: 1 },
  name: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  meta: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
