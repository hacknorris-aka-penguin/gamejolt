import { asyncComponentLoader } from '../../../../../utils/utils';
import { Modal } from '../../../../../_common/modal/modal.service';
import { RouteStatus } from '../../fireside';
import { FiresideHostRTC } from '../../fireside-host-rtc';
import { FiresideController } from '../../controller';

export class FiresideStatsModal {
	static async show(
		controller: FiresideController,
		status: RouteStatus,
		hostRtc: FiresideHostRTC | null,
		isStreaming: boolean
	) {
		return await Modal.show<void>({
			modalId: 'firesideStats',
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "FiresideStatsModal" */ './modal.vue')
				),
			props: {
				controller,
				status,
				hostRtc,
				isStreaming,
			},
			size: 'sm',
		});
	}
}
