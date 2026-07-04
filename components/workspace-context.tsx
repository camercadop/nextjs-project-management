'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { fetchAuth } from '@/lib/fetch-auth'

interface WorkspaceContextValue {
    workspaceId: string
    workspaceName: string
}

const WorkspaceContext = createContext<WorkspaceContextValue>({ workspaceId: '', workspaceName: '' })

export function useWorkspace() {
    return useContext(WorkspaceContext)
}

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
    const { id } = useParams<{ id: string }>()
    const [name, setName] = useState('')

    useEffect(() => {
        fetchAuth(`/api/workspaces/${id}`)
            .then(res => res.json())
            .then(data => { if (data.ok) setName(data.workspace.name) })
    }, [id])

    return (
        <WorkspaceContext.Provider value={{ workspaceId: id, workspaceName: name }}>
            {children}
        </WorkspaceContext.Provider>
    )
}
