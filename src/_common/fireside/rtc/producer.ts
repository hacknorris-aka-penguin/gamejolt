import { AgoraStreamingClient } from '../../agora/agora-streaming-client';
import { MediaDeviceService } from '../../agora/media-device.service';
import { Api } from '../../api/api.service';
import { Growls } from '../../growls/growls.service';
import { Navigate } from '../../navigate/navigate.service';
import {
	SettingStreamProducerDesktopAudio,
	SettingStreamProducerGroupAudio,
	SettingStreamProducerMic,
	SettingStreamProducerWebcam,
} from '../../settings/settings.service';
import { Translate } from '../../translate/translate.service';
import { FiresideRole } from '../role/role.model';

const RENEW_TOKEN_CHECK_INTERVAL = 10_000;
const RENEW_TOKEN_INTERVAL = 60_000;

export const PRODUCER_UNSET_DEVICE = 'unset';
export const PRODUCER_DEFAULT_GROUP_AUDIO = 'default';

export class FiresideRTCProducer {
	_appId = '';
	_userId = 0;
	_firesideId = 0;
	_role: FiresideRole = null as any;

	// The target device ids we want to be streaming to.
	_selectedWebcamDeviceId = '';
	_selectedMicDeviceId = '';
	_selectedDesktopAudioDeviceId = '';
	_selectedGroupAudioDeviceId = '';
	_isStreaming = false;

	_videoPreviewElement: HTMLDivElement | null = null;

	isBusy = false;
	_busyPromise: Promise<any> = Promise.resolve();

	_videoClient: AgoraStreamingClient | null = null;
	_chatClient: AgoraStreamingClient | null = null;

	_tokenRenewInterval: NodeJS.Timer | null = null;
	_areTokensRenewing = false;
	_lastRenewedTokens = 0;

	// Video and chat rtc clients are created and managed in pairs. When either
	// client gets disposed for whatever reason, the other client should also
	// get disposed.
	//
	// These are used to keep the clients in sync.
	_currentClientGeneration = 0;
	_areClientsRegenerating = false;
	_destroyed = false;

	get canStreamVideo() {
		return !!this._role.can_stream_video;
	}

	get canStreamAudio() {
		return !!this._role.can_stream_audio;
	}

	get isStreaming() {
		return this._isStreaming;
	}

	get selectedWebcamDeviceId() {
		return this._selectedWebcamDeviceId;
	}

	get selectedMicDeviceId() {
		return this._selectedMicDeviceId;
	}

	get selectedDesktopAudioDeviceId() {
		return this._selectedDesktopAudioDeviceId;
	}

	get selectedGroupAudioDeviceId() {
		return this._selectedGroupAudioDeviceId;
	}

	get isPoorNetworkQuality() {
		if (
			!this._videoClient ||
			this._videoClient.isDisposed ||
			!this._chatClient ||
			this._chatClient.isDisposed
		) {
			return true;
		}

		return this._videoClient.isPoorNetworkQuality || this._chatClient.isPoorNetworkQuality;
	}
}

export function createFiresideHostRTC(
	appId: string,
	userId: number,
	firesideId: number,
	role: FiresideRole
) {
	const rtc = new FiresideRTCProducer();

	rtc._appId = appId;
	rtc._userId = userId;
	rtc._firesideId = firesideId;
	rtc._role = role;
	rtc._isStreaming = false;

	MediaDeviceService.detectDevices({ prompt: false });

	_regenerateClients(rtc, rtc._currentClientGeneration);

	rtc._tokenRenewInterval = setInterval(
		() => _renewTokens(rtc, false),
		RENEW_TOKEN_CHECK_INTERVAL
	);

	return rtc;
}

