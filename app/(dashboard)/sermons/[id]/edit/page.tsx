import type { Metadata } from "next"
import { Header } from "@/components/layout/header"

export const metadata: Metadata = { title: "Edit Sermon" }

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditSermonPage({ params }: Props) {
  const { id } = await params

  return (
    <>
      <Header title="Edit Sermon" description={`Editing sermon ${id}`} />
      <div className="bg-white rounded-xl border border-slate-200 p-8">
        <p className="text-sm text-slate-500">Edit form coming soon.</p>
      </div>
    </>
  )
}
