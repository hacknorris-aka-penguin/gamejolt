<script lang="ts" src="./add-modal"></script>

<template>
	<app-modal>
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>
		<div class="modal-body">
			<p class="lead">
				<translate>
					Firesides are temporary pop-up rooms where you can chat and stream with your
					friends, followers, and communities!
				</translate>
			</p>

			<app-loading v-if="isLoading" centered />
			<form-fireside-add
				v-else
				:community="community"
				:default-title="defaultTitle"
				:communities="communities"
				@submit="onSubmit"
			/>
		</div>
	</app-modal>
</template>

<style lang="stylus" scoped></style>
