'use client'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { db, storage } from '@/firebase'
import { collection, addDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import Image from 'next/image'
import { addXP, XP_REWARD_EVENT } from '@/utils/gamification'

export default function CreatePostModal({ isOpen, onClose }) {
    const { currentUser, userDataObj } = useAuth()
    const [description, setDescription] = useState('')
    const [image, setImage] = useState(null)
    const [previewUrl, setPreviewUrl] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const handleImageChange = async (e) => {
        const file = e.target.files[0]
        if (file) {
            try {
                // Create preview
                setPreviewUrl(URL.createObjectURL(file))
                setImage(file)
            } catch (error) {
                console.error('Error processing image:', error)
                setError('Failed to process image. Please try again.')
            }
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!currentUser) return

        try {
            setIsSubmitting(true)
            setError('')

            // Upload image if selected
            let imageUrl = null
            if (image) {
                const imageRef = ref(storage, `post-images/${currentUser.uid}/${Date.now()}`)
                await uploadBytes(imageRef, image)
                imageUrl = await getDownloadURL(imageRef)
            }

            // Create post document
            const postData = {
                description,
                imageUrl,
                authorId: currentUser.uid,
                authorName: userDataObj?.name || 'Anonymous',
                authorImage: userDataObj?.profileImage || null,
                likes: [],
                comments: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }

            await addDoc(collection(db, 'posts'), postData)

            // Award XP
            await addXP(currentUser.uid, XP_REWARD_EVENT)

            // Show success message
            setSuccess('Post créé avec succès!')
            
            // Reset form
            setDescription('')
            setImage(null)
            setPreviewUrl(null)

            // Close modal after a delay
            setTimeout(() => {
                setSuccess('')
                onClose()
            }, 2000)

        } catch (error) {
            console.error('Error creating post:', error)
            setError('Failed to create post. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-lg w-full p-6 relative">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                    <i className="fa-solid fa-times text-xl"></i>
                </button>

                <h2 className="text-xl font-semibold mb-4">Créer un post</h2>

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
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            rows={4}
                            placeholder="Partagez votre activité..."
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Image
                        </label>
                        <div className="space-y-2">
                            {previewUrl && (
                                <div className="relative w-full h-48 rounded-lg overflow-hidden">
                                    <Image
                                        src={previewUrl}
                                        alt="Preview"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-black file:text-white hover:file:bg-gray-800"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400"
                    >
                        {isSubmitting ? 'Publication...' : 'Publier'}
                    </button>
                </form>
            </div>
        </div>
    )
} 