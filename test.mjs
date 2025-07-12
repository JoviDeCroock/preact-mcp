import MiniSearch from 'minisearch';

const text = await fetch('https://preactjs.com/llms.txt').then(res => res.text());

const splitPoint = `---

**Description:**`

const searchIndex = new MiniSearch({
  fields: ['content', 'section'],
});

  const entries = text.split(splitPoint);
  const documents = [];

  for (const entry of entries) {
    const lines = entry.split('\n').map(line => line.trim()).filter(line => line);
    if (lines.length === 0) continue;

    const titleMatch = lines.find(line => line.startsWith('# ') || line.startsWith('## '));
    const section = (titleMatch || 'Unknown Section').replace(/^#+\s*/, '').trim();
    const descriptionMatch = lines[0]
    const description = descriptionMatch ? descriptionMatch.replace(/^\*\*description:\*\*\s*/, '').trim() : '';

    documents.push({
      id: `${section}-${entries.indexOf(entry)}`,
      section,
      description,
      context: entry
    });
  }

  searchIndex.addAll(documents);

searchIndex.search('signals').forEach(result => {
  console.log(`Found in ${JSON.stringify(result)}`);
});