export function assignPreferredProducerDevices(rtc: FiresideRTCProducer) {
	const { webcams, mics, speakers } = MediaDeviceService;

	const selectedWebcam = SettingStreamProducerWebcam.get();
	const selectedMic = SettingStreamProducerMic.get();
	const selectedDesktop = SettingStreamProducerDesktopAudio.get();
	const selectedGroup = SettingStreamProducerGroupAudio.get();

	const isWebcamUnset = selectedWebcam === PRODUCER_UNSET_DEVICE;
	const isMicUnset = selectedMic === PRODUCER_UNSET_DEVICE;
	const isDesktopUnset = selectedDesktop === PRODUCER_UNSET_DEVICE;
	const isGroupUnset = selectedGroup === PRODUCER_UNSET_DEVICE;

	let preferredWebcam: MediaDeviceInfo | null = null;
	let preferredMic: MediaDeviceInfo | null = null;
	let preferredDesktop: MediaDeviceInfo | null = null;
	let preferredGroup: MediaDeviceInfo | null = null;
	let fallbackWebcam: MediaDeviceInfo | null = null;
	let fallbackMic: MediaDeviceInfo | null = null;
	let fallbackDesktop: MediaDeviceInfo | null = null;
	let fallbackGroup: MediaDeviceInfo | null = null;

	for (const device of webcams) {
		if (isWebcamUnset) {
			break;
		}

		if (device.deviceId === selectedWebcam) {
			preferredWebcam = device;
			break;
		}

		const label = device.label.toLowerCase();
		if (!fallbackWebcam && label.includes('obs virtual camera')) {
			fallbackWebcam = device;
		} else if (!fallbackWebcam && label.includes('obs')) {
			fallbackWebcam = device;
		}
	}

	for (const device of mics) {
		if (!isMicUnset && device.deviceId === selectedMic) {
			preferredMic = device;
		} else if (!isDesktopUnset && device.deviceId === selectedDesktop) {
			preferredDesktop = device;
		}

		if ((preferredMic || isMicUnset) && (preferredDesktop || isDesktopUnset)) {
			break;
		}

		const label = device.label.toLowerCase();
		if (!isMicUnset && !fallbackMic && label.includes('default')) {
			fallbackMic = device;
		} else if (!isDesktopUnset && !fallbackDesktop && label.includes('voicemeeter output')) {
			fallbackDesktop = device;
		}
	}

	for (const device of speakers) {
		if (isGroupUnset) {
			break;
		}

		if (device.deviceId === selectedGroup) {
			preferredGroup = device;
			break;
		}

		const label = device.label.toLowerCase();
		if (!fallbackGroup && label.includes('voicemeeter aux input')) {
			fallbackGroup = device;
		}
	}

	setSelectedWebcamDeviceId(
		rtc,
		(preferredWebcam ?? fallbackWebcam)?.deviceId ?? PRODUCER_UNSET_DEVICE
	);
	setSelectedMicDeviceId(rtc, (preferredMic ?? fallbackMic)?.deviceId ?? PRODUCER_UNSET_DEVICE);
	setSelectedDesktopAudioDeviceId(
		rtc,
		(preferredDesktop ?? fallbackDesktop)?.deviceId ?? PRODUCER_UNSET_DEVICE
	);
	setSelectedGroupAudioDeviceId(
		rtc,
		(preferredGroup ?? fallbackGroup)?.deviceId ?? PRODUCER_DEFAULT_GROUP_AUDIO
	);
}

export function destroyFiresideHostRTC(rtc: FiresideRTCProducer) {
	rtc._currentClientGeneration++;

	rtc._videoClient?.dispose();
	rtc._chatClient?.dispose();

	rtc._videoClient = null;
	rtc._chatClient = null;
	rtc._isStreaming = false;
}

async function _regenerateClients(rtc: FiresideRTCProducer, generation: number) {
	if (rtc._destroyed || generation !== rtc._currentClientGeneration) {
		return;
	}

	try {
		if (rtc._areClientsRegenerating) {
			throw new Error(
				'Attempted to regenerate clients before the previous ones finished regenerating. It is no longer possible to restore state.'
			);
		}

		console.log('Regenerating clients');
		rtc._areClientsRegenerating = true;

		const wasStreaming = rtc._isStreaming;
		destroyFiresideHostRTC(rtc);

		const myGeneration = rtc._currentClientGeneration;

		rtc._videoClient = new AgoraStreamingClient(rtc._appId, 'video');
		rtc._videoClient.onDisposed = () => _regenerateClients(rtc, myGeneration);
		rtc._videoClient.onGibToken = () => _renewTokens(rtc, true);
		rtc._chatClient = new AgoraStreamingClient(rtc._appId, 'chat');
		rtc._chatClient.onDisposed = () => _regenerateClients(rtc, myGeneration);
		rtc._chatClient.onGibToken = () => _renewTokens(rtc, true);

		// Attempt to configure the new clients similarly to how the old clients
		// were configured.
		console.log('Reconfiguring clients');

		await Promise.all([
			_updateWebcamDevice(rtc),
			_updateMicDevice(rtc),
			_updateDesktopAudioDevice(rtc),
			_updateGroupAudioDevice(rtc),
		]);

		if (wasStreaming) {
			// TODO: change this show a modal where you can confirm to resume
			// streaming it'd suck if you lost connection and then it came back
			// when youre not around.
			await startStreaming(rtc);
		}
	} catch (e) {
		console.error('Error while regenerating clients');
		console.error(e);
		Navigate.reload();
	} finally {
		rtc._areClientsRegenerating = false;
	}

	// If we got destroyed while regenerating clients, make sure to tear
	// everything down
	if (rtc._destroyed) {
		destroyFiresideHostRTC(rtc);
	}
}

