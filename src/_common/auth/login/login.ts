import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Connection } from '../../connection/connection-service';
import { Navigate } from '../../navigate/navigate.service';
import { authOnLogin, getRedirectUrl, redirectToDashboard } from '../auth.service';
import AppAuthLoginForm from './login-form.vue';

@Component({
	components: {
		AppAuthLoginForm,
	},
})
export default class AppAuthLogin extends Vue {
	@Prop(Boolean)
	overlay?: boolean;

	@Prop(String)
	redirectTo!: string;

	readonly Connection = Connection;

	onLoggedIn(_formModel: any, response: any) {
		// When we get a token, we are expected to solve a captcha and pass it back.
		if (response.token) {
			return;
		}

		// Otherwise, log them in!
		authOnLogin('email');

		const location = getRedirectUrl(this.redirectTo);
		if (location) {
			Navigate.goto(location);
			return;
		}

		redirectToDashboard();
	}

	onNeedsApprovedLogin(loginPollingToken: string) {
		sessionStorage.setItem('login-polling-token', loginPollingToken);
		this.$router.push({
			name: 'auth.approve-login',
			query: { redirect: this.redirectTo || undefined },
		});
	}
}
