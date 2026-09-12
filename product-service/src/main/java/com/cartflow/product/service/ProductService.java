package com.cartflow.product.service;

import com.cartflow.product.dto.ProductRequest;
import com.cartflow.product.dto.ProductResponse;
import com.cartflow.product.entity.Product;
import com.cartflow.product.exception.ResourceNotFoundException;
import com.cartflow.product.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductService {

    private static final Logger log = LoggerFactory.getLogger(ProductService.class);

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "products")
    public List<ProductResponse> getAllProducts() {
        log.info("Fetching all products (cached)");
        return productRepository.findAll().stream()
                .map(this::mapToProductResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        log.info("Fetching product with id: {}", id);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return mapToProductResponse(product);
    }

    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public ProductResponse createProduct(ProductRequest productRequest) {
        log.info("Creating new product: {}", productRequest.getName());
        Product product = Product.builder()
                .name(productRequest.getName())
                .description(productRequest.getDescription())
                .price(productRequest.getPrice())
                .stock(productRequest.getStock())
                .category(productRequest.getCategory())
                .build();

        Product savedProduct = productRepository.save(product);
        log.info("Product created successfully with id: {}", savedProduct.getId());
        return mapToProductResponse(savedProduct);
    }

    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public ProductResponse updateProduct(Long id, ProductRequest productRequest) {
        log.info("Updating product with id: {}", id);
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        existingProduct.setName(productRequest.getName());
        existingProduct.setDescription(productRequest.getDescription());
        existingProduct.setPrice(productRequest.getPrice());
        existingProduct.setStock(productRequest.getStock());
        existingProduct.setCategory(productRequest.getCategory());

        Product updatedProduct = productRepository.save(existingProduct);
        log.info("Product updated successfully with id: {}", updatedProduct.getId());
        return mapToProductResponse(updatedProduct);
    }

    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public void deleteProduct(Long id) {
        log.info("Deleting product with id: {}", id);
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product not found with id: " + id);
        }
        productRepository.deleteById(id);
        log.info("Product deleted successfully with id: {}", id);
    }

    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public ProductResponse reduceStock(Long id, Integer quantity) {
        log.info("Attempting atomic stock reduction for product id: {}, quantity: {}", id, quantity);
        int rowsUpdated = productRepository.reduceStockAtomic(id, quantity);
        if (rowsUpdated == 0) {
            Product product = productRepository.findById(id).orElse(null);
            int availableStock = product != null ? product.getStock() : 0;
            String productName = product != null ? product.getName() : "ID #" + id;
            throw new IllegalArgumentException("Insufficient stock for product '" + productName + "'. Available: " + availableStock + ", Requested: " + quantity);
        }

        Product updatedProduct = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        log.info("Stock reduced atomically for product id: {}. Remaining stock: {}", id, updatedProduct.getStock());
        return mapToProductResponse(updatedProduct);
    }

    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public ProductResponse restoreStock(Long id, Integer quantity) {
        log.info("Restoring stock atomically for product id: {}, quantity: {}", id, quantity);
        productRepository.restoreStockAtomic(id, quantity);
        Product updatedProduct = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        log.info("Stock restored for product id: {}. New stock: {}", id, updatedProduct.getStock());
        return mapToProductResponse(updatedProduct);
    }

    private ProductResponse mapToProductResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .stock(product.getStock())
                .category(product.getCategory())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}
