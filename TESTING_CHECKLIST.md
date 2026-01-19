# MotoGo RD - End-to-End Testing Checklist

## 🧪 Testing Guide

Follow this checklist to test all features of the app. Report any bugs or issues you find.

---

## 1. Customer Registration & Login ✅

### Test Customer Account Creation
- [ ] Go to `/login` page
- [ ] Click "Sign up" or "Registrarse"
- [ ] Verify role selection appears at the top (two boxes: Customer | Driver)
- [ ] Select "Customer" box
- [ ] Fill in:
  - First Name: `Test`
  - Last Name: `Customer`
  - Email: `testcustomer@example.com`
  - Password: `password123`
- [ ] Click "Register" / "Registrarse"
- [ ] Verify: Redirects to home page
- [ ] Verify: Shows booking interface (not driver dashboard)

### Test Customer Login
- [ ] Log out
- [ ] Log in with `testcustomer@example.com` / `password123`
- [ ] Verify: Successfully logs in
- [ ] Verify: Shows customer home page

---

## 2. Driver Registration & Login ✅

### Test Driver Account Creation
- [ ] Go to `/login` page
- [ ] Click "Sign up"
- [ ] Select "Driver" box (not Customer)
- [ ] Fill in:
  - First Name: `Test`
  - Last Name: `Driver`
  - Email: `testdriver@example.com`
  - Password: `password123`
- [ ] Click "Register"
- [ ] Verify: Redirects to home page
- [ ] Verify: Shows driver welcome screen with "Go to Driver Dashboard" button

### Test Driver Login
- [ ] Log out
- [ ] Log in with `testdriver@example.com` / `password123`
- [ ] Verify: Successfully logs in
- [ ] Verify: Shows driver welcome screen
- [ ] Click "Go to Driver Dashboard"
- [ ] Verify: Driver dashboard loads

### Test Pre-seeded Driver Accounts
- [ ] Log in with `juan@motogo.com` / `password123`
- [ ] Verify: Driver dashboard appears
- [ ] Verify: Can see pending orders (if any)

---

## 3. Order Creation (Customer) 📦

### Test Each Service Type
For each service type (Ride, Food, Courier, Errands):

- [ ] Select service type on home page
- [ ] Enter destination address (e.g., "Santo Domingo, Dominican Republic")
- [ ] Click "Next" / "Continuar"
- [ ] Verify: Redirects to booking page (`/booking/{service-type}`)
- [ ] Verify: Map shows pickup and dropoff locations
- [ ] Verify: Price estimation appears
- [ ] Fill in optional details/notes
- [ ] Click "Confirm Order" / "Confirmar Orden"
- [ ] Verify: Order is created
- [ ] Verify: Redirects to order tracking page (`/track/{order-id}`)

### Test Order Details
- [ ] Verify: Order status shows "Finding driver..." / "Buscando conductor..."
- [ ] Verify: Order details are correct (pickup, dropoff, price, service type)
- [ ] Verify: Map shows order locations

---

## 4. Driver Order Management 🏍️

### Test Viewing Pending Orders
- [ ] Log in as driver (`testdriver@example.com` or `juan@motogo.com`)
- [ ] Go to Driver Dashboard (`/driver`)
- [ ] Verify: Can see pending orders (if customer created any)
- [ ] Verify: Order details are visible (pickup, dropoff, service type, price)

### Test Accepting Orders
- [ ] Click "Accept Order" / "Aceptar Orden" on a pending order
- [ ] Verify: Order status changes to "accepted"
- [ ] Verify: Order appears in "Active Order" section
- [ ] Verify: Customer's order tracking page updates (check in another browser/incognito)

### Test Order Status Updates
- [ ] With an accepted order, click "Start Trip" / "Iniciar Viaje"
- [ ] Verify: Order status changes to "in_progress"
- [ ] Verify: Customer sees "Ride in progress" / "Viaje en curso"
- [ ] Click "Complete Trip" / "Completar Viaje"
- [ ] Verify: Order status changes to "completed"
- [ ] Verify: Driver is redirected to history page
- [ ] Verify: Customer sees "Completed" / "Completado"

