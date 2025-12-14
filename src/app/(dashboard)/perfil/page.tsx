'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Mail, Building, Phone, Save, Loader2, Camera } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Avatar,
} from '@/components/ui'
import { Header } from '@/components/layout'

const perfilSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  telefone: z.string().optional(),
  oab: z.string().optional(),
  escritorio: z.string().optional(),
  endereco: z.string().optional(),
})

type PerfilFormData = z.infer<typeof perfilSchema>

export default function PerfilPage() {
  const { data: session, update: updateSession } = useSession()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<PerfilFormData>({
    resolver: zodResolver(perfilSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  })

  useEffect(() => {
    if (session?.user) {
      reset({
        name: session.user.name || '',
        email: session.user.email || '',
      })
    }
  }, [session, reset])

  const onSubmit = async (data: PerfilFormData) => {
    setSaving(true)
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar perfil')
      }

      // Atualizar sessão
      await updateSession({
        ...session,
        user: {
          ...session?.user,
          name: data.name,
        },
      })

      toast.success('Perfil atualizado com sucesso!')
    } catch (error) {
      toast.error('Erro ao atualizar perfil')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Header title="Meu Perfil" />

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Avatar Section */}
        <Card variant="bordered">
          <CardContent className="py-8">
            <div className="flex flex-col items-center">
              <div className="relative">
                <Avatar
                  name={session?.user?.name || 'User'}
                  size="xl"
                />
                <button
                  className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 transition-colors"
                  onClick={() => toast('Em breve: Upload de foto de perfil')}
                >
                  <Camera className="w-5 h-5" />
                </button>
              </div>
              <h2 className="mt-4 text-xl font-semibold text-white">
                {session?.user?.name}
              </h2>
              <p className="text-dark-400">{session?.user?.email}</p>
            </div>
          </CardContent>
        </Card>

        {/* Profile Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card variant="bordered">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary-400" />
                Informações Pessoais
              </CardTitle>
              <CardDescription>
                Atualize suas informações de perfil
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nome Completo"
                  placeholder="Seu nome"
                  error={errors.name?.message}
                  {...register('name')}
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="seu@email.com"
                  error={errors.email?.message}
                  disabled
                  {...register('email')}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Telefone"
                  placeholder="(11) 99999-9999"
                  {...register('telefone')}
                />
                <Input
                  label="Número OAB"
                  placeholder="123456/SP"
                  {...register('oab')}
                />
              </div>

              <Input
                label="Escritório / Empresa"
                placeholder="Nome do escritório"
                {...register('escritorio')}
              />

              <Input
                label="Endereço"
                placeholder="Endereço completo"
                {...register('endereco')}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end mt-6">
            <Button
              type="submit"
              loading={saving}
              disabled={!isDirty}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              Salvar Alterações
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
