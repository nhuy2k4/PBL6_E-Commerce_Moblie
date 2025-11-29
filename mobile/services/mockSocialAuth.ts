/**
 * Mock Social Auth Service - For Testing Without OAuth Setup
 * 
 * This is a mock implementation that simulates OAuth flow
 * for testing purposes without requiring actual Google/Facebook credentials.
 * 
 * IMPORTANT: This is for development/testing only!
 * Replace with real OAuth implementation for production.
 */

export interface MockAuthResult {
  idToken?: string;
  accessToken?: string;
  email: string;
  name: string;
}

/**
 * Mock Google Sign-In
 * Simulates Google OAuth flow for testing
 */
export const mockGoogleSignIn = async (): Promise<MockAuthResult> => {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      // Generate mock ID token (this is just for demo - not a real JWT)
      const mockIdToken = 'mock_google_id_token_' + Date.now();
      
      resolve({
        idToken: mockIdToken,
        email: 'test.google@example.com',
        name: 'Google Test User',
      });
    }, 1000);
  });
};

/**
 * Mock Facebook Login
 * Simulates Facebook OAuth flow for testing
 */
export const mockFacebookLogin = async (): Promise<MockAuthResult> => {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      // Generate mock access token
      const mockAccessToken = 'mock_facebook_access_token_' + Date.now();
      
      resolve({
        accessToken: mockAccessToken,
        email: 'test.facebook@example.com',
        name: 'Facebook Test User',
      });
    }, 1000);
  });
};

/**
 * Check if we should use mock mode
 * Returns true if OAuth credentials are not configured
 */
export const shouldUseMockMode = (): boolean => {
  // Always return true for now - change this when real credentials are added
  return true;
};
