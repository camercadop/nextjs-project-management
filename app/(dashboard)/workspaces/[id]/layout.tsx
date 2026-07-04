'use client'

import { WorkspaceProvider } from '@/components/workspace-context'

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
    return <WorkspaceProvider>{children}</WorkspaceProvider>
}
