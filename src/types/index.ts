export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  created_at: string;
}

export interface Spot {
  id: string;
  created_by: string;
  title: string;
  description: string | null;
  latitude: number;
  longitude: number;
  category_id: string | null;
  image_urls: string[] | null;
  city: string | null;
  region: string | null;
  is_verified: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
  // Joined data
  profiles?: Profile;
  categories?: Category;
  reviews?: Review[];
  avg_rating?: number;
  review_count?: number;
}

export interface Review {
  id: string;
  spot_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  profiles?: Profile;
}

export interface Comment {
  id: string;
  spot_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  // Joined data
  profiles?: Profile;
}

// Location types
export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface SpotFormData {
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  category_id?: string;
  image_urls?: string[];
  city?: string;
  region?: string;
}