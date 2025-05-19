import type { SearchHistoryItem } from "./types"
import { saveRecentSearch, getRecentSearches } from "./storage"

// Function to save a search to history
export async function saveSearchHistory(
  userId: string,
  searchData: Omit<SearchHistoryItem, "id" | "searchDate">,
): Promise<void> {
  // Check if we're in a browser environment
  if (typeof window === "undefined") {
    return
  }

  // Create search history item
  const searchItem: SearchHistoryItem = {
    ...searchData,
    id: `search-${Date.now()}`,
    searchDate: new Date().toISOString(),
  }

  // Save to storage
  saveRecentSearch(userId, searchItem)
}

// Function to get recent searches for a user
export async function getSearchHistory(userId: string): Promise<SearchHistoryItem[]> {
  // Check if we're in a browser environment
  if (typeof window === "undefined") {
    return []
  }

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  return getRecentSearches(userId)
}
