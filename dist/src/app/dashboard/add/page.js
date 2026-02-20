"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AddMediaPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const radio_group_1 = require("@/components/ui/radio-group");
function AddMediaPage() {
    const router = (0, navigation_1.useRouter)();
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [type, setType] = (0, react_1.useState)("MAGNET");
    const [url, setUrl] = (0, react_1.useState)("");
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/jobs", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    type,
                    sourceUrl: url,
                }),
            });
            if (!res.ok) {
                throw new Error("Failed to create job");
            }
            router.push("/dashboard/jobs");
            router.refresh();
        }
        catch (error) {
            console.error(error);
            alert("Something went wrong");
        }
        finally {
            setLoading(false);
        }
    };
    return ((0, jsx_runtime_1.jsx)("div", { className: "max-w-2xl mx-auto", children: (0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsx)(card_1.CardHeader, { children: (0, jsx_runtime_1.jsx)(card_1.CardTitle, { children: "Add New Media" }) }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { children: (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSubmit, className: "space-y-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsx)(label_1.Label, { children: "Source Type" }), (0, jsx_runtime_1.jsxs)(radio_group_1.RadioGroup, { defaultValue: "MAGNET", value: type, onValueChange: (v) => setType(v), className: "flex gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(radio_group_1.RadioGroupItem, { value: "MAGNET", id: "magnet" }), (0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "magnet", children: "Magnet Link" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(radio_group_1.RadioGroupItem, { value: "DIRECT", id: "direct" }), (0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "direct", children: "Direct URL" })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "url", children: type === "MAGNET" ? "Magnet Link" : "File URL" }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "url", placeholder: type === "MAGNET"
                                            ? "magnet:?xt=urn:btih:..."
                                            : "https://example.com/video.mp4", value: url, onChange: (e) => setUrl(e.target.value), required: true })] }), (0, jsx_runtime_1.jsx)(button_1.Button, { type: "submit", disabled: loading, className: "w-full", children: loading ? "Submitting..." : "Start Import" })] }) })] }) }));
}
