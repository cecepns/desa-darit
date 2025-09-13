import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { newsAPI } from "../../utils/api";
import { ArrowRight } from "lucide-react";
import { getImageUrl } from "../../utils/helpers";

export default function NewsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await newsAPI.getAll({ page, limit: 9 });
        if (!active) return;
        setItems(res.data.data || []);
        setTotalPages(res.data.pagination?.totalPages || 1);
      } catch (e) {
        console.error(e);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [page]);

  return (
    <div className="pt-20 md:pt-28 pb-12">
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center" data-aos="fade-up">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">Berita Desa</h1>
            <p className="text-xl text-gray-100">
              Menyajikan informasi terbaru tentang peristiwa dan berita terkini
            </p>
          </div>
        </div>
      </section>

      {loading ? (
        <div>Memuat…</div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 md:pt-24">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((n) => (
              <Link
                to={`/berita/${n.id}`}
                key={n.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition p-4"
                data-aos="fade-up"
              >
                <div className="h-64 w-full bg-slate-50">
                  {n.image && (
                    <img
                      src={getImageUrl(n.image)}
                      alt={n.title}
                      className="w-full h-full object-cover rounded"
                    />
                  )}
                </div>
                <div className="text-sm text-primary-600 font-medium mb-2 mt-4">
                  {new Date(n.created_at).toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
                <h2 className="font-semibold mt-3 line-clamp-2">{n.title}</h2>
                <div
                  className="text-sm text-gray-600 mt-1 line-clamp-4"
                  dangerouslySetInnerHTML={{ __html: n.excerpt }}
                />

                <span className="text-primary-600 font-medium inline-flex mt-4 items-center">
                  Baca Selengkapnya <ArrowRight size={16} className="ml-1" />
                </span> 
              </Link>
            ))}
          </div>
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              className="px-3 py-1 rounded border"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Sebelumnya
            </button>
            <span className="text-sm">
              Halaman {page} dari {totalPages}
            </span>
            <button
              className="px-3 py-1 rounded border"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Berikutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
