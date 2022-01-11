import { mixins, Options, Prop } from 'vue-property-decorator';
import { BaseModal } from '../../../../../_common/modal/base';
import { ChatRoom } from '../../../../components/chat/room';
import { ChatUserCollection } from '../../../../components/chat/user-collection';
import AppFiresideChatMembers from '../chat-members.vue';

@Options({
	components: {
		AppFiresideChatMembers,
	},
})
export default class AppFiresideChatMembersModal extends mixins(BaseModal) {
	@Prop({ type: Object, required: true })
	chatUsers!: ChatUserCollection;

	@Prop({ type: Object, required: true })
	chatRoom!: ChatRoom;
}