async function _renewTokens(rtc: FiresideRTCProducer, force: boolean) {
	if (rtc._areTokensRenewing) {
		return;
	}

	if (!rtc.isStreaming) {
		return;
	}

	if (!force && Date.now() - rtc._lastRenewedTokens < RENEW_TOKEN_INTERVAL) {
		return;
	}

	const myGeneration = rtc._currentClientGeneration;
	rtc._areTokensRenewing = true;

	try {
		console.log('Renewing tokens (force: ' + (force ? 'true' : 'false') + ')');

		let response: any = null;
		try {
			response = await Api.sendRequest(
				'/web/dash/fireside/generate-streaming-tokens/' + rtc._firesideId,
				{},
				{ detach: true }
			);
		} catch (e) {
			console.warn('Got error while renewing tokens', e);
		}

		if (rtc._currentClientGeneration !== myGeneration) {
			return;
		}

		if (!response || !response.success) {
			console.warn('Failed to renew tokens', response);
			return;
		}

		const videoChannelToken = response.videoChannelToken;
		const chatChannelToken = response.audioChatChannelToken;

		const currentVideoClient = rtc._videoClient;
		if (!currentVideoClient || currentVideoClient.isDisposed) {
			throw new Error('Video client is undefined or disposed');
		}

		const currentChatClient = rtc._chatClient;
		if (!currentChatClient || currentChatClient.isDisposed) {
			throw new Error('Chat client is undefined or disposed');
		}

		await Promise.all([
			currentVideoClient.setToken(videoChannelToken),
			currentChatClient.setToken(chatChannelToken),
		]);

		rtc._lastRenewedTokens = Date.now();
	} finally {
		rtc._areTokensRenewing = false;
	}
}

// Does some work serially.
function _doBusyWork<T>(rtc: FiresideRTCProducer, work: () => Promise<T>) {
	const p = (async () => {
		// Wait for any previous work to finish first.
		await rtc._busyPromise;

		rtc.isBusy = true;
		try {
			return await work();
		} finally {
			rtc.isBusy = false;
		}
	})();

	rtc._busyPromise = p;
	return p;
}

export function setSelectedWebcamDeviceId(
	rtc: FiresideRTCProducer,
	newWebcamDeviceId: string,
	savePref = true
) {
	const videoDeviceChanged = newWebcamDeviceId !== rtc._selectedWebcamDeviceId;
	rtc._selectedWebcamDeviceId = newWebcamDeviceId;

	if (MediaDeviceService.webcams.length > 0 && savePref) {
		// Only assign the device setting when we actually have devices.
		SettingStreamProducerWebcam.set(newWebcamDeviceId);
	}

	if (videoDeviceChanged) {
		_updateWebcamDevice(rtc);
	}
}

export function setSelectedMicDeviceId(
	rtc: FiresideRTCProducer,
	newMicId: string,
	savePref = true
) {
	const micChanged = newMicId !== rtc._selectedMicDeviceId;
	rtc._selectedMicDeviceId = newMicId;

	if (MediaDeviceService.mics.length > 0 && savePref) {
		// Only assign the device setting when we actually have devices.
		SettingStreamProducerMic.set(newMicId);
	}

	if (micChanged) {
		_updateMicDevice(rtc);
	}
}

