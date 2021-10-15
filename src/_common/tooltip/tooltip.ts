import flip from '@popperjs/core/lib/modifiers/flip';
import hide from '@popperjs/core/lib/modifiers/hide';
import preventOverflow from '@popperjs/core/lib/modifiers/preventOverflow';
import { createPopper, Instance, Options as PopperOptions } from '@popperjs/core/lib/popper-lite';
import { nextTick } from 'vue';
import { Options, Prop, Vue, Watch } from 'vue-property-decorator';
import { TooltipController } from './tooltip-controller';

@Options({})
export default class TooltipComponent extends Vue {
	@Prop({ type: TooltipController, required: false })
	tooltip?: TooltipController;

	declare $el: HTMLDivElement;

	private popperInstance: null | Instance = null;
	private popperTimeout: null | NodeJS.Timer = null;

	beforeUnmount() {
		this.destroyPopper();
	}

	// We need to watch for changes of the tooltip instance and its data.
	@Watch('tooltip', { deep: true })
	async check() {
		// Wait for the tooltip to be mounted.
		await nextTick();

		if (!this.tooltip || !this.tooltip.text || !this.tooltip.isActive) {
			return this.scheduleDestroy();
		}

		this.show();
	}

	private show() {
		if (!this.tooltip) {
			return;
		}

		const options: PopperOptions = {
			placement: this.tooltip.placement,
			modifiers: [flip, preventOverflow, hide],
			strategy: 'absolute',
		};

		if (!this.popperInstance) {
			this.popperInstance = createPopper(this.tooltip.el, this.$el, options);
		} else {
			this.clearPopperTimeout();
			this.popperInstance.setOptions(options);
			// Set the popper reference element to the new tooltip element.
			this.popperInstance.state.elements.reference = this.tooltip.el;
		}
	}

	private scheduleDestroy() {
		// Making sure the popper is positioned where it should be if the text
		// content changes. We only want to do this if the tooltip is active though,
		// otherwise we might update positioning to a non-existant reference element.
		if (this.popperInstance && this.tooltip && this.tooltip.isActive) {
			this.popperInstance.update();
		}

		// Schedule to destroy the popper so that we don't keep checking scroll
		// position if not needed. Needs to be longer than our transition speed.
		if (!this.popperTimeout) {
			this.popperTimeout = setTimeout(() => this.destroyPopper(), 300);
		}
	}

	private clearPopperTimeout() {
		if (this.popperTimeout) {
			clearTimeout(this.popperTimeout);
			this.popperTimeout = null;
		}
	}

	private destroyPopper() {
		// Just in case it might still be scheduled.
		this.clearPopperTimeout();

		if (this.popperInstance) {
			this.popperInstance.destroy();
			this.popperInstance = null;
		}
	}
}
