'use client'
import { useRouter } from 'next/navigation'
import Button from './Button'
import { useAuth } from '@/context/AuthContext'

export default function CallToAction() {
    const router = useRouter()
    const { currentUser } = useAuth()

    const handleEventResearch = () => {
        if (!currentUser) {
            router.push('/login')
        } else {
            router.push('/event-research')
        }
    }

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-2xl font-bold mb-4">Prêt à commencer ?</h2>
            <p className="text-gray-600 mb-6">
                Rejoignez notre communauté de sportifs et trouvez des partenaires pour vos activités sportives.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
                <Button
                    text="Se connecter"
                    onClick={() => router.push('/login')}
                    dark
                />
                <Button
                    text="Voir les événements"
                    onClick={handleEventResearch}
                />
            </div>
        </div>
    )
}