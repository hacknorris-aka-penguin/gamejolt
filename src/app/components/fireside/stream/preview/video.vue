<script lang="ts" src="./video"></script>

<template>
	<app-fireside-container class="-stream theme-dark" :controller="c">
		<div v-if="focusedUser && shouldShowVideo" :key="focusedUser.uid">
			<app-fireside-stream-video class="-video-player" :rtc-user="focusedUser" />

			<div class="-overlay">
				<div v-if="showLive" class="-center">
					<div class="-live">
						<translate>LIVE</translate>
					</div>
				</div>
				<div v-if="showLiveUsers" class="-live-users">
					<app-user-avatar-list :users="rtcUsers" sm inline />
				</div>
			</div>
		</div>
		<div v-else />
	</app-fireside-container>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-stream
.-video-player
.-overlay
	position: absolute
	top: 0
	right: 0
	bottom: 0
	left: 0
	color: var(--theme-fg)

.-overlay
	z-index: 1
	background-color: rgba($black, 0.54)

.-center
	width: 100%
	height: 100%
	display: flex
	justify-content: center
	align-items: center

.-live
	rounded-corners-lg()
	margin: 0
	padding: 4px 8px
	font-size: $font-size-h1
	font-weight: 700
	font-family: $font-family-heading
	text-shadow: none
	box-shadow: 1px 1px 3px $black
	letter-spacing: 2px
	color: $white
	background-color: $gj-overlay-notice

.-live-users
	position: absolute
	right: 16px
	bottom: 0
</style>
