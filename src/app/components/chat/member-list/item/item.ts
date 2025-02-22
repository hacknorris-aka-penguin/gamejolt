import Vue from 'vue';
import Component from 'vue-class-component';
import { InjectReactive, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../../utils/vue';
import AppPopper from '../../../../../_common/popper/popper.vue';
import { Screen } from '../../../../../_common/screen/screen-service';
import { ScrollInviewConfig } from '../../../../../_common/scroll/inview/config';
import { AppScrollInview } from '../../../../../_common/scroll/inview/inview';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import { ChatStore, ChatStoreKey } from '../../chat-store';
import { isUserOnline, tryGetRoomRole } from '../../client';
import { ChatRoom } from '../../room';
import { ChatUser } from '../../user';
import AppChatUserOnlineStatus from '../../user-online-status/user-online-status.vue';
import AppChatUserPopover from '../../user-popover/user-popover.vue';

const InviewConfig = new ScrollInviewConfig({ margin: `${Screen.height / 2}px` });

@Component({
	components: {
		AppScrollInview,
		AppChatUserOnlineStatus,
		AppPopper,
		AppChatUserPopover,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppChatMemberListItem extends Vue {
	@InjectReactive(ChatStoreKey) chatStore!: ChatStore;
	@Prop(propRequired(ChatUser)) user!: ChatUser;
	@Prop(propRequired(ChatRoom)) room!: ChatRoom;

	readonly InviewConfig = InviewConfig;
	readonly Screen = Screen;

	isInview = false;

	get chat() {
		return this.chatStore.chat!;
	}

	get isOnline() {
		if (!this.chatStore.chat || this.room.isFiresideRoom) {
			return null;
		}

		return isUserOnline(this.chat, this.user.id);
	}

	get isOwner() {
		return this.room.owner_id === this.user.id;
	}

	get isModerator() {
		const role = tryGetRoomRole(this.chat, this.room, this.user);
		return role === 'moderator';
	}

	get isStaff() {
		// In public rooms, display staff member status.
		return !this.room.isPrivateRoom && this.user.permission_level > 0;
	}
}
