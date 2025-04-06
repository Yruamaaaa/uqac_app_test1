'use client'
import { useState, useEffect } from 'react'
import { db } from '@/firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'
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

export default function EventResearch() {
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedSport, setSelectedSport] = useState('all')
    const [selectedDay, setSelectedDay] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    const { currentUser, loading: authLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!authLoading && !currentUser) {
            router.replace('/login')
        }
    }, [currentUser, authLoading, router])

    useEffect(() => {
        if (currentUser) {
            fetchEvents()
        }
    }, [selectedSport, selectedDay, searchQuery, currentUser])

    const fetchEvents = async () => {
        try {
            setLoading(true)
            let q = collection(db, 'events')
            
            // Apply filters if selected
            if (selectedSport !== 'all') {
                q = query(q, where('sportType', '==', selectedSport))
            }
            if (selectedDay !== 'all') {
                q = query(q, where('day', '==', parseInt(selectedDay)))
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

    const days = [
        { value: 'all', label: 'Tous les jours' },
        { value: '1', label: 'Lundi' },
        { value: '2', label: 'Mardi' },
        { value: '3', label: 'Mercredi' },
        { value: '4', label: 'Jeudi' },
        { value: '5', label: 'Vendredi' },
        { value: '6', label: 'Samedi' },
        { value: '7', label: 'Dimanche' }
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

                        <select
                            value={selectedDay}
                            onChange={(e) => setSelectedDay(e.target.value)}
                            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            {days.map(day => (
                                <option key={day.value} value={day.value}>
                                    {day.label}
                                </option>
                            ))}
                        </select>
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
                                {events.map(event => (
                                    <div key={event.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                                        {event.imageUrl && (
                                            <div className="relative h-48 w-full">
                                                <Image
                                                    src={event.imageUrl}
                                                    alt={event.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        )}
                                        <div className="p-4">
                                            <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
                                            <p className="text-gray-600 mb-2">{event.description}</p>
                                            <div className="grid grid-cols-2 gap-2 text-sm text-gray-500">
                                                <div>
                                                    <i className="fa-solid fa-location-dot mr-2"></i>
                                                    {event.location}
                                                </div>
                                                <div>
                                                    <i className="fa-solid fa-users mr-2"></i>
                                                    {event.participants?.length || 0}/{event.maxParticipants}
                                                </div>
                                                <div>
                                                    <i className="fa-solid fa-clock mr-2"></i>
                                                    {event.startHour}:00 - {event.startHour + event.duration}:00
                                                </div>
                                                <div>
                                                    <i className="fa-solid fa-calendar mr-2"></i>
                                                    {new Date(event.date).toLocaleDateString('fr-FR')}
                                                </div>
                                            </div>
                                            <div className="mt-4 flex justify-between items-center">
                                                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm capitalize">
                                                    {event.sportType}
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    Par {event.authorName}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Partner Search Section */}
                    <PartnerSearch />
                </div>
            </div>

            <BottomNav />
        </div>
    )
} 