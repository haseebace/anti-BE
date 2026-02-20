"use client";
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sidebar = Sidebar;
const jsx_runtime_1 = require("react/jsx-runtime");
const link_1 = __importDefault(require("next/link"));
const lucide_react_1 = require("lucide-react");
const utils_1 = require("@/lib/utils");
const routes = [
    {
        label: "Dashboard",
        icon: lucide_react_1.LayoutDashboard,
        href: "/dashboard",
    },
    {
        label: "Add Media",
        icon: lucide_react_1.PlusCircle,
        href: "/dashboard/add",
    },
    {
        label: "Jobs",
        icon: lucide_react_1.ListVideo,
        href: "/dashboard/jobs",
    },
    {
        label: "Settings",
        icon: lucide_react_1.Settings,
        href: "/dashboard/settings",
    },
];
function Sidebar() {
    return ((0, jsx_runtime_1.jsx)("div", { className: "space-y-4 py-4 flex flex-col h-full bg-[#111827] text-white", children: (0, jsx_runtime_1.jsxs)("div", { className: "px-3 py-2 flex-1", children: [(0, jsx_runtime_1.jsx)(link_1.default, { href: "/dashboard", className: "flex items-center pl-3 mb-14", children: (0, jsx_runtime_1.jsxs)("h1", { className: "text-2xl font-bold", children: ["Stream", (0, jsx_runtime_1.jsx)("span", { className: "text-primary", children: "Manager" })] }) }), (0, jsx_runtime_1.jsx)("div", { className: "space-y-1", children: routes.map((route) => ((0, jsx_runtime_1.jsx)(link_1.default, { href: route.href, className: (0, utils_1.cn)("text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition"), children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center flex-1", children: [(0, jsx_runtime_1.jsx)(route.icon, { className: (0, utils_1.cn)("h-5 w-5 mr-3", "text-sky-500") }), route.label] }) }, route.href))) })] }) }));
}
