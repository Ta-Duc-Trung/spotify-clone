import { auth } from "./libs/auth";

let modalEl, loginView, signupView, closeBtn;
let loginForm, signupForm, loginError, signupError;
let loginSubmitBtn, signupSubmitBtn, goSignupBtn, goLoginBtn;

let onAuthSuccess = () => {};

function showView(mode) {
    if (mode === "signup") {
        loginView.classList.add("hidden");
        signupView.classList.remove("hidden");
    } else {
        signupView.classList.add("hidden");
        loginView.classList.remove("hidden");
    }
}

function resetErrors() {
    loginError.textContent = "";
    signupError.textContent = "";
}

export const authModal = {
    init({ onSuccess } = {}) {
        modalEl = document.querySelector("#auth-modal");
        loginView = document.querySelector("#login-view");
        signupView = document.querySelector("#signup-view");
        closeBtn = document.querySelector("#modal-close-btn");
        loginForm = document.querySelector("#login-form");
        signupForm = document.querySelector("#signup-form");
        loginError = document.querySelector("#login-error");
        signupError = document.querySelector("#signup-error");
        loginSubmitBtn = document.querySelector("#login-submit-btn");
        signupSubmitBtn = document.querySelector("#signup-submit-btn");
        goSignupBtn = document.querySelector("#go-signup-btn");
        goLoginBtn = document.querySelector("#go-login-btn");

        if (onSuccess) onAuthSuccess = onSuccess;

        closeBtn.addEventListener("click", () => authModal.close());
        modalEl.addEventListener("click", (e) => {
            if (e.target === modalEl) authModal.close();
        });
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") authModal.close();
        });

        goSignupBtn.addEventListener("click", () => {
            resetErrors();
            showView("signup");
        });
        goLoginBtn.addEventListener("click", () => {
            resetErrors();
            showView("login");
        });

        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            loginError.textContent = "";
            const email = document.querySelector("#login-email").value.trim();
            const password = document.querySelector("#login-password").value;

            if (!email || !password) {
                loginError.textContent = "Vui lòng nhập đầy đủ email và mật khẩu.";
                return;
            }

            loginSubmitBtn.disabled = true;
            loginSubmitBtn.textContent = "Đang đăng nhập...";
            try {
                await auth.login({ email, password });
                loginForm.reset();
                authModal.close();
                onAuthSuccess();
            } catch (error) {
                loginError.textContent = error.message || "Đăng nhập thất bại, vui lòng thử lại.";
            } finally {
                loginSubmitBtn.disabled = false;
                loginSubmitBtn.textContent = "Đăng nhập";
            }
        });

        signupForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            signupError.textContent = "";
            const username = document.querySelector("#signup-username").value.trim();
            const email = document.querySelector("#signup-email").value.trim();
            const password = document.querySelector("#signup-password").value;
            const display_name = document.querySelector("#signup-display-name").value.trim() || username;

            if (!username || !email || !password) {
                signupError.textContent = "Vui lòng nhập đầy đủ thông tin bắt buộc.";
                return;
            }
            if (password.length < 6) {
                signupError.textContent = "Mật khẩu cần tối thiểu 6 ký tự.";
                return;
            }

            signupSubmitBtn.disabled = true;
            signupSubmitBtn.textContent = "Đang tạo tài khoản...";
            try {
                await auth.register({ username, email, password, display_name, country: "VN" });
                await auth.login({ email, password });
                signupForm.reset();
                authModal.close();
                onAuthSuccess();
            } catch (error) {
                signupError.textContent = error.message || "Đăng ký thất bại, vui lòng thử lại.";
            } finally {
                signupSubmitBtn.disabled = false;
                signupSubmitBtn.textContent = "Đăng ký";
            }
        });
    },

    open(mode = "login") {
        resetErrors();
        showView(mode);
        modalEl.classList.remove("hidden");
        modalEl.classList.add("flex");
    },

    close() {
        modalEl.classList.add("hidden");
        modalEl.classList.remove("flex");
    },
};