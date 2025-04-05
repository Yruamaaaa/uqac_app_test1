'use client'
import { useState, useEffect } from 'react'
import { db } from '@/firebase'
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function WeeklyCalendar() {
    const [events, setEvents] = useState([])
    const [currentDate, setCurrentDate] = useState(new Date())
    const router = useRouter()

    // Get start and end of current week
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)

    useEffect(() => {
        const q = query(
            collection(db, 'events'),
            where('date', '>=', startOfWeek),
            where('date', '<=', endOfWeek),
            orderBy('date', 'asc')
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const eventsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            setEvents(eventsData)
        })

        return () => unsubscribe()
    }, [startOfWeek, endOfWeek])

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const hours = Array.from({ length: 24 }, (_, i) => i)

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">This Week's Events</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)))}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <i className="fa-solid fa-chevron-left"></i>
                    </button>
                    <button
                        onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)))}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <i className="fa-solid fa-chevron-right"></i>
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                    <div className="grid grid-cols-8 gap-1">
                        {/* Time column */}
                        <div className="col-span-1">
                            <div className="h-12"></div>
                            {hours.map(hour => (
                                <div key={hour} className="h-12 text-sm text-gray-500">
                                    {hour}:00
                                </div>
                            ))}
                        </div>

                        {/* Days columns */}
                        {days.map((day, dayIndex) => {
                            const currentDay = new Date(startOfWeek)
                            currentDay.setDate(startOfWeek.getDate() + dayIndex)
                            
                            return (
                                <div key={day} className="col-span-1">
                                    <div className="h-12 text-center font-medium">
                                        {day.slice(0, 3)}
                                        <div className="text-sm text-gray-500">
                                            {currentDay.getDate()}/{currentDay.getMonth() + 1}
                                        </div>
                                    </div>
                                    {hours.map(hour => {
                                        const eventsInSlot = events.filter(event => {
                                            const eventDate = event.date.toDate()
                                            return eventDate.getDay() === dayIndex && 
                                                   eventDate.getHours() === hour
                                        })

                                        return (
                                            <div
                                                key={hour}
                                                className="h-12 border border-gray-100 relative"
                                                onClick={() => router.push('/event-research')}
                                            >
                                                {eventsInSlot.map(event => (
                                                    <div
                                                        key={event.id}
                                                        className="absolute inset-0 bg-blue-50 border border-blue-200 rounded p-1 overflow-hidden cursor-pointer hover:bg-blue-100"
                                                    >
                                                        <div className="flex items-center gap-1">
                                                            {event.imageUrl && (
                                                                <div className="relative w-4 h-4 rounded-full overflow-hidden">
                                                                    <Image
                                                                        src={event.imageUrl}
                                                                        alt={event.title}
                                                                        fill
                                                                        className="object-cover"
                                                                    />
                                                                </div>
                                                            )}
                                                            <span className="text-xs font-medium truncate">
                                                                {event.title}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )
                                    })}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
} 