import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Svg, { Rect, Line } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Fonts, Radius, Shadow } from '../../constants/theme';
import { ChevronLeftIcon, ChevronDownIcon } from '../../components/ui/Icons';

export default function ReportsScreen() {
  const router = useRouter();
  const periods = ['Last 30 Days', 'Last 7 Days', 'Last 90 Days', 'This Year'];
  const [periodIndex, setPeriodIndex] = useState(0);
  const period = periods[periodIndex];

  const cyclePeriod = () => {
    setPeriodIndex((prev) => (prev + 1) % periods.length);
  };

  const barData = [
    { label: 'Aug 1', value: 140000, height: 70 },
    { label: 'Aug 8', value: 175000, height: 85 },
    { label: 'Aug 15', value: 160000, height: 80 },
    { label: 'Aug 22', value: 210000, height: 105 },
    { label: 'Aug 30', value: 256000, height: 125 },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header matching Screen 9 */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
            <ChevronLeftIcon size={20} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Reports</Text>
        </View>

        {/* Dropdown filter pill */}
        <TouchableOpacity style={styles.periodPill} onPress={cyclePeriod} activeOpacity={0.8}>
          <Text style={styles.periodText}>{period}</Text>
          <ChevronDownIcon size={14} color="#64748B" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* 2x2 Grid Stat Cards matching Screen 9 */}
        <View style={styles.gridRow}>
          {/* Total Revenue */}
          <View style={styles.statCard}>
            <Text style={styles.cardLabel}>Total Revenue</Text>
            <Text style={styles.cardValue}>PKR 256,000</Text>
            <View style={styles.trendRow}>
              <Text style={styles.trendGreen}>↑ 18%</Text>
            </View>
          </View>

          {/* New Members */}
          <View style={styles.statCard}>
            <Text style={styles.cardLabel}>New Members</Text>
            <Text style={styles.cardValue}>12</Text>
            <View style={styles.trendRow}>
              <Text style={styles.trendGreen}>↑ 33%</Text>
            </View>
          </View>
        </View>

        <View style={styles.gridRow}>
          {/* Active Members */}
          <View style={styles.statCard}>
            <Text style={styles.cardLabel}>Active Members</Text>
            <Text style={styles.cardValue}>118</Text>
            <View style={styles.trendRow}>
              <Text style={styles.trendGreen}>↑ 9%</Text>
            </View>
          </View>

          {/* Attendance Rate */}
          <View style={styles.statCard}>
            <Text style={styles.cardLabel}>Attendance Rate</Text>
            <Text style={styles.cardValue}>96%</Text>
            <View style={styles.trendRow}>
              <Text style={styles.trendGreen}>↑ 4%</Text>
            </View>
          </View>
        </View>

        {/* Section: Revenue Trend Bar Chart matching Screen 9 */}
        <View style={styles.trendCard}>
          <Text style={styles.trendTitle}>Revenue Trend</Text>

          <View style={styles.chartWrapper}>
            <Svg width="100%" height={160} viewBox="0 0 320 160">
              {/* Grid Lines */}
              <Line x1="40" y1="20" x2="310" y2="20" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
              <Line x1="40" y1="75" x2="310" y2="75" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
              <Line x1="40" y1="130" x2="310" y2="130" stroke="#E2E8F0" strokeWidth="1" />

              {/* Bars */}
              {barData.map((b, i) => {
                const x = 60 + i * 50;
                const barH = b.height;
                const y = 130 - barH;
                return (
                  <Rect
                    key={b.label}
                    x={x}
                    y={y}
                    width={22}
                    height={barH}
                    rx={6}
                    fill="#F59E0B"
                  />
                );
              })}
            </Svg>

            {/* Y Axis labels */}
            <View style={styles.yAxisLabels}>
              <Text style={styles.axisText}>200k</Text>
              <Text style={styles.axisText}>100k</Text>
              <Text style={styles.axisText}>0</Text>
            </View>

            {/* X Axis labels */}
            <View style={styles.xAxisLabels}>
              {barData.map(b => (
                <Text key={b.label} style={styles.dateText}>{b.label}</Text>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  periodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadow.sm,
  },
  periodText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: '#0F172A',
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Shadow.sm,
  },
  cardLabel: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  cardValue: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: '#0F172A',
    marginBottom: 4,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendGreen: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    color: '#16A34A',
  },

  trendCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Shadow.sm,
  },
  trendTitle: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    color: '#0F172A',
    marginBottom: 16,
  },
  chartWrapper: {
    position: 'relative',
    height: 180,
  },
  yAxisLabels: {
    position: 'absolute',
    left: 4,
    top: 14,
    bottom: 45,
    justifyContent: 'space-between',
  },
  axisText: {
    fontFamily: Fonts.regular,
    fontSize: 10,
    color: '#94A3B8',
  },
  xAxisLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 56,
    paddingRight: 10,
    marginTop: 6,
  },
  dateText: {
    fontFamily: Fonts.regular,
    fontSize: 10,
    color: '#94A3B8',
  },
});
