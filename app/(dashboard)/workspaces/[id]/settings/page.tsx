'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { updateWorkspaceSchema, inviteMemberSchema } from '@/lib/validators/workspace'
import { Spinner } from '@/components/ui/spinner'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { useWorkspace } from '@/components/workspace-context'
import { toast } from 'sonner'
import { fetchAuth } from '@/lib/fetch-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Trash2 } from 'lucide-react'

type UpdateForm = z.infer<typeof updateWorkspaceSchema>
type InviteForm = z.output<typeof inviteMemberSchema>

interface Member {
    id: string
    role: string
    user: { id: string; email: string }
}

export default function WorkspaceSettingsPage() {
    const { id } = useParams<{ id: string }>()
    const { workspaceName } = useWorkspace()
    const { t } = useTranslation('workspace')
    const [members, setMembers] = useState<Member[]>([])
    const [loading, setLoading] = useState(true)

    const updateForm = useForm<UpdateForm>({ resolver: zodResolver(updateWorkspaceSchema) })
    const inviteForm = useForm<InviteForm>({ resolver: zodResolver(inviteMemberSchema) })

    useEffect(() => {
        fetchAuth(`/api/workspaces/${id}`)
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
    }, [id, updateForm])

    const onUpdate = async (data: UpdateForm) => {
        const res = await fetchAuth(`/api/workspaces/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
        if (res.ok) toast.success(t('workspace.updated'))
        else toast.error(t('workspace.update_error'))
    }

    const onInvite = async (data: InviteForm) => {
        const res = await fetchAuth(`/api/workspaces/${id}/members`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
        if (res.ok) {
            toast.success(t('workspace.member_invited'))
            inviteForm.reset()
            const updated = await fetchAuth(`/api/workspaces/${id}/members`).then(r => r.json())
            if (updated.ok) setMembers(updated.members)
        } else {
            toast.error(t('workspace.invite_error'))
        }
    }

    const onRemove = async (userId: string) => {
        const res = await fetchAuth(`/api/workspaces/${id}/members/${userId}`, { method: 'DELETE' })
        if (res.ok) setMembers(prev => prev.filter(m => m.user.id !== userId))
    }

    if (loading) return <Spinner />

    return (
        <div className="flex flex-col gap-6 max-w-lg">
            <Breadcrumb items={[
                { label: workspaceName || '...', href: `/workspaces/${id}/projects` },
                { label: t('workspace.settings_title', 'Settings') },
            ]} />

            <Card>
                <CardHeader>
                    <CardTitle>{t('workspace.settings_title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={updateForm.handleSubmit(onUpdate)} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="ws-name">{t('workspace.name_placeholder', 'Name')} <span className="text-destructive">*</span></Label>
                            <Input id="ws-name" {...updateForm.register('name')} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="ws-desc">{t('workspace.description_placeholder', 'Description')}</Label>
                            <Textarea id="ws-desc" {...updateForm.register('description')} rows={3} />
                        </div>
                        <Button type="submit">{t('workspace.save_button')}</Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('workspace.members_title')}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <ul className="flex flex-col gap-2">
                        {members.map(m => (
                            <li key={m.id} className="flex justify-between items-center rounded-lg border px-3 py-2.5">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm">{m.user.email}</span>
                                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                        {m.role === 'OWNER' ? t('workspace.role_owner') : t('workspace.role_member')}
                                    </span>
                                </div>
                                {m.role !== 'OWNER' && (
                                    <Button variant="ghost" size="icon-xs" onClick={() => onRemove(m.user.id)}>
                                        <Trash2 className="size-3.5 text-destructive" />
                                    </Button>
                                )}
                            </li>
                        ))}
                    </ul>
                    <form onSubmit={inviteForm.handleSubmit(onInvite)} className="flex gap-2">
                        <Input {...inviteForm.register('email')} placeholder={t('workspace.invite_placeholder')} className="flex-1" />
                        <Button type="submit">{t('workspace.invite_button')}</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
