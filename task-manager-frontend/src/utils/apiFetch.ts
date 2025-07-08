export async function apiFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
  const response = await fetch(input, init);
  if (response.status === 401) {
    localStorage.removeItem('access_token');
    window.location.href = '/login';
  }
  return response;
} 