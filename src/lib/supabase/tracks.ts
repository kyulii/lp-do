import { pad2 } from "@/lib/lpb";
import { createClient } from "./client";

export type DbTrack = {
  id: string;
  user_id: string;
  title: string;
  is_completed: boolean;
  date: string;
  created_at: string;
};

function monthRange(year: number, month: number) {
  const start = `${year}-${pad2(month)}-01`;
  const nextY = month === 12 ? year + 1 : year;
  const nextM = month === 12 ? 1 : month + 1;
  const end = `${nextY}-${pad2(nextM)}-01`;
  return { start, end };
}

export async function fetchMonthTracks(
  userId: string,
  year: number,
  month: number
): Promise<DbTrack[]> {
  const { start, end } = monthRange(year, month);
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tracks")
    .select("*")
    .eq("user_id", userId)
    .gte("date", start)
    .lt("date", end)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function insertTrack(input: {
  id: string;
  userId: string;
  date: string;
  title: string;
}) {
  const supabase = createClient();
  const { error } = await supabase.from("tracks").insert({
    id: input.id,
    user_id: input.userId,
    date: input.date,
    title: input.title,
    is_completed: false,
  });
  if (error) throw error;
}

export async function updateTrackTitle(id: string, title: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("tracks")
    .update({ title })
    .eq("id", id);
  if (error) throw error;
}

export async function setTrackCompleted(id: string, isCompleted: boolean) {
  const supabase = createClient();
  const { error } = await supabase
    .from("tracks")
    .update({ is_completed: isCompleted })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteTrack(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("tracks").delete().eq("id", id);
  if (error) throw error;
}
