import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle, XCircle, MapPin, Clock } from 'lucide-react-native';

interface StatusCardProps {
  status: 'checked-in' | 'checked-out';
  lastPunch?: string;
  location?: string;
}

export function StatusCard({ status, lastPunch, location }: StatusCardProps) {
  const isCheckedIn = status === 'checked-in';

  return (
    <View style={[styles.container, isCheckedIn ? styles.checkedIn : styles.checkedOut]}>
      <View style={styles.header}>
        <View style={styles.statusIndicator}>
          {isCheckedIn ? (
            <CheckCircle size={24} color="#10b981" />
          ) : (
            <XCircle size={24} color="#ef4444" />
          )}
        </View>
        <View style={styles.statusContent}>
          <Text style={styles.statusTitle}>
            {isCheckedIn ? 'Checked In' : 'Checked Out'}
          </Text>
          <Text style={styles.statusSubtitle}>
            {isCheckedIn 
              ? 'You are currently at work' 
              : 'You are currently off work'}
          </Text>
        </View>
      </View>

      {lastPunch && (
        <View style={styles.infoRow}>
          <Clock size={16} color="#64748b" />
          <Text style={styles.infoText}>
            Last punch: {lastPunch}
          </Text>
        </View>
      )}

      {location && (
        <View style={styles.infoRow}>
          <MapPin size={16} color="#64748b" />
          <Text style={styles.infoText} numberOfLines={1}>
            {location}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
  },
  checkedIn: {
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  checkedOut: {
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  header: {
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#94a3b8',
    flex: 1,
  },
});