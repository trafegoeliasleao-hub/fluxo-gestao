'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [ready, setReady] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true)
      }
    })
  }, [])

  const handleReset = async () => {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setMessage('Erro: ' + error.message)
    } else {
      setMessage('Senha atualizada! Redirecionando...')
      setTimeout(() => router.push('/auth/login'), 2000)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg w-full max-w-md">
        <h1 className="text-white text-2xl font-bold mb-6">Nova senha</h1>
        {!ready && <p className="text-yellow-400 mb-4">Verificando token...</p>}
        <input
          type="password"
          placeholder="Digite sua nova senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 rounded bg-gray-700 text-white mb-4"
        />
        <button
          onClick={handleReset}
          disabled={!ready}
          className="w-full p-3 bg-teal-500 text-white rounded font-bold disabled:opacity-50"
        >
          Salvar nova senha
        </button>
        {message && <p className="text-white mt-4">{message}</p>}
      </div>
    </div>
  )
}