// ============================================================
// api.js - Centralized API helper for Placement Management System
// ============================================================

const API_BASE_URL = "http://localhost:8082/api";

const Auth = {
    getToken() {
        return localStorage.getItem("pms_token");
    },
    getUser() {
        const user = localStorage.getItem("pms_user");
        return user ? JSON.parse(user) : null;
    },
    setSession(token, user) {
        localStorage.setItem("pms_token", token);
        localStorage.setItem("pms_user", JSON.stringify(user));
    },
    clearSession() {
        localStorage.removeItem("pms_token");
        localStorage.removeItem("pms_user");
    },
    isLoggedIn() {
        return !!this.getToken();
    },
    requireLogin() {
        if (!this.isLoggedIn()) {
            window.location.href = "index.html";
        }
    },
    logout() {
        this.clearSession();
        window.location.href = "index.html";
    }
};

const Api = {
    async request(endpoint, method = "GET", body = null, isFormData = false) {
        const headers = {};
        const token = Auth.getToken();
        if (token) {
            headers["Authorization"] = "Bearer " + token;
        }

        const options = { method, headers };

        if (body) {
            if (isFormData) {
                options.body = body; // FormData sets its own content-type
            } else {
                headers["Content-Type"] = "application/json";
                options.body = JSON.stringify(body);
            }
        }

        const response = await fetch(API_BASE_URL + endpoint, options);

        if (response.status === 401) {
            Auth.clearSession();
            window.location.href = "index.html";
            throw new Error("Session expired. Please log in again.");
        }

        let data = null;
        try {
            data = await response.json();
        } catch (e) {
            data = null;
        }

        if (!response.ok) {
            const message = (data && data.message) ? data.message : "Request failed (" + response.status + ")";
            throw new Error(message);
        }

        return data;
    },

    login(username, password) {
        return this.request("/auth/login", "POST", { username, password });
    },

    getDepartmentStats() {
        return this.request("/dashboard/stats");
    },

    getSummary() {
        return this.request("/dashboard/summary");
    },

    getAllStudents() {
        return this.request("/students");
    },

    getStudentsByDepartment(dept) {
        return this.request("/students/department/" + dept);
    },

    getStudentById(id) {
        return this.request("/students/" + id);
    },

    addStudent(student) {
        return this.request("/students", "POST", student);
    },

    updateStudent(id, student) {
        return this.request("/students/" + id, "PUT", student);
    },

    deleteStudent(id) {
        return this.request("/students/" + id, "DELETE");
    },

    uploadPhoto(formData) {
        return this.request("/students/upload-photo", "POST", formData, true);
    }
};

const SERVER_BASE_URL = "http://localhost:8082";

function resolvePhotoUrl(photoUrl) {
    if (!photoUrl) return "images/default-avatar.svg";
    if (photoUrl.startsWith("http")) return photoUrl;
    return SERVER_BASE_URL + photoUrl;
}
