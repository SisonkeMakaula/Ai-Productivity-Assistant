import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { Loader2, Sparkles } from "lucide-react";
import { planTasks } from "@/lib/ai.functions";
import { WorkspaceShell } from "@/components/workspace-shell";
import { Button } from "@/components/ui/button";
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

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner | Workplace AI" },
      { name: "description", content: "Convert a project goal into a prioritized daily or weekly roadmap." },
    ],
  }),
  component: PlannerPage,
});

function PlannerPage() {
  const fn = useServerFn(planTasks);
  const [goal, setGoal] = useState("");
  const [horizon, setHorizon] = useState<"Daily" | "Weekly">("Weekly");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  async function onRun() {
    if (!goal.trim()) return toast.error("Describe a project goal.");
    setLoading(true);
    try {
      const res = await fn({ data: { goal, horizon } });
      setOutput(res.text);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Planning failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <WorkspaceShell
      title="AI Task Planner"
      description="Describe a goal and receive a prioritized, structured roadmap."
    >
      <Card className="p-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="goal">Project goal</Label>
          <Textarea
            id="goal"
            rows={5}
            placeholder="e.g. Launch a new internal onboarding portal for the engineering team in 4 weeks..."
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-2">
            <Label>Horizon</Label>
            <Select value={horizon} onValueChange={(v) => setHorizon(v as typeof horizon)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Daily">Daily</SelectItem>
                <SelectItem value="Weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={onRun} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Build roadmap
          </Button>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6 space-y-3">
          <Label htmlFor="edit" className="text-base">Editable plan</Label>
          <Textarea
            id="edit"
            rows={20}
            value={output}
            onChange={(e) => setOutput(e.target.value)}
            placeholder="Your roadmap will appear here. Edit freely."
            className="font-mono text-xs"
          />
        </Card>
        <Card className="p-6 space-y-3">
          <Label className="text-base">Rendered roadmap</Label>
          <div className="prose prose-sm dark:prose-invert max-w-none rounded-md border border-border bg-muted/30 p-4 min-h-[20rem] overflow-auto">
            {output ? <ReactMarkdown>{output}</ReactMarkdown> : <p className="text-muted-foreground text-sm">Preview will render here.</p>}
          </div>
        </Card>
      </div>
    </WorkspaceShell>
  );
}
