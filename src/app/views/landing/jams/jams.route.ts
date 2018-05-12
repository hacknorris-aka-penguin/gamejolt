import { RouteConfig } from 'vue-router';
import { routeLandingJamsAbout } from './about/about.route';
import { routeLandingJamsList } from './list/list.route';

export const routeLandingJams: RouteConfig = {
	path: '/jams',
	props: true,
	component: () => import(/* webpackChunkName: "routeLandingJams" */ './jams'),
	children: [routeLandingJamsList, routeLandingJamsAbout],
};
