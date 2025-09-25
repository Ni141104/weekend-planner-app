"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Navigation, Route, Clock } from "lucide-react"
import type { ScheduledActivity } from "@/lib/types"

interface TravelModeProps {
  activities: ScheduledActivity[]
  onRouteCalculated?: (route: RouteInfo) => void
}

interface ActivityLocation {
  id: string
  name: string
  address: string
  coordinates: { lat: number; lng: number }
  estimatedTime: number
}

interface RouteInfo {
  totalDistance: number
  totalTravelTime: number
  stops: ActivityLocation[]
}

export function TravelMode({ activities, onRouteCalculated }: TravelModeProps) {
  const [locations, setLocations] = useState<ActivityLocation[]>([])
  const [route, setRoute] = useState<RouteInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [showMap, setShowMap] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)

  // General activity location mapping - works anywhere
  const getActivityLocation = (activity: ScheduledActivity): ActivityLocation | null => {
    // For general activities, we'll use placeholder coordinates and generic descriptions
    // In a real app, these would be dynamically determined based on user location
    const locationMocks: Record<string, ActivityLocation> = {
      "hiking": {
        id: "hiking",
        name: "Local Hiking Trail",
        address: "Nearby hiking trail or nature park",
        coordinates: { lat: 40.7128, lng: -74.0060 }, // Generic coordinates
        estimatedTime: 180
      },
      "cycling": {
        id: "cycling",
        name: "Scenic Cycling Route",
        address: "Local cycling path or bike trail",
        coordinates: { lat: 40.7589, lng: -73.9851 },
        estimatedTime: 120
      },
      "picnic": {
        id: "picnic",
        name: "Local Park",
        address: "Nearby park or recreation area",
        coordinates: { lat: 40.7831, lng: -73.9712 },
        estimatedTime: 150
      },
      "museum": {
        id: "museum",
        name: "Local Museum",
        address: "Nearby museum or cultural center",
        coordinates: { lat: 40.7794, lng: -73.9632 },
        estimatedTime: 150
      },
      "yoga": {
        id: "yoga",
        name: "Yoga Studio",
        address: "Local yoga studio or wellness center",
        coordinates: { lat: 40.7505, lng: -73.9934 },
        estimatedTime: 60
      },
      "brunch": {
        id: "brunch",
        name: "Brunch Restaurant",
        address: "Local restaurant or cafe",
        coordinates: { lat: 40.7614, lng: -73.9776 },
        estimatedTime: 120
      },
      "art-crafts": {
        id: "art-crafts",
        name: "Art Studio",
        address: "Local art studio or craft center",
        coordinates: { lat: 40.7282, lng: -73.9942 },
        estimatedTime: 120
      },
      "friends-hangout": {
        id: "friends-hangout",
        name: "Social Venue",
        address: "Local hangout spot or community center",
        coordinates: { lat: 40.7418, lng: -73.9818 },
        estimatedTime: 240
      },
      "restaurant": {
        id: "restaurant",
        name: "Local Restaurant",
        address: "Nearby dining establishment",
        coordinates: { lat: 40.7549, lng: -73.9840 },
        estimatedTime: 90
      },
      "workout": {
        id: "workout",
        name: "Fitness Center",
        address: "Local gym or fitness facility",
        coordinates: { lat: 40.7282, lng: -73.9776 },
        estimatedTime: 60
      }
    }

    return locationMocks[activity.id] || {
      id: activity.id,
      name: activity.name,
      address: "Local venue for " + activity.name.toLowerCase(),
      coordinates: { lat: 40.7128 + Math.random() * 0.1, lng: -74.0060 + Math.random() * 0.1 },
      estimatedTime: activity.duration
    }
  }

  useEffect(() => {
    const calculateRoute = () => {
      const activitiesWithLocations = activities
        .map(activity => ({ activity, location: getActivityLocation(activity) }))
        .filter((item): item is { activity: ScheduledActivity; location: ActivityLocation } => 
          item.location !== null
        )

      if (activitiesWithLocations.length === 0) {
        setLoading(false)
        return
      }

      // Sort by time
      const sortedLocations = activitiesWithLocations
        .sort((a, b) => a.activity.startTime.localeCompare(b.activity.startTime))
        .map(item => item.location)

      // Mock route calculation
      const totalDistance = sortedLocations.length * 8.5 // Mock 8.5km between locations
      const totalTravelTime = sortedLocations.reduce((acc, loc) => acc + loc.estimatedTime, 0)

      const routeInfo: RouteInfo = {
        totalDistance,
        totalTravelTime,
        stops: sortedLocations
      }

      setLocations(sortedLocations)
      setRoute(routeInfo)
      setLoading(false)
      onRouteCalculated?.(routeInfo)
    }

    // Simulate processing time
    const timer = setTimeout(calculateRoute, 1000)
    return () => clearTimeout(timer)
  }, [activities, onRouteCalculated])

  const openRouteInMaps = () => {
    if (!route || locations.length === 0) return

    // Create a route URL for Google Maps with multiple waypoints
    const origin = locations[0]
    const destination = locations[locations.length - 1]
    const waypoints = locations.slice(1, -1).map(loc => `${loc.coordinates.lat},${loc.coordinates.lng}`).join('|')
    
    // Google Maps URL with directions
    const googleMapsUrl = `https://www.google.com/maps/dir/${origin.coordinates.lat},${origin.coordinates.lng}/${waypoints ? waypoints + '/' : ''}${destination.coordinates.lat},${destination.coordinates.lng}/`
    
    // Open in new tab
    window.open(googleMapsUrl, '_blank')
  }

  const openLocationInMaps = (location: ActivityLocation) => {
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.name + ' ' + location.address)}`
    window.open(googleMapsUrl, '_blank')
  }

  const loadGoogleMaps = async () => {
    setShowMap(true)
    
    // Enhanced map preview with navigation options
    if (mapRef.current) {
      const avgLat = locations.reduce((sum, loc) => sum + loc.coordinates.lat, 0) / locations.length
      const avgLng = locations.reduce((sum, loc) => sum + loc.coordinates.lng, 0) / locations.length
      
      mapRef.current.innerHTML = `
        <div class="w-full space-y-4">
          <!-- Interactive Map Preview -->
          <div class="w-full h-64 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-lg relative overflow-hidden border border-gray-200 shadow-lg">
            <!-- Map background with grid pattern -->
            <div class="absolute inset-0 opacity-20">
              <svg width="100%" height="100%">
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#3B82F6" stroke-width="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>
            
            <!-- Location info -->
            <div class="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm border">
              <span class="text-sm font-semibold text-gray-700">📍 Your Weekend Route</span>
            </div>
            
            <!-- Route line connecting all points -->
            <svg class="absolute inset-0 w-full h-full pointer-events-none">
              ${locations.map((loc, index) => {
                if (index === locations.length - 1) return '';
                const x1 = 15 + (index * (70 / Math.max(locations.length - 1, 1)));
                const y1 = 30 + (Math.sin(index * 0.5) * 20);
                const x2 = 15 + ((index + 1) * (70 / Math.max(locations.length - 1, 1)));
                const y2 = 30 + (Math.sin((index + 1) * 0.5) * 20);
                return `<line x1="${x1}%" y1="${y1 + 30}%" x2="${x2}%" y2="${y2 + 30}%" stroke="#3B82F6" stroke-width="3" stroke-dasharray="8,4" opacity="0.8"/>`;
              }).join('')}
            </svg>
            
            <!-- Location markers -->
            ${locations.map((loc, index) => {
              const x = 15 + (index * (70 / Math.max(locations.length - 1, 1)));
              const y = 30 + (Math.sin(index * 0.5) * 20);
              return `
                <div 
                  class="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                  style="left: ${x}%; top: ${y + 30}%"
                  onclick="window.openLocationInMaps(${JSON.stringify(loc).replace(/"/g, '&quot;')})"
                >
                  <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg border-3 border-white group-hover:scale-110 transition-all duration-200 cursor-pointer">
                    ${index + 1}
                  </div>
                  <div class="absolute top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 max-w-32 text-center">
                    ${loc.name}
                  </div>
                </div>
              `;
            }).join('')}
            
            <!-- Map stats -->
            <div class="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm border">
              <div class="text-xs text-gray-600 space-y-1">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>${locations.length} stops</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-4 h-0.5 bg-blue-500 opacity-70"></div>
                  <span>~${route?.totalDistance.toFixed(1)} km route</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Navigation Actions -->
          <div class="flex flex-col sm:flex-row gap-3">
            <button 
              onclick="window.openFullRoute()"
              class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7"></path>
              </svg>
              Start Navigation
            </button>
            <button 
              onclick="window.openAllLocations()"
              class="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              View All Locations
            </button>
          </div>
        </div>
      `
      
      // Add navigation functions to window for onclick handlers
      ;(window as any).openLocationInMaps = openLocationInMaps
      ;(window as any).openFullRoute = openRouteInMaps
      ;(window as any).openAllLocations = () => {
        locations.forEach((location, index) => {
          setTimeout(() => openLocationInMaps(location), index * 1000) // Stagger opening
        })
      }
    }
  }

  if (loading) {
    return (
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <MapPin className="w-5 h-5 text-blue-500" />
            </motion.div>
            Travel Mode
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              Calculating optimal route...
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (locations.length === 0) {
    return (
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-500" />
            Travel Mode
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              Add location-based activities to see your route!
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-500" />
          Travel Mode
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Route className="w-4 h-4" />
            <span>{route?.totalDistance.toFixed(1)} km</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{route?.totalTravelTime} min</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Route Overview */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Your Weekend Route:</h4>
          {locations.map((location, index) => (
            <motion.div
              key={location.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100"
            >
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                {index + 1}
              </div>
              <div className="flex-1">
                <h5 className="font-medium text-sm">{location.name}</h5>
                <p className="text-xs text-muted-foreground">{location.address}</p>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="text-xs">
                  {location.estimatedTime}min
                </Badge>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Map Toggle */}
        <div className="pt-4 border-t">
          {!showMap ? (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                onClick={loadGoogleMaps}
                className="w-full"
                variant="outline"
              >
                <Navigation className="w-4 h-4 mr-2" />
                Show Interactive Map
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.5 }}
            >
              <div ref={mapRef} className="w-full" />
              <div className="mt-4 flex gap-2">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Navigation className="w-4 h-4 mr-2" />
                    Get Directions
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Route className="w-4 h-4 mr-2" />
                    Optimize Route
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
