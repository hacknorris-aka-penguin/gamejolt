<script lang="ts" src="./add"></script>

<template>
	<app-theme
		v-app-tooltip.touchable="
			!community || community.is_member
				? null
				: $gettext(`Only members of this community can create a fireside in it.`)
		"
		:theme="theme"
		:class="{ '-disabled': isDisabled }"
	>
		<div class="-fireside-badge fill-darkest" @click="onClickBadge">
			<div class="-backdrop">
				<div ref="header" class="-header">
					<div class="-header-overlay" />
				</div>
			</div>

			<div class="-content">
				<h4 class="sans-margin -title">
					<small class="-subtitle">
						<translate>Stoke the flames</translate>
					</small>
					<br />
					<template v-if="isCommunity">
						<translate>Start a fireside in this community!</translate>
					</template>
					<template v-else>
						<translate>Start a fireside!</translate>
					</template>
				</h4>
			</div>
		</div>
	</app-theme>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-disabled
	cursor: not-allowed

	> *
		pointer-events: none
		filter: brightness(0.4)

.-backdrop
	// For some reason we need position static
	// so the backdrop can get the height.
	position: static

.-fireside-badge
	clearfix()
	full-bleed-xs()
	rounded-corners-lg()
	position: relative
	margin-bottom: $line-height-computed
	overflow: hidden
	padding: 10px 15px
	elevate-hover-2()
	cursor: pointer

	&:hover
		.-header
			background-size: 105% auto
			filter: blur(1px)

.-header
	position: absolute
	top: 0
	left: 0
	width: 100%
	height: 100%
	z-index: 0
	transition: background-size 250ms, filter 250ms
	change-bg('backlight')

	&-overlay
		width: 100%
		height: 100%
		background: rgba(0, 0, 0, 0.6)

.-content
	position: relative
	z-index: 1

.-title
	// Properly aligns it vertically.
	margin-top: -2px
	margin-bottom: 2px

.-subtitle
	color: var(--theme-fg)
</style>
