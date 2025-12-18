/**
 * Cloudinary Upload Service via Backend
 * Backend handles upload with api-key/api-secret (more secure)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../constants/config';

export const CLOUDINARY_CLOUD_NAME = 'dejjhkhl1';

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  [key: string]: any;
}

/**
 * Upload image via backend endpoint
 * Backend: POST /api/images/upload
 * @param uri - Local file URI
 * @param folder - Optional folder in Cloudinary (default: "seller-registration")
 * @returns Cloudinary response with secure_url and public_id
 */
export const uploadToCloudinary = async (
  uri: string,
  folder: string = 'seller-registration'
): Promise<CloudinaryUploadResult> => {
  try {
    console.log('📤 Uploading via backend:', uri, 'folder:', folder);

    // Create FormData with file
    const formData = new FormData();
    
    // Extract file info from URI
    const filename = uri.split('/').pop() || 'upload.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    // Append file (backend expects "file" param)
    formData.append('file', {
      uri,
      type,
      name: filename,
    } as any);
    
    // Append folder (backend expects "folder" param)
    formData.append('folder', folder);

    // Get token
    const token = await AsyncStorage.getItem('access_token');

    // Upload via backend: POST /api/images/upload
    const response = await fetch(
      `${API_CONFIG.BASE_URL}images/upload`,
      {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
          // Don't set Content-Type, let fetch set it with boundary
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Backend upload error:', response.status, errorText);
      throw new Error(`Upload failed: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Backend response:', result);
    
    // Backend returns: ResponseDTO<ImageUploadResponse>
    // Structure: { status, error, message, data: { url, publicId, transformations, width, height } }
    const imageData = result.data;
    
    if (!imageData || !imageData.url) {
      throw new Error('Invalid response from backend');
    }
    
    console.log('✅ Uploaded successfully:', imageData.url);
    
    return {
      secure_url: imageData.url,
      public_id: imageData.publicId || '',
      transformations: imageData.transformations || {},
      width: imageData.width,
      height: imageData.height,
    };
  } catch (error) {
    console.error('❌ Upload error:', error);
    throw error;
  }
};

/**
 * Upload multiple images to Cloudinary
 */
export const uploadMultipleToCloudinary = async (
  files: Array<{ uri: string; folder?: string }>,
  onProgress?: (index: number, total: number) => void
): Promise<CloudinaryUploadResult[]> => {
  const results: CloudinaryUploadResult[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const { uri, folder } = files[i];
    if (onProgress) onProgress(i + 1, files.length);
    
    const result = await uploadToCloudinary(uri, folder);
    results.push(result);
  }
  
  return results;
};

export default {
  uploadToCloudinary,
  uploadMultipleToCloudinary,
};
