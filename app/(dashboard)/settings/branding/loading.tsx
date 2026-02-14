import { Header } from "@/components/layout/header"
import { FormSkeleton } from "@/components/ui/skeleton"

export default function BrandingLoading() {
  return (
    <>
      <Header
        title="Branding"
        description="Customize how your exports look with your church branding."
      />
      <FormSkeleton />
    </>
  )
}
