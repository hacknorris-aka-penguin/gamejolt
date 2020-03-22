import gql from 'graphql-tag';

export const transcodedMediaItemFields = gql`
	fragment transcodedMediaItemFields on TranscodedMediaItem {
		id
		# hash
		# filename
		filetype
		# isAnimated
		# width
		# height
		# filesize
		# addedOn
		# status
		imgUrl
	}
`;

export const mediaItemFields = gql`
	fragment mediaItemFields on MediaItem {
		id
		# parentId
		# type
		# hash
		# filename
		# filetype
		isAnimated
		width
		height
		# filesize
		# cropStartX
		# cropStartY
		# cropEndX
		# cropEndY
		# addedOn
		# status
		imgUrl
		mediaserverUrl
		transcoded {
			...transcodedMediaItemFields
		}
	}
`;

export const themePresetFields = gql`
	fragment themePresetFields on ThemePreset {
		id
		name
		highlight
		backlight
		notice
		tint
		sort
		isMeme
	}
`;

export const themeFields = gql`
	fragment themeFields on Theme {
		id
		resource
		resourceId
		customColor
		themePreset {
			...themePresetFields
		}
	}
`;

export const userFields = gql`
	fragment userFields on User {
		id
		type
		username
		name
		displayName
		# webSite
		url
		slug
		imgAvatar
		# dogtag
		# shoutsEnabled
		# friendRequestsEnabled
		status
		permissionLevel
		isVerified
		# isPartner
		# createdOn
		# lastLoggedOn
		theme {
			...themeFields
		}
		followerCount
		followingCount
		# commentCount
		isFollowing
		followsYou
	}
`;

export const gameFields = gql`
	fragment gameFields on Game {
		id
		developer {
			...userFields
		}
		title
		slug
		# path
		# imgThumbnail
		headerMediaItem {
			...mediaItemFields
		}
		thumbnailMediaItem {
			...mediaItemFields
		}
		# I think we only have this so that we know if we should show the media
		# bar placeholder before the game overview page loads...
		mediaCount
		followerCount
		ratingsEnabled
		# referralsEnabled
		compatibility {
			osWindows
			osWindows64
			osMac
			osMac64
			osLinux
			osLinux64
			osOther
			typeDesktop
			typeFlash
			typeSilverlight
			typeUnity
			typeApplet
			typeRom
		}
		# modifiedOn
		# postedOn
		# publishedOn
		status
		developmentStatus
		canceled
		tigrsAge
		theme {
			...themeFields
		}
		shouldShowAds
		sellable {
			id
			type
			isOwned
			pricings {
				promotional
				amount
			}
		}
		isFollowing
		perms
	}
`;

export const userBlockFields = gql`
	fragment userBlockFields on UserBlock {
		id
		# I don't think we need any of this for the common fields.
		# user {
		# 	...userFields
		# }
		# resource
		# resourceId
		# blockedOn
		# expiresOn
		# reason
	}
`;

export const communityFields = gql`
	fragment communityFields on Community {
		id
		name
		path
		# header {
		# 	...mediaItemFields
		# }
		thumbnail {
			...mediaItemFields
		}
		# game {
		# 	...gameFields
		# }
		# postPlaceholderText
		isVerified
		# addedOn
		theme {
			...themeFields
		}
		memberCount
		isMember
		perms
		userBlock {
			...userBlockFields
		}
	}
`;

export const featuredItemFields = gql`
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
		# jam
		# postedOn
	}
`;

export function makeRouteQuery<T>(query: any, resolve: (this: T, data: any) => any) {
	return {
		query() {
			return query;
		},
		update: (payload: any) => ({ payload }),
		result(this: T, { data }: any) {
			resolve.call(this, data);
		},
	};
}

export function mapQueryPayload(payload: { [k: string]: any }) {
	const ret: { [k: string]: any } = {};
	for (const k in payload) {
		ret[k] = mapValue(payload[k]);
	}
	return ret;
}

function isObject(val: any): boolean {
	return typeof val === 'object' && val !== null;
}

function snakeCase(str: string) {
	return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
}

function mapArray(items: any[]): any[] {
	return items.map(i => mapValue(i));
}

function mapKeys(obj: any) {
	const ret: any = {};
	for (let [key, val] of Object.entries(obj)) {
		// Convert any IDs to integers. GraphQL by default defines all ID types
		// as string.
		if (key === 'id' && typeof val === 'string') {
			val = parseInt(val, 10);
		}

		const snakeKey = snakeCase(key);
		ret[snakeKey] = mapValue(val);
	}
	return ret;
}

function mapValue(val: any) {
	if (Array.isArray(val)) {
		return mapArray(val);
	} else if (isObject(val)) {
		const mapped = mapKeys(val);

		if (mapped.__typename === 'MediaItem') {
			if (mapped.transcoded && mapped.transcoded.length > 0) {
				const mp4 = mapped.transcoded.find((i: any) => i.filetype === 'mp4');
				const webm = mapped.transcoded.find((i: any) => i.filetype === 'webm');
				mapped.mediaserver_url_mp4 = mp4?.img_url;
				mapped.mediaserver_url_webm = webm?.img_url;
			}
		}

		return mapped;
	}
	return val;
}
