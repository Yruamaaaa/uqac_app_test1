'use client'
import { useState, useEffect } from 'react'
import { db } from '@/firebase'
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore'
import { useAuth } from '@/context/AuthContext'
import Image from 'next/image'

export default function CommentsModal({ isOpen, onClose, post }) {
    const { currentUser, userDataObj } = useAuth()
    const [comments, setComments] = useState([])
    const [newComment, setNewComment] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLiked, setIsLiked] = useState(false)

    useEffect(() => {
        if (isOpen && post) {
            setComments(post.comments || [])
            setIsLiked(post.likes?.includes(currentUser?.uid) || false)
        }
    }, [isOpen, post, currentUser])

    const handleAddComment = async () => {
        if (!newComment.trim() || !currentUser) return

        try {
            setIsSubmitting(true)
            const comment = {
                id: Date.now().toString(),
                userId: currentUser.uid,
                userName: userDataObj?.name || 'Anonymous',
                userImage: userDataObj?.profileImage || null,
                text: newComment.trim(),
                createdAt: new Date().toISOString()
            }

            const postRef = doc(db, 'posts', post.id)
            await updateDoc(postRef, {
                comments: arrayUnion(comment)
            })

            setComments(prev => [...prev, comment])
            setNewComment('')
        } catch (error) {
            console.error('Error adding comment:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleLike = async () => {
        if (!currentUser) return

        try {
            const postRef = doc(db, 'posts', post.id)
            if (isLiked) {
                await updateDoc(postRef, {
                    likes: arrayRemove(currentUser.uid)
                })
                setIsLiked(false)
            } else {
                await updateDoc(postRef, {
                    likes: arrayUnion(currentUser.uid)
                })
                setIsLiked(true)
            }
        } catch (error) {
            console.error('Error toggling like:', error)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Commentaires</h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <i className="fa-solid fa-xmark text-xl"></i>
                    </button>
                </div>

                {/* Post Content */}
                <div className="p-4 border-b">
                    <p className="text-gray-800 whitespace-pre-wrap">{post.description}</p>
                    <div className="mt-4 flex items-center gap-6 text-gray-500">
                        <button 
                            onClick={handleLike}
                            className={`flex items-center gap-2 ${isLiked ? 'text-red-500' : 'hover:text-gray-700'}`}
                        >
                            <i className={`fa-${isLiked ? 'solid' : 'regular'} fa-heart`}></i>
                            <span>{post.likes?.length || 0}</span>
                        </button>
                        <div className="flex items-center gap-2">
                            <i className="fa-regular fa-comment"></i>
                            <span>{comments.length}</span>
                        </div>
                    </div>
                </div>

                {/* Comments Section */}
                <div className="p-4">
                    {/* Add Comment */}
                    <div className="flex gap-2 mb-4">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                            {userDataObj?.profileImage ? (
                                <Image
                                    src={userDataObj.profileImage}
                                    alt={userDataObj.name}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full grid place-items-center">
                                    <i className="fa-solid fa-user text-gray-400"></i>
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Ajouter un commentaire..."
                                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                                rows={2}
                            />
                            <button
                                onClick={handleAddComment}
                                disabled={!newComment.trim() || isSubmitting}
                                className="mt-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <i className="fa-solid fa-spinner fa-spin"></i>
                                ) : (
                                    'Commenter'
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-4">
                        {comments.map(comment => (
                            <div key={comment.id} className="flex gap-3">
                                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                                    {comment.userImage ? (
                                        <Image
                                            src={comment.userImage}
                                            alt={comment.userName}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full grid place-items-center">
                                            <i className="fa-solid fa-user text-gray-400"></i>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <div className="flex justify-between items-start">
                                            <span className="font-medium">{comment.userName}</span>
                                            <span className="text-xs text-gray-500">
                                                {new Date(comment.createdAt).toLocaleDateString('fr-FR', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-gray-800">{comment.text}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
} 