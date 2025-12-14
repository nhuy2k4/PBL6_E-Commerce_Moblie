
// Shared TypeScript types and interfaces

export interface User {
	id: number;
	username: string;
	email: string;
	phoneNumber?: string | null;
	role: 'BUYER' | 'SELLER' | 'ADMIN';
	fullName?: string | null;
}

export interface Product {
	id: number;
	name: string;
	description?: string;
	price: number;
	discountPrice?: number;
	imageUrl: string;
	images?: string[];
	category?: any;
	categoryId?: number;
	stock?: number;
	rating?: number;
	sold?: number;
	variants?: ProductVariant[];
	// Thêm các trường cho đồng bộ với web
	mainImage?: string;
	basePrice?: number;
}

export interface ProductVariant {
	id: number;
	sku: string;
	price: number;
	stock: number;
	variantValues?: VariantValue[];
}

export interface VariantValue {
	id: number;
	value: string;
	attributeName?: string;
}

export interface CartItem {
	id: number;
	productId: number;
	productName: string;
	productImage: string;
	price: number;
	quantity: number;
	subtotal: number;
	productVariantId?: number;
	shopId?: number;
	shopName?: string;
}

export interface Cart {
	items: CartItem[];
	totalAmount: number;
	totalItems: number;
}

export interface Category {
	id: number;
	name: string;
	description?: string;
	imageUrl?: string;
	icon?: string;
}

export interface Order {
	id: number;
	userId: number;
	totalAmount: number;
	status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
	createdAt: string;
	items: OrderItem[];
}

export interface OrderItem {
	id: number;
	productId: number;
	productName: string;
	productImage: string;
	price: number;
	quantity: number;
	subtotal: number;
}

export interface AuthResponse {
	accessToken: string;
	refreshToken?: string;
	user: User;
	expiresIn?: number;
	tokenType?: string;
}

export interface LoginCredentials {
	username: string;
	password: string;
}

export interface RegisterData {
	contact: string;
	username: string;
	password: string;
	confirmPassword: string;
}

export interface ForgotPasswordStep1 {
	contact: string;
}

export interface ForgotPasswordStep2 {
	contact: string;
	otp: string;
}

export interface ForgotPasswordStep3 {
	contact: string;
	otp: string;
	newPassword: string;
	confirmNewPassword: string;
}
