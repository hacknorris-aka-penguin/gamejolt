import { mixins, Options } from 'vue-property-decorator';
import { Api } from '../../../../../_common/api/api.service';
import AppFormControlToggle from '../../../../../_common/form-vue/controls/AppFormControlToggle.vue';
import {
	BaseForm,
	FormOnSubmit,
	FormOnSubmitSuccess,
} from '../../../../../_common/form-vue/form.service';
import { showInfoGrowl } from '../../../../../_common/growls/growls.service';

interface FormModel {
	username: string;
	removeComments: boolean;
}

class Wrapper extends BaseForm<FormModel> {}

@Options({
	components: {
		AppFormControlToggle,
	},
})
export default class FormUserBlock
	extends mixins(Wrapper)
	implements FormOnSubmit, FormOnSubmitSuccess
{
	created() {
		this.form.resetOnSubmit = true;
	}

	onSubmit() {
		return Api.sendRequest(`/web/dash/blocks/add`, this.formModel);
	}

	onSubmitSuccess(response: any) {
		if (response.success) {
			if (this.formModel.removeComments) {
				showInfoGrowl({
					message: this.$gettextInterpolate(
						'You blocked %{ user }! It might take a few moments for their comments/shouts to disappear',
						{
							user: this.formModel.username,
						}
					),
				});
			} else {
				showInfoGrowl({
					message: this.$gettextInterpolate('You blocked %{ user }!', {
						user: this.formModel.username,
					}),
				});
			}
		}
	}
}
