'use client'
import { useState, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { db, storage } from '@/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function CreateEventForm() {
    const { currentUser, userDataObj } = useAuth()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [imagePreview, setImagePreview] = useState(null)
    const fileInputRef = useRef(null)

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0], // Default to today
        startHour: 8,
        duration: 1,
        maxParticipants: 10,
        location: '',
        sportType: 'other',
        imageUrl: null
    })

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
        setLoading(true)
        setError('')

        try {
            if (!currentUser) {
                throw new Error('You must be logged in to create an event')
            }

            let imageUrl = null
            if (formData.imageFile) {
                try {
                    // Upload image to Firebase Storage
                    const imageRef = ref(storage, `event-images/${currentUser.uid}/${Date.now()}`)
                    await uploadBytes(imageRef, formData.imageFile)
                    imageUrl = await getDownloadURL(imageRef)
                } catch (storageError) {
                    console.error('Error uploading image:', storageError)
                    // Continue without the image
                }
            }

            const eventData = {
                ...formData,
                authorId: currentUser.uid,
                authorName: userDataObj?.name || 'Anonymous',
                createdAt: serverTimestamp(),
                participants: [currentUser.uid],
                status: 'active',
                imageUrl
            }

            // Remove the imageFile from the data before saving to Firestore
            delete eventData.imageFile

            const docRef = await addDoc(collection(db, 'events'), eventData)
            console.log('Event created with ID:', docRef.id)
            
            // Redirect to the event-research page
            router.push('/event-research')
        } catch (err) {
            console.error('Error creating event:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-6">Créer un nouvel événement</h2>
            
            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
                    {error}
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

                <div className="grid grid-cols-2 gap-4">
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
                </div>

                <div className="grid grid-cols-2 gap-4">
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

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre maximum de participants
                        </label>
                        <input
                            type="number"
                            name="maxParticipants"
                            value={formData.maxParticipants}
                            onChange={handleChange}
                            min="2"
                            required
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

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
                        placeholder="Ex: Stade municipal"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type de sport
                    </label>
                    <select
                        name="sportType"
                        value={formData.sportType}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="football">Football</option>
                        <option value="basketball">Basketball</option>
                        <option value="tennis">Tennis</option>
                        <option value="badminton">Badminton</option>
                        <option value="running">Course à pied</option>
                        <option value="gym">Gym</option>
                        <option value="other">Autre</option>
                    </select>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Création en cours...' : 'Créer l\'événement'}
                </button>
            </form>
        </div>
    )
} 