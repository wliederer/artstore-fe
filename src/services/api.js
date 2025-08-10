// API Configuration Service
class ApiService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';
    this.timeout = 30000; // 30 seconds
  }

  // Helper method to make HTTP requests
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      timeout: this.timeout,
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Check if response is ok
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      // Check if response has content
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return await response.text();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // GET request
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, {
      method: 'GET',
    });
  }

  // POST request
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  // Product API methods
  async getProducts() {
    return this.get('/products');
  }

  async getProduct(id) {
    return this.get(`/products/${id}`);
  }

  async getProductsByCategory(category) {
    return this.get(`/products/category/${category}`);
  }

  async searchProducts(query) {
    return this.get('/products/search', { q: query });
  }

  async getCategories() {
    return this.get('/products/categories');
  }

  // Order API methods
  async createOrder(orderData) {
    return this.post('/orders', orderData);
  }

  async getOrder(orderId) {
    return this.get(`/orders/${orderId}`);
  }

  // COMMENTED OUT - Backend endpoint is disabled for security
  // This would expose all orders for an email without authentication
  // async getOrdersByEmail(email) {
  //   return this.get(`/orders/customer/${email}`);
  // }

  // COMMENTED OUT - Backend endpoint is disabled (admin functionality)
  // async updateOrderStatus(id, status) {
  //   return this.put(`/orders/${id}/status`, null, {
  //     headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  //     body: `status=${status}`
  //   });
  // }

  // COMMENTED OUT - Backend endpoint is disabled for security
  // This would allow anyone to cancel any order without authentication
  // async cancelOrder(id) {
  //   return this.put(`/orders/${id}/cancel`);
  // }

  // Payment API methods
  async getStripeConfig() {
    return this.get('/payments/config');
  }

  async createPaymentIntent(paymentData) {
    return this.post('/payments/create-payment-intent', paymentData);
  }

  async createCheckoutSession(sessionData) {
    return this.post('/payments/create-checkout-session', sessionData);
  }

  async confirmPayment(paymentIntentId) {
    return this.post('/payments/confirm-payment', null, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `paymentIntentId=${paymentIntentId}`
    });
  }

  async getPaymentStatus(paymentIntentId) {
    return this.get(`/payments/status/${paymentIntentId}`);
  }

  async getSessionStatus(sessionId) {
    return this.get(`/payments/session/${sessionId}`);
  }

  // Health check
  async healthCheck() {
    try {
      // Try to reach a simple endpoint to verify API is available
      return await this.get('/products');
    } catch (error) {
      throw new Error(`API health check failed: ${error.message}`);
    }
  }

  // Get current configuration
  getConfig() {
    return {
      baseURL: this.baseURL,
      environment: process.env.REACT_APP_ENV || 'development',
      timeout: this.timeout
    };
  }
}

// Create and export a singleton instance
const apiService = new ApiService();

export default apiService;

// Also export the class for testing or multiple instances
export { ApiService };