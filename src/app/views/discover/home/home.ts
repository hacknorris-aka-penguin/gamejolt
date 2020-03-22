import gql from 'graphql-tag';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Community } from '../../../../_common/community/community.model';
import { Game } from '../../../../_common/game/game.model';
import {
	communityFields,
	featuredItemFields,
	gameFields,
	makeRouteQuery,
	mapQueryPayload,
	mediaItemFields,
	themeFields,
	themePresetFields,
	transcodedMediaItemFields,
	userBlockFields,
	userFields,
} from '../../../../_common/graphql';
import { Meta } from '../../../../_common/meta/meta-service';
import { BaseRouteComponent } from '../../../../_common/route/route-component';
import { FeaturedItem } from '../../../components/featured-item/featured-item.model';
import AppGameGrid from '../../../components/game/grid/grid.vue';
import AppGameGridPlaceholder from '../../../components/game/grid/placeholder/placeholder.vue';
import { AppAuthJoinLazy } from '../../../components/lazy';
import { Store } from '../../../store/index';
import AppDiscoverHomeBanner from './_banner/banner.vue';
import AppDiscoverHomeCommunities from './_communities/communities.vue';
import AppDiscoverHomeTags from './_tags/tags.vue';

@Component({
	name: 'RouteDiscoverHome',
	components: {
		AppDiscoverHomeBanner,
		AppDiscoverHomeTags,
		AppDiscoverHomeCommunities,
		AppGameGrid,
		AppGameGridPlaceholder,
		AppAuthJoin: AppAuthJoinLazy,
	},
	apollo: {
		payload: makeRouteQuery<RouteDiscoverHome>(
			gql`
				${transcodedMediaItemFields}
				${mediaItemFields}
				${themePresetFields}
				${themeFields}
				${userBlockFields}
				${userFields}
				${gameFields}
				${communityFields}
				${featuredItemFields}

				query RouteDiscoverHome {
					communitiesFeatured {
						...communityFields
					}

					latestFeatured: featuredItems(limit: 1) {
						...featuredItemFields
					}

					featuredGameItems: featuredItems(limit: 4, onlyGames: true) {
						id
						# We only need the game from this.
						game {
							...gameFields
						}
					}

					# We only want 21, but need to fetch 4 more in case they
					# include the featured games and we need to get rid of
					# them.
					games(limit: 25, section: GAMES_SECTION_HOME) {
						...gameFields
					}
				}
			`,
			function(data) {
				if (!data) {
					return;
				}

				const payload = mapQueryPayload(data) as {
					communitiesFeatured: any[];
					latestFeatured: any[];
					featuredGameItems: any[];
					games: any[];
				};

				this.featuredCommunities = Community.populate(payload.communitiesFeatured);

				this.featuredItem =
					payload.latestFeatured.length > 0
						? new FeaturedItem(payload.latestFeatured[0])
						: null;

				const featuredGames = payload.featuredGameItems.map(i => new Game(i.game));
				const featuredGameIds = featuredGames.map(i => i.id);

				// If the first featured item is a game, then we want to shift
				// it off the array for featured games since it's showing in the
				// main spot.
				if (this.featuredItem?.game) {
					featuredGames.shift();
				}

				// We show the featured games first and then show the rest.
				this.games = [
					...featuredGames,
					...Game.populate(payload.games).filter(i => !featuredGameIds.includes(i.id)),
				];

				this.isRouteBootstrapped = true;
			}
		),
	},
})
// @RouteResolver({
// 	cache: true,
// 	lazy: true,
// 	deps: {},
// 	resolver: () => Api.sendRequest('/web/discover'),
// })
export default class RouteDiscoverHome extends BaseRouteComponent {
	@State
	app!: Store['app'];

	featuredItem: FeaturedItem | null = null;
	featuredCommunities: Community[] = [];
	games: Game[] = [];

	routeCreated() {
		Meta.setTitle(null);
	}

	// routeResolved($payload: any) {
	// 	Meta.description = $payload.metaDescription;
	// 	Meta.fb = $payload.fb;
	// 	Meta.twitter = $payload.twitter;
	// 	Meta.fb.image = Meta.twitter.image = require('../../../img/social/social-share-header.png');
	// 	Meta.fb.url = Meta.twitter.url = Environment.baseUrl;

	// 	Meta.microdata = {
	// 		'@context': 'http://schema.org',
	// 		'@type': 'WebSite',
	// 		url: 'https://gamejolt.com/',
	// 		name: 'Game Jolt',
	// 		potentialAction: {
	// 			'@type': 'SearchAction',
	// 			target: 'https://gamejolt.com/search?q={search_term_string}',
	// 			'query-input': 'required name=search_term_string',
	// 		},
	// 	};

	// 	// this.featuredItem = $payload.featuredItem ? new FeaturedItem($payload.featuredItem) : null;

	// 	// if ($payload.isFollowingFeatured && this.featuredItem) {
	// 	// 	if (this.featuredItem.game) {
	// 	// 		this.featuredItem.game.is_following = true;
	// 	// 	} else if (this.featuredItem.community) {
	// 	// 		this.featuredItem.community.is_member = true;
	// 	// 	}
	// 	// }

	// 	// this.featuredCommunities = Community.populate($payload.featuredCommunities);
	// 	// this.games = Game.populate($payload.games);
	// }
}
