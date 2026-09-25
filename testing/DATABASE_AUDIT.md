# DATABASE AUDIT

## Overview
The application uses MongoDB, structured using Mongoose ORM.

## Schemas & Relationships
- **User**: Standard fields. `passwordHash` is excluded from standard API responses.
- **Product**: Contains `price`, `stock`, `category` reference.
- **Order / Sales**: References `User` and `Product`. Payment status tracks Razorpay outcomes.

## Findings
- **Data Integrity**: Relationships use valid `ObjectId` references.
- **Indexes**: The `name`, `email`, and `mobile` fields in `User` should be explicitly indexed if not already to speed up admin search queries.
- **Concurrent Updates**: Stock decrement logic during order creation is straightforward. In a highly concurrent scenario (e.g., flash sales), this might suffer from race conditions unless `$inc` and optimistic concurrency control are strictly used. Currently acceptable for regular traffic.

## Orphaned Records
Handled correctly. The `DeletedUser` collection pattern retains data integrity for historical sales while anonymizing active systems.

**STATUS: OK — No action required for current scale.**
