import { loadScript } from '../../../utils/utils';
import { AdSlot } from '../ad-slot-info';
import { AdAdapterBase } from '../adapter-base';
import AppAdPlaywire from './playwire.vue';
import AppAdPlaywireVideo from './video';

export class AdPlaywireAdapter extends AdAdapterBase {
	hasVideoSupport = true;

	/** Queue of commands to run once the adapter has loaded. */
	private cmd: Function[] = [];
	private hasLoaded = false;

	component(slot: AdSlot) {
		return slot.size === 'video' ? AppAdPlaywireVideo : AppAdPlaywire;
	}

	ensureLoaded() {
		this.runOnce(() => {
			console.log('ensure loaded');
			(window as any).tyche = {
				mode: 'tyche',
				config: 'https://config.playwire.com/1391/v2/websites/30391/banner.json',
				passiveMode: true,
				onReady: () => {
					this.hasLoaded = true;
					console.log('on ready');

					// When it's loaded in, run through all the queued commands.
					for (const cmd of this.cmd) {
						cmd();
					}
					this.cmd = [];
				},
			};

			loadScript('https://cdn.intergient.com/pageos/pageos.js');
		});
	}

	run(cb: () => void) {
		if (GJ_IS_SSR) {
			return;
		}

		this.ensureLoaded();

		const cmd = () => {
			try {
				cb();
			} catch (e) {
				console.warn('Playwire: Failed to execute function call.', e);
			}
		};

		// If we are already loaded, invoke immediately, otherwise queue it up
		// to run once loaded.
		if (this.hasLoaded) {
			cmd();
		} else {
			this.cmd.push(cmd);
		}
	}
}
