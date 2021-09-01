import Vue, { CreateElement } from 'vue';
import { Component, InjectReactive, Prop, ProvideReactive } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { sleep } from '../../../../utils/utils';
import { Api } from '../../../../_common/api/api.service';
import { getCookie } from '../../../../_common/cookie/cookie.service';
import { Fireside } from '../../../../_common/fireside/fireside.model';
import { FiresideRole } from '../../../../_common/fireside/role/role.model';
import {
	createFiresideHostRTC,
	destroyFiresideHostRTC,
} from '../../../../_common/fireside/rtc/producer';
import {
	destroyFiresideRTC,
	FiresideRTC,
	renewFiresideRTCToken,
} from '../../../../_common/fireside/rtc/rtc';
import { Growls } from '../../../../_common/growls/growls.service';
import { AppState, AppStore } from '../../../../_common/store/app-store';
import { User } from '../../../../_common/user/user.model';
import {
	ChatClient,
	ChatKey,
	joinInstancedRoomChannel,
	leaveChatRoom,
} from '../../../components/chat/client';
import { EVENT_UPDATE, FiresideChannel } from '../../../components/grid/fireside-channel';
import { Store } from '../../../store';
import { StreamSetupModal } from '../_stream-setup/stream-setup-modal.service';
import { createFiresideController, FiresideController, FiresideControllerKey } from './controller';

@Component({})
export default class AppFiresideContainer extends Vue {
	@AppState user!: AppStore['user'];
	@State grid!: Store['grid'];
	@InjectReactive(ChatKey) chat!: ChatClient;

	@Prop({ type: FiresideController, required: false })
	controller?: FiresideController;

	@Prop({ type: Fireside, required: false })
	fireside?: Fireside;

	@Prop({ type: String, required: false })
	streamingAppId?: string;

	_controller: FiresideController | null = null;

	@ProvideReactive(FiresideControllerKey)
	get activeController() {
		return this.controller ?? this._controller;
	}

	created() {
		if (!this.$slots.default) {
			throw Error('AppFiresideContainer requires a default slot.');
		}

		if (!this.controller) {
			if (!this.fireside || !this.streamingAppId) {
				throw Error(
					'AppFiresideContainer requires both a [fireside] and [streamingAppId] if no controller is provided.'
				);
			}

			this._controller = createFiresideController(this.fireside, this.streamingAppId);
		}

		this.activeController!.onRetry = this.onRetry;
	}

	render(h: CreateElement) {
		return h('div', {}, this.$slots.default);
	}

	async mounted() {
		const c = this.activeController!;
		c.chat = this.chat;

		// TODO: Do we want to do this?
		if (c.status === 'joined') {
			this.disconnect();
		}

		c.hasExpiryWarning = false;

		const userCanJoin = await this.checkUserCanJoin();

		if (!userCanJoin) {
			c.status = 'unauthorized';
			console.debug(
				`[FIRESIDE] User is not authorized to join the Fireside (not logged in/no cookie).`
			);
			return;
		}

		if (c.fireside?.blocked) {
			c.status = 'blocked';
			console.debug(`[Fireside] Blocked from joining blocked user's Fireside.`);
			return;
		}

		if (c.fireside?.isOpen()) {
			// Set up watchers to initiate connection once one of them boots up.
			this.$watch('chat.connected', () => this.watchChat());
			this.$watch('grid.connected', () => this.watchGrid());

			// Both services may already be connected (watchers wouldn't fire), so try joining manually now.
			this.tryJoin();
		} else {
			c.status = 'expired';
			console.debug(`[FIRESIDE] Fireside is expired, and cannot be joined.`);
		}
	}

	destroyed() {
		this.disconnect();
		// This also happens in Disconnect, but make 100% sure we cleared the interval.
		this.clearExpiryCheck();
	}

	watchChat() {
		const c = this.activeController!;
		if (this.chat.connected) {
			this.tryJoin();
		}
		// Only disconnect when not connected and it previous registered a different state.
		// This watcher runs once initially when chat is not connected, and we don't want to call
		// disconnect in that case.
		else if (c.chatPreviousConnectedState !== null) {
			this.disconnect();
		}

		c.chat = this.chat;
		c.chatPreviousConnectedState = this.chat.connected;
	}

