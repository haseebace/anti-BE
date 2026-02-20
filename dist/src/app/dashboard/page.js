"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DashboardPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const lucide_react_1 = require("lucide-react");
const link_1 = __importDefault(require("next/link"));
function DashboardPage() {
    return ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between space-y-2", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-3xl font-bold tracking-tight", children: "Dashboard" }), (0, jsx_runtime_1.jsx)("div", { className: "flex items-center space-x-2", children: (0, jsx_runtime_1.jsx)(link_1.default, { href: "/dashboard/add", children: (0, jsx_runtime_1.jsxs)(button_1.Button, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.PlusCircle, { className: "mr-2 h-4 w-4" }), "Add New Media"] }) }) })] }), (0, jsx_runtime_1.jsx)("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-4", children: (0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [(0, jsx_runtime_1.jsx)(card_1.CardTitle, { className: "text-sm font-medium", children: "Total Jobs" }), (0, jsx_runtime_1.jsx)("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", className: "h-4 w-4 text-muted-foreground", children: (0, jsx_runtime_1.jsx)("path", { d: "M22 12h-4l-3 9L9 3l-3 9H2" }) })] }), (0, jsx_runtime_1.jsxs)(card_1.CardContent, { children: [(0, jsx_runtime_1.jsx)("div", { className: "text-2xl font-bold", children: "0" }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-muted-foreground", children: "+0 from last month" })] })] }) })] }));
}
