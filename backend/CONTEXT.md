# Bill State Management Implementation Plan

## Tasks

- [ ] Update createBill controller to add initial audit entry
- [ ] Implement PATCH /api/:rid/bills/:id endpoint for editing draft bills
- [ ] Implement PATCH /api/:rid/bills/:id/finalize endpoint
- [ ] Update updatePaymentStatus controller to check bill status
- [ ] Add route handlers for new endpoints
- [ ] Implement audit trail recording for edits
- [ ] Add validation to prevent editing finalized bills
- [ ] Server-side recalculation during finalization
- [ ] Test cases for all scenarios

## Implementation Notes

1. **createBill update**:

   - Add initial audit entry: `{ by: staffAlias, action: 'created', at: new Date() }`

2. **Edit endpoint**:

   - Only allow when status === 'draft'
   - Record audit entry with:
     - by: staffAlias
     - action: 'updated'
     - delta: changed fields
     - at: new Date()

3. **Finalize endpoint**:

   - Set status: 'finalized'
   - Recalculate totals server-side
   - Add audit entry: `{ by: staffAlias, action: 'finalized' }`
   - Set finalizedAt timestamp

4. **Payment status update**:
   - Reject if status !== 'finalized' (unless admin override)
