'use client'
import React, { useState, useEffect } from 'react'
import { db } from '@/firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { useAuth } from '@/context/AuthContext'
import Image from 'next/image'

// Generate hours from 8am to 10pm
const hours = Array.from({ length: 15 }, (_, i) => i + 8)

export default function Calendar() {
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
    const getEvents = (date, hour) => {
        return events.filter(event => {
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
        <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
                <h2 className="font-medium">Calendrier des évènements</h2>
                <div className="flex items-center gap-2">
                    {currentUser && (
                        <a 
                            href="/events/create"
                            className="text-gray-600 hover:text-gray-800 transition-colors"
                            title="Créer un nouvel événement"
                        >
                            <i className="fa-solid fa-plus"></i>
                        </a>
                    )}
                    <button 
                        onClick={() => setIsMonthView(!isMonthView)}
                        className="text-gray-600 hover:text-gray-800 transition-colors"
                        title={isMonthView ? "Switch to week view" : "Switch to month view"}
                    >
                        <i className={`fa-solid ${isMonthView ? 'fa-calendar-days' : 'fa-calendar'}`}></i>
                    </button>
                </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm overflow-hidden">
                {isMonthView ? (
                    // Month view
                    <>
                        <div className="flex justify-between mb-4">
                            <button 
                                onClick={() => navigateDate(-1)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <i className="fa-solid fa-chevron-left"></i>
                            </button>
                            <span className="text-sm font-medium">
                                {currentDate.toLocaleDateString('fr-FR', { 
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </span>
                            <button 
                                onClick={() => navigateDate(1)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <i className="fa-solid fa-chevron-right"></i>
                            </button>
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                            <div className="text-center text-sm text-gray-500">L</div>
                            <div className="text-center text-sm text-gray-500">M</div>
                            <div className="text-center text-sm text-gray-500">M</div>
                            <div className="text-center text-sm text-gray-500">J</div>
                            <div className="text-center text-sm text-gray-500">V</div>
                            <div className="text-center text-sm text-gray-500">S</div>
                            <div className="text-center text-sm text-gray-500">D</div>
                            
                            {Array.from({ length: 31 }, (_, i) => {
                                const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1)
                                return (
                                    <button 
                                        key={i}
                                        className={`text-center py-1 text-sm rounded-full transition-colors
                                            ${isToday(date) ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
                                    >
                                        {i + 1}
                                    </button>
                                )
                            })}
                        </div>
                    </>
                ) : (
                    // Week view
                    <div className="relative max-h-[calc(100vh-16rem)] overflow-y-auto">
                        <div className="flex justify-between mb-4">
                            <button 
                                onClick={() => navigateDate(-1)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <i className="fa-solid fa-chevron-left"></i>
                            </button>
                            <span className="text-sm font-medium">
                                {currentDate.toLocaleDateString('fr-FR', { 
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </span>
                            <button 
                                onClick={() => navigateDate(1)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <i className="fa-solid fa-chevron-right"></i>
                            </button>
                        </div>
                        {/* Scrollable content */}
                        <div className="overflow-x-auto">
                            <div className="min-w-[500px] sm:min-w-[600px] md:min-w-[800px]">
                                {/* Week header */}
                                <div className="grid grid-cols-8 gap-1 mb-2 border-b pb-2 sticky top-0 bg-white z-10">
                                    <div className="w-16"></div> {/* Spacer for hours column */}
                                    {dates.map((date, i) => (
                                        <div 
                                            key={i} 
                                            className={`text-center text-sm ${isToday(date) ? 'font-bold' : ''}`}
                                        >
                                            <div className="hidden sm:block">{['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'][i]}</div>
                                            <div className="sm:hidden">{['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'][i]}</div>
                                            <div className={`rounded-full w-7 h-7 mx-auto flex items-center justify-center ${isToday(date) ? 'bg-black text-white' : ''}`}>
                                                {formatDate(date)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                {/* Time slots */}
                                <div className="relative">
                                    {hours.map(hour => (
                                        <div key={hour} className="grid grid-cols-8 gap-1 border-b last:border-b-0">
                                            {/* Hours column */}
                                            <div className="w-16 flex items-center justify-end pr-2 text-sm text-gray-500 border-r">
                                                {formatHour(hour)}
                                            </div>
                                            {/* Days columns */}
                                            {dates.map((date, dayIndex) => (
                                                <div 
                                                    key={dayIndex} 
                                                    className="border-l h-12 hover:bg-gray-50 transition-colors cursor-pointer relative"
                                                >
                                                    {getEvents(date, hour).map(event => (
                                                        <div
                                                            key={event.id}
                                                            className={`absolute w-[calc(100%-8px)] left-1 p-1 rounded border ${getEventColor(event.sportType)}`}
                                                            style={{ 
                                                                height: getEventHeight(event.duration),
                                                                zIndex: 10
                                                            }}
                                                            onClick={() => setSelectedEvent(event)}
                                                        >
                                                            {event.imageUrl && event.duration >= 2 && (
                                                                <div className="relative w-full h-8 mb-1 rounded overflow-hidden">
                                                                    <Image
                                                                        src={event.imageUrl}
                                                                        alt={event.title}
                                                                        fill
                                                                        className="object-cover"
                                                                    />
                                                                </div>
                                                            )}
                                                            <p className="text-xs font-medium truncate">{event.title}</p>
                                                            <p className="text-xs truncate">Par {event.authorName}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Event Details Modal */}
                {selectedEvent && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
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
                                <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
                                    <Image
                                        src={selectedEvent.imageUrl}
                                        alt={selectedEvent.title}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}
                            
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-500">Description</p>
                                    <p className="text-gray-800">{selectedEvent.description}</p>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Lieu</p>
                                        <p className="text-gray-800">{selectedEvent.location}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Type de sport</p>
                                        <p className="text-gray-800 capitalize">{selectedEvent.sportType}</p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Participants</p>
                                        <p className="text-gray-800">{selectedEvent.participants.length}/{selectedEvent.maxParticipants}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Durée</p>
                                        <p className="text-gray-800">{selectedEvent.duration} heure{selectedEvent.duration > 1 ? 's' : ''}</p>
                                    </div>
                                </div>
                                
                                <div>
                                    <p className="text-sm text-gray-500">Créé par</p>
                                    <p className="text-gray-800">{selectedEvent.authorName}</p>
                                </div>
                            </div>
                            
                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={() => setSelectedEvent(null)}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Fermer
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}