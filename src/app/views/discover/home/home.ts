import { gql } from 'apollo-boost';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Api } from '../../../../_common/api/api.service';
import { Community } from '../../../../_common/community/community.model';
import { Environment } from '../../../../_common/environment/environment.service';
import { Game } from '../../../../_common/game/game.model';
import { Meta } from '../../../../_common/meta/meta-service';
import { BaseRouteComponent, RouteResolver } from '../../../../_common/route/route-component';
import { FeaturedItem } from '../../../components/featured-item/featured-item.model';
import AppGameGrid from '../../../components/game/grid/grid.vue';
import AppGameGridPlaceholder from '../../../components/game/grid/placeholder/placeholder.vue';
import { AppAuthJoinLazy } from '../../../components/lazy';
import { Store } from '../../../store/index';
import AppDiscoverHomeBanner from './_banner/banner.vue';
import AppDiscoverHomeCommunities from './_communities/communities.vue';
import AppDiscoverHomeTags from './_tags/tags.vue';

function isObject(val: any): boolean {
	return typeof val === 'object' && val !== null;
}

function snakeCase(str: string) {
	return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
}

function mapArray(items: any[]): any[] {
	return items.map(i => mapValue(i));
}

function mapKeys(obj: object) {
	const ret: any = {};
	for (const [key, val] of Object.entries(obj)) {
		const snakeKey = snakeCase(key);
		ret[snakeKey] = mapValue(val);
	}
	return ret;
}

function mapValue(val: any) {
	if (Array.isArray(val)) {
		return mapArray(val);
	} else if (isObject(val)) {
		return mapKeys(val);
	}
	return val;
}

function mapPayload(payload: { [k: string]: any }) {
	const ret: { [k: string]: any } = {};
	for (const k in payload) {
		ret[k] = mapValue(payload[k]);
	}
	return ret;
}

const mediaItemFields = gql`
	fragment mediaItemFields on MediaItem {
		id
		parentId
		type
		hash
		filename
		filetype
		width
		height
		filesize
		isAnimated
		cropStartX
		cropStartY
		cropEndX
		cropEndY
		rehostedFrom
		status
		preferredFileType
		avgImgColor
		imgHasTransparency
	}
`;

const userFields = gql`
	fragment userFields on User {
		id
		type
		username
		name
		displayName
		webSite
		url
		slug
		imgAvatar
		dogtag
		shoutsEnabled
		friendRequestsEnabled
		status
		permissionLevel
		isVerified
		isPartner
	}
`;

const gameFields = gql`
	fragment gameFields on Game {
		id
		developer {
			...userFields
		}
		title
		slug
		path
		imgThumbnail
		headerMediaItem {
			...mediaItemFields
		}
		thumbnailMediaItem {
			...mediaItemFields
		}
		ratingsEnabled
		referralsEnabled
		status
		developmentStatus
		canceled
		tigrsAge
	}
`;

const communityFields = gql`
	fragment communityFields on Community {
		id
		name
		path
		headerId
		header {
			...mediaItemFields
		}
		thumbnailId
		thumbnail {
			...mediaItemFields
		}
		postPlaceholderText
		gameId
		game {
			...gameFields
		}
		isRemoved
		hash
		isVerified
		featuredBackgroundId
		featuredBackground {
			...mediaItemFields
		}
	}
`;

const featuredItemFields = gql`
	fragment featuredItemFields on FeaturedItem {
		id
		content
		backUrl
		frontUrl
		customText
		customUrl
		game {
			...gameFields
		}
		community {
			...communityFields
		}
	}
`;

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
		payload: {
			query() {
				return gql`
					${mediaItemFields}
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

						featuredItems(limit: 4, onlyGames: true) {
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
				`;
			},
			update: payload => ({ payload }),
			result(this: RouteDiscoverHome, { data }) {
				if (!data) {
					return;
				}

				const start = Date.now();
				const payload = mapPayload(data) as {
					communitiesFeatured: any[];
					latestFeatured: any[];
					featuredItems: any[];
					games: any[];
				};
				console.log('time', Date.now() - start);

				this.featuredCommunities = Community.populate(payload.communitiesFeatured);

				this.featuredItem =
					payload.latestFeatured.length > 0
						? new FeaturedItem(payload.latestFeatured[0])
						: null;

				const featuredGames = payload.featuredItems.map(i => new Game(i.game));

				// If the first featured item is a game, then we want to shift
				// it off the array for featured games since it's showing in the
				// main spot.
				if (this.featuredItem?.game) {
					featuredGames.shift();
				}

				// Make sure we only have 3.
				const featuredGameIds = featuredGames.map(i => i.id);

				this.games = Game.populate(payload.games).filter(
					i => !featuredGameIds.includes(i.id)
				);
			},
		},
	},
})
@RouteResolver({
	cache: true,
	lazy: true,
	deps: {},
	resolver: () => Api.sendRequest('/web/discover'),
})
export default class RouteDiscoverHome extends BaseRouteComponent {
	@State
	app!: Store['app'];

	graphPayload: any = null;

	featuredItem: FeaturedItem | null = null;
	featuredCommunities: Community[] = [];
	games: Game[] = [];

	routeCreated() {
		Meta.setTitle(null);
	}

	routeResolved($payload: any) {
		Meta.description = $payload.metaDescription;
		Meta.fb = $payload.fb;
		Meta.twitter = $payload.twitter;
		Meta.fb.image = Meta.twitter.image = require('../../../img/social/social-share-header.png');
		Meta.fb.url = Meta.twitter.url = Environment.baseUrl;

		Meta.microdata = {
			'@context': 'http://schema.org',
			'@type': 'WebSite',
			url: 'https://gamejolt.com/',
			name: 'Game Jolt',
			potentialAction: {
				'@type': 'SearchAction',
				target: 'https://gamejolt.com/search?q={search_term_string}',
				'query-input': 'required name=search_term_string',
			},
		};

		// this.featuredItem = $payload.featuredItem ? new FeaturedItem($payload.featuredItem) : null;

		// if ($payload.isFollowingFeatured && this.featuredItem) {
		// 	if (this.featuredItem.game) {
		// 		this.featuredItem.game.is_following = true;
		// 	} else if (this.featuredItem.community) {
		// 		this.featuredItem.community.is_member = true;
		// 	}
		// }

		// this.featuredCommunities = Community.populate($payload.featuredCommunities);
		// this.games = Game.populate($payload.games);
	}
}
