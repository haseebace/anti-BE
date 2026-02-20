"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Label = Label;
const jsx_runtime_1 = require("react/jsx-runtime");
const radix_ui_1 = require("radix-ui");
const utils_1 = require("@/lib/utils");
function Label({ className, ...props }) {
    return ((0, jsx_runtime_1.jsx)(radix_ui_1.Label.Root, { "data-slot": "label", className: (0, utils_1.cn)("flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50", className), ...props }));
}
