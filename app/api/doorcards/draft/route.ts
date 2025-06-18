import { withAuth, draftService } from "@/lib/api-utils";

export async function GET() {
  return withAuth(async (session) => {
    return draftService.getAll(session.user.id);
  });
}

export async function POST(req: Request) {
  return withAuth(async (session) => {
    const data = await req.json();

    // Extract draftId from the data for consistency
    const draftId = data.draftId;

    return draftService.upsert(session.user.id, data, draftId);
  });
}

export async function DELETE(req: Request) {
  return withAuth(async (session) => {
    const { searchParams } = new URL(req.url);
    const deleteAll = searchParams.get("all") === "true";

    if (deleteAll) {
      return draftService.deleteAll(session.user.id);
    }

    const draftId = searchParams.get("id");
    if (!draftId) {
      throw new Error("Draft ID is required");
    }

    return draftService.delete(session.user.id, draftId);
  });
}
