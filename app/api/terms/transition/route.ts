import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { TermManager, TermTransitionOptions } from "@/lib/term-management";

// POST /api/terms/transition - Transition to a new term
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      newTermId,
      options,
    }: { newTermId: string; options?: TermTransitionOptions } = body;

    if (!newTermId) {
      return NextResponse.json(
        { error: "New term ID is required" },
        { status: 400 }
      );
    }

    const result = await TermManager.transitionToNewTerm(newTermId, options);

    return NextResponse.json({
      message: "Term transition completed successfully",
      newTerm: result,
    });
  } catch (error) {
    console.error("Error transitioning term:", error);
    return NextResponse.json(
      { error: "Failed to transition term" },
      { status: 500 }
    );
  }
}
