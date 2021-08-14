import { RouteRecordRaw } from 'vue-router';
import RouteHome from './home';

export const routeHome: RouteRecordRaw = {
	name: 'home',
	path: '/:tab(fyp|activity)?',
	// Don't async load this since it's a small route that passes on to other
	// components.
	component: RouteHome,
};
