import ClientSubscription from './clientSubscriptionModel.js';
import SubscriptionPlan from './subscriptionPlanModel.js';

// Set up associations
ClientSubscription.belongsTo(SubscriptionPlan, {
    foreignKey: 'plan_id',
    as: 'Plan'
});

SubscriptionPlan.hasMany(ClientSubscription, {
    foreignKey: 'plan_id',
    as: 'Subscriptions'
});

export { ClientSubscription, SubscriptionPlan }; 