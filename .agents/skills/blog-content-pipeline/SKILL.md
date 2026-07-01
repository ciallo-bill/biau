---
name: blog-content-pipeline
description: "Evidence-first workflow for creating, rewriting, reviewing, and publishing BIAU Port blog content. Use when planning or drafting posts for 知识积累 / Project Notes / 资源分享 / AI 日报 / 构建手记, when turning project evidence into visitor-readable technical articles, or when updating blog templates, review gates, assistant tags, sitemap/index outputs, and public blog curation."
---

# Blog Content Pipeline

Use this skill to produce polished public blog content without turning the site into an automated SEO farm. The workflow is evidence-first: collect facts, decide the column, draft with a model only after boundaries are clear, then review before publishing.

## Core Rule

Never let a model invent project facts, deployment status, metrics, screenshots, customer names, secrets, private URLs, API keys, local paths, or production infrastructure details. Treat every committed article as public.

## Workflow

1. **Pick the column**
   - Use `knowledge`, `project-notes`, `resources`, `ai-daily`, or `build-log`.
   - Read `src/data/blogShared.ts` for current column metadata.
   - If the post is project-related, decide whether it belongs on the project detail page instead. Project page = stable facts/capabilities; blog = stage review, tradeoff, lesson, fix, or iteration thinking.

2. **Build an evidence pack**
   - Read code, project data, public docs, Trellis task notes, existing project pages, deployment scripts, tests, screenshots, and prior posts.
   - Do not rely only on README files; they may be stale.
   - Record source paths and exact facts that can be stated publicly.
   - List forbidden/private details before drafting.

3. **Choose a model strategy**
   - Default: Codex gathers evidence and constraints; one strong content model drafts or rewrites; Codex reviews, edits, and ingests.
   - Good default candidates for long-form drafting: GLM-5.2, DeepSeek V4 Pro, or Gemini 3.1 Pro.
   - Use Gemini 3.5 Flash for outlines, summaries, or low-risk batch checks.
   - Use multi-model comparison only for important posts, style uncertainty, or disputed wording.
   - Default to serial calls. If parallel model use is required, explicitly split across different relays to avoid high concurrency on one gateway.

4. **Draft in the right shape**
   - Prefer Markdown or structured notes during drafting, then convert into the repository's typed `BlogPost` shape.
   - Keep title, detail, sections, takeaways, knowledge points, and tags concrete.
   - Avoid generic AI prose, résumé tone, interview tone, and “learning day” framing.
   - Keep bilingual needs at the column/UI layer unless the article itself intentionally needs bilingual copy.

5. **Review gates**
   - Fact check every project claim against the evidence pack.
   - Check that no private or sensitive information is included.
   - Check that the article does not duplicate the project detail page.
   - Check that the column matches the article's actual purpose.
   - Check that hidden drafts remain hidden unless explicitly curated.

6. **Publish or stage**
   - Update `src/data/blog.ts`, `src/data/blog-posts/<slug>.ts`, `src/data/blogContent.ts`, and `src/data/blogCuration.ts` as needed.
   - Public posts must go through `blogCuration` and public selectors.
   - Regenerate assistant knowledge and sitemap after public visibility or tag changes.

## Templates

Read `references/templates.md` when drafting a post or creating a new article outline.

## Validation

For blog data, public curation, assistant, or sitemap changes, run:

```powershell
npm.cmd run blog:audit
npm.cmd run assistant:index
npm.cmd run sitemap:generate
npm.cmd run lint
npm.cmd run build
```

Attempt `npm.cmd run verify` for broad blog, assistant, or UI changes.
