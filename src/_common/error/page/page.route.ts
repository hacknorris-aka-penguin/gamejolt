import { h } from 'vue';
import { Options, Vue } from 'vue-property-decorator';
import { RouteRecordRaw } from 'vue-router';
import { AppMutation, AppStore } from '../../store/app-store';

// Just a placeholder that sets the 404 error state.
@Options({
	// Explicitly set the name since we rely on it when checking if a route is known by a section router.
	// If it returns a route whose name is RouteError404 the url is not considered to be part of the router.
	name: 'RouteError404',
})
export class RouteError404 extends Vue {
	@AppMutation setError!: AppStore['setError'];

	created() {
		this.setError(404);
	}

	render() {
		return h('div');
	}
}

export const routeError404: RouteRecordRaw = {
	name: 'error.404',
	path: '/:_(.*)',
	component: RouteError404,
};
