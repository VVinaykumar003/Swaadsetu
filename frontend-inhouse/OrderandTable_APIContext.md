# Table and Order Management - API Documentation

This document provides an overview of the APIs, request/response formats, and methods related to table and order management.

## Table Management

### Table Model (models/table.model.js)

```javascript
{
  restaurantId: String, // Required, indexed
  tableNumber: Number,  // Required, unique per restaurant
  capacity: Number,     // Required, minimum 1
  status: String,       // Enum: ["available", "occupied"], default "available"
  isActive: Boolean,    // Default true
  currentSessionId: String, // Indexed
  sessionExpiresAt: Date,   // TTL for auto-expiry
  staffAlias: String,   // Staff member assigned
  lastUsed: Date,       // Default Date.now
  isDeleted: Boolean,   // Soft-delete flag
  createdAt: Date,      // Default Date.now
  updatedAt: Date       // Default Date.now
}
```

### Table API Endpoints

#### 1. Get All Tables

- **Method**: GET
- **Endpoint**: `/restaurants/:rid/tables`
- **Query Params**:
  - `includeInactive` (Boolean): Include inactive tables
- **Response**: Array of table objects

#### 2. Get Table by ID

- **Method**: GET
- **Endpoint**: `/restaurants/:rid/tables/:id`
- **Response**: Table object

#### 3. Update Table Status (Activate/Deactivate)

- **Method**: PUT
- **Endpoint**: `/restaurants/:rid/tables/:id/status`
- **Body**:
  ```json
  { "isActive": Boolean }
  ```
- **Permissions**: Admin or Staff
- **Response**: Updated table object

#### 4. Assign Session to Table

- **Method**: POST
- **Endpoint**: `/restaurants/:rid/tables/:id/session`
- **Body**:
  ```json
  {
    "sessionId": String,
    "staffAlias": String,
    "ttlMinutes": Number  // Optional, default 30 min
  }
  ```
- **Permissions**: Admin or Staff
- **Response**: Updated table object

#### 5. Create Table

- **Method**: POST
- **Endpoint**: `/restaurants/:rid/tables`
- **Body**:
  ```json
  {
    "tableNumber": Number,
    "capacity": Number
  }
  ```
- **Permissions**: Admin
- **Response**: Created table object (201)

#### 6. Delete Table

- **Method**: DELETE
- **Endpoint**: `/restaurants/:rid/tables/:id`
- **Permissions**: Admin
- **Response**: 204 No Content

#### 7. Update Staff Alias

- **Method**: PUT
- **Endpoint**: `/restaurants/:rid/tables/:id/staff`
- **Body**:
  ```json
  { "staffAlias": String }
  ```
- **Permissions**: Admin or Staff
- **Response**: Updated table object

## Order Management

### Order Model (models/order.model.js)

```javascript
{
  restaurantId: String,     // Required
  tableId: String,          // Required
  sessionId: String,        // Required
  items: [OrderItemSchema], // Array of order items
  totalAmount: Number,      // Required
  status: String,           // Enum: ["placed", "accepted", ...]
  paymentStatus: String,    // Enum: ["unpaid", "paid"]
  isCustomerOrder: Boolean, // Default true
  customerName: String,     // Required
  customerContact: String,
  customerEmail: String,
  isOrderComplete: Boolean, // Default false
  staffAlias: String,
  overrideToken: String,
  version: Number,          // Optimistic locking
  createdAt: Date,          // Default Date.now
  updatedAt: Date           // Default Date.now
}
```

### Order Item Schema

```javascript
{
  menuItemId: ObjectId,  // Required
  name: String,          // Required
  quantity: Number,      // Required, min 1
  priceAtOrder: Number,  // Required
  notes: String,
  status: String         // Enum: ["placed", "accepted", ...]
}
```

### Order API Endpoints

#### 1. Create Order

- **Method**: POST
- **Endpoint**: `/restaurants/:rid/orders`
- **Headers**:
  - `X-Idempotency-Key`: Optional for duplicate request prevention
- **Body**:
  ```json
  {
    "tableId": String,
    "sessionId": String,
    "items": [{
      "menuItemId": String,
      "quantity": Number
    }],
    "customerName": String,
    "staffAlias": String,       // Optional
    "customerContact": String,  // Optional
    "customerEmail": String     // Optional
  }
  ```
- **Response**:
  ```json
  {
    "order": Order,
    "preBill": {
      "subtotal": Number,
      "taxes": Array,
      "serviceCharge": Number,
      "discount": Number,
      "total": Number
    }
  }
  ```

#### 2. Update Order Status

- **Method**: PUT
- **Endpoint**: `/restaurants/:rid/orders/:id/status`
- **Body**:
  ```json
  {
    "status": String,     // New status
    "staffAlias": String, // Optional
    "version": Number     // Required for optimistic locking
  }
  ```
- **Response**: Updated order object

#### 3. Get Active Orders

- **Method**: GET
- **Endpoint**: `/restaurants/:rid/orders/active`
- **Response**: Array of order objects with status ["placed", "accepted", "preparing"]

#### 4. Get Order History

- **Method**: GET
- **Endpoint**: `/restaurants/:rid/orders/history`
- **Query Params**:
  - `sessionId`: String (required)
- **Response**: Array of completed ("done") order objects

## Key Behaviors

1. Table status automatically updates based on session existence (available/occupied)
2. Order creation includes server-side price validation from menu
3. Order updates use optimistic locking to prevent conflicts
4. Table sessions automatically expire based on TTL
5. All sensitive operations require admin/staff permissions
6. Redis pub/sub used for real-time notifications
