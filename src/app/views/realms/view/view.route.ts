import { RouteConfig } from 'vue-router';

export const routeRealmsView: RouteConfig = {
	name: 'realms.view',
	path: '/realm/:path',
	component: () => import(/* webpackChunkName: "routeRealmsView" */ './view.vue'),
};
