// ============================================================
// login.js - Handles login form submission (with security UX)
// ============================================================

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 30 * 1000; // 30 seconds
const ATTEMPTS_KEY = "pms_login_attempts";
const LOCKOUT_KEY = "pms_login_lockout_until";

document.addEventListener("DOMContentLoaded", () => {
    // If already logged in, redirect to dashboard
    if (Auth.isLoggedIn()) {
        window.location.href = "dashboard.html";
        return;
    }

    const form = document.getElementById("loginForm");
    const errorMsg = document.getElementById("errorMsg");
    const passwordInput = document.getElementById("password");
    const usernameInput = document.getElementById("username");
    const toggleBtn = document.getElementById("togglePassword");
    const capsWarning = document.getElementById("capsWarning");
    const loginBtn = document.getElementById("loginBtn");

    // Focus the first field with a tiny entrance delay
    setTimeout(() => usernameInput.focus(), 150);

    // ---- Show/Hide password ----
    toggleBtn.addEventListener("click", () => {
        const isHidden = passwordInput.type === "password";
        passwordInput.type = isHidden ? "text" : "password";
        toggleBtn.textContent = isHidden ? "Hide" : "Show";
        toggleBtn.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
    });

    // ---- Caps Lock detection ----
    function checkCaps(e) {
        if (typeof e.getModifierState === "function") {
            const isOn = e.getModifierState("CapsLock");
            capsWarning.classList.toggle("show", isOn);
        }
    }
    passwordInput.addEventListener("keydown", checkCaps);
    passwordInput.addEventListener("keyup", checkCaps);

    // ---- Lockout check on load ----
    enforceLockoutState();

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        errorMsg.textContent = "";
        errorMsg.classList.remove("shake");

        // Respect any active lockout
        const lockoutUntil = parseInt(localStorage.getItem(LOCKOUT_KEY) || "0", 10);
        if (lockoutUntil > Date.now()) {
            showError(`Too many failed attempts. Please wait ${Math.ceil((lockoutUntil - Date.now()) / 1000)}s before trying again.`);
            return;
        }

        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        setLoading(true);

        try {
            const data = await Api.login(username, password);

            // Success: reset attempt counter
            localStorage.removeItem(ATTEMPTS_KEY);
            localStorage.removeItem(LOCKOUT_KEY);

            Auth.setSession(data.token, {
                username: data.username,
                role: data.role,
                department: data.department,
                fullName: data.fullName
            });

            loginBtn.textContent = "Success! Redirecting...";
            loginBtn.style.background = "linear-gradient(135deg, #22c55e, #22d3ee)";

            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 400);
        } catch (err) {
            recordFailedAttempt();
            showError(err.message || "Login failed. Please try again.");
            setLoading(false);
        }
    });

    function setLoading(isLoading) {
        loginBtn.disabled = isLoading;
        loginBtn.innerHTML = isLoading
            ? '<span class="btn-spinner"></span>Signing in...'
            : "Login";
    }

    function showError(message) {
        errorMsg.textContent = message;
        // restart shake animation
        errorMsg.classList.remove("shake");
        requestAnimationFrame(() => errorMsg.classList.add("shake"));
    }

    function recordFailedAttempt() {
        let attempts = parseInt(localStorage.getItem(ATTEMPTS_KEY) || "0", 10) + 1;
        localStorage.setItem(ATTEMPTS_KEY, String(attempts));

        if (attempts >= MAX_ATTEMPTS) {
            const lockoutUntil = Date.now() + LOCKOUT_MS;
            localStorage.setItem(LOCKOUT_KEY, String(lockoutUntil));
            localStorage.removeItem(ATTEMPTS_KEY);
            enforceLockoutState();
        }
    }

    function enforceLockoutState() {
        const lockoutUntil = parseInt(localStorage.getItem(LOCKOUT_KEY) || "0", 10);
        if (lockoutUntil <= Date.now()) {
            loginBtn.disabled = false;
            return;
        }

        loginBtn.disabled = true;

        const tick = () => {
            const remaining = Math.ceil((lockoutUntil - Date.now()) / 1000);
            if (remaining <= 0) {
                loginBtn.disabled = false;
                loginBtn.textContent = "Login";
                errorMsg.textContent = "";
                clearInterval(timer);
                return;
            }
            loginBtn.textContent = `Locked - try again in ${remaining}s`;
            errorMsg.textContent = "Too many failed login attempts. Please wait before trying again.";
        };

        tick();
        const timer = setInterval(tick, 1000);
    }
});
