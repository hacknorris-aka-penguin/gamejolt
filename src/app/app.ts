import Vue from 'vue';
import { Component, Provide, ProvideReactive, Watch } from 'vue-property-decorator';
import { AppPromotionStore, AppPromotionStoreKey } from '../utils/mobile-app';
import { loadCurrentLanguage } from '../utils/translations';
import { Analytics } from '../_common/analytics/analytics.service';
import { CommentStoreManager, CommentStoreManagerKey } from '../_common/comment/comment-store';
import AppCookieBanner from '../_common/cookie/banner/banner.vue';
import { DrawerStore, DrawerStoreKey } from '../_common/drawer/drawer-store';
import AppErrorPage from '../_common/error/page/page.vue';
import AppCommonShell from '../_common/shell/shell.vue';
import { AppState, AppStore } from '../_common/store/app-store';
import { getTranslationLang } from '../_common/translate/translate.service';
import { ChatStore, ChatStoreKey, clearChat, loadChat } from './components/chat/chat-store';
import AppShell from './components/shell/shell.vue';
import { Store } from './store';

@Component({
	components: {
		AppCommonShell,
		AppShell,
		AppErrorPage,
		AppCookieBanner,
	},
})
export default class App extends Vue {
	@ProvideReactive(ChatStoreKey) chatStore = new ChatStore();
	@Provide(CommentStoreManagerKey) commentManager = new CommentStoreManager();
	@Provide(DrawerStoreKey) drawerStore = new DrawerStore();
	@Provide(AppPromotionStoreKey) appPromotionStore = new AppPromotionStore();

	@AppState user!: AppStore['user'];

	$store!: Store;

	// On SSR we want to set mount point for the app to this component so that
	// we can hydrate the component. On browser we want to set the "app" in the
	// index template.
	get id() {
		return GJ_IS_SSR ? 'app' : undefined;
	}

	created() {
		if (!GJ_IS_SSR) {
			performance.measure('gj-shell-init', 'gj-start');
			const lang = getTranslationLang();
			if (lang !== 'en_US') {
				Analytics.trackEvent('translations', 'loaded', lang);
			}
		}
	}

	mounted() {
		// Let it finish doing all the initial rendering junk and track after
		// that.
		setTimeout(() => {
			performance.measure('gj-shell-mounted', 'gj-start');
		});

		loadCurrentLanguage(this);
	}

	/**
	 * When the user changes, we need to change our global app state.
	 */
	@Watch('user.id', { immediate: true })
	onUserChange(userId?: number) {
		const isLoggedIn = !!userId;

		if (isLoggedIn) {
			this.$store.dispatch('bootstrap');
			if (!GJ_IS_SSR) {
				loadChat(this.chatStore);
				this.$store.dispatch('loadGrid');
				this.$store.dispatch('loadNotificationState');
			}

			if (GJ_IS_CLIENT) {
				this.$store.dispatch('clientLibrary/bootstrap');
			}
		} else {
			this.$store.dispatch('clear');
			this.$store.dispatch('clearGrid');
			this.$store.dispatch('clearNotificationState');
			clearChat(this.chatStore);
		}
	}
}
