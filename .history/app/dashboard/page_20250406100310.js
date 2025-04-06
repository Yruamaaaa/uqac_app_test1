'use client'
import { useState } from 'react'
import DashboardHeader from '@/components/DashboardHeader'
import BottomNav from '@/components/BottomNav'
import CreatePostModal from '@/components/CreatePostModal'
import PostsList from '@/components/PostsList'

export default function DashboardPage() {
    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardHeader />
            
            <div className="container mx-auto px-4 pt-8 pb-20">
                <div className="max-w-2xl mx-auto">
                    {/* Create Post Button */}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="w-full bg-white rounded-xl shadow-sm p-4 mb-6 text-left text-gray-500 hover:bg-gray-50 transition-colors flex items-center gap-3"
                    >
                        <div className="w-10 h-10 rounded-full bg-gray-100 grid place-items-center">
                            <i className="fa-solid fa-plus"></i>
                        </div>
                        <span>Partagez votre activité...</span>
                    </button>

                    {/* Posts List */}
                    <PostsList />
                </div>
            </div>

            {/* Create Post Modal */}
            <CreatePostModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
            />

            <BottomNav />
        </div>
    )
}
