// frontend/src/lib/upload.ts
// Uploads a local image file to the backend and returns the public URL.

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:7000/api';

export async function uploadImage(file: File): Promise<string> {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required to upload images');
  }

  const formData = new FormData();
  formData.append('image', file);

  // NOTE: do NOT set Content-Type manually - the browser sets the
  // multipart boundary automatically when using FormData.
  const response = await fetch(`${API_BASE_URL}/admin/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  if (!response.ok) {
    let message = 'Image upload failed';
    try {
      const errorJson = await response.json();
      message = errorJson.message || message;
    } catch {
      const text = await response.text();
      if (text) message = text;
    }
    throw new Error(message);
  }

  const data = await response.json();
  return data.url;
}
