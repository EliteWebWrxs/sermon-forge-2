import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { deleteSermon, getSermonById } from "@/lib/db/sermons"

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

/**
 * GET /api/sermons/[id]
 * Get sermon details (used for status polling)
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const sermon = await getSermonById(id, user.id)

    if (!sermon) {
      return NextResponse.json({ error: "Sermon not found" }, { status: 404 })
    }

    return NextResponse.json(sermon)
  } catch (error) {
    console.error("Error fetching sermon:", error)
    return NextResponse.json(
      { error: "Failed to fetch sermon" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    await deleteSermon(id, user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting sermon:", error)
    return NextResponse.json(
      { error: "Failed to delete sermon" },
      { status: 500 }
    )
  }
}
