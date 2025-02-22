<script lang="ts" src="./post"></script>

<template>
	<app-form v-if="model" ref="form" name="postForm">
		<!-- Attachments -->
		<div v-if="!enabledAttachments" class="-attachment-controls">
			<app-button
				trans
				:primary="enabledImages"
				:solid="enabledImages"
				icon="screenshot"
				@click="enableImages()"
			>
				<translate>Images/GIFs</translate>
			</app-button>

			<app-button
				trans
				:primary="enabledVideo"
				:solid="enabledVideo"
				icon="video"
				@click="enableVideo()"
			>
				<translate>Video</translate>
			</app-button>
		</div>
		<div v-else class="well fill-offset full-bleed">
			<!-- Images -->
			<fieldset v-if="enabledImages">
				<app-form-legend compact deletable @delete="disableAttachments()">
					<translate>Select images</translate>
				</app-form-legend>

				<app-form-post-media
					:media-items="formModel.media"
					:post="formModel"
					:max-filesize="maxFilesize"
					:max-width="maxWidth"
					:max-height="maxHeight"
					:loading="isUploadingPastedImage"
					@upload="onMediaUploaded($event)"
					@error="onMediaUploadFailed($event)"
					@remove="removeMediaItem($event)"
					@sort="onMediaSort($event)"
				/>
			</fieldset>

			<!-- Video -->
			<app-form-post-video
				v-else-if="enabledVideo"
				:post="formModel"
				:was-published="wasPublished"
				@delete="onDisableVideoAttachment"
				@video-change="onVideoChanged"
				@video-status-change="onUploadingVideoStatusChanged"
				@video-provider-change="onVideoProviderChanged"
			/>
		</div>

		<!-- Post title (short) -->
		<app-form-group
			name="lead_content"
			class="-lead-form-group"
			:label="!longEnabled ? $gettext(`Post`) : $gettext(`Summary`)"
			hide-label
		>
			<app-form-control-content
				content-context="fireside-post-lead"
				autofocus
				:placeholder="
					!longEnabled
						? $gettext(`What's new?`)
						: $gettext(`Write a summary for your article...`)
				"
				:model-id="model.id"
				:min-height="72"
				:rules="{
					content_required: true,
					max_content_length: [leadLengthLimit],
				}"
				:validate-on="['blur']"
				@paste.native="onPaste"
			/>

			<div class="-hp">
				<div class="-hp-label">HP</div>
				<div class="-hp-bar">
					<app-progress-bar thin :percent="leadLengthPercent" :animate="false" />
				</div>
				<div v-if="leadLengthPercent <= 10" class="-hp-count">
					{{ leadLengthLimit - formModel.leadLength }}
				</div>
			</div>

			<app-form-control-errors />
		</app-form-group>

		<!-- Post body (long) -->
		<div v-if="longEnabled" class="well fill-offset full-bleed">
			<fieldset>
				<app-form-legend compact deletable @delete="toggleLong()">
					<translate>Article content</translate>
				</app-form-legend>

				<app-form-group
					name="article_content"
					:label="$gettext(`Article Content`)"
					hide-label
					optional
				>
					<app-form-control-content
						:placeholder="$gettext(`Write your article here...`)"
						content-context="fireside-post-article"
						:model-id="model.id"
						:rules="{
							content_no_media_uploads: true,
							max_content_length: [articleLengthLimit],
						}"
						:max-height="0"
					/>

					<app-form-control-errors />
				</app-form-group>
			</fieldset>
		</div>

		<!-- Poll -->
		<div v-if="hasPoll" class="well fill-offset full-bleed">
			<fieldset>
				<app-form-legend compact :deletable="isPollEditable" @delete="removePoll()">
					<translate>Set up poll</translate>
				</app-form-legend>

				<!-- i starts from 1 -->
				<div v-for="i of formModel.poll_item_count" :key="i" class="-poll-option">
					<app-form-group :name="'poll_item' + i" :label="$gettext(`choice`)" hide-label>
						<app-form-control
							type="text"
							:rules="{
								max: 64,
							}"
							:placeholder="$gettextInterpolate('Choice %{ num }', { num: i })"
							:disabled="!isPollEditable"
						/>

						<app-form-control-errors />
					</app-form-group>

					<!-- Can't have less than 2 poll items -->
					<a
						v-if="formModel.poll_item_count > 2 && isPollEditable"
						class="-poll-option-remove link-muted"
						@click="removePollItem(i)"
					>
						<app-jolticon icon="remove" />
					</a>
				</div>

				<div>
					<a
						v-if="isPollEditable && formModel.poll_item_count < MAX_POLL_ITEMS"
						@click="addPollItem()"
					>
						+
						<translate>Add choice</translate>
					</a>
				</div>
			</fieldset>

			<br />

			<fieldset class="-poll-duration">
				<app-form-legend compact>
					<translate>Duration</translate>
				</app-form-legend>

				<div class="row">
					<div class="col-xs-4">
						<app-form-group name="poll_days" :label="$gettext('Days')">
							<app-form-control
								type="number"
								step="1"
								min="0"
								max="14"
								:disabled="!isPollEditable"
								:rules="{
									min_value: 0,
									max_value: 14,
								}"
							/>
						</app-form-group>
					</div>

					<div class="col-xs-4">
						<app-form-group name="poll_hours" :label="$gettext('Hours')">
							<app-form-control
								type="number"
								step="1"
								min="0"
								max="23"
								:disabled="!isPollEditable"
								:rules="{
									min_value: 0,
									max_value: 23,
								}"
							/>
						</app-form-group>
					</div>

					<div class="col-xs-4">
						<app-form-group name="poll_minutes" :label="$gettext('Minutes')">
							<app-form-control
								type="number"
								step="1"
								min="0"
								max="59"
								:disabled="!isPollEditable"
								:rules="{
									min_value: 0,
									max_value: 59,
								}"
							/>
						</app-form-group>
					</div>
				</div>

				<p v-if="pollDuration < MIN_POLL_DURATION" class="help-block error">
					<translate>
						Too short! Polls must be between 5 minutes and 14 days long.
					</translate>
				</p>
				<p v-else-if="pollDuration > MAX_POLL_DURATION" class="help-block error">
					<translate>
						Too long! Polls must be between 5 minutes and 14 days long.
					</translate>
				</p>
				<br v-else />
			</fieldset>

			<fieldset>
				<app-form-legend
					compact
					expandable
					:expanded="isShowingMorePollOptions"
					@click.native="isShowingMorePollOptions = !isShowingMorePollOptions"
				>
					<translate>More options</translate>
				</app-form-legend>

				<div v-show="isShowingMorePollOptions">
					<app-form-group name="poll_is_private" :label="$gettext(`Private results?`)">
						<app-form-control-toggle class="pull-right" />
						<p class="help-block sans-margin-top">
							<translate>
								The poll's results will be kept hidden if this is turned on.
							</translate>
						</p>
					</app-form-group>
				</div>
			</fieldset>
		</div>

		<!-- Scheduling -->
		<div v-if="!wasPublished && isScheduling && timezones" class="well fill-offset full-bleed">
			<fieldset>
				<app-form-legend compact deletable @delete="removeSchedule()">
					<translate>Schedule publishing of post</translate>
				</app-form-legend>

				<app-form-group name="scheduled_for_timezone" :label="$gettext(`Timezone`)">
					<p class="help-block">
						<translate>All time selection below will use this timezone.</translate>
					</p>

					<p class="help-block">
						<strong>
							<translate>
								Should auto-detect, but if it doesn't, choose your closest city.
							</translate>
						</strong>
					</p>

					<app-form-control-select>
						<optgroup
							v-for="(timezones, region) of timezones"
							:key="region"
							:label="region"
						>
							<option
								v-for="timezone of timezones"
								:key="timezone.i"
								:value="timezone.i"
							>
								{{ timezone.label }}
							</option>
						</optgroup>
					</app-form-control-select>

					<app-form-control-errors />
				</app-form-group>

				<app-form-group name="scheduled_for" :label="$gettext(`Date and time`)">
					<app-form-control-date
						:timezone-offset="scheduledTimezoneOffset"
						:rules="{
							min_date: now,
						}"
					/>
					<app-form-control-errors :label="$gettext(`scheduled for`)" />
				</app-form-group>
			</fieldset>
		</div>

		<!-- Access permissions -->
		<template v-if="accessPermissionsEnabled">
			<div v-if="!wasPublished" class="well fill-offset full-bleed">
				<fieldset>
					<app-form-legend compact deletable @delete="disableAccessPermissions()">
						<translate>Access permissions</translate>
					</app-form-legend>

					<app-form-group
						name="key_group_ids"
						:label="$gettext(`Access Permissions`)"
						hide-label
					>
						<div v-if="!keyGroups.length" class="alert">
							<translate>
								You can make this post available to only the users within a key
								group. For example, this is useful for sending news updates to
								testers. You can create a user key group through the "Keys/Access"
								page.
							</translate>
						</div>
						<div v-else>
							<p class="help-block">
								<translate>
									You can make this post available to only the users within a key
									group. For example, this is useful for sending news updates to
									testers. Only User-type key groups can be selected.
								</translate>
							</p>

							<div v-for="keyGroup of keyGroups" :key="keyGroup.id" class="checkbox">
								<label>
									<app-form-control-checkbox :value="keyGroup.id" />
									{{ keyGroup.name }}
								</label>
							</div>
						</div>
					</app-form-group>
				</fieldset>
			</div>
			<div v-else class="form-group well fill-offset full-bleed">
				<label class="control-label">
					<translate>Access Permissions</translate>
				</label>
				<div class="alert">
					<translate>
						The below key groups have access to this post. You can't edit who has access
						after posting since notifications have already gone out.
					</translate>
				</div>
				<div>
					<span v-for="keyGroup of model.key_groups" :key="keyGroup.id" class="tag">
						{{ keyGroup.name }}
					</span>
				</div>
			</div>
		</template>

		<!-- Other platforms -->
		<div v-if="isPublishingToPlatforms" class="well fill-offset full-bleed">
			<fieldset>
				<app-form-legend compact deletable @delete="removePublishingToPlatforms()">
					<translate>Publish your post to other platforms</translate>
				</app-form-legend>

				<div v-if="!linkedAccounts.length" class="alert">
					<translate>You can publish this post to other platforms!</translate>
					<translate v-if="!model.game">
						Set up your linked accounts in your user account.
					</translate>
					<translate v-else>
						Set up your linked accounts either in your game dashboard, or your user
						account.
					</translate>
				</div>
				<div v-else class="-linked-accounts">
					<app-form-group
						v-for="account of linkedAccounts"
						:key="account.id"
						:name="`linked_account_${account.id}`"
						:label="$gettext(`Linked Account`)"
						hide-label
					>
						<div class="-linked-account">
							<div class="-linked-account-icon">
								<app-jolticon
									v-app-tooltip="account.providerDisplayName"
									:icon="account.icon"
									big
								/>
							</div>

							<div class="-linked-account-label">
								{{ getLinkedAccountDisplayName(account) }}
							</div>

							<div class="-linked-account-toggle">
								<app-form-control-toggle
									@changed="changeLinkedAccount(account.id)"
								/>
							</div>
						</div>
					</app-form-group>
				</div>
			</fieldset>
		</div>

		<div v-if="hasPublishedToPlatforms" class="alert">
			<strong>
				<translate>This post has been published to other platforms.</translate>
			</strong>
			<translate>
				Any edits made to this post will not be reflected on those other platforms.
			</translate>
		</div>

		<template v-if="platformRestrictions.length">
			<div
				v-for="restriction of platformRestrictions"
				:key="restriction"
				class="alert alert-notice full-bleed anim-fade-in"
			>
				<strong>
					{{ restriction }}
				</strong>
			</div>
		</template>

		<!-- Communities -->
		<template v-if="isLoaded">
			<app-scroll-scroller v-if="shouldShowCommunities" class="-communities" horizontal thin>
				<transition-group class="-communities-list" tag="div">
					<app-forms-community-pill-incomplete
						v-if="incompleteDefaultCommunity"
						key="incomplete"
						class="-community-pill anim-fade-in-enlarge no-animate-leave"
						:communities="possibleCommunities"
						:community="incompleteDefaultCommunity"
						@add="attachIncompleteCommunity"
					/>

					<app-forms-community-pill
						v-for="{ community, channel } of attachedCommunities"
						:key="community.id"
						class="-community-pill anim-fade-in-enlarge no-animate-leave"
						:community="community"
						:channel="channel"
						:removable="!wasPublished"
						@remove="removeCommunity(community)"
					/>

					<template v-if="!wasPublished && canAddCommunity">
						<app-forms-community-pill-add
							key="add"
							v-app-scroll-when="scrollingKey"
							class="-community-pill anim-fade-in-enlarge no-animate-leave"
							:communities="possibleCommunities"
							@add="attachCommunity"
						/>
					</template>
				</transition-group>
			</app-scroll-scroller>
			<p v-else-if="!wasPublished" class="help-block">
				<translate>Join some communities to post to them.</translate>
				<span v-app-tooltip.touchable="$gettext(`Go to the explore page and find some!`)">
					<app-jolticon class="text-muted" icon="help-circle" />
				</span>
			</p>
		</template>
		<template v-else>
			<div class="-communities-list-placeholder">
				<div class="-community-pill-placeholder" />
			</div>
		</template>

		<div v-if="!wasPublished" class="-error-no-channel">
			<div class="-caret" :class="{ '-hide': !hasChannelError }" />
			<app-expand :when="hasChannelError">
				<div class="-error -earmark alert alert-notice">
					<translate> Choose a channel to post to. </translate>
				</div>
			</app-expand>
		</div>

		<!-- Author options -->
		<template v-if="shouldShowAuthorOptions">
			<fieldset>
				<!-- Post to profile -->
				<app-form-group
					v-if="user && user.id == model.user.id"
					name="post_to_user_profile"
					class="sans-margin-bottom"
					:label="$gettext(`Post to Profile`)"
				>
					<app-form-control-toggle class="pull-right" />
					<p class="help-block sans-margin-top">
						This will post to your profile as well as the game page.
					</p>
				</app-form-group>

				<!-- Post as game owner -->
				<app-form-group
					v-if="model.user.id != model.game.developer.id"
					name="as_game_owner"
					:label="$gettext(`Post as Game Owner`)"
				>
					<app-form-control-toggle class="pull-right" />
					<div
						v-if="formModel.as_game_owner"
						v-app-tooltip.touchable="
							model.game.developer.display_name +
							` (@${model.game.developer.username})`
						"
						class="-author-avatar pull-right"
					>
						<app-user-avatar-img :user="model.game.developer" />
					</div>
					<p class="help-block sans-margin-top">
						<translate
							:translate-params="{
								owner: `@${model.game.developer.username}`,
								author: `@${model.user.username}`,
							}"
						>
							This will show %{ owner } as the user that posted.
						</translate>
					</p>
				</app-form-group>
			</fieldset>
		</template>

		<!-- Controls -->
		<div class="-controls">
			<div class="-controls-attachments">
				<app-button
					v-if="!longEnabled"
					v-app-tooltip="$gettext(`Add Article`)"
					sparse
					trans
					circle
					icon="blog-article"
					@click="toggleLong()"
				/>

				<app-button
					v-if="!hasPoll"
					v-app-tooltip="$gettext(`Add Poll`)"
					sparse
					trans
					circle
					icon="pedestals-numbers"
					@click="createPoll()"
				/>

				<app-button
					v-if="!wasPublished && !isScheduling"
					v-app-tooltip="$gettext(`Schedule Post`)"
					sparse
					trans
					circle
					icon="calendar-grid"
					@click="addSchedule()"
				/>

				<app-button
					v-if="!accessPermissionsEnabled && !wasPublished && model.game"
					v-app-tooltip="$gettext(`Access Permissions`)"
					sparse
					trans
					circle
					icon="key-diagonal"
					@click="enableAccessPermissions()"
				/>

				<app-button
					v-if="!wasPublished && !isPublishingToPlatforms"
					v-app-tooltip="$gettext(`Publish to Other Platforms`)"
					sparse
					trans
					circle
					icon="share-airplane"
					@click="addPublishingToPlatforms()"
				/>
			</div>

			<div class="-controls-submit">
				<div class="-controls-submit-button">
					<app-form-button
						v-if="!wasPublished && !isScheduling"
						:disabled="!submitButtonsEnabled"
						:solid="false"
						:primary="false"
						trans
						:block="Screen.isXs"
						@before-submit="onDraftSubmit()"
					>
						<translate>Save Draft</translate>
					</app-form-button>
				</div>

				<div class="-controls-submit-button">
					<app-form-button
						:disabled="!submitButtonsEnabled"
						primary
						solid
						:block="Screen.isXs"
						@before-submit="onPublishSubmit()"
					>
						{{ mainActionText }}
					</app-form-button>
				</div>
			</div>
		</div>
	</app-form>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'
