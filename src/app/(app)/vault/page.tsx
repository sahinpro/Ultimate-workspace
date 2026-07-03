"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Eye, Trash2, Copy } from "lucide-react";
import { maskSecret } from "@/lib/crypto/vault";

type VaultItem = {
  id: string;
  title: string;
  type: string;
  createdAt: string;
};

export default function VaultPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewPayload, setViewPayload] = useState("");
  const [title, setTitle] = useState("");
  const [payload, setPayload] = useState("");
  const [type, setType] = useState("NOTE");

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["vault"],
    queryFn: async () => {
      const res = await fetch("/api/v1/vault");
      const json = await res.json();
      return json.data as VaultItem[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/v1/vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, payload, type }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vault"] });
      setOpen(false);
      setTitle("");
      setPayload("");
    },
  });

  const viewMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/v1/vault/${id}`);
      const json = await res.json();
      return json.data.payload as string;
    },
    onSuccess: (data) => {
      setViewPayload(data);
      setViewOpen(true);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/v1/vault/${id}`, { method: "DELETE" });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vault"] }),
  });

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Personal Vault</h1>
            <p className="text-muted-foreground">Encrypted storage for secrets and notes</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" />Add Item</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Vault Item</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["NOTE", "API_KEY", "PASSWORD", "OTHER"].map((t) => (
                        <SelectItem key={t} value={t}>{t.replace("_", " ")}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Content</Label>
                  <Textarea value={payload} onChange={(e) => setPayload(e.target.value)} rows={4} />
                </div>
                <Button onClick={() => createMutation.mutate()} disabled={!title || !payload}>
                  Save Encrypted
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Dialog open={viewOpen} onOpenChange={setViewOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Decrypted Content</DialogTitle></DialogHeader>
            <pre className="whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm">{viewPayload}</pre>
            <Button
              variant="outline"
              onClick={() => navigator.clipboard.writeText(viewPayload)}
            >
              <Copy className="mr-2 h-4 w-4" />Copy
            </Button>
          </DialogContent>
        </Dialog>

        {isLoading ? (
          <div className="animate-pulse space-y-2">
            {[1, 2].map((i) => <div key={i} className="h-20 rounded-lg bg-muted" />)}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((item) => (
              <Card key={item.id}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base">{item.title}</CardTitle>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{item.type}</span>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <span className="font-mono text-sm text-muted-foreground">{maskSecret("encrypted")}</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => viewMutation.mutate(item.id)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(item.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {items.length === 0 && (
              <p className="col-span-2 py-12 text-center text-muted-foreground">Vault is empty</p>
            )}
          </div>
        )}
      </div>
  );
}
