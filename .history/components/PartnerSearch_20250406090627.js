'use client'
import { useState, useEffect } from 'react'
import { db } from '@/firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'
import Image from 'next/image'

export default function PartnerSearch() {
    const [partners, setPartners] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedSport, setSelectedSport] = useState('all')
    const [selectedTime, setSelectedTime] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        fetchPartners()
    }, [selectedSport, selectedTime, searchQuery])

    const fetchPartners = async () => {
        try {
            setLoading(true)
            let q = collection(db, 'findpartners')
            
            // Apply filters if selected
            if (selectedSport !== 'all') {
                q = query(q, where('activity', '==', selectedSport))
            }
            if (selectedTime !== 'all') {
                q = query(q, where('timePreference', '==', selectedTime))
            }

            const querySnapshot = await getDocs(q)
            let partnersData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))

            // Apply search filter if there's a search query
            if (searchQuery) {
                const searchLower = searchQuery.toLowerCase()
                partnersData = partnersData.filter(partner => {
                    const activity = partner.activity?.toLowerCase() || ''
                    const location = partner.location?.toLowerCase() || ''
                    
                    return activity.includes(searchLower) ||
                           location.includes(searchLower)
                })
            }

            setPartners(partnersData)
        } catch (error) {
            console.error('Error fetching partners:', error)
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

    const timePreferences = [
        { value: 'all', label: 'Tous les moments' },
        { value: 'morning', label: 'Matin (6h - 12h)' },
        { value: 'afternoon', label: 'Après-midi (12h - 18h)' },
        { value: 'evening', label: 'Soirée (18h - 22h)' }
    ]

    return (
        <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Rechercher un partenaire</h2>
            
            {/* Search Bar */}
            <div className="mb-6">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher un partenaire..."
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    {timePreferences.map(time => (
                        <option key={time.value} value={time.value}>
                            {time.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Partners List */}
            <div className="mt-8">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                    </div>
                ) : partners.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                        {searchQuery ? `Aucun partenaire trouvé pour "${searchQuery}"` : 'Aucun partenaire trouvé'}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {partners.map(partner => (
                            <div key={partner.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                                <div className="p-4">
                                    <h3 className="text-lg font-semibold mb-2">{partner.activity}</h3>
                                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-500">
                                        <div>
                                            <i className="fa-solid fa-location-dot mr-2"></i>
                                            {partner.location}
                                        </div>
                                        <div>
                                            <i className="fa-solid fa-clock mr-2"></i>
                                            {timePreferences.find(t => t.value === partner.timePreference)?.label || 'Moment non spécifié'}
                                        </div>
                                        <div>
                                            <i className="fa-solid fa-calendar mr-2"></i>
                                            {new Date(partner.date).toLocaleDateString('fr-FR')}
                                        </div>
                                        <div>
                                            <i className="fa-solid fa-user mr-2"></i>
                                            {partner.skillLevel}
                                        </div>
                                    </div>
                                    <div className="mt-4 flex justify-between items-center">
                                        <span className="px-3 py-1 bg-gray-100 rounded-full text-sm capitalize">
                                            {partner.activity}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            Par {partner.authorName}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
} 