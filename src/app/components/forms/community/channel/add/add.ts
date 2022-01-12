import { determine } from 'jstimezonedetect';
import { nextTick } from 'vue';
import { setup } from 'vue-class-component';
import { mixins, Options, Prop } from 'vue-property-decorator';
import { CommunityChannel } from '../../../../../../_common/community/channel/channel.model';
import { Community } from '../../../../../../_common/community/community.model';
import { BaseForm } from '../../../../../../_common/form-vue/form.service';
import { useCommonStore } from '../../../../../../_common/store/common-store';
import AppFormCommunityChannelPermissions from '../_permissions/permissions.vue';

class FormModel extends CommunityChannel {
	permission_posting = 'all';
	timezone: string | null = null;
}

class Wrapper extends BaseForm<FormModel> {}

@Options({
	components: {
		AppFormCommunityChannelPermissions,
	},
})
export default class FormCommunityChannelAdd extends mixins(Wrapper) {
	@Prop({ type: Object, required: true }) community!: Community;
	@Prop({ type: Array, required: true }) channels!: CommunityChannel[];
	@Prop({ type: Array, required: true }) archivedChannels!: CommunityChannel[];

	commonStore = setup(() => useCommonStore());

	get user() {
		return this.commonStore.user;
	}

	modelClass = FormModel;
	isTitleInitial = true;

	get types() {
		return [
			{
				radioValue: 'post-feed',
				text: this.$gettext(`Posts`),
				helpText: this.$gettext(`Displays a feed of posts`),
			},
			{
				radioValue: 'competition',
				text: this.$gettext(`Game Jam`),
				helpText: this.$gettext(
					`A competition to create games within a certain timeframe, usually around a particular theme`
				),
			},
		];
	}

	get isValid() {
		if (!this.valid) {
			return false;
		}

		return (
			!!this.formModel.title &&
			this.formModel.title.trim().length >= 3 &&
			this.formModel.title.trim().length <= 30 &&
			!this.isTitleTaken(this.formModel.title)
		);
	}

	get shouldShowType() {
		// TODO: for now, only site mods (and wittleriri) are allowed to create jam channels.
		return this.user && (this.user.permission_level >= 3 || this.user.id === 5027906);
	}

	created() {
		this.form.resetOnSubmit = true;
	}

	isTitleTaken(title: string) {
		return [...this.channels, ...this.archivedChannels]
			.map(i => i.title.toLowerCase().trim())
			.includes(title.toLowerCase().trim());
	}

	onInit() {
		this.setField('community_id', this.community.id);
		this.setField('type', 'post-feed');
		this.setField('permission_posting', 'all');
		// Used to submit a default timezone for a competition when creating a competition channel.
		this.setField('timezone', determine().name());
	}

	async onChangedDisplayTitle() {
		if (!this.isTitleInitial) {
			return;
		}

		if (this.formModel.display_title) {
			// Autogenerate a valid title for the display title.
			let formTitle = this.formModel.display_title
				// Titles are always lower case, display titles aren't.
				.toLowerCase()
				.trim()
				// Replace any invalid title chars with "_".
				.replace(/[^a-z0-9_]/g, '_');

			// Try and remove underscores from start/end.
			// Example: display title of "> Channel <" ends up with "channel" instead of "__channel__".
			while (formTitle.startsWith('_')) {
				formTitle = formTitle.substring(1);
			}
			while (formTitle.endsWith('_')) {
				formTitle = formTitle.substring(0, formTitle.length - 1);
			}

			// Enforce max title length.
			formTitle = formTitle.substring(0, 30);

			let title = formTitle;

			if (formTitle !== '') {
				let num = 0;

				// When long as the autogenerated title is taken, append a number to the end like this:
				// <title>_<num>
				// Loop until this generates a title that is not taken, with num counting up.
				while (this.isTitleTaken(title)) {
					num++;
					const numStr = '_' + num.toString();
					// Make sure that the title and the _<num> suffix do not exceed title length requirements.
					formTitle = formTitle.substring(0, 30 - numStr.length);
					title = formTitle + numStr;
				}
			}

			this.setField('title', title);

			// Validate the form manually once the title field is valid.
			if (title.length >= 3) {
				await nextTick();
				this.form.validate();
			}
		} else {
			this.setField('title', '');

			await nextTick();
			this.form.validate();
		}
	}

	onChangedTitle() {
		if (this.formModel.title === '') {
			this.isTitleInitial = true;
		} else {
			// When the user types a custom title, do not overwrite it when typing a display title.
			this.isTitleInitial = false;
		}
	}
}
