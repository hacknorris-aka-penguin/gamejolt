import Vue from 'vue';
import { Component, Emit, Prop, Watch } from 'vue-property-decorator';
import { Api } from '../../../api/api.service';
import AppPopper from '../../../popper/popper.vue';
import { Screen } from '../../../screen/screen-service';
import { User } from '../../user.model';
import AppUserCard from '../card.vue';

@Component({
	components: {
		AppPopper,
		AppUserCard,
	},
})
export default class AppUserCardHover extends Vue {
	@Prop(User)
	user?: User;

	@Prop(Boolean)
	disabled?: boolean;

	@Prop({ type: Number, default: 500 })
	hoverDelay!: number;

	@Prop({ type: Boolean })
	noStats!: boolean;

	@Emit('show') emitShow() {}
	@Emit('hide') emitHide() {}

	isShowing = false;
	isLoaded = false;

	get isDisabled() {
		return Screen.isXs || !!this.disabled || GJ_IS_SSR;
	}

	get shouldShow() {
		return !!this.user && this.isShowing;
	}

	get component() {
		return this.isDisabled ? 'span' : AppPopper;
	}

	get componentProps() {
		return this.isDisabled
			? {}
			: {
					placement: 'top',
					trigger: 'hover',
					showDelay: this.hoverDelay,
					block: true,
			  };
	}

	get componentOn() {
		return this.isDisabled
			? {}
			: {
					show: () => this.onShow(),
					hide: () => this.onHide(),
			  };
	}

	@Watch('user.id', { immediate: true })
	onUserChange() {
		if (this.user) {
			this.isLoaded = false;
		}
	}

	onShow() {
		this.emitShow();
		this.isShowing = true;
		if (!this.isLoaded && !this.noStats) {
			this.fetchCardInfo();
		}
	}

	onHide() {
		this.isShowing = false;
		this.emitHide();
	}

	async fetchCardInfo() {
		if (!this.user) {
			return;
		}

		const response = await Api.sendRequest('/web/profile/card/' + this.user.id, undefined, {
			detach: true,
		});

		this.isLoaded = true;

		// Assign to the user to make sure the following status is up to date.
		if (this.user) {
			this.user.assign(response.user);
		}
	}
}
