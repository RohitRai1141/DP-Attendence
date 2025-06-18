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
import { Clock, MapPin, CircleCheck as CheckCircle, Circle as XCircle, Calendar, User } from 'lucide-react-native';
import * as Location from 'expo-location';
import { AttendanceService } from '@/services/AttendanceService';

export default function HomeScreen() {
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
      if (Platform.OS === 'web') {
        // Web fallback - use browser geolocation
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setLocation({
                coords: {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                },
                address: {
                  name: 'Current Location',
                  street: 'Web Location',
                  city: 'Browser',
                },
              });
            },
            (error) => {
              console.error('Web geolocation error:', error);
              setLocation({
                coords: { latitude: 0, longitude: 0 },
                address: { name: 'Default Location', street: 'Office', city: 'Dubai' },
              });
            }
          );
        } else {
          setLocation({
            coords: { latitude: 0, longitude: 0 },
            address: { name: 'Default Location', street: 'Office', city: 'Dubai' },
          });
        }
      } else {
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
      }
    } catch (error) {
      console.error('Failed to get location:', error);
      setLocation({
        coords: { latitude: 0, longitude: 0 },
        address: { name: 'Default Location', street: 'Office', city: 'Dubai' },
      });
    }
  };

  const handlePunch = async (type: 'punch-in' | 'punch-out') => {
    if (loading) return;

    if (!location) {
      Alert.alert('Location Required', 'Please enable location services to punch in/out');
      return;
    }

    setLoading(true);
    try {
      const newStatus = type === 'punch-in' ? 'checked-in' : 'checked-out';
      
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
      colors={['#2c3e50', '#34495e', '#3d566e']}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Good morning</Text>
        <Text style={styles.userName}>John Doe</Text>
        <View style={styles.timeContainer}>
          <Text style={styles.currentTime}>{formatTime(currentTime)}</Text>
          <Text style={styles.currentDate}>{formatDate(currentTime)}</Text>
        </View>
      </View>

      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <View style={styles.statusIndicator}>
            {currentStatus === 'checked-in' ? (
              <CheckCircle size={24} color="#27ae60" />
            ) : (
              <XCircle size={24} color="#e74c3c" />
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

        <View style={styles.infoRow}>
          <MapPin size={16} color="#7f8c8d" />
          <Text style={styles.infoText}>{getLocationText()}</Text>
        </View>

        <View style={styles.infoRow}>
          <Calendar size={16} color="#3498db" />
          <Text style={styles.infoText}>Today's Hours: {todayHours}</Text>
        </View>
      </View>

      <View style={styles.punchButtonsContainer}>
        <TouchableOpacity
          style={[styles.punchButton, styles.punchInButton]}
          onPress={() => handlePunch('punch-in')}
          disabled={loading || currentStatus === 'checked-in'}
        >
          <CheckCircle size={24} color="#ffffff" />
          <Text style={styles.punchButtonText}>
            {loading && currentStatus === 'checked-out' ? 'Punching In...' : 'Punch In'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.punchButton, styles.punchOutButton]}
          onPress={() => handlePunch('punch-out')}
          disabled={loading || currentStatus === 'checked-out'}
        >
          <XCircle size={24} color="#ffffff" />
          <Text style={styles.punchButtonText}>
            {loading && currentStatus === 'checked-in' ? 'Punching Out...' : 'Punch Out'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.quickStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>8h 30m</Text>
          <Text style={styles.statLabel}>Today</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>42h 15m</Text>
          <Text style={styles.statLabel}>This Week</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>100%</Text>
          <Text style={styles.statLabel}>Attendance</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  greeting: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#bdc3c7',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginBottom: 20,
  },
  timeContainer: {
    alignItems: 'center',
  },
  currentTime: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  currentDate: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#95a5a6',
    marginTop: 4,
  },
  statusCard: {
    backgroundColor: 'rgba(52, 73, 94, 0.8)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(149, 165, 166, 0.2)',
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
    backgroundColor: 'rgba(52, 152, 219, 0.2)',
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
    color: '#95a5a6',
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#bdc3c7',
    flex: 1,
  },
  punchButtonsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 30,
  },
  punchButton: {
    flex: 1,
    paddingVertical: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  punchInButton: {
    backgroundColor: '#3498db',
  },
  punchOutButton: {
    backgroundColor: '#3498db',
  },
  punchButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(52, 73, 94, 0.6)',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(149, 165, 166, 0.2)',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#3498db',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#95a5a6',
  },
});