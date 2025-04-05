'use client'
import React, { useState, useEffect } from 'react'
import DashboardHeader from '@/components/DashboardHeader'
import BottomNav from '@/components/BottomNav'
import CreateEventForm from '@/components/CreateEventForm'
import FindPartnersForm from '@/components/FindPartnersForm'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Loading from '@/components/Loading'

export default function CreateEventPage() {
    const [activeForm, setActiveForm] = useState('create') // 'create' or 'find'
    const { currentUser, loading: authLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!authLoading && !currentUser) {
            router.replace('/login')
        }
    }, [currentUser, authLoading, router])

    if (authLoading) {
        return <Loading />
    }

    if (!currentUser) {
        return null
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardHeader />
            
            <div className="container mx-auto px-4 pt-8 pb-20">
                <div className="max-w-4xl mx-auto">
                    {/* Header Buttons */}
                    <div className="flex gap-4 mb-8 justify-center">
                        <button 
                            onClick={() => setActiveForm('create')}
                            className={`px-6 py-2 rounded-full font-medium transition-colors ${
                                activeForm === 'create' 
                                    ? 'bg-black text-white' 
                                    : 'bg-gray-400 text-white'
                            }`}
                        >
                            Créer événement
                        </button>
                        <button 
                            onClick={() => setActiveForm('find')}
                            className={`px-6 py-2 rounded-full font-medium transition-colors ${
                                activeForm === 'find' 
                                    ? 'bg-black text-white' 
                                    : 'bg-gray-400 text-white'
                            }`}
                        >
                            Find (a) partner(s)
                        </button>
                    </div>

                    {/* Forms */}
                    {activeForm === 'create' ? (
                        <CreateEventForm />
                    ) : (
                        <FindPartnersForm />
                    )}
                </div>
            </div>

            <BottomNav />
        </div>
    )
} 