import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import AppCard from '../../../../../_common/card/card.vue';
import { showSuccessGrowl } from '../../../../../_common/growls/growls.service';
import { ModalConfirm } from '../../../../../_common/modal/confirm/confirm-service';
import { PaymentSource } from '../../../../../_common/payment-source/payment-source.model';
import AppUserAddressDetails from '../../address/details/details.vue';

@Options({
	components: {
		AppCard,
		AppUserAddressDetails,
	},
})
export default class AppUserPaymentSourceCard extends Vue {
	@Prop(Object) paymentSource!: PaymentSource;
	@Prop(Boolean) showRemove?: boolean;

	@Emit('remove')
	emitRemove() {}

	get expires() {
		return this.paymentSource.exp_month + '/' + this.paymentSource.exp_year;
	}

	async remove() {
		const result = await ModalConfirm.show(
			this.$gettext(`Are you sure you want to remove this card?`)
		);
		if (!result) {
			return;
		}

		await this.paymentSource.$remove();

		showSuccessGrowl(
			this.$gettext(`Your card has successfully been removed.`),
			this.$gettext(`Card Removed`)
		);

		this.emitRemove();
	}
}
