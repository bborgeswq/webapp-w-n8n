'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Scale, Mail, Lock, User, Award } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button, Input, Card, CardContent } from '@/components/ui'

const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string(),
  oab: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
})

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          oab: data.oab,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao cadastrar')
      }

      toast.success('Conta criada com sucesso! Faça login.')
      router.push('/login')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao cadastrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <Scale className="w-12 h-12 text-primary-500" />
            <span className="text-3xl font-bold text-white">JurisAI</span>
          </div>
          <p className="text-dark-400">
            Assistente Jurídico Inteligente
          </p>
        </div>

        {/* Register Form */}
        <Card variant="bordered">
          <CardContent>
            <h2 className="text-xl font-semibold text-white mb-6">
              Crie sua conta
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400 mt-3" />
                <Input
                  label="Nome completo"
                  type="text"
                  placeholder="Dr. João Silva"
                  className="pl-10"
                  error={errors.name?.message}
                  {...register('name')}
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400 mt-3" />
                <Input
                  label="Email"
                  type="email"
                  placeholder="seu@email.com"
                  className="pl-10"
                  error={errors.email?.message}
                  {...register('email')}
                />
              </div>

              <div className="relative">
                <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400 mt-3" />
                <Input
                  label="OAB (opcional)"
                  type="text"
                  placeholder="OAB/SP 123456"
                  className="pl-10"
                  helperText="Número da sua OAB"
                  {...register('oab')}
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400 mt-3" />
                <Input
                  label="Senha"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  error={errors.password?.message}
                  {...register('password')}
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400 mt-3" />
                <Input
                  label="Confirmar senha"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                loading={loading}
              >
                Criar conta
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-dark-400">
                Já tem uma conta?{' '}
                <Link
                  href="/login"
                  className="text-primary-400 hover:text-primary-300 font-medium"
                >
                  Faça login
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-dark-500 text-sm mt-8">
          Sistema de criação de peças jurídicas com inteligência artificial
        </p>
      </div>
    </div>
  )
}
