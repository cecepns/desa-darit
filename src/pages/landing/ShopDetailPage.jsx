import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { shopAPI } from "../../utils/api";
import { getImageUrl } from "../../utils/helpers";

export default function ShopDetailPage() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await shopAPI.getById(id);
        if (active) setItem(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  const waLink = useMemo(() => {
    if (!item?.phone) return null;
    const text = encodeURIComponent(
      `Halo, saya tertarik dengan produk "${item.name}" (ID: ${item.id}). Apakah masih tersedia?`
    );
    return `https://wa.me/${item.phone}?text=${text}`;
  }, [item]);

  if (loading)
    return (
      <div className="container mx-auto px-4 py-12">Memuat…</div>
    );
  if (!item)
    return (
      <div className="container mx-auto px-4 py-12">Produk tidak ditemukan.</div>
    );

  return (
    <div className="container mx-auto px-4 pt-32 pb-14 max-w-4xl">
      <Link to="/belanja" className="text-primary-600 hover:underline">
        ← Kembali
      </Link>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
        <div data-aos="zoom-in">
          {item.image ? (
            <img
              src={getImageUrl(item.image)}
              alt={item.name}
              className="w-full h-96 object-cover rounded"
            />
          ) : (
            <div className="w-full h-96 bg-gray-100 rounded" />
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold" data-aos="fade-right">
            {item.name}
          </h1>
          <div className="mt-2 text-xl font-semibold text-primary-700">
            Rp {Number(item.price).toLocaleString("id-ID")}
          </div>
          {item.category && (
            <div className="mt-1 text-sm text-gray-600">Kategori: {item.category}</div>
          )}
          <div
            className="prose max-w-none mt-4"
            dangerouslySetInnerHTML={{ __html: item.description }}
          />
          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded"
            >
              Hubungi via WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  );
}


