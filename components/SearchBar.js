'use client'
import { useState } from 'react'

export default function SearchBar({ value, onChange, placeholder = 'Rechercher...' }) {
    const [isFocused, setIsFocused] = useState(false)

    const handleChange = (e) => {
        if (typeof onChange === 'function') {
            onChange(e.target.value)
        }
    }

    return (
        <div className={`relative ${isFocused ? 'ring-2 ring-blue-500' : ''} rounded-lg transition-all duration-200`}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="fa-solid fa-magnifying-glass text-gray-400"></i>
            </div>
            <input
                type="text"
                value={value}
                onChange={handleChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={placeholder}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
        </div>
    )
} 