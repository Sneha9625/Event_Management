import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Known Leaflet + bundler issue: Leaflet guesses its marker image paths from
// the CSS, which breaks after Vite bundles them. Point it at the imported files.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export default function MapView({ lat, lng, label }) {
  const position = [lat, lng];

  return (
    // relative + z-0 keeps Leaflet's high z-index layers below our sticky navbar
    <div className="relative z-0 w-full overflow-hidden rounded-xl border border-slate-200">
      <MapContainer center={position} zoom={15} scrollWheelZoom={false} className="h-64 w-full sm:h-80">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>{label}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
