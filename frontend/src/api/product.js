import api from './axios';

// Get all products (public/filtered)
export const getProducts = async (filters = {}) => {
    const response = await api.get('/products', { params: filters });
    return response.data;
};

// Get single product details
export const getProduct = async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
};

// Create new product
export const createProduct = async (productData) => {
    // Determine if we need to send as FormData (for files) or JSON
    const config = {
        headers: {
            'Content-Type': productData instanceof FormData ? 'multipart/form-data' : 'application/json'
        }
    };
    const response = await api.post('/products', productData, config);
    return response.data;
};

// Update product
export const updateProduct = async (id, productData) => {
    const config = {
        headers: {
            'Content-Type': productData instanceof FormData ? 'multipart/form-data' : 'application/json'
        }
    };
    const response = await api.put(`/products/${id}`, productData, config);
    return response.data;
};

// Delete product
export const deleteProduct = async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
};
