import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { sleep } from '../../../utils/utils';
import { FiresidePost } from '../../../_common/fireside/post/post-model';
import { AppImgResponsive } from '../../../_common/img/responsive/responsive';
import AppMediaItemBackdrop from '../../../_common/media-item/backdrop/backdrop.vue';
import {
	getVideoPlayerFromSources,
	VideoPlayerController,
} from '../../../_common/video/player/controller';
import AppVideoPlayerShaka from '../../../_common/video/player/shaka.vue';
import AppVideo from '../../../_common/video/video.vue';

const TRANSITION_TIME = 2_000;

@Component({
	components: {
		AppMediaItemBackdrop,
		AppImgResponsive,
		AppVideo,
		AppVideoPlayerShaka,
	},
})
export default class AppHomeFsPost extends Vue {
	@Prop({ type: FiresidePost, required: true })
	post!: FiresidePost;

	@Prop({ type: FiresidePost, required: true })
	musicPost!: FiresidePost;

	@Prop({ type: Boolean })
	transitioning!: boolean;

	videoController: VideoPlayerController | null = null;
	musicController: VideoPlayerController | null = null;

	get mediaItem() {
		if (this.post.hasVideo) {
			return this.post.videos[0].posterMediaItem!;
		}

		return this.post.media[0];
	}

	get video() {
		if (!this.post.hasVideo) {
			return;
		}

		return this.post.videos[0];
	}

	created() {
		if (this.video) {
			this.videoController = new VideoPlayerController(this.video.manifestSources, 'page');

			this.videoController.volume = 0;
			this.videoController.muted = true;
		} else if (this.mediaItem?.is_animated) {
			this.videoController = getVideoPlayerFromSources(
				{
					mp4: this.mediaItem.mediaserver_url_mp4,
					webm: this.mediaItem.mediaserver_url_webm,
				},
				'gif'
			);
		}

		this.musicController = new VideoPlayerController(
			this.musicPost.videos[0].manifestSources,
			'page'
		);

		this.crossfadeIn();

		// Super hacky, but we don't want the immediate transitioning change to
		// crossfade us out.
		setTimeout(() => {
			this.$watch(
				() => this.transitioning,
				() => {
					if (this.transitioning) {
						this.crossfadeOut();
					}
				}
			);
		}, 1000);
	}

	async crossfadeIn() {
		console.log('crossfade in');
		for (let i = 10; i > 0; --i) {
			const volume = 1 - i / 10;
			if (this.musicController) {
				console.log('crossfade in step', volume);
				this.musicController.volume = volume;
			}
			await sleep(TRANSITION_TIME / 10);
		}
	}

	async crossfadeOut() {
		console.log('crossfade out');
		for (let i = 10; i > 0; --i) {
			const volume = i / 10;
			if (this.musicController) {
				console.log('crossfade out step', volume);
				this.musicController.volume = volume;
			}
			await sleep(TRANSITION_TIME / 10);
		}
	}
}
