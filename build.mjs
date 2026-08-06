// Build ventures.atomicscaling.com — renders content.json into template.html → docs/index.html
// Zero dependencies. Run: node build.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const content = JSON.parse(readFileSync('content.json', 'utf8'));
const template = readFileSync('template.html', 'utf8');
const { site, stats, portfolio, endorsements, endorsementsNote, team, criteria, legal } = content;

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Values marked TODO-* are omitted from the rendered page and reported at the end.
const todos = [];
const val = (v, where) => {
  if (typeof v === 'string' && v.startsWith('TODO')) {
    todos.push(`${where}: ${v}`);
    return '';
  }
  return v;
};

const statsHtml = stats
  .map(
    (s) => `          <div class="stat" role="listitem">
            <span class="stat-figure">${esc(s.figure)}</span>
            <span class="stat-label">${esc(s.label)}</span>
          </div>`
  )
  .join('\n');

const portfolioHtml = portfolio
  .map((p) => {
    const meta = [val(p.stage, `${p.company}.stage`), val(p.year, `${p.company}.year`), val(p.location, `${p.company}.location`)]
      .filter(Boolean)
      .map(esc)
      .join(' · ');
    const outcome = val(p.outcome, `${p.company}.outcome`);
    return `          <article class="card p-card reveal">
            <div class="p-head">
              <span class="p-name">${esc(p.company)}</span>
              ${meta ? `<span class="p-meta">${meta}</span>` : ''}
            </div>
            <p class="p-sector">${esc(p.sector)}</p>
            <p class="p-role">${esc(p.role)}</p>
            ${outcome ? `<p class="p-outcome">${esc(outcome)}</p>` : ''}
          </article>`;
  })
  .join('\n');

const criteriaHtml = criteria.map((c) => `          <li>${esc(c)}</li>`).join('\n');

const endorsementsHtml = endorsements
  .map(
    (e) => `          <figure class="card e-card">
            <blockquote class="e-quote">${esc(e.quote)}</blockquote>
            <figcaption>
              <p class="e-name">${esc(e.name)}</p>
              <p class="e-title">${esc(e.title)}</p>
            </figcaption>
          </figure>`
  )
  .join('\n');

const teamHtml = team
  .map(
    (t) => `          <div class="about-photo reveal">
            <img src="${esc(t.photo)}" alt="${esc(t.name)}, ${esc(t.title)} of Atomic Scaling Ventures" width="400" loading="lazy" />
            <p class="about-title" style="margin-top:1.1rem;">${esc(t.title)}</p>
            <p class="about-name" style="margin-top:0;">${esc(t.name)}</p>
            <div class="about-links">
              <a href="${esc(t.linkedin)}" rel="noopener">LinkedIn →</a>
              <a href="${esc(t.bioUrl)}" rel="noopener">Full biography →</a>
            </div>
          </div>
          <div class="about-bio reveal">
            ${t.bio
              .split('\n')
              .map((p) => `<p>${esc(p)}</p>`)
              .join('\n            ')}
          </div>`
  )
  .join('\n');

// Legal line: fall back to the founder attribution until the entity details are confirmed.
const entity = val(legal.entityName, 'legal.entityName');
const registration = val(legal.registration, 'legal.registration');
val(legal.location, 'legal.location');
const legalLine = entity
  ? `${entity}${registration ? ` · ${registration}` : ''}`
  : 'Ludovic Bodin · Atomic Scaling Ventures';

const jsonld = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Atomic Scaling Ventures',
  url: site.url,
  logo: `${site.url}/assets/og.png`,
  description: site.description,
  founder: {
    '@type': 'Person',
    name: 'Ludovic Bodin',
    sameAs: [site.linkedin, `${site.parentSite}/about-me`],
  },
  sameAs: [site.linkedin, site.parentSite],
});

const out = template
  .replaceAll('{{TITLE}}', esc(site.title))
  .replaceAll('{{DESCRIPTION}}', esc(site.description))
  .replaceAll('{{URL}}', site.url)
  .replaceAll('{{FORM_ENDPOINT}}', site.formEndpoint)
  .replaceAll('{{CONTACT_EMAIL}}', site.contactEmail)
  .replaceAll('{{JSONLD}}', jsonld)
  .replaceAll('{{STATS}}', statsHtml)
  .replaceAll('{{PORTFOLIO}}', portfolioHtml)
  .replaceAll('{{CRITERIA}}', criteriaHtml)
  .replaceAll('{{ENDORSEMENTS}}', endorsementsHtml)
  .replaceAll('{{ENDORSEMENTS_NOTE}}', esc(endorsementsNote))
  .replaceAll('{{TEAM}}', teamHtml)
  .replaceAll('{{YEAR}}', String(new Date().getFullYear()))
  .replaceAll('{{LEGAL_LINE}}', esc(legalLine));

if (/\{\{[A-Z_]+\}\}/.test(out)) {
  console.error('Unreplaced placeholders remain:', out.match(/\{\{[A-Z_]+\}\}/g));
  process.exit(1);
}
if (/TODO-/.test(out)) {
  console.error('A TODO value leaked into the rendered page. Aborting.');
  process.exit(1);
}

writeFileSync('docs/index.html', out);
console.log(`Built docs/index.html (${(out.length / 1024).toFixed(1)} kB)`);
if (todos.length) {
  console.log('\nOmitted from the page — fill these in content.json when confirmed:');
  for (const t of todos) console.log(`  - ${t}`);
}
