import gql from 'graphql-tag';
import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../../utils/vue';
import { makeRouteQuery, mapQueryPayload } from '../../../../../_common/graphql';
import AppLoading from '../../../../../_common/loading/loading.vue';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip';
import { UserFriendship } from '../../../../../_common/user/friendship/friendship.model';
import { UserFriendshipHelper } from '../../../user/friendships-helper/friendship-helper.service';
import { FriendRequestsTab } from '../friend-request-popover';
import AppShellFriendRequestPopoverItem from '../item/item.vue';

@Component({
	components: {
		AppLoading,
		AppShellFriendRequestPopoverItem,
	},
	directives: {
		AppTooltip,
	},
	apollo: {
		payload: makeRouteQuery<AppShellFriendRequestPopoverContainer>(
			gql`
				query FriendRequests {
					friendRequestsSent {
						id
						createdOn
						state
						targetUser {
							...userFields
						}
					}

					friendRequestsReceived {
						id
						createdOn
						state
						user {
							...userFields
						}
					}
				}

				fragment userFields on User {
					id
					username
					displayName
					url
					imgAvatar
				}
			`,
			function(data) {
				if (!data) {
					return;
				}

				const payload = mapQueryPayload(data) as {
					friendRequestsSent: any[];
					friendRequestsReceived: any[];
				};

				this.outgoing = UserFriendship.populate(payload.friendRequestsSent);
				this.incoming = UserFriendship.populate(payload.friendRequestsReceived);
				this.isLoading = false;
				this.count({ incoming: this.incoming.length, outgoing: this.outgoing.length });
			}
		),
	},
})
export default class AppShellFriendRequestPopoverContainer extends Vue {
	@Prop(propRequired(String)) activeTab!: FriendRequestsTab;

	isLoading = true;
	incoming: UserFriendship[] = [];
	outgoing: UserFriendship[] = [];

	get requests() {
		return this.activeTab === 'requests' ? this.incoming : this.outgoing;
	}

	@Emit()
	count(_event: { incoming: number; outgoing: number }) {}

	async acceptRequest(request: UserFriendship) {
		await UserFriendshipHelper.acceptRequest(request);
		this.removeRequest(request);
	}

	async rejectRequest(request: UserFriendship) {
		if (!(await UserFriendshipHelper.rejectRequest(request))) {
			return;
		}
		this.removeRequest(request);
	}

	async cancelRequest(request: UserFriendship) {
		if (!(await UserFriendshipHelper.cancelRequest(request))) {
			return;
		}
		this.removeRequest(request);
	}

	// TODO: Get this working in graphql mutations for the cache?
	private removeRequest(request: UserFriendship) {
		// const index = this.incoming.findIndex(item => item.id === request.id);
		// if (index !== -1) {
		// 	this.incoming.splice(index, 1);
		// }
		// this.setFriendRequestCount(this.incoming.length);
		// if (this.activeTab === 'pending' && !this.outgoing.length) {
		// 	this.setActiveTab('requests');
		// }
	}
}
