import * as SecureStore from 'expo-secure-store';
import { ApiService } from './ApiService';

export interface LoginCredentials {
  companyCode: string;
  username: string;
  password: string;
}

export interface UserData {
  id: string;
  username: string;
  companyCode: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
}

export class AuthService {
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly USER_KEY = 'user_data';
  private static readonly QUICK_PIN_KEY = 'quick_pin';

  static async login(credentials: LoginCredentials): Promise<UserData> {
    try {
      const { user, token } = await ApiService.login(credentials);

      await SecureStore.setItemAsync(this.TOKEN_KEY, token);
      await SecureStore.setItemAsync(this.USER_KEY, JSON.stringify(user));

      return user;
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  }

  static async loginWithQuickPin(pin: string): Promise<UserData> {
    try {
      const { user, token } = await ApiService.loginWithQuickPin(pin);

      await SecureStore.setItemAsync(this.TOKEN_KEY, token);
      await SecureStore.setItemAsync(this.USER_KEY, JSON.stringify(user));
      await SecureStore.setItemAsync(this.QUICK_PIN_KEY, pin);

      return user;
    } catch (error: any) {
      throw new Error(error.message || 'Invalid PIN');
    }
  }

  static async setupQuickPin(pin: string): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) {
      throw new Error('Please login first to set up Quick PIN');
    }

    try {
      await ApiService.setupQuickPin(user.id, pin);
      await SecureStore.setItemAsync(this.QUICK_PIN_KEY, pin);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to set up PIN');
    }
  }

  static async isAuthenticated(): Promise<boolean> {
    try {
      const token = await SecureStore.getItemAsync(this.TOKEN_KEY);
      return !!token;
    } catch {
      return false;
    }
  }

  static async getCurrentUser(): Promise<UserData | null> {
    try {
      const userDataString = await SecureStore.getItemAsync(this.USER_KEY);
      return userDataString ? JSON.parse(userDataString) : null;
    } catch {
      return null;
    }
  }

  static async logout(): Promise<void> {
    await SecureStore.deleteItemAsync(this.TOKEN_KEY);
    await SecureStore.deleteItemAsync(this.USER_KEY);
    // Note: We don't delete the quick PIN to allow re-login
  }

  static async hasQuickPin(): Promise<boolean> {
    try {
      const pin = await SecureStore.getItemAsync(this.QUICK_PIN_KEY);
      return !!pin;
    } catch {
      return false;
    }
  }

  static async removeQuickPin(): Promise<void> {
    await SecureStore.deleteItemAsync(this.QUICK_PIN_KEY);
  }

  static async getAuthToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(this.TOKEN_KEY);
    } catch {
      return null;
    }
  }
}
