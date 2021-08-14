import { RouteRecordRaw } from 'vue-router';
import { routeDiscoverCommunities } from './communities/communities.route';
import RouteDiscover from './discover';
import { routeDiscoverGames } from './games/games.route';
import { routeDiscoverHome } from './home/home.route';

export const routeDiscover: RouteRecordRaw = {
	path: '',
	component: RouteDiscover,
	children: [routeDiscoverHome, routeDiscoverGames, routeDiscoverCommunities],
};
