'use client'
import React from 'react'
import DashboardHeader from '@/components/DashboardHeader'
import BottomNav from '@/components/BottomNav'
import ProfileContent from '@/components/ProfileContent'

export default function ProfilePage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardHeader />
            
            <div className="container mx-auto px-4 pt-8 pb-20">
                <div className="max-w-4xl mx-auto">
                    <ProfileContent />
                </div>
            </div>

            <BottomNav />
        </div>
    )
} 