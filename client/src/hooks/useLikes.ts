import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export function useLikes() {
  const [likedProducts, setLikedProducts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/profile');
        if (data && data.data && data.data.likedProducts) {
          setLikedProducts(data.data.likedProducts.map((p: any) => p._id || p));
        }
      } catch (error) {
        console.error("Failed to fetch likes", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const toggleLike = async (productId: string) => {
    const isLiked = likedProducts.includes(productId);
    
    // Optimistic update
    setLikedProducts(prev => 
      isLiked ? prev.filter(id => id !== productId) : [...prev, productId]
    );

    try {
      if (isLiked) {
        await api.delete(`/profile/likes/${productId}`);
      } else {
        await api.post(`/profile/likes/${productId}`);
      }
    } catch (error) {
      // Revert on error
      setLikedProducts(prev => 
        isLiked ? [...prev, productId] : prev.filter(id => id !== productId)
      );
    }
  };

  return { likedProducts, toggleLike, loading };
}
