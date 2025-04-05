'use client'
import React from 'react'
import Image from 'next/image'

// Demo data
const demoEvents = [
    {
        id: 1,
        title: 'Course à pieds',
        author: 'Tristan',
        date: 'Le 24 Mars',
        image: '/running.webp'
    },
    {
        id: 2,
        title: 'Badminton',
        author: 'Tom',
        date: 'Le 24 Mars',
        image: '/badminton.webp'
    },
    {
        id: 3,
        title: 'Recherche gymbro',
        author: 'Amaury',
        date: 'Le 24 Mars',
        image: '/gym.webp'
    }
]

export default function EventList() {
    return (
        <div className="mt-6">
            <h2 className="font-medium mb-4">Recherche d'évènement</h2>
            <div className="space-y-3">
                {demoEvents.map(event => (
                    <button 
                        key={event.id}
                        className="w-full bg-white rounded-xl p-3 flex items-center gap-4 shadow-sm hover:bg-gray-50 transition-colors"
                    >
                        <div className="w-12 h-12 rounded-full overflow-hidden relative">
                            <Image
                                src={event.image}
                                alt={event.title}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="flex-1 text-left">
                            <h3 className="font-medium">{event.title}</h3>
                            <p className="text-sm text-gray-500">
                                Proposé par {event.author}
                            </p>
                            <p className="text-sm text-gray-500">{event.date}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    )
} 