import { RouteConfig } from 'vue-router';

export const routeLandingJamsList: RouteConfig = {
	name: 'landing.jams.list',
	path: '/jams',
	props: true,
	component: () => import(/* webpackChunkName: "routeLandingJamsList" */ './list'),
};
