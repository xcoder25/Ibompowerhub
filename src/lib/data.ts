
import type { LucideIcon } from 'lucide-react';
import { Leaf, Wrench, Droplets, Trash2, Bus, Shield, Star, ThumbsUp, MessageSquare, Power, CloudRain, Briefcase, Building2, Vote, Phone } from 'lucide-react';

export const services = [
  { id: 'agro-connect', name: 'AgroConnect', iconId: 'agro-connect', description: 'Fresh farm produce near you', href: '/market' },
  { id: 'skills-hub', name: 'SkillsHub', iconId: 'skills-hub', description: 'Find reliable artisans', href: '/skills' },
  { id: 'laundry-hub', name: 'LaundryHub', iconId: 'laundry-hub', description: 'Convenient laundry services', href: '#' },
  { id: 'clean-crs', name: 'CleanCRS', iconId: 'clean-crs', description: 'Report waste issues', href: '/waste' },
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
  { id: 1, name: 'John Doe', skill: 'Electrician', rating: 4.8, distance: '1.5km', imageId: 'artisan-1', hourlyRate: '₦5000', availability: 'Available' },
  { id: 2, name: 'Jane Smith', skill: 'Plumber', rating: 4.5, distance: '2.3km', imageId: 'artisan-2', hourlyRate: '₦4500', availability: 'Busy' },
  { id: 3, name: 'Samuel Green', skill: 'Carpenter', rating: 4.9, distance: '0.8km', imageId: 'artisan-3', hourlyRate: '₦6000', availability: 'Available' },
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
      commentsCount: 3,
      user: { name: "David U.", avatarId: "user-avatar-1" },
      status: 'Verified',
      comments: [
        { id: 1, user: { name: "Sarah B.", avatarId: "user-avatar-2" }, text: "Yes, same here. It's been 30 minutes.", time: "1h ago" },
        { id: 2, user: { name: "Esther H.", avatarId: "user-avatar-1" }, text: "I've reported it to the power company.", time: "30m ago" },
      ]
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
      commentsCount: 8,
      user: { name: "Sarah B.", avatarId: "user-avatar-2" },
      status: 'New',
      comments: []
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
        commentsCount: 1,
        user: { name: "Mike E.", avatarId: "user-avatar-3" },
        status: 'Resolved',
        comments: []
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

  export const jobListings = [
    { id: 1, title: 'Frontend Developer', company: 'Tech Solutions Ltd.', location: 'Calabar', type: 'Full-time', imageId: 'job-tech' },
    { id: 2, title: 'Store Manager', company: 'Calabar Supermart', location: 'Marian', type: 'Full-time', imageId: 'job-retail' },
    { id: 3, title: 'Site Supervisor', company: 'CRS Construction', location: 'Akpabuyo', type: 'Contract', imageId: 'job-construction' },
  ];

  export const propertyListings = [
    { id: 1, title: '3 Bedroom Flat in a Serene Environment', price: '₦1,200,000/yr', type: 'For Rent', imageId: 'property-apartment' },
    { id: 2, title: 'Newly-built 4 Bedroom Duplex', price: '₦85,000,000', type: 'For Sale', imageId: 'property-house' },
    { id: 3, title: 'Half Plot of Land in a Developing Area', price: '₦5,000,000', type: 'For Sale', imageId: 'property-land' },
  ];

  export const healthFacilities = [
    { id: 1, name: 'UCTH (University of Calabar Teaching Hospital)', type: 'Hospital', imageId: 'health-hospital', phone: '08012345678', hours: '24 Hours' },
    { id: 2, name: 'Asi Ukpo Comprehensive Medical Centre', type: 'Clinic', imageId: 'health-clinic', phone: '09011223344', hours: '8am - 9pm' },
    { id: 3, 'name': 'City Pharmacy', 'type': 'Pharmacy', imageId: 'health-pharmacy', phone: '07098765432', hours: '8am - 10pm' },
  ];

  export const educationalInstitutions = [
    { id: 1, name: 'University of Calabar (UNICAL)', type: 'University', imageId: 'education-university' },
    { id: 2, name: 'Hope Waddell Training Institution', type: 'Secondary School', imageId: 'education-school' },
    { id: 3, name: 'CRS Library Board', type: 'Library', imageId: 'education-library' },
  ];

  export const forumTopics = [
    { id: 1, title: 'Best places to get fresh seafood in Calabar?', category: 'Food & Drink', replies: 12, author: 'Esther H.', imageId: 'forum-discussion' },
    { id: 2, title: 'Town Hall Meeting on Security', category: 'Community', replies: 45, author: 'Admin', imageId: 'forum-townhall' },
  ];

  export const polls = [
    { id: 1, title: 'Should streetlights be on all night?', votes: { yes: 128, no: 34 }, totalVotes: 162 },
    { id: 2, title: 'Which road needs urgent repairs the most?', votes: { 'Marian Road': 78, 'Murtala Mohammed Highway': 55, 'Atimbo Road': 23 }, totalVotes: 156 },
  ];

  export const emergencyContacts = [
    { id: 1, name: 'Police Control Room', number: '112' },
    { id: 2, name: 'Ambulance Service', number: '199' },
    { id: 3, name: 'State Security Service (SSS)', number: '08033033779' },
  ];

  export const waterSchedule = [
    { area: '8 Miles', days: 'Mon, Wed, Fri', time: '6am - 12pm' },
    { area: 'State Housing', days: 'Tue, Thu, Sat', time: '6am - 12pm' },
    { area: 'Marian', days: 'Daily', time: '5am - 10am' },
  ];

  export const powerSchedule = [
    { area: 'Federal Housing', group: 'A', 'in': '6 hours', out: '12 hours' },
    { area: 'Etta Agbor', group: 'B', 'in': '12 hours', out: '6 hours' },
    { area: 'MCC Road', group: 'C', 'in': '8 hours', out: '8 hours' },
  ];
