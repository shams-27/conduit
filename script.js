import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ==========================================================================
   1. DOM ELEMENT SELECTORS & GLOBAL CONFIGURATIONS
   ========================================================================== */
const resourceCards = document.querySelectorAll('.card');
const bookmarkForm = document.getElementById('bookmark-form');
const linkName = document.getElementById('link-name');
const linkUrl = document.getElementById('link-url');
const customLinksList = document.getElementById('custom-links-list');

// Auth DOM Elements
const loginBtn = document.getElementById('login-btn');
const userProfileContainer = document.getElementById('user-profile');
const profileTrigger = document.getElementById('profile-trigger');
const dropdownMenu = document.getElementById('dropdown-menu');
const userNameSpan = document.getElementById('user-name');
const userAvatar = document.getElementById('user-avatar');
const logoutBtn = document.getElementById('logout-btn');

// DIU Hub Dropdown DOM Elements
const hubDropdown = document.getElementById('diu-hub-dropdown');
const hubTrigger = document.getElementById('hub-trigger');
const hubMenu = document.getElementById('hub-menu');

const provider = new GoogleAuthProvider();

// Custom Domain Mapping for Icons
const customIconMap = {
    "docs.google.com": "https://img.icons8.com/?size=100&id=hHRwFYjODaR4&format=png&color=000000",
    "sheets.google.com": "https://img.icons8.com/?size=100&id=qrAVeBIrsjod&format=png&color=000000",
    "slides.google.com": "https://img.icons8.com/?size=100&id=joSAjc9l7dOp&format=png&color=000000",
    "drive.google.com": "https://img.icons8.com/?size=100&id=eKDChMKt75eu&format=png&color=000000",
    "www.gmail.com": "https://img.icons8.com/?size=100&id=qyRpAggnV0zH&format=png&color=000000",
    "github.com": "https://img.icons8.com/?size=100&id=YSWCDCSF4H3N&format=png&color=FFFFFF",
    "web.whatsapp.com": "https://img.icons8.com/?size=100&id=AltfLkFSP7XN&format=png&color=000000",
    "passwords.google.com": "https://img.icons8.com/?size=100&id=KeCyyDy6KmOt&format=png&color=000000",
    "claude.ai": "https://img.icons8.com/?size=100&id=zQjzFjPpT2Ek&format=png&color=000000"
};

let savedLinks = [];

/* ==========================================================================
   2. HELPER UTILITIES & DROPDOWN RESETS
   ========================================================================== */
function getFaviconUrl(domain) {
    if (customIconMap[domain]) {
        return customIconMap[domain];
    }
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}

// Resets and closes all navigation menus safely on outside click
const closeAllDropdowns = () => {
    dropdownMenu.classList.remove('show');
    userProfileContainer.classList.remove('active');
    hubMenu.classList.remove('show');
    hubDropdown.classList.remove('active');
};

/* ==========================================================================
   3. NAVIGATION DROPDOWN INTERACTION CONTROLLERS
   ========================================================================== */
// User Profile Click Handler
profileTrigger.addEventListener('click', (e) => {
    e.stopPropagation();

    // Close the DIU Hub dropdown to prevent layout clutter
    hubMenu.classList.remove('show');
    hubDropdown.classList.remove('active');

    // Toggle Profile menu
    dropdownMenu.classList.toggle('show');
    userProfileContainer.classList.toggle('active');
});

// DIU Hub Click Handler
hubTrigger.addEventListener('click', (e) => {
    e.stopPropagation();

    // Close the Profile dropdown to prevent layout clutter
    dropdownMenu.classList.remove('show');
    userProfileContainer.classList.remove('active');

    // Toggle DIU Hub menu
    hubMenu.classList.toggle('show');
    hubDropdown.classList.toggle('active');
});

// Close open submenus if focus shifts anywhere else on the window frame
document.addEventListener('click', closeAllDropdowns);

/* ==========================================================================
   4. CUSTOM BOOKMARKS MANAGEMENT (TRAY LOGIC)
   ========================================================================== */
function displayCustomLinks() {
    customLinksList.innerHTML = '';

    if (savedLinks.length === 0) {
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
            <div class="link-wrapper" title="${link.name}">
                <a href="${link.url}" target="_blank">
                    <img src="${faviconUrl}" class="favicon" alt="${link.name}" onerror="this.style.display='none'">
                </a>
            </div>
            <button class="delete-link-btn" onclick="deleteLink(${index})" aria-label="Delete Bookmark">×</button>
        `;
        customLinksList.appendChild(li);
    });
}

bookmarkForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newLink = { name: linkName.value, url: linkUrl.value };
    savedLinks.push(newLink);
    displayCustomLinks();
    saveUserDataToCloud();
    linkName.value = '';
    linkUrl.value = '';
});

window.deleteLink = function (index) {
    savedLinks.splice(index, 1);
    displayCustomLinks();
    saveUserDataToCloud();
};

/* ==========================================================================
   5. STATIC LINKS FAIVCON INJECTION
   ========================================================================== */
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

// Fire initial generation operations
displayStaticLinksIcons();
displayCustomLinks();

/* ==========================================================================
   6. CATEGORY NAVIGATION FILTER ACTION
   ========================================================================== */
const menuItems = document.querySelectorAll('#category-menu li');

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
    });
});

/* ==========================================================================
   7. CLOUD DATA SYNCHRONIZATION (FIREBASE AUTH & FIRESTORE)
   ========================================================================== */
async function saveUserDataToCloud() {
    if (!window.auth.currentUser) return;
    try {
        const userId = window.auth.currentUser.uid;
        await setDoc(doc(window.db, "users", userId), {
            links: savedLinks,
            updatedAt: new Date()
        });
        console.log("Cloud synchronized successfully!");
    } catch (e) {
        console.error("Error syncing with cloud: ", e);
    }
}

onAuthStateChanged(window.auth, async (user) => {
    if (user) {
        loginBtn.style.display = 'none';
        userProfileContainer.style.display = 'flex';

        const firstName = user.displayName ? user.displayName.split(' ')[0] : 'User';
        userNameSpan.textContent = `Hi, ${firstName}`;

        if (user.photoURL) {
            userAvatar.src = user.photoURL;
            userAvatar.style.display = 'block';
        } else {
            userAvatar.style.display = 'none';
        }

        const docRef = doc(window.db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            savedLinks = data.links || [];
        } else {
            savedLinks = [];
            await saveUserDataToCloud();
        }

        displayCustomLinks();
    } else {
        loginBtn.style.display = 'block';
        userProfileContainer.style.display = 'none';
        userNameSpan.textContent = '';

        savedLinks = [];
        displayCustomLinks();
    }
});

// Authentication Primary Call Trigger Hooks
logoutBtn.onclick = () => {
    signOut(window.auth)
        .then(() => closeAllDropdowns())
        .catch((error) => console.error("Logout Error:", error));
};

loginBtn.onclick = () => {
    signInWithPopup(window.auth, provider);
};

/* ==========================================================================
   8. QUICK ADD LINK MODAL SYSTEM
   ========================================================================== */
const modal = document.getElementById('add-link-modal');
const openModalBtn = document.getElementById('open-modal-btn');
const closeModalBtn = document.getElementById('close-modal-btn');

openModalBtn.addEventListener('click', () => {
    modal.classList.add('show');
});

const closeModal = () => {
    modal.classList.remove('show');
};

closeModalBtn.addEventListener('click', closeModal);

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

bookmarkForm.addEventListener('submit', () => {
    modal.classList.remove('show');
    setTimeout(() => {
        bookmarkForm.reset();
    }, 100);
});