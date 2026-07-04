'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { createWorkspaceSchema } from '@/lib/validators/workspace'
import { fetchAuth } from '@/lib/fetch-auth'

type FormData = z.infer<typeof createWorkspaceSchema>

export default function NewWorkspacePage() {
    const { t } = useTranslation('workspace')
    const router = useRouter()
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({ resolver: zodResolver(createWorkspaceSchema) })

    const onSubmit = async (data: FormData) => {
        const res = await fetchAuth('/api/workspaces', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
        const json = await res.json()
        if (json.ok) {
            toast.success(t('workspace.created'))
            router.push('/workspaces')
        } else {
            toast.error(json.error?.code || t('workspace.create_error'))
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 max-w-md">
            <h1 className="text-2xl font-bold">{t('workspace.create_title')}</h1>
            <input
                {...register('name')}
                placeholder={t('workspace.name_placeholder')}
                className="border rounded px-3 py-2"
            />
            {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
            <textarea
                {...register('description')}
                placeholder={t('workspace.description_placeholder')}
                className="border rounded px-3 py-2"
                rows={3}
            />
            <button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary text-primary-foreground rounded px-3 py-2"
            >
                {t('workspace.create_button')}
            </button>
        </form>
    )
}
