<script lang="ts" src="./fs-post-meta"></script>

<template>
	<div class="-meta">
		<div class="-cell">
			<div class="-post">
				<div class="-avatar">
					<app-user-avatar-img :user="animationPost.user" />
				</div>
				<div class="-info">
					<div class="-title -text-shadow">Animation by</div>
					<div class="-username -text-shadow">@{{ animationPost.user.username }}</div>
				</div>
			</div>
		</div>

		<div class="-cell -align-center">
			<div class="-marketing -text-shadow">
				<div class="-marketing-sub">
					Add your own creations to the Game Jolt Fireplace at
				</div>
				<div class="-marketing-url">gamejolt.com/c/fireplace</div>
			</div>
		</div>

		<div class="-cell -align-end">
			<div class="-post">
				<div class="-avatar">
					<app-user-avatar-img :user="musicPost.user" />
				</div>
				<div class="-info">
					<div class="-title -text-shadow">Music by</div>
					<div class="-username -text-shadow">@{{ musicPost.user.username }}</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-text-shadow
	text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.3)

.-meta
	position: absolute
	bottom: 0
	right: 0
	left: 0
	display: flex
	flex-direction: row
	align-items: center
	justify-content: space-between
	padding: 24px
	background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.7) 100%)
	z-index: 1

.-cell
	display: flex
	align-items: center
	width: (100% / 3)

.-align-center
	justify-content: center

.-align-end
	justify-content: flex-end

.-post
	display: flex
	flex-direction: row
	align-items: center

.-avatar
	width: 64px
	height: 64px
	flex: none

.-info
	display: flex
	flex-direction: column
	margin-left: 16px

.-username
	text-overflow()
	max-width: 250px

.-title
.-marketing-sub
	margin-bottom: 4px
	font-size: 16px

.-username
.-marketing-url
	font-weight: bold
	font-size: 18px

.-marketing
	text-align: center
</style>
