/* ==========================================================================
   LINK DATA
   ========================================================================== */

// DIU Hub dropdown menu items.
const HUB_ITEMS = [
    {
        name: "Student Portal",
        url: "https://studentportal.diu.edu.bd/",
        icon: `<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>`
    },
    {
        name: "Live Result",
        url: "https://studentportal.diu.edu.bd/live-result",
        icon: `<line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line>`
    },
    {
        name: "BLC",
        url: "https://elearn.daffodilvarsity.edu.bd/",
        icon: `<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>`
    },
    {
        name: "Campus Schedule",
        url: "https://diucampusschedule.app/dashboard",
        icon: `<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>`
    },
    {
        name: "DIU Routine (SWE)",
        url: "https://www.diuroutine.com/",
        icon: `<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>`
    },
    {
        name: "Notice Board",
        url: "https://daffodilvarsity.edu.bd/noticeboard",
        icon: `<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path>`
    },
    {
        name: "DIU QBank",
        url: "https://diuqbank.com/",
        icon: `<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>`
    },
    {
        name: "Payment Ledger",
        url: "https://studentportal.diu.edu.bd/payment-ledger",
        icon: `<rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line>`
    },
    {
        name: "Teaching Evaluation",
        url: "https://studentportal.diu.edu.bd/teaching-evaluation",
        icon: `<path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path>`
    },
    {
        name: "Semester Result",
        url: "https://studentportal.diu.edu.bd/result",
        icon: `<circle cx="12" cy="8" r="6"></circle><path d="M15.5 13.5 17 22l-5-3-5 3 1.5-8.5"></path>`
    },
    {
        name: "Check Clearance",
        url: "https://studentportal.diu.edu.bd/clearance",
        icon: `<circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path>`
    }
];


// Resource grid cards. 
const RESOURCE_CARDS = [
    {
        id: "ai-assistants",
        title: "AI",
        links: [
            { name: "Claude AI", url: "https://claude.ai" },
            { name: "Gemini", url: "https://gemini.google.com" },
            { name: "NotebookLM", url: "https://notebooklm.google/" },
            { name: "Grok", url: "https://grok.com" },
            { name: "Perplexity", url: "https://perplexity.ai" },
            { name: "ChatGPT", url: "https://chatgpt.com" },
            { name: "DeepSeek", url: "https://chat.deepseek.com" }
        ]
    },
    {
        id: "learning-media",
        title: "Learn",
        links: [
            { name: "YouTube", url: "https://www.youtube.com" },
            { name: "GeeksforGeeks", url: "https://www.geeksforgeeks.org" },
            { name: "W3Schools", url: "https://www.w3schools.com" },
            { name: "VisuAlgo", url: "https://visualgo.net" },
            { name: "Codecademy", url: "https://www.codecademy.com" },
            { name: "FreeCodeCamp", url: "https://www.freecodecamp.org" }
        ]
    },
    {
        id: "google-tools",
        title: "Google",
        links: [
            { name: "Google Docs", url: "https://docs.google.com" },
            { name: "Google Sheets", url: "https://sheets.google.com" },
            { name: "Google Slides", url: "https://slides.google.com" }
        ]
    },
    {
        id: "cloud-storage",
        title: "Storage",
        links: [
            { name: "Google Drive", url: "https://drive.google.com" },
            { name: "Dropbox", url: "https://www.dropbox.com/home" },
            { name: "OneDrive", url: "https://onedrive.live.com/" }
        ]
    },
    {
        id: "meeting",
        title: "Meeting",
        links: [
            { name: "Google Meet", url: "https://meet.google.com" },
            { name: "Zoom", url: "https://zoom.us" }
        ]
    },
    {
        id: "design-tools",
        title: "Design",
        links: [
            { name: "Canva", url: "https://www.canva.com" },
            { name: "Figma", url: "https://www.figma.com" },
            { name: "Adobe Photoshop", url: "https://www.adobe.com/products/photoshop.html" },
            { name: "Adobe Illustrator", url: "https://www.adobe.com/products/illustrator.html" }
        ]
    },
    {
        id: "pdf-tools",
        title: "PDF",
        links: [
            { name: "iLovePDF", url: "https://www.ilovepdf.com" },
            { name: "Sejda", url: "https://www.sejda.com" }
        ]
    },
    {
        id: "communication",
        title: "Social",
        links: [
            { name: "Gmail", url: "https://www.gmail.com" },
            { name: "Facebook", url: "https://www.facebook.com" },
            { name: "WhatsApp", url: "https://web.whatsapp.com" }
        ]
    },
    {
        id: "career",
        title: "Career",
        links: [
            { name: "Levels.fyi", url: "https://www.levels.fyi" },
            { name: "LinkedIn", url: "https://www.linkedin.com" },
            { name: "Internshala", url: "https://www.internshala.com" },
            { name: "Indeed", url: "https://www.indeed.com" }
        ]
    },
    {
        id: "problem-solving",
        title: "DSA",
        links: [
            { name: "HackerRank", url: "https://www.hackerrank.com" },
            { name: "Codeforces", url: "https://www.codeforces.com" },
            { name: "SPOJ", url: "https://www.spoj.com" },
            { name: "HackerEarth", url: "https://www.hackerearth.com" },
            { name: "CodeChef", url: "https://www.codechef.com" },
            { name: "InterviewBit", url: "https://www.interviewbit.com" },
            { name: "LeetCode", url: "https://www.leetcode.com" }
        ]
    },
    {
        id: "image-compressor",
        title: "Compress",
        links: [
            { name: "Compress JPEG", url: "https://www.compressjpeg.com" },
            { name: "Compress PNG", url: "https://www.compresspng.com" },
            { name: "ImageCompressor", url: "https://www.imagecompressor.com" },
            { name: "Internxt", url: "https://internxt.com/file-compressor" }
        ]
    },
    {
        id: "productivity",
        title: "Notes",
        links: [
            { name: "Notion", url: "https://www.notion.so" },
            { name: "Evernote", url: "https://www.evernote.com" },
            { name: "Google Keep", url: "https://keep.google.com" },
            { name: "Todoist", url: "https://www.todoist.com" }
        ]
    },
    {
        id: "citations",
        title: "Citations",
        links: [
            { name: "Cite This For Me", url: "https://www.citethisforme.com" },
            { name: "Zotero", url: "https://www.zotero.org" },
            { name: "Mendeley", url: "https://www.mendeley.com" },
            { name: "Google Scholar", url: "https://scholar.google.com" }
        ]
    },
    {
        id: "diagramming",
        title: "Diagrams",
        links: [
            { name: "Draw.io", url: "https://www.draw.io" },
            { name: "Lucidchart", url: "https://www.lucidchart.com" },
            { name: "Mermaid", url: "https://mermaid.ai/" }
        ]
    },
    {
        id: "dev-tools",
        title: "Dev Tools",
        links: [
            { name: "GitHub", url: "https://github.com" },
            { name: "MDN Web Docs", url: "https://developer.mozilla.org" },
            { name: "Stack Overflow", url: "https://stackoverflow.com" },
            { name: "CodePen", url: "https://codepen.io" }
        ]
    },
    {
        id: "grammar-checker",
        title: "Grammar",
        links: [
            { name: "Quillbot", url: "https://quillbot.com" },
            { name: "Grammarly", url: "https://grammarly.com" }
        ]
    },
    {
        id: "password-manager",
        title: "Passwords",
        links: [
            { name: "Bitwarden", url: "https://www.bitwarden.com" },
            { name: "1Password", url: "https://www.1password.com" },
            { name: "Password Manager", url: "https://passwords.google.com" }
        ]
    }
];

