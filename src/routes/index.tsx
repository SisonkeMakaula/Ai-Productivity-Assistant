import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Sparkles, Copy } from "lucide-react";
import { generateEmail } from "@/lib/ai.functions";
import { WorkspaceShell } from "@/components/workspace-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator | Workplace AI" },
      {
        name: "description",
        content: "Generate professional email drafts with tone control — formal, informal, persuasive.",
      },
    ],
  }),
  component: EmailPage,
});

function EmailPage() {
  const fn = useServerFn(generateEmail);
  const [recipient, setRecipient] = useState("");
  const [objective, setObjective] = useState("");
  const [tone, setTone] = useState<"Formal" | "Informal" | "Persuasive">("Formal");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  async function onGenerate() {
    if (!recipient.trim() || !objective.trim()) {
      toast.error("Please provide recipient and objective.");
      return;
    }
    setLoading(true);
    try {
      const res = await fn({ data: { recipient, objective, tone } });
      setOutput(res.text);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <WorkspaceShell
      title="Smart Email Generator"
      description="Draft polished workplace emails with the right tone in seconds."
    >
      <Card className="p-6 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient</Label>
            <Input
              id="recipient"
              placeholder="e.g. Marketing team, Sarah from Legal"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Tone</Label>
            <Select value={tone} onValueChange={(v) => setTone(v as typeof tone)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Formal">Formal</SelectItem>
                <SelectItem value="Informal">Informal</SelectItem>
                <SelectItem value="Persuasive">Persuasive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="objective">Core objective</Label>
          <Textarea
            id="objective"
            rows={4}
            placeholder="What do you want this email to accomplish? Include key points and context."
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
          />
        </div>
        <Button onClick={onGenerate} disabled={loading} className="w-full sm:w-auto">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          Generate draft
        </Button>
      </Card>

      <Card className="p-6 space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="output" className="text-base">Editable draft</Label>
          <Button
            variant="ghost"
            size="sm"
            disabled={!output}
            onClick={() => {
              navigator.clipboard.writeText(output);
              toast.success("Copied to clipboard");
            }}
          >
            <Copy className="mr-1 h-4 w-4" /> Copy
          </Button>
        </div>
        <Textarea
          id="output"
          rows={16}
          value={output}
          onChange={(e) => setOutput(e.target.value)}
          placeholder="Your generated email draft will appear here. Edit freely before sending."
          className="font-mono text-sm"
        />
      </Card>
    </WorkspaceShell>
  );
}
