'use client'
import Image from 'next/image'
import { useAuth } from '@/context/AuthContext'

export default function Post({ post }) {
    const { currentUser } = useAuth()

    if (!post) {
        return null
    }

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden">
                    {post.authorImage ? (
                        <Image
                            src={post.authorImage}
                            alt={post.authorName || 'Author'}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <i className="fa-solid fa-user text-gray-400"></i>
                        </div>
                    )}
                </div>
                <div>
                    <h3 className="font-semibold">{post.authorName || 'Anonymous'}</h3>
                    <p className="text-sm text-gray-500">
                        {post.createdAt ? new Date(post.createdAt.toDate()).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                        }) : 'No date'}
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold">{post.title || 'Untitled'}</h2>
                <p className="text-gray-600">{post.content || 'No content'}</p>
                
                {post.imageUrl && (
                    <div className="relative h-64 w-full rounded-lg overflow-hidden">
                        <Image
                            src={post.imageUrl}
                            alt={post.title || 'Post image'}
                            fill
                            className="object-cover"
                        />
                    </div>
                )}

                <div className="flex items-center gap-4 text-gray-500">
                    <button className="flex items-center gap-2 hover:text-gray-700">
                        <i className="fa-regular fa-heart"></i>
                        <span>{post.likes || 0}</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-gray-700">
                        <i className="fa-regular fa-comment"></i>
                        <span>{post.comments?.length || 0}</span>
                    </button>
                    {currentUser?.uid === post.authorId && (
                        <button className="ml-auto text-red-500 hover:text-red-600">
                            <i className="fa-solid fa-trash"></i>
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
} 