export function setSelectedDesktopAudioDeviceId(
	rtc: FiresideRTCProducer,
	newSpeakerId: string,
	savePref = true
) {
	const speakerChanged = newSpeakerId !== rtc._selectedDesktopAudioDeviceId;
	rtc._selectedDesktopAudioDeviceId = newSpeakerId;

	if (MediaDeviceService.mics.length > 0 && savePref) {
		// Only assign the device setting when we actually have devices.
		SettingStreamProducerDesktopAudio.set(newSpeakerId);
	}

	if (speakerChanged) {
		_updateDesktopAudioDevice(rtc);
	}
}

export function setSelectedGroupAudioDeviceId(
	rtc: FiresideRTCProducer,
	newSpeakerId: string,
	savePref = true
) {
	const speakerChanged = newSpeakerId !== rtc._selectedGroupAudioDeviceId;
	rtc._selectedGroupAudioDeviceId = newSpeakerId;

	if (MediaDeviceService.speakers.length > 0 && savePref) {
		// Only assign the device setting when we actually have devices.
		SettingStreamProducerGroupAudio.set(newSpeakerId);
	}

	if (speakerChanged) {
		_updateGroupAudioDevice(rtc);
	}
}

export function clearSelectedRecordingDevices(rtc: FiresideRTCProducer) {
	setSelectedWebcamDeviceId(rtc, PRODUCER_UNSET_DEVICE, false);
	setSelectedMicDeviceId(rtc, PRODUCER_UNSET_DEVICE, false);
	setSelectedDesktopAudioDeviceId(rtc, PRODUCER_UNSET_DEVICE, false);
}

function _updateWebcamDevice(rtc: FiresideRTCProducer) {
	return _doBusyWork(rtc, async () => {
		let deviceId: string | null;

		if (
			rtc._selectedWebcamDeviceId === '' ||
			rtc._selectedWebcamDeviceId === PRODUCER_UNSET_DEVICE
		) {
			deviceId = null;
		} else {
			const deviceExists = !!MediaDeviceService.webcams.find(
				webcam => webcam.deviceId === rtc._selectedWebcamDeviceId
			);
			deviceId = deviceExists ? rtc._selectedWebcamDeviceId : null;
		}

		await rtc._videoClient?.setVideoDevice(deviceId);
		if (rtc._videoPreviewElement) {
			rtc._videoClient?.previewVideo(rtc._videoPreviewElement);
		}
	});
}

function _updateMicDevice(rtc: FiresideRTCProducer) {
	return _doBusyWork(rtc, async () => {
		let deviceId: string | null;

		if (rtc._selectedMicDeviceId === '' || rtc._selectedMicDeviceId === PRODUCER_UNSET_DEVICE) {
			deviceId = null;
		} else {
			const deviceExists = !!MediaDeviceService.mics.find(
				mic => mic.deviceId === rtc._selectedMicDeviceId
			);
			deviceId = deviceExists ? rtc._selectedMicDeviceId : null;
		}

		return rtc._chatClient?.setMicDevice(deviceId);
	});
}

function _updateDesktopAudioDevice(rtc: FiresideRTCProducer) {
	return _doBusyWork(rtc, async () => {
		let deviceId: string | null;

		if (
			rtc._selectedDesktopAudioDeviceId === '' ||
			rtc._selectedDesktopAudioDeviceId === PRODUCER_UNSET_DEVICE
		) {
			deviceId = null;
		} else {
			const deviceExists = !!MediaDeviceService.mics.find(
				mic => mic.deviceId === rtc._selectedDesktopAudioDeviceId
			);
			deviceId = deviceExists ? rtc._selectedDesktopAudioDeviceId : null;
		}

		return rtc._videoClient?.setVirtualMicDevice(deviceId);
	});
}

function _updateGroupAudioDevice(rtc: FiresideRTCProducer) {
	return _doBusyWork(rtc, async () => {
		const deviceExists = !!MediaDeviceService.speakers.find(
			speaker => speaker.deviceId === rtc._selectedGroupAudioDeviceId
		);

		const deviceId = deviceExists ? rtc._selectedGroupAudioDeviceId : null;
		return rtc._chatClient?.setSpeakerDevice(deviceId ?? PRODUCER_DEFAULT_GROUP_AUDIO);
	});
}

export function setVideoPreviewElement(rtc: FiresideRTCProducer, element: HTMLDivElement | null) {
	if (rtc._videoPreviewElement && rtc._videoPreviewElement !== element) {
		rtc._videoPreviewElement.innerHTML = '';
	}

	rtc._videoPreviewElement = element;
	if (rtc._videoPreviewElement) {
		rtc._videoClient?.previewVideo(rtc._videoPreviewElement);
	}
}

