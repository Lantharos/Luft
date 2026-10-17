import { defineCollection } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { repoDocsLoader } from './loaders/repo-docs';
import { repoDocs } from './repo-docs';

export const collections = {
	docs: defineCollection({ loader: repoDocsLoader(docsLoader(), repoDocs), schema: docsSchema() })
};
