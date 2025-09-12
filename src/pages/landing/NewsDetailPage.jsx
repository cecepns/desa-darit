import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { newsAPI } from '../../utils/api';
import { getImageUrl } from '../../utils/helpers';

export default function NewsDetailPage() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await newsAPI.getById(id);
        if (active) setItem(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [id]);

  if (loading) return <div className="container mx-auto px-4 py-12">Memuat…</div>;
  if (!item) return <div className="container mx-auto px-4 py-12">Berita tidak ditemukan.</div>;

  return (
    <div className="container mx-auto px-4 pt-32 pb-14 max-w-3xl">
      <Link to="/berita" className="text-primary-600 hover:underline">← Kembali</Link>
      <h1 className="text-3xl font-bold mt-2" data-aos="fade-right">{item.title}</h1>
      {item.image && (
        <img src={getImageUrl(item.image)} alt={item.title} className="w-full h-72 object-cover rounded my-6" data-aos="zoom-in" />
      )}
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: item.content }} />
    </div>
  );
}


