<script lang="ts" src="./recommendations"></script>

<template>
	<div class="post-page-recommendations">
		<h4>
			<translate>Next up</translate>
		</h4>
		<component
			:is="shouldScroll ? 'app-scroll-scroller' : 'div'"
			:class="{ '-scrollable': shouldScroll }"
			:horizontal="shouldScroll"
			:thin="shouldScroll"
		>
			<div class="-posts">
				<template v-if="!usablePosts.length">
					<template v-for="i of 4">
						<div :key="i" class="-post">
							<app-post-card-placeholder />
						</div>

						<div
							v-if="shouldScroll"
							:key="'spacer-' + i"
							:class="{
								'-spacer': i < usablePosts.length,
								'-spacer-large': i === usablePosts.length,
							}"
						/>
					</template>
				</template>
				<template v-else>
					<template v-for="(recommendedPost, i) of usablePosts">
						<div :key="recommendedPost.id" class="-post">
							<app-post-card
								:post="recommendedPost"
								with-user
								source="postRecommendation"
							/>
						</div>

						<div
							v-if="shouldScroll"
							:key="'spacer-' + i"
							:class="{
								'-spacer': i + 1 < usablePosts.length,
								'-spacer-large': i + 1 === usablePosts.length,
							}"
						/>
					</template>
				</template>
			</div>
		</component>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

$-grid-gap = 16px

.post-page-recommendations
	@media $media-lg-up
		margin-left: 50px

	.-posts
		display: grid

		@media $media-sm
			grid-template-columns: repeat(4, 1fr)
			grid-gap: $-grid-gap

		@media $media-md-up
			grid-template-columns: 'repeat(auto-fill, minmax(calc(max(50% - %s, 110px)), 1fr))' % $-grid-gap
			grid-gap: $-grid-gap

.-scrollable
	@media $media-xs
		full-bleed-xs()
		padding-left: $grid-gutter-width-xs * 0.5
		padding-right: @padding-left

	@media $media-sm-up
		margin-left: -($grid-gutter-width)
		margin-right: @margin-left
		padding-left: $grid-gutter-width
		padding-right: @padding-left

	.-posts
		display: flex
		padding-bottom: 8px
		grid-gap: 0

		.-post
			min-width: 'calc(min(40vw - %s, 60vh * (10 / 16)))' % $-grid-gap

.-spacer
	flex: none
	width: $-grid-gap

	&-large
		flex: none

		@media $media-xs
			width: $grid-gutter-width-xs * 0.5

		@media $media-sm-up
			width: $grid-gutter-width
</style>
