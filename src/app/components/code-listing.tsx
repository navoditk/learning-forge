import type { CodeListing } from '../../contracts/python';

/**
 * Read-only Python listing (dossier 5.1, C7). Whitespace is preserved
 * (`<pre><code>`), there is no syntax colouring, no Run or copy-to-run control,
 * and nothing here executes. The scroll region is keyboard focusable and
 * labelled; line numbers are generated gutter text (CSS `::before`) so they are
 * never part of selected or copied text; the plain-language structure
 * description is visible text linked with `aria-describedby`, so indentation
 * meaning is not visual-only.
 */
export function CodeListingView({ listing, title }: { listing: CodeListing; title: string }) {
  const lines = listing.source.split('\n');
  return (
    <figure className="code-listing">
      <div
        role="region"
        tabIndex={0}
        aria-label={`Python code: ${title}`}
        aria-describedby="code-listing-structure"
        className="code-listing-scroll"
      >
        <pre>
          <code className={listing.showLineNumbers ? 'with-line-numbers' : undefined}>
            {lines.map((line, index) => (
              <span key={index} className="code-line" data-line={index + 1}>
                {line}
                {'\n'}
              </span>
            ))}
          </code>
        </pre>
      </div>
      <figcaption id="code-listing-structure" className="code-listing-structure">
        Structure: {listing.structureDescription}
      </figcaption>
    </figure>
  );
}
