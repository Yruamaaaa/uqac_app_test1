// List of banned words in French (this is a sample list - you should expand it)
const BANNED_WORDS = [
    // Sexual content
    'sexe', 'sexuel', 'sexuelle', 'porn', 'porno', 'nudité', 'nue', 'nu',
    // Drugs
    'drogue', 'cannabis', 'coke', 'cocaïne', 'héroïne', 'ecstasy', 'mdma',
    // Violence
    'violence', 'violent', 'agression', 'agresser', 'tuer', 'meurtre', 'arme',
    // Racism
    'raciste', 'racisme', 'nègre', 'négro', 'juif', 'juive', 'arabe', 'noir',
    // Add more words as needed
]

// Function to check if text contains banned words
export function containsBannedWords(text) {
    if (!text) return false
    
    const lowerText = text.toLowerCase()
    return BANNED_WORDS.some(word => lowerText.includes(word.toLowerCase()))
}

// Function to validate form fields
export function validateFormContent(fields) {
    const errors = {}
    
    for (const [field, value] of Object.entries(fields)) {
        if (containsBannedWords(value)) {
            errors[field] = 'Ce contenu contient des mots inappropriés'
        }
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    }
} 