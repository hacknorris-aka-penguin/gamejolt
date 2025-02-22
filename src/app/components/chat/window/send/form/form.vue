<script lang="ts" src="./form"></script>

<template>
	<app-form ref="form" name="chat-send-form">
		<app-shortkey shortkey="tab" @press="onTabKeyPressed" />

		<div class="-top-indicators">
			<span v-if="Screen.isXs && !!typingText" class="-typing">
				{{ typingText }}
			</span>
		</div>

		<div v-if="isEditing" class="-editing-message">
			<app-jolticon icon="edit" />
			<translate>Editing Message</translate>
			<a class="-editing-message-cancel" @click="cancelEditing">
				<translate>Cancel</translate>
			</a>
		</div>

		<app-form-group
			name="content"
			hide-label
			class="-form"
			:class="{
				'-form-shifted': shouldShiftEditor,
				'-editing': isEditing,
			}"
		>
			<div class="-input">
				<app-form-control-content
					ref="editor"
					:content-context="room.messagesContentContext"
					:temp-resource-context-data="contentEditorTempResourceContextData"
					:placeholder="placeholder"
					:single-line-mode="singleLineMode"
					:rules="{
						max_content_length: maxContentLength,
					}"
					:max-height="160"
					:display-rules="displayRules"
					:compact="Screen.isXs"
					:autofocus="!Screen.isMobile"
					:model-id="editorModelId"
					focus-end
					@submit="onSubmit"
					@insert-block-node="onEditorInsertBlockNode"
					@focus="onFocusEditor"
					@blur="onBlurEditor"
					@keydown.native.up="onUpKeyPressed($event)"
					@changed="onChange($event)"
				/>

				<app-form-control-errors label="message" />
			</div>

			<app-button
				v-app-tooltip="isEditing ? $gettext(`Edit message`) : $gettext(`Send message`)"
				:disabled="isSendButtonDisabled"
				class="-send-button"
				sparse
				:icon="isEditing ? 'check' : 'share-airplane'"
				:primary="hasContent"
				:trans="!hasContent"
				:solid="hasContent"
				@click="onSubmit"
			/>
		</app-form-group>

		<div v-if="!Screen.isXs" class="-bottom-indicators anim-fade-in no-animate-leave">
			<transition name="fade">
				<span v-if="!Screen.isXs && !!typingText" class="-typing">
					{{ typingText }}
				</span>
			</transition>

			<span v-if="showMultiLineNotice" class="-multi-line">
				<app-jolticon icon="notice" />
				<span v-if="isMac" v-translate>
					You are in multi-line editing mode. Press
					<code>cmd+enter</code>
					to send.
				</span>
				<span v-else v-translate>
					You are in multi-line editing mode. Press
					<code>ctrl+enter</code>
					to send.
				</span>
			</span>
		</div>
	</app-form>
</template>

<style lang="stylus" scoped>
@import '../../variables'
@import '~styles/variables'
@import '~styles-lib/mixins'

$-button-height = 48px
$-button-width = 40px
$-button-margin = 4px
$-button-spacing = $-button-width + ($-button-margin * 3)
$-button-spacing-xs = $-button-height

.-form
	display: flex
	position: relative
	margin-bottom: 0

	@media $media-xs
		margin-top: 4px
		border-top: $border-width-base solid var(--theme-bg-subtle)
		padding-top: 1px

	@media $media-sm-up
		margin-top: 8px

	&-shifted
		margin-bottom: 52px

	&.-editing
		margin-top: 0
		padding-top: 1px
		border-top: none

.-bottom-indicators
.-editing-message
	height: 28px
	color: var(--theme-light)
	padding: 4px 0

.-top-indicators
.-bottom-indicators
	display: flex

.-top-indicators
	padding: 4px 4px 0 4px
	color: var(--theme-light)

.-bottom-indicators
	align-items: center
	margin-left: $left-gutter-size + $avatar-size
	margin-right: $-button-spacing

.-typing
.-multi-line
	&
	.jolticon
		font-size: $font-size-tiny

.-typing
	text-overflow()
	margin-right: auto
	transition-property: opacity
	transition-duration: 500ms
	transition-timing-function: $strong-ease-out

	@media $media-sm-up
		padding-right: 24px

	&.fade-leave-active
		transition-duration: 250ms

	&.fade-enter
	&.fade-leave-to
		opacity: 0

.-multi-line
	flex: none
	margin-left: auto

.-editing-message
	position: relative

	@media $media-xs
		padding-left: 4px
		border-top: $border-width-base solid var(--theme-bg-subtle)

	@media $media-sm-up
		margin-left: $left-gutter-size + $avatar-size
		margin-right: $-button-spacing

	&-cancel
		position: absolute
		right: 0

		@media $media-xs
			right: $-button-spacing-xs + 4px

.-input
	width: 'calc(100% - %s)' % $-button-spacing-xs

	@media $media-sm-up
		margin-left: $left-gutter-size + $avatar-size
		width: 'calc(100% - %s)' % ($left-gutter-size + $avatar-size + $-button-spacing)

.-send-button
	display: flex
	align-items: center
	justify-content: center
	height: $-button-height
	margin: 0
	flex: none
	align-self: flex-end
	transition: color 0.3s, background-color 0.3s

	@media $media-xs
		width: $-button-spacing-xs
		border-radius: 0

	@media $media-sm-up
		width: $-button-width
		margin: 0 ($-button-margin * 2) 0 $-button-margin

	&.-disabled
		&:hover
			color: var(--theme-fg) !important
			background-color: transparent !important
			border-color: transparent !important
</style>
