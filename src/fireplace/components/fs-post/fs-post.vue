<script lang="ts" src="./fs-post"></script>

<template>
	<div class="-fs-post">
		<div class="-backdrop">
			<app-img-responsive class="-backdrop-img" :src="mediaItem.mediaserver_url" alt="" />
		</div>

		<app-video-player-shaka class="-music" :player="musicController" autoplay />

		<app-video-player-shaka v-if="video" class="-video" :player="videoController" autoplay />
		<app-video
			v-else
			class="-video"
			:player="videoController"
			should-play
			allow-degraded-autoplay
		/>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-backdrop
.-fs-post
.-backdrop-img
.-video
	position: absolute
	top: 0
	left: 0
	right: 0
	bottom: 0

.-backdrop-img
	object-fit: cover
	z-index: 1

.-video
	z-index: 2

	>>> video
		height: 100% !important
		width: 100% !important
		object-fit: cover

.-music
	visibility: hidden
</style>
