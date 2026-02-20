"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Progress = Progress;
const jsx_runtime_1 = require("react/jsx-runtime");
const radix_ui_1 = require("radix-ui");
const utils_1 = require("@/lib/utils");
function Progress({ className, value, ...props }) {
    return ((0, jsx_runtime_1.jsx)(radix_ui_1.Progress.Root, { "data-slot": "progress", className: (0, utils_1.cn)("bg-primary/20 relative h-2 w-full overflow-hidden rounded-full", className), ...props, children: (0, jsx_runtime_1.jsx)(radix_ui_1.Progress.Indicator, { "data-slot": "progress-indicator", className: "bg-primary h-full w-full flex-1 transition-all", style: { transform: `translateX(-${100 - (value || 0)}%)` } }) }));
}
