import MiniSearch, { type AsPlainObject, type Options } from "minisearch";
import { stemmer as englishStemmer } from "@orama/stemmers/english";
import { stemmer as spanishStemmer } from "@orama/stemmers/spanish";
import { stopwords as englishStopwords } from "@orama/stopwords/english";
import { stopwords as spanishStopwords } from "@orama/stopwords/spanish";
import type { ArticleIndexEntry, ArticleManifest } from "@/lib/articles/article-manifest";

type Language = ArticleIndexEntry["language"];
type ArticleItem = Pick<ArticleIndexEntry, "slug" | "title" | "description" | "date" | "tags">;
type SearchDocument = Omit<ArticleIndexEntry, "keywords"> & { keywords: string };
type SearchArticle = ArticleItem & { language: Language; positions: string[][] };
type SearchQuery = { q?: string; tag?: string; limit: number; offset: number };
type QueryAtom = { text: string; exclude: boolean; phrase: boolean };

export type ArticleSearchBundle = {
  revision: string;
  articles: SearchArticle[];
  indexes: Record<Language, AsPlainObject>;
};

export type ArticleSearch = {
  query(input: SearchQuery): { items: ArticleItem[]; total: number };
};

const languages = ["en", "es"] as const;
const fields = ["title", "description", "keywords", "bodyText"] as const;
const analyzers = {
  en: { stem: englishStemmer, stopwords: new Set(englishStopwords) },
  es: { stem: spanishStemmer, stopwords: new Set(spanishStopwords) },
};

function tokenize(text: string) {
  return (
    text
      .normalize("NFKC")
      .toLowerCase()
      .match(/[\p{L}\p{N}_]+/gu) ?? []
  );
}

function processTerm(term: string, language: Language) {
  const analyzer = analyzers[language];

  return analyzer.stopwords.has(term) ? "" : analyzer.stem(term);
}

function options(language: Language): Options<SearchDocument> {
  return {
    idField: "slug",
    fields: [...fields],
    tokenize,
    processTerm: (term) => processTerm(term, language),
    searchOptions: {
      combineWith: "AND",
      boost: { title: 8, description: 3, keywords: 3, bodyText: 1 },
    },
  };
}

export function article_buildSearch(manifest: ArticleManifest): ArticleSearchBundle {
  const indexes = { en: new MiniSearch(options("en")), es: new MiniSearch(options("es")) };
  const articles = manifest.articles.map((article) => {
    const document = { ...article, keywords: article.keywords.join(" ") };

    indexes[article.language].add(document);

    return {
      slug: article.slug,
      title: article.title,
      description: article.description,
      date: article.date,
      tags: article.tags,
      language: article.language,
      positions: fields.map((field) =>
        tokenize(document[field]).map((term) => processTerm(term, article.language)),
      ),
    };
  });

  return {
    revision: manifest.revision,
    articles,
    indexes: { en: indexes.en.toJSON(), es: indexes.es.toJSON() },
  };
}

function parseQuery(query: string) {
  const groups: QueryAtom[][] = [[]];

  for (const token of query.match(/-?"[^"]*(?:"|$)|[^\s"]+/gu) ?? []) {
    if (token.toUpperCase() === "OR") {
      if (groups[groups.length - 1].length) groups.push([]);
      continue;
    }
    const exclude = token.startsWith("-");
    const text = exclude ? token.slice(1) : token;
    const phrase = text.startsWith('"');

    groups[groups.length - 1].push({
      text: phrase ? text.slice(1).replace(/"$/, "") : text,
      exclude,
      phrase,
    });
  }

  return groups;
}

function matchesPhrase(positions: string[][], terms: string[]) {
  const first = terms.findIndex(Boolean);
  let end = terms.length;

  while (end > first && !terms[end - 1]) end--;

  // Stopwords occupy positions but do not require a particular word, like websearch phrases.
  return positions.some((field) => {
    for (let start = 0; start <= field.length - (end - first); start++) {
      let offset = first;

      while (offset < end && (!terms[offset] || terms[offset] === field[start + offset - first])) {
        offset++;
      }
      if (offset === end) return true;
    }

    return false;
  });
}

export function article_loadSearch(bundle: ArticleSearchBundle): ArticleSearch {
  const indexes = new Map<Language, MiniSearch<SearchDocument>>();
  const articles = new Map(bundle.articles.map((article) => [article.slug, article]));
  const ordered = [...bundle.articles].sort(
    (a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug),
  );

  function search(query: string) {
    const groups = parseQuery(query);
    const scores = new Map<string, number>();

    for (const language of languages) {
      let index = indexes.get(language);

      if (!index) {
        index = MiniSearch.loadJS(bundle.indexes[language], options(language));
        indexes.set(language, index);
      }
      for (const group of groups) {
        let candidates: Map<string, number> | undefined;
        const excluded = new Set<string>();
        let hasExclusion = false;

        for (const atom of group) {
          const terms = tokenize(atom.text).map((term) => processTerm(term, language));

          if (!terms.some(Boolean)) continue;
          const matches = new Map<string, number>();

          for (const result of index.search(atom.text)) {
            const article = articles.get(result.id)!;

            if (!atom.phrase || matchesPhrase(article.positions, terms)) {
              matches.set(article.slug, result.score);
            }
          }
          if (atom.exclude) {
            hasExclusion = true;
            for (const slug of matches.keys()) excluded.add(slug);
          } else if (!candidates) {
            candidates = matches;
          } else {
            for (const [slug, score] of candidates) {
              const next = matches.get(slug);

              if (next === undefined) candidates.delete(slug);
              else candidates.set(slug, score + next);
            }
          }
        }
        if (!candidates && hasExclusion) {
          candidates = new Map(
            ordered.filter((article) => article.language === language).map(({ slug }) => [slug, 0]),
          );
        }
        for (const [slug, score] of candidates ?? []) {
          if (!excluded.has(slug)) scores.set(slug, Math.max(scores.get(slug) ?? 0, score));
        }
      }
    }

    return scores;
  }

  return {
    query(input: SearchQuery) {
      const scores = input.q ? search(input.q) : undefined;
      const matches = ordered.filter(
        (article) =>
          (!input.tag || article.tags.includes(input.tag)) && (!scores || scores.has(article.slug)),
      );

      // Stable sort retains date/slug ordering when relevance scores tie.
      if (scores) matches.sort((a, b) => scores.get(b.slug)! - scores.get(a.slug)!);

      return {
        items: matches
          .slice(input.offset, input.offset + input.limit)
          .map((article): ArticleItem => ({
            slug: article.slug,
            title: article.title,
            description: article.description,
            date: article.date,
            tags: article.tags,
          })),
        total: matches.length,
      };
    },
  };
}
