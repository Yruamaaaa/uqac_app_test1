'use client'
import React, { useState, useEffect } from 'react'
import { db } from '@/firebase'
import { collection, query, getDocs } from 'firebase/firestore'
import { useAuth } from '@/context/AuthContext'
import Image from 'next/image'

// Generate hours from 8am to 10pm
const hours = Array.from({ length: 15 }, (_, i) => i + 8)

export default function Calendar({ defaultView = 'week' }) {
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
                    date: doc.data().date?.toDate() // Convert Firestore timestamp to JS Date
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

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Calendar Header */}
            <div className="p-4 flex items-center justify-between border-b">
                <button onClick={() => navigateDate(-1)} className="p-2">
                    <i className="fa-solid fa-chevron-left"></i>
                </button>
                <h2 className="text-lg font-semibold">
                    {currentDate.toLocaleDateString('fr-FR', { 
                        month: 'long',
                        year: 'numeric'
                    })}
                </h2>
                <button onClick={() => navigateDate(1)} className="p-2">
                    <i className="fa-solid fa-chevron-right"></i>
                </button>
            </div>

            {/* Calendar Grid */}
            <div className="overflow-auto max-h-[600px]">
                <div className="grid grid-cols-8 border-b">
                    {/* Time column */}
                    <div className="border-r">
                        <div className="h-10"></div> {/* Empty cell for alignment */}
                        {hours.map(hour => (
                            <div key={hour} className="h-12 border-t p-1 text-xs text-gray-500">
                                {formatHour(hour)}
                            </div>
                        ))}
                    </div>

                    {/* Days columns */}
                    {dates.map((date, index) => (
                        <div key={index} className="relative">
                            {/* Day header */}
                            <div className={`h-10 border-l p-1 text-center ${
                                isToday(date) ? 'bg-blue-50' : ''
                            }`}>
                                <div className="text-xs text-gray-500">
                                    {date.toLocaleDateString('fr-FR', { weekday: 'short' })}
                                </div>
                                <div className={`text-sm font-medium ${
                                    isToday(date) ? 'text-blue-600' : ''
                                }`}>
                                    {formatDate(date)}
                                </div>
                            </div>

                            {/* Time slots */}
                            {hours.map(hour => (
                                <div key={hour} className="h-12 border-t border-l relative">
                                    {getEvents(date, hour).map((event, eventIndex) => (
                                        <div
                                            key={event.id}
                                            className="absolute left-0 right-0 bg-blue-100 border border-blue-200 rounded p-1 overflow-hidden cursor-pointer hover:bg-blue-200 transition-colors"
                                            style={{
                                                top: '0',
                                                height: getEventHeight(event.duration),
                                                zIndex: 10
                                            }}
                                            onClick={() => setSelectedEvent(event)}
                                        >
                                            <div className="text-xs font-medium truncate">
                                                {event.title}
                                            </div>
                                            {event.imageUrl && (
                                                <div className="relative h-8 w-8 rounded overflow-hidden mt-1">
                                                    <Image
                                                        src={event.imageUrl}
                                                        alt={event.title}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Event Details Modal */}
            {selectedEvent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-auto">
                        <div className="p-6">
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
                            <h3 className="text-xl font-semibold mb-2">{selectedEvent.title}</h3>
                            <p className="text-gray-600 mb-4">{selectedEvent.description}</p>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <i className="fa-solid fa-calendar mr-2"></i>
                                    {new Date(selectedEvent.date).toLocaleDateString('fr-FR')}
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
                            <button
                                onClick={() => setSelectedEvent(null)}
                                className="mt-6 w-full px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}