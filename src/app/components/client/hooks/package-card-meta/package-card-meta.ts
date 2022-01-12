import { Options, Prop, Vue } from 'vue-property-decorator';
import { Game } from '../../../../../_common/game/game.model';
import { GamePackageCardModel } from '../../../../../_common/game/package/card/card.model';
import { GamePackage } from '../../../../../_common/game/package/package.model';
import { ClientLibraryState, ClientLibraryStore } from '../../../../store/client-library';
import { LocalDbPackage } from '../../local-db/package/package.model';

@Options({})
export default class AppClientPackageCardMeta extends Vue {
	@ClientLibraryState packagesById!: ClientLibraryStore['packagesById'];

	@Prop(Object) game!: Game;
	@Prop(Object) package!: GamePackage;
	@Prop(Object) card!: GamePackageCardModel;

	get localPackage(): LocalDbPackage | undefined {
		return this.packagesById[this.package.id];
	}
}
