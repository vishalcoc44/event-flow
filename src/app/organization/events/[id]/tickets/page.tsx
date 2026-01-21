import TicketsClient from './TicketsClient'

// Required for static export - provide at least one dummy param
export async function generateStaticParams() {
  return [{ id: 'placeholder' }]
}

export default function EventTicketsPage() {
  return <TicketsClient />
}

