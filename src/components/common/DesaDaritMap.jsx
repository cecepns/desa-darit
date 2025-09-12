import { useMemo } from "react";
import PropTypes from "prop-types";
import { MapContainer, TileLayer, Marker, Popup, Polygon } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons for bundlers like Vite
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const DesaDaritMap = ({ height = "400px" }) => {
  // Approximate center of Desa Darit, Menyuke, Landak, Kalimantan Barat
  const center = useMemo(() => ({ lat: -0.5345, lng: 109.573 }), []);

  // Detect mobile viewport to adjust interactions and height
  const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width: 640px)").matches;

  // Ensure marker icon always resolves (works in dev and build)
  const defaultIcon = useMemo(
    () =>
      new L.Icon({
        iconUrl: markerIcon,
        iconRetinaUrl: markerIcon2x,
        shadowUrl: markerShadow,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        tooltipAnchor: [16, -28],
        shadowSize: [41, 41],
      }),
    []
  );

  // Example polygon approximating village boundary (replace with real GeoJSON when available)
  const polygonLatLngs = useMemo(
    () => [
      [-0.528, 109.560],
      [-0.523, 109.578],
      [-0.535, 109.590],
      [-0.547, 109.585],
      [-0.553, 109.570],
      [-0.545, 109.558],
    ],
    []
  );

  return (
    <div className="w-full relative" style={{ height: isMobile ? "260px" : height }}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={13}
        scrollWheelZoom={false}
        dragging={!isMobile}
        touchZoom
        doubleClickZoom={!isMobile}
        boxZoom={!isMobile}
        style={{ height: "100%", width: "100%", borderRadius: "0.5rem" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Polygon
          positions={polygonLatLngs}
          pathOptions={{ color: "#16a34a", fillColor: "#16a34a", fillOpacity: 0.2 }}
        />

        <Marker position={[center.lat, center.lng]} icon={defaultIcon}>
          <Popup>
            <div>
              <div className="font-semibold">Desa Darit</div>
              <div className="text-sm text-gray-600">Kecamatan Menyuke, Kabupaten Landak</div>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
      {isMobile && (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center"
          aria-hidden
        >
          <span className="rounded bg-black/60 px-3 py-1 text-xs text-white">
            Use two fingers to move the map
          </span>
        </div>
      )}
    </div>
  );
};

export default DesaDaritMap;



DesaDaritMap.propTypes = {
  height: PropTypes.string,
};
