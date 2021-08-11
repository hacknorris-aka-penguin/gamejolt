import { Emit, Inject, Options, Prop, Vue } from 'vue-property-decorator';
import { FiresidePost } from '../../../../../../_common/fireside/post/post-model';
import { $viewPostVideo } from '../../../../../../_common/fireside/post/video/video-model';
import AppVideoProcessingProgress from '../../../../../../_common/video/processing-progress/processing-progress.vue';
import { ActivityFeedItem } from '../../item-service';
import { ActivityFeedKey, ActivityFeedView } from '../../view';
import AppActivityFeedVideoPlayer from '../../_video-player/video-player.vue';

@Options({
	components: {
		AppActivityFeedVideoPlayer,
		AppVideoProcessingProgress,
	},
})
export default class AppActivityFeedPostVideo extends Vue {
	@Prop({ type: ActivityFeedItem, required: true })
	item!: ActivityFeedItem;

	@Prop({ type: FiresidePost, required: true })
	post!: FiresidePost;

	@Inject({ from: ActivityFeedKey })
	feed!: ActivityFeedView;

	@Emit('query-param') emitQueryParam(_params: Record<string, string>) {}

	get isHydrated() {
		return this.feed.isItemHydrated(this.item);
	}

	get video() {
		return this.post.videos[0];
	}

	onTimeChange(time: number) {
		this.emitQueryParam({ t: `${time}` });
	}

	onVideoPlay() {
		$viewPostVideo(this.video);
	}

	onVideoProcessingComplete(payload: any) {
		if (payload.video && this.video) {
			this.video.assign(payload.video);
		}
	}
}
