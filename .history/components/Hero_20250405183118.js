'use client'
import Image from 'next/image'

export default function Hero() {
    return (
        <div className="relative h-[400px] w-full">
            <Image
                src="/hero-bg.jpg"
                alt="Sports background"
                fill
                className="object-cover"
                priority
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-center text-white max-w-2xl px-4">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Trouvez des partenaires pour vos activités sportives
                    </h1>
                    <p className="text-lg md:text-xl mb-8">
                        Rejoignez notre communauté de sportifs et organisez des événements sportifs ensemble
                    </p>
                </div>
            </div>
        </div>
    )
}
