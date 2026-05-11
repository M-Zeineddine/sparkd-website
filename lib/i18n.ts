"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import React from "react";

export type Language = "en" | "ar";

export const translations = {
  en: {
    // Nav
    home: "Home",
    shop: "Shop",
    cart: "Cart",
    admin: "Admin",
    toggleLang: "عربي",
    searchPlaceholder: "Search designs...",
    searchResultsFor: "results for",
    clearSearch: "Clear",

    // Hero
    tagline: "Light It Your Way",
    heroSubtitle: "Custom lighters, designed to match your vibe — shipped ready to spark.",
    shopNow: "Shop Now",
    exploreCollections: "Explore Collections",

    // Product
    addToCart: "Add to Cart",
    addedToCart: "Added!",
    price: "$4.00",
    inStock: "In Stock",
    viewProduct: "View Lighter",
    productDescription: "Description",
    category: "Collection",
    tags: "Tags",

    // Collections
    collections: "Collections",
    allCollections: "All",
    featuredProducts: "Featured Lighters",
    newArrivals: "New Arrivals",

    // Cart
    yourCart: "Your Cart",
    emptyCart: "Your cart is empty",
    emptyCartSub: "Add some fire lighters to your cart",
    continueShopping: "Continue Shopping",
    subtotal: "Subtotal",
    checkout: "Checkout",
    remove: "Remove",
    total: "Total",
    quantity: "Qty",
    itemsInCart: "lighters in cart",

    // Checkout
    checkoutTitle: "Complete Your Order",
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email Address",
    phone: "Phone Number",
    address: "Full Delivery Address",
    city: "City",
    buildingDetails: "Building / Floor / Apartment",
    notes: "Order Notes (optional)",
    placeOrder: "Place Order",
    cod: "Cash on Delivery",
    codNote: "Pay when your lighter arrives at your door — no card needed.",
    orderSummary: "Order Summary",
    processing: "Processing...",

    // Confirmation
    orderConfirmed: "Order Confirmed!",
    orderConfirmedSub: "Thank you for your order. We'll reach out shortly to confirm delivery.",
    orderNumber: "Order #",
    backToShop: "Back to Shop",

    // Errors
    required: "This field is required",
    invalidEmail: "Enter a valid email",
    invalidPhone: "Enter a valid phone number",
    cartEmpty: "Your cart is empty",

    // Footer
    footerTagline: "Light It Your Way",
    allRights: "All rights reserved",
    madeIn: "Made in Lebanon",

    // How it works
    howItWorks: "How It Works",
    step1Title: "Pick Your Design",
    step1Desc: "Browse 9 collections and find the lighter that speaks to you",
    step2Title: "We Build It",
    step2Desc: "Your lighter is wrapped, inspected, and packed with care",
    step3Title: "Light It Your Way",
    step3Desc: "Delivered to your door, ready to spark right out of the box",

    // Admin
    adminLogin: "Admin Login",
    password: "Password",
    login: "Login",
    wrongPassword: "Incorrect password",
    orders: "Orders",
    products: "Products",
    logout: "Logout",
    orderNum: "Order #",
    date: "Date",
    customer: "Customer",
    phoneCol: "Phone",
    addressCol: "Address",
    items: "Items",
    totalCol: "Total",
    status: "Status",
    updateStatus: "Update Status",
    pending: "Pending",
    confirmed: "Confirmed",
    delivered: "Delivered",
    cancelled: "Cancelled",
    addProduct: "Add Product",
    editProduct: "Edit Product",
    deleteProduct: "Delete Product",
    productName: "Product Name",
    productNameAr: "Product Name (Arabic)",
    productDesc: "Description",
    productDescAr: "Description (Arabic)",
    productPrice: "Price",
    productCategory: "Category",
    productTags: "Tags (comma separated)",
    productImage: "Product Image",
    save: "Save",
    cancel: "Cancel",
    confirmDelete: "Are you sure you want to delete this product?",
    noOrders: "No orders yet",
    noProducts: "No products yet",
    loading: "Loading...",
    error: "Something went wrong",
  },
  ar: {
    // Nav
    home: "الرئيسية",
    shop: "المتجر",
    cart: "السلة",
    admin: "الإدارة",
    toggleLang: "English",
    searchPlaceholder: "ابحث عن تصاميم...",
    searchResultsFor: "نتيجة لـ",
    clearSearch: "مسح",

    // Hero
    tagline: "أشعلها بطريقتك",
    heroSubtitle: "ولاعات مخصصة، مصممة تبع ذوقك — توصل جاهزة تشتعل.",
    shopNow: "تسوق الآن",
    exploreCollections: "استكشف المجموعات",

    // Product
    addToCart: "أضف للسلة",
    addedToCart: "تمت الإضافة!",
    price: "4.00$",
    inStock: "متوفر",
    viewProduct: "عرض الولاعة",
    productDescription: "الوصف",
    category: "المجموعة",
    tags: "الوسوم",

    // Collections
    collections: "المجموعات",
    allCollections: "الكل",
    featuredProducts: "ولاعات مميزة",
    newArrivals: "وصل حديثاً",

    // Cart
    yourCart: "سلتك",
    emptyCart: "سلتك فارغة",
    emptyCartSub: "أضف بعض الولاعات الرهيبة",
    continueShopping: "تابع التسوق",
    subtotal: "المجموع الفرعي",
    checkout: "إتمام الطلب",
    remove: "حذف",
    total: "الإجمالي",
    quantity: "الكمية",
    itemsInCart: "ولاعات في السلة",

    // Checkout
    checkoutTitle: "أكمل طلبك",
    firstName: "الاسم الأول",
    lastName: "اسم العائلة",
    email: "البريد الإلكتروني",
    phone: "رقم الهاتف",
    address: "عنوان التوصيل الكامل",
    city: "المدينة",
    buildingDetails: "المبنى / الطابق / الشقة",
    notes: "ملاحظات الطلب (اختياري)",
    placeOrder: "تأكيد الطلب",
    cod: "الدفع عند الاستلام",
    codNote: "ادفع لما تجيك ولاعتك عالباب — لا حاجة لبطاقة.",
    orderSummary: "ملخص الطلب",
    processing: "جاري المعالجة...",

    // Confirmation
    orderConfirmed: "تم تأكيد طلبك!",
    orderConfirmedSub: "شكراً لطلبك. سنتواصل معك قريباً لتأكيد التوصيل.",
    orderNumber: "رقم الطلب #",
    backToShop: "العودة للمتجر",

    // Errors
    required: "هذا الحقل مطلوب",
    invalidEmail: "أدخل بريداً إلكترونياً صحيحاً",
    invalidPhone: "أدخل رقم هاتف صحيحاً",
    cartEmpty: "سلتك فارغة",

    // Footer
    footerTagline: "أشعلها بطريقتك",
    allRights: "جميع الحقوق محفوظة",
    madeIn: "صنع في لبنان",

    // How it works
    howItWorks: "كيف يعمل",
    step1Title: "اختر تصميمك",
    step1Desc: "تصفح 9 مجموعات وجد الولاعة اللي تعبّر عنك",
    step2Title: "نحضّرها إلك",
    step2Desc: "ولاعتك تتسوّى وتتفحّص وتتحزم بعناية",
    step3Title: "أشعلها بطريقتك",
    step3Desc: "توصل عالباب جاهزة تنشتعل من أول لحظة",

    // Admin
    adminLogin: "تسجيل دخول المسؤول",
    password: "كلمة المرور",
    login: "دخول",
    wrongPassword: "كلمة المرور غير صحيحة",
    orders: "الطلبات",
    products: "المنتجات",
    logout: "تسجيل الخروج",
    orderNum: "رقم الطلب",
    date: "التاريخ",
    customer: "العميل",
    phoneCol: "الهاتف",
    addressCol: "العنوان",
    items: "المنتجات",
    totalCol: "الإجمالي",
    status: "الحالة",
    updateStatus: "تحديث الحالة",
    pending: "قيد الانتظار",
    confirmed: "مؤكد",
    delivered: "تم التوصيل",
    cancelled: "ملغى",
    addProduct: "إضافة منتج",
    editProduct: "تعديل المنتج",
    deleteProduct: "حذف المنتج",
    productName: "اسم المنتج",
    productNameAr: "اسم المنتج (عربي)",
    productDesc: "الوصف",
    productDescAr: "الوصف (عربي)",
    productPrice: "السعر",
    productCategory: "المجموعة",
    productTags: "الوسوم (مفصولة بفواصل)",
    productImage: "صورة المنتج",
    save: "حفظ",
    cancel: "إلغاء",
    confirmDelete: "هل أنت متأكد من حذف هذا المنتج؟",
    noOrders: "لا توجد طلبات بعد",
    noProducts: "لا توجد منتجات بعد",
    loading: "جاري التحميل...",
    error: "حدث خطأ ما",
  },
};

export type TranslationKey = keyof typeof translations.en;

interface LangContextType {
  lang: Language;
  t: (key: TranslationKey) => string;
  toggleLang: () => void;
  isRTL: boolean;
}

const LangContext = createContext<LangContextType>({
  lang: "en",
  t: (key) => key,
  toggleLang: () => {},
  isRTL: false,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("sparkd-lang") as Language | null;
    if (saved === "ar" || saved === "en") {
      setLang(saved);
    }
  }, []);

  useEffect(() => {
    const dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", lang);
    localStorage.setItem("sparkd-lang", lang);
  }, [lang]);

  const toggleLang = () => setLang((l) => (l === "en" ? "ar" : "en"));
  const t = (key: TranslationKey) => translations[lang][key] ?? key;
  const isRTL = lang === "ar";

  return React.createElement(LangContext.Provider, { value: { lang, t, toggleLang, isRTL } }, children);
}

export function useLang() {
  return useContext(LangContext);
}
