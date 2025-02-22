import { CreateElement } from 'vue';
import { Component } from 'vue-property-decorator';
import { router } from '..';
import { Api } from '../../../_common/api/api.service';
import { Meta } from '../../../_common/meta/meta-service';
import {
	asyncRouteLoader,
	BaseRouteComponent,
	RouteResolver,
} from '../../../_common/route/route-component';
import { AppState, AppStore } from '../../../_common/store/app-store';
import { IntentService } from '../../components/intent/intent.service';
import { HomeFeedService } from './home-feed.service';

@Component({
	name: 'RouteHome',
	components: {
		RouteHomeFeed: () => asyncRouteLoader(import('./feed.vue'), router),
		RouteDiscoverHome: () => asyncRouteLoader(import('../discover/home/home.vue'), router),
	},
})
@RouteResolver({
	lazy: true,
	deps: { query: IntentService.APPROVED_LOGIN_QUERY_PARAMS },
	resolver: async ({ route }) => {
		const intentRedirect = IntentService.checkApprovedLoginIntent(route);
		if (intentRedirect) {
			return intentRedirect;
		}

		return await Api.sendRequest('/web/touch');
	},
})
export default class RouteHome extends BaseRouteComponent {
	@AppState
	user!: AppStore['user'];

	@AppState
	userBootstrapped!: AppStore['userBootstrapped'];

	routeCreated() {
		Meta.setTitle(null);
	}

	routeResolved() {
		// The route content, but not the path, changes depending on the user
		// state - so we need to track the page view through a analyticsPath
		// meta value that aligns with our route content.
		let analyticsPath = '/discover';
		if (this.user) {
			if (this.$route.params?.tab === HomeFeedService.fypTab) {
				analyticsPath = '/fyp';
			} else if (this.$route.params?.tab === HomeFeedService.activityTab) {
				analyticsPath = '/'; // For clarification purposes that "activity" => "/".
			} else {
				analyticsPath = '/';
			}
		}

		this.$route.meta.analyticsPath = analyticsPath;
	}

	render(h: CreateElement) {
		if (!this.userBootstrapped) {
			return h('div');
		}

		return h(this.user ? 'RouteHomeFeed' : 'RouteDiscoverHome');
	}
}