export function getOwnDesktopAudioVolume(rtc: FiresideRTCProducer) {
	if (!rtc._videoClient || rtc._videoClient.isDisposed) {
		return 0;
	}

	return rtc._videoClient!.getVirtualAudioInputVolume();
}

export function getOwnMicAudioVolume(rtc: FiresideRTCProducer) {
	if (!rtc._chatClient || rtc._chatClient.isDisposed) {
		return 0;
	}

	return rtc._chatClient!.getAudioInputVolume();
}

export async function startStreaming(rtc: FiresideRTCProducer) {
	await _doBusyWork(rtc, async () => {
		if (rtc._isStreaming) {
			return;
		}

		rtc._isStreaming = true;

		let response: any = null;
		try {
			response = await Api.sendRequest(
				'/web/dash/fireside/generate-streaming-tokens/' + rtc._firesideId,
				{},
				{
					detach: true,
				}
			);
		} catch (e) {
			console.warn('Got error while getting streaming tokens to start streaming', e);
		}

		if (!response || !response.success) {
			console.warn('Could not start streaming', response);

			Growls.error(
				Translate.$gettext(
					'Could not start streaming. Either fireside has ended or your permissions to stream have been revoked.'
				)
			);
			rtc._isStreaming = false;
			return;
		}

		rtc._lastRenewedTokens = Date.now();

		const videoChannel = response.videoChannel;
		const videoChannelToken = response.videoChannelToken;
		const chatChannel = response.audioChatChannel;
		const chatChannelToken = response.audioChatChannelToken;

		try {
			const currentVideoClient = rtc._videoClient;
			if (!currentVideoClient || currentVideoClient.isDisposed) {
				throw new Error('Video client is undefined or disposed');
			}

			const currentChatClient = rtc._chatClient;
			if (!currentChatClient || currentChatClient.isDisposed) {
				throw new Error('Chat client is undefined or disposed');
			}

			const [videoResult, chatResult] = await Promise.allSettled([
				currentVideoClient
					.joinChannel(videoChannel, videoChannelToken, rtc._userId)
					.then(() => currentVideoClient.startVideoStream()),
				currentChatClient
					.enableAudioPlayback()
					.then(() =>
						currentChatClient.joinChannel(chatChannel, chatChannelToken, rtc._userId)
					)
					.then(() => currentChatClient.startChatStream()),
			]);

			if (videoResult.status !== 'fulfilled') {
				throw new Error('Video channel failed to start streaming');
			}

			if (chatResult.status !== 'fulfilled') {
				throw new Error('Chat channel failed to start streaming');
			}

			console.log('Started streaming');
		} catch (err) {
			console.error(err);
			Growls.error(Translate.$gettext('Could not start streaming. Try again later'));
			await _stopStreaming(rtc, false);
		}
	});
}

export function stopStreaming(rtc: FiresideRTCProducer) {
	return _stopStreaming(rtc, true);
}

async function _stopStreaming(rtc: FiresideRTCProducer, becomeBusy: boolean) {
	const busyWork = async () => {
		if (!rtc._isStreaming) {
			return;
		}

		try {
			const currentVideoClient = rtc._videoClient;
			if (!currentVideoClient || currentVideoClient.isDisposed) {
				throw new Error('Video client is undefined or disposed');
			}

			const currentChatClient = rtc._chatClient;
			if (!currentChatClient || currentChatClient.isDisposed) {
				throw new Error('Chat client is undefined or disposed');
			}

			// Failure here should end up forcing the app to reload to make absolutely sure they aren't streaming by accident.
			await Promise.all([
				currentVideoClient.stopStream().then(() => currentVideoClient.leaveChannel()),
				currentChatClient.stopStream().then(() => currentChatClient.leaveChannel()),
			]);

			clearSelectedRecordingDevices(rtc);
		} catch (err) {
			console.error(err);
			console.error('Failed to stop one or more agora channels. Force reloading...');
			Navigate.reload();
			return;
		}

		rtc._isStreaming = false;
		console.log('Stopped streaming');
	};

	await (becomeBusy ? _doBusyWork(rtc, busyWork) : busyWork());
}
