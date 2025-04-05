'use client'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { db } from '@/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { useRouter } from 'next/navigation'

export default function FindPartnersForm() {
    const { currentUser, userDataObj } = useAuth()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [formData, setFormData] = useState({
        activity: '',
        skillLevel: 'intermediate',
        availability: {
            monday: false,
            tuesday: false,
            wednesday: false,
            thursday: false,
            friday: false,
            saturday: false,
            sunday: false
        },
        timePreference: 'any',
        location: '',
        acceptedTerms: false
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.acceptedTerms) {
            setError('Veuillez accepter les conditions d\'utilisation')
            return
        }

        if (!currentUser) {
            setError('Vous devez être connecté pour créer une recherche de partenaire')
            return
        }

        setLoading(true)
        setError('')

        try {
            const partnerRequest = {
                ...formData,
                authorId: currentUser.uid,
                authorName: userDataObj?.name || 'Anonymous',
                createdAt: serverTimestamp(),
                status: 'active',
                interestedUsers: []
            }

            const docRef = await addDoc(collection(db, 'findpartners'), partnerRequest)
            console.log('Partner request created with ID:', docRef.id)
            
            // Redirect to the event-research page
            router.push('/event-research')
        } catch (err) {
            console.error('Error creating partner request:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const days = [
        { key: 'monday', label: 'Lun' },
        { key: 'tuesday', label: 'Mar' },
        { key: 'wednesday', label: 'Mer' },
        { key: 'thursday', label: 'Jeu' },
        { key: 'friday', label: 'Ven' },
        { key: 'saturday', label: 'Sam' },
        { key: 'sunday', label: 'Dim' }
    ]

    const timePreferences = [
        { value: 'any', label: 'N\'importe quand' },
        { value: 'morning', label: 'Matin (6h - 12h)' },
        { value: 'afternoon', label: 'Après-midi (12h - 18h)' },
        { value: 'evening', label: 'Soirée (18h - 22h)' }
    ]

    const skillLevels = [
        { value: 'beginner', label: 'Débutant' },
        { value: 'intermediate', label: 'Intermédiaire' },
        { value: 'advanced', label: 'Avancé' }
    ]

    return (
        <div className="max-w-md mx-auto">
            {/* Form Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold mb-6">Trouver un partenaire</h2>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Activity */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Activité</label>
                        <input
                            type="text"
                            value={formData.activity}
                            onChange={(e) => setFormData({...formData, activity: e.target.value})}
                            placeholder="ex: Football, Tennis, Course à pied"
                            className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>

                    {/* Skill Level */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Niveau</label>
                        <div className="flex gap-4">
                            {skillLevels.map((level) => (
                                <button
                                    key={level.value}
                                    type="button"
                                    onClick={() => setFormData({...formData, skillLevel: level.value})}
                                    className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                                        formData.skillLevel === level.value
                                            ? 'bg-black text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {level.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Availability */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Disponibilités</label>
                        <div className="flex gap-2">
                            {days.map((day) => (
                                <button
                                    key={day.key}
                                    type="button"
                                    onClick={() => setFormData({
                                        ...formData,
                                        availability: {
                                            ...formData.availability,
                                            [day.key]: !formData.availability[day.key]
                                        }
                                    })}
                                    className={`w-10 h-10 rounded-full font-medium transition-colors ${
                                        formData.availability[day.key]
                                            ? 'bg-black text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {day.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Time Preference */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Moment préféré</label>
                        <div className="grid grid-cols-2 gap-2">
                            {timePreferences.map((time) => (
                                <button
                                    key={time.value}
                                    type="button"
                                    onClick={() => setFormData({...formData, timePreference: time.value})}
                                    className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                                        formData.timePreference === time.value
                                            ? 'bg-black text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {time.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Location */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Lieu</label>
                        <input
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({...formData, location: e.target.value})}
                            placeholder="Entrez votre lieu préféré"
                            className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>

                    {/* Terms and Conditions */}
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={formData.acceptedTerms}
                            onChange={(e) => setFormData({...formData, acceptedTerms: e.target.checked})}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label className="text-sm text-gray-600">
                            En cliquant sur ce bouton, vous acceptez nos conditions d'utilisation
                        </label>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading || !formData.acceptedTerms}
                        className={`w-full py-3 rounded-lg font-medium transition-colors ${
                            formData.acceptedTerms 
                            ? 'bg-black text-white hover:bg-gray-800' 
                            : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        }`}
                    >
                        {loading ? 'Création en cours...' : 'Trouver des partenaires'}
                    </button>
                </form>
            </div>
        </div>
    )
} 