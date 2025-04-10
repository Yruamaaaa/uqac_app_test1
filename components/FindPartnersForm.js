'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { db } from '@/firebase'
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore'
import { useRouter, useSearchParams } from 'next/navigation'
import { addXP, XP_REWARD_PARTNER } from '@/utils/gamification'
import { validateFormContent } from '@/utils/contentModeration'

export default function FindPartnersForm() {
    const { currentUser, userDataObj } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()
    const isEditing = searchParams.get('edit')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const [formData, setFormData] = useState({
        activity: '',
        skillLevel: 'intermediate',
        date: new Date().toISOString().split('T')[0],
        timePreference: 'any',
        location: '',
        acceptedTerms: false
    })

    useEffect(() => {
        if (isEditing && currentUser) {
            fetchPartnerRequest()
        }
    }, [isEditing, currentUser])

    const fetchPartnerRequest = async () => {
        try {
            setLoading(true)
            const requestDoc = await getDoc(doc(db, 'findpartners', isEditing))
            if (requestDoc.exists()) {
                const requestData = requestDoc.data()
                if (requestData.authorId !== currentUser.uid) {
                    router.push('/dashboard')
                    return
                }
                setFormData({
                    activity: requestData.activity,
                    skillLevel: requestData.skillLevel,
                    date: requestData.date,
                    timePreference: requestData.timePreference,
                    location: requestData.location,
                    acceptedTerms: true
                })
            }
        } catch (error) {
            console.error('Error fetching partner request:', error)
            setError('Failed to load partner request data')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

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

        // Validate content
        const contentValidation = validateFormContent({
            activity: formData.activity,
            location: formData.location
        })
        
        if (!contentValidation.isValid) {
            setError('Le contenu contient des mots inappropriés')
            return
        }

        setLoading(true)
        setError('')

        try {
            const partnerRequest = {
                ...formData,
                authorId: currentUser.uid,
                authorName: userDataObj?.name || 'Anonymous',
                updatedAt: serverTimestamp(),
                status: 'active'
            }

            if (isEditing) {
                // Update existing request
                await updateDoc(doc(db, 'findpartners', isEditing), partnerRequest)
                setSuccess('Demande de partenaire mise à jour avec succès!')
            } else {
                // Create new request
                partnerRequest.createdAt = serverTimestamp()
                partnerRequest.interestedUsers = []
                await addDoc(collection(db, 'findpartners'), partnerRequest)
                await addXP(currentUser.uid, XP_REWARD_PARTNER)
                setSuccess('Demande de partenaire créée avec succès!')
            }

            // Reset form
            setFormData({
                activity: '',
                skillLevel: 'intermediate',
                date: new Date().toISOString().split('T')[0],
                timePreference: 'any',
                location: '',
                acceptedTerms: false
            })

            // Redirect after a short delay
            setTimeout(() => {
                router.push('/event-research')
            }, 2000)
        } catch (err) {
            console.error('Error saving partner request:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

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
        <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-6">
                {isEditing ? 'Modifier la recherche de partenaire' : 'Trouver un partenaire'}
            </h2>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4">
                    {success}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Activity */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Activité
                    </label>
                    <input
                        type="text"
                        name="activity"
                        value={formData.activity}
                        onChange={handleChange}
                        placeholder="ex: Football, Tennis, Course à pied"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>

                {/* Skill Level */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Niveau
                    </label>
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

                {/* Date */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date
                    </label>
                    <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* Time Preference */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Moment préféré
                    </label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lieu
                    </label>
                    <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="Entrez votre lieu préféré"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        name="acceptedTerms"
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
    )
} 