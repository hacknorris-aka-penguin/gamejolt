import { Options, Prop, Vue } from 'vue-property-decorator';
import { AppAuthRequired } from '../../../../../_common/auth/auth-required-directive';
import { formatFuzzynumber } from '../../../../../_common/filters/fuzzynumber';
import { formatNumber } from '../../../../../_common/filters/number';
import { ForumTopic } from '../../../../../_common/forum/topic/topic.model';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';

@Options({
	directives: {
		AppAuthRequired,
		AppTooltip,
	},
})
export default class AppForumTopicUpvoteWidget extends Vue {
	@Prop(Object) topic!: ForumTopic;

	readonly formatNumber = formatNumber;
	readonly formatFuzzynumber = formatFuzzynumber;

	get canUpvote() {
		return this.topic.can_upvote;
	}

	get isUpvoted() {
		return this.topic.is_upvoted;
	}

	get upvoteCount() {
		return this.topic.upvotes_count;
	}

	get upvoteTooltip() {
		if (!this.isUpvoted) {
			return this.$gettext(`Upvote this topic!`);
		} else {
			return this.$gettext(`Cool. You've upvoted this topic.`);
		}
	}

	onUpvoteClick() {
		if (!this.isUpvoted) {
			this.topic.$upvote();
		} else {
			this.topic.$removeUpvote();
		}
	}
}