@import '../community/_pill/variables'

.form-group:last-child
	margin-bottom: 10px

.-attachment-controls
	margin-bottom: $line-height-computed

	@media $media-xs
		white-space: nowrap
		overflow-x: scroll
		overflow-y: hidden

.-upload-input
	display: none

.-lead-form-group
	margin-bottom: 10px

.-hp
	display: flex
	align-items: center
	margin-top: 5px

	&-label
		theme-prop('color', 'fg-muted')
		flex: none
		margin-right: 10px
		font-size: $font-size-small
		font-weight: bold

	&-bar
		flex: auto

		.progress
			margin-bottom: 0

	&-count
		theme-prop('color', 'notice')
		flex: none
		margin-left: 10px
		font-size: $font-size-small
		font-weight: bold

.-channels
	margin-top: 10px

.-channels
.-error
.-community-message
	margin-bottom: 10px

.-error-no-channel
	position: relative

	.alert
		padding: 10px !important

	.-caret
		caret(color: var(--theme-notice), direction: 'up', size: 5px)
		left: 15%
		transition: opacity 200ms

		&.-hide
			opacity: 0

.-poll-option
	display: flex

	.form-group
		flex-grow: 1
		margin-bottom: ($font-size-base / 2)

	&-remove
		width: 40px
		line-height: $input-height-base
		text-align: center

