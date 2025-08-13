import { api } from "@/lib/api";
import { API_ROUTES } from "@/lib/routes";
import {
  ApiResponse,
  LoginDto,
  AuthResponse,
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  User,
} from "@/types/api";

export class AuthService {
  /**
   * Login user with email and password
   */
  static async login(loginDto: LoginDto): Promise<AuthResponse> {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>(
        API_ROUTES.auth.login,
        loginDto,
      );
      console.log("response", response.data);
      console.log("response.data.data", response.data.data);
      return response.data.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(): Promise<User> {
    try {
      const response = await api.get<ApiResponse<User>>(
        API_ROUTES.auth.profile,
      );
      return response.data.data;
    } catch (error) {
      console.error("Get profile error:", error);
      throw error;
    }
  }

  /**
   * Change current user password
   */
  static async changePassword(
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    try {
      await api.put<ApiResponse<{ message: string }>>(
        API_ROUTES.users.changePassword,
        changePasswordDto,
      );
    } catch (error) {
      console.error("Change password error:", error);
      throw error;
    }
  }

  /**
   * Send forgot password email
   */
  static async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<void> {
    try {
      await api.post<ApiResponse<{ message: string }>>(
        API_ROUTES.auth.forgotPassword,
        forgotPasswordDto,
      );
    } catch (error) {
      console.error("Forgot password error:", error);
      throw error;
    }
  }

  /**
   * Reset password with token
   */
  static async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<void> {
    try {
      await api.post<ApiResponse<{ message: string }>>(
        API_ROUTES.auth.resetPassword,
        resetPasswordDto,
      );
    } catch (error) {
      console.error("Reset password error:", error);
      throw error;
    }
  }

  /**
   * Logout user (clear token)
   */
  static async logout(): Promise<void> {
    try {
      // Just remove the token locally since backend doesn't have logout endpoint
      localStorage.removeItem("jwt_token");
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  }

  /**
   * Get JWT token from localStorage
   */
  static getToken(): string | null {
    return localStorage.getItem("jwt_token");
  }

  /**
   * Set JWT token to localStorage
   */
  static setToken(token: string): void {
    localStorage.setItem("jwt_token", token);
  }

  /**
   * Remove JWT token from localStorage
   */
  static removeToken(): void {
    localStorage.removeItem("jwt_token");
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = AuthService;
