import { Header } from "@/components/layout/header"
import { SermonListSkeleton } from "@/components/ui/skeleton"

export default function SermonsLoading() {
  return (
    <>
      <Header
        title="My Sermons"
        description="Manage all your sermon uploads and generated content."
      />
      <SermonListSkeleton count={6} />
    </>
  )
}
