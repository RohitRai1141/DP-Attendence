const API_BASE_URL = 'http://localhost:3001';

export class ApiService {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  static async login(credentials: {
    companyCode: string;
    username: string;
    password: string;
  }) {
    const users = await this.request<any[]>('/users');
    const user = users.find(
      u => u.username === credentials.username &&
        u.password === credentials.password &&
        u.companyCode === credentials.companyCode
    );

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Create session
    const session = {
      id: Date.now().toString(),
      userId: user.id,
      token: `token_${Date.now()}`,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      isActive: true
    };

    await this.request('/sessions', {
      method: 'POST',
      body: JSON.stringify(session)
    });

    return { user, token: session.token };
  }

  static async loginWithQuickPin(pin: string, companyCode: string = 'DPWORLD') {
    const users = await this.request<any[]>('/users');
    const user = users.find(
      u => u.quickPin === pin && u.companyCode === companyCode
    );

    if (!user) {
      throw new Error('Invalid PIN');
    }

    // Create session
    const session = {
      id: Date.now().toString(),
      userId: user.id,
      token: `token_${Date.now()}`,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      isActive: true
    };

    await this.request('/sessions', {
      method: 'POST',
      body: JSON.stringify(session)
    });

    return { user, token: session.token };
  }

  static async setupQuickPin(userId: string, pin: string) {
    return this.request(`/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quickPin: pin })
    });
  }

  // Attendance endpoints
  static async punchIn(userId: string, location: any) {
    const punchRecord = {
      id: Date.now().toString(),
      userId,
      type: 'checked-in',
      timestamp: new Date().toISOString(),
      location
    };

    return this.request('/attendance', {
      method: 'POST',
      body: JSON.stringify(punchRecord)
    });
  }

  static async punchOut(userId: string, location: any) {
    const punchRecord = {
      id: Date.now().toString(),
      userId,
      type: 'checked-out',
      timestamp: new Date().toISOString(),
      location
    };

    return this.request('/attendance', {
      method: 'POST',
      body: JSON.stringify(punchRecord)
    });
  }

  static async getAttendanceHistory(userId: string, startDate?: string, endDate?: string) {
    let url = `/attendance?userId=${userId}`;

    if (startDate) {
      url += `&timestamp_gte=${startDate}`;
    }

    if (endDate) {
      url += `&timestamp_lte=${endDate}`;
    }

    url += '&_sort=timestamp&_order=desc';

    return this.request<any[]>(url);
  }

  static async getCurrentStatus(userId: string) {
    const records = await this.getAttendanceHistory(userId);

    if (records.length === 0) {
      return {
        status: 'checked-out',
        lastPunch: null,
        todayHours: '0h 0m'
      };
    }

    const latestRecord = records[0];
    const todayHours = await this.calculateTodayHours(userId);

    return {
      status: latestRecord.type,
      lastPunch: new Date(latestRecord.timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
      location: this.formatLocation(latestRecord.location.address),
      todayHours,
      recentActivity: records.slice(0, 5).map(record => ({
        type: record.type,
        title: record.type === 'checked-in' ? 'Checked In' : 'Checked Out',
        time: new Date(record.timestamp).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
        location: this.formatLocation(record.location.address)
      }))
    };
  }

  static async calculateTodayHours(userId: string): Promise<string> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    const records = await this.getAttendanceHistory(
      userId,
      startOfDay.toISOString(),
      endOfDay.toISOString()
    );

    if (records.length === 0) {
      return '0h 0m';
    }

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

    // If still checked in, add time until now
    if (lastCheckIn) {
      const now = new Date();
      const diffMinutes = (now.getTime() - lastCheckIn.getTime()) / (1000 * 60);
      totalMinutes += diffMinutes;
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);

    return `${hours}h ${minutes}m`;
  }

  // User endpoints
  static async getUser(userId: string) {
    return this.request<any>(`/users/${userId}`);
  }

  static async updateUser(userId: string, updates: any) {
    return this.request(`/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  }

  // Company endpoints
  static async getCompany(companyCode: string) {
    const companies = await this.request<any[]>('/companies');
    return companies.find(c => c.code === companyCode);
  }

  // Reports endpoints
  static async getDailyReport(userId: string, date: string) {
    const reports = await this.request<any[]>(`/reports?userId=${userId}&type=daily&date=${date}`);
    return reports[0] || null;
  }

  static async getWeeklyReport(userId: string, weekStart: string) {
    const reports = await this.request<any[]>(`/reports?userId=${userId}&type=weekly&weekStart=${weekStart}`);
    return reports[0] || null;
  }

  private static formatLocation(address: any): string {
    if (!address) return 'Unknown Location';

    const { name, street, city } = address;
    return name || `${street || ''}, ${city || ''}`.trim();
  }
}
