"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LoginPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const client_1 = require("@/lib/supabase/client");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const react_1 = require("react");
const navigation_1 = require("next/navigation");
function LoginPage() {
    const [email, setEmail] = (0, react_1.useState)("");
    const [loading, setLoading] = (0, react_1.useState)(false);
    const router = (0, navigation_1.useRouter)();
    const supabase = (0, client_1.createClient)();
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        // For simplicity, let's just use anonymous sign in if enabled, or magic link
        // But since we may not have email provider setup, let's try to sign up/in anonymously if possible
        // or just ask user to check their email.
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        });
        if (error) {
            alert(error.message);
        }
        else {
            alert("Check your email for the login link!");
        }
        setLoading(false);
    };
    return ((0, jsx_runtime_1.jsx)("div", { className: "flex items-center justify-center min-h-screen bg-gray-100", children: (0, jsx_runtime_1.jsxs)("div", { className: "p-8 bg-white rounded shadow-md w-96", children: [(0, jsx_runtime_1.jsx)("h1", { className: "mb-6 text-2xl font-bold text-center", children: "Login" }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleLogin, className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700", children: "Email" }), (0, jsx_runtime_1.jsx)(input_1.Input, { type: "email", value: email, onChange: (e) => setEmail(e.target.value), required: true, placeholder: "you@example.com" })] }), (0, jsx_runtime_1.jsx)(button_1.Button, { type: "submit", className: "w-full", disabled: loading, children: loading ? "Sending Magic Link..." : "Sign In" })] })] }) }));
}
