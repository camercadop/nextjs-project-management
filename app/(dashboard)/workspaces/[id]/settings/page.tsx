'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { updateWorkspaceSchema, inviteMemberSchema } from '@/lib/validators/workspace'
import { Spinner } from '@/components/ui/spinner'

type UpdateForm = z.infer<typeof updateWorkspaceSchema>
type InviteForm = z.output<typeof inviteMemberSchema>

interface Member {
    id: string
    role: string
    user: { id: string; email: string }
}

export default function WorkspaceSettingsPage() {
    const { id } = useParams<{ id: string }>()
    const { t } = useTranslation('workspace')
    const [members, setMembers] = useState<Member[]>([])
    const [loading, setLoading] = useState(true)

    const updateForm = useForm<UpdateForm>({ resolver: zodResolver(updateWorkspaceSchema) })
    const inviteForm = useForm<InviteForm>({ resolver: zodResolver(inviteMemberSchema) })

    useEffect(() => {
        fetch(`/api/workspaces/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.ok) {
                    updateForm.reset({
                        name: data.workspace.name,
                        description: data.workspace.description ?? '',
                    })
                    setMembers(data.workspace.members)
                }
            })
            .finally(() => setLoading(false))
    }, [id])

    const onUpdate = async (data: UpdateForm) => {
        await fetch(`/api/workspaces/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
    }

    const onInvite = async (data: InviteForm) => {
        const res = await fetch(`/api/workspaces/${id}/members`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
        if (res.ok) {
            inviteForm.reset()
            const updated = await fetch(`/api/workspaces/${id}/members`).then(r => r.json())
            if (updated.ok) setMembers(updated.members)
        }
    }

    const onRemove = async (userId: string) => {
        const res = await fetch(`/api/workspaces/${id}/members/${userId}`, { method: 'DELETE' })
        if (res.ok) setMembers(prev => prev.filter(m => m.user.id !== userId))
    }

    if (loading) return <Spinner />

    return (
        <div className="flex flex-col gap-8 max-w-lg">
            {/* Edit workspace */}
            <form onSubmit={updateForm.handleSubmit(onUpdate)} className="flex flex-col gap-3">
                <h2 className="text-xl font-bold">{t('workspace.settings_title')}</h2>
                <input
                    {...updateForm.register('name')}
                    placeholder={t('workspace.name_placeholder')}
                    className="border rounded px-3 py-2"
                />
                <textarea
                    {...updateForm.register('description')}
                    placeholder={t('workspace.description_placeholder')}
                    className="border rounded px-3 py-2"
                    rows={3}
                />
                <button
                    type="submit"
                    className="bg-primary text-primary-foreground rounded px-3 py-2"
                >
                    {t('workspace.create_button')}
                </button>
            </form>

            {/* Members */}
            <section className="flex flex-col gap-3">
                <h2 className="text-xl font-bold">{t('workspace.members_title')}</h2>
                <ul className="flex flex-col gap-2">
                    {members.map(m => (
                        <li
                            key={m.id}
                            className="flex justify-between items-center border rounded p-3"
                        >
                            <div>
                                <span>{m.user.email}</span>
                                <span className="ml-2 text-xs text-muted-foreground">
                                    {m.role === 'OWNER'
                                        ? t('workspace.role_owner')
                                        : t('workspace.role_member')}
                                </span>
                            </div>
                            {m.role !== 'OWNER' && (
                                <button
                                    onClick={() => onRemove(m.user.id)}
                                    className="text-red-500 text-sm"
                                >
                                    {t('workspace.remove_button')}
                                </button>
                            )}
                        </li>
                    ))}
                </ul>

                {/* Invite form */}
                <form onSubmit={inviteForm.handleSubmit(onInvite)} className="flex gap-2">
                    <input
                        {...inviteForm.register('email')}
                        placeholder={t('workspace.invite_placeholder')}
                        className="border rounded px-3 py-2 flex-1"
                    />
                    <button
                        type="submit"
                        className="bg-primary text-primary-foreground rounded px-3 py-2"
                    >
                        {t('workspace.invite_button')}
                    </button>
                </form>
            </section>
        </div>
    )
}
