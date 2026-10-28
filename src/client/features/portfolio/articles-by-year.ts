// Groups consecutive articles that share a year. Dates use the YYYY.MM.DD form.
export function articles_groupByYear<Article extends { date: string }>(articles: Article[]) {
  const groups: { year: string; articles: Article[] }[] = [];

  for (const article of articles) {
    const year = article.date.slice(0, 4);
    const last = groups.at(-1);

    if (last?.year === year) last.articles.push(article);
    else groups.push({ year, articles: [article] });
  }

  return groups;
}
