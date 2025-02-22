<script lang="ts" src="./profile"></script>

<template>
	<app-form name="profileForm">
		<app-form-group name="theme" :label="$gettext(`Color Theme`)">
			<app-form-control-theme class="pull-right" @changed="onThemeChanged()" />
			<p class="help-block">
				<translate>
					Setting a theme will change how Game Jolt looks for you. When other people view
					your profile, they'll also be switched to your theme.
				</translate>
			</p>
		</app-form-group>

		<app-form-group
			v-if="!usernameTimeLeft"
			name="username"
			:label="$gettext(`dash.profile.edit.username_label`)"
		>
			<app-form-control
				type="text"
				:rules="{
					min: 3,
					max: 30,
					pattern: 'username',
					availability: {
						url: '/web/dash/profile/check-field-availability/username',
						initVal: model.username,
					},
				}"
				:validate-on="['blur']"
			/>

			<app-form-control-errors />

			<p class="help-block">
				<translate>Profile URL</translate>
				<code>
					{{ Environment.baseUrl }}/@
					<strong>{{ formModel.username || '_' }}</strong>
				</code>
			</p>

			<app-expand :when="formModel.username !== model.username">
				<div class="alert">
					<translate>
						Changing your username will change your public profile URL. Any current
						links to your old profile URL will not automatically redirect to your new
						profile URL.
					</translate>
				</div>
			</app-expand>
		</app-form-group>

		<div class="form-group" v-else>
			<label class="control-label">
				<translate>dash.profile.edit.username_label</translate>
			</label>
			<p class="form-control-static">{{ formModel.username }}</p>
			<p class="help-block">
				<translate>You can only change your username once a week.</translate>
				<br />
				<translate :translate-params="{ duration: usernameDuration }">
					You have %{ duration } left until you can change it again.
				</translate>
			</p>
		</div>

		<app-form-group
			name="name"
			:label="$gettext(`dash.profile.edit.display_name_label`)"
			:optional="true"
		>
			<app-form-control
				type="text"
				:rules="{
					max: 100,
					availability: {
						url: '/web/dash/profile/check-field-availability/name',
						initVal: model.name,
					},
				}"
				:validate-on="['blur']"
			/>

			<app-form-control-errors />

			<p class="help-block">
				<translate>
					Your display name is an optional personal identifier (such as a company name or
					real name). Unlike usernames, display names can contain spaces and special
					characters.
				</translate>
			</p>
		</app-form-group>

		<app-form-group
			name="web_site"
			:label="$gettext(`dash.profile.edit.website_label`)"
			:optional="true"
		>
			<app-form-control
				type="url"
				:rules="{
					max: 250,
				}"
			/>
			<app-form-control-errors />
		</app-form-group>

		<app-form-group
			name="bio_content"
			:label="$gettext(`dash.profile.edit.description_label`)"
			:optional="true"
		>
			<app-form-control-content
				content-context="user-bio"
				:disabled="isBioLocked"
				:model-id="model.id"
				:max-height="0"
				:rules="{
					max_content_length: [bioLengthLimit],
				}"
			/>

			<app-form-control-errors />

			<div v-if="isBioLocked" class="control-errors">
				<p class="help-block error">
					<translate>You cannot edit your bio. It's been flagged as spam.</translate>
				</p>
			</div>
		</app-form-group>

		<app-form-group name="shouts_enabled" :label="$gettext(`Allow shouts?`)">
			<app-form-control-toggle class="pull-right" />

			<p class="help-block">
				<translate>
					Will let people post short comments on your profile page. Turning this off will
					hide any shouts already on the page.
				</translate>
			</p>
		</app-form-group>

		<app-form-group name="friend_requests_enabled" :label="$gettext(`Allow friend requests?`)">
			<app-form-control-toggle class="pull-right" />

			<p class="help-block">
				<translate>
					Allows people to send you friend requests. Friends can use the private chat
					feature to send messages to each other. With this feature turned off, you will
					still be able to send friend requests to other users.
				</translate>
			</p>
		</app-form-group>

		<app-form-group name="liked_posts_enabled" :label="$gettext(`Show your liked posts?`)">
			<app-form-control-toggle class="pull-right" />

			<p class="help-block">
				<translate>Will publicly show the posts you've liked on your profile.</translate>
			</p>
		</app-form-group>

		<app-form-group name="mentions_setting" :label="$gettext(`Who can mention you?`)">
			<app-form-control-select>
				<option
					v-for="mentionSettingOption of mentionsSettingOptions"
					:key="mentionSettingOption.value"
					:value="mentionSettingOption.value"
				>
					{{ mentionSettingOption.text }}
				</option>
			</app-form-control-select>

			<p class="help-block">
				<translate>
					Select which users you will receive mention notifications from. "People you
					know" are users you follow or are friends with.
				</translate>
			</p>
		</app-form-group>

		<app-form-button>
			<translate>dash.profile.edit.submit_button</translate>
		</app-form-button>
	</app-form>
</template>
