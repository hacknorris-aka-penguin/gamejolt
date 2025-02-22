import { namespace } from 'vuex-class';
import { VuexAction, VuexModule, VuexMutation, VuexStore } from '../../utils/vuex';
import { Analytics, trackGameFollow } from '../../_common/analytics/analytics.service';
import { GamePlaylist } from '../../_common/game-playlist/game-playlist.model';
import { Game, unfollowGame } from '../../_common/game/game.model';
import { Growls } from '../../_common/growls/growls.service';
import { ModalConfirm } from '../../_common/modal/confirm/confirm-service';
import { Scroll } from '../../_common/scroll/scroll.service';
import { Translate } from '../../_common/translate/translate.service';
import { GamePlaylistSaveModal } from '../components/game-playlist/save-modal/save-modal.service';
import { GameCollection } from '../components/game/collection/collection.model';
import { router } from '../views';

export const LibraryStoreNamespace = 'library';
export const LibraryModule = namespace(LibraryStoreNamespace);

export type Actions = {
	'library/followCollection': GameCollection;
	'library/unfollowCollection': GameCollection;
	'library/newPlaylist': undefined;
	'library/editPlaylist': GameCollection;
	'library/removePlaylist': GameCollection;
	'library/addGameToPlaylist': { playlist: GamePlaylist; game: Game };
	'library/removeGameFromPlaylist': {
		playlist: GamePlaylist;
		game: Game;
		shouldConfirm?: boolean;
	};
	'library/unfollowGame': Game;
};

export type Mutations = {
	'library/bootstrap': any;
	'library/clear': undefined;
	'library/addCollection': GameCollection;
	'library/removeCollection': GameCollection;
};

class GamePlaylistFolder {
	constructor(public title: string, public collections: GameCollection[]) {}
}

function isViewingCollection(collection: GameCollection) {
	return (
		router.currentRoute.name === collection.routeLocation.name &&
		router.currentRoute.params.id === (collection as any).id
	);
}

@VuexModule()
export class LibraryStore extends VuexStore<LibraryStore, Actions, Mutations> {
	collections: GameCollection[] = [];
	followedCollection: GameCollection | null = null;
	developerCollection: GameCollection | null = null;
	ownedCollection: GameCollection | null = null;
	bundleCollections: GameCollection[] = [];

	/**
	 * These are their followed developer playlists.
	 */
	get developerPlaylists() {
		return this.collections.filter(item => item.type === GameCollection.TYPE_DEVELOPER);
	}

	/**
	 * These are their followed jams.
	 */
	get jamPlaylists() {
		return this.collections.filter(item => item.type === GameCollection.TYPE_JAM);
	}

	/**
	 * These are playlists that don't belong to a folder.
	 */
	get mainPlaylists() {
		return this.collections.filter(
			item =>
				item.type !== GameCollection.TYPE_DEVELOPER && item.type !== GameCollection.TYPE_JAM
		);
	}

	/**
	 * Returns a list of folders for their playlists.
	 */
	get playlistFolders() {
		const folders: { [k: string]: GamePlaylistFolder } = {};

		folders.main = new GamePlaylistFolder('', this.mainPlaylists);

		const developerPlaylists: GameCollection[] = this.developerPlaylists;
		if (developerPlaylists.length) {
			folders.developers = new GamePlaylistFolder(
				Translate.$gettext('Followed Developers'),
				developerPlaylists
			);
		}

		const jamPlaylists: GameCollection[] = this.jamPlaylists;
		if (jamPlaylists.length) {
			folders.jams = new GamePlaylistFolder(
				Translate.$gettext('Followed Jams'),
				jamPlaylists
			);
		}

		return folders;
	}

	@VuexMutation
	bootstrap(payload: Mutations['library/bootstrap']) {
		this.collections = GameCollection.populate(payload.collections);
		this.followedCollection = payload.followedCollection
			? new GameCollection(payload.followedCollection)
			: null;
		this.developerCollection = payload.developerCollection
			? new GameCollection(payload.developerCollection)
			: null;
		this.ownedCollection = payload.ownedCollection
			? new GameCollection(payload.ownedCollection)
			: null;
		this.bundleCollections = GameCollection.populate(payload.bundleCollections);
	}

	@VuexMutation
	clear() {
		this.collections = [];
		this.followedCollection = null;
		this.developerCollection = null;
		this.ownedCollection = null;
		this.bundleCollections = [];
	}

	@VuexMutation
	addCollection(collection: Mutations['library/addCollection']) {
		this.collections.push(collection);
	}

	@VuexMutation
	removeCollection(collection: Mutations['library/removeCollection']) {
		const index = this.collections.findIndex(item => item._id === collection._id);
		if (index !== -1) {
			this.collections.splice(index, 1);
		}
	}

