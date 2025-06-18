import * as SecureStore from 'expo-secure-store';
import { AuthService } from './AuthService';
import { ApiService } from './ApiService';

export interface PunchRecord {
  id: string;
  type: 'checked-in' | 'checked-out';
  timestamp: Date;
  location: {
    coords: {
      latitude: number;
      longitude: number;
    };
    address: any;
  };
  userId: string;
}

export interface AttendanceStatus {
  status: 'checked-in' | 'checked-out';
  lastPunch?: string;
  location?: string;
  todayHours?: string;
  recentActivity?: Array<{
    type: string;
    title: string;
    time: string;
    location: string;
  }>;
}

export class AttendanceService {
  static async punch(punchData: Omit<PunchRecord, 'id' | 'userId'>): Promise<void> {
    const user = await AuthService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      if (punchData.type === 'checked-in') {
        await ApiService.punchIn(user.id, punchData.location);
      } else {
        await ApiService.punchOut(user.id, punchData.location);
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to record punch');
    }
  }

  static async getCurrentStatus(): Promise<AttendanceStatus> {
    const user = await AuthService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      return await ApiService.getCurrentStatus(user.id);
    } catch (error) {
      console.error('Failed to get current status:', error);

      // Return default status on error
      return {
        status: 'checked-out',
        recentActivity: [],
        todayHours: '0h 0m'
      };
    }
  }

  static async getTodayStats(): Promise<any> {
    const user = await AuthService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const todayHours = await ApiService.calculateTodayHours(user.id);

      return {
        totalHours: todayHours,
        trend: 'up',
      };
    } catch (error) {
      console.error('Failed to get today stats:', error);
      return {
        totalHours: '0h 0m',
        trend: null,
      };
    }
  }

  static async getWeekStats(): Promise<any> {
    const user = await AuthService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const today = new Date();
      const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
      const weekStartStr = weekStart.toISOString().split('T')[0];

      const weeklyReport = await ApiService.getWeeklyReport(user.id, weekStartStr);

      if (weeklyReport) {
        return {
          totalHours: weeklyReport.totalHours,
          presentDays: `${weeklyReport.daysPresent}/5`,
          attendanceRate: weeklyReport.attendanceRate,
          trend: 'up',
        };
      }

      // Fallback calculation
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      const records = await ApiService.getAttendanceHistory(
        user.id,
        weekStart.toISOString(),
        weekEnd.toISOString()
      );

      const daysWorked = new Set(
        records.map(r => new Date(r.timestamp).toDateString())
      ).size;

      return {
        totalHours: '42h 30m', // Mock data
        presentDays: `${daysWorked}/5`,
        attendanceRate: Math.round((daysWorked / 5) * 100),
        trend: 'up',
      };
    } catch (error) {
      console.error('Failed to get week stats:', error);
      return {
        totalHours: '0h 0m',
        presentDays: '0/5',
        attendanceRate: 0,
        trend: null,
      };
    }
  }

  static async getAttendanceHistory(startDate?: Date, endDate?: Date): Promise<PunchRecord[]> {
    const user = await AuthService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const startDateStr = startDate?.toISOString();
      const endDateStr = endDate?.toISOString();

      const records = await ApiService.getAttendanceHistory(user.id, startDateStr, endDateStr);

      return records.map(record => ({
        ...record,
        timestamp: new Date(record.timestamp)
      }));
    } catch (error) {
      console.error('Failed to get attendance history:', error);
      return [];
    }
  }

  private static formatLocation(address: any): string {
    if (!address) return 'Unknown Location';

    const { name, street, city } = address;
    return name || `${street || ''}, ${city || ''}`.trim();
  }
}
