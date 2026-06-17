// ============================================================
// department.js - Department detail page logic
// ============================================================

const DEPT_FULL_NAMES = {
    CSE: "Computer Science & Engineering",
    IT: "Information Technology",
    ECE: "Electronics & Communication",
    MECH: "Mechanical Engineering",
    CIVIL: "Civil Engineering",
    AIDS: "AI & Data Science"
};

let currentDept = "";
let allStudents = [];
let canEdit = false;

document.addEventListener("DOMContentLoaded", async () => {
    Auth.requireLogin();
    renderNavbar();

    const params = new URLSearchParams(window.location.search);
    currentDept = (params.get("dept") || "").toUpperCase();

    if (!currentDept) {
        window.location.href = "dashboard.html";
        return;
    }

    document.getElementById("deptTitle").textContent = `${currentDept} Department`;
    document.getElementById("deptSubtitle").textContent =
        (DEPT_FULL_NAMES[currentDept] || currentDept) + " - Placement Records";

    setupPermissions();
    await loadStudents();

    document.getElementById("searchInput").addEventListener("input", renderStudents);
    document.getElementById("studentForm").addEventListener("submit", handleSubmit);
});

function renderNavbar() {
    const user = Auth.getUser();
    if (!user) return;

    document.getElementById("navUserName").textContent = user.fullName || user.username;

    const roleBadge = document.getElementById("navUserRole");
    roleBadge.textContent = user.role;
    roleBadge.classList.add(user.role);
}

function setupPermissions() {
    const user = Auth.getUser();
    const addBtn = document.getElementById("addStudentBtn");

    if (user.role === "STUDENT") {
        canEdit = false;
        addBtn.style.display = "none";
    } else if (user.role === "COORDINATOR") {
        canEdit = (user.department && user.department.toUpperCase() === currentDept);
        addBtn.style.display = canEdit ? "inline-block" : "none";
        if (!canEdit) {
            showAlert(`You are a coordinator for ${user.department}. You have read-only access to ${currentDept}.`, "error");
        }
    } else if (user.role === "ADMIN") {
        canEdit = true;
        addBtn.style.display = "inline-block";
    }
}

async function loadStudents() {
    const grid = document.getElementById("studentGrid");
    try {
        allStudents = await Api.getStudentsByDepartment(currentDept);
        renderStudents();
    } catch (err) {
        grid.innerHTML = `<div class="alert alert-error">Failed to load students: ${err.message}</div>`;
    }
}

function renderStudents() {
    const grid = document.getElementById("studentGrid");
    const search = document.getElementById("searchInput").value.toLowerCase().trim();

    let filtered = allStudents;
    if (search) {
        filtered = allStudents.filter(s =>
            (s.name && s.name.toLowerCase().includes(search)) ||
            (s.companyName && s.companyName.toLowerCase().includes(search)) ||
            (s.email && s.email.toLowerCase().includes(search)) ||
            (s.rollNumber && s.rollNumber.toLowerCase().includes(search))
        );
    }

    if (!filtered.length) {
        grid.innerHTML = `<div class="empty-state"><div class="emoji">📭</div>No students found</div>`;
        return;
    }

    grid.innerHTML = filtered.map(s => {
        const statusClass = s.placed ? "placed" : "notplaced";
        const statusText = s.placed ? "Placed" : "Not Placed";
        const photo = resolvePhotoUrl(s.photoUrl);

        const actions = canEdit ? `
            <div class="student-actions">
                <button class="icon-btn edit" onclick="openEditModal(${s.id})" title="Edit">✏️</button>
                <button class="icon-btn delete" onclick="confirmDelete(${s.id})" title="Delete">🗑️</button>
            </div>
        ` : "";

        return `
            <div class="student-card">
                ${actions}
                <img src="${photo}" alt="${escapeHtml(s.name)}" class="student-photo" onerror="this.src='images/default-avatar.svg'">
                <div class="student-info">
                    <h4>${escapeHtml(s.name)}</h4>
                    <div class="student-roll">${escapeHtml(s.rollNumber || "N/A")} | Batch: ${escapeHtml(s.batch || "N/A")}</div>
                    <span class="status-pill ${statusClass}">${statusText}</span>
                    ${s.placed ? `
                        <div class="student-detail-line"><strong>Company:</strong> ${escapeHtml(s.companyName || "N/A")}</div>
                        <div class="student-detail-line"><strong>Offer Type:</strong> ${escapeHtml(s.offerType || "N/A")}</div>
                        <div class="student-detail-line"><strong>Package:</strong> ${s.packageLpa != null ? s.packageLpa + " LPA" : "N/A"}</div>
                    ` : ""}
                    <div class="student-detail-line"><strong>Email:</strong> ${escapeHtml(s.email)}</div>
                    ${s.phoneNumber ? `<div class="student-detail-line"><strong>Phone:</strong> ${escapeHtml(s.phoneNumber)}</div>` : ""}
                </div>
            </div>
        `;
    }).join("");
}

