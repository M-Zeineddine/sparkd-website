import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

function isAdmin(req: NextRequest) {
  return (
    req.headers.get("x-admin") === "true" &&
    req.cookies.get("admin_session")?.value === process.env.ADMIN_SESSION_TOKEN
  );
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { data, error } = await supabaseAdmin
    .from("subcategories")
    .insert([body])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ subcategory: data }, { status: 201 });
}
