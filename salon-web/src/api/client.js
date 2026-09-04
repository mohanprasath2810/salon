// This is the ONE place in the whole app that knows how to talk to
// the backend. Every page/component calls functions from here instead
// of writing fetch() calls everywhere — so if the API URL or auth
// header logic ever changes, we only update it in one place.

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('token');
}

// Generic request helper. Every specific function below (login, getSalons,
// etc.) calls this instead of duplicating fetch/error-handling logic.
async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };

  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // Throw so callers can catch it in a try/catch and show data.error
    throw new Error(data.error || 'Something went wrong. Please try again.');
  }

  return data;
}

// --- Auth ---
export const login = (email, password) => request('/auth/login', { method: 'POST', body: { email, password } });
export const register = (payload) => request('/auth/register', { method: 'POST', body: payload });
export const getMe = () => request('/auth/me', { auth: true });

// --- Salons ---
export const getSalons = (search) => request(`/salons${search ? `?search=${encodeURIComponent(search)}` : ''}`);
export const getSalon = (id) => request(`/salons/${id}`);

// --- Services & Staff ---
export const getServices = (salonId) => request(`/salons/${salonId}/services`);
export const getStaff = (salonId, serviceId) =>
  request(`/salons/${salonId}/staff${serviceId ? `?serviceId=${serviceId}` : ''}`);

// --- Availability ---
export const getAvailability = (staffId, date, serviceId) =>
  request(`/staff/${staffId}/availability?date=${date}&serviceId=${serviceId}`);

// --- Appointments ---
export const bookAppointment = (payload) => request('/appointments', { method: 'POST', body: payload, auth: true });
export const getMyAppointments = () => request('/appointments/me', { auth: true });
export const cancelAppointment = (id) => request(`/appointments/${id}/cancel`, { method: 'PATCH', auth: true });

// --- Admin (requires ADMIN role) ---
export const adminGetStats       = ()      => request('/admin/stats',                           { auth: true });
export const adminGetUsers       = (role)  => request(`/admin/users${role ? `?role=${role}` : ''}`, { auth: true });
export const adminGetSalons      = ()      => request('/admin/salons',                          { auth: true });
export const adminToggleSalon    = (id)    => request(`/admin/salons/${id}/toggle-active`,      { method: 'PATCH', auth: true });
export const adminGetCategories  = ()      => request('/admin/categories',                      { auth: true });
export const adminCreateCategory = (name)  => request('/admin/categories',                      { method: 'POST', body: { name }, auth: true });

// --- Salon Owner ---
export const getMySalons      = ()           => request('/salons/mine',                    { auth: true });
export const createSalon      = (payload)    => request('/salons',                         { method: 'POST', body: payload, auth: true });
export const updateSalon      = (id, data)   => request(`/salons/${id}`,                   { method: 'PUT',  body: data,    auth: true });
export const ownerGetServices = (salonId)    => request(`/salons/${salonId}/services`);
export const createService    = (salonId, d) => request(`/salons/${salonId}/services`,     { method: 'POST', body: d,       auth: true });
export const updateService    = (id, data)   => request(`/services/${id}`,                 { method: 'PUT',  body: data,    auth: true });
export const deleteService    = (id)         => request(`/services/${id}`,                 { method: 'DELETE',              auth: true });
export const ownerGetStaff    = (salonId)    => request(`/salons/${salonId}/staff`);
export const createStaff      = (salonId, d) => request(`/salons/${salonId}/staff`,        { method: 'POST', body: d,       auth: true });
export const getCategories    = ()           => request('/admin/categories',                { auth: true });
export const getSalonAppointments = (salonId, date, status) => {
  const params = new URLSearchParams();
  if (date)   params.set('date', date);
  if (status) params.set('status', status);
  const qs = params.toString();
  return request(`/salons/${salonId}/appointments${qs ? `?${qs}` : ''}`, { auth: true });
};
