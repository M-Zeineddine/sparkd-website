import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";

function isAdmin(req: NextRequest) {
  return req.headers.get("x-admin") === "true" &&
    req.cookies.get("admin_session")?.value === process.env.ADMIN_SESSION_TOKEN;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const tag = searchParams.get("tag");
  const search = searchParams.get("search");
  const limit = parseInt(searchParams.get("limit") || "100");

  let query = supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (category) {
    query = query.eq("category", category);
  }
  if (tag) {
    query = query.contains("tags", [tag]);
  }
  if (search) {
    const { data: subMatches } = await supabase
      .from("subcategories")
      .select("slug")
      .or(`name.ilike.%${search}%,name_ar.ilike.%${search}%,slug.ilike.%${search}%`);

    const orParts = [
      `name.ilike.%${search}%`,
      `name_ar.ilike.%${search}%`,
      `category.ilike.%${search}%`,
    ];

    subMatches?.forEach((s) => orParts.push(`tags.cs.{${s.slug}}`));

    query = query.or(orParts.join(","));
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ products: data });
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { data, error } = await supabaseAdmin
    .from("products")
    .insert([body])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ product: data }, { status: 201 });
}
