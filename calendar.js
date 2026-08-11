/* ==========================================================================
   CALENDAR WIDGET
   ========================================================================== */

// Mount point left in index.html: <div class="calendar-dropdown-container" id="calendar-dropdown"></div>
const calendarDropdown = document.getElementById('calendar-dropdown');

// Builds the calendar trigger + dropdown markup into the mount point.
function renderCalendarWidget() {
    calendarDropdown.innerHTML = `
        <div class="calendar-trigger" id="calendar-trigger" title="Calendar">
            <span id="calendar-current-date" class="calendar-current-date"></span>
            <span class="dropdown-arrow">▼</span>
        </div>
        <div class="calendar-menu" id="calendar-menu">
            <div class="calendar-header">
                <button id="prev-month">&lt;</button>
                <span id="calendar-month-year"></span>
                <button id="next-month">&gt;</button>
            </div>
            <div class="calendar-grid">
                <div class="day-names-row">
                    <div class="day-name">Su</div>
                    <div class="day-name">Mo</div>
                    <div class="day-name">Tu</div>
                    <div class="day-name">We</div>
                    <div class="day-name">Th</div>
                    <div class="day-name">Fr</div>
                    <div class="day-name">Sa</div>
                </div>
                <div id="calendar-days" class="calendar-days"></div>
            </div>
        </div>
    `;
}

renderCalendarWidget();

// Calendar dropdown elements (queried after renderCalendarWidget injects them)
const calendarTrigger = document.getElementById('calendar-trigger');
const calendarMenu = document.getElementById('calendar-menu');

// Calendar grid elements
const monthYearDisplay = document.getElementById('calendar-month-year');
const calendarDaysContainer = document.getElementById('calendar-days');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const calendarCurrentDate = document.getElementById('calendar-current-date');

// Currently displayed calendar month
let calendarDate = new Date();

// Renders today's date in the calendar trigger.
function renderCurrentDateLabel() {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    calendarCurrentDate.textContent = `${day}/${month}/${year}`;
}

renderCurrentDateLabel();

// Renders the calendar grid for the active month.
function renderCalendar() {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const today = new Date();

    monthYearDisplay.textContent = calendarDate.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
    });

    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    let html = '<div class="calendar-day empty"></div>'.repeat(firstDayOfWeek);

    for (let day = 1; day <= totalDays; day++) {
        const isToday = (
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear()
        );
        html += `<div class="calendar-day ${isToday ? 'today' : ''}">${day}</div>`;
    }

    calendarDaysContainer.innerHTML = html;
}

prevMonthBtn.addEventListener('click', () => {
    calendarDate.setMonth(calendarDate.getMonth() - 1);
    renderCalendar();
});

nextMonthBtn.addEventListener('click', () => {
    calendarDate.setMonth(calendarDate.getMonth() + 1);
    renderCalendar();
});

renderCalendar();

// Wire the calendar trigger into the shared nav dropdown registry
registerDropdown(calendarTrigger, calendarMenu, calendarDropdown);