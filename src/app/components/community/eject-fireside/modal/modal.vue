<script lang="ts" src="./modal"></script>

<template>
	<app-modal>
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>
		<div class="modal-header">
			<h2 class="modal-title">
				<span v-translate="{ communityName: firesideCommunity.community.name }">
					Eject fireside from %{ communityName }?
				</span>
			</h2>
		</div>
		<div class="modal-body">
			<form-community-eject-fireside
				v-if="shouldShowForm"
				:community="firesideCommunity.community"
				@change="onChangeForm"
			/>

			<app-button primary icon="eject" @click="onEject">
				<translate>Eject</translate>
			</app-button>
		</div>
	</app-modal>
</template>

<style lang="stylus" scoped>
.-title
	font-weight: normal
</style>
