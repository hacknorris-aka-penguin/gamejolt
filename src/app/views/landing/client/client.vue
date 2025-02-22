<script lang="ts" src="./client"></script>

<template>
	<div class="route-landing-client">
		<section class="section landing-header text-center">
			<div class="container">
				<div class="row">
					<div class="col-lg-6 col-centered">
						<h1>
							<app-theme-svg class="bolt" src="~img/jolt.svg" alt="" strict-colors />
							Desktop App
						</h1>
						<p class="lead">
							Stay up to date with your favorite gaming communities and content
							creators
						</p>
					</div>
				</div>
				<br />

				<div class="row">
					<div class="col-lg-6 col-centered">
						<div>
							<template v-if="isDetectedPlatformIncompatible">
								<p v-if="platform === 'other'">
									We could not detect what platform you are on.
									<br />
									Download the correct version below:
								</p>
								<template v-else>
									<p>
										We detected you are running on
										<strong>{{ detectedPlatformDisplay }} {{ arch }}bit</strong>
										<br />
										Oof! looks like the desktop app is incompatible with it.
									</p>

									<p>Did we get it wrong? Download the correct version below:</p>
								</template>
							</template>
						</div>

						<br />
					</div>
				</div>

				<div class="row">
					<div class="header-download-buttons">
						<app-button
							v-if="shouldOfferWindows"
							primary
							lg
							@click="download(platform, '32')"
						>
							<app-jolticon icon="download" />
							Download for Windows
						</app-button>

						<app-button
							v-if="shouldOfferMac"
							primary
							lg
							@click="download(platform, '64')"
						>
							<app-jolticon icon="download" />
							Download for OS X
						</app-button>

						<app-button
							v-if="shouldOfferLinux"
							primary
							lg
							@click="download(platform, arch)"
						>
							<app-jolticon icon="download" />
							Download for Linux 64bit
						</app-button>
					</div>
				</div>

				<!--
					If we did detect a valid platform, we offer only the matching version
					in the header. In case we got it wrong, we want to offer alternatives.
				-->
				<div v-if="!isDetectedPlatformIncompatible">
					<br />
					or download for
					<a v-app-scroll-to href="#all-downloads">other platforms</a>
				</div>
			</div>
		</section>

		<div class="fill-darker">
			<section class="client-presentation">
				<div v-if="showMascot" class="container">
					<img
						class="client-presentation-mascot"
						src="./clyde-video-overlay.png"
						width="178"
						height="130"
						alt="Clyde Slicker"
					/>
				</div>
				<div class="client-presentation-inner">
					<div class="container text-center">
						<img
							class="img-responsive"
							width="1300"
							height="893"
							src="./client-presentation.jpg"
							alt="Game Jolt Client"
						/>
					</div>
				</div>
			</section>

			<section id="all-downloads" class="download-footer">
				<div class="container text-center">
					<div class="row">
						<div class="col-lg-9 col-centered">
							<div class="row">
								<div class="download-footer-col col-sm-4">
									<p><app-jolticon icon="linux" class="jolticon-4x" /></p>
									<p>
										<app-button
											v-app-track-event="`client-landing:download:linux`"
											primary
											block
											@click="download('linux', '64')"
										>
											<app-jolticon icon="download" />
											Download Linux 64bit
										</app-button>
									</p>
								</div>
								<div class="download-footer-col col-sm-4">
									<p><app-jolticon icon="mac" class="jolticon-4x" /></p>
									<p>
										<app-button
											v-app-track-event="`client-landing:download:mac`"
											primary
											block
											@click="download('mac', '64')"
										>
											<app-jolticon icon="download" />
											Download Mac
										</app-button>
									</p>
								</div>
								<div class="download-footer-col col-sm-4">
									<p><app-jolticon icon="windows" class="jolticon-4x" /></p>
									<p>
										<app-button
											v-app-track-event="`client-landing:download:win`"
											primary
											block
											@click="download('windows', '32')"
										>
											<app-jolticon icon="download" />
											Download Windows
										</app-button>
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.route-landing-client
	overflow-x: hidden
	overflow-y: hidden

	.header-download-buttons
		display: flex
		justify-content: center
		flex-direction: column
		margin: 0 auto
		max-width: 370px

		@media $media-md-up
			max-width: 100%
			flex-direction: row

		> *
			display: block
			margin: 5px 10px

			@media $media-md-up
				margin: 0 10px

	section.client-presentation
		position: relative

		.container
			position: relative

	.client-presentation-mascot
		display: block
		position: absolute
		top: 20px
		right: 40px
		margin-top: -(130px)
		z-index: 2

	.client-presentation-inner
		position: relative
		overflow: hidden

		&::before
			change-bg('dark')
			content: ''
			display: block
			position: absolute
			top: 0
			left: -30%
			width: 160%
			height: 400px
			z-index: 0
			transform: rotate(-8deg)

		.container
			z-index: 1

		img
			theme-prop('border-color', 'gray')
			margin-top: 20px
			border-width: $border-width-large
			border-style: solid
			rounded-corners-lg()

	section.download-footer
		margin-top: 150px
		margin-bottom: 90px
		position: relative
		z-index: 1

		&
		h5
			color: $white

		&::before
			change-bg('darkest')
			content: ''
			display: block
			position: absolute
			top: -80px
			bottom: -80px
			left: -30%
			width: 160%
			z-index: 0
			transform: rotate(8deg)

		.container
			position: relative
			z-index: 1

	@media $media-xs
		.download-footer-col
			margin-bottom: $grid-gutter-width

			&:last-child
				margin-bottom: 0
</style>
