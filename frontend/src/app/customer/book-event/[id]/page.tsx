import BookEventClient from './BookEventClient'

// Required for static export - provide at least one dummy param
export async function generateStaticParams() {
  return [
    { id: 'placeholder' }
  ]
}

export default function BookEvent() {
  return <BookEventClient />
}