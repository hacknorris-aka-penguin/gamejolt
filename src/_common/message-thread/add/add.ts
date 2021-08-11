import { Options, Prop, Vue } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Screen } from '../../screen/screen-service';
import { AppStore } from '../../store/app-store';
import AppTimelineListItem from '../../timeline-list/item/item.vue';
import AppUserAvatarImg from '../../user/user-avatar/img/img.vue';

@Options({
	components: {
		AppUserAvatarImg,
		AppTimelineListItem,
	},
})
export default class AppMessageThreadAdd extends Vue {
	@Prop(Boolean) hideMessageSplit!: boolean;

	@State app!: AppStore;

	readonly Screen = Screen;
}
