export * from './auth';
export * from './org';
export * from './events';
export * from './bookings';
export * from './categories';
export * from './social';

import { authAPI } from './auth';
import { organizationAPI } from './org';
import { eventsAPI } from './events';
import { bookingsAPI } from './bookings';
import { categoriesAPI } from './categories';
import { socialAPI } from './social';

const api = {
	auth: authAPI,
	organization: organizationAPI,
	events: eventsAPI,
	bookings: bookingsAPI,
	categories: categoriesAPI,
	social: socialAPI
};

export default api;