.-poll-duration
	.form-group
		margin-bottom: 0

.-linked-accounts
	.form-group
		margin-bottom: 0

.-linked-account
	display: flex
	align-items: center
	margin-top: 10px

	&-icon
		flex: none
		margin-right: 10px

	&-label
		flex: auto
		margin-right: 10px

	&-toggle
		flex: none

.-communities
	margin: 10px 0

	&-list
		white-space: nowrap
		display: flex
		align-items: center
		margin-bottom: 4px

		&-placeholder
			margin: 10px 0 14px

		.v-leave
			display: none
			position: absolute

.-community-pill
	flex-shrink: 0

	&-placeholder
		change-bg('bg-subtle')
		rounded-corners()
		width: 138px
		height: $pill-height

	// Need to apply to the button inside the pill add component too
	&
	>>> .button
		height: 28px
		margin-bottom: 0

.-author-avatar
	width: $input-height-base
	margin-right: 8px

@media $media-xs
	.-controls
		display: flex
		flex-direction: column

		&-attachments
			display: flex
			justify-content: center
			margin-bottom: $line-height-computed
			padding: 10px 0
			border-top: $border-width-base solid var(--theme-bg-subtle)
			border-bottom: $border-width-base solid var(--theme-bg-subtle)

			> :not(:first-child)
				margin-left: 10px

		&-submit
			display: flex

			&-button
				flex: 1 0
				margin-right: 10px
				margin-left: 10px

				&:first-of-type
					margin-left: 0

				&:last-of-type
					margin-right: 0

@media $media-sm-up
	.-controls
		display: flex
		flex-direction: row

		&-attachments
			flex: auto

		&-submit
			flex: none

			&-button
				display: inline-block
</style>
