import { formatDistanceToNow } from 'date-fns';
import { Component } from 'vue-property-decorator';
import { Environment } from '../../../../_common/environment/environment.service';
import AppExpand from '../../../../_common/expand/expand.vue';
import AppFormControlContent from '../../../../_common/form-vue/control/content/content.vue';
import AppFormControlTheme from '../../../../_common/form-vue/control/theme/theme.vue';
import AppFormControlToggle from '../../../../_common/form-vue/control/toggle/toggle.vue';
import { BaseForm, FormOnLoad, FormOnSubmitError } from '../../../../_common/form-vue/form.service';
import AppLoading from '../../../../_common/loading/loading.vue';
import { DefaultTheme } from '../../../../_common/theme/theme.model';
import { ThemeMutation, ThemeStore } from '../../../../_common/theme/theme.store';
import { User } from '../../../../_common/user/user.model';

@Component({
	components: {
		AppLoading,
		AppExpand,
		AppFormControlTheme,
		AppFormControlToggle,
		AppFormControlContent,
	},
})
export default class FormProfile extends BaseForm<User> implements FormOnLoad, FormOnSubmitError {
	modelClass = User;
	resetOnSubmit = true;
	reloadOnSubmit = true;

	@ThemeMutation
	setFormTheme!: ThemeStore['setFormTheme'];

	usernameChangedOn = 0;
	usernameTimeLeft = 0;
	usernameDuration = '';
	isBioLocked = false;
	bioLengthLimit = 5_000;

	Environment = Environment;

	get loadUrl() {
		return '/web/dash/profile/save';
	}

	get mentionsSettingOptions() {
		return [
			{
				value: 2,
				text: this.$gettext(`No one`),
			},
			{
				value: 0,
				text: this.$gettext(`People you know`),
			},
			{
				value: 1,
				text: this.$gettext(`Everyone`),
			},
		];
	}

	destroyed() {
		this.setFormTheme(null);
	}

	onLoad(payload: any) {
		this.usernameChangedOn = payload.usernameChangedOn;
		this.usernameTimeLeft = payload.usernameTimeLeft;

		if (this.usernameTimeLeft) {
			this.usernameDuration = formatDistanceToNow(Date.now() + this.usernameTimeLeft);
		}

		this.isBioLocked = payload.isBioLocked;
		this.bioLengthLimit = payload.bioLengthLimit;
	}

	onSubmitError(response: any) {
		if (response.errors && response.errors['bio-locked']) {
			this.isBioLocked = true;
		}
	}

	onThemeChanged() {
		// Default would be the default theme for site.
		this.setFormTheme(this.formModel.theme ?? DefaultTheme);
	}
}
