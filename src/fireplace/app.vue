
<script lang="ts" src="./app"></script>

<template>
	<div class="-fs theme-dark">
		<app-theme />
		<div v-if="animationPost" class="-posts">
			<div :key="animationPost.id" class="-post" :class="{ '-transition': transitioning }">
				<app-home-fs-post
					:post="animationPost"
					:music-post="musicPost"
					:transitioning="transitioning"
				/>
			</div>
			<div
				v-if="nextAnimationPost"
				:key="nextAnimationPost.id"
				class="-post"
				:class="{ '-transition': transitioning }"
			>
				<app-home-fs-post
					:post="nextAnimationPost"
					:music-post="nextMusicPost"
					:transitioning="transitioning"
				/>
			</div>
		</div>

		<app-home-fs-post-meta
			v-if="animationPost && musicPost"
			class="-byline"
			:animation-post="transitioning ? nextAnimationPost : animationPost"
			:music-post="transitioning ? nextMusicPost : musicPost"
		/>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-fs
	position: absolute
	height: 100vh
	width: 100vw
	color: var(--theme-fg)
	background-color: var(--theme-bg)

.-posts
	position: absolute
	top: 0
	right: 0
	bottom: 0
	left: 0
	overflow: hidden
	z-index: 1

.-post
	position: relative
	width: 100vw
	height: 100vh
	transform: translateY(0)
	transition: transform 2s

.-transition
	transform: translateY(-100%)

.-byline
	position: absolute
	bottom: 0
	left: 0
	right: 0
	z-index: 1
</style>