function escapeHtml(str) {
    if (str == null) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

// ============================================================
// Modal handling
// ============================================================

function openAddModal() {
    document.getElementById("modalTitle").textContent = "Add Student";
    document.getElementById("studentForm").reset();
    document.getElementById("studentId").value = "";
    document.getElementById("department").value = currentDept;
    document.getElementById("placed").checked = false;
    togglePlacementFields();
    document.getElementById("modalAlert").innerHTML = "";
    document.getElementById("studentModal").classList.remove("hidden");
}

function openEditModal(id) {
    const student = allStudents.find(s => s.id === id);
    if (!student) return;

    document.getElementById("modalTitle").textContent = "Edit Student";
    document.getElementById("studentId").value = student.id;
    document.getElementById("name").value = student.name || "";
    document.getElementById("rollNumber").value = student.rollNumber || "";
    document.getElementById("department").value = student.department || currentDept;
    document.getElementById("batch").value = student.batch || "";
    document.getElementById("email").value = student.email || "";
    document.getElementById("phoneNumber").value = student.phoneNumber || "";
    document.getElementById("placed").checked = !!student.placed;
    document.getElementById("companyName").value = student.companyName || "";
    document.getElementById("offerType").value = student.offerType || "";
    document.getElementById("packageLpa").value = student.packageLpa != null ? student.packageLpa : "";
    document.getElementById("photoFile").value = "";

    togglePlacementFields();
    document.getElementById("modalAlert").innerHTML = "";
    document.getElementById("studentModal").classList.remove("hidden");
}

function closeModal() {
    document.getElementById("studentModal").classList.add("hidden");
}

function togglePlacementFields() {
    const placed = document.getElementById("placed").checked;
    document.getElementById("placementFields").style.display = placed ? "block" : "none";
}

async function handleSubmit(e) {
    e.preventDefault();

    const saveBtn = document.getElementById("saveBtn");
    const modalAlert = document.getElementById("modalAlert");
    modalAlert.innerHTML = "";

    const id = document.getElementById("studentId").value;
    const placed = document.getElementById("placed").checked;

    const studentData = {
        name: document.getElementById("name").value.trim(),
        rollNumber: document.getElementById("rollNumber").value.trim(),
        department: document.getElementById("department").value,
        batch: document.getElementById("batch").value.trim(),
        email: document.getElementById("email").value.trim(),
        phoneNumber: document.getElementById("phoneNumber").value.trim(),
        placed: placed,
        companyName: placed ? document.getElementById("companyName").value.trim() : null,
        offerType: placed ? document.getElementById("offerType").value.trim() : null,
        packageLpa: placed && document.getElementById("packageLpa").value
            ? parseFloat(document.getElementById("packageLpa").value) : null
    };

    saveBtn.disabled = true;
    saveBtn.textContent = "Saving...";

    try {
        // Upload photo first if a new file was selected
        const photoFile = document.getElementById("photoFile").files[0];
        if (photoFile) {
            const formData = new FormData();
            formData.append("file", photoFile);
            const uploadResult = await Api.uploadPhoto(formData);
            studentData.photoUrl = uploadResult.photoUrl;
        }

        if (id) {
            await Api.updateStudent(id, studentData);
            showAlert("Student updated successfully", "success");
        } else {
            await Api.addStudent(studentData);
            showAlert("Student added successfully", "success");
        }

        closeModal();
        await loadStudents();
    } catch (err) {
        modalAlert.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = "Save";
    }
}

async function confirmDelete(id) {
    const student = allStudents.find(s => s.id === id);
    if (!student) return;

    if (!confirm(`Are you sure you want to delete ${student.name}?`)) {
        return;
    }

    try {
        await Api.deleteStudent(id);
        showAlert("Student deleted successfully", "success");
        await loadStudents();
    } catch (err) {
        showAlert("Failed to delete: " + err.message, "error");
    }
}

function showAlert(message, type) {
    const alertBox = document.getElementById("alertBox");
    const cls = type === "error" ? "alert-error" : "alert-success";
    alertBox.innerHTML = `<div class="alert ${cls}">${message}</div>`;
    setTimeout(() => { alertBox.innerHTML = ""; }, 4000);
}
