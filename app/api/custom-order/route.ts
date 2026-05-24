import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"]);

async function uploadToStorage(file: File, folder: string): Promise<string> {
  const extMap: Record<string, string> = { "image/jpeg": "jpg", "image/svg+xml": "svg" };
  const ext = extMap[file.type] ?? file.type.split("/")[1] ?? "png";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await supabaseAdmin.storage
    .from("product-images")
    .upload(path, buffer, { contentType: file.type, upsert: false });
  if (error) throw new Error(error.message);
  return supabaseAdmin.storage.from("product-images").getPublicUrl(path).data.publicUrl;
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const designFile = formData.get("design") as File | null;
  const firstName = (formData.get("first_name") as string)?.trim();
  const lastName = (formData.get("last_name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  const city = (formData.get("city") as string)?.trim();
  const quantity = parseInt((formData.get("quantity") as string) ?? "1") || 1;
  const notes = ((formData.get("notes") as string) ?? "").trim();
  const designMode = ((formData.get("design_mode") as string) ?? "single").trim();
  const designLayoutRaw = (formData.get("design_layout") as string) ?? null;
  const imageCount = parseInt((formData.get("image_count") as string) ?? "0") || 0;

  if (!designFile || !firstName || !phone || !city) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Upload composed preview PNG
  const designUrl = await uploadToStorage(designFile, "custom-designs").catch(err =>
    NextResponse.json({ error: err.message }, { status: 500 })
  );
  if (typeof designUrl !== "string") return designUrl;

  // Upload each source image and attach URLs to layout
  const layout = designLayoutRaw ? JSON.parse(designLayoutRaw) : null;
  if (layout && imageCount > 0) {
    const sourceUrls = await Promise.all(
      Array.from({ length: imageCount }, async (_, i) => {
        const imgFile = formData.get(`image_${i}`) as File | null;
        if (imgFile && ALLOWED_IMAGE_TYPES.has(imgFile.type)) {
          return uploadToStorage(imgFile, "design-assets").catch(() => null);
        }
        // Image was loaded from storage (re-edit) — keep its existing URL
        return (layout.images[i]?.storageUrl as string | undefined) ?? null;
      })
    );
    layout.images = layout.images.map(
      (img: object, i: number) => ({ ...img, storageUrl: sourceUrls[i] ?? null })
    );
  }

  const { error: dbError } = await supabaseAdmin.from("custom_orders").insert({
    first_name: firstName,
    last_name: lastName || null,
    phone,
    city,
    quantity,
    notes: notes || null,
    design_url: designUrl,
    design_mode: designMode,
    design_layout: layout,
    status: "pending",
  });

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
