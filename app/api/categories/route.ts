import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("categories")
    .select("*, subcategories(*)")
    .order("sort_order")
    .order("sort_order", { referencedTable: "subcategories" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ categories: data ?? [] });
}
