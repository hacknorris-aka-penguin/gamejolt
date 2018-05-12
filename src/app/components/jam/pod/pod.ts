import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./pod.html';

import { Jam } from '../../../../lib/gj-lib-client/components/jam/jam.model';
import { AppFadeCollapse } from '../../../../lib/gj-lib-client/components/fade-collapse/fade-collapse';
import { Environment } from '../../../../lib/gj-lib-client/components/environment/environment.service';
import { AppJamProgressBar } from '../progress-bar/progress-bar';

@View
@Component({
	components: {
		AppFadeCollapse,
		AppJamProgressBar,
	},
})
export class AppJamPod extends Vue {
	@Prop(Jam) jam: Jam;

	showFullDescription = false;
	canToggleDescription = false;

	now = 0;

	get url() {
		if (!this.jam.domain) {
			return Environment.jamsIoBaseUrl + '/' + this.jam.url;
		} else {
			return 'http://' + this.jam.domain;
		}
	}

	get isFinished() {
		return this.now > this.jam.end_date;
	}

	created() {
		this.now = Date.now();
	}
}
