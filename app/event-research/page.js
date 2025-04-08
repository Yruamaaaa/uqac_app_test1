'use client'
import { useState, useEffect } from 'react'
import { db } from '@/firebase'
import { collection, query, where, getDocs, updateDoc, doc, arrayUnion, arrayRemove } from 'firebase/firestore'
import Image from 'next/image'
import DashboardHeader from '@/components/DashboardHeader'
import BottomNav from '@/components/BottomNav'
import Calendar from '@/components/Calendar'
import SearchBar from '@/components/SearchBar'
import EventList from '@/components/EventList'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Loading from '@/components/Loading'
import PartnerSearch from '@/components/PartnerSearch'
import ProfilePreviewModal from '@/components/ProfilePreviewModal'

export default function EventResearch() {
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedSport, setSelectedSport] = useState('all')
    const [selectedDate, setSelectedDate] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const { currentUser, loading: authLoading } = useAuth()
    const router = useRouter()
    const [selectedEvent, setSelectedEvent] = useState(null)
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
    const [selectedUserId, setSelectedUserId] = useState(null)

    useEffect(() => {
        if (!authLoading && !currentUser) {
            router.replace('/login')
        }
    }, [currentUser, authLoading, router])

    useEffect(() => {
        if (currentUser) {
            fetchEvents()
        }
    }, [selectedSport, selectedDate, searchQuery, currentUser])

    const fetchEvents = async () => {
        try {
            setLoading(true)
            let q = collection(db, 'events')
            
            // Apply filters if selected
            if (selectedSport !== 'all') {
                q = query(q, where('sportType', '==', selectedSport))
            }
            if (selectedDate) {
                q = query(q, where('date', '==', selectedDate))
            }

            const querySnapshot = await getDocs(q)
            let eventsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))

            // Apply search filter if there's a search query
            if (searchQuery) {
                const searchLower = searchQuery.toLowerCase()
                eventsData = eventsData.filter(event => {
                    const title = event.title?.toLowerCase() || ''
                    const description = event.description?.toLowerCase() || ''
                    const sportType = event.sportType?.toLowerCase() || ''
                    
                    return title.includes(searchLower) ||
                           description.includes(searchLower) ||
                           sportType.includes(searchLower)
                })
            }

            setEvents(eventsData)
        } catch (error) {
            console.error('Error fetching events:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleParticipate = async (eventId, isParticipating) => {
        if (!currentUser) return

        try {
            const eventRef = doc(db, 'events', eventId)
            if (isParticipating) {
                await updateDoc(eventRef, {
                    participants: arrayRemove(currentUser.uid)
                })
            } else {
                await updateDoc(eventRef, {
                    participants: arrayUnion(currentUser.uid)
                })
            }
            // Refresh events after participation change
            fetchEvents()
        } catch (error) {
            console.error('Error updating participation:', error)
        }
    }

    const handleProfileClick = (userId) => {
        setSelectedUserId(userId)
        setIsProfileModalOpen(true)
    }

    const sportTypes = [
        { value: 'all', label: 'Tous les sports' },
        { value: 'football', label: 'Football' },
        { value: 'basketball', label: 'Basketball' },
        { value: 'tennis', label: 'Tennis' },
        { value: 'badminton', label: 'Badminton' },
        { value: 'running', label: 'Course à pied' },
        { value: 'gym', label: 'Gym' },
        { value: 'other', label: 'Autre' }
    ]

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
                    {/* Calendar Section */}
                    <Calendar />

                    {/* Search Section */}
                    <div className="mt-8 mb-8">
                        <SearchBar 
                            value={searchQuery}
                            onChange={(value) => setSearchQuery(value)}
                            placeholder="Rechercher un événement..."
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <select
                            value={selectedSport}
                            onChange={(e) => setSelectedSport(e.target.value)}
                            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            {sportTypes.map(sport => (
                                <option key={sport.value} value={sport.value}>
                                    {sport.label}
                                </option>
                            ))}
                        </select>

                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Events List Section */}
                    <div className="mt-8">
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                            </div>
                        ) : events.length === 0 ? (
                            <div className="text-center text-gray-500 py-8">
                                {searchQuery ? `Aucun événement trouvé pour "${searchQuery}"` : 'Aucun événement trouvé'}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {events.map(event => {
                                    const isParticipating = event.participants?.includes(currentUser.uid)
                                    const isAuthor = event.authorId === currentUser.uid
                                    return (
                                        <div key={event.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                                            {/* Event Image */}
                                            <div className="relative h-48">
                                                {event.imageUrl ? (
                                                    <Image
                                                        src={event.imageUrl}
                                                        alt={event.title}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-100 grid place-items-center">
                                                        <i className="fa-solid fa-image text-4xl text-gray-400"></i>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Event Content */}
                                            <div className="p-6 space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <h3 className="text-xl font-semibold">{event.title}</h3>
                                                    <span className="text-sm text-gray-500">
                                                        {event.participants?.length || 0}/{event.maxParticipants} participants
                                                    </span>
                                                </div>

                                                <p className="text-gray-600">{event.description}</p>

                                                <div className="flex flex-wrap gap-2">
                                                    <span className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                                        <i className="fa-regular fa-calendar mr-1"></i>
                                                        {new Date(event.date).toLocaleDateString()}
                                                    </span>
                                                    <span className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                                        <i className="fa-regular fa-clock mr-1"></i>
                                                        {event.startHour}:00
                                                    </span>
                                                    <span className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                                        <i className="fa-solid fa-location-dot mr-1"></i>
                                                        {event.location}
                                                    </span>
                                                </div>

                                                <div className="flex justify-between items-center gap-4">
                                                    <button
                                                        onClick={() => handleProfileClick(event.authorId)}
                                                        className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2"
                                                    >
                                                        <i className="fa-regular fa-user"></i>
                                                        <span>Created by {event.authorName}</span>
                                                    </button>

                                                    <button
                                                        onClick={() => handleParticipate(event.id, isParticipating)}
                                                        className={`px-2.5 py-1 text-sm rounded-lg transition-colors ${
                                                            isParticipating
                                                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                                                : 'bg-black text-white hover:bg-gray-800'
                                                        }`}
                                                    >
                                                        {isParticipating ? 'Cancel Participation' : 'Participate'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Partner Search Section */}
                    <PartnerSearch />
                </div>
            </div>

            <BottomNav />

            {/* Profile Preview Modal */}
            <ProfilePreviewModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                userId={selectedUserId}
            />
        </div>
    )
} 