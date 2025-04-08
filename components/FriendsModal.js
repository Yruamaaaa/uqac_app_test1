'use client'
import { useState, useEffect } from 'react'
import { db } from '@/firebase'
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore'
import Image from 'next/image'
import { useAuth } from '@/context/AuthContext'
import ProfilePreviewModal from './ProfilePreviewModal'
import { toast } from 'react-hot-toast'

export default function FriendsModal({ isOpen, onClose }) {
    const { currentUser, userDataObj } = useAuth()
    const [friends, setFriends] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedUserId, setSelectedUserId] = useState(null)
    const [isProfilePreviewOpen, setIsProfilePreviewOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (isOpen && currentUser) {
            fetchFriends()
        }
    }, [isOpen, currentUser])

    const fetchFriends = async () => {
        try {
            setLoading(true)
            const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
            if (userDoc.exists()) {
                const userData = userDoc.data()
                const friendsData = userData.friends || []
                
                // Fetch friend details
                const friendsPromises = friendsData.map(async (friendId) => {
                    const friendDoc = await getDoc(doc(db, 'users', friendId))
                    if (friendDoc.exists()) {
                        return {
                            id: friendId,
                            ...friendDoc.data()
                        }
                    }
                    return null
                })

                const friendsDetails = (await Promise.all(friendsPromises)).filter(Boolean)
                setFriends(friendsDetails)
            }
        } catch (error) {
            console.error('Error fetching friends:', error)
            toast.error('Erreur lors de la récupération de la liste d\'amis')
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            setSearchResults([])
            return
        }

        try {
            setLoading(true)
            const q = query(
                collection(db, 'users'),
                where('name', '>=', searchQuery),
                where('name', '<=', searchQuery + '\uf8ff')
            )
            const querySnapshot = await getDocs(q)
            const results = querySnapshot.docs
                .map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }))
                .filter(user => 
                    user.id !== currentUser.uid && 
                    !friends.some(friend => friend.id === user.id)
                )
            setSearchResults(results)
        } catch (error) {
            console.error('Error searching users:', error)
            toast.error('Erreur lors de la recherche d\'utilisateurs')
        } finally {
            setLoading(false)
        }
    }

    const handleAddFriend = async (friendId) => {
        try {
            setIsLoading(true)
            const currentUserRef = doc(db, 'users', currentUser.uid)

            // Add friend to current user's friends list
            await updateDoc(currentUserRef, {
                friends: arrayUnion(friendId)
            })

            toast.success('Ami ajouté avec succès')
            onClose()
        } catch (error) {
            console.error('Error adding friend:', error)
            toast.error('Erreur lors de l\'ajout de l\'ami')
        } finally {
            setIsLoading(false)
        }
    }

    const handleRemoveFriend = async (friendId) => {
        try {
            setIsLoading(true)
            const currentUserRef = doc(db, 'users', currentUser.uid)

            // Remove friend from current user's friends list
            await updateDoc(currentUserRef, {
                friends: arrayRemove(friendId)
            })

            // Refresh friends list
            await fetchFriends()
            setSearchQuery('') // Clear search to show updated results
            toast.success('Ami supprimé avec succès')
        } catch (error) {
            console.error('Error removing friend:', error)
            toast.error('Erreur lors de la suppression de l\'ami')
        } finally {
            setIsLoading(false)
        }
    }

    const handleOpenProfilePreview = (userId) => {
        setSelectedUserId(userId)
        setIsProfilePreviewOpen(true)
    }

    const handleClose = () => {
        setSearchQuery('') // Clear the search query
        setSearchResults([]) // Clear the search results
        onClose() // Call the original onClose function
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Amis</h2>
                    <button 
                        onClick={handleClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <i className="fa-solid fa-xmark text-xl"></i>
                    </button>
                </div>

                {/* Search Section */}
                <div className="p-4 border-b">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Rechercher des amis..."
                            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                        />
                        <button
                            onClick={handleSearch}
                            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                        >
                            Rechercher
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4">
                    {/* Search Results */}
                    {searchResults.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-lg font-medium mb-3">Résultats de recherche</h3>
                            <div className="space-y-3">
                                {searchResults.map(user => (
                                    <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <button 
                                                onClick={() => handleOpenProfilePreview(user.id)}
                                                className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100"
                                            >
                                                {user.profileImage ? (
                                                    <Image
                                                        src={user.profileImage}
                                                        alt={user.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full grid place-items-center">
                                                        <i className="fa-solid fa-user text-gray-400"></i>
                                                    </div>
                                                )}
                                            </button>
                                            <button 
                                                onClick={() => handleOpenProfilePreview(user.id)}
                                                className="font-medium hover:text-gray-700"
                                            >
                                                {user.name}
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => handleAddFriend(user.id)}
                                            className="px-3 py-1 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm"
                                        >
                                            Ajouter
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Friends List */}
                    <div>
                        <h3 className="text-lg font-medium mb-3">Mes amis</h3>
                        {loading ? (
                            <div className="flex justify-center items-center h-32">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                            </div>
                        ) : friends.length === 0 ? (
                            <div className="text-center text-gray-500 py-8">
                                Vous n'avez pas encore d'amis
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {friends.map(friend => (
                                    <div key={friend.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <button 
                                                onClick={() => handleOpenProfilePreview(friend.id)}
                                                className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100"
                                            >
                                                {friend.profileImage ? (
                                                    <Image
                                                        src={friend.profileImage}
                                                        alt={friend.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full grid place-items-center">
                                                        <i className="fa-solid fa-user text-gray-400"></i>
                                                    </div>
                                                )}
                                            </button>
                                            <button 
                                                onClick={() => handleOpenProfilePreview(friend.id)}
                                                className="font-medium hover:text-gray-700"
                                            >
                                                {friend.name}
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveFriend(friend.id)}
                                            className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                                        >
                                            Supprimer
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

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