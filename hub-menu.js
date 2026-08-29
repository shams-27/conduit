/* ==========================================================================
   HEADER DROPDOWN MENUS (Campus Resources, Student Portal)
   ========================================================================== */

/**
 * Builds a dropdown menu's contents from a list of {name, url, icon} items
 * and wires it up as a toggleable nav dropdown via registerDropdown().
 * @param {Array<{name: string, url: string, icon: string}>} items
 * @param {string} containerId
 * @param {string} triggerId
 * @param {string} menuId
 */
function setupLinkDropdown(items, containerId, triggerId, menuId) {
    const container = document.getElementById(containerId);
    const trigger = document.getElementById(triggerId);
    const menu = document.getElementById(menuId);
    if (!container || !trigger || !menu) return;

    menu.innerHTML = items.map(item => `
        <a href="${item.url}" target="_blank" class="hub-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" class="hub-item-icon">
                ${item.icon}
            </svg>
            <span>${item.name}</span>
        </a>
    `).join('');

    // Sort alphabetically
    Array.from(menu.querySelectorAll('.hub-item'))
        .sort((a, b) => a.textContent.trim().localeCompare(b.textContent.trim()))
        .forEach(el => menu.appendChild(el));

    registerDropdown(trigger, menu, container);
}

setupLinkDropdown(HUB_ITEMS, 'diu-hub-dropdown', 'hub-trigger', 'hub-menu');
setupLinkDropdown(STUDENT_PORTAL_ITEMS, 'diu-student-portal-dropdown', 'student-portal-trigger', 'student-portal-menu');/* ==========================================================================
   HEADER DROPDOWN MENUS (Campus Resources, Student Portal)
   ========================================================================== */

/**
 * Builds a dropdown menu's contents from a list of {name, url, icon} items
 * and wires it up as a toggleable nav dropdown via registerDropdown().
 * @param {Array<{name: string, url: string, icon: string}>} items
 * @param {string} containerId
 * @param {string} triggerId
 * @param {string} menuId
 */
function setupLinkDropdown(items, containerId, triggerId, menuId) {
    const container = document.getElementById(containerId);
    const trigger = document.getElementById(triggerId);
    const menu = document.getElementById(menuId);
    if (!container || !trigger || !menu) return;

    menu.innerHTML = items.map(item => `
        <a href="${item.url}" target="_blank" class="hub-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" class="hub-item-icon">
                ${item.icon}
            </svg>
            <span>${item.name}</span>
        </a>
    `).join('');

    // Sort alphabetically
    Array.from(menu.querySelectorAll('.hub-item'))
        .sort((a, b) => a.textContent.trim().localeCompare(b.textContent.trim()))
        .forEach(el => menu.appendChild(el));

    registerDropdown(trigger, menu, container);
}

setupLinkDropdown(HUB_ITEMS, 'diu-hub-dropdown', 'hub-trigger', 'hub-menu');
setupLinkDropdown(STUDENT_PORTAL_ITEMS, 'diu-student-portal-dropdown', 'student-portal-trigger', 'student-portal-menu');
