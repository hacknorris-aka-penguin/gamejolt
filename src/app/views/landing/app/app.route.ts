import { RouteRecordRaw } from 'vue-router';

export const routeLandingApp: RouteRecordRaw = {
	name: 'landing.app',
	path: '/app',
	component: () => import(/* webpackChunkName: "routeLandingApp" */ './app.vue'),
};
