import { useParams } from 'react-router-dom';
import { parseSlug } from '../utils/slug';

// Parses a :slug route param in "name~uuid" format into { name, id }
export function useSlugParams() {
  const { slug } = useParams<{ slug: string }>();
  const parsed = slug ? parseSlug(slug) : null;
  return {
    name: parsed?.slug ?? '',
    id: parsed?.id ?? slug ?? '',
  };
}
