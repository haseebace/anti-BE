"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function AddMediaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<"MAGNET" | "DIRECT">("MAGNET");
  const [url, setUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
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
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Add New Media</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Source Type</Label>
              <RadioGroup
                defaultValue="MAGNET"
                value={type}
                onValueChange={(v) => setType(v as "MAGNET" | "DIRECT")}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="MAGNET" id="magnet" />
                  <Label htmlFor="magnet">Magnet Link</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="DIRECT" id="direct" />
                  <Label htmlFor="direct">Direct URL</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">
                {type === "MAGNET" ? "Magnet Link" : "File URL"}
              </Label>
              <Input
                id="url"
                placeholder={
                  type === "MAGNET"
                    ? "magnet:?xt=urn:btih:..."
                    : "https://example.com/video.mp4"
                }
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Submitting..." : "Start Import"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
