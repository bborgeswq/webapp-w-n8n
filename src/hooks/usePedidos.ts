'use client'

import { useState, useEffect, useCallback } from 'react'

interface Pedido {
  id: string
  titulo: string
  tipoPeca: string
  status: string
  createdAt: string
  confirmado: boolean
}

export function usePedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPedidos = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/pedidos')
      if (response.ok) {
        const data = await response.json()
        setPedidos(data)
        setError(null)
      } else {
        throw new Error('Erro ao carregar pedidos')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPedidos()
  }, [fetchPedidos])

  return {
    pedidos,
    loading,
    error,
    refresh: fetchPedidos,
  }
}
