'use client'

import { useIsDarkMode } from './dark-mode-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { Button } from './button'
import { Input } from './input'
import { Badge } from './badge'

export function DarkModeDemo() {
  const isDark = useIsDarkMode()

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Dark Mode Demo
        </h2>
        <p className="text-muted-foreground">
          Current theme: <Badge variant={isDark ? "default" : "secondary"}>
            {isDark ? "🌙 Dark" : "☀️ Light"}
          </Badge>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Sample Card</CardTitle>
            <CardDescription>
              This card demonstrates dark mode styling
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              All text should be highly visible in both light and dark modes.
            </p>
            <div className="flex gap-2">
              <Badge variant="default">Primary</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Form Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Form Elements</CardTitle>
            <CardDescription>
              Test form elements in dark mode
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Sample Input
              </label>
              <Input
                placeholder="Type something..."
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm">Primary Button</Button>
              <Button variant="secondary" size="sm">Secondary</Button>
              <Button variant="outline" size="sm">Outline</Button>
            </div>
          </CardContent>
        </Card>

        {/* Color Palette Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Color Palette</CardTitle>
            <CardDescription>
              Current theme colors
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-background border"></div>
              <span className="text-sm">Background</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-foreground"></div>
              <span className="text-sm">Foreground</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-card border"></div>
              <span className="text-sm">Card</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-muted"></div>
              <span className="text-sm">Muted</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-primary"></div>
              <span className="text-sm">Primary</span>
            </div>
          </CardContent>
        </Card>

        {/* Status Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
            <CardDescription>
              Theme detection and application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Theme:</span> {isDark ? 'Dark Mode' : 'Light Mode'}
              </p>
              <p className="text-sm">
                <span className="font-medium">HTML Class:</span>{' '}
                <code className="text-xs bg-muted px-1 py-0.5 rounded">
                  {typeof window !== 'undefined' ? document.documentElement.className : 'N/A'}
                </code>
              </p>
              <p className="text-sm text-muted-foreground">
                Toggle the theme using the sun/moon icon in the header
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
