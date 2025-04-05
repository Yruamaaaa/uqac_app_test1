'use client'
import Login from '@/components/Login'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function LoginPage() {
    const { currentUser, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && currentUser) {
            router.replace('/dashboard')
        }
    }, [currentUser, loading, router])

    if (loading) return null

    return <Login />
} 