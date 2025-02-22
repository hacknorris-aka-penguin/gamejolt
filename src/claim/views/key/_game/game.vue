<script lang="ts" src="./game"></script>

<template>
	<div>
		<div class="game-cover">
			<app-media-item-cover
				v-if="game.header_media_item"
				:media-item="game.header_media_item"
			/>
		</div>

		<!-- If this game is in a bundle, show a back button. -->
		<template v-if="bundle">
			<br />
			<app-button
				block
				:to="{
					name: 'key',
					params: $route.params,
					query: {},
				}"
			>
				<translate>Back to Bundle</translate>
			</app-button>
		</template>

		<div class="text-center">
			<h1>{{ game.title }}</h1>
			<h4>
				<translate>by</translate>
				<a class="link-unstyled" :href="Environment.baseUrl + game.developer.url">
					{{ game.developer.display_name }}
				</a>
			</h4>
		</div>

		<div v-if="showingThanks" class="alert full-bleed full-bleed-xs">
			<p><strong>Thanks for buying the game!</strong></p>
			<p>
				We've emailed you your key's URL (this page) just so you can always find it. You are
				able to find your download(s) below. Any future updates to the game will be
				available here as well.
			</p>
			<p>~ Warm thanks from both {{ game.developer.display_name }} and the Game Jolt team.</p>
		</div>

		<template v-if="!bundle && !gameIsLocked">
			<div v-if="!app.user" class="alert full-bleed full-bleed-xs text-center">
				<p>
					<a :href="loginUrl">
						<translate>
							Sign in to Game Jolt to be able to claim this game into your Library.
						</translate>
					</a>
				</p>
			</div>
			<p v-else>
				<app-button primary block @click="claim">
					<translate>Claim Game into Library</translate>
				</app-button>
			</p>
		</template>

		<app-fade-collapse
			:collapse-height="isClaimOnly ? undefined : 400"
			:is-open="showingFullDescription"
			@require-change="canToggleDescription = $event"
			@expand="showingFullDescription = true"
		>
			<app-content-viewer :source="game.description_content" />
		</app-fade-collapse>

		<a
			v-if="canToggleDescription"
			class="hidden-text-expander"
			@click="showingFullDescription = !showingFullDescription"
		/>

		<template v-if="!isClaimOnly">
			<br v-if="customGameMessages.length" />

			<div
				v-for="msg of customGameMessages"
				class="alert full-bleed-xs"
				:class="{
					'alert-notice': msg.type === 'alert',
				}"
			>
				<app-jolticon icon="notice" />
				<span v-html="msg.message" />
			</div>

			<h2>
				<translate>Releases</translate>
			</h2>

			<div v-if="packagePayload && packagePayload.packages.length" class="packages-list">
				<app-game-package-card
					v-for="pkg of packagePayload.packages"
					:key="pkg.id"
					:game="game"
					:sellable="pkg._sellable"
					:package="pkg"
					:releases="pkg._releases"
					:builds="pkg._builds"
					:access-key="accessKey"
				/>
			</div>

			<div v-else class="alert alert-notice">
				<translate>No releases yet.</translate>
			</div>
		</template>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.game-cover
	margin-top: -($grid-gutter-width / 2)
	margin-right: -($grid-gutter-width-xs / 2)
	margin-left: -($grid-gutter-width-xs / 2)

	@media $media-sm-up
		margin-right: -($grid-gutter-width / 2)
		margin-left: -($grid-gutter-width / 2)

h1
	margin-top: $line-height-computed * 2
	margin-bottom: 0

h4
	theme-prop('color', 'fg-muted')
	margin-top: 0
	margin-bottom: $line-height-computed * 2
</style>
