<template>
	<div>
		<template v-if="isLoading">
			<br />
			<app-loading centered />
		</template>
		<div v-else-if="requests.length">
			<app-shell-friend-request-popover-item
				v-for="request of requests"
				:key="request.id"
				:request="request"
				@accept="acceptRequest(request)"
				@reject="rejectRequest(request)"
				@cancel="cancelRequest(request)"
			/>
		</div>
		<div class="alert" v-else>
			<translate>No friend requests right now.</translate>
		</div>
	</div>
</template>

<script lang="ts" src="./container"></script>
