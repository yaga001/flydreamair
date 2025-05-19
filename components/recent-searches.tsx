"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, ArrowRight, Calendar } from "lucide-react"
import { format } from "date-fns"
import { getSearchHistory } from "@/lib/search-history"
import type { SearchHistoryItem } from "@/lib/types"

interface RecentSearchesProps {
  userId: string
}

export default function RecentSearches({ userId }: RecentSearchesProps) {
  const router = useRouter()
  const [searches, setSearches] = useState<SearchHistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSearches = async () => {
      try {
        const recentSearches = await getSearchHistory(userId)
        setSearches(recentSearches)
      } catch (error) {
        console.error("Error fetching recent searches:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSearches()
  }, [userId])

  const handleSearchAgain = (search: SearchHistoryItem) => {
    // Build query params
    const params = new URLSearchParams({
      origin: search.origin,
      destination: search.destination,
      departDate: search.departDate,
      passengers: search.passengers,
      cabinClass: search.cabinClass,
      tripType: search.tripType,
    })

    if (search.returnDate) {
      params.append("returnDate", search.returnDate)
    }

    // Navigate to results page
    router.push(`/flights?${params.toString()}`)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Recent Searches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (searches.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Recent Searches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-gray-500 text-sm">No recent searches</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Recent Searches</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {searches.map((search) => (
            <div
              key={search.id}
              className="bg-gray-50 p-3 rounded-md border border-gray-200 hover:border-blue-200 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <span className="font-medium">{search.origin}</span>
                  <ArrowRight className="h-3 w-3 mx-2" />
                  <span className="font-medium">{search.destination}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1 h-auto"
                  onClick={() => handleSearchAgain(search)}
                >
                  Search again
                </Button>
              </div>
              <div className="flex items-center text-xs text-gray-500 space-x-4">
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>
                    {format(new Date(search.departDate), "MMM d")}
                    {search.returnDate && ` - ${format(new Date(search.returnDate), "MMM d")}`}
                  </span>
                </div>
                <div>
                  {search.passengers} {Number(search.passengers) === 1 ? "passenger" : "passengers"}
                </div>
                <div className="capitalize">{search.cabinClass}</div>
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{format(new Date(search.searchDate), "MMM d, h:mm a")}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
