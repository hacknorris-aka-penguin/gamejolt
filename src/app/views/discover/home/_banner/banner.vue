<script lang="ts" src="./banner"></script>

<template>
	<div v-if="!item || isLoading" class="-placeholder" />
	<app-theme v-else :theme="theme" force-dark>
		<app-media-item-backdrop class="-backdrop" :media-item="bannerMediaItem">
			<section
				class="-banner landing-header-no-fill"
				:style="{
					'background-image': `url('${item.back_url}')`,
				}"
			>
				<router-link
					v-if="location"
					v-app-track-event="`home:banner:${item.id}`"
					class="-click"
					:to="location"
				/>
				<a
					v-else-if="item.custom_url"
					v-app-track-event="`home:banner:${item.id}`"
					class="-click"
					:href="item.custom_url"
				/>

				<div class="container">
					<div class="-main">
						<div v-if="item.front_url" class="-logo">
							<img
								class="-img"
								style="display: inline-block"
								:src="item.front_url"
								alt=""
							/>
						</div>

						<div
							class="-info"
							:class="{
								'-info-full': !item.front_url,
							}"
						>
							<p class="lead">
								{{ item.content }}
							</p>

							<div class="-controls">
								<template v-if="item.game">
									<app-button
										v-if="item.custom_url"
										v-app-track-event="`home:banner:custom-${item.game.id}`"
										solid
										:href="item.custom_url"
										target="_blank"
									>
										{{ item.custom_text }}
									</app-button>

									<app-button
										v-if="shouldShowViewGame"
										v-app-track-event="`home:banner:${item.game.id}`"
										solid
										:to="location"
									>
										<translate>View Game</translate>
									</app-button>

									<app-game-follow-widget
										v-if="shouldShowFollowGame"
										v-app-track-event="`home:banner:follow-${item.game.id}`"
										:game="item.game"
										solid
										primary
										location="homeBanner"
									/>
								</template>
								<template v-else-if="item.community">
									<app-button
										v-if="item.custom_url"
										v-app-track-event="
											`home:banner:custom-community-${item.community.path}`
										"
										solid
										:href="item.custom_url"
										target="_blank"
									>
										{{ item.custom_text }}
									</app-button>

									<app-button
										v-if="shouldShowViewCommunity"
										v-app-track-event="
											`home:banner:community-${item.community.path}`
										"
										solid
										:to="location"
									>
										<translate>View Community</translate>
									</app-button>

									<app-community-join-widget
										v-if="shouldShowJoinCommunity"
										:community="item.community"
										solid
										primary
										location="homeBanner"
									/>
								</template>
								<template v-else-if="item.jam">
									<app-button
										v-if="shouldShowJamViewGames"
										v-app-track-event="`home:banner:${item.jam.id}`"
										primary
										solid
										:to="location"
									>
										<translate>View Games</translate>
									</app-button>
									<app-button
										v-app-track-event="`home:banne:jam-${item.jam.id}`"
										solid
										:href="item.jam.fullUrl"
										target="_blank"
									>
										<translate>View Jam Page</translate>
									</app-button>
								</template>
								<template v-else-if="item.custom_url">
									<app-button
										v-app-track-event="`home:banner:custom`"
										solid
										:href="item.custom_url"
										target="_blank"
									>
										{{ item.custom_text }}
									</app-button>
								</template>
							</div>
						</div>
					</div>
				</div>
			</section>
		</app-media-item-backdrop>
	</app-theme>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

-gutter()
	padding-left: ($grid-gutter-width-xs / 2)
	padding-right: ($grid-gutter-width-xs / 2)

	@media $media-sm-up
		padding-left: ($grid-gutter-width / 2)
		padding-right: ($grid-gutter-width / 2)

.-backdrop
.-banner
.-placeholder
	height: 450px

.-placeholder
	change-bg('bg-subtle')

.-backdrop
	change-bg('bg-offset')

.-banner
	position: relative
	width: 100%
	background-repeat: no-repeat
	background-position: 50% 50%
	background-size: cover

.-click
	position: absolute
	top: 0
	right: 0
	bottom: 0
	left: 0
	z-index: 1

.container
	height: 100%

.-main
	position: relative
	display: flex
	height: 100%
	flex-direction: column
	justify-content: space-evenly
	margin-left: -($grid-gutter-width-xs / 2)
	margin-right: -($grid-gutter-width-xs / 2)

	@media $media-sm-up
		flex-direction: row
		align-items: center
		justify-content: center
		margin-left: -($grid-gutter-width / 2)
		margin-right: -($grid-gutter-width / 2)

.-logo
	-gutter()
	display: flex
	align-items: center
	justify-content: center

	.-img
		max-width: 100%

	@media $media-xs
		height: 200px

	@media $media-sm-up
		width: 60%

.-info
	-gutter()
	text-align: center

	@media $media-sm-up
		width: 40%
		text-align: left

	&-full
		width: 100%
		max-width: 500px
		text-align: center

.-controls
	position: relative
	// Put this over the click.
	z-index: 2
</style>
