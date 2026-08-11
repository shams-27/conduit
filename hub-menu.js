/* ==========================================================================
   DIU HUB DROPDOWN
   ========================================================================== */

// DIU Hub dropdown elements
const hubDropdown = document.getElementById('diu-hub-dropdown');
const hubTrigger = document.getElementById('hub-trigger');
const hubMenu = document.getElementById('hub-menu');

// Builds the DIU Hub dropdown menu from HUB_ITEMS.
function renderHubMenu() {
    hubMenu.innerHTML = HUB_ITEMS.map(item => `
        <a href="${item.url}" target="_blank" class="hub-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" class="hub-item-icon">
                ${item.icon}
            </svg>
            <span>${item.name}</span>
        </a>
    `).join('');
}

// Sorts DIU Hub items alphabetically.
function sortHubMenu() {
    const menu = document.getElementById('hub-menu');
    if (!menu) return;
    Array.from(menu.querySelectorAll('.hub-item'))
        .sort((a, b) => a.textContent.trim().localeCompare(b.textContent.trim()))
        .forEach(item => menu.appendChild(item));
}

renderHubMenu();
sortHubMenu();

registerDropdown(hubTrigger, hubMenu, hubDropdown);