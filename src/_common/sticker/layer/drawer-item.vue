<script lang="ts" src="./drawer-item"></script>

<template>
	<div class="-item" draggable="false" @contextmenu.prevent>
		<div :class="{ '-peeled': isPeeled }">
			<img
				draggable="false"
				class="-img"
				:style="itemStyling"
				:src="sticker.img_url"
				@dragstart.prevent
			/>
		</div>

		<div v-if="currentStreak > 1" class="-pocket-left badge fill-dark">
			<div class="-rarity">x{{ currentStreak }}</div>
		</div>

		<div v-if="!hideCount" class="-pocket badge fill-dark">
			<div
				class="-rarity"
				:class="{
					'-rarity-uncommon': sticker.rarity === 1,
					'-rarity-rare': sticker.rarity === 2,
					'-rarity-epic': sticker.rarity === 3,
				}"
			>
				{{ count }}
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-item
	position: relative
	height: 64px
	width: 64px
	user-drag: none
	user-select: none
	touch-action: none

.-peeled
	filter: contrast(0)

.-pocket-left
	position: absolute
	top: 0
	left: 0
	pointer-events: none

.-pocket
	position: absolute
	bottom: 0
	right: 0
	pointer-events: none

.-rarity
	font-weight: bold

	&-uncommon
		color: #1bb804

	&-rare
		color: #18a5f2

	&-epic
		color: #ffbc56
</style>
