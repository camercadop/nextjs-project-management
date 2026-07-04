'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { fetchAuth } from '@/lib/fetch-auth'

/** Values exposed by the workspace context. */
interface WorkspaceContextValue {
    workspaceId: string
    workspaceName: string
}

/** @internal React context holding the current workspace info. */
const WorkspaceContext = createContext<WorkspaceContextValue>({
    workspaceId: '',
    workspaceName: '',
})

/** Returns the current workspace id and name from context. */
export function useWorkspace() {
    return useContext(WorkspaceContext)
}

/**
 * Provides workspace context to child components.
 * Fetches workspace details based on the `id` route param.
 */
export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
    const { id } = useParams<{ id: string }>()
    const [name, setName] = useState('')

    useEffect(() => {
        fetchAuth(`/api/workspaces/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.ok) setName(data.workspace.name)
            })
    }, [id])

    return (
        <WorkspaceContext.Provider value={{ workspaceId: id, workspaceName: name }}>
            {children}
        </WorkspaceContext.Provider>
    )
}
