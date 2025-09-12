import { useEffect, useState } from "react";
import { shopAPI } from "../../utils/api";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { getImageUrl } from "../../utils/helpers";

export default function ShopPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await shopAPI.getAll({ page, limit: 12, search });
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
  }, [page, search]);

  return (
    <div className="pb-12 pt-32">
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center" data-aos="fade-up">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              Belanja dari Desa Darit
            </h1>
            <p className="text-xl text-gray-100">
              Belanja produk-produk lokal dari Desa Darit
            </p>
          </div>
        </div>
      </section>
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 md:pt-24">
        <h1 className="text-3xl font-bold" data-aos="fade-right">
          Belanja dari Desa Darit
        </h1>
        <input
          className="border rounded px-3 py-2 w-64"
          placeholder="Cari produk…"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
      </div>

      {loading ? (
        <div>Memuat…</div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-lg shadow p-4"
                data-aos="fade-up"
              >
                <Link
                  to={`/belanja/${p.id}`}
                  className="h-64 w-full block bg-slate-50"
                >
                  {p.image && (
                    <img
                      src={getImageUrl(p.image)}
                      alt={p.name}
                      className="w-full h-full object-cover rounded"
                    />
                  )}
                </Link>
                <div className="mt-4 border-t pt-4">
                  <Link
                    to={`/belanja/${p.id}`}
                    className="font-semibold hover:underline"
                  >
                    {p.name}
                  </Link>
                  <div
                    className="text-sm text-gray-600 line-clamp-2"
                    dangerouslySetInnerHTML={{ __html: p.description }}
                  />
                  <div className="mt-2 font-medium">
                    Rp {Number(p.price).toLocaleString("id-ID")}
                  </div>
                  {/* Contact moved to detail page */}
                  <Link to={`/belanja/${p.id}`}>
                    <span className="text-primary-600 font-medium inline-flex items-center mt-4">
                      Lihat Produk <ArrowRight size={16} className="ml-1" />
                    </span>
                  </Link>
                </div>
              </div>
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
