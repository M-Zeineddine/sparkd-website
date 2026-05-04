import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";

function isAdmin(req: NextRequest) {
  return req.headers.get("x-admin") === "true" &&
    req.cookies.get("admin_session")?.value === process.env.ADMIN_SESSION_TOKEN;
}

function generateOrderNumber() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `SPK-${ts}-${rand}`;
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ orders: data });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const {
    first_name, last_name, email, phone,
    address, city, building_details, notes,
    items, total,
  } = body;

  if (!first_name || !last_name || !email || !phone || !address || !city || !building_details) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!items || items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const order_number = generateOrderNumber();

  const { data, error } = await supabase
    .from("orders")
    .insert([{
      order_number,
      first_name,
      last_name,
      email,
      phone,
      address,
      city,
      building_details,
      notes: notes || "",
      items,
      total: Number(total),
      status: "pending",
    }])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ order: data, order_number }, { status: 201 });
}
