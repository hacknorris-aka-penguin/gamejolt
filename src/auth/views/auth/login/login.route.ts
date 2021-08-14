import { RouteRecordRaw } from 'vue-router';

export const routeAuthLogin: RouteRecordRaw = {
	name: 'auth.login',
	path: '/login',
	component: () => import(/* webpackChunkName: "routeAuthLogin" */ './login.vue'),
};
