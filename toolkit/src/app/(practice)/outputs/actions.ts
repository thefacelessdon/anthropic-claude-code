"use server";

import { createClient } from "@/lib/supabase/server";
import type { OutputType, DeliveryStatus } from "@/lib/supabase/types";

const NWA_ECOSYSTEM_ID = "a0000000-0000-0000-0000-000000000001";

export async function createOutput(data: {
  output_type: string;
  title: string;
  summary?: string;
  content?: string;
  triggered_by_decision_id?: string;
  target_stakeholder_id?: string;
  delivered_to_contact?: string;
  file_url?: string;
  file_type?: string;
}) {
  const supabase = createClient();
  const row = {
    ecosystem_id: NWA_ECOSYSTEM_ID,
    output_type: data.output_type as OutputType,
    title: data.title,
    summary: data.summary || null,
    content: data.content || null,
    triggered_by_decision_id: data.triggered_by_decision_id || null,
    target_stakeholder_id: data.target_stakeholder_id || null,
    delivered_to_contact: data.delivered_to_contact || null,
    file_url: data.file_url || null,
    file_type: data.file_type || null,
    is_published: false,
    delivery_status: "draft" as DeliveryStatus,
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: output, error } = await (supabase.from("outputs") as any)
    .insert(row)
    .select("id")
    .single();

  if (error) {
    console.error("createOutput error:", error);
    return { error: error.message };
  }
  return { id: output.id };
}

export async function updateOutput(
  id: string,
  data: {
    title?: string;
    summary?: string;
    content?: string;
    output_type?: string;
    triggered_by_decision_id?: string | null;
    target_stakeholder_id?: string | null;
    delivered_to_contact?: string | null;
    file_url?: string | null;
    file_type?: string | null;
  }
) {
  const supabase = createClient();
  // Build update object with proper types
  const update: Record<string, unknown> = {};
  if (data.title !== undefined) update.title = data.title;
  if (data.summary !== undefined) update.summary = data.summary;
  if (data.content !== undefined) update.content = data.content;
  if (data.output_type !== undefined) update.output_type = data.output_type;
  if (data.triggered_by_decision_id !== undefined) update.triggered_by_decision_id = data.triggered_by_decision_id;
  if (data.target_stakeholder_id !== undefined) update.target_stakeholder_id = data.target_stakeholder_id;
  if (data.delivered_to_contact !== undefined) update.delivered_to_contact = data.delivered_to_contact;
  if (data.file_url !== undefined) update.file_url = data.file_url;
  if (data.file_type !== undefined) update.file_type = data.file_type;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("outputs") as any)
    .update(update)
    .eq("id", id);

  if (error) {
    console.error("updateOutput error:", error);
    return { error: error.message };
  }
  return { success: true };
}

export async function publishOutput(id: string) {
  const supabase = createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("outputs") as any)
    .update({
      is_published: true,
      published_at: new Date().toISOString(),
      delivery_status: "published" as DeliveryStatus,
    })
    .eq("id", id);

  if (error) {
    console.error("publishOutput error:", error);
    return { error: error.message };
  }
  return { success: true };
}

export async function markDelivered(
  id: string,
  data: {
    delivered_at: string;
    delivered_to_contact: string;
    delivery_notes?: string;
  }
) {
  const supabase = createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("outputs") as any)
    .update({
      delivery_status: "delivered" as DeliveryStatus,
      delivered_at: data.delivered_at,
      delivered_to_contact: data.delivered_to_contact,
      delivery_notes: data.delivery_notes || null,
    })
    .eq("id", id);

  if (error) {
    console.error("markDelivered error:", error);
    return { error: error.message };
  }
  return { success: true };
}

export async function markAcknowledged(id: string, notes: string) {
  const supabase = createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("outputs") as any)
    .update({
      delivery_status: "acknowledged" as DeliveryStatus,
      delivery_notes: notes,
    })
    .eq("id", id);

  if (error) {
    console.error("markAcknowledged error:", error);
    return { error: error.message };
  }
  return { success: true };
}

export async function addOutputReference(data: {
  output_id: string;
  reference_type: string;
  reference_id: string;
  context_note?: string;
}) {
  const supabase = createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("output_references") as any)
    .insert({
      output_id: data.output_id,
      reference_type: data.reference_type,
      reference_id: data.reference_id,
      context_note: data.context_note || null,
    });

  if (error) {
    console.error("addOutputReference error:", error);
    return { error: error.message };
  }
  return { success: true };
}

export async function removeOutputReference(id: string) {
  const supabase = createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("output_references") as any)
    .delete()
    .eq("id", id);

  if (error) {
    console.error("removeOutputReference error:", error);
    return { error: error.message };
  }
  return { success: true };
}
