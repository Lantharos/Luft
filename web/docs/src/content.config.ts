import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { asksSchema } from './asks/schema';

const schema = docsSchema({ extend: z.object({ asks: asksSchema.optional() }) });

export const collections = {
	docs: defineCollection({ loader: docsLoader(), schema: (context) => schema(context).strict() })
};
