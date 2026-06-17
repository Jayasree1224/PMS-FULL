// ============================================================
// dashboard.js - Loads and renders the placement dashboard
// ============================================================

const DEPT_ICONS = {
    CSE: "💻",
    IT: "🖥️",
    ECE: "📡",
    MECH: "⚙️",
    CIVIL: "🏗️",
    AIDS: "🤖"
};

const DEPT_FULL_NAMES = {
    CSE: "Computer Science & Engineering",
    IT: "Information Technology",
    ECE: "Electronics & Communication",
    MECH: "Mechanical Engineering",
    CIVIL: "Civil Engineering",
    AIDS: "AI & Data Science"
};

document.addEventListener("DOMContentLoaded", async () => {
    Auth.requireLogin();
    renderNavbar();
    await loadSummary();
    await loadDepartmentStats();
});

function renderNavbar() {
    const user = Auth.getUser();
    if (!user) return;

    document.getElementById("navUserName").textContent = user.fullName || user.username;

    const roleBadge = document.getElementById("navUserRole");
    roleBadge.textContent = user.role;
    roleBadge.classList.add(user.role);

    const welcomeMsg = document.getElementById("welcomeMsg");
    if (user.role === "COORDINATOR") {
        welcomeMsg.textContent = `Overall placement statistics (you can manage ${user.department} department)`;
    } else if (user.role === "STUDENT") {
        welcomeMsg.textContent = "Overall placement statistics (read-only access)";
    } else {
        welcomeMsg.textContent = "Overall placement statistics across all departments (Admin access)";
    }
}

async function loadSummary() {
    const summaryGrid = document.getElementById("summaryGrid");
    try {
        const summary = await Api.getSummary();

        summaryGrid.innerHTML = `
            <div class="summary-card">
                <div class="value">${summary.totalStudents}</div>
                <div class="label">Total Students</div>
            </div>
            <div class="summary-card placed">
                <div class="value">${summary.totalPlaced}</div>
                <div class="label">Placed Students</div>
            </div>
            <div class="summary-card notplaced">
                <div class="value">${summary.totalNotPlaced}</div>
                <div class="label">Not Placed Yet</div>
            </div>
            <div class="summary-card companies">
                <div class="value">${summary.totalCompanies}</div>
                <div class="label">Companies Visited</div>
            </div>
            <div class="summary-card package">
                <div class="value">${summary.highestPackage} LPA</div>
                <div class="label">Highest Package</div>
            </div>
            <div class="summary-card package">
                <div class="value">${summary.averagePackage} LPA</div>
                <div class="label">Average Package</div>
            </div>
        `;
    } catch (err) {
        summaryGrid.innerHTML = `<div class="alert alert-error">Failed to load summary: ${err.message}</div>`;
    }
}

async function loadDepartmentStats() {
    const deptGrid = document.getElementById("deptGrid");
    const barChart = document.getElementById("barChart");

    try {
        const stats = await Api.getDepartmentStats();

        if (!stats.length) {
            deptGrid.innerHTML = `<div class="empty-state"><div class="emoji">📭</div>No department data available</div>`;
            barChart.innerHTML = "";
            return;
        }

        // Find max total for chart scaling
        const maxTotal = Math.max(...stats.map(s => s.totalStudents), 1);

        // Render bar chart
        barChart.innerHTML = stats.map(s => {
            const placedHeight = (s.placedStudents / maxTotal) * 180;
            const notPlacedHeight = (s.notPlacedStudents / maxTotal) * 180;
            return `
                <div class="bar-group">
                    <div class="bar-value">${s.totalStudents} total</div>
                    <div class="bar-stack" style="height: 180px;">
                        <div class="bar-segment-notplaced" style="height: ${notPlacedHeight}px;"></div>
                        <div class="bar-segment-placed" style="height: ${placedHeight}px;"></div>
                    </div>
                    <div class="bar-label">${s.department}</div>
                </div>
            `;
        }).join("");

        // Render department cards
        deptGrid.innerHTML = stats.map(s => {
            const percent = s.totalStudents > 0 ? Math.round((s.placedStudents / s.totalStudents) * 100) : 0;
            const icon = DEPT_ICONS[s.department] || "🎓";
            const fullName = DEPT_FULL_NAMES[s.department] || s.department;

            return `
                <div class="dept-card" onclick="goToDepartment('${s.department}')">
                    <h3>
                        <span>${s.department}</span>
                        <span class="dept-icon">${icon}</span>
                    </h3>
                    <div class="dept-stat-row"><span>${fullName}</span></div>
                    <div class="dept-stat-row"><span>Total Students</span><strong>${s.totalStudents}</strong></div>
                    <div class="dept-stat-row"><span>Placed</span><strong>${s.placedStudents}</strong></div>
                    <div class="dept-stat-row"><span>Not Placed</span><strong>${s.notPlacedStudents}</strong></div>
                    <div class="dept-stat-row"><span>Placement Rate</span><strong>${percent}%</strong></div>
                    <div class="progress-bar-bg">
                        <div class="progress-bar-fill" style="width: ${percent}%;"></div>
                    </div>
                </div>
            `;
        }).join("");

    } catch (err) {
        deptGrid.innerHTML = `<div class="alert alert-error">Failed to load department data: ${err.message}</div>`;
        barChart.innerHTML = "";
    }
}

function goToDepartment(dept) {
    window.location.href = `department.html?dept=${encodeURIComponent(dept)}`;
}
