// API service for backend communication
const API_BASE_URL = 'http://localhost:3001';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
}

export interface FreeDataResponse {
  message: string;
  timestamp: string;
}

export interface PremiumDataResponse {
  message: string;
  timestamp: string;
  premiumContent: {
    analytics: string;
    insights: string;
    features: string;
  };
}

export interface PaymentRequiredResponse {
  error: string;
  paymentUrl?: string;
  price?: string;
  currency?: string;
  description?: string;
}

class ApiService {
  private async makeRequest<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.status === 402) {
        // Payment Required - x402 response
        return {
          success: false,
          error: 'Payment Required',
          status: 402,
          data: data as T,
        };
      }

      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP ${response.status}`,
          status: response.status,
        };
      }

      return {
        success: true,
        data: data as T,
        status: response.status,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
    }
  }

  async getFreeData(): Promise<ApiResponse<FreeDataResponse>> {
    return this.makeRequest<FreeDataResponse>('/free-api/data');
  }

  async getPremiumData(): Promise<ApiResponse<PremiumDataResponse | PaymentRequiredResponse>> {
    return this.makeRequest<PremiumDataResponse | PaymentRequiredResponse>('/premium-api/data');
  }

  async getHealthCheck(): Promise<ApiResponse<{ status: string; server: string; timestamp: string }>> {
    return this.makeRequest('/health');
  }
}

export const apiService = new ApiService();
