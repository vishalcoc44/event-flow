// This file is now a facade for the modularized API layer
// It re-exports everything to maintain backward compatibility

export * from './api/index';
import api from './api/index';
export default api;

// Direct exports for common patterns
export { authAPI } from './api/auth';
export { organizationAPI } from './api/org';
export { eventsAPI } from './api/events';
export { bookingsAPI } from './api/bookings';
export { categoriesAPI } from './api/categories';
export { socialAPI } from './api/social';