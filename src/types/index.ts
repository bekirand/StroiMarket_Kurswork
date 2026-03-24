/**
 * Типы TypeScript для всего проекта СтройМаркет
 * ВАЖНО: Значения enum должны совпадать с prisma/schema.prisma
 */

// ===== РОЛИ ПОЛЬЗОВАТЕЛЕЙ (совпадают с Prisma enum UserRole) =====
export type UserRole = 'CUSTOMER' | 'MANAGER' | 'ADMIN';

// ===== СТАТУСЫ ЗАКАЗА (совпадают с Prisma enum OrderStatus) =====
export type OrderStatus =
    | 'NOVIY'        // Новый
    | 'PODTVERZHDEN' // Подтверждён
    | 'V_OBRABOTKE'  // В обработке
    | 'OTPRAVLEN'    // Отправлен
    | 'DOSTAVLEN'    // Доставлен
    | 'OTMENEN';     // Отменён

// Человекочитаемые названия статусов заказа (для отображения)
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
    NOVIY: 'Новый',
    PODTVERZHDEN: 'Подтверждён',
    V_OBRABOTKE: 'В обработке',
    OTPRAVLEN: 'Отправлен',
    DOSTAVLEN: 'Доставлен',
    OTMENEN: 'Отменён',
};

// Цвет бейджа для каждого статуса
export const ORDER_STATUS_COLORS: Record<OrderStatus, 'blue' | 'yellow' | 'orange' | 'purple' | 'green' | 'red'> = {
    NOVIY: 'blue',
    PODTVERZHDEN: 'yellow',
    V_OBRABOTKE: 'orange',
    OTPRAVLEN: 'purple',
    DOSTAVLEN: 'green',
    OTMENEN: 'red',
};

// ===== ТИП ДОСТАВКИ (совпадает с Prisma enum DeliveryType) =====
export type DeliveryType = 'ADDRESS' | 'PICKUP';

// ===== СТАТУС ЗАЯВЛЕНИЯ (совпадает с Prisma enum RequestStatus) =====
export type RequestStatus = 'NOVAYA' | 'RASSMOTRENA';

// ===== ПОЛЬЗОВАТЕЛЬ =====
export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}

// ===== КАТЕГОРИЯ ТОВАРА =====
export interface Category {
    id: string;
    name: string;
    slug: string;
    image?: string | null;
    _count?: { products: number };
}

// ===== ТОВАР =====
export interface Product {
    id: string;
    sku: string;
    name: string;
    description: string;
    price: number;
    images: string[];
    categoryId: string;
    category?: Category;
    unit: string;
    purchaseUnit: string;
    stockQuantity: number;
    discount: number;         // 0 = нет скидки
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// ===== ПОЗИЦИЯ В ЗАКАЗЕ =====
export interface OrderItem {
    id: string;
    orderId: string;
    productId: string;
    product?: Product;
    quantity: number;
    price: number;            // Цена на момент покупки (зафиксирована!)
}

// ===== ЗАКАЗ =====
export interface Order {
    id: string;
    userId: string;
    user?: User;
    status: OrderStatus;
    deliveryType: DeliveryType;
    deliveryAddress?: string | null;
    totalPrice: number;
    items: OrderItem[];
    createdAt: Date;
    updatedAt: Date;
}

// ===== ПОЗИЦИЯ В КОРЗИНЕ =====
export interface CartItem {
    id: string;
    product: Product;
    quantity: number;
}

// ===== ЗАЯВЛЕНИЕ МЕНЕДЖЕРА =====
export interface ManagerRequest {
    id: string;
    fromUserId: string;
    fromUser?: User;
    subject: string;
    message: string;
    attachments: string[];
    reply?: string | null;
    status: RequestStatus;
    createdAt: Date;
    updatedAt: Date;
}

// ===== ДАННЫЕ АНАЛИТИКИ =====
export interface AnalyticsData {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    totalCustomers: number;
    recentOrders: Order[];
    topProducts: (Product & { soldCount: number })[];
    salesByMonth: { month: string; revenue: number; orders: number }[];
}

// ===== ОТВЕТЫ API =====
export interface ApiResponse<T> {
    data?: T;
    error?: string;
    message?: string;
}

// ===== ПАГИНАЦИЯ =====
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// ===== ФИЛЬТРЫ КАТАЛОГА =====
export interface ProductFilters {
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    page?: number;
    limit?: number;
}
