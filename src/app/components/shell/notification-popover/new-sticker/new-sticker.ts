import { Options, Prop, Vue } from 'vue-property-decorator';

@Options({})
export default class AppShellNotificationPopoverNewSticker extends Vue {
	@Prop({ type: String, required: true }) stickerImg!: string;

	declare $refs: {
		newSticker: HTMLDivElement;
	};

	mounted() {
		// TODO(vue3)
		// Self-destroy after animation finishes.
		this.$refs.newSticker.addEventListener('animationend', () => {
			this.$destroy();
			this.$el.parentNode?.removeChild(this.$el);
		});
	}
}
