'use client'
import { useState, useEffect } from 'react'
import { db } from '@/firebase'
import { collection, query, orderBy, getDocs } from 'firebase/firestore'
import Image from 'next/image'

export default function PostsList() {
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchPosts()
    }, [])

    const fetchPosts = async () => {
        try {
            setLoading(true)
            const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'))
            const querySnapshot = await getDocs(q)
            const postsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            setPosts(postsData)
        } catch (error) {
            console.error('Error fetching posts:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        )
    }

    if (posts.length === 0) {
        return (
            <div className="text-center text-gray-500 py-8">
                Aucun post pour le moment
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {posts.map(post => (
                <div key={post.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                    {/* Author Info */}
                    <div className="p-4 flex items-center gap-3">
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
                            <button className="flex items-center gap-2 hover:text-gray-700">
                                <i className="fa-regular fa-heart"></i>
                                <span>{post.likes?.length || 0}</span>
                            </button>
                            <button className="flex items-center gap-2 hover:text-gray-700">
                                <i className="fa-regular fa-comment"></i>
                                <span>{post.comments?.length || 0}</span>
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
} 