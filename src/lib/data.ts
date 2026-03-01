
import type { LucideIcon } from 'lucide-react';
import { Leaf, Wrench, Droplets, Trash2, Bus, Shield, Star, ThumbsUp, MessageSquare, Power, CloudRain, Briefcase, Building2, Vote, Phone, Palmtree, Newspaper } from 'lucide-react';
import { sellers, sellerCategories } from './market';

export const transactions = [
  {
    id: 'tx-1',
    description: 'Top up',
    amount: 5000,
    date: new Date('2024-01-20').toISOString(),
    type: 'credit'
  },
  {
    id: 'tx-2',
    description: 'Electric Bill',
    amount: 2500,
    date: new Date('2024-01-18').toISOString(),
    type: 'debit'
  },
  {
    id: 'tx-3',
    description: 'Waste Management Fee',
    amount: 1000,
    date: new Date('2024-01-15').toISOString(),
    type: 'debit'
  },
  {
    id: 'tx-4',
    description: 'Salary Deposit',
    amount: 150000,
    date: new Date('2024-01-01').toISOString(),
    type: 'credit'
  }
];

export const services = [
  { id: 'agro-connect', name: 'AgroConnect', iconId: 'agro-connect', description: 'Fresh farm produce near you', href: '/market' },
  { id: 'skills-hub', name: 'SkillsHub', iconId: 'skills-hub', description: 'Find reliable artisans', href: '/skills' },
  { id: 'laundry-hub', name: 'LaundryHub', iconId: 'laundry-hub', description: 'Convenient laundry services', href: '#' },
  { id: 'clean-aks', name: 'CleanAKS', iconId: 'clean-aks', description: 'Report waste issues', href: '/waste' },
  { id: 'transport-guide', name: 'Transport Guide', iconId: 'transport-guide', description: 'Fares and routes', href: '/transport' },
  { id: 'community-safety', name: 'Community Safety', iconId: 'community-safety', description: 'Stay safe and informed', href: '/alerts' },
];

export const artisans = [
  { id: 1, name: 'John Doe', skill: 'Electrician', rating: 4.8, distance: '1.5km', imageId: 'artisan-1', hourlyRate: '₦5000', availability: 'Available' },
  { id: 2, name: 'Jane Smith', skill: 'Plumber', rating: 4.5, distance: '2.3km', imageId: 'artisan-2', hourlyRate: '₦4500', availability: 'Busy' },
  { id: 3, name: 'Samuel Green', skill: 'Carpenter', rating: 4.9, distance: '0.8km', imageId: 'artisan-3', hourlyRate: '₦6000', availability: 'Available' },
];

export { sellers, sellerCategories };

