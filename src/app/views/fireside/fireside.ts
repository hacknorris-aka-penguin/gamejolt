import Component from 'vue-class-component';
import { Inject, InjectReactive, Watch } from 'vue-property-decorator';
import { Api } from '../../../_common/api/api.service';
import { AppAuthRequired } from '../../../_common/auth/auth-required-directive';
import AppAuthJoin from '../../../_common/auth/join/join.vue';
import AppCommunityThumbnailImg from '../../../_common/community/thumbnail/img/img.vue';
import { DrawerStore, DrawerStoreKey } from '../../../_common/drawer/drawer-store';
import { Environment } from '../../../_common/environment/environment.service';
import AppExpand from '../../../_common/expand/expand.vue';
import AppFadeCollapse from '../../../_common/fade-collapse/fade-collapse.vue';
import { number } from '../../../_common/filters/number';
import { Fireside } from '../../../_common/fireside/fireside.model';
import AppIllustration from '../../../_common/illustration/illustration.vue';
import AppLoading from '../../../_common/loading/loading.vue';
import { Meta } from '../../../_common/meta/meta-service';
import { Navigate } from '../../../_common/navigate/navigate.service';
import { AppObserveDimensions } from '../../../_common/observe-dimensions/observe-dimensions.directive';
import { Popper } from '../../../_common/popper/popper.service';
import AppPopper from '../../../_common/popper/popper.vue';
import { AppResponsiveDimensions } from '../../../_common/responsive-dimensions/responsive-dimensions';
import { BaseRouteComponent, RouteResolver } from '../../../_common/route/route-component';
import { Screen } from '../../../_common/screen/screen-service';
import AppScrollScroller from '../../../_common/scroll/scroller/scroller.vue';
import AppStickerReactions from '../../../_common/sticker/reactions/reactions.vue';
import AppStickerTarget from '../../../_common/sticker/target/target.vue';
import { AppState, AppStore } from '../../../_common/store/app-store';
import { AppTooltip } from '../../../_common/tooltip/tooltip-directive';
import AppUserAvatarImg from '../../../_common/user/user-avatar/img/img.vue';
import { ChatStore, ChatStoreKey } from '../../components/chat/chat-store';
import AppChatWindowOutput from '../../components/chat/window/output/output.vue';
import AppChatWindowSend from '../../components/chat/window/send/send.vue';
import { AppFiresideContainer } from '../../components/fireside/container/container';
import {
	createFiresideController,
	FiresideController,
	getFiresideLink,
	toggleStreamVideoStats,
} from '../../components/fireside/controller/controller';
import { store } from '../../store';
import AppFiresideBanner from './_banner/banner.vue';
import AppFiresideChatMembers from './_chat-members/chat-members.vue';
import AppFiresideHeader from './_header/header.vue';
import AppFiresideHostList from './_host-list/host-list.vue';
import AppFiresideShare from './_share/share.vue';
import AppFiresideStats from './_stats/stats.vue';
import AppFiresideStream from './_stream/stream.vue';

type RoutePayload = {
	fireside: any;
	metaDescription: string;
	fb: any;
	twitter: any;
};

const FiresideThemeKey = 'fireside';

@Component({
	name: 'RouteFireside',
	components: {
		AppUserAvatarImg,
		AppLoading,
		AppChatWindowOutput,
		AppChatWindowSend,
		AppIllustration,
		AppAuthJoin,
		AppFiresideChatMembers,
		AppFiresideStats,
		AppCommunityThumbnailImg,
		AppResponsiveDimensions,
		AppFiresideStream,
		AppScrollScroller,
		AppFiresideHostList,
		AppPopper,
		AppFiresideShare,
		AppExpand,
		AppFiresideHeader,
		AppFiresideContainer,
		AppFiresideBanner,
		AppStickerTarget,
		AppStickerReactions,
		AppFadeCollapse,
	},
	directives: {
		AppTooltip,
		AppObserveDimensions,
		AppAuthRequired,
	},
})
@RouteResolver({
	deps: { params: ['hash'] },
	resolver: ({ route }) => Api.sendRequest(`/web/fireside/fetch/${route.params.hash}?meta=1`),
	lazy: true,
})
export default class RouteFireside extends BaseRouteComponent {
	@AppState user!: AppStore['user'];

	@InjectReactive(ChatStoreKey) chatStore!: ChatStore;
	@Inject(DrawerStoreKey) drawerStore!: DrawerStore;

	c: FiresideController | null = null;

	private beforeEachDeregister: Function | null = null;
	private canShowMobileHosts = true;

	readonly Screen = Screen;
	readonly number = number;
	readonly toggleStreamVideoStats = toggleStreamVideoStats;

	videoWidth = 0;
	videoHeight = 0;
	isVertical = false;

	$refs!: {
		videoWrapper: HTMLDivElement;
	};

	get loginUrl() {
		return (
			Environment.authBaseUrl + '/login?redirect=' + encodeURIComponent(this.$route.fullPath)
		);
	}

	get chat() {
		return this.chatStore.chat;
	}

	get fireside() {
		return this.c?.fireside;
	}

	get routeTitle() {
		if (!this.fireside) {
			return this.$gettext(`Loading Fireside...`);
		}

		return this.fireside.title + ' - Fireside';
	}

