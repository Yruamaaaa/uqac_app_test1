'use client'
import React from 'react'
import DashboardHeader from '@/components/DashboardHeader'
import BottomNav from '@/components/BottomNav'
import Dashboard from '@/components/Dashboard'

export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardHeader />
            
            <div className="container mx-auto px-4 pt-8 pb-20">
                <div className="max-w-4xl mx-auto">
                    <Dashboard />
                </div>
            </div>

            <BottomNav />
        </div>
    )
}
