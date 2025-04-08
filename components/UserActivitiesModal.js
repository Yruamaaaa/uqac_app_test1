'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { db } from '@/firebase'
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import ProfilePreviewModal from './ProfilePreviewModal'

export default function UserActivitiesModal({ isOpen, onClose }) {
    const { currentUser } = useAuth()
    const router = useRouter()
    const [events, setEvents] = useState([])
    const [partnerRequests, setPartnerRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [activeTab, setActiveTab] = useState('events') // 'events' or 'partners'
    const [expandedEventId, setExpandedEventId] = useState(null)
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
    const [selectedUserId, setSelectedUserId] = useState(null)

    useEffect(() => {
        if (isOpen && currentUser) {
            fetchUserActivities()
        }
    }, [isOpen, currentUser])

    const fetchUserActivities = async () => {
        try {
            setLoading(true)
            setError('') // Clear any existing errors
            // Fetch events
            const eventsQuery = query(
                collection(db, 'events'),
                where('authorId', '==', currentUser.uid)
            )
            const eventsSnapshot = await getDocs(eventsQuery)
            const eventsData = await Promise.all(eventsSnapshot.docs.map(async (eventDoc) => {
                const eventData = eventDoc.data()
                // Fetch participant details
                const participants = await Promise.all(
                    (eventData.participants || []).map(async (participantId) => {
                        const userDoc = await getDoc(doc(db, 'users', participantId))
                        return userDoc.exists() ? {
                            id: participantId,
                            ...userDoc.data()
                        } : null
                    })
                )
                return {
                    id: eventDoc.id,
                    type: 'event',
                    ...eventData,
                    participants: participants.filter(p => p !== null)
                }
            }))

            // Fetch partner requests
            const partnersQuery = query(
                collection(db, 'findpartners'),
                where('authorId', '==', currentUser.uid)
            )
            const partnersSnapshot = await getDocs(partnersQuery)
            const partnersData = partnersSnapshot.docs.map(partnerDoc => ({
                id: partnerDoc.id,
                type: 'partner',
                ...partnerDoc.data()
            }))

            setEvents(eventsData)
            setPartnerRequests(partnersData)
        } catch (error) {
            console.error('Error fetching activities:', error)
            setError('Failed to load activities')
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteActivity = async (id, type) => {
        if (!confirm('Are you sure you want to delete this activity?')) return

        try {
            const collectionName = type === 'event' ? 'events' : 'findpartners'
            await deleteDoc(doc(db, collectionName, id))
            
            if (type === 'event') {
                setEvents(events.filter(event => event.id !== id))
            } else {
                setPartnerRequests(partnerRequests.filter(request => request.id !== id))
            }
        } catch (error) {
            console.error('Error deleting activity:', error)
            setError('Failed to delete activity')
        }
    }

    const handleEditActivity = (activity) => {
        if (activity.type === 'event') {
            router.push(`/create-event?edit=${activity.id}`)
        } else {
            router.push(`/find-partners?edit=${activity.id}`)
        }
    }

    const handleProfileClick = (userId) => {
        setSelectedUserId(userId)
        setIsProfileModalOpen(true)
    }

    const toggleParticipants = (eventId) => {
        setExpandedEventId(expandedEventId === eventId ? null : eventId)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold">My Activities</h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <i className="fa-solid fa-xmark text-2xl"></i>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-6 border-b">
                    <button
                        onClick={() => setActiveTab('events')}
                        className={`pb-2 px-4 ${
                            activeTab === 'events'
                                ? 'border-b-2 border-black text-black'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Events
                    </button>
                    <button
                        onClick={() => setActiveTab('partners')}
                        className={`pb-2 px-4 ${
                            activeTab === 'partners'
                                ? 'border-b-2 border-black text-black'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Partner Requests
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                ) : activeTab === 'events' ? (
                    events.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <i className="fa-regular fa-calendar-xmark text-4xl mb-4"></i>
                            <p>No events created yet</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {events.map(event => (
                                <div key={event.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start gap-4">
                                        {event.imageUrl && (
                                            <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                                                <Image
                                                    src={event.imageUrl}
                                                    alt={event.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        )}
                                        <div className="flex-grow">
                                            <h3 className="font-semibold text-lg">{event.title}</h3>
                                            <p className="text-gray-600 text-sm mb-2">{event.description}</p>
                                            <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                                                <span><i className="fa-regular fa-calendar mr-1"></i>{new Date(event.date).toLocaleDateString()}</span>
                                                <span><i className="fa-regular fa-clock mr-1"></i>{event.startHour}:00</span>
                                                <span><i className="fa-solid fa-location-dot mr-1"></i>{event.location}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEditActivity(event)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <i className="fa-regular fa-pen-to-square"></i>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteActivity(event.id, 'event')}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <i className="fa-regular fa-trash-can"></i>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Participants Section */}
                                    <div className="mt-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-600">
                                                {event.participants?.length || 0} participants
                                            </span>
                                            {event.participants?.length > 0 && (
                                                <button
                                                    onClick={() => toggleParticipants(event.id)}
                                                    className="text-gray-500 hover:text-gray-700"
                                                >
                                                    <i className={`fa-solid fa-chevron-${expandedEventId === event.id ? 'up' : 'down'}`}></i>
                                                </button>
                                            )}
                                        </div>

                                        {expandedEventId === event.id && event.participants?.length > 0 && (
                                            <div className="mt-2 space-y-2">
                                                {event.participants.map(participant => (
                                                    <div 
                                                        key={participant.id}
                                                        className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
                                                    >
                                                        <div className="relative w-8 h-8 rounded-full overflow-hidden">
                                                            {participant.profileImage ? (
                                                                <Image
                                                                    src={participant.profileImage}
                                                                    alt={participant.name}
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full bg-gray-100 grid place-items-center">
                                                                    <i className="fa-solid fa-user text-sm text-gray-400"></i>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={() => handleProfileClick(participant.id)}
                                                            className="text-sm text-gray-600 hover:text-gray-900"
                                                        >
                                                            {participant.name}
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    partnerRequests.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <i className="fa-regular fa-user-group text-4xl mb-4"></i>
                            <p>No partner requests created yet</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {partnerRequests.map(request => (
                                <div key={request.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-grow">
                                            <h3 className="font-semibold text-lg">{request.activity}</h3>
                                            <div className="flex flex-wrap gap-2 text-sm text-gray-500 mb-2">
                                                <span className="px-2 py-1 bg-gray-100 rounded-full">
                                                    <i className="fa-solid fa-chart-line mr-1"></i>
                                                    {request.skillLevel}
                                                </span>
                                                <span className="px-2 py-1 bg-gray-100 rounded-full">
                                                    <i className="fa-regular fa-calendar mr-1"></i>
                                                    {new Date(request.date).toLocaleDateString()}
                                                </span>
                                                <span className="px-2 py-1 bg-gray-100 rounded-full">
                                                    <i className="fa-regular fa-clock mr-1"></i>
                                                    {request.timePreference}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 text-sm">
                                                <i className="fa-solid fa-location-dot mr-1"></i>
                                                {request.location}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEditActivity(request)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <i className="fa-regular fa-pen-to-square"></i>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteActivity(request.id, 'partner')}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <i className="fa-regular fa-trash-can"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>

            {/* Profile Preview Modal */}
            <ProfilePreviewModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                userId={selectedUserId}
            />
        </div>
    )
} 