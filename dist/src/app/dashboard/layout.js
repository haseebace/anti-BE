"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DashboardLayout;
const jsx_runtime_1 = require("react/jsx-runtime");
const sidebar_1 = require("@/components/layout/sidebar");
const header_1 = require("@/components/layout/header");
function DashboardLayout({ children, }) {
    return ((0, jsx_runtime_1.jsxs)("div", { className: "h-full relative", children: [(0, jsx_runtime_1.jsx)("div", { className: "hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-gray-900", children: (0, jsx_runtime_1.jsx)(sidebar_1.Sidebar, {}) }), (0, jsx_runtime_1.jsxs)("main", { className: "md:pl-72", children: [(0, jsx_runtime_1.jsx)(header_1.Header, {}), (0, jsx_runtime_1.jsx)("div", { className: "p-8 h-full bg-[#f4f4f5]", children: children })] })] }));
}
