'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { db } from '@/firebase'
import { doc, getDoc } from 'firebase/firestore'

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

export default function ProfilePreviewModal({ isOpen, onClose, userId }) {
    const [userData, setUserData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (isOpen && userId) {
            fetchUserData()
        }
    }, [isOpen, userId])

    const fetchUserData = async () => {
        try {
            setLoading(true)
            const userDoc = await getDoc(doc(db, 'users', userId))
            if (userDoc.exists()) {
                setUserData(userDoc.data())
            }
        } catch (error) {
            console.error('Error fetching user data:', error)
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-sm">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Profile</h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <i className="fa-solid fa-xmark text-2xl"></i>
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                ) : userData ? (
                    <div className="space-y-4">
                        <div className="flex flex-col items-center">
                            <div className="relative w-24 h-24 rounded-full overflow-hidden mb-3">
                                {userData.profileImage ? (
                                    <Image
                                        src={userData.profileImage}
                                        alt={userData.name || 'Profile'}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-100 grid place-items-center">
                                        <i className="fa-solid fa-user text-3xl text-gray-400"></i>
                                    </div>
                                )}
                            </div>
                            <h3 className="text-lg font-semibold">{userData.name}</h3>
                            {userData.age && (
                                <p className="text-gray-600">{userData.age} years old</p>
                            )}
                        </div>

                        {userData.hobbies && userData.hobbies.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="font-medium">Hobbies</h4>
                                <div className="flex flex-wrap gap-2">
                                    {userData.hobbies.map(hobby => {
                                        const activity = ACTIVITIES.find(a => a.value === hobby)
                                        return (
                                            <span 
                                                key={hobby}
                                                className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                                            >
                                                {activity?.label || hobby}
                                            </span>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <p>Profile not found</p>
                    </div>
                )}
            </div>
        </div>
    )
} 