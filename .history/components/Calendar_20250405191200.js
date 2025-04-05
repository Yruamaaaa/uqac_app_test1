'use client'
import React, { useState, useEffect } from 'react'
import { db } from '@/firebase'
import { collection, query, getDocs } from 'firebase/firestore'
import { useAuth } from '@/context/AuthContext'
import Image from 'next/image'

// Generate hours from 8am to 10pm
const hours = Array.from({ length: 15 }, (_, i) => i + 8)

export default function Calendar({ defaultView = 'month' }) {
    const [isMonthView, setIsMonthView] = useState(defaultView === 'month')
    const [currentDate, setCurrentDate] = useState(new Date())
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedEvent, setSelectedEvent] = useState(null)
    const { currentUser } = useAuth()

    // Get current day and calculate week start/end
    const today = new Date()
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1) // Start from Monday
    const dates = []

    // Generate dates for week view
    if (!isMonthView) {
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek)
            date.setDate(startOfWeek.getDate() + i)
            dates.push(date)
        }
    }

    // Fetch events from Firestore
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true)
                const eventsRef = collection(db, 'events')
                const q = query(eventsRef)
                const querySnapshot = await getDocs(q)
                
                const eventsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    date: doc.data().date?.toDate() // Convert Firestore Timestamp to Date
                }))
                
                setEvents(eventsData)
            } catch (error) {
                console.error('Error fetching events:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchEvents()
    }, [currentDate])

    // Navigate between weeks/months
    const navigateDate = (direction) => {
        const newDate = new Date(currentDate)
        if (isMonthView) {
            newDate.setMonth(currentDate.getMonth() + direction)
        } else {
            newDate.setDate(currentDate.getDate() + (direction * 7))
        }
        setCurrentDate(newDate)
    }

    // Check if a date is today
    const isToday = (date) => {
        return date.toDateString() === today.toDateString()
    }

    // Format date for display
    const formatDate = (date) => {
        return date.getDate()
    }

    // Format hour for display
    const formatHour = (hour) => {
        return `${hour}:00`
    }

    // Get events for a specific date and hour
    const getEvents = (date, hour) => {
        return events.filter(event => {
            if (!event.date) return false
            const eventDate = new Date(event.date)
            return eventDate.toDateString() === date.toDateString() && 
                   event.startHour === hour
        })
    }

    // Calculate event height based on duration
    const getEventHeight = (duration) => {
        return `${duration * 48}px` // 48px is the height of one hour slot
    }

    // Get color class based on sport type
    const getEventColor = (sportType) => {
        const colors = {
            football: 'bg-blue-100 border-blue-300 text-blue-700',
            basketball: 'bg-orange-100 border-orange-300 text-orange-700',
            tennis: 'bg-green-100 border-green-300 text-green-700',
            badminton: 'bg-purple-100 border-purple-300 text-purple-700',
            running: 'bg-red-100 border-red-300 text-red-700',
            gym: 'bg-yellow-100 border-yellow-300 text-yellow-700',
            other: 'bg-gray-100 border-gray-300 text-gray-700'
        }
        return colors[sportType] || colors.other
    }

    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Calendar Header */}
            <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigateDate(-1)}
                        className="p-2 hover:bg-gray-100 rounded-full"
                    >
                        <i className="fa-solid fa-chevron-left"></i>
                    </button>
                    <h2 className="text-lg font-semibold">
                        {currentDate.toLocaleDateString('fr-FR', { 
                            month: 'long',
                            year: 'numeric'
                        })}
                    </h2>
                    <button
                        onClick={() => navigateDate(1)}
                        className="p-2 hover:bg-gray-100 rounded-full"
                    >
                        <i className="fa-solid fa-chevron-right"></i>
                    </button>
                </div>
                <button
                    onClick={() => setIsMonthView(!isMonthView)}
                    className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-50"
                >
                    {isMonthView ? 'Vue semaine' : 'Vue mois'}
                </button>
            </div>

            {/* Week View */}
            {!isMonthView && (
                <div className="overflow-auto">
                    <div className="min-w-[800px]">
                        {/* Days header */}
                        <div className="grid grid-cols-8 border-b">
                            <div className="p-4 border-r"></div>
                            {dates.map((date, index) => (
                                <div
                                    key={index}
                                    className={`p-4 text-center border-r ${
                                        isToday(date) ? 'bg-blue-50' : ''
                                    }`}
                                >
                                    <p className="font-medium">
                                        {date.toLocaleDateString('fr-FR', { weekday: 'short' })}
                                    </p>
                                    <p className={`text-2xl ${isToday(date) ? 'text-blue-500' : ''}`}>
                                        {formatDate(date)}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Hours and events */}
                        <div className="relative">
                            {hours.map(hour => (
                                <div key={hour} className="grid grid-cols-8">
                                    <div className="p-4 border-r border-b text-sm text-gray-500">
                                        {formatHour(hour)}
                                    </div>
                                    {dates.map((date, dateIndex) => (
                                        <div
                                            key={dateIndex}
                                            className="border-r border-b relative min-h-[48px]"
                                        >
                                            {getEvents(date, hour).map((event, eventIndex) => (
                                                <div
                                                    key={eventIndex}
                                                    className="absolute inset-x-0 mx-1 rounded bg-blue-500 text-white p-1 overflow-hidden cursor-pointer hover:bg-blue-600 transition-colors"
                                                    style={{
                                                        height: getEventHeight(event.duration),
                                                        zIndex: 10
                                                    }}
                                                    onClick={() => setSelectedEvent(event)}
                                                >
                                                    <p className="text-sm font-medium">{event.title}</p>
                                                    <p className="text-xs">{event.location}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Event Details Modal */}
            {selectedEvent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 max-w-lg w-full">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-semibold">{selectedEvent.title}</h3>
                            <button
                                onClick={() => setSelectedEvent(null)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        
                        {selectedEvent.imageUrl && (
                            <div className="relative h-48 w-full rounded-lg overflow-hidden mb-4">
                                <Image
                                    src={selectedEvent.imageUrl}
                                    alt={selectedEvent.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        )}

                        <div className="space-y-4">
                            <p className="text-gray-600">{selectedEvent.description}</p>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <i className="fa-solid fa-calendar mr-2"></i>
                                    {new Date(selectedEvent.date).toLocaleDateString('fr-FR', {
                                        weekday: 'long',
                                        day: 'numeric',
                                        month: 'long'
                                    })}
                                </div>
                                <div>
                                    <i className="fa-solid fa-clock mr-2"></i>
                                    {selectedEvent.startHour}:00 - {selectedEvent.startHour + selectedEvent.duration}:00
                                </div>
                                <div>
                                    <i className="fa-solid fa-location-dot mr-2"></i>
                                    {selectedEvent.location}
                                </div>
                                <div>
                                    <i className="fa-solid fa-users mr-2"></i>
                                    {selectedEvent.participants?.length || 0}/{selectedEvent.maxParticipants}
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-4">
                                <span className="text-sm text-gray-500">
                                    Créé par {selectedEvent.authorName}
                                </span>
                                {currentUser?.uid === selectedEvent.authorId && (
                                    <button className="text-red-500 hover:text-red-600">
                                        <i className="fa-solid fa-trash"></i>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}