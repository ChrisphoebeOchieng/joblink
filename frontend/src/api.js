const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api'

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('joblink_token')

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    if (response.status === 401 && token) {
      localStorage.removeItem('joblink_token')
      localStorage.removeItem('joblink_user')
    }
    throw new Error(data.error || 'Something went wrong. Please try again.')
  }

  return data
}
