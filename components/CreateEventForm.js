'use client'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { db, storage } from '@/firebase'
import { collection, addDoc, serverTimestamp, doc, setDoc, getDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { addXP, XP_REWARD_EVENT } from '@/utils/gamification'
import { validateFormContent } from '@/utils/contentModeration'
import { sendEventNotifications } from '@/utils/notifications'

const ACTIVITIES = [
    // Sports
    { value: 'football', label: 'Football' },
    { value: 'basketball', label: 'Basketball' },
    { value: 'tennis', label: 'Tennis' },
    { value: 'volleyball', label: 'Volleyball' },
    { value: 'badminton', label: 'Badminton' },
    { value: 'table-tennis', label: 'Table Tennis' },
    { value: 'running', label: 'Running' },
    { value: 'swimming', label: 'Swimming' },
    { value: 'cycling', label: 'Cycling' },
    { value: 'hiking', label: 'Hiking' },
    { value: 'rock-climbing', label: 'Rock Climbing' },
    { value: 'yoga', label: 'Yoga' },
    { value: 'gym', label: 'Gym' },
    { value: 'martial-arts', label: 'Martial Arts' },
    { value: 'golf', label: 'Golf' },
    { value: 'skateboarding', label: 'Skateboarding' },
    { value: 'surfing', label: 'Surfing' },
    { value: 'skiing', label: 'Skiing' },
    { value: 'snowboarding', label: 'Snowboarding' },
    // Social Activities
    { value: 'eating-out', label: 'Eating Out' },
    { value: 'coffee', label: 'Coffee' },
    { value: 'movie', label: 'Movie' },
    { value: 'concert', label: 'Concert' },
    { value: 'party', label: 'Party' },
    { value: 'board-games', label: 'Board Games' },
    { value: 'video-games', label: 'Video Games' },
    { value: 'karaoke', label: 'Karaoke' },
    { value: 'dancing', label: 'Dancing' },
    { value: 'art-exhibition', label: 'Art Exhibition' },
    { value: 'museum', label: 'Museum' },
    { value: 'shopping', label: 'Shopping' },
    // Outdoor Activities
    { value: 'picnic', label: 'Picnic' },
    { value: 'camping', label: 'Camping' },
    { value: 'fishing', label: 'Fishing' },
    { value: 'kayaking', label: 'Kayaking' },
    { value: 'paddleboarding', label: 'Paddleboarding' },
    { value: 'photography', label: 'Photography' },
    { value: 'bird-watching', label: 'Bird Watching' },
    { value: 'gardening', label: 'Gardening' },
    // Learning & Development
    { value: 'language-exchange', label: 'Language Exchange' },
    { value: 'book-club', label: 'Book Club' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'study-group', label: 'Study Group' },
    { value: 'cooking-class', label: 'Cooking Class' },
    { value: 'art-class', label: 'Art Class' },
    { value: 'music-lesson', label: 'Music Lesson' },
    // Wellness & Health
    { value: 'meditation', label: 'Meditation' },
    { value: 'massage', label: 'Massage' },
    { value: 'spa', label: 'Spa' },
    { value: 'wellness-retreat', label: 'Wellness Retreat' },
    { value: 'nutrition-workshop', label: 'Nutrition Workshop' }
]

export default function CreateEventForm() {
    const { currentUser, userDataObj } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()
    const isEditing = searchParams.get('edit')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [imagePreview, setImagePreview] = useState(null)
    const fileInputRef = useRef(null)
    const [success, setSuccess] = useState('')

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        startHour: 8,
        duration: 1,
        maxParticipants: 10,
        location: '',
        activityType: 'football',
        imageUrl: null,
        acceptedTerms: false
    })

    useEffect(() => {
        if (isEditing && currentUser) {
            fetchEventData()
        }
    }, [isEditing, currentUser])

    const fetchEventData = async () => {
        try {
            setLoading(true)
            const eventDoc = await getDoc(doc(db, 'events', isEditing))
            if (eventDoc.exists()) {
                const eventData = eventDoc.data()
                if (eventData.authorId !== currentUser.uid) {
                    router.push('/dashboard')
                    return
                }
                setFormData({
                    title: eventData.title,
                    description: eventData.description,
                    date: eventData.date,
                    startHour: eventData.startHour,
                    duration: eventData.duration,
                    maxParticipants: eventData.maxParticipants,
                    location: eventData.location,
                    activityType: eventData.activityType,
                    imageUrl: eventData.imageUrl,
                    acceptedTerms: true
                })
                if (eventData.imageUrl) {
                    setImagePreview(eventData.imageUrl)
                }
            }
        } catch (error) {
            console.error('Error fetching event:', error)
            setError('Failed to load event data')
        } finally {
            setLoading(false)
        }
    }

    const handleImageChange = async (e) => {
        const file = e.target.files[0]
        if (file) {
            try {
                // Optimize the image before preview
                const optimizedFile = await optimizeImage(file)
                setImagePreview(URL.createObjectURL(optimizedFile))
                setFormData(prev => ({ ...prev, imageFile: optimizedFile }))
            } catch (error) {
                console.error('Error processing image:', error)
                setError('Erreur lors du traitement de l\'image')
            }
        }
    }

    const optimizeImage = async (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = (event) => {
                const img = new window.Image()
                img.src = event.target.result
                img.onload = () => {
                    const canvas = document.createElement('canvas')
                    const ctx = canvas.getContext('2d')

                    // Calculate new dimensions (max 800px width/height)
                    let width = img.width
                    let height = img.height
                    const maxSize = 800
                    
                    if (width > height && width > maxSize) {
                        height = Math.round((height * maxSize) / width)
                        width = maxSize
                    } else if (height > maxSize) {
                        width = Math.round((width * maxSize) / height)
                        height = maxSize
                    }

                    canvas.width = width
                    canvas.height = height

                    // Draw and compress image
                    ctx.drawImage(img, 0, 0, width, height)
                    
                    // Convert to blob with compression
                    canvas.toBlob(
                        (blob) => {
                            if (blob) {
                                const optimizedFile = new File([blob], file.name, {
                                    type: 'image/jpeg',
                                    lastModified: Date.now()
                                })
                                resolve(optimizedFile)
                            } else {
                                reject(new Error('Failed to optimize image'))
                            }
                        },
                        'image/jpeg',
                        0.7 // Compression quality (0.7 = 70% quality)
                    )
                }
                img.onerror = reject
            }
            reader.onerror = reject
        })
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: name === 'day' || name === 'startHour' || name === 'duration' || name === 'maxParticipants' 
                ? parseInt(value) 
                : value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!currentUser) return

        try {
            setLoading(true)
            setError('')

            // Validate content
            const contentValidation = validateFormContent({
                title: formData.title,
                description: formData.description,
                location: formData.location
            })
            
            if (!contentValidation.isValid) {
                setError('Le contenu contient des mots inappropriés')
                setLoading(false)
                return
            }

            // Upload image if selected
            let imageUrl = formData.imageUrl
            if (formData.imageFile) {
                const imageRef = ref(storage, `event-images/${currentUser.uid}/${Date.now()}`)
                await uploadBytes(imageRef, formData.imageFile)
                imageUrl = await getDownloadURL(imageRef)
            }

            // Create or update event document
            const eventData = {
                title: formData.title,
                description: formData.description,
                activityType: formData.activityType,
                location: formData.location,
                date: formData.date,
                startHour: formData.startHour,
                duration: formData.duration,
                maxParticipants: formData.maxParticipants,
                authorId: currentUser.uid,
                authorName: userDataObj?.name || 'Anonymous',
                imageUrl,
                updatedAt: new Date().toISOString()
            }

            if (isEditing) {
                // Update existing event
                await setDoc(doc(db, 'events', isEditing), eventData)
                setSuccess('Event updated successfully!')
            } else {
                // Create new event
                eventData.participants = [currentUser.uid] // Add creator as participant
                eventData.createdAt = new Date().toISOString()
                const eventRef = await addDoc(collection(db, 'events'), eventData)
                eventData.id = eventRef.id // Add the ID to the event data
                
                // Send notifications for new events
                await sendEventNotifications(eventData)
                
                await addXP(currentUser.uid, XP_REWARD_EVENT)
                setSuccess('Event created successfully!')
            }

            // Reset form
            setFormData({
                title: '',
                description: '',
                date: new Date().toISOString().split('T')[0],
                startHour: 8,
                duration: 1,
                maxParticipants: 10,
                location: '',
                activityType: 'football',
                imageUrl: null,
                acceptedTerms: false
            })
            setImagePreview(null)

            setTimeout(() => {
                setSuccess('')
                router.push('/dashboard')
            }, 2000)

        } catch (error) {
            console.error('Error saving event:', error)
            setError('Failed to save event. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-6">
                {isEditing ? 'Modifier l\'événement' : 'Créer un nouvel événement'}
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
                {/* Image Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Image de l'événement
                    </label>
                    <div 
                        className="relative h-48 w-full rounded-lg overflow-hidden bg-gray-100 cursor-pointer border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {imagePreview ? (
                            <Image
                                src={imagePreview}
                                alt="Event preview"
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <i className="fa-solid fa-cloud-arrow-up text-3xl text-gray-400 mb-2"></i>
                                    <p className="text-sm text-gray-500">Cliquez pour ajouter une image</p>
                                </div>
                            </div>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                        />
                    </div>
                </div>

                {/* Title */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Titre de l'événement
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ex: Match de football"
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows="3"
                        placeholder="Décrivez votre événement..."
                    />
                </div>

                {/* Activity Type */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type d'activité
                    </label>
                    <select
                        name="activityType"
                        value={formData.activityType}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        {ACTIVITIES.map(activity => (
                            <option key={activity.value} value={activity.value}>
                                {activity.label}
                            </option>
                        ))}
                    </select>
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

                {/* Time and Duration */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Heure de début
                        </label>
                        <select
                            name="startHour"
                            value={formData.startHour}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            {Array.from({ length: 15 }, (_, i) => i + 8).map(hour => (
                                <option key={hour} value={hour}>{hour}:00</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Durée (heures)
                        </label>
                        <select
                            name="duration"
                            value={formData.duration}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            {Array.from({ length: 6 }, (_, i) => i + 1).map(duration => (
                                <option key={duration} value={duration}>{duration} heure{duration > 1 ? 's' : ''}</option>
                            ))}
                        </select>
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
                        required
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ex: Parc municipal, Salle de sport..."
                    />
                </div>

                {/* Max Participants */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre maximum de participants
                    </label>
                    <input
                        type="number"
                        name="maxParticipants"
                        value={formData.maxParticipants}
                        onChange={handleChange}
                        min="1"
                        required
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 rounded-lg font-medium transition-colors ${
                        loading
                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                            : 'bg-black text-white hover:bg-gray-800'
                    }`}
                >
                    {loading ? 'Enregistrement en cours...' : (isEditing ? 'Mettre à jour' : 'Créer l\'événement')}
                </button>
            </form>
        </div>
    )
} 