export const alerts = [
  {
    id: 1,
    type: "Power Outage",
    Icon: Power,
    iconColor: "text-yellow-500",
    location: "Ibom Plaza",
    time: "2h ago",
    description: "Power just went out around the Plaza area. Anyone else experiencing this?",
    upvotes: 12,
    comments: 3,
    user: { name: "David U.", avatarId: "user-avatar-1" },
  },
  {
    id: 2,
    type: "Flood Alert",
    Icon: CloudRain,
    iconColor: "text-blue-500",
    location: "Itam Market Area",
    time: "5h ago",
    description: "Heavy flooding on the highway near Itam, please be careful if you're driving.",
    upvotes: 25,
    comments: 8,
    user: { name: "Sarah B.", avatarId: "user-avatar-2" },
  },
  {
    id: 3,
    type: "Waste Overflow",
    Icon: Trash2,
    iconColor: "text-gray-500",
    location: "Oron Road",
    time: "1 day ago",
    description: "The bins near the main junction are overflowing. Requesting pickup from AKSWMA.",
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

export const jobListings = [
  { id: 1, title: 'Frontend Developer', company: 'Ibom Tech Hub', location: 'Uyo', type: 'Full-time', imageId: 'job-tech' },
  { id: 2, title: 'Store Manager', company: 'Ibom Mall', location: 'Oron Road', type: 'Full-time', imageId: 'job-retail' },
  { id: 3, title: 'Site Supervisor', company: 'AKS Construction', location: 'Eket', type: 'Contract', imageId: 'job-construction' },
];

export const propertyListings = [
  { id: 1, title: '3 Bedroom Flat in Shelter Afrique', price: '₦1,800,000/yr', type: 'For Rent', imageId: 'property-apartment' },
  { id: 2, title: 'Newly-built 4 Bedroom Duplex at Ewet Housing', price: '₦125,000,000', type: 'For Sale', imageId: 'property-house' },
  { id: 3, title: 'Plot of Land at Airport Road', price: '₦15,000,000', type: 'For Sale', imageId: 'property-land' },
];

export const healthFacilities = [
  { id: 1, name: 'Ibom Specialty Hospital', type: 'Hospital', imageId: 'health-hospital', phone: '08030000001', hours: '24 Hours' },
  { id: 2, name: 'St. Luke’s Hospital, Anua', type: 'Hospital', imageId: 'health-clinic', phone: '09011223344', hours: '24 Hours' },
  { id: 3, 'name': 'Uyo City Pharmacy', 'type': 'Pharmacy', imageId: 'health-pharmacy', phone: '07098765432', hours: '8am - 11pm' },
];

export const educationalInstitutions = [
  { id: 1, name: 'University of Uyo (UNIUYO)', type: 'University', imageId: 'education-university' },
  { id: 2, name: 'Akwa Ibom State Library', type: 'Library', imageId: 'education-library' },
  { id: 3, name: 'Akwa Ibom State Polytechnic', type: 'Polytechnic', imageId: 'education-school' },
];

export const forumTopics = [
  {
    id: 1,
    title: 'Best places to get fresh seafood in Uyo?',
    category: 'Food & Drink',
    replies: 12,
    author: 'Esther H.',
    imageId: 'forum-discussion',
    content: 'I have been looking for some really fresh fish and shrimps for a weekend meal. I usually go to Itam Market but the traffic is terrible lately. Are there any other good spots, maybe around Shelter Afrique or Ewet Housing?',
    createdAt: '2 hours ago',
    comments: [
      { id: 101, author: 'David U.', text: 'Try the evening market at Plaza, just by the roadside. Very fresh catches.', time: '1 hour ago' },
      { id: 102, author: 'Sarah B.', text: 'There is a woman who brings fresh supplies to Osongama every Saturday morning. DM me for her contact.', time: '45 mins ago' }
    ]
  },
  {
    id: 2,
    title: 'Town Hall Meeting on Security',
    category: 'Community',
    replies: 45,
    author: 'Admin',
    imageId: 'forum-townhall',
    content: 'There will be a general town hall meeting this Friday at the Community Centre regarding the recent security updates. All residents are encouraged to attend. We will be discussing the new gate schedules and vigilante contributions.',
    createdAt: '1 day ago',
    comments: [
      { id: 201, author: 'Mike E.', text: 'Will there be zoom access for those who cannot attend physically?', time: '20 hours ago' },
      { id: 202, author: 'Admin', text: 'Yes, we will share the link on the WhatsApp group.', time: '19 hours ago' }
    ]
  },
  {
    id: 3,
    title: 'Who creates the "No Dump" signs?',
    category: 'Environment',
    replies: 5,
    author: 'John D.',
    imageId: 'waste-management-hero',
    content: 'I noticed some new "No Dumping" signs around the estate. They look professional. Is this from the waste management agency or a private initiative? We need one on my street.',
    createdAt: '3 days ago',
    comments: []
  }
];

export const polls = [
  { id: 1, title: 'Should streetlights be on all night?', votes: { Yes: 128, No: 34 }, totalVotes: 162 },
  { id: 2, title: 'Which road needs urgent repairs the most?', votes: { 'Oron Road': 78, 'Abak Road': 55, 'Ikpa Road': 23 }, totalVotes: 156 },
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
  { area: 'Shelter Afrique', group: 'A', 'in': '6 hours', out: '12 hours' },
  { area: 'Ewet Housing', group: 'B', 'in': '12 hours', out: '6 hours' },
  { area: 'Osongama', group: 'C', 'in': '8 hours', out: '8 hours' },
];

export const tourismSpots = [
  { id: 1, name: 'Ibom Icon Hotel & Golf Resort', description: 'A world-class resort featuring a lush 18-hole golf course and premium leisure facilities.', imageId: 'tourism-obudu' },
  { id: 2, name: 'Godswill Akpabio International Stadium', description: 'The Nest of Champions, a multi-use national stadium that hosts major sports events.', imageId: 'tourism-tinapa' },
  { id: 3, name: 'Ibom Plaza', description: 'The heart of Uyo city, featuring a beautiful fountain and a center for social interactions.', imageId: 'tourism-kwa' },
  { id: 4, name: 'Ibibio Museum and State Park', description: 'Showcasing the rich cultural heritage and artifacts of the Ibibio people.', imageId: 'tourism-carnival' },
];

export const newsArticles = [
  {
    id: 1,
    title: 'Governor Announces ARise Agenda Expansion',
    summary: 'The Akwa Ibom State government has unveiled new projects under the ARISE Agenda to boost rural development.',
    category: 'Government',
    date: 'October 28, 2024',
    imageId: 'news-road'
  },
  {
    id: 2,
    title: 'Christmas Unplugged Preparations in Full Swing',
    summary: 'Uyo is getting ready for the biggest end-of-year concert series, Christmas Unplugged, at the Christmas Village.',
    category: 'Culture',
    date: 'October 27, 2024',
    imageId: 'event-carnival'
  },
  {
    id: 3,
    title: 'AKSWMA Announces New Waste Pickup Schedule',
    summary: 'The Akwa Ibom State Waste Management Agency has released a new schedule for waste pickup in Uyo metropolis.',
    category: 'Community',
    date: 'October 26, 2024',
    imageId: 'waste-management-hero'
  },
];

export const popularRoutes = [
  { from: 'Ibom Plaza', to: 'Itam Park', fare: '₦200' },
  { from: 'Oron Road', to: 'UNIUYO Town Campus', fare: '₦150' },
  { from: 'Shelter Afrique', to: 'Plaza', fare: '₦300' },
  { from: 'Aka Road', to: 'Ibom Hall', fare: '₦100' },
];

export const fareEstimates: { [key: string]: string } = {
  'ibom plaza-itam park': '₦200',
  'oron road-uniuyo town campus': '₦150',
  'shelter afrique-plaza': '₦300',
  'aka road-ibom hall': '₦100',
};
