<script lang="ts" src="./view"></script>

<template>
	<div>
		<section
			class="-banner"
			:style="{
				'background-image': `url('${require('./test.png')}')`,
			}"
		>
			<div class="-shade" />
			<div class="-overlay">
				<div class="container-xl">
					<h1 class="text-center">Game Dev</h1>
				</div>
			</div>
		</section>

		<section class="section">
			<div class="container-xl">
				<h2 class="section-header">Featured Community</h2>
				<app-game-community-badge :community="featuredCommunity" />
			</div>
		</section>

		<section class="section">
			<div class="container-xl">
				<h2 class="section-header">Hot Posts</h2>
				<div class="row">
					<div v-for="item of items" :key="item.id" class="col-xs-2">
						<app-post-card :post="item.action" with-user />
					</div>
				</div>
			</div>
		</section>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-banner
	position: relative
	height: 300px
	width: 100%
	background-repeat: no-repeat
	background-position: 50% 50%
	background-size: cover

	.-shade
		position: absolute
		top: 0
		right: 0
		bottom: 0
		left: 0
		z-index: 0
		background-image: linear-gradient(to bottom, rgba(black, 0%) 0, rgba(black, 50%) 75%)

	.-overlay
		position: absolute
		top: 0
		right: 0
		bottom: 24px
		left: 0
		z-index: 1
		display: flex
		align-items: flex-end

	.container-xl
		width: 100%

	h1
		margin: 0
		font-size: 40px
</style>
