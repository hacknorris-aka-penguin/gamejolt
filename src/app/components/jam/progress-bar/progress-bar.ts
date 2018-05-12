import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./progress-bar.html?style=./progress-bar.styl';

import { Jam } from '../../../../lib/gj-lib-client/components/jam/jam.model';
import { AppProgressBar } from '../../../../lib/gj-lib-client/components/progress/bar/bar';
import { date } from '../../../../lib/gj-lib-client/vue/filters/date';
import { duration } from '../../../../lib/gj-lib-client/vue/filters/duration';

@View
@Component({
	components: {
		AppProgressBar,
	},
	filters: {
		date,
	},
})
export class AppJamProgressBar extends Vue {
	@Prop(Jam) jam: Jam;

	now = 0;

	get progress() {
		return (this.now - this.jam.start_date) / (this.jam.end_date - this.jam.start_date) * 100;
	}

	get timeDuration() {
		// If haven't started yet, show the duration that it will go for.
		if (this.now < this.jam.start_date) {
			return duration((this.jam.end_date - this.jam.start_date) / 1000);
		}

		// If it has started, show time left.
		return duration((this.jam.end_date - this.now) / 1000);
	}

	created() {
		this.now = Date.now();
	}
	// scope.now = Date.now();
	// 		scope.progress = (scope.now - scope.jam.start_date) / (scope.jam.end_date - scope.jam.start_date) * 100;

	// 		scope.diffSeconds = $window.moment( scope.jam.start_date ).diff( $window.moment( scope.jam.end_date ), 'seconds' );
	// 		scope.lengthHumanized = $window.moment.duration( scope.diffSeconds, 'seconds' ).humanize();
}
