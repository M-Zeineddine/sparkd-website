import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const designFile = formData.get("design") as File | null;
  const firstName = (formData.get("first_name") as string)?.trim();
  const lastName = (formData.get("last_name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  const city = (formData.get("city") as string)?.trim();
  const quantity = parseInt((formData.get("quantity") as string) ?? "1") || 1;
  const notes = ((formData.get("notes") as string) ?? "").trim();

  if (!designFile || !firstName || !phone || !city) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const ext = designFile.type === "image/png" ? "png" : "jpg";
  const fileName = `custom-designs/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const arrayBuffer = await designFile.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error: uploadError } = await supabaseAdmin.storage
    .from("product-images")
    .upload(fileName, buffer, { contentType: designFile.type, upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from("product-images").getPublicUrl(fileName);

  const { error: dbError } = await supabaseAdmin.from("custom_orders").insert({
    first_name: firstName,
    last_name: lastName || null,
    phone,
    city,
    quantity,
    notes: notes || null,
    design_url: publicUrl,
    status: "pending",
  });

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
