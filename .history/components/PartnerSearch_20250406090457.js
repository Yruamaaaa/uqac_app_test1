'use client'
import { useState, useEffect } from 'react'
import { db } from '@/firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { useAuth } from '@/context/AuthContext'

export default function PartnerSearch() {
    const [partners, setPartners] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedSport, setSelectedSport] = useState('all')
    const [selectedTime, setSelectedTime] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    const { currentUser } = useAuth()

    useEffect(() => {
        if (currentUser) {
            fetchPartners()
        }
    }, [selectedSport, selectedTime, searchQuery, currentUser])

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
                    const skillLevel = partner.skillLevel?.toLowerCase() || ''
                    
                    return activity.includes(searchLower) ||
                           location.includes(searchLower) ||
                           skillLevel.includes(searchLower)
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
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Rechercher un partenaire</h2>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="space-y-4">
                    {/* Search Bar */}
                    <input
                        type="text"
                        placeholder="Rechercher un partenaire..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />

                    {/* Filters */}
                    <div className="grid grid-cols-2 gap-4">
                        <select
                            value={selectedSport}
                            onChange={(e) => setSelectedSport(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            {timePreferences.map(time => (
                                <option key={time.value} value={time.value}>
                                    {time.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Partners List */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
                {loading ? (
                    <div className="text-center py-4">Chargement...</div>
                ) : partners.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                        Aucun partenaire trouvé
                    </div>
                ) : (
                    <div className="space-y-4">
                        {partners.map(partner => (
                            <div
                                key={partner.id}
                                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-medium">{partner.activity}</h3>
                                        <p className="text-sm text-gray-500">
                                            Niveau: {partner.skillLevel}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Lieu: {partner.location}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Moment: {timePreferences.find(t => t.value === partner.timePreference)?.label}
                                        </p>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        Par {partner.authorName}
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