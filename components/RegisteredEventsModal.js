'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { db } from '@/firebase'
import { collection, query, where, getDocs, updateDoc, doc, arrayRemove } from 'firebase/firestore'
import Image from 'next/image'

export default function RegisteredEventsModal({ isOpen, onClose }) {
    const { currentUser } = useAuth()
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        if (isOpen && currentUser) {
            fetchRegisteredEvents()
        }
    }, [isOpen, currentUser])

    const fetchRegisteredEvents = async () => {
        try {
            setLoading(true)
            const eventsRef = collection(db, 'events')
            const q = query(eventsRef, where('participants', 'array-contains', currentUser.uid))
            const querySnapshot = await getDocs(q)
            
            const eventsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            
            setEvents(eventsData)
        } catch (error) {
            console.error('Error fetching registered events:', error)
            setError('Failed to load registered events')
        } finally {
            setLoading(false)
        }
    }

    const handleUnregister = async (eventId) => {
        if (!currentUser) return

        try {
            const eventRef = doc(db, 'events', eventId)
            await updateDoc(eventRef, {
                participants: arrayRemove(currentUser.uid)
            })
            // Update local state
            setEvents(events.filter(event => event.id !== eventId))
        } catch (error) {
            console.error('Error unregistering from event:', error)
            setError('Failed to unregister from event')
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold">Mes événements inscrits</h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <i className="fa-solid fa-xmark text-2xl"></i>
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
                ) : events.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <i className="fa-regular fa-calendar-xmark text-4xl mb-4"></i>
                        <p>Vous n'êtes inscrit à aucun événement</p>
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
                                            <span><i className="fa-solid fa-users mr-1"></i>{event.participants?.length || 0}/{event.maxParticipants}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleUnregister(event.id)}
                                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                    >
                                        Se désinscrire
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
} 