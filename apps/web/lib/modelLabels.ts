export const modelLabels: Record<string,string> = {
  ActiveSubscription: 'Active Subscription',
  ClientAccount: 'Client / Account',
  CurrentInventory: 'Current Inventory',
  DistributionCenter: 'Distribution Center / Warehouse',
  ERPUser: 'ERP User',
  FulfillmentWave: 'Fulfillment Wave',
  Organization: 'Organization (Company)',
  ProductSKU: 'Product / SKU',
  ProjectEngagement: 'Project / Engagement',
  StaffMember: 'Staff / Team Member',
  SubscriptionPlan: 'Subscription Plan / Pricing Plan',
  WorkHoursLog: 'Work Hours / Time Log',
  WorkspaceUnit: 'Workspace / Business Unit',
};
export const orderedModels = [
  'Organization','ClientAccount','StaffMember','ProductSKU','DistributionCenter','SubscriptionPlan',
  'ProjectEngagement','WorkHoursLog','ActiveSubscription','CurrentInventory','FulfillmentWave',
  'ERPUser','WorkspaceUnit',
];
