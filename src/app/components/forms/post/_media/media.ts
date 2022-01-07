import { Emit, mixins, Options, Prop } from 'vue-property-decorator';
import { Api } from '../../../../../_common/api/api.service';
import { FiresidePost } from '../../../../../_common/fireside/post/post-model';
import AppFormControlUpload from '../../../../../_common/form-vue/controls/upload/AppFormControlUpload.vue';
import AppFormControlUploadTS from '../../../../../_common/form-vue/controls/upload/upload';
import {
	BaseForm,
	FormOnSubmit,
	FormOnSubmitError,
	FormOnSubmitSuccess,
} from '../../../../../_common/form-vue/form.service';
import { AppImgResponsive } from '../../../../../_common/img/responsive/responsive';
import AppLoadingFade from '../../../../../_common/loading/AppLoadingFade.vue';
import { MediaItem } from '../../../../../_common/media-item/media-item-model';
import AppScrollScroller from '../../../../../_common/scroll/scroller/scroller.vue';
import AppFormPostMediaItem from './item/item.vue';

// TODO(vue3)
// const draggable = require('vuedraggable');

interface FormModel {
	image: File[] | null;
	_progress: ProgressEvent | null;
}

class Wrapper extends BaseForm<FormModel> {}

@Options({
	components: {
		// draggable,
		AppScrollScroller,
		AppImgResponsive,
		AppFormPostMediaItem,
		AppFormControlUpload,
		AppLoadingFade,
	},
})
export default class AppFormPostMedia
	extends mixins(Wrapper)
	implements FormOnSubmit, FormOnSubmitSuccess, FormOnSubmitError
{
	@Prop(FiresidePost)
	post!: FiresidePost;

	@Prop(Number)
	maxFilesize!: number;

	@Prop(Number)
	maxWidth!: number;

	@Prop(Number)
	maxHeight!: number;

	@Prop(Array)
	mediaItems!: MediaItem[];

	@Prop(Boolean)
	loading?: boolean;

	isDropActive = false;

	declare $refs: {
		upload: AppFormControlUploadTS;
	};

	@Emit('upload')
	emitUpload(_newMediaItems: MediaItem[]) {}

	@Emit('error')
	emitError(_reason: string) {}

	@Emit('sort')
	emitSort(_mediaItems: MediaItem[]) {}

	@Emit('remove')
	emitRemove(_mediaItem: MediaItem) {}

	get isLoading() {
		return this.form.isProcessing || this.loading;
	}

	get internalItems() {
		return this.mediaItems;
	}

	set internalItems(mediaItems: MediaItem[]) {
		this.emitSort(mediaItems);
	}

	created() {
		this.form.resetOnSubmit = true;
	}

	onInit() {
		this.setField('image', null);
	}

	mediaSelected() {
		if (this.formModel.image !== null) {
			this.form.submit();
		}
	}

	showSelectMedia() {
		this.$refs.upload.showFileSelect();
	}

	onDragOver(e: DragEvent) {
		// Don't do anything if not a file drop.
		if (
			!e.dataTransfer ||
			!e.dataTransfer.items.length ||
			e.dataTransfer.items[0].kind !== 'file'
		) {
			return;
		}

		e.preventDefault();
		this.isDropActive = true;
	}

	onDragLeave() {
		this.isDropActive = false;
	}

	// File select resulting from a drop onto the input.
	async onDrop(e: DragEvent) {
		// Don't do anything if not a file drop.
		if (
			!e.dataTransfer ||
			!e.dataTransfer.items.length ||
			e.dataTransfer.items[0].kind !== 'file'
		) {
			return;
		}

		e.preventDefault();
		this.isDropActive = false;
		this.$refs.upload.drop(e);
	}

	async onSubmit() {
		return Api.sendRequest(
			`/web/posts/manage/add-media/${this.post.id}`,
			{},
			{
				file: this.formModel.image,
				progress: e => this.setField('_progress', e),
			}
		);
	}

	onSubmitSuccess(response: any) {
		this.emitUpload(MediaItem.populate(response.mediaItems));
	}

	onSubmitError(response: any) {
		this.emitError(response.reason);
	}
}
