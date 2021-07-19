<script lang="ts" src="./card-base"></script>

<template>
	<app-theme :theme="community.theme">
		<component
			:is="link ? 'router-link' : 'div'"
			class="community-card sheet sheet-full sheet-no-full-bleed"
			:class="{ 'sheet-elevate': elevate }"
			:to="community.routeLocation"
		>
			<div class="-info">
				<div
					class="-header"
					:style="{
						'background-image': headerBackgroundImage,
					}"
				/>

				<div class="-thumbnail">
					<slot name="thumbnail" />
				</div>

				<div class="-well fill-bg">
					<div class="-name" :class="{ '-overflow': overflow }">
						<component
							:is="link ? 'span' : 'router-link'"
							:to="community.routeLocation"
							class="link-unstyled"
							@click.native="link ? trackGotoCommunity() : undefined"
						>
							{{ community.name }}
							<app-community-verified-tick :community="community" />
						</component>
					</div>

					<div class="-member-counts small">
						<component
							:is="link ? 'span' : 'router-link'"
							v-app-track-event="`community-card:community-members`"
							v-translate="{ count: number(memberCount) }"
							:translate-n="memberCount"
							translate-plural="<b>%{count}</b> members"
							:to="{
								name: 'communities.view.members',
								params: { path: community.path },
							}"
							class="link-unstyled"
						>
							<b>1</b>
							member
						</component>
					</div>

					<div v-if="controls" class="-controls">
						<template v-if="community.hasPerms() && allowEdit">
							<app-button
								v-if="!isEditing"
								v-app-track-event="`community-card-inline:community-edit`"
								primary
								block
								:to="community.routeEditLocation"
							>
								<translate>Edit Community</translate>
							</app-button>
							<app-button
								v-else
								primary
								block
								:to="community.routeLocation"
								@click.native="trackGotoCommunity()"
							>
								<translate>View Community</translate>
							</app-button>
						</template>
						<app-community-join-widget
							v-else
							:community="community"
							:disabled="!!community.user_block"
							block
							hide-count
							event-label="community-card"
						/>
						<app-button
							v-if="shouldShowModTools"
							class="-moderate"
							:href="
								Environment.baseUrl + `/moderate/communities/view/${community.id}`
							"
							icon="cog"
							circle
							trans
						/>
					</div>
				</div>
			</div>
		</component>
	</app-theme>
</template>

<style lang="stylus" src="./card-base.styl" scoped></style>
