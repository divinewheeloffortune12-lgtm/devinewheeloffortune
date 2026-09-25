# API AUDIT

## Overview
The REST API is structured conventionally using Express Router.

## API Categories

### Authentication (`/api/auth`, `/api/admin/auth`)
- **Validation**: Handled in the controller.
- **Security**: Returns JWTs. Does not return password hashes.
- **Status**: OK.

### Products (`/api/products`)
- **Access**: Public.
- **Features**: Pagination, text search (regex), sorting.
- **Status**: OK. Recently updated to default sorting to `price-desc`.

### Orders & Cart (`/api/orders`, `/api/cart`)
- **Access**: Protected (User).
- **Validation**: Verifies cart totals on the backend before initiating Razorpay.
- **Status**: OK.

### Admin Dashboard (`/api/admin/*`)
- **Access**: Protected (Admin only).
- **Functionality**: Full CRUD on Users, Products, Categories, Orders.
- **Status**: OK. Routes successfully validate the `req.admin` flag.

## Error Handling
APIs catch async errors and forward them to a global error handler using `next(error)`. No stack traces are leaked to the client in production mode.
