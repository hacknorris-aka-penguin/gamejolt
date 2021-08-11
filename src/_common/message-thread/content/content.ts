import { Options, Vue } from 'vue-property-decorator';
import AppTimelineListItem from '../../timeline-list/item/item.vue';

@Options({
	components: {
		AppTimelineListItem,
	},
})
export default class AppMessageThreadContent extends Vue {}
