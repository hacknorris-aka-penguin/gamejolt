<script lang="ts" src="./item"></script>

<template>
	<div
		class="chat-window-message"
		:class="{
			'chat-window-message-not-combined': !message.combine,
			'chat-window-message-combined': message.combine,
			'chat-window-message-editing': isEditing,
			'-chat-message-queued': message._showAsQueued,
			'-chat-message-new': isNew,
			'chat-window-message-options-visible': messageOptionsVisible,
		}"
		:style="{ 'background-color': isEditingColor }"
	>
		<a v-if="!message.combine" class="chat-window-message-avatar">
			<app-popper placement="right">
				<img
					class="img-responsive -chat-window-message-avatar-img"
					:src="message.user.img_avatar"
					alt=""
				/>
				<template #popover>
					<app-chat-user-popover :user="message.user" :room="room" />
				</template>
			</app-popper>
		</a>

		<div class="chat-window-message-container">
			<div v-if="!message.combine" class="chat-window-message-byline">
				<router-link class="chat-window-message-user link-unstyled" :to="message.user.url">
					{{ message.user.display_name }}
				</router-link>
				<span class="chat-window-message-username"> @{{ message.user.username }} </span>
				<span class="chat-window-message-time">
					<template v-if="!message._showAsQueued">
						<span v-if="loggedOn !== null" v-app-tooltip="loggedOn.tooltip">
							{{ loggedOn.template }}
						</span>
					</template>
					<span
						v-else-if="message._error"
						v-app-tooltip="$gettext(`Failed to send. Press to retry`)"
						class="chat-window-message-byline-error"
						@click="onClickResend"
					>
						<app-jolticon icon="notice" notice />
					</span>
					<span
						v-else
						v-app-tooltip="$gettext(`Sending...`)"
						class="chat-window-message-byline-notice"
					>
						<app-jolticon icon="broadcast" />
					</span>
				</span>
			</div>

			<div
				v-if="shouldShowMessageOptions"
				class="chat-window-message-options"
				:class="{ 'chat-window-message-options-open': messageOptionsVisible }"
			>
				<app-popper
					@show="messageOptionsVisible = true"
					@hide="messageOptionsVisible = false"
				>
					<template #default>
						<a v-app-tooltip="$gettext('More Options')" class="link-muted">
							<app-jolticon icon="ellipsis-v" class="middle" />
						</a>
					</template>

					<template #popover>
						<div class="list-group">
							<a
								v-if="canEditMessage"
								class="list-group-item has-icon"
								@click="startEdit"
							>
								<app-jolticon icon="edit" />
								<translate>Edit Message</translate>
							</a>

							<a
								v-if="canRemoveMessage"
								class="list-group-item has-icon"
								@click="removeMessage"
							>
								<app-jolticon icon="remove" notice />
								<translate>Remove Message</translate>
							</a>
						</div>
					</template>
				</app-popper>
			</div>

			<div class="chat-window-message-content-wrap">
				<template v-if="message.combine">
					<template v-if="!message._showAsQueued">
						<span
							v-if="loggedOn !== null"
							v-app-tooltip="loggedOn.tooltip"
							class="chat-window-message-small-time"
						>
							{{ loggedOn.template }}
						</span>
					</template>
					<span
						v-else-if="message._error"
						v-app-tooltip="$gettext(`Failed to send. Press to retry`)"
						class="chat-window-message-queue-error"
						@click="onClickResend"
					>
						<app-jolticon icon="notice" notice />
					</span>
					<span
						v-else
						v-app-tooltip="$gettext(`Sending...`)"
						class="chat-window-message-queue-notice"
					>
						<app-jolticon icon="broadcast" />
					</span>
				</template>

				<app-content-viewer :source="message.content" :display-rules="displayRules" />

				<span
					v-if="editingState"
					v-app-tooltip.touchable="editingState.tooltip"
					class="-edited"
					:class="{ 'text-muted': !isEditing }"
				>
					<translate>{{ editingState.display }}</translate>
				</span>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" src="./item.styl" scoped></style>