	watchGrid() {
		const c = this.activeController!;
		if (this.grid && this.grid.connected) {
			this.tryJoin();
		}
		// Only disconnect when not connected and it previous registered a different state.
		// This watcher runs once initially when grid is not connected, and we don't want to call
		// disconnect in that case.
		else if (this.grid && c.gridPreviousConnectedState !== null) {
			this.disconnect();
		}

		// c.grid = this.grid;
		c.gridPreviousConnectedState = this.grid?.connected ?? null;
	}

	private async checkUserCanJoin() {
		if (!this.user) {
			return false;
		}

		const frontendCookie = await getCookie('frontend');

		if (!frontendCookie) {
			return false;
		}

		return true;
	}

	private async tryJoin() {
		const c = this.activeController!;
		// Only try to join when disconnected (or for the first "initial" load).
		if (c.status === 'disconnected' || c.status === 'initial') {
			c.status = 'loading';

			// Make sure the services are connected.
			while (!this.grid || !this.grid.connected) {
				console.debug('[FIRESIDE] Wait for Grid...');
				await sleep(250);
			}
			while (!this.chat || !this.chat.connected) {
				console.debug('[FIRESIDE] Wait for Chat...');
				await sleep(250);
			}

			this.join();
		}
	}

	private async join() {
		console.debug(`[FIRESIDE] Joining Fireside.`);
		const c = this.activeController!;

		// --- Make sure common join conditions are met.

		if (!this.user) {
			console.debug(`[FIRESIDE] User is not logged in.`);
			c.status = 'unauthorized';
			return;
		}

		if (
			!c.fireside ||
			!this.grid ||
			!this.grid.connected ||
			!this.grid.socket ||
			!this.chat ||
			!this.chat.connected
		) {
			console.debug(`[FIRESIDE] General connection error.`);
			c.status = 'setup-failed';
			return;
		}

		const frontendCookie = await getCookie('frontend');
		if (!frontendCookie) {
			console.debug(`[FIRESIDE] Setup failure 1.`);
			c.status = 'setup-failed';
			return;
		}

		// --- Refetch fireside information and check that it's not yet expired.

		try {
			const payload = await Api.sendRequest(
				`/web/fireside/fetch/${c.fireside.hash}`,
				undefined,
				{ detach: true }
			);
			if (!payload.fireside) {
				console.debug(`[FIRESIDE] Trying to load Fireside, but it was not found.`);
				c.status = 'setup-failed';
				return;
			}
			c.fireside.assign(payload.fireside);
		} catch (error) {
			console.debug(`[FIRESIDE] Setup failure 2.`, error);
			c.status = 'setup-failed';
			return;
		}

		// Maybe they are blocked now?
		if (c.fireside.blocked) {
			c.status = 'blocked';
			console.debug(`[Fireside] Blocked from joining blocked user's Fireside.`);
			return;
		}

		// Make sure it's still joinable.
		if (!c.fireside.isOpen()) {
			console.debug(`[FIRESIDE] Fireside is expired, and cannot be joined.`);
			c.status = 'expired';
			return;
		}

		// --- Make them join the Fireside (if they aren't already).

		if (!c.fireside.role) {
			const rolePayload = await Api.sendRequest(`/web/fireside/join/${c.fireside.hash}`);
			if (!rolePayload || !rolePayload.success || !rolePayload.role) {
				console.debug(`[FIRESIDE] Failed to acquire a role.`);
				c.status = 'setup-failed';
				return;
			}
			c.fireside.role = new FiresideRole(rolePayload.role);
		}

		if (c.streamingAppId && c.fireside?.role.canStream) {
			c.hostRtc = createFiresideHostRTC(
				c.streamingAppId,
				this.user.id,
				c.fireside.id,
				c.fireside.role
			);
		}

		// --- Join Grid channel.

		const channel = new FiresideChannel(
			c.fireside,
			this.grid.socket,
			this.user,
			frontendCookie
		);

		// Subscribe to the update event.
		channel.on(EVENT_UPDATE, this.onGridUpdateFireside.bind(this));

		try {
			await new Promise<void>((resolve, reject) => {
				channel
					.join()
					.receive('error', reject)
					.receive('ok', () => {
						c.gridChannel = channel;
						this.grid!.channels.push(channel);
						resolve();
					});
			});
		} catch (error) {
			console.debug(`[FIRESIDE] Setup failure 3.`, error);
			if (error && error.reason === 'blocked') {
				c.status = 'blocked';
			} else {
				c.status = 'setup-failed';
			}
			return;
		}

		// Now join the chat's room channel.
		try {
			const chatChannel = await joinInstancedRoomChannel(this.chat, c.fireside.chat_room_id);

			if (!chatChannel) {
				console.debug(`[FIRESIDE] Setup failure 4.`);
				c.status = 'setup-failed';
				return;
			}

			c.chatChannel = chatChannel;
		} catch (error) {
			console.debug(`[FIRESIDE] Setup failure 5.`, error);
			c.status = 'setup-failed';
			return;
		}

		c.chatChannel.on('kick_member', (data: any) => {
			if (data.user_id === this.user!.id) {
				Growls.info(this.$gettext(`You've been kicked from the Fireside.`));
				this.$router.push({ name: 'home' });
			}
		});

		// Now join the RTC.
		if (c.fireside.is_streaming) {
			const streamingPayload = await Api.sendRequest(
				`/web/fireside/fetch-streaming-info/${c.fireside.hash}`
			);
			this.createOrUpdateRtc(streamingPayload, false);
		}

		c.status = 'joined';
		console.debug(`[FIRESIDE] Successfully joined Fireside.`);

		// Set up the expiry interval to check if the Fireside is expired.
		this.clearExpiryCheck();
		c.expiryInterval = setInterval(this.expiryCheck.bind(this), 1000);
		this.expiryCheck();
	}

