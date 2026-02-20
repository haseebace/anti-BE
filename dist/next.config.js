"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nextConfig = {
    /* config options here */
    experimental: {
        serverActions: {
            allowedOrigins: ["localhost:3000", "172.20.10.11:3000"],
        },
    },
    allowedDevOrigins: ["localhost:3000", "172.20.10.11:3000"],
    output: "standalone",
    /* config options here */
    // turbopack: {
    //       root: "/Users/haseebace/Desktop/Projects/antigravity-strm-be-dashboard" 
    // },
};
exports.default = nextConfig;
