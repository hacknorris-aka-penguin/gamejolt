<script lang="ts" src="./manage"></script>

<template>
	<div class="-options-wrap">
		<div
			v-app-tooltip="$gettext('Invite to Stream / Voice Chat')"
			class="-options"
			@click="openManageModal"
		>
			<app-jolticon class="-icon" icon="add" />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '../../common'
</style>
