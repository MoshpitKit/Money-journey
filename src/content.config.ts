import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const guides = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/guides" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    /** Optional related calculator slug to cross-link. */
    relatedCalc: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { guides };
