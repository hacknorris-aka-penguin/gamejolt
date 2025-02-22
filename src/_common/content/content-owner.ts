import { ContentContext, ContextCapabilities } from './content-context';
import { ContentDocument } from './content-document';
import { ContentRules } from './content-editor/content-rules';
import { ContentHydrator } from './content-hydrator';

export interface ContentOwner {
	getHydrator(): ContentHydrator;
	getContextCapabilities(): ContextCapabilities;
	getContext(): ContentContext;

	getContent(): ContentDocument | null;
	setContent(content: ContentDocument): void;

	getModelId(): Promise<number>;

	getContentRules(): ContentRules;
}
