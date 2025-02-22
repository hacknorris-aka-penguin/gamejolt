import Vue from 'vue';
import { Component, Emit, Inject, InjectReactive, Prop } from 'vue-property-decorator';
import { AppAuthRequired } from '../../../../_common/auth/auth-required-directive';
import {
	DrawerStore,
	DrawerStoreKey,
	setDrawerOpen,
} from '../../../../_common/drawer/drawer-store';
import { Screen } from '../../../../_common/screen/screen-service';
import AppScrollScroller from '../../../../_common/scroll/scroller/scroller.vue';
import {
	FiresideController,
	FiresideControllerKey,
} from '../../../components/fireside/controller/controller';
import AppFiresideCohostManage from '../cohost/manage/manage.vue';
import AppFiresideHostThumb from '../_host-thumb/host-thumb.vue';
import AppFiresideStreamOptions from '../_stream-options/stream-options.vue';
import AppFiresideStreamPlayback from '../_stream-playback/stream-playback.vue';
import AppFiresideHostListStickerButton from './sticker-button/sticker-button.vue';

@Component({
	components: {
		AppFiresideHostThumb,
		AppScrollScroller,
		AppFiresideStreamOptions,
		AppFiresideCohostManage,
		AppFiresideHostListStickerButton,
		AppFiresideStreamPlayback,
	},
	directives: {
		AppAuthRequired,
	},
})
export default class AppFiresideHostList extends Vue {
	@Prop({ type: Boolean, default: false })
	hideThumbOptions!: boolean;

	@Prop({ type: Boolean, default: false })
	showPlayback!: boolean;

	@InjectReactive(FiresideControllerKey) c!: FiresideController;
	@Inject(DrawerStoreKey) drawerStore!: DrawerStore;

	@Emit('show-popper') emitShowPopper() {}
	@Emit('hide-popper') emitHidePopper() {}

	get canPlaceStickers() {
		return !!this.c.user && !Screen.isMobile;
	}

	get canManageCohosts() {
		return this.c.canManageCohosts;
	}

	onClickStickerButton() {
		setDrawerOpen(this.drawerStore, true);
	}
}
