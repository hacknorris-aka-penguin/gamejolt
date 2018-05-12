import { Route } from 'vue-router';
import { Component } from 'vue-property-decorator';
import View from '!view!./list.html?style=./list.styl';

import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../lib/gj-lib-client/components/route/route-component';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import { AppJamPod } from '../../../../components/jam/pod/pod';
import { Jam } from '../../../../../lib/gj-lib-client/components/jam/jam.model';
import { AppLoading } from '../../../../../lib/gj-lib-client/vue/components/loading/loading';

@View
@Component({
	name: 'RouteLandingJamsList',
	components: {
		AppJamPod,
		AppLoading,
	},
})
export default class RouteLandingJamsList extends BaseRouteComponent {
	jams: Jam[] = [];

	@RouteResolve({ lazy: true })
	routeResolve(this: undefined, route: Route) {
		let queryPieces = [];
		let queryString = '?';
		let period = 'active';

		// if ( $stateParams.year ) {
		// 	queryPieces.push( 'year=' + $stateParams.year );
		// }

		// if ( $stateParams.month ) {
		// 	queryPieces.push( 'month=' + $stateParams.month );
		// }

		// if ( queryPieces.length ) {
		// 	queryString += queryPieces.join( '&' );
		// }

		return Api.sendRequest('/jams/browse/' + period + queryString);
	}

	routed($payload: any) {
		this.jams = Jam.populate($payload.jams);

		// browseCtrl.activeYears = payload.activeYears;
		// browseCtrl.activeMonths = payload.activeMonths;

		// browseCtrl.currentYear = payload.currentYear;
		// browseCtrl.currentMonth = payload.currentMonth;

		// browseCtrl.numActiveJams = payload.numActiveJams;
		// browseCtrl.numFutureJams = payload.numFutureJams;
		// browseCtrl.numPastJams = payload.numPastJams;

		// $scope.App.title = 'Browse Jams';

		// this.organizers = Jam_Organizer.populate( payload.organizers );

		// browseCtrl.currentPeriod = $stateParams.period;

		// // Only Future and Past jams need to show the date selector.
		// browseCtrl.isShowingDateSelector = (browseCtrl.currentPeriod == 'future' || browseCtrl.currentPeriod == 'past');

		// browseCtrl.jams = Jam.populate( payload.jams );
		// browseCtrl.votingJams = [];

		// // For active jams, we want to break out betweet voting and not.
		// if ( browseCtrl.currentPeriod == 'active' ) {
		// 	var now = Date.now();

		// 	browseCtrl.votingJams = _.filter( browseCtrl.jams, function( jam )
		// 	{
		// 		return now >= jam.end_date;
		// 	} );

		// 	browseCtrl.jams = _.filter( browseCtrl.jams, function( jam )
		// 	{
		// 		return now < jam.end_date;
		// 	} );
		// }
	}
}
