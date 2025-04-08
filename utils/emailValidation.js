const ALLOWED_DOMAINS = ['@uqac.ca', '@etu.uqac.ca']

export function isValidUQACEmail(email) {
    if (!email) return false
    return ALLOWED_DOMAINS.some(domain => email.toLowerCase().endsWith(domain))
}

export function getEmailDomainError(email) {
    if (!email) return 'Veuillez entrer une adresse email'
    if (!isValidUQACEmail(email)) {
        return 'L\'adresse email doit être un email UQAC (@uqac.ca ou @etu.uqac.ca)'
    }
    return ''
} 