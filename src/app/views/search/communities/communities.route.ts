import { RouteRecordRaw } from 'vue-router';

export const routeSearchCommunities: RouteRecordRaw = {
	name: 'search.communities',
	path: 'communities',
	component: () => import(/* webpackChunkName: "routeSearch" */ './communities.vue'),
};
