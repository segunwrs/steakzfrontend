// One place that decides which screens each role gets. The API enforces the same rules server-side.
export const NAV = {
  admin: [
    ['/app', 'Admin dashboard', '◧'], ['/app/reports', 'Reports', '▤'], ['/app/branches', 'Branches', '⌂'],
    ['/app/users', 'Users & roles', '☺'], ['/app/menu', 'Menu', '☰'], ['/app/orders', 'All orders', '▦'],
    ['/app/inventory', 'Inventory', '▣'], ['/app/audit', 'Audit log', '⎙'],
  ],
  hq_manager: [
    ['/app', 'Group overview', '◧'], ['/app/orders', 'All orders', '▦'], ['/app/inventory', 'Stock (all branches)', '▣'],
    ['/app/menu', 'Menu & pricing', '☰'], ['/app/branches', 'Branches', '⌂'], ['/app/users', 'Staff directory', '☺'],
  ],
  branch_manager: [
    ['/app', 'Branch dashboard', '◧'], ['/app/orders', 'Orders', '▦'], ['/app/kitchen', 'Kitchen board', '♨'],
    ['/app/pos', 'New order', '+'], ['/app/reservations', 'Reservations', '◷'], ['/app/inventory', 'Inventory', '▣'],
    ['/app/users', 'My staff', '☺'],
  ],
  chef: [['/app', 'Kitchen board', '♨'], ['/app/inventory', 'Stock count', '▣'], ['/app/menu', 'Menu', '☰']],
  cashier: [['/app', 'New order (POS)', '+'], ['/app/orders', 'Orders & payments', '▦'], ['/app/reservations', 'Reservations', '◷']],
  delivery: [['/app', 'My deliveries', '➜']],
  customer: [['/app', 'Order food', '+'], ['/app/orders', 'My orders', '▦'], ['/app/reservations', 'My bookings', '◷']],
};
