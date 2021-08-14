import { RouteRecordRaw } from 'vue-router';

export const routeSettings: RouteRecordRaw = {
	name: 'settings',
	path: '/settings',
	component: () => import(/* webpackChunkName: "routeSettings" */ './settings.vue'),
	meta: {
		availableOffline: true,
	},
};
