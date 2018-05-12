import { Component } from 'vue-property-decorator';
import View from '!view!./jams.html';

import { BaseRouteComponent } from '../../../../lib/gj-lib-client/components/route/route-component';
import { AppThemeSvg } from '../../../../lib/gj-lib-client/components/theme/svg/svg';
import { AppAuthRequired } from '../../../../lib/gj-lib-client/components/auth/auth-required-directive.vue';

@View
@Component({
	name: 'RouteLandingJams',
	components: {
		AppThemeSvg,
	},
	directives: {
		AppAuthRequired,
	},
})
export default class RouteLandingJams extends BaseRouteComponent {
	readonly Screen = Screen;
}
