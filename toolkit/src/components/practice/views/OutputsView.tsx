"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  DetailPanel,
  DetailSection,
  InlineRefCard,
} from "@/components/ui/DetailPanel";
import { StatusBadge } from "@/components/ui/Badge";
import { formatDate, daysUntil, formatCurrencyShort } from "@/lib/utils/formatting";
import { OUTPUT_TYPE_LABELS, OUTPUT_TYPE_COLORS, COMPOUNDING_LABELS, GAP_LABELS, DECISION_STATUS_LABELS } from "@/lib/utils/constants";
import type { Output, OutputReference, DeliveryStatus } from "@/lib/supabase/types";
import {
  createOutput,
  updateOutput,
  publishOutput,
  markDelivered,
  addOutputReference,
  removeOutputReference,
} from "@/app/(practice)/outputs/actions";

// ─── Types ──────────────────────────────────────────

type DecisionRef = { id: string; decision_title: string; locks_date: string | null; status: string; stakeholder_name: string | null; stakeholder_org_id: string | null };
type OrgRef = { id: string; name: string };
type InvestmentRef = { id: string; initiative_name: string; amount: number | null; source_name: string | null; status: string; compounding: string };
type PrecedentRef = { id: string; name: string; period: string | null; takeaway: string | null };
type NarrativeRef = { id: string; source_name: string | null; narrative_text: string; reality_text: string | null; gap: string };

interface OutputsViewProps {
  outputs: Output[];
  decisionMap: Record<string, DecisionRef>;
  orgMap: Record<string, OrgRef>;
  refsByOutput: Record<string, OutputReference[]>;
  investmentMap: Record<string, InvestmentRef>;
  precedentMap: Record<string, PrecedentRef>;
  narrativeMap: Record<string, NarrativeRef>;
  allDecisions: DecisionRef[];
  allOrgs: OrgRef[];
  allInvestments: InvestmentRef[];
  allPrecedents: PrecedentRef[];
  allNarratives: NarrativeRef[];
}

// ─── Helpers ────────────────────────────────────────

function deliveryBadge(status: DeliveryStatus) {
  switch (status) {
    case "delivered":
      return <StatusBadge label="Delivered" color="green" />;
    case "acknowledged":
      return <StatusBadge label="Acknowledged ✓" color="green" />;
    case "published":
      return <StatusBadge label="Published" color="green" />;
    default:
      return null;
  }
}

function typeBorderColor(outputType: string): string {
  return OUTPUT_TYPE_COLORS[outputType] || "border-l-dim";
}

function navigateTo(path: string) {
  window.location.href = path;
}

// ─── Component ──────────────────────────────────────

