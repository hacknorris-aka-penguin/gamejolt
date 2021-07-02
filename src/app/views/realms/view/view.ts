import { Component } from 'vue-property-decorator';
import { Api } from '../../../../_common/api/api.service';
import { Community } from '../../../../_common/community/community.model';
import { EventItem } from '../../../../_common/event-item/event-item.model';
import { BaseRouteComponent, RouteResolver } from '../../../../_common/route/route-component';
import AppPostCard from '../../../components/fireside/post/card/card.vue';
import AppGameCommunityBadge from '../../../components/game/community-badge/community-badge.vue';

@Component({
	name: 'RouteRealmsView',
	components: {
		AppGameCommunityBadge,
		AppPostCard,
	},
})
@RouteResolver({
	resolver: () =>
		Promise.all([
			Api.sendRequest('/web/communities/overview/minecraft/featured?sort=hot&perPage=10'),
			Api.sendRequest('/web/communities/view/minecraft'),
		]),
})
export default class RouteRealmsView extends BaseRouteComponent {
	featuredCommunity: null | Community = null;
	items: EventItem[] = [];

	get routeTitle() {
		return 'Realm';
	}

	routeResolved($payload: any) {
		const [feed, overview] = $payload;
		this.items = EventItem.populate(feed.items);
		this.featuredCommunity = overview.community ? new Community(overview.community) : null;
	}
}
