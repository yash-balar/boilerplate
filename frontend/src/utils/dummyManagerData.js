const dummyManagerSeed = [
  { id: "manager-001", name: "Olivia Rhye", email: "olivia.rhye@example.com", department: "Engineering", phone: "+1 (555) 012-3401", status: "Active", createdAt: "2025-01-14T09:00:00.000Z" },
  { id: "manager-002", name: "Phoenix Baker", email: "phoenix.baker@example.com", department: "Design", phone: "+1 (555) 012-3402", status: "Active", createdAt: "2025-02-08T09:00:00.000Z" },
  { id: "manager-003", name: "Lana Steiner", email: "lana.steiner@example.com", department: "Marketing", phone: "+1 (555) 012-3403", status: "Inactive", createdAt: "2025-02-19T09:00:00.000Z" },
  { id: "manager-004", name: "Demi Wilkinson", email: "demi.wilkinson@example.com", department: "Operations", phone: "+1 (555) 012-3404", status: "Active", createdAt: "2025-03-02T09:00:00.000Z" },
  { id: "manager-005", name: "Candice Wu", email: "candice.wu@example.com", department: "Finance", phone: "+1 (555) 012-3405", status: "Active", createdAt: "2025-03-15T09:00:00.000Z" },
  { id: "manager-006", name: "Natali Craig", email: "natali.craig@example.com", department: "Human Resources", phone: "+1 (555) 012-3406", status: "Inactive", createdAt: "2025-04-05T09:00:00.000Z" },
  { id: "manager-007", name: "Drew Cano", email: "drew.cano@example.com", department: "Sales", phone: "+1 (555) 012-3407", status: "Active", createdAt: "2025-04-22T09:00:00.000Z" },
  { id: "manager-008", name: "Orlando Diggs", email: "orlando.diggs@example.com", department: "Engineering", phone: "+1 (555) 012-3408", status: "Active", createdAt: "2025-05-11T09:00:00.000Z" },
  { id: "manager-009", name: "Andi Lane", email: "andi.lane@example.com", department: "Product", phone: "+1 (555) 012-3409", status: "Active", createdAt: "2025-06-03T09:00:00.000Z" },
  { id: "manager-010", name: "Kate Morrison", email: "kate.morrison@example.com", department: "Customer Success", phone: "+1 (555) 012-3410", status: "Inactive", createdAt: "2025-06-27T09:00:00.000Z" },
  { id: "manager-011", name: "Katherine", email: "katherine@example.com", department: "Design", phone: "+1 (555) 012-3411", status: "Active", createdAt: "2025-07-18T09:00:00.000Z" },
  { id: "manager-012", name: "Jocelyn", email: "jocelyn@example.com", department: "Operations", phone: "+1 (555) 012-3412", status: "Active", createdAt: "2025-08-04T09:00:00.000Z" },
];

let managers = dummyManagerSeed.map((manager) => ({ ...manager }));

export const getDummyManagers = () => managers.map((manager) => ({ ...manager }));

export const getDummyManagerPage = ({
  page = 1,
  pageSize = 8,
  search = "",
  status = "all",
  sortBy = "createdAt",
  sortOrder = "desc",
}) => {
  const query = search.trim().toLocaleLowerCase();
  const filteredManagers = managers.filter((manager) => {
    const matchesSearch = [manager.name, manager.email, manager.department]
      .some((value) => value.toLocaleLowerCase().includes(query));
    return matchesSearch && (status === "all" || manager.status === status);
  });
  filteredManagers.sort((first, second) => {
    const firstValue = first[sortBy] ?? "";
    const secondValue = second[sortBy] ?? "";
    const comparison = String(firstValue).localeCompare(String(secondValue), undefined, {
      numeric: true,
      sensitivity: "base",
    });
    return sortOrder === "asc" ? comparison : -comparison;
  });
  const totalPages = Math.max(1, Math.ceil(filteredManagers.length / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);

  return {
    items: filteredManagers.slice((currentPage - 1) * pageSize, currentPage * pageSize)
      .map((manager) => ({ ...manager })),
    total: filteredManagers.length,
    page: currentPage,
    pageSize,
    totalPages,
  };
};

export const getDummyManager = (managerId) => {
  const manager = managers.find((item) => item.id === managerId);
  if (!manager) throw new Error("Manager not found.");
  return { ...manager };
};

export const addDummyManager = (manager) => {
  const newManager = {
    ...manager,
    id: window.crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  managers = [newManager, ...managers];
  return { ...newManager };
};

export const editDummyManager = ({ id, ...updates }) => {
  const managerIndex = managers.findIndex((item) => item.id === id);
  if (managerIndex === -1) throw new Error("Manager not found.");
  managers[managerIndex] = { ...managers[managerIndex], ...updates };
  return { ...managers[managerIndex] };
};

export const removeDummyManager = (managerId) => {
  if (!managers.some((item) => item.id === managerId)) {
    throw new Error("Manager not found.");
  }
  managers = managers.filter((item) => item.id !== managerId);
};
