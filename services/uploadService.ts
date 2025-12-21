import { buildUrl, fetchWithAuth } from '../utils/api';
import { API_ENDPOINTS } from '../constants/config';

// Upload file as multipart/form-data and return uploaded file URL or id
export async function uploadFile(formData: FormData) {
  const url = buildUrl(API_ENDPOINTS.FILE.UPLOAD);
  // fetchWithAuth will attach Authorization header
  const response = await fetchWithAuth(url, {
    method: 'POST',
    body: formData,
    // Do not set Content-Type; browser/runtime will set multipart boundary
  });
  if (!response.ok) {
    const txt = await response.text().catch(() => '');
    throw new Error(txt || `Upload failed: ${response.status}`);
  }
  const data = await response.json();
  return data.data;
}
