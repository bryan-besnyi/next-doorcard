import { withAuth, draftService } from "@/lib/api-utils"

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  return withAuth(async (session) => {
    const { id } = await context.params
    return draftService.getOne(session.user.id, id)
  })
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  return withAuth(async (session) => {
    const { id } = await context.params
    const data = await req.json()
    return draftService.upsert(session.user.id, data, id)
  })
}

export async function DELETE(_req: Request, context: { params: Promise<{ id: string }> }) {
  return withAuth(async (session) => {
    const { id } = await context.params
    return draftService.delete(session.user.id, id)
  })
}

