'use client'
import Link from 'next/link'

export default function Button({ text, dark = false, full = false, href, onClick }) {
    const className = `px-6 py-3 ${dark ? 'bg-black text-white hover:bg-gray-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'} rounded-full font-medium transition-colors ${full ? 'w-full' : ''}`

    if (href) {
        return (
            <Link href={href} className={className}>
                {text}
            </Link>
        )
    }

    return (
        <button onClick={onClick} className={className}>
            {text}
        </button>
    )
}