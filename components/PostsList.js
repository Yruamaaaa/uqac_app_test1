'use client'
import { useState, useEffect } from 'react'
import { db } from '@/firebase'
import { collection, query, orderBy, getDocs, doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore'
import Image from 'next/image'
import { useAuth } from '@/context/AuthContext'
import CommentsModal from './CommentsModal'
import ProfilePreviewModal from './ProfilePreviewModal'
import { toast } from 'react-hot-toast'

export default function PostsList() {
    const { currentUser, userDataObj } = useAuth()
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedPost, setSelectedPost] = useState(null)
    const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false)
    const [selectedUserId, setSelectedUserId] = useState(null)
    const [isProfilePreviewOpen, setIsProfilePreviewOpen] = useState(false)
    const [selectedPostId, setSelectedPostId] = useState(null)
    const [showFriendsOnly, setShowFriendsOnly] = useState(false)
    const [userFriends, setUserFriends] = useState([])

    useEffect(() => {
        if (currentUser) {
            fetchUserFriends()
            fetchPosts()
        }
    }, [currentUser, showFriendsOnly])

    const fetchUserFriends = async () => {
        try {
            const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
            if (userDoc.exists()) {
                const userData = userDoc.data()
                setUserFriends(userData.friends || [])
            }
        } catch (error) {
            console.error('Error fetching user friends:', error)
        }
    }

    const fetchPosts = async () => {
        try {
            setLoading(true)
            const postsQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'))
            const querySnapshot = await getDocs(postsQuery)
            
            const postsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))

            // Filter posts based on showFriendsOnly state
            const filteredPosts = showFriendsOnly
                ? postsData.filter(post => 
                    post.authorId === currentUser.uid || 
                    userFriends.includes(post.authorId)
                )
                : postsData

            setPosts(filteredPosts)
        } catch (error) {
            console.error('Error fetching posts:', error)
            toast.error('Erreur lors de la récupération des publications')
        } finally {
            setLoading(false)
        }
    }

    const handleLike = async (post) => {
        if (!currentUser) return

        try {
            const postRef = doc(db, 'posts', post.id)
            const isLiked = post.likes?.includes(currentUser.uid)

            if (isLiked) {
                await updateDoc(postRef, {
                    likes: arrayRemove(currentUser.uid)
                })
                setPosts(posts.map(p => 
                    p.id === post.id 
                        ? { ...p, likes: p.likes?.filter(id => id !== currentUser.uid) || [] }
                        : p
                ))
            } else {
                await updateDoc(postRef, {
                    likes: arrayUnion(currentUser.uid)
                })
                setPosts(posts.map(p => 
                    p.id === post.id 
                        ? { ...p, likes: [...(p.likes || []), currentUser.uid] }
                        : p
                ))
            }
        } catch (error) {
            console.error('Error toggling like:', error)
        }
    }

    const handleOpenComments = (post) => {
        setSelectedPost(post)
        setIsCommentsModalOpen(true)
    }

    const handleOpenProfilePreview = (userId) => {
        setSelectedUserId(userId)
        setIsProfilePreviewOpen(true)
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
                {showFriendsOnly ? 'Aucune publication de vos amis' : 'Aucun post pour le moment'}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Friends Filter Toggle */}
            <div className="flex items-center justify-end mb-4">
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={showFriendsOnly}
                        onChange={() => setShowFriendsOnly(!showFriendsOnly)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                    <span className="ml-3 text-sm font-medium text-gray-900">Amis uniquement</span>
                </label>
            </div>

            {posts.map(post => (
                <div key={post.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                    {/* Author Info */}
                    <div className="p-4 flex items-center gap-3">
                        <button 
                            onClick={() => handleOpenProfilePreview(post.authorId)}
                            className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100"
                        >
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
                        </button>
                        <div>
                            <button 
                                onClick={() => handleOpenProfilePreview(post.authorId)}
                                className="font-medium hover:text-gray-700"
                            >
                                {post.authorName}
                            </button>
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
                            <button 
                                onClick={() => handleLike(post)}
                                className={`flex items-center gap-2 ${post.likes?.includes(currentUser?.uid) ? 'text-red-500' : 'hover:text-gray-700'}`}
                            >
                                <i className={`fa-${post.likes?.includes(currentUser?.uid) ? 'solid' : 'regular'} fa-heart`}></i>
                                <span>{post.likes?.length || 0}</span>
                            </button>
                            <button 
                                onClick={() => handleOpenComments(post)}
                                className="flex items-center gap-2 hover:text-gray-900"
                            >
                                <i className="fa-regular fa-comment"></i>
                                <span>{post.comments?.length || 0}</span>
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            {/* Comments Modal */}
            {selectedPost && (
                <CommentsModal
                    isOpen={isCommentsModalOpen}
                    onClose={() => {
                        setIsCommentsModalOpen(false)
                        setSelectedPost(null)
                    }}
                    post={selectedPost}
                />
            )}

            {/* Profile Preview Modal */}
            {selectedUserId && (
                <ProfilePreviewModal
                    isOpen={isProfilePreviewOpen}
                    onClose={() => {
                        setIsProfilePreviewOpen(false)
                        setSelectedUserId(null)
                    }}
                    userId={selectedUserId}
                />
            )}
        </div>
    )
} 