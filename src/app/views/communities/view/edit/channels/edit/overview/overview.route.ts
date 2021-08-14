import { RouteRecordRaw } from 'vue-router';

export const routeCommunitiesViewEditChannelsOverview: RouteRecordRaw = {
	name: 'communities.view.edit.channels.overview',
	path: '',
	component: () =>
		import(/* webpackChunkName: "routeCommunitiesViewEditChannel" */ './overview.vue'),
};
