<script lang="ts" src="./scrubber"></script>

<template>
	<v-touch
		class="player-control"
		:pan-options="{ direction: 'horizontal', threshold: 0 }"
		@panstart="panStart"
		@panmove="pan"
		@panend="panEnd"
		@tap="tap"
		@touchmove.native="onTouchMove"
		@touchend.native="isDragging = false"
		@click.native.capture.prevent
	>
		<div ref="timebar" class="-timebar" :class="{ '-dragging': player.isScrubbing }">
			<div class="-timebar-handle" :style="{ right: filledRight }" />

			<div class="-timebar-unfilled">
				<div class="-timebar-buffered" :style="{ right: bufferedRight }" />
				<div class="-timebar-filled" :style="{ right: filledRight }" />
			</div>
		</div>
	</v-touch>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'
@import '../common'

// sync with the refresh rate for the time poller
$-right-timing = 250ms
$-transition-right = right $-right-timing linear
$-handle-transition-base = width 200ms, height 200ms, margin-top 200ms, margin-right 200ms

.player-control
	position: relative
	padding: 8px 12px

.-timebar
	position: relative

	&-unfilled
		background-color: rgba($white, 0.4)
		position: absolute
		width: 100%
		top: 50%
		margin-top: -2px
		height: 5px
		border-radius: @height
		overflow: hidden

	&-filled
		background-color: var(--theme-highlight)
		position: absolute
		top: 0
		left: 0
		bottom: 0
		right: 0
		transition: $-transition-right

	&-buffered
		background-color: rgba($white, 0.2)
		position: absolute
		top: 0
		left: 0
		bottom: 0
		right: 0

	&-handle
		position: absolute
		width: 13px
		height: @width
		top: 50%
		margin-top: -(@width / 2)
		margin-right: -(@width / 2)
		background-color: $white
		border-radius: 50%
		cursor: pointer
		transition: $-handle-transition-base, $-transition-right
		z-index: 11
		display: flex
		justify-content: center

.-dragging
	.-timebar
		&-handle
			change-bg('highlight')
			width: 17px
			height: @width
			margin-top: -(@width / 2)
			margin-right: -(@width / 2)
			transition: $-handle-transition-base

		&-filled
			transition: none
</style>
