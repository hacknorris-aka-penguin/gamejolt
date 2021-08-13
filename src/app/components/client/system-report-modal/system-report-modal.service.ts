import { defineAsyncComponent } from 'vue';
import { showModal } from '../../../../_common/modal/modal.service';

export class ClientSystemReportModal {
	static async show() {
		return await showModal<void>({
			modalId: 'ClientSystemReport',
			component: defineAsyncComponent(
				() =>
					import(
						/* webpackChunkName: "ClientSystemReportModal" */ './system-report-modal.vue'
					)
			),
			size: 'sm',
		});
	}
}
