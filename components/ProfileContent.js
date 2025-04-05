'use client'
import React from 'react'
import Image from 'next/image'
import { Fugaz_One } from 'next/font/google'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

const fugaz = Fugaz_One({
    weight: '400',
    subsets: ['latin'],
})

export default function ProfileContent() {
    const { userDataObj, logout } = useAuth()
    const router = useRouter()

    const handleLogout = async () => {
        try {
            await logout()
            router.push('/')
        } catch (error) {
            console.error('Logout error:', error)
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Profile Info */}
            <div className="p-6 space-y-6">
                {/* Avatar and Name */}
                <div className="flex flex-col items-center">
                    <div className="relative w-32 h-32 rounded-full overflow-hidden mb-4">
                        {userDataObj?.profileImage ? (
                            <Image
                                src={userDataObj.profileImage}
                                alt={userDataObj.name || 'Profile'}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-100 grid place-items-center">
                                <i className="fa-solid fa-user text-4xl text-gray-400"></i>
                            </div>
                        )}
                    </div>
                    <h2 className={`text-2xl ${fugaz.className}`}>{userDataObj?.name || 'Loading...'}</h2>
                    <div className="mt-2 text-gray-600 text-center">
                        <p className="text-sm">{userDataObj?.age ? `${userDataObj.age} years old` : ''}</p>
                        <p className="text-sm">{userDataObj?.hobby || ''}</p>
                    </div>
                </div>

                {/* Level Bar */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Niveau 2</span>
                        <span>20/100 xp</span>
                    </div>
                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-black" style={{ width: '20%' }}></div>
                    </div>
                </div>

                {/* Menu Items */}
                <div className="space-y-4">
                    <button className="w-full flex items-center justify-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <i className="fa-regular fa-bell w-6"></i>
                        <span className={fugaz.className}>Notifications</span>
                    </button>

                    <button className="w-full flex items-center justify-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <i className="fa-regular fa-calendar-check w-6"></i>
                        <span className={fugaz.className}>Mes Activités</span>
                    </button>

                    <button className="w-full flex items-center justify-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <i className="fa-regular fa-heart w-6"></i>
                        <span className={fugaz.className}>Friends</span>
                    </button>

                    <button className="w-full flex items-center justify-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <i className="fa-solid fa-gear w-6"></i>
                        <span className={fugaz.className}>Settings</span>
                    </button>

                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-red-500"
                    >
                        <i className="fa-solid fa-right-from-bracket w-6"></i>
                        <span className={fugaz.className}>Log out</span>
                    </button>
                </div>
            </div>
        </div>
    )
} 