import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, Clock, TrendingUp, ChartBar as BarChart3, ChevronLeft, ChevronRight, Download } from 'lucide-react-native';
import { AttendanceService } from '@/services/AttendanceService';
import { QuickStats } from '@/components/QuickStats';

export default function ReportsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [stats, setStats] = useState({
    totalHours: '0h 0m',
    presentDays: '0/5',
    attendanceRate: 0,
    overtime: '0h 0m',
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadReportData();
  }, [selectedPeriod, currentDate]);

  const loadReportData = async () => {
    try {
      const [todayStats, weekStats] = await Promise.all([
        AttendanceService.getTodayStats(),
        AttendanceService.getWeekStats(),
      ]);

      setStats({
        totalHours: selectedPeriod === 'daily' ? todayStats.totalHours : weekStats.totalHours,
        presentDays: weekStats.presentDays || '5/5',
        attendanceRate: weekStats.attendanceRate || 100,
        overtime: '2h 30m', // Mock data
      });
    } catch (error) {
      console.error('Failed to load report data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadReportData();
  };

  const navigatePeriod = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    if (selectedPeriod === 'daily') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (selectedPeriod === 'weekly') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    
    setCurrentDate(newDate);
  };

  const formatPeriodTitle = () => {
    if (selectedPeriod === 'daily') {
      return currentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } else if (selectedPeriod === 'weekly') {
      const weekStart = new Date(currentDate);
      weekStart.setDate(currentDate.getDate() - currentDate.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      return currentDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
      });
    }
  };

  const isToday = () => {
    const today = new Date();
    return currentDate.toDateString() === today.toDateString();
  };

  const isFutureDate = () => {
    const today = new Date();
    return currentDate > today;
  };

  return (
    <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reports & Analytics</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#3b82f6"
            colors={['#3b82f6']}
          />
        }
      >
        <View style={styles.periodSelector}>
          {(['daily', 'weekly', 'monthly'] as const).map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period && styles.periodButtonTextActive,
                ]}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.dateNavigator}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigatePeriod('prev')}
          >
            <ChevronLeft size={20} color="#3b82f6" />
          </TouchableOpacity>
          
          <View style={styles.dateContainer}>
            <Calendar size={20} color="#3b82f6" />
            <Text style={styles.dateText}>{formatPeriodTitle()}</Text>
            {isToday() && (
              <View style={styles.todayBadge}>
                <Text style={styles.todayText}>Today</Text>
              </View>
            )}
          </View>
          
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigatePeriod('next')}
            disabled={isFutureDate()}
          >
            <ChevronRight 
              size={20} 
              color={isFutureDate() ? '#64748b' : '#3b82f6'} 
            />
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          <QuickStats
            title="Total Hours"
            value={stats.totalHours}
            icon={<Clock size={20} color="#3b82f6" />}
            trend="up"
          />
          
          <QuickStats
            title="Present Days"
            value={stats.presentDays}
            icon={<Calendar size={20} color="#10b981" />}
            trend="up"
          />
          
          <QuickStats
            title="Attendance Rate"
            value={`${stats.attendanceRate}%`}
            icon={<TrendingUp size={20} color="#f59e0b" />}
            trend="up"
          />
          
          <QuickStats
            title="Overtime"
            value={stats.overtime}
            icon={<BarChart3 size={20} color="#ef4444" />}
          />
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>
              {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} Summary
            </Text>
            <TouchableOpacity style={styles.downloadButton}>
              <Download size={16} color="#3b82f6" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.summaryContent}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Working Hours</Text>
              <Text style={styles.summaryValue}>{stats.totalHours}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Days Present</Text>
              <Text style={styles.summaryValue}>{stats.presentDays}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Attendance Rate</Text>
              <Text style={[styles.summaryValue, { color: '#10b981' }]}>
                {stats.attendanceRate}%
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Overtime Hours</Text>
              <Text style={[styles.summaryValue, { color: '#f59e0b' }]}>
                {stats.overtime}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.chartPlaceholder}>
          <BarChart3 size={48} color="#64748b" />
          <Text style={styles.chartPlaceholderText}>
            Attendance Chart
          </Text>
          <Text style={styles.chartPlaceholderSubtext}>
            Visual analytics coming soon
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(100, 116, 139, 0.2)',
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#3b82f6',
  },
  periodButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748b',
  },
  periodButtonTextActive: {
    color: '#ffffff',
  },
  dateNavigator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(100, 116, 139, 0.2)',
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
  },
  todayBadge: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  todayText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  downloadButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryContent: {
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  chartPlaceholder: {
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(100, 116, 139, 0.2)',
  },
  chartPlaceholderText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
    marginTop: 12,
  },
  chartPlaceholderSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    marginTop: 4,
  },
});