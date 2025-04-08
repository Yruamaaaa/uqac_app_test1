'use client'
import { useState, useEffect } from 'react'
import { db } from '@/firebase'
import { collection, query, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore'
import Image from 'next/image'
import { useAuth } from '@/context/AuthContext'

export default function UserPostsModal({ isOpen, onClose }) {
    const { currentUser } = useAuth()
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [deletingPostId, setDeletingPostId] = useState(null)

    useEffect(() => {
        if (isOpen && currentUser) {
            fetchUserPosts()
        }
    }, [isOpen, currentUser])

    const fetchUserPosts = async () => {
        try {
            setLoading(true)
            const q = query(
                collection(db, 'posts'),
                orderBy('createdAt', 'desc')
            )
            const querySnapshot = await getDocs(q)
            const postsData = querySnapshot.docs
                .map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }))
                .filter(post => post.authorId === currentUser.uid)
            setPosts(postsData)
        } catch (error) {
            console.error('Error fetching user posts:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDeletePost = async (postId) => {
        if (!confirm('Are you sure you want to delete this post?')) return
        
        try {
            setDeletingPostId(postId)
            await deleteDoc(doc(db, 'posts', postId))
            setPosts(posts.filter(post => post.id !== postId))
        } catch (error) {
            console.error('Error deleting post:', error)
        } finally {
            setDeletingPostId(null)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Mes Posts</h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <i className="fa-solid fa-xmark text-xl"></i>
                    </button>
                </div>

                {/* Content */}
                <div className="p-4">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                            Vous n'avez pas encore créé de posts
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {posts.map(post => (
                                <div key={post.id} className="bg-gray-50 rounded-xl shadow-sm overflow-hidden">
                                    {/* Author Info */}
                                    <div className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                                                {post.authorImage ? (
                                                    <Image
                                                        src={post.authorImage}
                                                        alt={post.authorName}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full grid place-items-center">
                                                        <i className="fa-solid fa-user text-gray-400"></i>
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-medium">{post.authorName}</h3>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(post.createdAt).toLocaleDateString('fr-FR', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeletePost(post.id)}
                                            disabled={deletingPostId === post.id}
                                            className="text-red-500 hover:text-red-700 disabled:opacity-50"
                                        >
                                            {deletingPostId === post.id ? (
                                                <i className="fa-solid fa-spinner fa-spin"></i>
                                            ) : (
                                                <i className="fa-solid fa-trash"></i>
                                            )}
                                        </button>
                                    </div>

                                    {/* Post Image */}
                                    {post.imageUrl && (
                                        <div className="relative w-full h-96">
                                            <Image
                                                src={post.imageUrl}
                                                alt="Post image"
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    )}

                                    {/* Post Content */}
                                    <div className="p-4">
                                        <p className="text-gray-800 whitespace-pre-wrap">{post.description}</p>
                                        
                                        {/* Interactions */}
                                        <div className="mt-4 flex items-center gap-6 text-gray-500">
                                            <div className="flex items-center gap-2">
                                                <i className="fa-regular fa-heart"></i>
                                                <span>{post.likes?.length || 0}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <i className="fa-regular fa-comment"></i>
                                                <span>{post.comments?.length || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
} 