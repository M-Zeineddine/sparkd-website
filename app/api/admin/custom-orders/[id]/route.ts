import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

function auth(req: NextRequest) {
  return req.cookies.get("admin_session")?.value === process.env.ADMIN_SESSION_TOKEN;
}

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"]);

async function uploadToStorage(file: File, folder: string): Promise<string> {
  const extMap: Record<string, string> = { "image/jpeg": "jpg", "image/svg+xml": "svg" };
  const ext = extMap[file.type] ?? file.type.split("/")[1] ?? "png";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabaseAdmin.storage
    .from("product-images")
    .upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type, upsert: false });
  if (error) throw new Error(error.message);
  return supabaseAdmin.storage.from("product-images").getPublicUrl(path).data.publicUrl;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { data, error } = await supabaseAdmin
    .from("custom_orders")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ order: data });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { status } = await req.json();
  const { error } = await supabaseAdmin.from("custom_orders").update({ status }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const formData = await req.formData();

  const designFile = formData.get("design") as File | null;
  const designMode = ((formData.get("design_mode") as string) ?? "single").trim();
  const designLayoutRaw = (formData.get("design_layout") as string) ?? null;
  const imageCount = parseInt((formData.get("image_count") as string) ?? "0") || 0;

  if (!designFile) return NextResponse.json({ error: "Missing design file" }, { status: 400 });

  const designUrl = await uploadToStorage(designFile, "custom-designs").catch(err =>
    NextResponse.json({ error: err.message }, { status: 500 })
  );
  if (typeof designUrl !== "string") return designUrl;

  const layout = designLayoutRaw ? JSON.parse(designLayoutRaw) : null;
  if (layout && imageCount > 0) {
    const sourceUrls = await Promise.all(
      Array.from({ length: imageCount }, async (_, i) => {
        const imgFile = formData.get(`image_${i}`) as File | null;
        if (imgFile && ALLOWED_IMAGE_TYPES.has(imgFile.type)) {
          return uploadToStorage(imgFile, "design-assets").catch(() => null);
        }
        return (layout.images[i]?.storageUrl as string | undefined) ?? null;
      })
    );
    layout.images = layout.images.map(
      (img: object, i: number) => ({ ...img, storageUrl: sourceUrls[i] ?? null })
    );
  }

  const { error } = await supabaseAdmin
    .from("custom_orders")
    .update({ design_url: designUrl, design_mode: designMode, design_layout: layout })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
