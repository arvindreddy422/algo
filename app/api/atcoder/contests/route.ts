import { NextResponse } from "next/server";

export const revalidate = 3600; // cache for 1 hour

export async function GET() {
  try {
    const res = await fetch(
      "https://kenkoooo.com/atcoder/resources/contests.json",
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) throw new Error(`upstream ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch contests" },
      { status: 502 }
    );
  }
}
