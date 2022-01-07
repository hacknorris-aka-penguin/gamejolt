import { mixins, Options, Watch } from 'vue-property-decorator';
import { ClientAutoStart } from '../../../../_common/client/safe-exports';
import AppFormControlToggle from '../../../../_common/form-vue/controls/AppFormControlToggle.vue';
import { BaseForm } from '../../../../_common/form-vue/form.service';
import {
	SettingAnimatedThumbnails,
	SettingAutostartClient,
	SettingBroadcastModal,
	SettingFeedNotifications,
	SettingGameInstallDir,
	SettingMaxDownloadCount,
	SettingMaxExtractCount,
	SettingQueueWhenPlaying,
	SettingRestrictedBrowsing,
	SettingThemeAlwaysOurs,
	SettingThemeDark,
} from '../../../../_common/settings/settings.service';
import { AppState, AppStore } from '../../../../_common/store/app-store';
import { ThemeMutation, ThemeState, ThemeStore } from '../../../../_common/theme/theme.store';

type FormModel = {
	chat_notify_friends_online: boolean;
	restricted_browsing: boolean;
	broadcast_modal: boolean;
	animated_thumbnails: boolean;
	feed_notifications: boolean;
	game_install_dir: string;
	queue_when_playing: boolean;
	max_download_count: number;
	limit_downloads: boolean;
	max_extract_count: number;
	limit_extractions: boolean;
	autostart_client: boolean;
	theme_dark: boolean;
	theme_always_ours: boolean;
	sticker_sounds: boolean;
};

class Wrapper extends BaseForm<FormModel> {}

@Options({
	components: {
		AppFormControlToggle,
	},
})
export default class FormSettings extends mixins(Wrapper) {
	@AppState user!: AppStore['user'];
	@ThemeState isDark!: ThemeStore['isDark'];
	@ThemeState alwaysOurs!: ThemeStore['alwaysOurs'];
	@ThemeMutation setDark!: ThemeStore['setDark'];
	@ThemeMutation setAlwaysOurs!: ThemeStore['setAlwaysOurs'];

	get canClientAutostart() {
		return ClientAutoStart?.canAutoStart;
	}

	get browserNotificationsDisabled() {
		return (Notification as any).permission === 'denied';
	}

	created() {
		this.form.warnOnDiscard = false;
	}

	onInit() {
		this.setField('restricted_browsing', SettingRestrictedBrowsing.get());
		this.setField('broadcast_modal', SettingBroadcastModal.get());
		this.setField('animated_thumbnails', SettingAnimatedThumbnails.get());
		this.setField('feed_notifications', SettingFeedNotifications.get());
		this.setField('theme_dark', SettingThemeDark.get());
		this.setField('theme_always_ours', SettingThemeAlwaysOurs.get());

		if (GJ_IS_DESKTOP_APP) {
			this.setField('game_install_dir', SettingGameInstallDir.get());
			this.setField('queue_when_playing', SettingQueueWhenPlaying.get());

			this.setField('max_download_count', SettingMaxDownloadCount.get());
			this.setField('limit_downloads', this.formModel.max_download_count !== -1);

			this.setField('max_extract_count', SettingMaxExtractCount.get());
			this.setField('limit_extractions', this.formModel.max_extract_count !== -1);

			if (this.canClientAutostart) {
				this.setField('autostart_client', SettingAutostartClient.get());
			}
		}
	}

	/**
	 * Just opens a file location dialog.
	 */
	changeLocation(ref: string) {
		const elem = this.$refs[ref];
		if (elem) {
			(elem as HTMLElement).click();
		}
	}

	onSelectedInstallDir(dir: string) {
		this.setField('game_install_dir', dir);
		this.onChange();
	}

	@Watch('formModel.limit_downloads')
	limitDownloadsChange(shouldLimit: boolean) {
		this.setField(
			'max_download_count',
			shouldLimit ? SettingMaxDownloadCount.defaultValue : -1
		);
		this.onChange();
	}

	@Watch('formModel.limit_extractions')
	limitExtractionsChange(shouldLimit: boolean) {
		this.setField('max_extract_count', shouldLimit ? SettingMaxExtractCount.defaultValue : -1);
		this.onChange();
	}

	onChange() {
		SettingRestrictedBrowsing.set(this.formModel.restricted_browsing);
		SettingBroadcastModal.set(this.formModel.broadcast_modal);
		SettingAnimatedThumbnails.set(this.formModel.animated_thumbnails);
		SettingFeedNotifications.set(this.formModel.feed_notifications);
		SettingThemeDark.set(this.formModel.theme_dark);
		SettingThemeAlwaysOurs.set(this.formModel.theme_always_ours);

		this.setDark(this.formModel.theme_dark);
		this.setAlwaysOurs(this.formModel.theme_always_ours);

		if (GJ_IS_DESKTOP_APP) {
			SettingGameInstallDir.set(this.formModel.game_install_dir);
			SettingMaxDownloadCount.set(this.formModel.max_download_count);
			SettingMaxExtractCount.set(this.formModel.max_extract_count);
			SettingQueueWhenPlaying.set(this.formModel.queue_when_playing);

			if (ClientAutoStart && this.canClientAutostart) {
				SettingAutostartClient.set(this.formModel.autostart_client);

				if (this.formModel.autostart_client) {
					ClientAutoStart.set();
				} else {
					ClientAutoStart.clear();
				}
			}

			// Tell's it to use the new settings.
			this.$store.commit('clientLibrary/checkQueueSettings');
		}
	}
}