// Favicon overrides.
const CUSTOM_ICON_MAP = {
    "docs.google.com": "https://img.icons8.com/?size=100&id=hHRwFYjODaR4&format=png&color=000000",
    "sheets.google.com": "https://img.icons8.com/?size=100&id=qrAVeBIrsjod&format=png&color=000000",
    "slides.google.com": "https://img.icons8.com/?size=100&id=joSAjc9l7dOp&format=png&color=000000",
    "drive.google.com": "https://img.icons8.com/?size=100&id=eKDChMKt75eu&format=png&color=000000",
    "www.gmail.com": "https://img.icons8.com/?size=100&id=qyRpAggnV0zH&format=png&color=000000",
    "github.com": "https://img.icons8.com/?size=100&id=YSWCDCSF4H3N&format=png&color=FFFFFF",
    "web.whatsapp.com": "https://img.icons8.com/?size=100&id=AltfLkFSP7XN&format=png&color=000000",
    "passwords.google.com": "https://img.icons8.com/?size=100&id=KeCyyDy6KmOt&format=png&color=000000",
    "claude.ai": "https://img.icons8.com/?size=100&id=zQjzFjPpT2Ek&format=png&color=000000",
    "www.leetcode.com": "https://img.icons8.com/?size=100&id=wDGo581Ea5Nf&format=png&color=000000",
    "www.evernote.com": "https://img.icons8.com/?size=100&id=HsV0BZAmh5Qy&format=png&color=000000",
    "www.codeforces.com": "https://img.icons8.com/?size=100&id=jldAN67IAsrW&format=png&color=000000",
    "onedrive.live.com": "https://img.icons8.com/?size=100&id=4SkJHbAlDawt&format=png&color=000000",
    "keep.google.com": "https://img.icons8.com/?size=100&id=3BW4y2Kk9nCc&format=png&color=000000"
};