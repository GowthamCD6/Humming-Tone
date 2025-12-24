const STORAGE_KEY = 'humming-tone:site-content:v1'

export const defaultSiteContent = {
  footer: {
    brandName: 'Humming & Tone',
    description:
      'Your premier destination for stylish and affordable fashion. Discover the latest trends in clothing for men, women, and kids.',
    social: {
      facebook: '',
      instagram: '',
      twitter: '',
      pinterest: '',
    },
    shopLinks: [
      { label: "Men's Collection", href: '#' },
      { label: "Children's Collection", href: '#' },
      { label: "Baby Collection", href: '#' },
      { label: 'Sports Collection', href: '#' },
      { label: 'Customize', href: '#' },
      { label: 'All Products', href: '#' },
    ],
    supportLinks: [
      { label: 'Contact Us', href: '#' },
      { label: 'Shipping Info', href: '#' },
      { label: 'Returns & Exchanges', href: '#' },
    ],
    company: {
      email: 'fashionandmore.md@gmail.com',
      phone: '+91 80729 77025',
      address: '49, Rayapuram West Street, Tirupur-641 604, Tamil Nadu.',
    },
    legal: {
      copyright: '© 2025 humming tone | All rights reserved.',
      privacyPolicyLabel: 'Privacy Policy',
      privacyPolicyHref: '#',
      termsLabel: 'Terms of Service',
      termsHref: '#',
    },
  },
  genderCategory: {
    Men: ['All Categories', 'Shirts', 'Pants', 'Jackets', 'Shoes', 'Accessories'],
    Children: ['All Categories', 'Tops', 'Bottoms', 'Winter sets'],
    Baby: ['All Categories', 'Baby Sets', 'Winter sets'],
    Sports: ['All Categories', 'Running', 'Training', 'Outdoor', 'Shoes', 'Accessories'],
    Customize: ['All Categories', 'Printed', 'Embroidery'],
  },
}

export function getSiteContent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultSiteContent
    const parsed = JSON.parse(raw)
    return {
      ...defaultSiteContent,
      ...parsed,
      footer: { ...defaultSiteContent.footer, ...(parsed.footer || {}) },
      genderCategory: { ...defaultSiteContent.genderCategory, ...(parsed.genderCategory || {}) },
    }
  } catch {
    return defaultSiteContent
  }
}

export function setSiteContent(next) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}

export function updateFooter(partialFooter) {
  const current = getSiteContent()
  const next = {
    ...current,
    footer: {
      ...current.footer,
      ...partialFooter,
      social: { ...current.footer.social, ...(partialFooter.social || {}) },
      company: { ...current.footer.company, ...(partialFooter.company || {}) },
      legal: { ...current.footer.legal, ...(partialFooter.legal || {}) },
    },
  }
  setSiteContent(next)
  return next
}

export function updateGenderCategory(partialGenderCategory) {
  const current = getSiteContent()
  const next = {
    ...current,
    genderCategory: { ...current.genderCategory, ...partialGenderCategory },
  }
  setSiteContent(next)
  return next
}

export function resetSiteContent() {
  localStorage.removeItem(STORAGE_KEY)
  return defaultSiteContent
}

export function getGenderOptions() {
  return Object.keys(getSiteContent().genderCategory)
}

export function getCategoryOptionsForGender(gender) {
  const map = getSiteContent().genderCategory
  if (map?.[gender] && Array.isArray(map[gender])) return map[gender]
  return ['All Categories']
}
