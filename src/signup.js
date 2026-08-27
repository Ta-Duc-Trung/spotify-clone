import { auth } from "./libs/auth";

const emailInput = document.querySelector("#email");
const extraFields = document.querySelector("#extra-fields");
const usernameInput = document.querySelector("#username");
const displayNameInput = document.querySelector("#display_name");
const passwordInput = document.querySelector("#password");
const nextBtn = document.querySelector("#next-btn");
const submitBtn = document.querySelector("#submit-btn");
const errorEl = document.querySelector("#error-message");
const form = document.querySelector("#signup-form");

// Bước 1: nhập email -> Next -> hiện các trường còn lại
nextBtn.addEventListener("click", () => {
    errorEl.textContent = "";
    const email = emailInput.value.trim();
    if (!email) {
        errorEl.textContent = "Vui lòng nhập email.";
        return;
    }
    emailInput.readOnly = true;
    extraFields.classList.remove("hidden");
    extraFields.classList.add("flex");
    nextBtn.classList.add("hidden");
    submitBtn.classList.remove("hidden");
    usernameInput.focus();
});

// Bước 2: submit đăng ký
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorEl.textContent = "";

    const email = emailInput.value.trim();
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const display_name = displayNameInput.value.trim() || username;

    if (!username || !password) {
        errorEl.textContent = "Vui lòng nhập đầy đủ thông tin.";
        return;
    }
    if (password.length < 6) {
        errorEl.textContent = "Mật khẩu cần tối thiểu 6 ký tự.";
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Đang tạo tài khoản...";
    try {
        await auth.register({ username, email, password, display_name, country: "VN" });
        await auth.login({ email, password });
        window.location.href = "./index.html";
    } catch (error) {
        errorEl.textContent = error.message || "Đăng ký thất bại, vui lòng thử lại.";
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Sign up";
    }
});