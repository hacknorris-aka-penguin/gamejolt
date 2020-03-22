import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { Mutation, State } from 'vuex-class/lib/bindings';
import { Connection } from '../../../../_common/connection/connection-service';
import AppPopper from '../../../../_common/popper/popper.vue';
import { AppState, AppStore } from '../../../../_common/store/app-store';
import { AppTooltip } from '../../../../_common/tooltip/tooltip';
import { Store } from '../../../store';
import AppShellFriendRequestPopoverContainer from './container/container.vue';

export type FriendRequestsTab = 'requests' | 'pending';

@Component({
	components: {
		AppPopper,
		AppShellFriendRequestPopoverContainer,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppShellFriendRequestPopover extends Vue {
	@State
	friendRequestCount!: Store['friendRequestCount'];

	@Mutation
	setFriendRequestCount!: Store['setFriendRequestCount'];

	@AppState
	user!: AppStore['user'];

	isShowing = false;
	activeTab: FriendRequestsTab = 'requests';
	// We need to handle outgoing separately since it's not part of the store.
	outgoingCount = 0;

	readonly Connection = Connection;

	onShow() {
		this.isShowing = true;
	}

	onHide() {
		this.isShowing = false;
	}

	onCountChange({ incoming, outgoing }: { incoming: number; outgoing: number }) {
		this.setFriendRequestCount(incoming);
		this.outgoingCount = outgoing;
	}

	setActiveTab(tab: FriendRequestsTab) {
		this.activeTab = tab;
	}
}
