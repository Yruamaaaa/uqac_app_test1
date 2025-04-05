'use client'
import { useRouter } from 'next/navigation'

export default function CallToAction() {
    const router = useRouter()

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-2xl font-bold mb-4">Prêt à commencer ?</h2>
            <p className="text-gray-600 mb-6">
                Rejoignez notre communauté de sportifs et trouvez des partenaires pour vos activités sportives.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
                <button
                    onClick={() => router.push('/login')}
                    className="px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                    Se connecter
                </button>
                <button
                    onClick={() => router.push('/event-research')}
                    className="px-6 py-3 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                    Voir les événements
                </button>
            </div>
        </div>
    )
}