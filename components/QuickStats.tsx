import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TrendingUp, TrendingDown } from 'lucide-react-native';

interface QuickStatsProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | null;
  onPress?: () => void;
}

export function QuickStats({ title, value, icon, trend, onPress }: QuickStatsProps) {
  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      style={styles.container}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          {icon}
        </View>
        {trend && (
          <View style={styles.trendContainer}>
            {trend === 'up' ? (
              <TrendingUp size={16} color="#10b981" />
            ) : (
              <TrendingDown size={16} color="#ef4444" />
            )}
          </View>
        )}
      </View>
      
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.title}>{title}</Text>
    </Component>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(100, 116, 139, 0.2)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  value: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  title: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#64748b',
  },
});