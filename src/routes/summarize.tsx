import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { Loader2, Sparkles } from "lucide-react";
import { summarizeMeeting } from "@/lib/ai.functions";
import { WorkspaceShell } from "@/components/workspace-shell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/summarize")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer | Workplace AI" },
      {
        name: "description",
        content: "Turn raw meeting transcripts into concise summaries and action item checklists.",
      },
    ],
  }),
  component: SummarizePage,
});

function SummarizePage() {
  const fn = useServerFn(summarizeMeeting);
  const [transcript, setTranscript] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  async function onRun() {
    if (!transcript.trim()) return toast.error("Paste a transcript first.");
    setLoading(true);
    try {
      const res = await fn({ data: { transcript } });
      setOutput(res.text);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Summary failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <WorkspaceShell
      title="Meeting Notes Summarizer"
      description="Paste raw discussion notes — get a clean summary and an action-item matrix with owners and deadlines."
    >
      <Card className="p-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="transcript">Raw transcript or notes</Label>
          <Textarea
            id="transcript"
            rows={10}
            placeholder="Paste meeting notes, transcript, or messy discussion log here..."
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
          />
        </div>
        <Button onClick={onRun} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          Summarize
        </Button>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6 space-y-3">
          <Label htmlFor="edit" className="text-base">Editable output</Label>
          <Textarea
            id="edit"
            rows={20}
            value={output}
            onChange={(e) => setOutput(e.target.value)}
            placeholder="Generated summary appears here. Edit before sharing."
            className="font-mono text-xs"
          />
        </Card>
        <Card className="p-6 space-y-3">
          <Label className="text-base">Rendered preview</Label>
          <div className="prose prose-sm dark:prose-invert max-w-none rounded-md border border-border bg-muted/30 p-4 min-h-[20rem] overflow-auto">
            {output ? (
              <ReactMarkdown>{output}</ReactMarkdown>
            ) : (
              <p className="text-muted-foreground text-sm">Preview will render here.</p>
            )}
          </div>
        </Card>
      </div>
    </WorkspaceShell>
  );
}
