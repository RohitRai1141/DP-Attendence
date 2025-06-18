import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  Calendar,
  User,
} from 'lucide-react-native';
import * as Location from 'expo-location';
import { AttendanceService } from '@/services/AttendanceService';

export default function PunchScreen() {
  const [currentStatus, setCurrentStatus] = useState<'checked-in' | 'checked-out'>('checked-out');
  const [location, setLocation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayHours, setTodayHours] = useState('0h 0m');

  useEffect(() => {
    loadCurrentStatus();
    getCurrentLocation();
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const loadCurrentStatus = async () => {
    try {
      const status = await AttendanceService.getCurrentStatus();
      setCurrentStatus(status.status);
      setTodayHours(status.todayHours || '0h 0m');
    } catch (error) {
      console.error('Failed to load status:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required for attendance tracking');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      const address = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      setLocation({
        coords: currentLocation.coords,
        address: address[0],
      });
    } catch (error) {
      console.error('Failed to get location:', error);
      Alert.alert('Location Error', 'Unable to get current location');
    }
  };

  const handlePunch = async () => {
    if (loading) return;

    if (!location) {
      Alert.alert('Location Required', 'Please enable location services to punch in/out');
      return;
    }

    setLoading(true);
    try {
      const newStatus = currentStatus === 'checked-in' ? 'checked-out' : 'checked-in';
      
      await AttendanceService.punch({
        type: newStatus,
        location: location,
        timestamp: new Date(),
      });

      setCurrentStatus(newStatus);
      
      const message = newStatus === 'checked-in' 
        ? 'Successfully punched in!' 
        : 'Successfully punched out!';
      
      Alert.alert('Success', message);
      
      // Reload status to get updated hours
      await loadCurrentStatus();
      
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to record punch');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getLocationText = () => {
    if (!location?.address) return 'Getting location...';
    
    const { name, street, city } = location.address;
    return name || `${street}, ${city}`;
  };

  return (
    <LinearGradient
      colors={['#0f172a', '#1e293b']}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Attendance Punch</Text>
        <View style={styles.dateContainer}>
          <Text style={styles.date}>{formatDate(currentTime)}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.clockContainer}>
          <View style={styles.clockBackground}>
            <Clock size={40} color="#3b82f6" />
          </View>
          <Text style={styles.currentTime}>{formatTime(currentTime)}</Text>
        </View>

        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={styles.statusIndicator}>
              {currentStatus === 'checked-in' ? (
                <CheckCircle size={24} color="#10b981" />
              ) : (
                <XCircle size={24} color="#ef4444" />
              )}
            </View>
            <View style={styles.statusContent}>
              <Text style={styles.statusTitle}>
                {currentStatus === 'checked-in' ? 'Checked In' : 'Checked Out'}
              </Text>
              <Text style={styles.statusSubtitle}>
                {currentStatus === 'checked-in' 
                  ? 'You are currently at work' 
                  : 'You are currently off work'}
              </Text>
            </View>
          </View>

          <View style={styles.locationContainer}>
            <MapPin size={16} color="#64748b" />
            <Text style={styles.locationText}>{getLocationText()}</Text>
          </View>

          <View style={styles.hoursContainer}>
            <Calendar size={16} color="#3b82f6" />
            <Text style={styles.hoursText}>Today's Hours: {todayHours}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.punchButton,
            currentStatus === 'checked-in' ? styles.punchOutButton : styles.punchInButton,
            loading && styles.punchButtonDisabled,
          ]}
          onPress={handlePunch}
          disabled={loading}
        >
          <View style={styles.punchButtonIcon}>
            {currentStatus === 'checked-in' ? (
              <XCircle size={24} color="#ffffff" />
            ) : (
              <CheckCircle size={24} color="#ffffff" />
            )}
          </View>
          <Text style={styles.punchButtonText}>
            {loading 
              ? 'Processing...' 
              : currentStatus === 'checked-in' 
                ? 'Punch Out' 
                : 'Punch In'}
          </Text>
        </TouchableOpacity>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Punch Guidelines</Text>
          <View style={styles.infoList}>
            <Text style={styles.infoItem}>• Ensure location services are enabled</Text>
            <Text style={styles.infoItem}>• Punch in at the start of your shift</Text>
            <Text style={styles.infoItem}>• Punch out at the end of your shift</Text>
            <Text style={styles.infoItem}>• Contact HR for any attendance issues</Text>
          </View>
        </View>
      </View>
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
    marginBottom: 8,
  },
  dateContainer: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  date: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#3b82f6',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  clockContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  clockBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  currentTime: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  statusCard: {
    width: '100%',
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(100, 116, 139, 0.2)',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIndicator: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statusContent: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  statusSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    marginTop: 2,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#94a3b8',
    flex: 1,
  },
  hoursContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hoursText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#3b82f6',
  },
  punchButton: {
    width: '100%',
    paddingVertical: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  punchInButton: {
    backgroundColor: '#10b981',
  },
  punchOutButton: {
    backgroundColor: '#ef4444',
  },
  punchButtonDisabled: {
    opacity: 0.6,
  },
  punchButtonIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  punchButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  infoCard: {
    width: '100%',
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(100, 116, 139, 0.2)',
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
    marginBottom: 12,
  },
  infoList: {
    gap: 8,
  },
  infoItem: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#94a3b8',
  },
});