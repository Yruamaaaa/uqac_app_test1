'use client'
import React, { useState, useEffect } from 'react'
import { db } from '@/firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { useAuth } from '@/context/AuthContext'
import Image from 'next/image'

// Generate hours from 8am to 10pm
const hours = Array.from({ length: 15 }, (_, i) => i + 8)

export default function Calendar({ defaultView = 'week' }) {
    const [isMonthView, setIsMonthView] = useState(false)
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
                const q = query(eventsRef, where('status', '==', 'active'))
                const querySnapshot = await getDocs(q)
                
                const eventsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }))
                
                setEvents(eventsData)
            } catch (error) {
                console.error('Error fetching events:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchEvents()
    }, [currentDate]) // Refetch when date changes

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

    // Get events for a specific day and hour
    const getEvents = (dayIndex, hour) => {
        return events.filter(event => 
            event.day === dayIndex + 1 && 
            event.startHour === hour
        )
    }

    // Get event height based on duration
    const getEventHeight = (duration) => {
        return `${duration * 36}px` // Reduced from 48px to 36px
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
        <div className="overflow-x-auto">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-2">
                <button
                    onClick={() => navigateDate(-1)}
                    className="p-1 hover:bg-gray-100 rounded"
                >
                    <i className="fas fa-chevron-left"></i>
                </button>
                <h3 className="text-lg font-medium">
                    {currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                </h3>
                <button
                    onClick={() => navigateDate(1)}
                    className="p-1 hover:bg-gray-100 rounded"
                >
                    <i className="fas fa-chevron-right"></i>
                </button>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-8 gap-1 mb-1">
                <div className="w-16"></div>
                {dates.map((date, index) => (
                    <div
                        key={date.toISOString()}
                        className={`text-center py-1 ${
                            isToday(date) ? 'bg-black text-white rounded' : ''
                        }`}
                    >
                        <div className="text-sm font-medium">
                            {date.toLocaleDateString('fr-FR', { weekday: 'short' })}
                        </div>
                        <div className="text-sm">
                            {formatDate(date)}
                        </div>
                    </div>
                ))}
            </div>

            {/* Time Grid */}
            <div className="grid grid-cols-8 gap-1">
                {/* Time Labels */}
                <div className="space-y-1">
                    {hours.map(hour => (
                        <div
                            key={hour}
                            className="h-9 text-xs text-gray-500 text-right pr-2"
                        >
                            {formatHour(hour)}
                        </div>
                    ))}
                </div>

                {/* Time Slots */}
                {dates.map((date, dayIndex) => (
                    <div key={date.toISOString()} className="space-y-1">
                        {hours.map(hour => {
                            const events = getEvents(dayIndex, hour)
                            return (
                                <div
                                    key={hour}
                                    className="relative h-9 bg-gray-50 rounded"
                                >
                                    {events.map(event => (
                                        <div
                                            key={event.id}
                                            onClick={() => setSelectedEvent(event)}
                                            className="absolute inset-x-0 z-10 bg-blue-500 text-white text-xs p-1 rounded cursor-pointer overflow-hidden"
                                            style={{
                                                height: getEventHeight(event.duration),
                                                backgroundColor: event.color || '#3B82F6'
                                            }}
                                        >
                                            <div className="font-medium truncate">{event.title}</div>
                                        </div>
                                    ))}
                                </div>
                            )
                        })}
                    </div>
                ))}
            </div>

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
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        
                        {selectedEvent.imageUrl && (
                            <div className="relative h-48 w-full mb-4 rounded-lg overflow-hidden">
                                <Image
                                    src={selectedEvent.imageUrl}
                                    alt={selectedEvent.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        )}

                        <p className="text-gray-600 mb-4">{selectedEvent.description}</p>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <i className="fas fa-map-marker-alt text-gray-400"></i>
                                <span>{selectedEvent.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <i className="fas fa-users text-gray-400"></i>
                                <span>{selectedEvent.participants?.length || 0}/{selectedEvent.maxParticipants}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <i className="fas fa-clock text-gray-400"></i>
                                <span>{selectedEvent.startHour}:00 - {selectedEvent.startHour + selectedEvent.duration}:00</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <i className="fas fa-user text-gray-400"></i>
                                <span>{selectedEvent.authorName}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}