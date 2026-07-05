// app/api/admin/issue-codes/route.ts
// 열람 코드 일괄 발급 — 미리 뽑아두고 입금 확인 시 하나씩 전송
// POST { count } + x-admin-key → { codes: string[] }

import { NextRequest, NextResponse } from "next/server";
import { issueUnlockCodes } from "@/lib/referral-server";

export async function POST(request: NextRequest) {
  const adminKey = process.env.ADMIN_KEY;
  const provided = request.headers.get("x-admin-key") || "";
  if (adminKey) {
    if (provided !== adminKey) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  } else if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "ADMIN_KEY 환경변수를 설정하세요." }, { status: 503 });
  }

  try {
    const { count } = await request.json();
    const codes = await issueUnlockCodes(Number(count) || 10);
    return NextResponse.json({ codes });
  } catch {
    return NextResponse.json({ error: "발급 실패" }, { status: 400 });
  }
}
