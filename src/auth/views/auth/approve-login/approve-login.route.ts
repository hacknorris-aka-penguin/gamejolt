import { RouteConfig } from 'vue-router';

export const routeAuthApproveLogin: RouteConfig = {
	name: 'auth.approve-login',
	path: '/login/approve',
	component: () => import(/* webpackChunkName: "routeAuthApproveLogin" */ './approve-login.vue'),
	meta: {
		hideCoverImage: true,
	},
};