	@VuexAction
	async followCollection(collection: Actions['library/followCollection']) {
		this.addCollection(collection);

		try {
			await collection.$follow();
		} catch (e) {
			this.removeCollection(collection);
			throw e;
		}
	}

	@VuexAction
	async unfollowCollection(collection: Actions['library/unfollowCollection']) {
		this.removeCollection(collection);

		try {
			await collection.$unfollow();
		} catch (e) {
			this.addCollection(collection);
			throw e;
		}
	}

	@VuexAction
	async newPlaylist() {
		Analytics.trackEvent('add-to-playlist', 'new-playlist');

		const collection = await GamePlaylistSaveModal.show();
		if (collection) {
			this.addCollection(collection);
			Analytics.trackEvent('add-to-playlist', 'new-playlist-complete');
		}

		return collection;
	}

	@VuexAction
	async editPlaylist(collection: Actions['library/editPlaylist']) {
		// If we're viewing the playlist we're editing, we want to sync the
		// new URL after.
		const syncUrlAfter = isViewingCollection(collection);

		if (await GamePlaylistSaveModal.show(collection)) {
			if (syncUrlAfter) {
				Scroll.shouldAutoScroll = false;
				router.replace(collection.routeLocation);
			}
		}
	}

	@VuexAction
	async removePlaylist(collection: Actions['library/removePlaylist']) {
		if (!collection.playlist) {
			throw new Error(`Collection isn't a playlist.`);
		}

		const result = await ModalConfirm.show(
			collection.isOwner
				? Translate.$gettext(`Are you sure you want to remove this playlist?`)
				: Translate.$gettext(`Are you sure you want to unfollow this playlist?`)
		);

		if (!result) {
			return false;
		}

		try {
			await collection.playlist.$remove();
			this.removeCollection(collection);

			// If they're currently on the playlist page, let's push them to
			// the library instead.
			if (isViewingCollection(collection)) {
				router.replace({ name: 'library.overview' });

				Growls.success(
					Translate.$gettextInterpolate(
						collection.isOwner
							? Translate.$gettext(`%{ playlist } has been removed.`)
							: Translate.$gettext(`You have unfollowed %{ playlist }.`),
						{ playlist: collection.name }
					),
					Translate.$gettext(
						collection.isOwner
							? Translate.$gettext(`Playlist Removed`)
							: Translate.$gettext(`Playlist Unfollowed`)
					)
				);

				return true;
			}
		} catch (e) {
			Growls.error(Translate.$gettext(`Error! Error! Unable to unfollow this playlist.`));
		}

		return false;
	}

	@VuexAction
	async addGameToPlaylist({ playlist, game }: Actions['library/addGameToPlaylist']) {
		try {
			await playlist.$addGame(game.id);

			Growls.success(
				Translate.$gettextInterpolate(`You've added %{ game } to %{ playlist }. Nice!`, {
					game: game.title,
					playlist: playlist.name,
				}),
				Translate.$gettext(`Added Game`)
			);

			return true;
		} catch (e) {
			Growls.error(
				Translate.$gettext(`Error! Error! This game could not be added to the playlist.`)
			);
		}

		return false;
	}

	@VuexAction
	async removeGameFromPlaylist({
		playlist,
		game,
		shouldConfirm,
	}: Actions['library/removeGameFromPlaylist']) {
		if (!playlist) {
			throw new Error(`Invalid collection passed in.`);
		}

		if (shouldConfirm) {
			const result = await ModalConfirm.show(
				Translate.$gettext('library.playlists.remove_game_confirmation')
			);

			if (!result) {
				return false;
			}
		}

		try {
			await playlist.$removeGame(game.id);

			Growls.success(
				Translate.$gettextInterpolate(
					`You have successfully removed %{ game } from %{ playlist }.`,
					{ game: game.title, playlist: playlist.name }
				),
				Translate.$gettext(`Removed Game`)
			);

			return true;
		} catch (e) {
			Growls.error(
				Translate.$gettext(
					`Error! Error! This game could not be removed from the playlist.`
				)
			);
		}

		return false;
	}

	@VuexAction
	async unfollowGame(game: Actions['library/unfollowGame']) {
		const result = await ModalConfirm.show(
			Translate.$gettextInterpolate(`Are you sure you want to stop following %{ game }?`, {
				game: game.title,
			})
		);

		if (!result) {
			return false;
		}

		let failed = false;
		try {
			await unfollowGame(game);

			Growls.success(
				Translate.$gettextInterpolate(
					`You have stopped following %{ game } and will no longer receive notifications about it.`,
					{ game: game.title }
				),
				Translate.$gettext(`Game Unfollowed`)
			);

			return true;
		} catch (e) {
			failed = true;
			Growls.error(
				Translate.$gettext(`Uh-oh, something has prevented you from unfollowing this game.`)
			);
		} finally {
			trackGameFollow(false, { failed, location: 'library' });
		}

		return false;
	}
}
