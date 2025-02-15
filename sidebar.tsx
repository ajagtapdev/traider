import { AppSidebar } from "./components/app-sidebar"
import { NavActions } from "./components/nav-actions"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

export default function Page() {
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <AppSidebar />
        <SidebarInset className="flex-1 overflow-auto">
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 bg-gray-800/50 backdrop-blur-sm">
            <div className="flex flex-1 items-center gap-2 px-4">
              <SidebarTrigger />
              <Separator orientation="vertical" className="mr-2 h-6" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage className="line-clamp-1 text-gray-300">
                      Project Management & Task Tracking
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className="px-4">
              <NavActions />
            </div>
          </header>
          <main className="flex flex-1 flex-col gap-6 p-6">
            <div className="mx-auto w-full max-w-4xl space-y-6">
              <div className="rounded-xl bg-gray-800/50 p-6 shadow-dimensional transition-all hover:shadow-lg">
                <h2 className="mb-4 text-2xl font-bold text-gray-100">Welcome to Your Dashboard</h2>
                <p className="text-gray-300">This is a more dimensional design with depth and visual interest.</p>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl bg-gray-800/50 p-6 shadow-dimensional transition-all hover:shadow-lg">
                  <h3 className="mb-2 text-xl font-semibold text-gray-100">Recent Activity</h3>
                  <p className="text-gray-300">Your recent project updates and tasks will appear here.</p>
                </div>
                <div className="rounded-xl bg-gray-800/50 p-6 shadow-dimensional transition-all hover:shadow-lg">
                  <h3 className="mb-2 text-xl font-semibold text-gray-100">Quick Actions</h3>
                  <p className="text-gray-300">Access frequently used tools and features from this panel.</p>
                </div>
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

