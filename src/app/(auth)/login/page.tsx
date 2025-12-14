'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Scale, Mail, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button, Input, Card, CardContent } from '@/components/ui'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true)
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('Login realizado com sucesso!')
        router.push('/novo-pedido')
        router.refresh()
      }
    } catch (error) {
      toast.error('Erro ao fazer login')
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

        {/* Login Form */}
        <Card variant="bordered">
          <CardContent>
            <h2 className="text-xl font-semibold text-white mb-6">
              Entre na sua conta
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

              <Button
                type="submit"
                className="w-full"
                size="lg"
                loading={loading}
              >
                Entrar
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-dark-400">
                Não tem uma conta?{' '}
                <Link
                  href="/register"
                  className="text-primary-400 hover:text-primary-300 font-medium"
                >
                  Cadastre-se
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
