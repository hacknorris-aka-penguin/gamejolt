import Vue from 'vue';
import { Component, Inject, Prop } from 'vue-property-decorator';
import { Analytics } from '../../../../../../_common/analytics/analytics.service';
import { FiresidePost } from '../../../../../../_common/fireside/post/post-model';
import AppLightboxTS from '../../../../../../_common/lightbox/lightbox';
import {
	createLightbox,
	LightboxMediaSource,
} from '../../../../../../_common/lightbox/lightbox-helpers';
import { MediaItem } from '../../../../../../_common/media-item/media-item-model';
import AppMediaItemPost from '../../../../../../_common/media-item/post/post.vue';
import { Screen } from '../../../../../../_common/screen/screen-service';
import AppEventItemMediaIndicator from '../../../../event-item/media-indicator/media-indicator.vue';
import { ActivityFeedItem } from '../../item-service';
import { ActivityFeedKey, ActivityFeedView } from '../../view';

if (!GJ_IS_SSR) {
	const VueTouch = require('vue-touch');
	Vue.use(VueTouch);
}

@Component({
	components: {
		AppMediaItemPost,
		AppEventItemMediaIndicator,
	},
})
export default class AppActivityFeedPostMedia extends Vue implements LightboxMediaSource {
	@Prop({ type: ActivityFeedItem, required: true })
	item!: ActivityFeedItem;

	@Prop({ type: FiresidePost, required: true })
	post!: FiresidePost;

	@Prop({ type: Boolean, required: false, default: false })
	canPlaceSticker!: boolean;

	@Inject(ActivityFeedKey) feed!: ActivityFeedView;

	page = 1;
	activeMediaItem: MediaItem | null = null;
	isDragging = false;
	isWaitingForFrame = false;
	private lightbox?: AppLightboxTS;
	readonly Screen = Screen;

	$refs!: {
		slider: HTMLElement;
	};

	get isHydrated() {
		return this.feed.isItemHydrated(this.item);
	}

	created() {
		this.activeMediaItem = this.post.media[0];
	}

	destroyed() {
		this.closeLightbox();
	}

	onLightboxClose() {
		this.lightbox = undefined;
	}

	getActiveIndex() {
		return this.page - 1;
	}

	getActiveItem() {
		return this.activeMediaItem!;
	}

	getItemCount() {
		return this.post.media.length;
	}

	getItems() {
		return this.post.media;
	}

	goNext() {
		if (this.page >= this.post.media.length) {
			this._updateSliderOffset();
			return;
		}

		this.page = Math.min(this.page + 1, this.post.media.length);
		this.activeMediaItem = this.post.media[this.page - 1];
		this._updateSliderOffset();
		Analytics.trackEvent('activity-feed', 'media-next');
	}

	goPrev() {
		if (this.page <= 1) {
			this._updateSliderOffset();
			return;
		}

		this.page = Math.max(this.page - 1, 1);
		this.activeMediaItem = this.post.media[this.page - 1];
		this._updateSliderOffset();
		Analytics.trackEvent('activity-feed', 'media-prev');
	}

	async onItemBootstrapped() {
		this._updateSliderOffset();
	}

	private _updateSliderOffset(extraOffsetPx = 0) {
		const pagePercent = this.page - 1;
		const slider = this.$refs.slider;
		const pagePx = slider.offsetWidth * -pagePercent;
		slider.style.transform = `translate3d( ${pagePx + extraOffsetPx}px, 0, 0 )`;
	}

	panStart() {
		this.isDragging = true;
	}

	pan(event: HammerInput) {
		if (!this.isWaitingForFrame) {
			this.isWaitingForFrame = true;
			window.requestAnimationFrame(() => this._panTick(event));
		}
	}

	onTouchMove(event: Event) {
		if (this.isDragging) {
			event.preventDefault();
		}
	}

	private _panTick(event: HammerInput) {
		this.isWaitingForFrame = false;

		// In case the animation frame was retrieved after we stopped dragging.
		if (!this.isDragging) {
			return;
		}

		this._updateSliderOffset(event.deltaX);
	}

	panEnd(event: HammerInput) {
		this.isDragging = false;

		// Make sure we moved at a high enough velocity and/or distance to register the "swipe".
		const { velocityX, deltaX, distance } = event;

		if (
			// Check if it was a fast flick,
			(Math.abs(velocityX) > 0.55 && distance > 10) ||
			// or if the pan distance was at least ~1/3 of the content area.
			Math.abs(deltaX) >= this.$el.clientWidth / 3
		) {
			if (velocityX > 0 || deltaX > 0) {
				this.goPrev();
			} else {
				this.goNext();
			}
			return;
		}

		this._updateSliderOffset();
	}

	getIsActiveMediaItem(item: MediaItem) {
		return this.activeMediaItem?.id === item.id;
	}

	onClickFullscreen() {
		this.createLightbox();
		Analytics.trackEvent('activity-feed', 'media-fullscreen');
	}

	private createLightbox() {
		if (this.lightbox) {
			return;
		}
		this.lightbox = createLightbox(this);
	}

	private closeLightbox() {
		if (!this.lightbox) {
			return;
		}
		this.lightbox.close();
		this.lightbox = undefined;
	}
}
