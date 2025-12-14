import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { z } from 'zod'
import prisma from '@/lib/prisma'

const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  oab: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password, oab } = registerSchema.parse(body)

    // Verificar se o email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Este email já está cadastrado' },
        { status: 400 }
      )
    }

    // Hash da senha
    const hashedPassword = await hash(password, 12)

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        oab,
      },
    })

    return NextResponse.json(
      {
        message: 'Usuário criado com sucesso',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Erro ao registrar:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
