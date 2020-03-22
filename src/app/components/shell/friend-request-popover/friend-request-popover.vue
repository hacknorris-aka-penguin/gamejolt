<template>
	<app-popper
		v-if="!Connection.isClientOffline"
		hide-on-state-change
		force-max-width
		@show="onShow()"
		@hide="onHide()"
	>
		<a
			class="navbar-item"
			:class="{ active: isShowing }"
			v-app-tooltip.bottom="$gettext(`Friend Requests`)"
			v-app-track-event="`top-nav:friend-requests:toggle`"
		>
			<span
				class="notification-tag tag tag-highlight anim-fade-enter anim-fade-leave"
				v-if="friendRequestCount"
			>
				{{ friendRequestCount }}
			</span>
			<app-jolticon icon="friend-requests" />
		</a>

		<template v-if="isShowing">
			<div class="-header fill-darker" slot="header">
				<nav class="-nav platform-list inline nav-justified">
					<ul>
						<li>
							<a :class="{ active: activeTab === 'requests' }" @click="setActiveTab('requests')">
								<translate>Friend Requests</translate>
								<span class="badge">{{ friendRequestCount }}</span>
							</a>
						</li>
						<li v-if="outgoingCount > 0">
							<a :class="{ active: activeTab === 'pending' }" @click="setActiveTab('pending')">
								<translate>Sent Requests</translate>
								<span class="badge">{{ outgoingCount }}</span>
							</a>
						</li>
					</ul>
				</nav>
			</div>
			<div class="shell-card-popover fill-dark" slot="popover">
				<app-shell-friend-request-popover-container
					:active-tab="activeTab"
					@count="onCountChange"
				/>
			</div>
		</template>
	</app-popper>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'

.-nav
	margin-bottom: 0
	padding-top: ($line-height-computed / 2)
</style>

<script lang="ts" src="./friend-request-popover"></script>
