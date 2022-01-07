import { mixins, Options, Watch } from 'vue-property-decorator';
import { CommunityChannel } from '../../../../../../_common/community/channel/channel.model';
import AppFormControlCrop from '../../../../../../_common/form-vue/controls/AppFormControlCrop.vue';
import AppFormControlUpload from '../../../../../../_common/form-vue/controls/upload/AppFormControlUpload.vue';
import {
	BaseForm,
	FormOnBeforeSubmit,
	FormOnLoad,
} from '../../../../../../_common/form-vue/form.service';
import { ModalConfirm } from '../../../../../../_common/modal/confirm/confirm-service';

type FormModel = CommunityChannel & {
	background_crop: any;
};

class Wrapper extends BaseForm<FormModel> {}

@Options({
	components: {
		AppFormControlUpload,
		AppFormControlCrop,
	},
})
export default class FormCommunityChannelBackground
	extends mixins(Wrapper)
	implements FormOnLoad, FormOnBeforeSubmit
{
	modelClass = CommunityChannel as any;
	saveMethod = '$saveBackground' as const;

	maxFilesize = 0;
	aspectRatio = 0;
	minWidth = 0;
	minHeight = 0;
	maxWidth = 0;
	maxHeight = 0;

	get loadUrl() {
		return `/web/dash/communities/channels/save/${this.formModel.community_id}/${this.formModel.id}`;
	}

	get crop() {
		return this.formModel.background ? this.formModel.background.getCrop() : undefined;
	}

	@Watch('crop')
	onCropChange() {
		this.setField('background_crop', this.crop);
	}

	onLoad(payload: any) {
		this.maxFilesize = payload.maxFilesize;
		this.aspectRatio = payload.aspectRatio;
		this.minWidth = payload.minWidth;
		this.maxWidth = payload.maxWidth;
		this.minHeight = payload.minHeight;
		this.maxHeight = payload.maxHeight;
	}

	onBeforeSubmit() {
		// Backend expects this field.
		this.setField('crop' as any, this.formModel.background_crop);
	}

	backgroundSelected() {
		if (this.formModel.file) {
			this.form.submit();
		}
	}

	async clearBackground() {
		const result = await ModalConfirm.show(
			this.$gettext(`Are you sure you want to remove this channel's background?`)
		);

		if (!result) {
			return;
		}

		const payload = await this.formModel.$clearBackground();

		this.model?.assign(payload.channel);
	}
}
