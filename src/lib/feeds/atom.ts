export interface AtomEntry {
  title: string;
  url: string;
  published: string;
  updated: string;
  summary: string;
  content: string;
}

const escapeXml = (value: string) =>
  value.replace(/[<>&"']/g, (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[char] ?? char);

/** Serialize already-public post data as Atom 1.0, escaping all user-authored XML text. */
export function renderAtomFeed(input: {
  title: string;
  author: string;
  home: string;
  self: string;
  entries: AtomEntry[];
}): string {
  const updated = input.entries.reduce(
    (latest, entry) => (entry.updated > latest ? entry.updated : latest),
    '1970-01-01T00:00:00.000Z',
  );
  const entries = input.entries
    .map(
      (entry) =>
        `<entry><id>${escapeXml(entry.url)}</id><title>${escapeXml(entry.title)}</title><link href="${escapeXml(entry.url)}"/><published>${entry.published}</published><updated>${entry.updated}</updated><summary>${escapeXml(entry.summary)}</summary><content type="html">${escapeXml(entry.content)}</content></entry>`,
    )
    .join('');
  return `<?xml version="1.0" encoding="utf-8"?><feed xmlns="http://www.w3.org/2005/Atom"><id>${escapeXml(input.home)}</id><title>${escapeXml(input.title)}</title><link href="${escapeXml(input.home)}"/><link rel="self" href="${escapeXml(input.self)}"/><updated>${updated}</updated><author><name>${escapeXml(input.author)}</name></author>${entries}</feed>`;
}
