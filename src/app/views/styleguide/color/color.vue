<template>
	<section class="section" id="styleguide-colors">
		<h1 class="section-header">Colors</h1>

		<!-- use h3 and p -->
		<div v-for="palette of palettes" :key="palette.label">
			<h3>{{ palette.label }}</h3>
			<span class="-colors">
				<span
					v-for="color of palette.colors"
					v-app-tooltip.bottom="color"
					:key="color"
					:class="{
						'-color': true,
						[color]: true,
					}"
				></span>
			</span>
		</div>
	</section>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'

.-colors
	display: inline-block
	border-radius: 7px
	height: 32px
	overflow: hidden

	> span
		display: inline-block
		width: 32px
		height: 100%

// GJ Color Palette
.gj-green
	background-color: $gj-green

.gj-dark-green
	background-color: $gj-dark-green

.gj-pink
	background-color: $gj-pink

.gj-blue
	background-color: $gj-blue

//
// Shades of gray
.black
	background-color: $black

.gray-darkest
	background-color: $gray-darkest

.gray-darker
	background-color: $gray-darker

.gray-dark
	background-color: $gray-dark

.gray
	background-color: $gray

.gray-subtle
	background-color: $gray-subtle

.gray-light
	background-color: $gray-light

.gray-lighter
	background-color: $gray-lighter

.gray-lightest
	background-color: $gray-lightest

.white
	background-color: $white

//
// Theme shades of gray
.theme-black
	background-color: var(--theme-black)

.theme-darkest
	background-color: var(--theme-darkest)

.theme-darker
	background-color: var(--theme-darker)

.theme-dark
	background-color: var(--theme-dark)

.theme-gray
	background-color: var(--theme-gray)

.theme-gray-subtle
	background-color: var(--theme-gray-subtle)

.theme-light
	background-color: var(--theme-light)

.theme-lighter
	background-color: var(--theme-lighter)

.theme-lightest
	background-color: var(--theme-lightest)

.theme-white
	background-color: var(--theme-white)

//
// Theme base colors
.theme-highlight
	background-color: var(--theme-highlight)

.theme-highlight-fg
	background-color: var(--theme-highlight-fg)

.theme-backlight
	background-color: var(--theme-backlight)

.theme-notice
	background-color: var(--theme-notice)

.theme-notice-fg
	background-color: var(--theme-notice-fg)

//
// Theme background colors
.theme-bg
	background-color: var(--theme-bg)

.theme-bg-offset
	background-color: var(--theme-bg-offset)

.theme-bg-backdrop
	background-color: var(--theme-bg-backdrop)

.theme-bg-subtle
	background-color: var(--theme-bg-subtle)

//
// Text color
.theme-fg
	background-color: var(--theme-fg)

.theme-fg-muted
	background-color: var(--theme-fg-muted)

.theme-link
	background-color: var(--theme-link)

.theme-link-hover
	background-color: var(--theme-link-hover)

//
// Bi-color themes
.theme-bi-bg
	background-color: var(--theme-bi-bg)

.theme-bi-fg
	background-color: var(--theme-bi-fg)
</style>

<script lang="ts" src="./color"></script>
