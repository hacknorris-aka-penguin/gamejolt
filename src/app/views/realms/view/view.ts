import { Component } from 'vue-property-decorator';
import { Api } from '../../../../_common/api/api.service';
import AppCommunityCard from '../../../../_common/community/card/card.vue';
import { Community } from '../../../../_common/community/community.model';
import { EventItem } from '../../../../_common/event-item/event-item.model';
import { BaseRouteComponent, RouteResolver } from '../../../../_common/route/route-component';
import AppPostCard from '../../../components/fireside/post/card/card.vue';

@Component({
	name: 'RouteRealmsView',
	components: {
		AppPostCard,
		AppCommunityCard,
	},
})
@RouteResolver({
	resolver: () =>
		Promise.all([
			Api.sendRequest('/web/communities/overview/minecraft/featured?sort=hot&perPage=10'),
			Api.sendRequest('/web/communities/view/minecraft'),
			Api.sendRequest('/web/discover'),
		]),
})
export default class RouteRealmsView extends BaseRouteComponent {
	featuredCommunity: null | Community = null;
	communities: Community[] = [];
	items: EventItem[] = [];

	get routeTitle() {
		return 'Realm';
	}

	routeResolved($payload: any) {
		const [feed, overview, home] = $payload;
		this.items = EventItem.populate(feed.items);
		this.communities = Community.populate(home.communities);
		this.featuredCommunity = overview.community ? new Community(overview.community) : null;
	}
}
