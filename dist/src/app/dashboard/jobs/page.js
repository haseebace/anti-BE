"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = JobsPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const client_1 = require("@/lib/supabase/client");
const lucide_react_1 = require("lucide-react");
const button_1 = require("@/components/ui/button");
const table_1 = require("@/components/ui/table");
const card_1 = require("@/components/ui/card");
const badge_1 = require("@/components/ui/badge");
const progress_1 = require("@/components/ui/progress");
function JobsPage() {
    const [jobs, setJobs] = (0, react_1.useState)([]);
    const supabase = (0, client_1.createClient)();
    (0, react_1.useEffect)(() => {
        // 1. Initial Fetch
        const fetchJobs = async () => {
            const { data } = await supabase
                .from("jobs")
                .select("*")
                .order("created_at", { ascending: false });
            if (data)
                setJobs(data);
        };
        fetchJobs();
        // 2. Realtime Subscription
        const channel = supabase
            .channel("jobs-realtime")
            .on("postgres_changes", { event: "*", schema: "public", table: "jobs" }, (payload) => {
            if (payload.eventType === "INSERT") {
                setJobs((prev) => [payload.new, ...prev]);
            }
            else if (payload.eventType === "UPDATE") {
                setJobs((prev) => prev.map((job) => job.id === payload.new.id ? payload.new : job));
            }
            else if (payload.eventType === "DELETE") {
                setJobs((prev) => prev.filter((job) => job.id !== payload.old.id));
            }
        })
            .subscribe();
        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase]);
    const deleteJob = async (id) => {
        if (!confirm("Are you sure you want to delete this job?"))
            return;
        try {
            const res = await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
            if (!res.ok) {
                const err = await res.json();
                alert(`Failed to delete: ${err.error}`);
            }
            // UI update is handled by realtime subscription
        }
        catch (e) {
            console.error(e);
            alert("Failed to delete job");
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case "COMPLETED": return "bg-green-500 hover:bg-green-600";
            case "FAILED": return "bg-red-500 hover:bg-red-600";
            case "DOWNLOADING": return "bg-blue-500 hover:bg-blue-600";
            case "UPLOADING": return "bg-purple-500 hover:bg-purple-600";
            default: return "bg-gray-500";
        }
    };
    return ((0, jsx_runtime_1.jsx)("div", { className: "space-y-4", children: (0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsx)(card_1.CardHeader, { children: (0, jsx_runtime_1.jsx)(card_1.CardTitle, { children: "Job Queue" }) }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { children: (0, jsx_runtime_1.jsxs)(table_1.Table, { children: [(0, jsx_runtime_1.jsx)(table_1.TableHeader, { children: (0, jsx_runtime_1.jsxs)(table_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(table_1.TableHead, { children: "ID" }), (0, jsx_runtime_1.jsx)(table_1.TableHead, { children: "Type" }), (0, jsx_runtime_1.jsx)(table_1.TableHead, { children: "Source" }), (0, jsx_runtime_1.jsx)(table_1.TableHead, { children: "Status" }), (0, jsx_runtime_1.jsx)(table_1.TableHead, { className: "w-[200px]", children: "Progress" }), (0, jsx_runtime_1.jsx)(table_1.TableHead, { className: "text-right", children: "Created At" }), (0, jsx_runtime_1.jsx)(table_1.TableHead, { className: "text-right", children: "Actions" })] }) }), (0, jsx_runtime_1.jsxs)(table_1.TableBody, { children: [jobs.length === 0 && ((0, jsx_runtime_1.jsx)(table_1.TableRow, { children: (0, jsx_runtime_1.jsx)(table_1.TableCell, { colSpan: 7, className: "text-center py-10 text-muted-foreground", children: "No jobs found." }) })), jobs.map((job) => ((0, jsx_runtime_1.jsxs)(table_1.TableRow, { children: [(0, jsx_runtime_1.jsxs)(table_1.TableCell, { className: "font-mono text-xs text-muted-foreground", children: [job.id.slice(0, 8), "..."] }), (0, jsx_runtime_1.jsx)(table_1.TableCell, { children: job.type }), (0, jsx_runtime_1.jsx)(table_1.TableCell, { className: "max-w-[200px] truncate", title: job.source_url, children: job.source_url }), (0, jsx_runtime_1.jsxs)(table_1.TableCell, { children: [(0, jsx_runtime_1.jsx)(badge_1.Badge, { className: getStatusColor(job.status), children: job.status }), job.error_message && ((0, jsx_runtime_1.jsx)("div", { className: "text-xs text-red-500 mt-1 truncate max-w-[150px]", title: job.error_message, children: job.error_message }))] }), (0, jsx_runtime_1.jsx)(table_1.TableCell, { children: (job.status === 'DOWNLOADING' || job.status === 'UPLOADING') && ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(progress_1.Progress, { value: job.progress, className: "h-2" }), (0, jsx_runtime_1.jsxs)("span", { className: "text-xs w-8 text-right", children: [job.progress, "%"] })] })) }), (0, jsx_runtime_1.jsx)(table_1.TableCell, { className: "text-right", children: new Date(job.created_at).toLocaleTimeString() }), (0, jsx_runtime_1.jsx)(table_1.TableCell, { className: "text-right", children: (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "icon", onClick: () => deleteJob(job.id), className: "text-red-500 hover:text-red-700 hover:bg-red-50", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { className: "h-4 w-4" }) }) })] }, job.id)))] })] }) })] }) }));
}
