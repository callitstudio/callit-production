# Complete Payment Testing Guide - PayFast Pakistan Integration

## 🎯 Full End-to-End Testing

This guide walks you through testing the complete ticket purchase and payment flow.

---

## 📝 Step-by-Step Test Instructions

### **Step 1: Access Ticket Booking Page**
1. Go to http://localhost:3000/ticketinfo
2. You should see the event ticket selection page with three days of tickets

### **Step 2: Select Tickets**
1. Click on **"Day 1"** to expand the ticket options
2. Select tickets:
   - Add **2 VIP tickets** (PKR 2,500 each = PKR 5,000)
   - Add **1 Gold ticket** (PKR 1,500 = PKR 1,500)
3. Total so far: **PKR 6,500**
4. Expand **"Day 2"** and add:
   - Add **1 VIP ticket** (PKR 5,000)
5. **Total: PKR 11,500**

✅ **Verify**: Price updates dynamically as you add tickets

### **Step 3: Enter Account Information**
1. In the "Account Information" section, enter:
   - **Name**: `Test User`
   - **Phone**: `+923013849333`

### **Step 4: Enter Ticket Holder Names**
1. For each ticket, enter the ticket holder's name:
   - VIP Ticket 1 (Day 1): `John Doe`
   - VIP Ticket 2 (Day 1): `Jane Smith`
   - Gold Ticket (Day 1): `Ahmed Khan`
   - VIP Ticket (Day 2): `Ali Hassan`

✅ **Verify**: All 4 tickets show with their respective names

### **Step 5: Click "Proceed to Payment"**
1. Click the **"Proceed to Payment (PKR 11,500)"** button
2. Check **Browser Console (F12 > Console)** and watch for these logs:

```
Creating order...
Order created: {orderId: "ORD-XXXXXX", ...}
Getting PayFast token for order: ORD-XXXXXX Amount: 11500
PayFast token received: {token: "XXXXXX", ...}
Initializing PayFast payment with token...
PayFast payment initialized: {checkoutUrl: "https://ipg.apps.net.pk/...", formData: {...}}
Form element created with 16 inputs
✅ SUBMITTING FORM TO PAYFAST...
Redirecting to PayFast payment gateway...
```

---

## 🚀 PayFast Payment Flow

### **What Happens Behind the Scenes:**

```
Frontend (User)
    ↓
[1] POST /api/orders/create
    → Order created with orderId
    ↓
[2] POST /api/payfast/get-token
    → Backend calls PayFast GetAccessToken
    → Gets ACCESS_TOKEN
    ↓
[3] POST /api/payfast/redirect
    → Prepares form data with ACCESS_TOKEN
    ↓
[4] Form Auto-Submits to PayFast
    POST https://ipg.apps.net.pk/Ecommerce/api/Transaction/PostTransaction
    → User redirected to PayFast payment gateway
    ↓
[5] User Completes Payment
    → PayFast processes transaction
    ↓
[6] Redirect to Success or Cancel Page
    → SUCCESS_URL: http://localhost:3000/success
    → FAILURE_URL: http://localhost:3000/cancel
```

---

## ✅ Expected Success Flow

### **Step 1: Form Submits**
- Hidden form with all PayFast fields auto-submits
- You're redirected to PayFast payment gateway

### **Step 2: PayFast Portal**
- You see PayFast's payment page
- Options to pay via:
  - Credit/Debit Card
  - Bank Transfer
  - Mobile Wallet
  - etc.

### **Step 3: Complete Payment**
- Enter payment details (use test card if available)
- PayFast processes the transaction

### **Step 4: Success Page**
- You're redirected to: **http://localhost:3000/success**
- Should display:
  - ✅ "Payment Successful!" message
  - Order details (Order ID, Transaction ID, Amount)
  - Green success card
  - Options to:
    - "Back to Home"
    - "Download Receipt"

---

## ❌ Expected Cancel Flow

### **If Payment is Cancelled:**
- User clicks "Cancel" on PayFast portal
- Redirected to: **http://localhost:3000/cancel**
- Should display:
  - ⚠️ "Payment Cancelled" message
  - Order details
  - Red alert card
  - Options to:
    - "Try Again" (goes back to ticket booking)
    - "Back to Home"

---

## 📊 Complete Form Data Sent to PayFast

When form submits, PayFast receives:

