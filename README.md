1) Project Overview

A small e-commerce application built with React Native (CLI) and TypeScript implementing product listing, cart management, and barcode scanning. The app uses AsyncStorage for local persistence (cart + secure tokens) due to dependency conflicts with react-native-mmkv.

This README documents: setup, features, how pagination works with the provided API, and how persistence is handled using AsyncStorage.

2) Tech Stack

React Native CLI (NOT Expo)

TypeScript

Zustand for state management (no Redux used)

@react-native-async-storage/async-storage for local persistence

@react-native-google-signin/google-signin for Google OAuth

react-native-fast-image for lazy image loading

react-native-vision-camera v4 + Code Scanner plugin for barcode scanning

react-native-keychain for secure token storage

Android (primary target for APK)

3) Features Implemented

Authentication: Google Sign-In (OAuth 2.0) + secure token storage and logout

Products Listing: Grid (2 columns), optimized FlatList (getItemLayout, removeClippedSubviews, maxToRenderPerBatch), search with debounce, quick add/remove to cart and wishlist, infinite scroll (pagination), pull-to-refresh, floating cart button with badge, loading & error states

Product Details: image carousel, product info, quantity selector, add/update cart, share product

Cart: item list, quantity controls, remove item, price breakdown, checkout button, empty state, cart persistence using AsyncStorage

Barcode Scanner: real-time scanning via react-native-vision-camera + Code Scanner plugin (EAN-13, UPC-A, QR, Code-128), camera permissions, flashlight toggle, manual barcode entry, match barcode → product details

4) API (Provided)
    Endpoint: https://catalog-management-system-dev-ak3ogf6zea-uc.a.run.app/cms/product/v2/filter/product
    Request Body example (pagination):
    {
        "page": "1",
        "pageSize": "10",
        "sort": { "creationDateSortOption": "DESC" }
    }

    Important notes:
        Products are returned in data.data[].
        variants[].barcodes[] contains barcode strings.
        variants[].images may be null — use placeholders when null.
        Implement pagination by changing the page parameter.

6) Prerequisites
    Node.js (16+ recommended)
    Yarn or npm
    Android Studio + Android SDK
    Java JDK 11
    React Native CLI environment (follow React Native official docs)
    
7) Setup & Run (Development)
   git clone https://github.com/Arungowda2622/pallet.git
   cd pallet
   npm install --legacy-peer-deps

   Android build:
    npx react-native run-android

8) Cart Persistence (AsyncStorage Implementation)
   Because of a dependency conflict with react-native-mmkv, AsyncStorage was used instead for persistence.

9) Barcode Scanner Integration
    Implemented using react-native-vision-camera v4.
    Supports EAN-13, UPC-A, QR, and Code-128 formats.
    Handles permissions, flashlight toggle, and manual entry.

10) FlatList Optimization 
    getItemLayout used for faster scroll performance
    maxToRenderPerBatch and initialNumToRender tuned for performance
    removeClippedSubviews enabled
    Debounced search input prevents excessive API calls

11) Download APK 
    https://github.com/Arungowda2622/pallet/blame/main/apk/app-release.apk

12) Screenshots 
    Login Screen -> assests/Login_Page_Screen_shot.jpg
    Products List -> assests/Home_Screen_Shoot.jpg
    Products List Pagination Loader -> assests/Pagination_Loader_Screen_Shoot.jpg
    Bar Code 
     Scan -> assests/Scan_BarCode_ScreenShoot.jpg
     Manual -> assests/Manual_BarCode_Screen_Sgoot.jpg
