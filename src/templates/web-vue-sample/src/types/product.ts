export interface Product {
  id: number;
  name: string;
  createdAt: string;
}

export interface CreateProductRequest {
  name: string;
}
