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
            <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
                <div className="space-y-6">
                    <Calendar />
                    
                    {/* Events Search Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">Rechercher un événement</h2>
                        </div>
                        <SearchBar
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            selectedSport={selectedSport}
                            setSelectedSport={setSelectedSport}
                            selectedDay={selectedDay}
                            setSelectedDay={setSelectedDay}
                        />
                        <EventList events={events} loading={loading} />
                    </div>

                    {/* Partners Search Section */}
                    <PartnerSearch />
                </div>
            </main>
            <BottomNav />
        </div>
    )
} 