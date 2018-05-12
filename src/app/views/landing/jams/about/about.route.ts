import { RouteConfig } from 'vue-router';

export const routeLandingJamsAbout: RouteConfig = {
	name: 'landing.jams.about',
	path: 'about',
	props: true,
	component: () => import(/* webpackChunkName: "routeLandingJamsAbout" */ './about'),
};
