<script lang="ts" src="./incomplete"></script>

<template>
	<app-forms-community-pill-selector
		:communities="communities"
		:initial-community="community"
		@select="emitAdd"
	>
		<app-pill-bi class="-pill" no-hover>
			<app-community-thumbnail-img slot="img" :community="community" />

			<template slot="left">
				{{ community.name }}
				<app-community-verified-tick class="-tick" :community="community" small />
			</template>

			<span slot="right" class="-channel">
				<translate>Select Channel</translate>
			</span>
		</app-pill-bi>
	</app-forms-community-pill-selector>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '../variables.styl'

.-pill
	height: $pill-height
	border-color: var(--theme-notice)
	cursor: pointer
	transition: border-color 300ms $strong-ease-out

	.-channel
		color: var(--theme-notice)
		transition: color 300ms $strong-ease-out
		font-weight: bold

	&:hover
		border-color: var(--theme-link-hover)

		.-channel
			color: var(--theme-link-hover)

.-tick
	margin-left: 5px
</style>
