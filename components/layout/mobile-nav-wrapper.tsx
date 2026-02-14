import { getCurrentUser } from "@/lib/auth"
import { MobileNav } from "./mobile-nav"

export async function MobileNavWrapper() {
  const user = await getCurrentUser()

  if (!user?.email) return null

  return <MobileNav email={user.email} />
}
