const searchBar = document.getElementById('search-bar');
const resourceCards = document.querySelectorAll('.card');
const bookmarkForm = document.getElementById('bookmark-form');
const linkName = document.getElementById('link-name');
const linkUrl = document.getElementById('link-url');
const customLinksList = document.getElementById('custom-links-list');
const scratchpad = document.getElementById('scratchpad');

const customIconMap = {
    "docs.google.com": "https://img.icons8.com/color/96/google-docs--v1.png",
    "sheets.google.com": "https://img.icons8.com/color/96/google-sheets.png",
    "slides.google.com": "https://img.icons8.com/color/96/google-slides.png",
    "drive.google.com": "https://img.icons8.com/color/96/google-drive.png",
    "www.gmail.com": "https://img.icons8.com/color/96/gmail.png",
    "github.com": "https://github.githubassets.com/favicons/favicon.svg",
    "web.whatsapp.com": "https://img.icons8.com/color/96/whatsapp.png",
};

searchBar.addEventListener('keyup', (e) => {
    const term = e.target.value.toLowerCase();

    resourceCards.forEach(card => {
        const keywords = card.getAttribute('data-category').toLowerCase();
        const contentText = card.textContent.toLowerCase();

        if (keywords.includes(term) || contentText.includes(term)) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });
});

let savedLinks = JSON.parse(localStorage.getItem('study_companion_links')) || [];

function getFaviconUrl(domain) {
    if (customIconMap[domain]) {
        return customIconMap[domain];
    }
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}

function displayCustomLinks() {
    customLinksList.innerHTML = '';

    if (savedLinks.length === 0) {
        customLinksList.innerHTML = `<li style="color: var(--text-muted); font-size: 0.9rem;">No custom links added yet.</li>`;
        return;
    }

    savedLinks.forEach((link, index) => {
        const li = document.createElement('li');

        let domain = '';
        try {
            domain = new URL(link.url).hostname;
        } catch (e) {
            domain = ''; 
        }

        const faviconUrl = getFaviconUrl(domain);

        li.innerHTML = `
            <div class="link-wrapper">
                <img src="${faviconUrl}" class="favicon" alt="" onerror="this.style.display='none'">
                <a href="${link.url}" target="_blank">${link.name}</a>
            </div>
            <button class="delete-link-btn" onclick="deleteLink(${index})" aria-label="Delete Bookmark">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
        `;
        customLinksList.appendChild(li);
    });
}

bookmarkForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const newLink = {
        name: linkName.value,
        url: linkUrl.value
    };

    savedLinks.push(newLink);
    localStorage.setItem('study_companion_links', JSON.stringify(savedLinks));

    displayCustomLinks();

    linkName.value = '';
    linkUrl.value = '';
});

window.deleteLink = function (index) {
    savedLinks.splice(index, 1);
    localStorage.setItem('study_companion_links', JSON.stringify(savedLinks));
    displayCustomLinks();
}

scratchpad.value = localStorage.getItem('study_companion_scratchpad') || '';

scratchpad.addEventListener('input', (e) => {
    localStorage.setItem('study_companion_scratchpad', e.target.value);
});

displayCustomLinks();

function displayStaticLinksIcons() {
    const staticLinks = document.querySelectorAll('.card:not([data-category="custom personal favorites"]) .link-list a');

    staticLinks.forEach(link => {
        let domain = '';
        try {
            domain = new URL(link.href).hostname;
        } catch (e) {
            return; 
        }

        const faviconUrl = getFaviconUrl(domain);

        const wrapper = document.createElement('div');
        wrapper.className = 'link-wrapper';

        const img = document.createElement('img');
        img.src = faviconUrl;
        img.className = 'favicon';
        img.alt = '';
        img.setAttribute('onerror', "this.style.display='none'");

        link.parentNode.insertBefore(wrapper, link);
        wrapper.appendChild(img);
        wrapper.appendChild(link);
    });
}

displayStaticLinksIcons();

const menuItems = document.querySelectorAll('.menu-list li');

function applyCategoryFilter(targetId) {
    resourceCards.forEach(card => {
        if (targetId === 'all' || card.getAttribute('id') === targetId) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });
}

menuItems.forEach(item => {
    item.addEventListener('click', () => {
        menuItems.forEach(i => i.classList.remove('active'));

        item.classList.add('active');

        const target = item.getAttribute('data-target');
        applyCategoryFilter(target);

        if (searchBar.value !== '') {
            searchBar.value = '';
        }
    });
});

searchBar.addEventListener('keyup', (e) => {
    const term = e.target.value.toLowerCase();

    if (term === '') {
        const activeTarget = document.querySelector('.menu-list li.active').getAttribute('data-target');
        applyCategoryFilter(activeTarget);
        return;
    }

    resourceCards.forEach(card => {
        const categoryData = card.getAttribute('data-category');
        const keywords = categoryData ? categoryData.toLowerCase() : "";
        const contentText = card.textContent.toLowerCase();

        if (keywords.includes(term) || contentText.includes(term)) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });
});
