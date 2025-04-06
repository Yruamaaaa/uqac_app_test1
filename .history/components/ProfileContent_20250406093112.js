'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import { Fugaz_One } from 'next/font/google'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { db, storage } from '@/firebase'
import { doc, updateDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'

const fugaz = Fugaz_One({
    weight: '400',
    subsets: ['latin'],
})

export default function ProfileContent() {
    const { userDataObj, logout, currentUser, setUserDataObj } = useAuth()
    const router = useRouter()
    const [isUpdating, setIsUpdating] = useState(false)

    const handleLogout = async () => {
        try {
            await logout()
            router.push('/')
        } catch (error) {
            console.error('Logout error:', error)
        }
    }

    const handleImageChange = async (e) => {
        const file = e.target.files[0]
        if (!file || !currentUser) return

        try {
            setIsUpdating(true)
            
            // Delete old image if it exists
            if (userDataObj?.profileImage) {
                try {
                    const oldImageRef = ref(storage, `profile-images/${currentUser.uid}`)
                    await deleteObject(oldImageRef)
                } catch (error) {
                    console.error('Error deleting old image:', error)
                }
            }

            // Upload new image
            const imageRef = ref(storage, `profile-images/${currentUser.uid}`)
            await uploadBytes(imageRef, file)
            const downloadURL = await getDownloadURL(imageRef)

            // Update Firestore
            const userRef = doc(db, 'users', currentUser.uid)
            await updateDoc(userRef, {
                profileImage: downloadURL,
                updatedAt: new Date().toISOString()
            })

            // Update local state
            setUserDataObj(prev => ({
                ...prev,
                profileImage: downloadURL
            }))

        } catch (error) {
            console.error('Error updating profile image:', error)
        } finally {
            setIsUpdating(false)
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Profile Info */}
            <div className="p-6 space-y-6">
                {/* Avatar and Name */}
                <div className="flex flex-col items-center">
                    <div className="relative w-32 h-32 rounded-full overflow-hidden mb-4 group">
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
                        <label 
                            htmlFor="profile-image"
                            className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <i className="fa-solid fa-camera text-white text-2xl"></i>
                        </label>
                        <input
                            id="profile-image"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                            disabled={isUpdating}
                        />
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