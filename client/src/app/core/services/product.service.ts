import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  Product,
  Topping,
  PaginatedProducts,
  RawPaginatedResponse,
  ApiProduct,
  Ingredient,
} from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private baseUrl = 'http://localhost:5004/api';
  private http = inject(HttpClient);

  getProducts(
    pageNumber: number = 1,
    pageSize: number = 6
  ): Observable<PaginatedProducts> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    return this.http
      .get<RawPaginatedResponse>(`${this.baseUrl}/Products`, { params })
      .pipe(
        map((response: RawPaginatedResponse) => {
          const mappedProducts: Product[] = response.data.map(
            (apiProduct: ApiProduct) => ({
              id: apiProduct.id,
              name: apiProduct.name,
              description: apiProduct.note,
              price: apiProduct.price,
              imageUrl: apiProduct.img,
              purchaseCount: apiProduct.purchaseCount,
            })
          );

          return {
            items: mappedProducts,
            pageNumber: response.currentPage,
            totalPages: response.totalPages,
            totalCount: response.totalCount,
            hasPreviousPage: response.currentPage > 1,
            hasNextPage: response.currentPage < response.totalPages,
          };
        })
      );
  }

  getProductById(id: number): Observable<Product | undefined> {
    return this.http.get<ApiProduct>(`${this.baseUrl}/Products/${id}`).pipe(
      map((apiProduct: ApiProduct | undefined) => {
        if (!apiProduct) return undefined;
        return {
          id: apiProduct.id,
          name: apiProduct.name,
          description: apiProduct.note,
          price: apiProduct.price,
          imageUrl: apiProduct.img,
          purchaseCount: apiProduct.purchaseCount,
          recipeItems: apiProduct.recipeItems,
        };
      })
    );
  }

  getIngredients(): Observable<Ingredient[]> {
    return this.http.get<Ingredient[]>(`${this.baseUrl}/Ingredients`);
  }

  createProduct(formData: FormData): Observable<Product> {
    return this.http.post<Product>(`${this.baseUrl}/Products`, formData);
  }

  updateProduct(id: number, formData: FormData): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/Products/${id}`, formData);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/Products/${id}`);
  }

  getToppings(): Observable<Topping[]> {
    return of([
      { id: 1, name: 'Trân Châu Đen', price: 5000 },
      { id: 2, name: 'Pudding Trứng', price: 7000 },
      { id: 3, name: 'Kem Phô Mai (Macchiato)', price: 10000 },
    ]);
  }
}