---

## 5. Order Tracking (Customer) 📍

### Test Real-time Updates
- [ ] As customer, create an order
- [ ] Stay on tracking page
- [ ] As driver (in another browser), accept the order
- [ ] Verify: Customer page updates to show "Driver on the way" / "Conductor en camino"
- [ ] Verify: Driver information appears (name, etc.)

### Test Order History
- [ ] Go to History page (`/history`)
- [ ] Verify: All past orders are listed
- [ ] Verify: Order statuses are correct
- [ ] Verify: Can click on orders to view details

---

## 6. Order Cancellation ❌

### Test Customer Cancellation
- [ ] As customer, create an order
- [ ] On tracking page, verify "Cancel Order" button appears (for pending orders)
- [ ] Click "Cancel Order" / "Cancelar Orden"
- [ ] Verify: Order status changes to "cancelled"
- [ ] Verify: Redirects to history page
- [ ] Verify: Order appears in history as "Cancelled"

### Test Cancellation Restrictions
- [ ] Try to cancel an order that's already accepted (should not be possible)
- [ ] Verify: Cancel button doesn't appear for non-pending orders

---

## 7. Navigation & UI 🧭

### Test Sidebar Navigation
- [ ] Verify: "Home" / "Inicio" link works
- [ ] Verify: "History" / "Historial" link works
- [ ] Verify: "Profile" / "Perfil" link works (when logged in)
- [ ] Verify: "Login" / "Iniciar Sesión" appears when not logged in
- [ ] Verify: "Driver Dashboard" appears only for drivers

### Test Bottom Navigation (Mobile)
- [ ] Resize browser to mobile view
- [ ] Verify: Bottom navigation appears
- [ ] Verify: All links work correctly
- [ ] Verify: Active page is highlighted

### Test Language Toggle
- [ ] Click language toggle (ES/EN)
- [ ] Verify: All text changes language
- [ ] Verify: Language persists on page refresh

### Test Theme Toggle
- [ ] Click theme toggle (sun/moon icon)
- [ ] Verify: Theme changes (light/dark)
- [ ] Verify: Theme persists on page refresh

---

## 8. Profile & Settings 👤

### Test Profile Page
- [ ] Go to Profile page
- [ ] Verify: User information displays correctly
- [ ] Verify: Email, name, role are shown
- [ ] Verify: Logout button works

### Test Logout
- [ ] Click logout
- [ ] Verify: Redirects to login page
- [ ] Verify: Cannot access protected pages after logout

---

## 9. Edge Cases & Error Handling ⚠️

### Test Invalid Inputs
- [ ] Try to create order without selecting service (button should be disabled)
- [ ] Try to register with existing email (should show error)
- [ ] Try to login with wrong password (should show error)
- [ ] Try to access driver dashboard as customer (should show access denied or redirect)

### Test Empty States
- [ ] As new driver, verify: "No pending orders" message appears
- [ ] As new customer, verify: "No orders yet" in history

### Test Network Errors
- [ ] Disconnect internet
- [ ] Try to create order
- [ ] Verify: Error message appears (if implemented)

---

## 10. Mobile Responsiveness 📱

### Test Mobile View
- [ ] Resize browser to mobile size (375px width)
- [ ] Verify: Layout adapts correctly
- [ ] Verify: Bottom navigation appears
- [ ] Verify: Sidebar is hidden on mobile
- [ ] Verify: All buttons are touch-friendly
- [ ] Verify: Forms are usable on mobile

---

## 🐛 Bug Report Template

If you find any bugs, note:
1. **What you were doing**: (e.g., "Creating an order as customer")
2. **What happened**: (e.g., "Button didn't work")
3. **What you expected**: (e.g., "Order should be created")
4. **Browser/Device**: (e.g., "Chrome on Mac")
5. **Screenshot**: (if possible)

---

## ✅ Completion

Once all tests pass, the app is ready for:
- [ ] User acceptance testing
- [ ] Beta launch
- [ ] Production deployment

