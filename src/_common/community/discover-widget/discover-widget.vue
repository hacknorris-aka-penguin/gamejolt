<script lang="ts" src="./discover-widget"></script>

<template>
	<router-link v-app-tooltip="tooltip" class="-discover" :to="{ name: 'discover.communities' }">
		<app-jolticon icon="search" />
	</router-link>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-discover
	pressy()
	display: flex
	justify-content: center
	align-items: center
	border: $border-width-large dashed
	border-color: var(--theme-fg-muted)
	color: var(--theme-fg-muted)
	border-radius: 100%
	cursor: pointer
	position: absolute
	width: 100%
	height: 100%
	outline: 0

	&:hover
		border-color: var(--theme-link)
		color: var(--theme-link)

.jolticon
	margin: 0 3px
	font-size: $jolticon-size * 1.5
</style>
