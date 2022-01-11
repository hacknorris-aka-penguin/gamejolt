import { Options, Prop, Vue } from 'vue-property-decorator';
import { Community } from '../../../../_common/community/community.model';
import { formatNumber } from '../../../../_common/filters/number';
import AppMediaItemBackdrop from '../../../../_common/media-item/backdrop/backdrop.vue';
import { AppTheme } from '../../../../_common/theme/theme';

@Options({
	components: {
		AppTheme,
		AppMediaItemBackdrop,
	},
})
export default class AppGameCommunityBadge extends Vue {
	@Prop(Object)
	community!: Community;

	readonly formatNumber = formatNumber;
}
