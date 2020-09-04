import Vue from 'vue';
import { Component, InjectReactive, Prop } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../../../utils/vue';
import { number } from '../../../../../_common/filters/number';
import { Screen } from '../../../../../_common/screen/screen-service';
import { AppScrollInview } from '../../../../../_common/scroll/inview/inview';
import { ChatClient, ChatKey, enterChatRoom } from '../../client';
import { ChatRoom } from '../../room';
import { ChatUser } from '../../user';
import AppChatUserOnlineStatus from '../../user-online-status/user-online-status.vue';

@Component({
	components: {
		AppScrollInview,
		AppChatUserOnlineStatus,
	},
})
export default class AppChatUserListItem extends Vue {
	@Prop(propRequired(ChatUser)) user!: ChatUser;
	@Prop(propOptional(ChatRoom)) room?: ChatRoom;
	@Prop(propOptional(Boolean, false)) showPm!: boolean;

	@InjectReactive(ChatKey) chat!: ChatClient;

	isInview = false;

	readonly Screen = Screen;

	get chatNotificationsCount() {
		return number(this.chat.notifications[this.user.room_id] || 0);
	}

	onUserClick(e: Event) {
		if (!this.showPm) {
			return;
		}

		enterChatRoom(this.chat, this.user.room_id);
		e.preventDefault();
	}
}
