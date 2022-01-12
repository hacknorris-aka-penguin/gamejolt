import { setup } from 'vue-class-component';
import { Options, Prop, Vue, Watch } from 'vue-property-decorator';
import { Api } from '../../../../_common/api/api.service';
import { formatNumber } from '../../../../_common/filters/number';
import { Game } from '../../../../_common/game/game.model';
import { GameScoreTable } from '../../../../_common/game/score-table/score-table.model';
import { Popper } from '../../../../_common/popper/popper.service';
import { Screen } from '../../../../_common/screen/screen-service';
import { useCommonStore } from '../../../../_common/store/common-store';
import { AppTimeAgo } from '../../../../_common/time/ago/ago';
import { UserGameScore } from '../../../../_common/user/game-score/game-score.model';
import AppUserAvatar from '../../../../_common/user/user-avatar/user-avatar.vue';
import AppScoreList from '../list/list.vue';
import AppScoreboardSelector from '../scoreboard-selector/scoreboard-selector.vue';

@Options({
	components: {
		AppTimeAgo,
		AppScoreboardSelector,
		AppScoreList,
		AppUserAvatar,
	},
})
export default class AppScoreOverview extends Vue {
	@Prop(Object)
	game!: Game;
	@Prop(Object)
	initialPayload?: any;
	@Prop({ type: String, default: 'full' })
	size!: 'full' | 'small';

	commonStore = setup(() => useCommonStore());

	get app() {
		return this.commonStore;
	}

	scoreTables: GameScoreTable[] = [];
	scoreTable: GameScoreTable | null = null;
	scores: UserGameScore[] = [];
	userBestScore: UserGameScore | null = null;
	userScorePlacement = 0;
	userScoreExperience = 0;

	readonly Screen = Screen;
	readonly formatNumber = formatNumber;

	// Even.
	get scoresLeft() {
		return this.scores.filter((_score, i) => i % 2 === 0);
	}

	// Odd.
	get scoresRight() {
		return this.scores.filter((_score, i) => i % 2 === 1);
	}

	created() {
		if (this.initialPayload) {
			this.processPayload(this.initialPayload);
		} else {
			this.changeTable();
		}
	}

	@Watch('initialPayload')
	onChange() {
		if (this.initialPayload) {
			this.processPayload(this.initialPayload);
		}
	}

	private processPayload(payload: any) {
		this.scoreTables = payload.scoreTables ? GameScoreTable.populate(payload.scoreTables) : [];
		this.scoreTable = payload.scoreTable ? new GameScoreTable(payload.scoreTable) : null;
		this.scores = payload.scores ? UserGameScore.populate(payload.scores) : [];
		this.userBestScore = payload.scoresUserBestScore
			? new UserGameScore(payload.scoresUserBestScore)
			: null;
		this.userScorePlacement = payload.scoresUserScorePlacement || 0;
		this.userScoreExperience = payload.scoresUserScoreExperience || 0;
	}

	async changeTable(table?: GameScoreTable) {
		Popper.hideAll();

		// Only if not current table.
		if (table && this.scoreTable && table.id === this.scoreTable.id) {
			return;
		}

		let url = '/web/discover/games/scores/overview/' + this.game.id;
		if (table) {
			url += '/' + table.id;
		}

		const payload = await Api.sendRequest(url);
		this.processPayload(payload);
	}
}
