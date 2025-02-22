<script lang="ts" src="./overview"></script>

<template>
	<div class="route-game-overview">
		<!-- Media Bar -->
		<app-game-media-bar v-if="game.media_count" :media-items="mediaItems" />

		<section class="section section-thin fill-backdrop">
			<app-ad-widget
				v-if="shouldShowAds && !Screen.isMobile"
				class="-leaderboard-ad"
				size="leaderboard"
				placement="top"
			/>

			<app-page-container xl>
				<div slot="left">
					<app-discover-games-view-overview-statbar />

					<app-share-card
						class="-share-card"
						resource="game"
						:url="shareLink"
						bleed-padding
					/>

					<app-user-known-followers
						v-if="isOverviewLoaded"
						:users="knownFollowers"
						:count="knownFollowerCount"
					/>

					<app-game-community-badge v-if="game.community" :community="game.community" />
				</div>

				<div v-if="!Screen.isMobile && game.comments_enabled" slot="left-bottom">
					<div class="pull-right">
						<app-button trans @click="showComments()">
							<translate>View All</translate>
						</app-button>
					</div>

					<h4 class="section-header">
						<translate>Comments</translate>
						<small v-if="commentsCount > 0">({{ commentsCount | number }})</small>
					</h4>

					<app-comment-add-button
						v-if="shouldShowCommentAdd"
						:model="game"
						display-mode="comments"
					/>

					<app-comment-overview
						:comments="overviewComments"
						:model="game"
						display-mode="comments"
						@reload-comments="reloadPreviewComments"
					/>
				</div>

				<div slot="right">
					<app-ad-widget
						v-if="shouldShowAds && !Screen.isMobile"
						class="-recommended-ad"
						size="rectangle"
						placement="side"
					/>

					<template v-if="!Screen.isMobile">
						<h4 class="section-header">
							<translate>Recommended</translate>
						</h4>

						<app-discover-games-view-overview-recommended />
					</template>
				</div>

				<!--
					Convenience Messaging
					This needs to be a div instead of a template or vue 2.4.4 complains about a
					patched vnode not existing.
				-->
				<div v-if="customGameMessages.length">
					<div
						v-if="game.canceled"
						key="wip"
						v-translate
						class="alert alert-notice full-bleed-xs"
					>
						This game was canceled, so the current version might be buggy or incomplete.
						You can still follow it if you'd like to be notified in the case that
						development continues.
					</div>

					<div
						v-for="(msg, i) of customGameMessages"
						:key="i"
						class="alert full-bleed-xs"
						:class="{
							'alert-notice': msg.type === 'alert',
						}"
					>
						<app-jolticon icon="notice" />
						<span v-html="msg.message" />
					</div>

					<br class="hidden-xs" />
				</div>

				<!--
					Builds / Soundtrack
					This is a bit tricky. _has_packages doesn't yet take into account private packages.
					If the game has only private packages, this will still be set to true.
					We only use it to figure out if we should show the releases section while loading before
					we actually have the package data. Because of that, we only use it to figure out what to
					show while we're loading the section. After it's loaded in, we decide if it should show
					through the "hasReleasesSection" variable which has the correct data.
				-->
				<template v-if="(game._has_packages && !isOverviewLoaded) || hasReleasesSection">
					<div id="game-releases">
						<!--
							Partner Controls
						-->
						<app-card v-if="hasPartnerControls">
							<div class="card-content">
								<p>
									<translate tag="strong">
										This game is part of the Partner system!
									</translate>
									<translate>
										You can use this link for sharing the game.
									</translate>
								</p>
								<input class="form-control" :value="partnerLink" />
							</div>
							<div class="card-controls">
								<app-button primary @click="copyPartnerLink">
									<translate>Copy Partner Link</translate>
								</app-button>
								<app-button
									trans
									:to="{
										name: 'dash.analytics',
										params: { resource: 'Game', resourceId: game.id },
									}"
								>
									<translate>View Analytics</translate>
								</app-button>
							</div>
						</app-card>

						<div v-if="shouldShowMultiplePackagesMessage" class="alert alert-notice">
							<app-jolticon icon="notice" />
							<translate>
								There are multiple packages for your device. Please choose one
								below.
							</translate>
						</div>

						<app-lazy-placeholder :when="isOverviewLoaded">
							<div
								class="lazy-placeholder -package-placeholder"
								style="height: 135px"
							/>

							<div v-if="externalPackages.length">
								<app-game-external-package-card
									v-for="externalPackage of externalPackages"
									:key="`external-${externalPackage.id}`"
									:package="externalPackage"
								/>
							</div>

							<div v-if="packages.length">
								<app-game-package-card
									v-for="pkg of packages"
									:key="pkg.id"
									:game="game"
									:sellable="pkg._sellable"
									:package="pkg"
									:releases="pkg._releases"
									:builds="pkg._builds"
									:is-partner="!!userPartnerKey"
									:partner-key="partnerKey"
									:partner="partner"
								/>
							</div>

							<!--
								We want to key it by the game ID so that it
								resets completely when the page changes.
							-->
							<app-game-soundtrack-card
								v-if="songs.length"
								:key="game.id"
								:game="game"
								:songs="songs"
							/>
						</app-lazy-placeholder>
					</div>

					<app-discover-games-view-overview-supporters
						v-if="supporters.length > 0"
						:supporters="supporters"
						:supporter-count="supporterCount"
					/>
				</template>

				<div class="sheet sheet-elevate">
					<div v-if="!isOverviewLoaded">
						<span class="lazy-placeholder" />
						<span class="lazy-placeholder" />
						<span class="lazy-placeholder" />
						<span class="lazy-placeholder" style="width: 40%" />
					</div>
					<div v-else>
						<!--
							Set a :key to let vue know that it should update
							this when the game changes.
						-->
						<app-fade-collapse
							:key="game.description_content"
							:collapse-height="600"
							:is-open="showDetails || !postsCount"
							:animate="false"
							@require-change="setCanToggleDescription"
							@expand="toggleDetails()"
						>
							<app-content-viewer :source="game.description_content" />
						</app-fade-collapse>

						<div v-if="showDetails">
							<hr />
							<div class="row">
								<div class="col-sm-6">
									<app-discover-games-view-overview-details :game="game" />
								</div>
								<div class="col-sm-6">
									<app-lazy-placeholder :when="isOverviewLoaded">
										<div class="lazy-placeholder" style="height: 115px" />
										<app-game-ogrs :game="game" />
									</app-lazy-placeholder>
								</div>
							</div>
						</div>

						<div class="page-cut page-cut-no-margin">
							<app-button
								v-app-track-event="`game-profile:show-full-description`"
								trans
								@click="toggleDetails()"
							>
								<translate v-if="!showDetails">Show More</translate>
								<translate v-else>Less</translate>
							</app-button>
						</div>
					</div>
				</div>

				<app-post-add-button v-if="hasDevlogPerms" :game="game" @add="onPostAdded" />

				<app-activity-feed-placeholder v-if="!feed || !feed.isBootstrapped" />
				<template v-else>
					<app-activity-feed v-if="feed.hasItems" :feed="feed" />
					<div v-else class="alert">
						<translate>
							Nothing has been posted to this project page yet. Maybe check back
							later!
						</translate>
					</div>
				</template>
			</app-page-container>
		</section>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-leaderboard-ad
	padding-bottom: 8px
	margin-bottom: $line-height-computed
	border-bottom: $border-width-small solid var(--theme-bg-subtle)

.-recommended-ad
	width: 300px
	margin-bottom: $line-height-computed

.-package-placeholder
	margin-bottom: $line-height-computed
</style>
