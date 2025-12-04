
import type { LucideIcon } from 'lucide-react';
import { Leaf, Wrench, Droplets, Trash2, Bus, Shield, Star, ThumbsUp, MessageSquare, Power, CloudRain } from 'lucide-react';

export const services = [
  { id: 'agro-connect', name: 'AgroConnect', iconId: 'agro-connect', description: 'Fresh farm produce near you', href: '/market' },
  { id: 'skills-hub', name: 'SkillsHub', iconId: 'skills-hub', description: 'Find reliable artisans', href: '/skills' },
  { id: 'laundry-hub', name: 'LaundryHub', iconId: 'laundry-hub', description: 'Convenient laundry services', href: '#' },
  { id: 'clean-crs', name: 'CleanCRS', iconId: 'clean-crs', description: 'Report waste issues', href: '#' },
  { id: 'transport-guide', name: 'Transport Guide', iconId: 'transport-guide', description: 'Fares and routes', href: '/transport' },
  { id: 'community-safety', name: 'Community Safety', iconId: 'community-safety', description: 'Stay safe and informed', href: '/alerts' },
];

export const sellers = [
  { id: 1, name: 'Grace Farms', product: 'Vegetables', priceRange: '₦500 - ₦5000', distance: '2.1km', imageId: 'seller-1' },
  { id: 2, name: 'Emeka\'s Yams', product: 'Tubers & Grains', priceRange: '₦2000 - ₦20000', distance: '3.5km', imageId: 'seller-3' },
  { id: 3, name: 'Aunty Funke\'s Fruits', product: 'Fruits', priceRange: '₦1000 - ₦7000', distance: '1.2km', imageId: 'seller-2' },
  { id: 4, name: 'Cross River Poultry', product: 'Poultry & Eggs', priceRange: '₦3000 - ₦15000', distance: '5.8km', imageId: 'seller-4' },
];

export const artisans = [
  { id: 1, name: 'John Doe', skill: 'Electrician', rating: 4.8, distance: '1.5km', imageId: 'artisan-1', hourlyRate: '₦5000' },
  { id: 2, name: 'Jane Smith', skill: 'Plumber', rating: 4.5, distance: '2.3km', imageId: 'artisan-2', hourlyRate: '₦4500' },
  { id: 3, name: 'Samuel Green', skill: 'Carpenter', rating: 4.9, distance: '0.8km', imageId: 'artisan-3', hourlyRate: '₦6000' },
];

export const alerts = [
    {
      id: 1,
      type: "Power Outage",
      Icon: Power,
      iconColor: "text-yellow-500",
      location: "Marian Road",
      time: "2h ago",
      description: "Power just went out around the MTN office. Anyone else experiencing this?",
      upvotes: 12,
      comments: 3,
      user: { name: "David U.", avatarId: "user-avatar-1" },
    },
    {
      id: 2,
      type: "Flood Alert",
      Icon: CloudRain,
      iconColor: "text-blue-500",
      location: "8 Miles Area",
      time: "5h ago",
      description: "Heavy flooding on the highway, please be careful if you're driving.",
      upvotes: 25,
      comments: 8,
      user: { name: "Sarah B.", avatarId: "user-avatar-2" },
    },
    {
        id: 3,
        type: "Waste Overflow",
        Icon: Trash2,
        iconColor: "text-gray-500",
        location: "Watt Market",
        time: "1 day ago",
        description: "The bins near the main entrance are overflowing. Requesting pickup.",
        upvotes: 8,
        comments: 1,
        user: { name: "Mike E.", avatarId: "user-avatar-3" },
      },
  ];

  export const recentActivities = [
    {
      id: 1,
      type: "Power Outage",
      time: "15m ago",
      user: { name: "David U.", avatarId: "user-avatar-1" },
    },
    {
      id: 2,
      type: "Flood Alert",
      time: "1h ago",
      user: { name: "Sarah B.", avatarId: "user-avatar-2" },
    },
    {
        id: 3,
        type: "Waste Overflow",
        time: "3h ago",
        user: { name: "Mike E.", avatarId: "user-avatar-3" },
      },
      {
        id: 4,
        type: "Power Outage",
        time: "5h ago",
        user: { name: "Esther H.", avatarId: "user-avatar-1" },
      }
  ];
