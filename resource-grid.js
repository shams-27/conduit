/* ==========================================================================
   RESOURCE GRID + MASONRY LAYOUT
   ========================================================================== */

// Resource grid container
const grid = document.getElementById('resources-grid');

// Builds the resource grid cards from RESOURCE_CARDS.
function renderResourceCards() {
    grid.querySelectorAll('.card').forEach(card => card.remove());

    const modal = document.getElementById('add-link-modal');

    RESOURCE_CARDS.forEach(cardData => {
        const section = document.createElement('section');
        section.className = 'card';
        section.id = cardData.id;
        section.innerHTML = `
            <h3>${cardData.title}</h3>
            <ul class="link-list">
                ${cardData.links.map(link => `<li><a href="${link.url}" target="_blank">${link.name}</a></li>`).join('')}
            </ul>
        `;
        grid.insertBefore(section, modal);
    });
}

// Sorts each resource card's links alphabetically.
function sortResourceCardLinks() {
    document.querySelectorAll('.resources-grid .card').forEach(card => {
        const list = card.querySelector('.link-list');
        if (!list) return;
        Array.from(list.querySelectorAll('li'))
            .sort((a, b) => {
                const textA = a.querySelector('a')?.textContent.trim() ?? '';
                const textB = b.querySelector('a')?.textContent.trim() ?? '';
                return textA.localeCompare(textB);
            })
            .forEach(item => list.appendChild(item));
    });
}

// Adds favicons to static resource links.
function injectStaticLinkIcons() {
    const staticLinks = document.querySelectorAll('.card .link-list a');

    staticLinks.forEach(link => {
        // Skip already-wrapped links
        if (link.parentElement.classList.contains('link-wrapper')) return;

        let domain = '';
        try { domain = new URL(link.href).hostname; } catch { return; }

        const wrapper = document.createElement('div');
        wrapper.className = 'link-wrapper';

        const img = document.createElement('img');
        img.src = getFaviconUrl(domain);
        img.className = 'favicon';
        img.alt = '';
        img.setAttribute('onerror', "this.style.display='none'");

        link.parentNode.insertBefore(wrapper, link);
        wrapper.appendChild(img);
        wrapper.appendChild(link);
    });
}

renderResourceCards();
sortResourceCardLinks();
injectStaticLinkIcons();

// Places each card into the shortest column for a balanced masonry layout.
function applyMasonryLayout() {
    const cards = Array.from(grid.querySelectorAll('.card'));
    if (cards.length === 0) return;

    // Reset placement to measure natural height
    cards.forEach(card => {
        card.style.gridColumn = '';
        card.style.gridRow = '';
    });

    const columnCount = getComputedStyle(grid).gridTemplateColumns.split(' ').length;
    const columnHeights = new Array(columnCount).fill(0);
    const ROW_GAP = 24; // vertical spacing between stacked cards in a column

    cards.forEach(card => {
        // Find the currently shortest column
        let col = 0;
        for (let i = 1; i < columnCount; i++) {
            if (columnHeights[i] < columnHeights[col]) col = i;
        }

        const rowStart = Math.round(columnHeights[col]) + 1;
        const height = card.offsetHeight;

        card.style.gridColumn = String(col + 1);
        card.style.gridRow = `${rowStart} / span ${Math.ceil(height)}`;

        columnHeights[col] += height + ROW_GAP;
    });
}

window.addEventListener('load', applyMasonryLayout);
window.addEventListener('resize', applyMasonryLayout);
applyMasonryLayout();