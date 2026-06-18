import Marketplace from './marketplace.model';
import {
  IListing,
  CreateListingInput,
  UpdateListingInput,
  PaginationQuery,
} from '../../types';

// ============================================================
// Marketplace Service — Business Logic Layer
// ============================================================

class MarketplaceService {
  /**
   * Get a listing by ID (increments views).
   */
  async getListingById(id: string): Promise<IListing> {
    const listing = await Marketplace.findById(id);
    if (!listing) {
      throw Object.assign(new Error('Listing not found'), { statusCode: 404 });
    }
    // Increment views asynchronously (don't block response)
    Marketplace.incrementViews(id).catch(() => {});
    return listing;
  }

  /**
   * Get all listings for the current user.
   */
  async getMyListings(userId: string): Promise<IListing[]> {
    return Marketplace.findByUserId(userId);
  }

  /**
   * Create a new listing.
   */
  async createListing(userId: string, input: CreateListingInput): Promise<IListing> {
    if (!input.title || !input.type) {
      throw Object.assign(new Error('Title and type are required'), { statusCode: 400 });
    }
    return Marketplace.create(userId, input);
  }

  /**
   * Update a listing (only the owner can update).
   */
  async updateListing(
    listingId: string,
    userId: string,
    input: UpdateListingInput,
    isAdmin: boolean
  ): Promise<IListing> {
    const existing = await Marketplace.findById(listingId);
    if (!existing) {
      throw Object.assign(new Error('Listing not found'), { statusCode: 404 });
    }
    if (!isAdmin && existing.userId !== userId) {
      throw Object.assign(new Error('You do not have permission to update this listing'), { statusCode: 403 });
    }
    return Marketplace.update(listingId, input);
  }

  /**
   * Delete a listing (only the owner or admin can delete).
   */
  async deleteListing(listingId: string, userId: string, isAdmin: boolean): Promise<void> {
    const existing = await Marketplace.findById(listingId);
    if (!existing) {
      throw Object.assign(new Error('Listing not found'), { statusCode: 404 });
    }
    if (!isAdmin && existing.userId !== userId) {
      throw Object.assign(new Error('You do not have permission to delete this listing'), { statusCode: 403 });
    }
    await Marketplace.delete(listingId);
  }

  /**
   * List all listings with pagination and filters.
   */
  async listListings(
    query: PaginationQuery & { type?: string; status?: string }
  ): Promise<{ listings: IListing[]; total: number }> {
    return Marketplace.list(query);
  }
}

const marketplaceService = new MarketplaceService();
export default marketplaceService;
