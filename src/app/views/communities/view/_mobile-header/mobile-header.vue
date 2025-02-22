<script lang="ts" src="./mobile-header"></script>

<template>
	<app-theme class="-community-card" :theme="community.theme">
		<div class="-well">
			<!-- Thumbnail -->
			<div class="-thumbnail">
				<div class="-thumbnail-inner">
					<app-editable-thumbnail />
				</div>
				<app-community-verified-tick class="-verified" :community="community" />
			</div>

			<!-- Name / Members -->
			<div class="-details">
				<div class="-name">
					<router-link :to="community.routeLocation" class="link-unstyled">
						{{ community.name }}
					</router-link>
				</div>

				<div class="-members small">
					<router-link
						v-app-track-event="`community-mobile-header:community-members`"
						v-translate="{ count: number(memberCount) }"
						:translate-n="memberCount"
						translate-plural="<b>%{count}</b> members"
						:to="{
							name: 'communities.view.members',
							params: { path: community.path },
						}"
					>
						<b>1</b>
						member
					</router-link>
				</div>
			</div>
		</div>

		<!-- Button Controls -->
		<div class="-controls">
			<!-- Context Menu -->
			<div v-if="shouldShowChannelsMenu" class="-controls-item -menu">
				<app-button
					v-app-track-event="`community-mobile-header:toggle-context`"
					icon="menu"
					trans
					:sparse="Screen.isXs && shouldShowAbout"
					:circle="Screen.isXs && shouldShowAbout"
					@click="onClickMenu"
				>
					<div v-if="hasUnread" class="-unread-blip" />
					<template v-if="!Screen.isXs || !shouldShowAbout">
						<translate v-if="routeStore && routeStore.channelPath">
							Channels
						</translate>
						<translate v-else>Menu</translate>
					</template>
				</app-button>
			</div>

			<div class="-spacer" />

			<!-- Join / Edit / View -->
			<div v-if="!community.hasPerms()" class="-controls-item -controls-primary">
				<app-community-join-widget
					:community="community"
					:disabled="!!community.user_block"
					block
					hide-count
					location="communityPage"
				/>
			</div>

			<!-- About -->
			<div
				v-if="shouldShowAbout"
				v-app-track-event="`community-mobile-header:community-about`"
				class="-controls-item -about"
			>
				<app-button trans @click="onClickAbout">
					<translate>About</translate>
				</app-button>
			</div>

			<!-- Popover Extras -->
			<app-popper class="-controls-item -extra" popover-class="fill-darkest">
				<app-button class="link-unstyled" icon="ellipsis-v" trans sparse circle />

				<template #popover>
					<div class="list-group list-group-dark">
						<a
							v-app-track-event="`copy-link:community`"
							class="list-group-item has-icon"
							@click="copyShareUrl"
						>
							<app-jolticon icon="link" />
							<translate>Copy link to community</translate>
						</a>
						<a
							v-if="shouldShowModTools"
							class="list-group-item has-icon"
							:href="
								Environment.baseUrl + `/moderate/communities/view/${community.id}`
							"
							target="_blank"
							@click="onClickExtrasOption"
						>
							<app-jolticon icon="cog" />
							<span>Moderate Community</span>
						</a>
					</div>
				</template>
			</app-popper>
		</div>
	</app-theme>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

$-thumbnail-size = 80px
$-thumbnail-size-sm = 48px
$-bg-color-base = var(--theme-bg)

.-unread-blip
	position: absolute
	top: 16px
	left: 24px
	height: 12px
	width: 12px
	border: $border-width-large solid var(--theme-bg)
	background-color: var(--theme-fg)
	border-radius: 50%
	pointer-events: none

	@media $media-xs
		left: 18px

.popper-wrapper .-community-card
	min-width: 300px

.-community-card
	position: relative
	display: flex
	background-color: $-bg-color-base
	padding: 8px

	@media $media-mobile
		flex-direction: column

	@media $media-xs
		elevate-xs()

	@media $media-sm-up
		elevate-1()

.-well
	flex: none
	display: flex
	align-items: flex-start
	min-width: 0

	@media $media-mobile
		padding-right: 32px

	.-details
		padding-right: 8px

	.-name
		font-weight: bold
		font-size: $font-size-large

.-thumbnail
	position: relative
	display: block
	margin-right: 8px
	width: $-thumbnail-size-sm
	height: $-thumbnail-size-sm
	z-index: 2
	flex: none

	&
	&-inner
		img-circle()

	&-inner
		overflow: hidden
		height: 100%
		background-color: var(--theme-bg-subtle)

	.-verified
		filter: drop-shadow(1px 1px $-bg-color-base) drop-shadow(-1px 1px $-bg-color-base) drop-shadow(1px -1px $-bg-color-base) drop-shadow(-1px -1px $-bg-color-base)
		position: absolute
		bottom: -($border-width-base)
		right: -($border-width-base)
		font-size: $jolticon-size

.-channel-info
	border-bottom: $border-width-base solid var(--theme-bg-subtle)
	padding-top: 12px
	margin-bottom: 14px

.-controls
	clear: both
	margin-top: $line-height-computed
	display: flex
	align-items: center

	.-spacer
		flex: auto

		@media $media-md-up
			flex: none

	&-item
		margin: 0 4px

	.button
		position: relative

		&:hover
			.-unread-blip
				border-color: var(--theme-bg-actual)
				background-color: var(--theme-bi-fg)

	@media $media-xs
		.-menu
			margin-right: 8px

			>>> .jolticon
				margin: 0

	&-primary
		flex: auto
		max-width: 240px

		@media $media-mobile
			margin-left: auto

	.-extra
		position: absolute
		top: 4px
		right: 0

	@media $media-md-up
		flex: auto
		margin-top: 0
		padding-left: 8px
		justify-content: flex-end

		&-primary
			order: 3

		.-extra
			order: 4
			position: static
</style>
