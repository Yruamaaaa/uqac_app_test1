'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import { Fugaz_One } from 'next/font/google'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { db, storage } from '@/firebase'
import { doc, updateDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { calculateLevel, calculateXPProgress, XP_PER_LEVEL } from '@/utils/gamification'
import UserActivitiesModal from './UserActivitiesModal'
import RegisteredEventsModal from './RegisteredEventsModal'
import UserPostsModal from './UserPostsModal'
import FriendsModal from './FriendsModal'

const fugaz = Fugaz_One({
    weight: '400',
    subsets: ['latin'],
})

const ACTIVITIES = [
    // Sports
    { value: 'football', label: 'Football' },
    { value: 'basketball', label: 'Basketball' },
    { value: 'tennis', label: 'Tennis' },
    { value: 'volleyball', label: 'Volleyball' },
    { value: 'badminton', label: 'Badminton' },
    { value: 'table-tennis', label: 'Table Tennis' },
    { value: 'running', label: 'Running' },
    { value: 'swimming', label: 'Swimming' },
    { value: 'cycling', label: 'Cycling' },
    { value: 'hiking', label: 'Hiking' },
    { value: 'rock-climbing', label: 'Rock Climbing' },
    { value: 'yoga', label: 'Yoga' },
    { value: 'gym', label: 'Gym' },
    { value: 'martial-arts', label: 'Martial Arts' },
    { value: 'golf', label: 'Golf' },
    { value: 'skateboarding', label: 'Skateboarding' },
    { value: 'surfing', label: 'Surfing' },
    { value: 'skiing', label: 'Skiing' },
    { value: 'snowboarding', label: 'Snowboarding' },
    // Social Activities
    { value: 'eating-out', label: 'Eating Out' },
    { value: 'coffee', label: 'Coffee' },
    { value: 'movie', label: 'Movie' },
    { value: 'concert', label: 'Concert' },
    { value: 'party', label: 'Party' },
    { value: 'board-games', label: 'Board Games' },
    { value: 'video-games', label: 'Video Games' },
    { value: 'karaoke', label: 'Karaoke' },
    { value: 'dancing', label: 'Dancing' },
    { value: 'art-exhibition', label: 'Art Exhibition' },
    { value: 'museum', label: 'Museum' },
    { value: 'shopping', label: 'Shopping' },
    // Outdoor Activities
    { value: 'picnic', label: 'Picnic' },
    { value: 'camping', label: 'Camping' },
    { value: 'fishing', label: 'Fishing' },
    { value: 'kayaking', label: 'Kayaking' },
    { value: 'paddleboarding', label: 'Paddleboarding' },
    { value: 'photography', label: 'Photography' },
    { value: 'bird-watching', label: 'Bird Watching' },
    { value: 'gardening', label: 'Gardening' },
    // Learning & Development
    { value: 'language-exchange', label: 'Language Exchange' },
    { value: 'book-club', label: 'Book Club' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'study-group', label: 'Study Group' },
    { value: 'cooking-class', label: 'Cooking Class' },
    { value: 'art-class', label: 'Art Class' },
    { value: 'music-lesson', label: 'Music Lesson' },
    // Wellness & Health
    { value: 'meditation', label: 'Meditation' },
    { value: 'massage', label: 'Massage' },
    { value: 'spa', label: 'Spa' },
    { value: 'wellness-retreat', label: 'Wellness Retreat' },
    { value: 'nutrition-workshop', label: 'Nutrition Workshop' }
];

export default function ProfileContent() {
    const { userDataObj, logout, currentUser, setUserDataObj } = useAuth()
    const router = useRouter()
    const [isUpdating, setIsUpdating] = useState(false)
    const [isActivitiesModalOpen, setIsActivitiesModalOpen] = useState(false)
    const [isRegisteredEventsModalOpen, setIsRegisteredEventsModalOpen] = useState(false)
    const [isPostsModalOpen, setIsPostsModalOpen] = useState(false)
    const [isFriendsModalOpen, setIsFriendsModalOpen] = useState(false)

    const optimizeImage = async (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new window.Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    // Calculate new dimensions (max 800px width/height)
                    let width = img.width;
                    let height = img.height;
                    const maxSize = 800;
                    
                    if (width > height && width > maxSize) {
                        height = Math.round((height * maxSize) / width);
                        width = maxSize;
                    } else if (height > maxSize) {
                        width = Math.round((width * maxSize) / height);
                        height = maxSize;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    // Draw and compress image
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Convert to blob with compression
                    canvas.toBlob(
                        (blob) => {
                            if (blob) {
                                // Create a new file from the blob
                                const optimizedFile = new File([blob], file.name, {
                                    type: 'image/jpeg',
                                    lastModified: Date.now()
                                });
                                resolve(optimizedFile);
                            } else {
                                reject(new Error('Failed to optimize image'));
                            }
                        },
                        'image/jpeg',
                        0.7 // Compression quality (0.7 = 70% quality)
                    );
                };
                img.onerror = reject;
            };
            reader.onerror = reject;
        });
    };

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
            
            // Optimize the image before uploading
            const optimizedFile = await optimizeImage(file)
            
            // Delete old image if it exists
            if (userDataObj?.profileImage) {
                try {
                    const oldImageRef = ref(storage, `profile-images/${currentUser.uid}`)
                    await deleteObject(oldImageRef)
                } catch (error) {
                    console.error('Error deleting old image:', error)
                }
            }

            // Upload new optimized image
            const imageRef = ref(storage, `profile-images/${currentUser.uid}`)
            await uploadBytes(imageRef, optimizedFile)
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
                        <div className="flex flex-wrap justify-center gap-1 mt-1">
                            {userDataObj?.hobbies?.map(hobby => {
                                const activity = ACTIVITIES.find(a => a.value === hobby);
                                return (
                                    <span 
                                        key={hobby}
                                        className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                                    >
                                        {activity?.label || hobby}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Level Bar */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Niveau {userDataObj?.level || 1}</span>
                        <span>{userDataObj?.xp || 0}/{XP_PER_LEVEL} xp</span>
                    </div>
                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-black transition-all duration-500" 
                            style={{ 
                                width: `${((userDataObj?.xp || 0) % XP_PER_LEVEL) / XP_PER_LEVEL * 100}%` 
                            }}
                        ></div>
                    </div>
                </div>

                {/* Menu Items */}
                <div className="space-y-4">
                    <button 
                        onClick={() => setIsRegisteredEventsModalOpen(true)}
                        className="w-full flex items-center justify-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <i className="fa-regular fa-calendar-check w-6"></i>
                        <span className={fugaz.className}>Mes événements inscrits</span>
                    </button>

                    <button 
                        onClick={() => setIsActivitiesModalOpen(true)}
                        className="w-full flex items-center justify-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <i className="fa-regular fa-calendar-check w-6"></i>
                        <span className={fugaz.className}>Mes Activités</span>
                    </button>

                    <button 
                        onClick={() => setIsPostsModalOpen(true)}
                        className="w-full flex items-center justify-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <i className="fa-regular fa-newspaper w-6"></i>
                        <span className={fugaz.className}>Mes Posts</span>
                    </button>

                    <button 
                        onClick={() => setIsFriendsModalOpen(true)}
                        className="w-full flex items-center justify-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <i className="fa-regular fa-heart w-6"></i>
                        <span className={fugaz.className}>Amis</span>
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

            {/* Activities Modal */}
            <UserActivitiesModal 
                isOpen={isActivitiesModalOpen}
                onClose={() => setIsActivitiesModalOpen(false)}
            />

            {/* Registered Events Modal */}
            <RegisteredEventsModal
                isOpen={isRegisteredEventsModalOpen}
                onClose={() => setIsRegisteredEventsModalOpen(false)}
            />

            {/* Posts Modal */}
            <UserPostsModal 
                isOpen={isPostsModalOpen}
                onClose={() => setIsPostsModalOpen(false)}
            />

            {/* Friends Modal */}
            <FriendsModal
                isOpen={isFriendsModalOpen}
                onClose={() => setIsFriendsModalOpen(false)}
            />
        </div>
    )
} 