	private disconnect() {
		const c = this.activeController;
		if (!c || c.status === 'disconnected') {
			return;
		}

		console.debug(`[FIRESIDE] Disconnecting from Fireside.`);

		c.status = 'disconnected';

		if (c.hostRtc) {
			destroyFiresideHostRTC(c.hostRtc);
			c.hostRtc = null;
		}

		if (this.grid && this.grid.connected && c.gridChannel) {
			c.gridChannel.leave();
		}

		c.gridChannel = null;

		if (this.chat && this.chat.connected && c.chatChannel) {
			leaveChatRoom(this.chat, c.chatChannel.room);
		}

		c.chatChannel = null;

		StreamSetupModal.close();

		this.destroyRtc();

		this.clearExpiryCheck();

		console.debug(`[FIRESIDE] Disconnected from Fireside.`);
	}

	private clearExpiryCheck() {
		const c = this.activeController;
		if (c?.expiryInterval) {
			clearInterval(c.expiryInterval);
			c.expiryInterval = null;
		}
	}

	private expiryCheck() {
		const c = this.activeController;
		if (!c || c.status !== 'joined' || !c.fireside) {
			return;
		}

		if (!c.fireside.isOpen()) {
			this.disconnect();
			c.status = 'expired';
		}

		// Shows an expiry warning on the stats icon (on mobile) when < 60 seconds remain.
		c.hasExpiryWarning = c.fireside.getExpiryInMs() < 60_000;
	}

	private createOrUpdateRtc(payload: any, checkJoined = true) {
		const c = this.activeController;
		if (!c || !this.user || !c.fireside || (checkJoined && c.status !== 'joined')) {
			return;
		}

		const hosts = User.populate(payload.hosts ?? []);

		if (c.rtc === null) {
			c.rtc = new FiresideRTC(
				this.user.id,
				payload.streamingAppId,
				payload.videoChannelName,
				payload.videoToken,
				payload.audioChatChannelName,
				payload.audioChatToken,
				hosts
			);
		} else {
			// TODO: update hosts when we introduce changing hosts on the fly.
			renewFiresideRTCToken(c.rtc, payload.videoToken, payload.audioChatToken);
		}
	}

	private destroyRtc() {
		const c = this.activeController;
		if (!c?.rtc) {
			return;
		}

		destroyFiresideRTC(c.rtc);

		c.rtc = null;
	}

	private onRetry() {
		this.disconnect();
		this.tryJoin();
	}

	onGridUpdateFireside(payload: any) {
		const c = this.activeController;
		if (!c?.fireside || !payload.fireside) {
			return;
		}

		c.fireside.assign(payload.fireside);
		this.expiryCheck();

		if (c.fireside.is_streaming && payload.streaming_info) {
			this.createOrUpdateRtc(payload.streaming_info);
		} else {
			this.destroyRtc();
		}
	}
}
