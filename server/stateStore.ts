import { supabase } from "./supabase.js";

interface StoredState<T> {
  state: T;
}

export async function loadState<T>(
  stateId: string,
): Promise<T | null> {
  const { data, error } = await supabase
    .from("app_state")
    .select("state")
    .eq("id", stateId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Unable to load application data: ${error.message}`,
    );
  }

  if (!data) {
    return null;
  }

  return (data as StoredState<T>).state;
}

export async function saveState<T>(
  stateId: string,
  state: T,
): Promise<void> {
  const { data, error } = await supabase
    .from("app_state")
    .upsert(
      {
        id: stateId,
        state,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "id",
      },
    )
    .select("id")
    .single();

  if (error) {
    throw new Error(
      `Unable to save application data: ${error.message}`,
    );
  }

  if (!data) {
    throw new Error(
      "Supabase did not confirm that the application state was saved.",
    );
  }
}