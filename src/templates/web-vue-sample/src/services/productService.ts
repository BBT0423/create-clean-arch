import type { CreateProductRequest, Product } from '@/types/product';
import { httpClient } from '@/utils/httpClient';

export const productService = {
  /**
   * GET /api/v1/Products
   * List all products
   */
  async getAll() {
    return httpClient.get<Product[]>('/api/v1/Products');
  },

  /**
   * POST /api/v1/Products
   * Create a product
   */
  async create(request: CreateProductRequest) {
    return httpClient.post<Product>('/api/v1/Products', request);
  },
};
