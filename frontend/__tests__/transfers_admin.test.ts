import { describe, it, expect } from 'vitest';
import { GET, PATCH } from '../app/api/v1/transfers/route';

describe('Admin Bank Transfer Validation API & Workflow', () => {
  it('GET /api/v1/transfers returns list of pending and processed bank transfers', async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.transfers)).toBe(true);
    expect(data.transfers.length).toBeGreaterThan(0);

    const pendingItem = data.transfers.find((t: any) => t.id === 'TRF-1001');
    expect(pendingItem).toBeDefined();
    expect(pendingItem.amount).toBe(4.50);
    expect(pendingItem.bank_name).toBe('Banco Pichincha');
    expect(pendingItem.reference_number).toBe('COMP-887412');
  });

  it('PATCH /api/v1/transfers approves a pending transfer', async () => {
    const request = new Request('http://localhost:3000/api/v1/transfers', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transfer_id: 'TRF-1001',
        action: 'approve',
      }),
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.transfer.status).toBe('approved');
    expect(data.message).toContain('aprobada exitosamente');
  });

  it('PATCH /api/v1/transfers rejects an invalid transfer', async () => {
    const request = new Request('http://localhost:3000/api/v1/transfers', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transfer_id: 'TRF-1002',
        action: 'reject',
      }),
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.transfer.status).toBe('rejected');
  });
});
