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
import { Calendar, ChevronLeft, ChevronRight, CheckCircle, XCircle } from 'lucide-react-native';
import { AttendanceService, PunchRecord } from '@/services/AttendanceService';

export default function AttendanceScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendanceRecords, setAttendanceRecords] = useState<PunchRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAttendanceData();
  }, [selectedDate]);

  const loadAttendanceData = async () => {
    try {
      const startDate = new Date(selectedDate);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(selectedDate);
      endDate.setHours(23, 59, 59, 999);

      const records = await AttendanceService.getAttendanceHistory(startDate, endDate);
      setAttendanceRecords(records);
    } catch (error) {
      console.error('Failed to load attendance data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAttendanceData();
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setSelectedDate(newDate);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateTotalHours = (records: PunchRecord[]) => {
    if (records.length === 0) return '0h 0m';

    let totalMinutes = 0;
    let lastCheckIn: Date | null = null;

    const sortedRecords = records.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    for (const record of sortedRecords) {
      if (record.type === 'checked-in') {
        lastCheckIn = new Date(record.timestamp);
      } else if (record.type === 'checked-out' && lastCheckIn) {
        const checkOut = new Date(record.timestamp);
        const diffMinutes = (checkOut.getTime() - lastCheckIn.getTime()) / (1000 * 60);
        totalMinutes += diffMinutes;
        lastCheckIn = null;
      }
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    
    return `${hours}h ${minutes}m`;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <LinearGradient
      colors={['#0f172a', '#1e293b']}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Attendance History</Text>
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
        <View style={styles.dateNavigator}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigateDate('prev')}
          >
            <ChevronLeft size={20} color="#3b82f6" />
          </TouchableOpacity>
          
          <View style={styles.dateContainer}>
            <Calendar size={20} color="#3b82f6" />
            <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
            {isToday(selectedDate) && (
              <View style={styles.todayBadge}>
                <Text style={styles.todayText}>Today</Text>
              </View>
            )}
          </View>
          
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigateDate('next')}
            disabled={isToday(selectedDate)}
          >
            <ChevronRight 
              size={20} 
              color={isToday(selectedDate) ? '#64748b' : '#3b82f6'} 
            />
          </TouchableOpacity>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Daily Summary</Text>
          <View style={styles.summaryContent}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Hours</Text>
              <Text style={styles.summaryValue}>{calculateTotalHours(attendanceRecords)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Punch Records</Text>
              <Text style={styles.summaryValue}>{attendanceRecords.length}</Text>
            </View>
          </View>
        </View>

        <View style={styles.recordsSection}>
          <Text style={styles.sectionTitle}>Punch Records</Text>
          {loading ? (
            <Text style={styles.loadingText}>Loading...</Text>
          ) : attendanceRecords.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No records found for this date</Text>
            </View>
          ) : (
            <View style={styles.recordsList}>
              {attendanceRecords.map((record, index) => (
                <View key={record.id} style={styles.recordItem}>
                  <View style={styles.recordIcon}>
                    {record.type === 'checked-in' ? (
                      <CheckCircle size={20} color="#10b981" />
                    ) : (
                      <XCircle size={20} color="#ef4444" />
                    )}
                  </View>
                  <View style={styles.recordContent}>
                    <Text style={styles.recordTitle}>
                      {record.type === 'checked-in' ? 'Checked In' : 'Checked Out'}
                    </Text>
                    <Text style={styles.recordTime}>
                      {new Date(record.timestamp).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </Text>
                    {record.location.address && (
                      <Text style={styles.recordLocation}>
                        {record.location.address.name || 
                         `${record.location.address.street}, ${record.location.address.city}`}
                      </Text>
                    )}
                  </View>
                  <View style={styles.recordBadge}>
                    <Text style={[
                      styles.recordBadgeText,
                      record.type === 'checked-in' ? styles.checkedInBadge : styles.checkedOutBadge
                    ]}>
                      {record.type === 'checked-in' ? 'IN' : 'OUT'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
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
  summaryCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  summaryTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#3b82f6',
  },
  recordsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    textAlign: 'center',
    paddingVertical: 20,
  },
  emptyState: {
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(100, 116, 139, 0.2)',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    textAlign: 'center',
  },
  recordsList: {
    gap: 12,
  },
  recordItem: {
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(100, 116, 139, 0.2)',
  },
  recordIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recordContent: {
    flex: 1,
  },
  recordTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
  },
  recordTime: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#3b82f6',
    marginTop: 2,
  },
  recordLocation: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    marginTop: 4,
  },
  recordBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recordBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  checkedInBadge: {
    backgroundColor: '#10b981',
  },
  checkedOutBadge: {
    backgroundColor: '#ef4444',
  },
});