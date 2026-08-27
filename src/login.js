import { auth } from "./libs/auth";

const passwordField = document.querySelector("#password-field");
const continueBtn = document.querySelector("#continue-btn");
const submitBtn = document.querySelector("#submit-btn");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const errorEl = document.querySelector("#error-message");
const heading = document.querySelector("#login-heading");
const form = document.querySelector("#login-form");

// Bước 1: nhập email -> bấm Continue -> hiện ô mật khẩu
continueBtn.addEventListener("click", () => {
    errorEl.textContent = "";
    const email = emailInput.value.trim();
    if (!email) {
        errorEl.textContent = "Vui lòng nhập email.";
        return;
    }
    emailInput.readOnly = true;
    passwordField.classList.remove("hidden");
    continueBtn.classList.add("hidden");
    submitBtn.classList.remove("hidden");
    heading.textContent = "Nhập mật khẩu của bạn";
    passwordInput.focus();
});

// Bước 2: submit đăng nhập
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorEl.textContent = "";

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!password) {
        errorEl.textContent = "Vui lòng nhập mật khẩu.";
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Đang đăng nhập...";
    try {
        await auth.login({ email, password });
        window.location.href = "./index.html";
    } catch (error) {
        errorEl.textContent = error.message || "Đăng nhập thất bại, vui lòng thử lại.";
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Log in";
    }
});