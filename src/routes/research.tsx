import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { Loader2, Sparkles } from "lucide-react";
import { researchBrief } from "@/lib/ai.functions";
import { WorkspaceShell } from "@/components/workspace-shell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant | Workplace AI" },
      { name: "description", content: "Convert complex information into an executive summary brief." },
    ],
  }),
  component: ResearchPage,
});

function ResearchPage() {
  const fn = useServerFn(researchBrief);
  const [topic, setTopic] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  async function onRun() {
    if (!topic.trim()) return toast.error("Provide a topic or paste content.");
    setLoading(true);
    try {
      const res = await fn({ data: { topic } });
      setOutput(res.text);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Research failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <WorkspaceShell
      title="AI Research Assistant"
      description="Paste raw research or a topic — receive a structured executive brief."
    >
      <Card className="p-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="topic">Topic or source content</Label>
          <Textarea
            id="topic"
            rows={8}
            placeholder="Paste articles, notes, or describe a topic to research (e.g. 'state of remote work in 2025')..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>
        <Button onClick={onRun} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          Generate brief
        </Button>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6 space-y-3">
          <Label htmlFor="edit" className="text-base">Editable brief</Label>
          <Textarea
            id="edit"
            rows={20}
            value={output}
            onChange={(e) => setOutput(e.target.value)}
            placeholder="The executive brief will appear here. Edit freely."
            className="font-mono text-xs"
          />
        </Card>
        <Card className="p-6 space-y-3">
          <Label className="text-base">Rendered brief</Label>
          <div className="prose prose-sm dark:prose-invert max-w-none rounded-md border border-border bg-muted/30 p-4 min-h-[20rem] overflow-auto">
            {output ? <ReactMarkdown>{output}</ReactMarkdown> : <p className="text-muted-foreground text-sm">Preview will render here.</p>}
          </div>
        </Card>
      </div>
    </WorkspaceShell>
  );
}
