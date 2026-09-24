import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import Svg, {
  Path,
  Defs,
  LinearGradient,
  Stop,
  Circle,
  G,
} from 'react-native-svg';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Fonts, Radius, Shadow } from '../../../constants/theme';
import { PaymentRepository } from '../../../db/repositories/PaymentRepository';
import { ChevronLeftIcon } from '../../../components/ui/Icons';
import { formatPKR } from '../../../utils/helpers';

export default function RevenueScreen() {
  const router = useRouter();
  const [currentMonthRev, setCurrentMonthRev] = useState(256000);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(() => {
    const currentRev = PaymentRepository.getCurrentMonthRevenue();
    setCurrentMonthRev(currentRev > 0 ? currentRev : 256000);
  }, []);

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

  // Points for 7-month curved chart matching Screen 7
  // Months: Jan, Feb, Mar, Apr, May, Jun, Jul
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header matching Screen 7 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <ChevronLeftIcon size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Revenue</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Top Metric & Area Chart Card matching Screen 7 */}
        <View style={styles.chartCard}>
          <Text style={styles.chartMetricLabel}>Total Monthly Revenue</Text>
          <Text style={styles.chartMetricValue}>{formatPKR(currentMonthRev)}</Text>
          <View style={styles.trendRow}>
            <Text style={styles.trendGreen}>↑ 18%</Text>
            <Text style={styles.trendMuted}>vs. last month</Text>
          </View>

          {/* Smooth Curved Line & Area Chart */}
          <View style={styles.svgContainer}>
            <Svg width="100%" height={140} viewBox="0 0 320 140">
              <Defs>
                <LinearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor="#F59E0B" stopOpacity="0.35" />
                  <Stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
                </LinearGradient>
              </Defs>

              {/* Area fill */}
              <Path
                d="M 10 95 C 40 92, 60 78, 100 85 C 140 92, 170 70, 210 65 C 250 60, 275 45, 310 20 L 310 130 L 10 130 Z"
                fill="url(#goldGradient)"
              />

              {/* Smooth Line Curve */}
              <Path
                d="M 10 95 C 40 92, 60 78, 100 85 C 140 92, 170 70, 210 65 C 250 60, 275 45, 310 20"
                fill="none"
                stroke="#F59E0B"
                strokeWidth={3}
                strokeLinecap="round"
              />

              {/* End Point Dot */}
              <Circle cx="310" cy="20" r="4.5" fill="#F59E0B" />
              <Circle cx="310" cy="20" r="2" fill="#FFFFFF" />
            </Svg>

            {/* X-Axis Month Labels */}
            <View style={styles.monthsRow}>
              {months.map((m, i) => (
                <Text key={m} style={[styles.monthLabel, i === months.length - 1 && styles.monthLabelActive]}>
                  {m}
                </Text>
              ))}
            </View>
          </View>
        </View>

        {/* Section Heading */}
        <Text style={styles.sectionHeading}>Revenue Breakdown</Text>

        {/* Donut Chart and Legend Card matching Screen 7 */}
        <View style={styles.donutCard}>
          {/* Donut Graphic */}
          <View style={styles.donutWrapper}>
            <Svg width={130} height={130} viewBox="0 0 130 130">
              <G transform="rotate(-90 65 65)">
                {/* Background Ring */}
                <Circle
                  cx="65"
                  cy="65"
                  r="48"
                  stroke="#F1F5F9"
                  strokeWidth="14"
                  fill="none"
                />
                {/* 1. Monthly Fees (86%) - Gold */}
                <Circle
                  cx="65"
                  cy="65"
                  r="48"
                  stroke="#F59E0B"
                  strokeWidth="14"
                  strokeDasharray={`${0.86 * 301.5} 301.5`}
                  strokeDashoffset={0}
                  strokeLinecap="round"
                  fill="none"
                />
                {/* 2. Personal Training (9%) - Blue */}
                <Circle
                  cx="65"
                  cy="65"
                  r="48"
                  stroke="#3B82F6"
                  strokeWidth="14"
                  strokeDasharray={`${0.09 * 301.5} 301.5`}
                  strokeDashoffset={-(0.86 * 301.5 + 4)}
                  strokeLinecap="round"
                  fill="none"
                />
                {/* 3. Other Services (5%) - Purple */}
                <Circle
                  cx="65"
                  cy="65"
                  r="48"
                  stroke="#A855F7"
                  strokeWidth="14"
                  strokeDasharray={`${0.05 * 301.5} 301.5`}
                  strokeDashoffset={-(0.95 * 301.5 + 4)}
                  strokeLinecap="round"
                  fill="none"
                />
              </G>
            </Svg>

            {/* Inner Center Label */}
            <View style={styles.donutCenter}>
              <Text style={styles.centerSmall}>PKR</Text>
              <Text style={styles.centerBig}>256,000</Text>
            </View>
          </View>

          {/* Legend Items */}
          <View style={styles.legendCol}>
            {/* Monthly Fees */}
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.legendName}>Monthly Fees</Text>
              <Text style={styles.legendPct}>86%</Text>
            </View>

            {/* Personal Training */}
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
              <Text style={styles.legendName}>Personal Training</Text>
              <Text style={styles.legendPct}>9%</Text>
            </View>

            {/* Other Services */}
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#A855F7' }]} />
              <Text style={styles.legendName}>Other Services</Text>
              <Text style={styles.legendPct}>5%</Text>
            </View>
          </View>
        </View>

        {/* View Payment Status button */}
        <TouchableOpacity
          style={styles.viewPaymentBtn}
          onPress={() => router.push('/revenue/payment-status')}
          activeOpacity={0.8}
        >
          <Text style={styles.viewPaymentBtnText}>View Detailed Payment Status →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },

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

  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Shadow.sm,
  },
  chartMetricLabel: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: '#64748B',
  },
  chartMetricValue: {
    fontFamily: Fonts.bold,
    fontSize: 26,
    color: '#0F172A',
    marginVertical: 4,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },
  trendGreen: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: '#16A34A',
  },
  trendMuted: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: '#94A3B8',
  },
  svgContainer: {
    marginTop: 10,
  },
  monthsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    marginTop: 8,
  },
  monthLabel: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: '#94A3B8',
  },
  monthLabelActive: {
    color: '#F59E0B',
    fontFamily: Fonts.semiBold,
  },

  sectionHeading: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: '#0F172A',
    marginBottom: 12,
  },

  donutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 20,
    ...Shadow.sm,
  },
  donutWrapper: {
    width: 130,
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginRight: 16,
  },
  donutCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerSmall: {
    fontFamily: Fonts.regular,
    fontSize: 10,
    color: '#64748B',
  },
  centerBig: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: '#0F172A',
  },

  legendCol: {
    flex: 1,
    gap: 14,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  legendName: {
    flex: 1,
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: '#334155',
  },
  legendPct: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    color: '#0F172A',
  },

  viewPaymentBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    ...Shadow.sm,
  },
  viewPaymentBtnText: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: '#F59E0B',
  },
});
