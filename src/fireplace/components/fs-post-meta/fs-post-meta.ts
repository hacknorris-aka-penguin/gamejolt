import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import AppCommunityOverlayPill from '../../../app/views/discover/home/_community-overlay-pill/community-overlay-pill.vue';
import { FiresidePost } from '../../../_common/fireside/post/post-model';
import AppUserAvatarImg from '../../../_common/user/user-avatar/img/img.vue';

@Component({
	components: {
		AppUserAvatarImg,
		AppCommunityOverlayPill,
	},
})
export default class AppHomeFsPostMeta extends Vue {
	@Prop({ type: FiresidePost, required: true })
	animationPost!: FiresidePost;

	@Prop({ type: FiresidePost, required: true })
	musicPost!: FiresidePost;
}
