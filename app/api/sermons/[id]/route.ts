import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { deleteSermon } from "@/lib/db/sermons"

interface RouteParams {
  params: Promise<{
    id: string
  }>
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