```
MERCHANT_ID: 243483
MERCHANT_NAME: Call It Events
ACCESS_TOKEN: [token from PayFast]
TXNAMT: 11500
BASKET_ID: ORD-XXXXXX
CURRENCY_CODE: PKR
PROCCODE: 00
ORDER_DATE: 2025-11-28
TXNDESC: Event Tickets - ORD-XXXXXX
CUSTOMER_EMAIL_ADDRESS: customer@example.com
CUSTOMER_MOBILE_NO: +923013849333
SUCCESS_URL: http://localhost:3000/success
FAILURE_URL: http://localhost:3000/cancel
CHECKOUT_URL: http://localhost:5000/api/payfast/callback
SIGNATURE: [random string]
VERSION: MERCHANT-CART-0.1
```

---

## 🔍 Console Logs to Verify

Open **F12 > Console** and look for:

### **Order Creation**
```javascript
Creating order... {userName: "Test User", userPhone: "+923013849333", ...}
Order created: {message: "Order created successfully", order: {orderId: "ORD-..."}}
```

### **Token Request**
```javascript
Getting PayFast token for order: ORD-XXXX Amount: 11500
PayFast token response: {success: true, token: "XXXXXX", ...}
```

### **Payment Initialization**
```javascript
Initializing PayFast payment with token for order: ORD-XXXX
PayFast payment initialized: {checkoutUrl: "https://...", formData: {...}}
```

### **Form Submission**
```javascript
PayFast Form Data Debug
=== Form Fields ===
MERCHANT_ID: 243483
MERCHANT_NAME: Call It Events
ACCESS_TOKEN: [token]
... (all fields)
✅ SUBMITTING FORM TO PAYFAST...
Redirecting to PayFast payment gateway...
```

---

## ✨ Success Page Features

After successful payment, you'll see:

- ✅ **Large Success Checkmark Icon**
- 🎉 **"Payment Successful!" heading**
- 📋 **Order Details**:
  - Order ID
  - Transaction ID
  - Amount Paid (PKR)
  - Date & Time
- 📧 **Email Confirmation Notice**
- 🎫 **Additional Info Cards**:
  - Your Tickets
  - Confirmation Email
  - Ready to Go
- **Action Buttons**:
  - Back to Home
  - Download Receipt

---

## 🔄 Cancel Page Features

If payment is cancelled, you'll see:

- ⚠️ **Alert Icon**
- 🚫 **"Payment Cancelled" heading**
- 📋 **Transaction Details**:
  - Order ID
  - Cancellation Reason
  - Date & Time
- 💡 **What Happens Next Info**
- 📝 **Common Reasons for Cancellation**
- **Action Buttons**:
  - Try Again (back to booking)
  - Back to Home

---

## 🧪 Test Scenarios

### **Scenario 1: Successful Payment**
1. Select tickets
2. Enter user info
3. Enter ticket holder names
4. Proceed to payment
5. Complete payment on PayFast
6. **Expect**: Redirected to success page ✅

### **Scenario 2: Cancel Payment**
1. Select tickets
2. Enter user info
3. Enter ticket holder names
4. Proceed to payment
5. Click "Cancel" on PayFast
6. **Expect**: Redirected to cancel page ❌

### **Scenario 3: Missing Information**
1. Try to proceed without entering name
2. **Expect**: Alert message "Please enter your name"
3. Try to proceed without entering phone
4. **Expect**: Alert message "Please enter your phone number"
5. Try to proceed without entering ticket holder names
6. **Expect**: Alert message "Please fill in names for all ticket holders"

---

## 📱 Mobile Responsiveness

Test on different devices:
- ✅ Desktop (1920x1080)
- ✅ Tablet (768x1024)
- ✅ Mobile (375x667)

All elements should be properly styled and accessible.

---

## 🎯 What to Verify

- [ ] Ticket selection works
- [ ] Price updates dynamically
- [ ] Order summary displays correctly
- [ ] Form validation works
- [ ] Order created successfully
- [ ] PayFast token received
- [ ] Form submits to PayFast
- [ ] Success page displays after payment
- [ ] Cancel page displays if cancelled
- [ ] All form data correct
- [ ] No console errors
- [ ] Responsive on mobile

---

## 🚀 Ready to Test!

Everything is set up. You can now test the complete payment flow end-to-end!

Good luck! 🎉
