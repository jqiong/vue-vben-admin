export interface Order {
  id: number;
  orderNo: string;
  submitTime: string;
  userUid: string;
  amount: number;
  payType: number;
  orderSource: number;
}

export function getMockOrders(): Order[] {
  return [
    {
      id: 1,
      orderNo: 'ORD-2024000001',
      submitTime: '2024-01-15 10:30:00',
      userUid: 'U000001',
      amount: 299.00,
      payType: 1,
      orderSource: 1,
    },
    {
      id: 2,
      orderNo: 'ORD-2024000002',
      submitTime: '2024-01-15 11:45:00',
      userUid: 'U000002',
      amount: 1599.00,
      payType: 2,
      orderSource: 2,
    },
    {
      id: 3,
      orderNo: 'ORD-2024000003',
      submitTime: '2024-01-15 14:20:00',
      userUid: 'U000003',
      amount: 89.00,
      payType: 0,
      orderSource: 3,
    },
    {
      id: 4,
      orderNo: 'ORD-2024000004',
      submitTime: '2024-01-16 09:15:00',
      userUid: 'U000004',
      amount: 458.50,
      payType: 3,
      orderSource: 1,
    },
    {
      id: 5,
      orderNo: 'ORD-2024000005',
      submitTime: '2024-01-16 16:30:00',
      userUid: 'U000005',
      amount: 1288.00,
      payType: 2,
      orderSource: 2,
    },
    {
      id: 6,
      orderNo: 'ORD-2024000006',
      submitTime: '2024-01-17 08:00:00',
      userUid: 'U000006',
      amount: 66.00,
      payType: 1,
      orderSource: 3,
    },
    {
      id: 7,
      orderNo: 'ORD-2024000007',
      submitTime: '2024-01-17 13:45:00',
      userUid: 'U000007',
      amount: 2199.00,
      payType: 2,
      orderSource: 1,
    },
    {
      id: 8,
      orderNo: 'ORD-2024000008',
      submitTime: '2024-01-18 11:20:00',
      userUid: 'U000008',
      amount: 358.00,
      payType: 0,
      orderSource: 2,
    },
    {
      id: 9,
      orderNo: 'ORD-2024000009',
      submitTime: '2024-01-18 15:55:00',
      userUid: 'U000009',
      amount: 899.99,
      payType: 3,
      orderSource: 3,
    },
    {
      id: 10,
      orderNo: 'ORD-2024000010',
      submitTime: '2024-01-19 09:30:00',
      userUid: 'U000010',
      amount: 168.00,
      payType: 1,
      orderSource: 1,
    },
  ];
}
