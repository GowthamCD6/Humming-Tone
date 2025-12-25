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
      { label: "Men's Collection", href: '/mens' },
      { label: "Children's Collection", href: '/childrens' },
      { label: "Baby Collection", href: '/baby' },
      { label: 'Sports Collection', href: '/sports' },
      { label: 'Customize', href: '/customize' },
      { label: 'All Products', href: '/all-products' },
    ],
    supportLinks: [
      { label: 'Contact Us', href: '/contact' },
      { label: 'Shipping Info', href: '/shipping' },
      { label: 'Returns & Exchanges', href: '/returns' },
      { label: 'Size Guide', href: '/size-guide' },
      { label: 'FAQ', href: '/faq' },
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
  genderStatus: {
    Men: true,
    Children: true,
    Baby: true,
    Sports: true,
    Customize: true,
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
      genderStatus: { ...defaultSiteContent.genderStatus, ...(parsed.genderStatus || {}) },
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
      shopLinks: partialFooter.shopLinks !== undefined ? partialFooter.shopLinks : current.footer.shopLinks,
      supportLinks: partialFooter.supportLinks !== undefined ? partialFooter.supportLinks : current.footer.supportLinks,
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

export function updateGenderStatus(genderStatusMap) {
  const current = getSiteContent()
  const next = {
    ...current,
    genderStatus: { ...current.genderStatus, ...genderStatusMap },
  }
  setSiteContent(next)
  return next
}

export function resetSiteContent() {
  localStorage.removeItem(STORAGE_KEY)
  return defaultSiteContent
}

export function getGenderOptions() {
  const content = getSiteContent()
  const allGenders = Object.keys(content.genderCategory)
  const genderStatus = content.genderStatus || {}
  
  // Filter to only return active genders
  return allGenders.filter(gender => genderStatus[gender] !== false)
}

export function getCategoryOptionsForGender(gender) {
  const map = getSiteContent().genderCategory
  if (map?.[gender] && Array.isArray(map[gender])) return map[gender]
  return ['All Categories']
}