	get chatMessages() {
		if (!this.chat || !this.c?.chatRoom) {
			return [];
		}

		return this.chat.messages[this.c.chatRoom.id];
	}

	get chatQueuedMessages() {
		if (!this.chat || !this.c?.chatRoom) {
			return [];
		}

		return this.chat.messageQueue.filter(i => i.room_id === this.c?.chatRoom?.id);
	}

	get shouldFullscreenStream() {
		if (!this.c?.isStreaming) {
			return false;
		}
		return Screen.isXs && !this.shouldShowChat && !this.isVertical;
	}

	get shouldShowHeaderInBody() {
		return this.isVertical && !!this.c?.isStreaming;
	}

	get shouldShowChat() {
		const mobileCondition = Screen.isMobile && this.c?.isStreaming ? this.isVertical : true;
		return !!this.chat && this.chat.connected && !!this.c?.chatRoom && mobileCondition;
	}

	get shouldShowChatMembers() {
		return !this.c?.isStreaming && this.shouldShowChat && Screen.isLg;
	}

	get shouldShowChatMemberStats() {
		return this.shouldShowDesktopHosts && !!this.c?.isStreaming;
	}

	get shouldShowDesktopHosts() {
		return !this.isVertical && !Screen.isMobile;
	}

	get shouldShowMobileHosts() {
		return this.canShowMobileHosts && !!this.c?.isStreaming;
	}

	get shouldShowReactions() {
		return !Screen.isMobile;
	}

	get shouldShowFiresideStats() {
		return !this.c?.isStreaming && this.c?.status === 'joined' && !Screen.isMobile;
	}

	get shortestSide() {
		return Math.min(Screen.width, Screen.height);
	}

	async routeResolved($payload: RoutePayload) {
		Meta.description = $payload.metaDescription;
		Meta.fb = $payload.fb || {};
		Meta.fb.title = this.routeTitle;
		Meta.twitter = $payload.twitter || {};
		Meta.twitter.title = this.routeTitle;

		const fireside = new Fireside($payload.fireside);
		this.c ??= createFiresideController(fireside);

		this.setPageTheme();
	}

	routeDestroyed() {
		store.commit('theme/clearPageTheme', FiresideThemeKey);

		this.beforeEachDeregister?.();
		this.beforeEachDeregister = null;
	}

	calcIsVertical() {
		if (Screen.isMobile && !GJ_IS_SSR) {
			this.isVertical = window.screen.height > window.screen.width;
		} else {
			this.isVertical = Screen.height > Screen.width;
		}
	}

	onDimensionsChange() {
		this.calcIsVertical();

		const videoWrapper = this.$refs.videoWrapper;
		if (!videoWrapper) {
			return;
		}

		const wrapperWidth = videoWrapper.offsetWidth;
		const wrapperHeight = videoWrapper.offsetHeight;
		const wrapperRatio = wrapperWidth / wrapperHeight;

		const videoStats = this.c?.rtc?.videoChannel.agoraClient.getRemoteVideoStats();
		const receiveWidth = videoStats?.receiveResolutionWidth?.receiveResolutionWidth ?? 16;
		const receiveHeight = videoStats?.receiveResolutionHeight?.receiveResolutionHeight ?? 9;
		const receiveRatio = receiveWidth / receiveHeight;

		// If the video is wider than the containing element...
		if (receiveRatio > wrapperRatio) {
			this.videoWidth = wrapperWidth;
			this.videoHeight = wrapperWidth / receiveRatio;
		} else if (receiveRatio < wrapperRatio) {
			this.videoHeight = wrapperHeight;
			this.videoWidth = wrapperHeight * receiveRatio;
		} else {
			this.videoWidth = wrapperWidth;
			this.videoHeight = wrapperHeight;
		}
	}

	private setPageTheme() {
		const theme = this.fireside?.user?.theme ?? null;
		store.commit('theme/setPageTheme', { key: FiresideThemeKey, theme });
	}

	get shouldShowTitleControls() {
		return this.c && this.c.status === 'joined';
	}

	toggleVideoStats() {
		if (this.c) {
			toggleStreamVideoStats(this.c);
			Popper.hideAll();
		}
	}

	onClickRetry() {
		if (this.c?.onRetry) {
			this.c.onRetry();
		}
	}

	onClickOpenBrowser() {
		if (!this.c) {
			return;
		}

		const url = getFiresideLink(this.c, this.$router);
		if (url) {
			Navigate.newWindow(url);
		}
	}

	onChatEditorFocusChange(isFocused: boolean) {
		this.canShowMobileHosts = !isFocused;
	}

	@Watch('c.isPersonallyStreaming')
	onIsPersonallyStreamingChanged() {
		if (GJ_IS_SSR) {
			return;
		}

		if (!this.c || this.c.isPersonallyStreaming) {
			this.beforeEachDeregister ??= this.$router.beforeEach((_to, _from, next) => {
				if (
					!window.confirm(
						this.$gettext(
							`You are currently streaming to a fireside. If you leave this page, you will stop streaming. Are you sure you want to leave?`
						)
					)
				) {
					return next(false);
				}
				next();
			});
		} else {
			this.beforeEachDeregister?.();
			this.beforeEachDeregister = null;
		}
	}
}