export function OutputsView({
  outputs,
  decisionMap,
  orgMap,
  refsByOutput,
  investmentMap,
  precedentMap,
  narrativeMap,
  allDecisions,
  allOrgs,
  allInvestments,
  allPrecedents,
  allNarratives,
}: OutputsViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"published" | "drafts">("published");
  const [view, setView] = useState<"list" | "create" | "draft">("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Creation form state
  const [formType, setFormType] = useState<string>("directional_brief");
  const [formTitle, setFormTitle] = useState("");
  const [formDecision, setFormDecision] = useState("");
  const [formStakeholder, setFormStakeholder] = useState("");
  const [formContact, setFormContact] = useState("");
  const [formDocMode, setFormDocMode] = useState<"upload" | "url">("upload");
  const [formDocUrl, setFormDocUrl] = useState("");
  const [formDocFile, setFormDocFile] = useState<File | null>(null);

  // Drafting state
  const [draftSummary, setDraftSummary] = useState("");
  const [draftContent, setDraftContent] = useState("");
  const [draftTitle, setDraftTitle] = useState("");

  // Delivery form state
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryContact, setDeliveryContact] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");

  // Reference browser state
  const [showRefBrowser, setShowRefBrowser] = useState(false);
  const [refSearch, setRefSearch] = useState("");
  const [addingRefOutputId, setAddingRefOutputId] = useState<string | null>(null);

  useEffect(() => {
    const openId = searchParams.get("open");
    if (openId) setSelectedId(openId);
    const createFor = searchParams.get("create_for_decision");
    if (createFor && decisionMap[createFor]) {
      setView("create");
      setFormDecision(createFor);
      const d = decisionMap[createFor];
      if (d.stakeholder_org_id) setFormStakeholder(d.stakeholder_org_id);
    }
  }, [searchParams, decisionMap]);

  const outputMap = new Map(outputs.map((o) => [o.id, o]));
  const selected = selectedId ? outputMap.get(selectedId) : null;

  const published = outputs.filter((o) => o.is_published);
  const drafts = outputs.filter((o) => !o.is_published);

  // ─── Creation Flow ──────────────────────────────

  const handleCreate = useCallback(async () => {
    if (!formTitle.trim()) return;
    setSaving(true);

    // Resolve document URL
    let fileUrl: string | undefined;
    let fileType: string | undefined;

    if (formDocMode === "url" && formDocUrl.trim()) {
      fileUrl = formDocUrl.trim();
      fileType = "url";
    } else if (formDocMode === "upload" && formDocFile) {
      // Create a local object URL as a placeholder — in production this would upload to Supabase Storage
      fileUrl = URL.createObjectURL(formDocFile);
      const ext = formDocFile.name.split(".").pop()?.toLowerCase();
      fileType = ext === "pdf" ? "pdf" : ext === "docx" || ext === "doc" ? "docx" : ext || "unknown";
    }

    const result = await createOutput({
      output_type: formType,
      title: formTitle.trim(),
      triggered_by_decision_id: formDecision || undefined,
      target_stakeholder_id: formStakeholder || undefined,
      delivered_to_contact: formContact.trim() || undefined,
      file_url: fileUrl,
      file_type: fileType,
    });
    setSaving(false);
    if (result.id) {
      setEditingId(result.id);
      setDraftTitle(formTitle.trim());
      setDraftSummary("");
      setDraftContent("");
      setView("draft");
    }
  }, [formTitle, formType, formDecision, formStakeholder, formContact, formDocMode, formDocUrl, formDocFile]);

  const handleSaveDraft = useCallback(async () => {
    if (!editingId) return;
    setSaving(true);
    await updateOutput(editingId, {
      title: draftTitle.trim() || undefined,
      summary: draftSummary.trim() || undefined,
      content: draftContent.trim() || undefined,
    });
    setSaving(false);
    router.refresh();
  }, [editingId, draftTitle, draftSummary, draftContent, router]);

  const handlePublish = useCallback(async () => {
    if (!editingId) return;
    setSaving(true);
    await updateOutput(editingId, {
      title: draftTitle.trim() || undefined,
      summary: draftSummary.trim() || undefined,
      content: draftContent.trim() || undefined,
    });
    await publishOutput(editingId);
    setSaving(false);
    setView("list");
    setActiveTab("published");
    router.refresh();
  }, [editingId, draftTitle, draftSummary, draftContent, router]);

  const handleMarkDelivered = useCallback(async () => {
    if (!selected) return;
    setSaving(true);
    await markDelivered(selected.id, {
      delivered_at: deliveryDate || new Date().toISOString().split("T")[0],
      delivered_to_contact: deliveryContact.trim(),
      delivery_notes: deliveryNotes.trim() || undefined,
    });
    setSaving(false);
    setShowDeliveryForm(false);
    router.refresh();
  }, [selected, deliveryDate, deliveryContact, deliveryNotes, router]);

  // ─── Reference Browser ──────────────────────────

  const filteredRefs = refSearch.trim()
    ? [
        ...allInvestments.filter((i) => i.initiative_name.toLowerCase().includes(refSearch.toLowerCase())).map((i) => ({ type: "investment" as const, id: i.id, label: i.initiative_name, sub: formatCurrencyShort(i.amount) })),
        ...allDecisions.filter((d) => d.decision_title.toLowerCase().includes(refSearch.toLowerCase())).map((d) => ({ type: "decision" as const, id: d.id, label: d.decision_title, sub: d.status })),
        ...allPrecedents.filter((p) => p.name.toLowerCase().includes(refSearch.toLowerCase())).map((p) => ({ type: "precedent" as const, id: p.id, label: p.name, sub: p.period || "" })),
        ...allNarratives.filter((n) => (n.source_name || n.narrative_text).toLowerCase().includes(refSearch.toLowerCase())).map((n) => ({ type: "narrative" as const, id: n.id, label: n.source_name || n.narrative_text.slice(0, 60), sub: `${n.gap} gap` })),
        ...allOrgs.filter((o) => o.name.toLowerCase().includes(refSearch.toLowerCase())).map((o) => ({ type: "organization" as const, id: o.id, label: o.name, sub: "Organization" })),
      ].slice(0, 10)
    : [];

  const handleAddRef = useCallback(async (refType: string, refId: string) => {
    if (!addingRefOutputId) return;
    await addOutputReference({
      output_id: addingRefOutputId,
      reference_type: refType,
      reference_id: refId,
    });
    router.refresh();
    setRefSearch("");
  }, [addingRefOutputId, router]);

  const handleRemoveRef = useCallback(async (refId: string) => {
    await removeOutputReference(refId);
    router.refresh();
  }, [router]);

  // ─── Drafting View ──────────────────────────────

  if (view === "draft" && editingId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => { setView("list"); setActiveTab("drafts"); }}
            className="text-[13px] text-muted hover:text-text transition-colors"
          >
            ← Back to outputs
          </button>
          <div className="flex items-center gap-3">
            <span className="text-[12px] text-dim">{saving ? "Saving..." : ""}</span>
            <button
              onClick={handleSaveDraft}
              disabled={saving}
              className="px-4 py-2 text-[13px] font-medium text-text bg-surface-inset border border-border rounded hover:bg-elevated transition-colors disabled:opacity-50"
            >
              Save draft
            </button>
            <button
              onClick={handlePublish}
              disabled={saving || !draftContent.trim()}
              className="px-4 py-2 text-[13px] font-medium text-bg bg-text rounded hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              Publish
            </button>
          </div>
        </div>

        {/* Title */}
        <input
          type="text"
          value={draftTitle}
          onChange={(e) => setDraftTitle(e.target.value)}
          placeholder="Output title..."
          className="w-full text-[20px] font-display font-semibold text-text bg-transparent border-none outline-none placeholder:text-dim"
        />

        {/* Summary */}
        <div>
          <label className="block text-[11px] font-semibold text-dim uppercase tracking-[0.06em] mb-2">Summary</label>
          <textarea
            value={draftSummary}
            onChange={(e) => setDraftSummary(e.target.value)}
            placeholder="2-3 sentence overview..."
            rows={3}
            className="w-full text-[13px] text-text bg-surface border border-border rounded-md p-3 leading-relaxed placeholder:text-dim resize-none focus:outline-none focus:border-accent"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-[11px] font-semibold text-dim uppercase tracking-[0.06em] mb-2">Content (Markdown supported)</label>
          <textarea
            value={draftContent}
            onChange={(e) => setDraftContent(e.target.value)}
            placeholder="Write the output here..."
            rows={20}
            className="w-full text-[13px] text-text bg-surface border border-border rounded-md p-4 leading-loose font-mono placeholder:text-dim resize-y focus:outline-none focus:border-accent"
          />
        </div>
      </div>
    );
  }

  // ─── Creation Form ──────────────────────────────

  if (view === "create") {
    return (
      <div className="max-w-xl space-y-6">
        <button
          onClick={() => setView("list")}
          className="text-[13px] text-muted hover:text-text transition-colors"
        >
          ← Back to outputs
        </button>

        <h2 className="text-[20px] font-display font-semibold text-text">New Output</h2>

        <div className="space-y-4">
          {/* Type */}
          <div>
            <label className="block text-[12px] font-semibold text-dim uppercase tracking-[0.06em] mb-1.5">Type</label>
            <select
              value={formType}
              onChange={(e) => setFormType(e.target.value)}
              className="w-full text-[13px] text-text bg-surface border border-border rounded-md px-3 py-2 focus:outline-none focus:border-accent"
            >
              {Object.entries(OUTPUT_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-[12px] font-semibold text-dim uppercase tracking-[0.06em] mb-1.5">Title</label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="CACHE 2026 Grant Cycle — Pre-Deliberation Brief"
              className="w-full text-[13px] text-text bg-surface border border-border rounded-md px-3 py-2 placeholder:text-dim focus:outline-none focus:border-accent"
            />
          </div>

          {/* Triggered by decision */}
          <div>
            <label className="block text-[12px] font-semibold text-dim uppercase tracking-[0.06em] mb-1.5">Triggered by decision</label>
            <select
              value={formDecision}
              onChange={(e) => setFormDecision(e.target.value)}
              className="w-full text-[13px] text-text bg-surface border border-border rounded-md px-3 py-2 focus:outline-none focus:border-accent"
            >
              <option value="">None</option>
              {allDecisions.map((d) => (
                <option key={d.id} value={d.id}>{d.decision_title}</option>
              ))}
            </select>
          </div>

          {/* Target stakeholder */}
          <div>
            <label className="block text-[12px] font-semibold text-dim uppercase tracking-[0.06em] mb-1.5">Target stakeholder</label>
            <select
              value={formStakeholder}
              onChange={(e) => setFormStakeholder(e.target.value)}
              className="w-full text-[13px] text-text bg-surface border border-border rounded-md px-3 py-2 focus:outline-none focus:border-accent"
            >
              <option value="">None</option>
              {allOrgs.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          </div>

          {/* Deliver to */}
          <div>
            <label className="block text-[12px] font-semibold text-dim uppercase tracking-[0.06em] mb-1.5">Deliver to (person)</label>
            <input
              type="text"
              value={formContact}
              onChange={(e) => setFormContact(e.target.value)}
              placeholder="Rachel Torres, Executive Director"
              className="w-full text-[13px] text-text bg-surface border border-border rounded-md px-3 py-2 placeholder:text-dim focus:outline-none focus:border-accent"
            />
          </div>

          {/* Document */}
          <div>
            <label className="block text-[12px] font-semibold text-dim uppercase tracking-[0.06em] mb-1.5">Document</label>
            <div className="flex items-center gap-1 mb-2">
              <button
                type="button"
                onClick={() => { setFormDocMode("upload"); setFormDocUrl(""); }}
                className={`px-3 py-1 text-[12px] rounded transition-colors ${
                  formDocMode === "upload" ? "bg-surface-inset text-text font-medium" : "text-muted hover:text-text"
                }`}
              >
                Upload file
              </button>
              <button
                type="button"
                onClick={() => { setFormDocMode("url"); setFormDocFile(null); }}
                className={`px-3 py-1 text-[12px] rounded transition-colors ${
                  formDocMode === "url" ? "bg-surface-inset text-text font-medium" : "text-muted hover:text-text"
                }`}
              >
                Link (Google Docs, etc.)
              </button>
            </div>
            {formDocMode === "upload" ? (
              <div>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(e) => setFormDocFile(e.target.files?.[0] || null)}
                  className="w-full text-[13px] text-text file:mr-3 file:px-3 file:py-1.5 file:rounded file:border file:border-border file:bg-surface-inset file:text-[12px] file:font-medium file:text-text file:cursor-pointer"
                />
                {formDocFile && (
                  <p className="text-[12px] text-muted mt-1.5">
                    {formDocFile.name} ({(formDocFile.size / 1024).toFixed(0)} KB)
                  </p>
                )}
                <p className="text-[11px] text-dim mt-1">PDF or DOCX</p>
              </div>
            ) : (
              <div>
                <input
                  type="url"
                  value={formDocUrl}
                  onChange={(e) => setFormDocUrl(e.target.value)}
                  placeholder="https://docs.google.com/document/d/..."
                  className="w-full text-[13px] text-text bg-surface border border-border rounded-md px-3 py-2 placeholder:text-dim focus:outline-none focus:border-accent"
                />
                <p className="text-[11px] text-dim mt-1">Google Docs link, Dropbox link, or any document URL</p>
              </div>
            )}
          </div>

          <button
            onClick={handleCreate}
            disabled={!formTitle.trim() || saving}
            className="px-5 py-2.5 text-[13px] font-medium text-bg bg-text rounded hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? "Creating..." : "Start drafting →"}
          </button>
        </div>
      </div>
    );
  }

  // ─── Main List View ─────────────────────────────

  return (
    <>
      {/* Tab header + New output button */}
      <div className="flex items-center justify-between mb-6 border-b border-border">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab("published")}
            className={`px-4 py-2.5 text-[13px] font-medium transition-colors relative ${
              activeTab === "published" ? "text-text" : "text-muted hover:text-text"
            }`}
          >
            Published
            <span className="ml-1.5 text-[11px] text-dim bg-surface-inset px-1.5 py-0.5 rounded font-mono">
              {published.length}
            </span>
            {activeTab === "published" && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-text rounded-t" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("drafts")}
            className={`px-4 py-2.5 text-[13px] font-medium transition-colors relative ${
              activeTab === "drafts" ? "text-text" : "text-muted hover:text-text"
            }`}
          >
            Drafts
            <span className="ml-1.5 text-[11px] text-dim bg-surface-inset px-1.5 py-0.5 rounded font-mono">
              {drafts.length}
            </span>
            {activeTab === "drafts" && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-text rounded-t" />
            )}
          </button>
        </div>

        <button
          onClick={() => {
            setFormTitle("");
            setFormType("directional_brief");
            setFormDecision("");
            setFormStakeholder("");
            setFormContact("");
            setFormDocMode("upload");
            setFormDocUrl("");
            setFormDocFile(null);
            setView("create");
          }}
          className="px-4 py-1.5 text-[13px] font-medium text-text border border-border rounded hover:bg-surface-inset transition-colors mb-1"
        >
          + New output
        </button>
      </div>

      {/* Published tab */}
      {activeTab === "published" && (
        <>
          {published.length === 0 ? (
            <p className="text-[13px] text-muted">No published outputs yet.</p>
          ) : (
            <div className="space-y-3">
              {published.map((o) => (
                <OutputCard
                  key={o.id}
                  output={o}
                  decisionMap={decisionMap}
                  orgMap={orgMap}
                  selected={selectedId === o.id}
                  onClick={() => setSelectedId(o.id)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Drafts tab */}
      {activeTab === "drafts" && (
        <>
          {drafts.length === 0 ? (
            <p className="text-[13px] text-muted">No drafts.</p>
          ) : (
            <div className="space-y-3">
              {drafts.map((o) => (
                <OutputCard
                  key={o.id}
                  output={o}
                  decisionMap={decisionMap}
                  orgMap={orgMap}
                  selected={selectedId === o.id}
                  onClick={() => {
                    setSelectedId(o.id);
                  }}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ─── Detail Panel ────────────────────────── */}
      <DetailPanel
        isOpen={!!selected}
        onClose={() => { setSelectedId(null); setShowDeliveryForm(false); }}
        title={selected?.title}
        backLabel="Back to outputs"
        subtitle={
          selected ? (
            <div className="flex items-center gap-2 flex-wrap mt-1">
              <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-status-purple">
                {OUTPUT_TYPE_LABELS[selected.output_type] ?? selected.output_type}
              </span>
              {deliveryBadge(selected.delivery_status)}
              <span className="text-[12px] text-dim font-mono">
                {selected.is_published ? formatDate(selected.published_at) : formatDate(selected.created_at)}
              </span>
            </div>
          ) : undefined
        }
      >
        {selected && (
          <>
            {/* 1. Context — triggered-by decision + delivery info */}
            {(selected.triggered_by_decision_id || selected.delivered_to_contact || selected.delivery_status === "delivered" || selected.delivery_status === "acknowledged") && (
              <DetailSection title="Context">
                <div className="space-y-4">
                  {/* Triggered-by decision card */}
                  {selected.triggered_by_decision_id && decisionMap[selected.triggered_by_decision_id] && (() => {
                    const d = decisionMap[selected.triggered_by_decision_id!];
                    const days = daysUntil(d.locks_date);
                    const orgName = d.stakeholder_org_id ? orgMap[d.stakeholder_org_id]?.name : d.stakeholder_name;
                    return (
                      <InlineRefCard
                        title={d.decision_title}
                        subtitle={`${orgName || "—"} · ${DECISION_STATUS_LABELS[d.status] || d.status}${d.locks_date ? ` · Locks ${formatDate(d.locks_date)}` : ""}${days !== null && days > 0 ? ` (${days}d)` : ""}`}
                        accentColor="blue"
                        onClick={() => navigateTo(`/decisions?open=${d.id}`)}
                      />
                    );
                  })()}

                  {/* Delivery info */}
                  <div className="space-y-1.5 text-[13px]">
                    {(selected.delivered_to_contact || selected.target_stakeholder_id) && (
                      <p className="text-text">
                        <span className="text-dim">Delivered to:</span>{" "}
                        {selected.delivered_to_contact || (selected.target_stakeholder_id ? orgMap[selected.target_stakeholder_id]?.name : "—")}
                      </p>
                    )}
                    {selected.delivered_at && (
                      <p className="text-text">
                        <span className="text-dim">Delivered:</span> {formatDate(selected.delivered_at)}
                      </p>
                    )}
                    {selected.delivery_notes && (
                      <p className="text-muted">
                        <span className="text-dim">Status:</span>{" "}
                        {selected.delivery_status === "acknowledged" ? "Acknowledged" : "Delivered"} — {selected.delivery_notes}
                      </p>
                    )}
                  </div>

                  {/* Mark as delivered button */}
                  {selected.is_published && selected.delivery_status === "published" && !showDeliveryForm && (
                    <button
                      onClick={() => {
                        setShowDeliveryForm(true);
                        setDeliveryDate(new Date().toISOString().split("T")[0]);
                        setDeliveryContact(selected.delivered_to_contact || "");
                        setDeliveryNotes("");
                      }}
                      className="text-[12px] text-accent hover:underline"
                    >
                      Mark as delivered →
                    </button>
                  )}

                  {/* Delivery form */}
                  {showDeliveryForm && (
                    <div className="bg-surface-inset border border-border rounded-md p-4 space-y-3">
                      <div>
                        <label className="block text-[11px] text-dim uppercase tracking-[0.06em] mb-1">When was it delivered?</label>
                        <input
                          type="date"
                          value={deliveryDate}
                          onChange={(e) => setDeliveryDate(e.target.value)}
                          className="w-full text-[13px] text-text bg-surface border border-border rounded px-2 py-1 focus:outline-none focus:border-accent"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-dim uppercase tracking-[0.06em] mb-1">Delivered to whom?</label>
                        <input
                          type="text"
                          value={deliveryContact}
                          onChange={(e) => setDeliveryContact(e.target.value)}
                          placeholder="Rachel Torres"
                          className="w-full text-[13px] text-text bg-surface border border-border rounded px-2 py-1 placeholder:text-dim focus:outline-none focus:border-accent"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-dim uppercase tracking-[0.06em] mb-1">How / notes</label>
                        <input
                          type="text"
                          value={deliveryNotes}
                          onChange={(e) => setDeliveryNotes(e.target.value)}
                          placeholder="Email + discussed in board prep meeting"
                          className="w-full text-[13px] text-text bg-surface border border-border rounded px-2 py-1 placeholder:text-dim focus:outline-none focus:border-accent"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleMarkDelivered}
                          disabled={saving || !deliveryContact.trim()}
                          className="px-3 py-1.5 text-[12px] font-medium text-bg bg-text rounded hover:opacity-90 disabled:opacity-50"
                        >
                          {saving ? "Saving..." : "Save delivery status"}
                        </button>
                        <button
                          onClick={() => setShowDeliveryForm(false)}
                          className="px-3 py-1.5 text-[12px] text-muted hover:text-text"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </DetailSection>
            )}

            {/* 2. Document — embedded viewer or link */}
            {selected.file_url && (
              <DetailSection title="Document">
                {selected.file_type === "pdf" ? (
                  <div className="space-y-2">
                    <iframe
                      src={selected.file_url}
                      className="w-full h-[500px] rounded-md border border-border bg-white"
                      title={`${selected.title} — PDF`}
                    />
                    <a
                      href={selected.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[13px] text-accent hover:underline"
                    >
                      Open PDF in new tab →
                    </a>
                  </div>
                ) : (
                  <a
                    href={selected.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 bg-surface-inset border border-border rounded-md hover:bg-elevated transition-colors"
                  >
                    <span className="text-[20px]">
                      {selected.file_type === "docx" || selected.file_type === "doc" ? "📄" : selected.file_type === "url" ? "🔗" : "📎"}
                    </span>
                    <div>
                      <p className="text-[13px] font-medium text-text">Open document</p>
                      <p className="text-[11px] text-dim">
                        {selected.file_type === "url"
                          ? selected.file_url.length > 60
                            ? selected.file_url.slice(0, 60) + "…"
                            : selected.file_url
                          : `${(selected.file_type || "file").toUpperCase()} document`}
                      </p>
                    </div>
                  </a>
                )}
              </DetailSection>
            )}

            {/* 3. Summary */}
            {selected.summary && (
              <DetailSection title="Summary">
                <p className="text-[13px] text-text leading-relaxed">
                  {selected.summary}
                </p>
              </DetailSection>
            )}

            {/* 4. Content — notes and additional context */}
            {selected.content && (
              <DetailSection title={selected.file_url ? "Notes" : "Content"}>
                <div className="text-[13px] text-text leading-loose whitespace-pre-wrap">
                  {selected.content}
                </div>
              </DetailSection>
            )}

            {/* 5. Sources Referenced */}
            {(() => {
              const outputRefs = refsByOutput[selected.id] || [];
              return (
                <DetailSection title="Sources Referenced" subtitle="Toolkit entries that informed this output">
                  <div className="space-y-2">
                    {outputRefs.map((ref) => {
                      const { card, path } = resolveRef(ref, investmentMap, precedentMap, narrativeMap, decisionMap, orgMap);
                      return (
                        <div key={ref.id} className="group relative">
                          <InlineRefCard
                            title={card.title}
                            subtitle={card.subtitle}
                            accentColor={card.accent}
                            onClick={path ? () => navigateTo(path) : undefined}
                          >
                            {ref.context_note && (
                              <p className="text-[11px] text-dim mt-0.5 line-clamp-1">{ref.context_note}</p>
                            )}
                          </InlineRefCard>
                          <button
                            onClick={() => handleRemoveRef(ref.id)}
                            className="absolute top-2 right-2 text-[11px] text-dim hover:text-status-red opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove reference"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}

                    {outputRefs.length === 0 && (
                      <p className="text-[12px] text-dim">No references linked yet.</p>
                    )}

                    {/* Add reference */}
                    {!showRefBrowser ? (
                      <button
                        onClick={() => {
                          setShowRefBrowser(true);
                          setAddingRefOutputId(selected.id);
                          setRefSearch("");
                        }}
                        className="text-[12px] text-accent hover:underline mt-1"
                      >
                        + Add reference
                      </button>
                    ) : (
                      <div className="bg-surface-inset border border-border rounded-md p-3 space-y-2 mt-1">
                        <input
                          type="text"
                          value={refSearch}
                          onChange={(e) => setRefSearch(e.target.value)}
                          placeholder="Search investments, decisions, precedents, narratives..."
                          autoFocus
                          className="w-full text-[13px] text-text bg-surface border border-border rounded px-2 py-1.5 placeholder:text-dim focus:outline-none focus:border-accent"
                        />
                        {filteredRefs.length > 0 && (
                          <div className="space-y-1 max-h-48 overflow-y-auto">
                            {filteredRefs.map((r) => (
                              <button
                                key={`${r.type}-${r.id}`}
                                onClick={() => handleAddRef(r.type, r.id)}
                                className="w-full text-left px-2 py-1.5 rounded hover:bg-elevated transition-colors"
                              >
                                <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-dim mr-2">
                                  {r.type}
                                </span>
                                <span className="text-[13px] text-text">{r.label}</span>
                                {r.sub && <span className="text-[12px] text-dim ml-2">{r.sub}</span>}
                              </button>
                            ))}
                          </div>
                        )}
                        <button
                          onClick={() => setShowRefBrowser(false)}
                          className="text-[12px] text-muted hover:text-text"
                        >
                          Close
                        </button>
                      </div>
                    )}
                  </div>
                </DetailSection>
              );
            })()}

            {/* 6. Record */}
            <DetailSection title="Record">
              <div className="space-y-1 text-[12px] text-dim">
                <p>Created: {formatDate(selected.created_at)}</p>
                <p>Published: {selected.published_at ? formatDate(selected.published_at) : "Not published"}</p>
                {selected.delivered_at && <p>Delivered: {formatDate(selected.delivered_at)}</p>}
                <p>Last updated: {formatDate(selected.updated_at)}</p>
              </div>
              <div className="flex items-center gap-3 mt-3">
                {!selected.is_published && (
                  <button
                    onClick={() => {
                      setEditingId(selected.id);
                      setDraftTitle(selected.title);
                      setDraftSummary(selected.summary || "");
                      setDraftContent(selected.content || "");
                      setSelectedId(null);
                      setView("draft");
                    }}
                    className="text-[12px] text-accent hover:underline"
                  >
                    Edit draft →
                  </button>
                )}
              </div>
            </DetailSection>
          </>
        )}
      </DetailPanel>
    </>
  );
}

// ─── OutputCard ─────────────────────────────────────

function OutputCard({
  output,
  decisionMap,
  orgMap,
  selected,
  onClick,
}: {
  output: Output;
  decisionMap: Record<string, DecisionRef>;
  orgMap: Record<string, OrgRef>;
  selected: boolean;
  onClick: () => void;
}) {
  const typeLabel = OUTPUT_TYPE_LABELS[output.output_type] ?? output.output_type;
  const decision = output.triggered_by_decision_id
    ? decisionMap[output.triggered_by_decision_id]
    : null;
  const stakeholder = output.target_stakeholder_id
    ? orgMap[output.target_stakeholder_id]
    : null;

  const borderColor = typeBorderColor(output.output_type);
  const days = decision?.locks_date ? daysUntil(decision.locks_date) : null;

  // Delivery status display
  const isNotDelivered = output.is_published && output.delivery_status === "published";
  const isUrgentUndelivered = isNotDelivered && days !== null && days > 0 && days <= 30;

  // Delivered to: show contact if exists, otherwise org name
  const deliveredToDisplay = output.delivered_to_contact
    || (stakeholder ? stakeholder.name : null);

  return (
    <div
      onClick={onClick}
      className={`border-l-[3px] ${borderColor} bg-surface border border-border rounded-r-md px-5 py-4 cursor-pointer transition-colors hover:bg-elevated ${
        selected ? "bg-elevated ring-1 ring-accent" : ""
      }`}
    >
      {/* Row 1: Type badge + status + date */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-status-purple">
            {typeLabel}
          </span>
          {output.is_published ? (
            <>
              {output.delivery_status === "delivered" || output.delivery_status === "acknowledged" ? (
                <StatusBadge label={output.delivery_status === "acknowledged" ? "Acknowledged ✓" : "Delivered ✓"} color="green" />
              ) : (
                <StatusBadge label="Published" color="green" />
              )}
              {isNotDelivered && (
                <span className={`text-[11px] ${isUrgentUndelivered ? "text-status-orange font-medium" : "text-dim"}`}>
                  Not yet delivered
                </span>
              )}
            </>
          ) : (
            <StatusBadge label="Draft" color="dim" />
          )}
        </div>
        <span className="text-[13px] text-dim font-mono shrink-0">
          {output.is_published ? formatDate(output.published_at) : formatDate(output.created_at)}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-display text-[16px] font-semibold text-text leading-snug mt-2">
        {output.title}
      </h3>

      {/* Summary */}
      {output.summary && (
        <p className="text-[13px] text-muted leading-relaxed line-clamp-2 mt-1.5">
          {output.summary}
        </p>
      )}

      {/* Document indicator */}
      {output.file_url && (
        <p className="text-[12px] text-dim mt-1.5">
          {output.file_type === "pdf" ? "📄 PDF attached" : output.file_type === "docx" || output.file_type === "doc" ? "📄 DOCX attached" : "🔗 Document linked"}
        </p>
      )}

      {/* Triggered by + Delivered to */}
      <div className="mt-2 space-y-0.5">
        {decision && (
          <p className="text-[12px] text-accent">
            Triggered by: {decision.decision_title}
            {decision.locks_date && (
              <span className="text-dim">
                {" "}(locks {formatDate(decision.locks_date)}{days !== null && days > 0 ? ` — ${days}d` : ""})
              </span>
            )}
          </p>
        )}
        {deliveredToDisplay && (
          <p className="text-[12px] text-dim">
            Delivered to: {deliveredToDisplay}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Ref Resolver ───────────────────────────────────

function resolveRef(
  ref: OutputReference,
  investmentMap: Record<string, InvestmentRef>,
  precedentMap: Record<string, PrecedentRef>,
  narrativeMap: Record<string, NarrativeRef>,
  decisionMap: Record<string, DecisionRef>,
  orgMap: Record<string, OrgRef>,
): { card: { title: string; subtitle: string; accent: "gold" | "blue" | "green" | "orange" | "purple" }; path: string | null } {
  switch (ref.reference_type) {
    case "investment": {
      const inv = investmentMap[ref.reference_id];
      if (inv) {
        return {
          card: {
            title: inv.initiative_name,
            subtitle: `${inv.amount ? formatCurrencyShort(inv.amount) : "—"} · ${COMPOUNDING_LABELS[inv.compounding] || inv.compounding}`,
            accent: "gold",
          },
          path: `/investments?open=${inv.id}`,
        };
      }
      break;
    }
    case "decision": {
      const dec = decisionMap[ref.reference_id];
      if (dec) {
        return {
          card: {
            title: dec.decision_title,
            subtitle: `${dec.stakeholder_name || "—"} · ${DECISION_STATUS_LABELS[dec.status] || dec.status}`,
            accent: "blue",
          },
          path: `/decisions?open=${dec.id}`,
        };
      }
      break;
    }
    case "precedent": {
      const prec = precedentMap[ref.reference_id];
      if (prec) {
        return {
          card: {
            title: prec.name,
            subtitle: prec.period || "—",
            accent: "purple",
          },
          path: `/precedents?open=${prec.id}`,
        };
      }
      break;
    }
    case "narrative": {
      const nar = narrativeMap[ref.reference_id];
      if (nar) {
        return {
          card: {
            title: nar.source_name || "Unknown source",
            subtitle: `${GAP_LABELS[nar.gap] || nar.gap} · ${(nar.narrative_text || "").slice(0, 60)}…`,
            accent: "orange",
          },
          path: `/narratives?open=${nar.id}`,
        };
      }
      break;
    }
    case "organization": {
      const org = orgMap[ref.reference_id];
      if (org) {
        return {
          card: { title: org.name, subtitle: "Organization", accent: "gold" },
          path: `/ecosystem-map?open=${org.id}`,
        };
      }
      break;
    }
  }

  // Fallback
  return {
    card: { title: ref.reference_type, subtitle: "Reference", accent: "purple" },
    path: null,
  };
}
