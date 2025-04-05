'use client'
import FindPartnersForm from '@/components/FindPartnersForm'
import DashboardHeader from '@/components/DashboardHeader'
import BottomNav from '@/components/BottomNav'

export default function FindPartnersPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardHeader />
            
            <div className="container mx-auto px-4 py-8 pb-20">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-2xl font-bold mb-6">Trouver un partenaire</h1>
                    <FindPartnersForm />
                </div>
            </div>

            <BottomNav />
        </div>
    )
} 