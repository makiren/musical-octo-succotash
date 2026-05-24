import { NextResponse } from "next/server";
import { deleteState, isAllowedKey, readState, writeState } from "@/lib/server/state-store";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  if (!isAllowedKey(key)) return NextResponse.json({ error: "invalid key" }, { status: 404 });
  const raw = await readState(key);
  return new NextResponse(raw ?? "null", {
    status: 200,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

export async function PUT(req: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  if (!isAllowedKey(key)) return NextResponse.json({ error: "invalid key" }, { status: 404 });
  const body = await req.text();
  if (body.length > 1_000_000) {
    return NextResponse.json({ error: "payload too large" }, { status: 413 });
  }
  try {
    JSON.parse(body); // reject anything that isn't valid JSON
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
  await writeState(key, body);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  if (!isAllowedKey(key)) return NextResponse.json({ error: "invalid key" }, { status: 404 });
  await deleteState(key);
  return NextResponse.json({ ok: true });
}
