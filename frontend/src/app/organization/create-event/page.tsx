'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { HoverShadowEffect } from '@/components/ui/hover-shadow-effect'
import { Plus, Calendar, MapPin, DollarSign, Image, Tag } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useCategories } from '@/contexts/CategoryContext'
import { useOrganizationData, useOrganizationPermissions } from '@/hooks/useOrganizationData'
import { supabase } from '@/lib/supabase'

interface EventFormData {
  title: string
  description: string
  category_id: string | null
  event_space_id: string | null
  location: string
  price: string
  date: string
  time: string
  image: File | null
  image_url: string
  is_public: boolean
  requires_approval: boolean
  max_attendees: string
  registration_deadline: string
}

interface EventSpace {
  id: string
  name: string
  description: string
  slug: string
}

export default function CreateOrganizationEvent() {
  const router = useRouter()
  const { user } = useAuth()
  const { categories, loading: categoriesLoading } = useCategories()
  const { organization, orgLoading } = useOrganizationData()
  const { canCreateEvents, isLoadingPermissions } = useOrganizationPermissions()
  const { toast } = useToast()
  
  const [isLoading, setIsLoading] = useState(false)
  const [eventSpaces, setEventSpaces] = useState<EventSpace[]>([])
  const [loadingSpaces, setLoadingSpaces] = useState(false)

  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    category_id: null,
    event_space_id: null,
    location: '',
    price: '0',
    date: '',
    time: '',
    image: null,
    image_url: '',
    is_public: true,
    requires_approval: false,
    max_attendees: '',
    registration_deadline: ''
  })

  // Fetch event spaces for the organization
  useEffect(() => {
    const fetchEventSpaces = async () => {
      if (!organization?.id) return

      try {
        setLoadingSpaces(true)
        const { data, error } = await supabase
          .from('event_spaces')
          .select('id, name, description, slug')
          .eq('organization_id', organization.id)
          .order('name')

        if (error) throw error
        setEventSpaces(data || [])
        
        // Auto-select first space if only one exists
        if (data && data.length === 1) {
          setFormData(prev => ({ ...prev, event_space_id: data[0].id }))
        }
      } catch (error) {
        console.error('Error fetching event spaces:', error)
        toast({
          title: "Error",
          description: "Failed to load event spaces",
          variant: "destructive",
        })
      } finally {
        setLoadingSpaces(false)
      }
    }

    fetchEventSpaces()
  }, [organization?.id, toast])

  // Check permissions
  useEffect(() => {
    if (!isLoadingPermissions && !canCreateEvents) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to create events in this organization",
        variant: "destructive",
      })
      router.push('/organization/dashboard')
    }
  }, [canCreateEvents, isLoadingPermissions, router, toast])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'file') {
      const files = (e.target as HTMLInputElement).files
      setFormData(prev => ({ ...prev, image: files ? files[0] : null }))
    } else if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const uploadImage = async (imageFile: File): Promise<string | null> => {
    try {
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `event-images/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('event-images')
        .upload(filePath, imageFile)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('event-images')
        .getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!organization || !user) {
      toast({
        title: "Error",
        description: "Organization or user data not available",
        variant: "destructive",
      })
      return
    }

    if (!formData.event_space_id) {
      toast({
        title: "Error",
        description: "Please select an event space",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      
      let imageUrl = formData.image_url
      if (formData.image) {
        const uploadedUrl = await uploadImage(formData.image)
        if (uploadedUrl) {
          imageUrl = uploadedUrl
        }
      }

      // Call the Edge Function to create the event
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Not authenticated')
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-organization-event`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_data: {
            title: formData.title,
            description: formData.description,
            category_id: formData.category_id,
            event_space_id: formData.event_space_id,
            location: formData.location,
            price: parseFloat(formData.price),
            date: formData.date,
            time: formData.time,
            image_url: imageUrl,
            is_public: formData.is_public,
            requires_approval: formData.requires_approval,
            max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : null,
            registration_deadline: formData.registration_deadline || null
          },
          organization_id: organization.id
        })
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create event')
      }

      toast({
        title: "Success",
        description: "Event created successfully",
      })

      router.push('/organization/events')
    } catch (error: any) {
      console.error('Error creating event:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to create event",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (orgLoading || isLoadingPermissions) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border-4 border-t-primary rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    )
  }

  if (!organization) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Organization Required</h1>
          <p className="text-gray-600 mb-6">You need to be part of an organization to create events.</p>
          <Button onClick={() => router.push('/create-organization')}>
            Create Organization
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Plus className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Event</h1>
              <p className="text-gray-600">Create an event for {organization.name}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information Card */}
          <HoverShadowEffect>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span>Basic Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="lg:col-span-2">
                    <Label htmlFor="title">Event Title *</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="Enter a compelling event title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="bg-white"
                    />
                  </div>
                  
                  <div className="lg:col-span-2">
                    <Label htmlFor="description">Event Description *</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Describe your event in detail..."
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      className="bg-white min-h-[120px]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="category_id">Category</Label>
                    {categoriesLoading ? (
                      <div className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm flex items-center">
                        Loading categories...
                      </div>
                    ) : (
                      <Select
                        value={formData.category_id || ''}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value || null }))}
                      >
                        <SelectTrigger id="category_id" className="bg-white">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories?.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="event_space_id">Event Space *</Label>
                    {loadingSpaces ? (
                      <div className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm flex items-center">
                        Loading spaces...
                      </div>
                    ) : (
                      <Select
                        value={formData.event_space_id || ''}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, event_space_id: value || null }))}
                        required
                      >
                        <SelectTrigger id="event_space_id" className="bg-white">
                          <SelectValue placeholder="Select an event space" />
                        </SelectTrigger>
                        <SelectContent>
                          {eventSpaces.map((space) => (
                            <SelectItem key={space.id} value={space.id}>
                              <div key={`space-content-${space.id}`}>
                                <div key={`space-name-${space.id}`} className="font-medium">{space.name}</div>
                                {space.description && (
                                  <div key={`space-desc-${space.id}`} className="text-xs text-gray-500">{space.description}</div>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </HoverShadowEffect>

          {/* Event Details Card */}
          <HoverShadowEffect>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span>Event Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      name="location"
                      placeholder="Event venue or online link"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                      className="bg-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="price">Ticket Price ($)</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="bg-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="date">Event Date *</Label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                      className="bg-white"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div>
                    <Label htmlFor="time">Event Time *</Label>
                    <Input
                      id="time"
                      name="time"
                      type="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      required
                      className="bg-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="max_attendees">Max Attendees</Label>
                    <Input
                      id="max_attendees"
                      name="max_attendees"
                      type="number"
                      min="1"
                      placeholder="Unlimited"
                      value={formData.max_attendees}
                      onChange={handleInputChange}
                      className="bg-white"
                    />
                  </div>

                  <div className="md:col-span-2 lg:col-span-3">
                    <Label htmlFor="registration_deadline">Registration Deadline</Label>
                    <Input
                      id="registration_deadline"
                      name="registration_deadline"
                      type="date"
                      value={formData.registration_deadline}
                      onChange={handleInputChange}
                      className="bg-white"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </HoverShadowEffect>

          {/* Image Upload Card */}
          <HoverShadowEffect>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Image className="w-5 h-5 text-primary" />
                  <span>Event Image</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Label htmlFor="image">Upload Event Image</Label>
                  <Input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={handleInputChange}
                    className="bg-white"
                  />
                  <p className="text-sm text-gray-500">
                    Upload an engaging image for your event. Recommended size: 1200x600px
                  </p>
                </div>
              </CardContent>
            </Card>
          </HoverShadowEffect>

          {/* Event Settings Card */}
          <HoverShadowEffect>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Tag className="w-5 h-5 text-primary" />
                  <span>Event Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_public"
                      name="is_public"
                      checked={formData.is_public}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="is_public">Make this event public</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="requires_approval"
                      name="requires_approval"
                      checked={formData.requires_approval}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="requires_approval">Require approval for registrations</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </HoverShadowEffect>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/organization/dashboard')}
              disabled={isLoading}
            >
              Cancel
            </Button>
            
            <HoverShadowEffect>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-white px-8"
                disabled={isLoading || !organization}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Creating Event...
                  </>
                ) : (
                  'Create Event'
                )}
              </Button>
            </HoverShadowEffect>
          </div>
        </form>
      </div>
    </div>
  )
}
