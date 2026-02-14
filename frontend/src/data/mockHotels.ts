/**
 * Mock Hotels Data
 * Sample hotel data for Makkah and Madinah
 */

export interface Hotel {
    id: string;
    name: string;
    name_ar: string;
    location: 'makkah' | 'madinah';
    address: string;
    distance_from_haram: number; // in KM
    star_rating: '1_star' | '2_star' | '3_star' | '4_star' | '5_star' | 'unrated';
    description: string;
    facilities: string[];
    images: string[];
    rooms: HotelRoom[];
    is_active: boolean;
  }
  
  export interface HotelRoom {
    id: string;
    hotel_id: string;
    room_type: string;
    capacity: number;
    total_quota: number;
    available_quota: number;
    price_per_room_sar: number;
    meal_price_per_person_sar: number;
    description: string;
    amenities: string[];
    is_active: boolean;
  }
  
  export const mockHotels: Hotel[] = [
    // MAKKAH HOTELS
    {
      id: 'hotel-1',
      name: 'Fairmont Makkah Clock Royal Tower',
      name_ar: 'فيرمونت مكة برج الساعة الملكي',
      location: 'makkah',
      address: 'Abraj Al-Bait Complex, Makkah',
      distance_from_haram: 0.05,
      star_rating: '5_star',
      description: 'Luxury hotel inside Abraj Al-Bait complex with direct view to Masjidil Haram',
      facilities: ['Free WiFi', 'Restaurant', 'Room Service', '24h Front Desk', 'Shuttle Service', 'Prayer Room'],
      images: [],
      rooms: [
        {
          id: 'room-1-1',
          hotel_id: 'hotel-1',
          room_type: 'Quad',
          capacity: 4,
          total_quota: 50,
          available_quota: 32,
          price_per_room_sar: 1200,
          meal_price_per_person_sar: 80,
          description: 'Spacious quad room with Haram view',
          amenities: ['AC', 'TV', 'Mini Fridge', 'Safe Box', 'Haram View'],
          is_active: true
        },
        {
          id: 'room-1-2',
          hotel_id: 'hotel-1',
          room_type: 'Triple',
          capacity: 3,
          total_quota: 30,
          available_quota: 18,
          price_per_room_sar: 1000,
          meal_price_per_person_sar: 80,
          description: 'Comfortable triple room',
          amenities: ['AC', 'TV', 'Mini Fridge', 'Safe Box'],
          is_active: true
        }
      ],
      is_active: true
    },
    {
      id: 'hotel-2',
      name: 'Swissotel Makkah',
      name_ar: 'سويس أوتيل مكة',
      location: 'makkah',
      address: 'Ibrahim Al Khalil Street, Makkah',
      distance_from_haram: 0.2,
      star_rating: '5_star',
      description: 'Modern 5-star hotel near Masjidil Haram with excellent facilities',
      facilities: ['Free WiFi', 'Restaurant', 'Spa', 'Gym', 'Shuttle Service'],
      images: [],
      rooms: [
        {
          id: 'room-2-1',
          hotel_id: 'hotel-2',
          room_type: 'Quad',
          capacity: 4,
          total_quota: 40,
          available_quota: 25,
          price_per_room_sar: 950,
          meal_price_per_person_sar: 75,
          description: 'Modern quad room',
          amenities: ['AC', 'TV', 'Mini Fridge', 'WiFi'],
          is_active: true
        }
      ],
      is_active: true
    },
    {
      id: 'hotel-3',
      name: 'Anjum Hotel Makkah',
      name_ar: 'فندق أنجم مكة',
      location: 'makkah',
      address: 'Ajyad Street, Makkah',
      distance_from_haram: 0.4,
      star_rating: '4_star',
      description: 'Comfortable 4-star hotel with great value',
      facilities: ['Free WiFi', 'Restaurant', 'Room Service', 'Shuttle Service'],
      images: [],
      rooms: [
        {
          id: 'room-3-1',
          hotel_id: 'hotel-3',
          room_type: 'Quad',
          capacity: 4,
          total_quota: 60,
          available_quota: 45,
          price_per_room_sar: 600,
          meal_price_per_person_sar: 60,
          description: 'Standard quad room',
          amenities: ['AC', 'TV', 'WiFi'],
          is_active: true
        },
        {
          id: 'room-3-2',
          hotel_id: 'hotel-3',
          room_type: 'Triple',
          capacity: 3,
          total_quota: 40,
          available_quota: 28,
          price_per_room_sar: 500,
          meal_price_per_person_sar: 60,
          description: 'Standard triple room',
          amenities: ['AC', 'TV', 'WiFi'],
          is_active: true
        }
      ],
      is_active: true
    },
  
    // MADINAH HOTELS
    {
      id: 'hotel-4',
      name: 'Oberoi Madinah',
      name_ar: 'أوبروي المدينة',
      location: 'madinah',
      address: 'King Abdul Aziz Road, Madinah',
      distance_from_haram: 0.15,
      star_rating: '5_star',
      description: 'Luxury hotel near Masjid Nabawi with premium service',
      facilities: ['Free WiFi', 'Restaurant', 'Spa', 'Gym', 'Room Service'],
      images: [],
      rooms: [
        {
          id: 'room-4-1',
          hotel_id: 'hotel-4',
          room_type: 'Quad',
          capacity: 4,
          total_quota: 45,
          available_quota: 30,
          price_per_room_sar: 900,
          meal_price_per_person_sar: 70,
          description: 'Luxurious quad room',
          amenities: ['AC', 'TV', 'Mini Fridge', 'Safe Box', 'Balcony'],
          is_active: true
        }
      ],
      is_active: true
    },
    {
      id: 'hotel-5',
      name: 'Millennium Al Aqeeq Hotel',
      name_ar: 'فندق ميلينيوم العقيق',
      location: 'madinah',
      address: 'Al Aqeeq Street, Madinah',
      distance_from_haram: 0.3,
      star_rating: '4_star',
      description: 'Modern 4-star hotel with comfortable accommodations',
      facilities: ['Free WiFi', 'Restaurant', 'Room Service', 'Shuttle Service'],
      images: [],
      rooms: [
        {
          id: 'room-5-1',
          hotel_id: 'hotel-5',
          room_type: 'Quad',
          capacity: 4,
          total_quota: 55,
          available_quota: 38,
          price_per_room_sar: 550,
          meal_price_per_person_sar: 55,
          description: 'Comfortable quad room',
          amenities: ['AC', 'TV', 'WiFi'],
          is_active: true
        },
        {
          id: 'room-5-2',
          hotel_id: 'hotel-5',
          room_type: 'Triple',
          capacity: 3,
          total_quota: 35,
          available_quota: 22,
          price_per_room_sar: 480,
          meal_price_per_person_sar: 55,
          description: 'Cozy triple room',
          amenities: ['AC', 'TV', 'WiFi'],
          is_active: true
        }
      ],
      is_active: true
    },
    {
      id: 'hotel-6',
      name: 'Dar Al Taqwa Hotel',
      name_ar: 'فندق دار التقوى',
      location: 'madinah',
      address: 'Near Masjid Nabawi, Madinah',
      distance_from_haram: 0.5,
      star_rating: '3_star',
      description: 'Budget-friendly 3-star hotel with good location',
      facilities: ['Free WiFi', 'Restaurant', 'Room Service'],
      images: [],
      rooms: [
        {
          id: 'room-6-1',
          hotel_id: 'hotel-6',
          room_type: 'Quad',
          capacity: 4,
          total_quota: 70,
          available_quota: 52,
          price_per_room_sar: 350,
          meal_price_per_person_sar: 45,
          description: 'Basic quad room',
          amenities: ['AC', 'TV'],
          is_active: true
        }
      ],
      is_active: true
    }
  ];
  
  export const getHotelsByLocation = (location: 'makkah' | 'madinah') => {
    return mockHotels.filter(hotel => hotel.location === location);
  };
  
  export const getHotelById = (id: string) => {
    return mockHotels.find(hotel => hotel.id === id);
  };