"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface Job {
  id: string;
  type: "MAGNET" | "DIRECT";
  status: "PENDING" | "DOWNLOADING" | "UPLOADING" | "COMPLETED" | "FAILED";
  source_url: string;
  progress: number;
  created_at: string;
  error_message?: string;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const supabase = createClient();

  useEffect(() => {
    // 1. Initial Fetch
    const fetchJobs = async () => {
      const { data } = await supabase
        .from("jobs")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (data) setJobs(data as Job[]);
    };

    fetchJobs();

    // 2. Realtime Subscription
    const channel = supabase
      .channel("jobs-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "jobs" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setJobs((prev) => [payload.new as Job, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setJobs((prev) =>
              prev.map((job) =>
                job.id === payload.new.id ? (payload.new as Job) : job
              )
            );
          } else if (payload.eventType === "DELETE") {
             setJobs((prev) => prev.filter((job) => job.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const deleteJob = async (id: string) => {
    if (!confirm("Are you sure you want to delete this job?")) return;
    
    try {
      const res = await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        alert(`Failed to delete: ${err.error}`);
      }
      // UI update is handled by realtime subscription
    } catch (e) {
      console.error(e);
      alert("Failed to delete job");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED": return "bg-green-500 hover:bg-green-600";
      case "FAILED": return "bg-red-500 hover:bg-red-600";
      case "DOWNLOADING": return "bg-blue-500 hover:bg-blue-600";
      case "UPLOADING": return "bg-purple-500 hover:bg-purple-600";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Job Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[200px]">Progress</TableHead>
                <TableHead className="text-right">Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.length === 0 && (
                 <TableRow>
                   <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                     No jobs found.
                   </TableCell>
                 </TableRow>
              )}
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {job.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell>{job.type}</TableCell>
                  <TableCell className="max-w-[200px] truncate" title={job.source_url}>
                    {job.source_url}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(job.status)}>
                      {job.status}
                    </Badge>
                    {job.error_message && (
                      <div className="text-xs text-red-500 mt-1 truncate max-w-[150px]" title={job.error_message}>
                        {job.error_message}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {(job.status === 'DOWNLOADING' || job.status === 'UPLOADING') && (
                       <div className="flex items-center gap-2">
                         <Progress value={job.progress} className="h-2" />
                         <span className="text-xs w-8 text-right">{job.progress}%</span>
                       </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {new Date(job.created_at).toLocaleTimeString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => deleteJob(job.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
