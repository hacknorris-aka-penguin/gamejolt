import { Component } from 'vue-property-decorator';
import View from '!view!./about.html?style=./about.styl';

import { BaseRouteComponent } from '../../../../../lib/gj-lib-client/components/route/route-component';
import { Screen } from '../../../../../lib/gj-lib-client/components/screen/screen-service';
import { AppState, AppStore } from '../../../../../lib/gj-lib-client/vue/services/app/app-store';
import { AppAuthRequired } from '../../../../../lib/gj-lib-client/components/auth/auth-required-directive.vue';

interface ContentRow {
	class: string;
	title: string;
	content: string;
	imageMobile: string;
	imageTablet?: string;
	imageDesktop: string;
	alt: string;
}

@View
@Component({
	name: 'RouteLandingJamsAbout',
	directives: {
		AppAuthRequired,
	},
})
export default class RouteLandingJamsAbout extends BaseRouteComponent {
	@AppState user: AppStore['user'];

	contentRows: ContentRow[] = [
		{
			class: 'easy-use',
			title: `Easy to Use<br>(except by robots)`,
			content: `Good thing you're not a robot. Get started in seconds with a simple interface that was designed for ease of use - by humans. It's seriously freakin' easy.`,
			imageMobile: require('./jemima-small.png'),
			imageTablet: require('./jemima-med.png'),
			imageDesktop: require('./jemima-large.png'),
			alt: `Jam with me, okay? heart`,
		},
		{
			class: 'toggle-features',
			title: `Use What You Want`,
			content: `...and turn off what you don't! Decide what features work for your jam, like an activity feed or developer livestreaming via Twitch. Don't want it? Just toggle it off!`,
			imageMobile: require('./use-what-you-want-small.png'),
			imageDesktop: require('./use-what-you-want-large.png'),
			alt: `Toggle activity feed`,
		},
		{
			class: 'moderate',
			title: `Moderation Tools`,
			content: `Once you set up us the jam, it basically runs itself. However, you can step in as needed and hide rule-breaking games, accept late entries, etc.`,
			imageMobile: require('./easy-moderation-small.png'),
			imageDesktop: require('./easy-moderation-large.png'),
			alt: `Moderate game entries`,
		},
		{
			class: 'content-editing',
			title: `Simple Content Editing`,
			content: `You get a spiffy new website with a custom URL. Create and delete pages with a click. Edit pages using simple to learn markdown syntax and watch it compile into HTML as you type!`,
			imageMobile: require('./content-editing-small.png'),
			imageDesktop: require('./content-editing-large.png'),
			alt: `Content Editor`,
		},
		{
			class: 'themes',
			title: `Custom Visual Themes`,
			content: `Use the theme customizer to play around with the look of your jam pages to your heart's content. Break out of the mold and give your site its own unique style!`,
			imageMobile: require('./custom-visual-themes-small.png'),
			imageDesktop: require('./custom-visual-themes-large.png'),
			alt: `Theme Customizer`,
		},
		{
			class: 'voting',
			title: `Voting Made Easy`,
			content: `Enable community voting and let the people rate the games. You can open voting to anyone or only to participants. Use a single score for each game or create custom categories to rate. The results are calculated for you!`,
			imageMobile: require('./voting-made-easy-small.png'),
			imageDesktop: require('./voting-made-easy-large.png'),
			alt: `Voting Form`,
		},
		{
			class: 'organizers',
			title: `Multiple Organizers`,
			content: `You know what they say about going alone. In a much-requested feature, you can add multiple organizers to help run your jam!`,
			imageMobile: require('./multiple-organizers-small.png'),
			imageDesktop: require('./multiple-organizers-large.png'),
			alt: `Manage jam organizers`,
		},
		{
			class: 'track',
			title: `Track Your Jams`,
			content: `Integrate with a Google Analytics account and get information about how people access your jam. You also get some slick dashboards to see how your jams are doing in real time!`,
			imageMobile: require('./track-your-jams-small.png'),
			imageDesktop: require('./track-your-jams-large.png'),
			alt: `View game entries on phone`,
		},
		{
			class: 'mobile',
			title: `Mobile Ready`,
			content: `Your jam website is responsive - it automatically displays well on mobile devices. Jam participants can stay up to date and organizers can manage the jam from their phones!`,
			imageMobile: require('./mobile-ready-small.png'),
			imageDesktop: require('./mobile-ready-large.png'),
			alt: `Jam pages on multiple devices`,
		},
		{
			class: 'easy-enter',
			title: `Easy to Enter`,
			content: `It's a snap for developers to submit games. They simply upload them to Game Jolt (accounts are free) and put the jam hashtag in the descriptions. That's it!`,
			imageMobile: require('./easy-to-enter-small.png'),
			imageDesktop: require('./easy-to-enter-large.png'),
			alt: `Tagging your game`,
		},
	];

	readonly Screen = Screen;

	get routeTitle() {
		return `Jams`;
	}

	routeInit() {
		// Meta.description = `Build your own customizable site with an indie.af domain through Game Jolt Sites!`;
		// Meta.fb = {
		// 	type: 'website',
		// 	title: this.routeTitle,
		// 	description: Meta.description,
		// };
		// Meta.twitter = {
		// 	card: 'summary_large_image',
		// 	title: this.routeTitle,
		// 	description: Meta.description,
		// };
		// Meta.fb.image = Meta.twitter.image = require('./social.png');
	}
}

// angular.module( 'App.Views' ).controller( 'HomeCtrl', function( $scope, $window, $state, Environment, payload )
// {
// 	$scope.App.title = '';

// 	this.loginRedirectUrl = Environment.baseUrl + '/auth/login?redirect='
// 		+ $window.encodeURIComponent( Environment.jamsBaseUrl + $state.href( 'add-jam' ) );

// } );
// angular.module( 'App.Views' ).config( function( $stateProvider )
// {
// 	$stateProvider.state( 'home', {
// 		url: '/',
// 		controller: 'HomeCtrl',
// 		controllerAs: 'homeCtrl',
// 		templateUrl: require('./home.html'),
// 		resolve: {
// 			payload: function( Api )
// 			{
// 				return Api.sendRequest( '/jams' );
// 			}
// 		}
// 	} );
// } );
