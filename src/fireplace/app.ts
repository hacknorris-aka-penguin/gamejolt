import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { sleep } from '../utils/utils';
import { Api } from '../_common/api/api.service';
import { FiresidePost } from '../_common/fireside/post/post-model';
import { AppTheme } from '../_common/theme/theme';
import AppVideoPlayerShaka from '../_common/video/player/shaka.vue';
import AppHomeFsPostMeta from './components/fs-post-meta/fs-post-meta.vue';
import AppHomeFsPost from './components/fs-post/fs-post.vue';

const TIME_PER_POST = 60_000;

@Component({
	components: {
		AppTheme,
		AppHomeFsPost,
		AppHomeFsPostMeta,
		AppVideoPlayerShaka,
	},
})
export default class App extends Vue {
	animationPost: FiresidePost | null = null;
	musicPost: FiresidePost | null = null;

	nextAnimationPost: FiresidePost | null = null;
	nextMusicPost: FiresidePost | null = null;

	transitioning = false;

	mounted() {
		this.loadPosts();
	}

	async loadPosts() {
		let url = '/web/discover/fireplace?';
		if (this.animationPost) {
			url += `&excludeAnimationId=${this.animationPost.id}`;
		}
		if (this.musicPost) {
			url += `&excludeMusicId=${this.musicPost.id}`;
		}

		const payload = await Api.sendRequest(url);

		const animationPost = new FiresidePost(payload['animationPost']);
		const musicPost = new FiresidePost(payload['musicPost']);

		if (!this.animationPost) {
			this.animationPost = animationPost;
			this.musicPost = musicPost;
		} else {
			console.log('set up transition');
			this.nextAnimationPost = animationPost;
			this.nextMusicPost = musicPost;

			// Wait before applying the transition so that it realizes the value
			// changed.
			await sleep(0);
			this.transitioning = true;

			await sleep(2_000);

			console.log('transition end');
			this.animationPost = this.nextAnimationPost;
			this.musicPost = this.nextMusicPost;
			this.nextAnimationPost = null;
			this.nextMusicPost = null;
			this.transitioning = false;
		}

		setTimeout(() => this.loadPosts(), TIME_PER_POST);
	}
}
