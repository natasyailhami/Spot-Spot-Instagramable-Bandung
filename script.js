const map = L.map('map')
map.setView([-6.903, 107.6510], 13);
const basemapOSM = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
// maxZoom: 19,
attribution: '&copy; <ahref="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);

document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM content loaded. Starting map initialization from script.js."); // Debugging log 1

  // Inisialisasi peta Leaflet
  const map = L.map('map').setView([-6.9175, 107.6191], 12); // Koordinat Bandung, Zoom level 12
  console.log("Leaflet map initialized."); // Debugging log 2

  // --- Pilihan Basemap ---
  // 1. OpenStreetMap (OSM) - Default yang sering digunakan
  const osmBasemap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  // 2. Stadia Maps - Alidade Smooth (seperti yang Anda inginkan dari gambar)
  // Perlu diingat, Stadia Maps memerlukan API key untuk penggunaan produksi atau traffic tinggi.
  // Untuk pengembangan lokal dengan traffic rendah, seringkali masih bisa diakses tanpa API key langsung.
  const stadiaAlidadeSmooth = L.tileLayer(
      'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', {
          maxZoom: 20,
          attribution: '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          // Anda bisa menambahkan API key jika diperlukan: apikey: 'YOUR_API_KEY'
      }
  );

  // Tambahkan basemap Stadia Maps sebagai default
  stadiaAlidadeSmooth.addTo(map);
  console.log("Stadia Maps Alidade Smooth basemap added."); // Debugging log 3

  // Opsional: Menambahkan kontrol layers untuk memilih basemap (jika Anda ingin bisa mengganti antara OSM dan Stadia)
  const baseLayers = {
      "Stadia Alidade Smooth": stadiaAlidadeSmooth,
      "OpenStreetMap": osmBasemap
  };
  L.control.layers(baseLayers).addTo(map);
  console.log("Basemap layer control added."); // Debugging log for layer control

  // --- Tambahkan Kontrol Plugin ---
  // Fullscreen Control
  L.control.fullscreen({
      position: 'topleft', // Posisi tombol
      title: 'Full Screen', // Tooltip saat tombol tidak aktif
      titleCancel: 'Exit Full Screen' // Tooltip saat tombol aktif
  }).addTo(map);
  console.log("Fullscreen control added.");

  // Locate Control (menemukan lokasi pengguna)
  L.control.locate({
      position: 'topleft', // Posisi tombol
      strings: {
          title: "Tunjukkan lokasi saya",
          popup: "Anda berada di sini",
          outsideMapBoundsMsg: "Anda di luar batas peta"
      },
      locateOptions: {
          maxZoom: 16,
          enableHighAccuracy: true
      },
      setView: 'untilPan', // Jangan setView jika pengguna menggeser peta
      flyTo: true, // Animasi saat menemukan lokasi
      drawCircle: true, // Gambar lingkaran akurasi
      drawMarker: true // Gambar marker lokasi
  }).addTo(map);
  console.log("Locate control added.");

  // Easy Button (Contoh: Menambahkan tombol sederhana)
  L.easyButton('fa-home', function(btn, map){
      map.setView([-6.9175, 107.6191], 12); // Kembali ke tampilan awal
  }).addTo(map);
  console.log("EasyButton control added.");

  // Kode untuk mengambil data spots.json dan menambahkan marker
  // Pastikan file spots.json ada di direktori yang sama dengan map.html
  fetch('spots.json')
      .then(response => {
          console.log("Fetched spots.json response. Status:", response.status); // Debugging log 4
          if (!response.ok) {
              throw new Error('Network response was not ok ' + response.statusText);
          }
          return response.json();
      })
      .then(spotsData => {
          console.log("Spots data parsed successfully. Number of spots:", spotsData.length); // Debugging log 5
          const urlParams = new URLSearchParams(window.location.search);
          const spotId = urlParams.get('spot');

          let targetSpot = null;

          spotsData.forEach(spot => {
              const marker = L.marker(spot.coords).addTo(map);
              console.log("Marker added for:", spot.name); // Debugging log 6

              const popupContent = `
                  <h4>${spot.name}</h4>
                  <p>${spot.description}</p>
                  <p><em>${spot.address}</em></p>
                  <a href="gallery.html#${spot.id}">Lihat Detail di Galeri</a>
              `;
              marker.bindPopup(popupContent);

              if (spot.id === spotId) {
                  targetSpot = spot;
              }
          });

          // Jika ada spotId di URL, fokuskan peta ke spot tersebut
          if (targetSpot) {
              map.setView(targetSpot.coords, 14); // Zoom lebih dekat ke spot
              console.log("Target spot found. Centering map and opening popup."); // Debugging log 7
              
              // Temukan marker yang sesuai dan buka popup-nya
              map.eachLayer(function(layer) {
                  if (layer instanceof L.Marker) {
                      if (layer.getLatLng().lat === targetSpot.coords[0] && layer.getLatLng().lng === targetSpot.coords[1]) {
                          layer.openPopup();
                      }
                  }
              });
          }
      })
      .catch(error => {
          console.error('Ada masalah saat memuat data spot:', error); // Debugging log 8
          alert('Gagal memuat data spot. Silakan coba lagi nanti.');
      });

      // Catatan untuk plugin 'leaflet-dataclassification':
      // Plugin ini biasanya digunakan untuk mengklasifikasikan dan mewarnai poligon/garis
      // berdasarkan data atribut. Penggunaannya lebih kompleks dan memerlukan data GeoJSON
      // dengan properti numerik yang ingin diklasifikasikan.
      // Contoh sederhana (memerlukan GeoJSON layer bernama 'geojsonLayer'):
      // const classification = new L.DataClassification(geojsonLayer, {
      //     method: 'quantiles', // atau 'jenks', 'equalInterval'
      //     field: 'nilai_data', // nama properti di GeoJSON yang akan diklasifikasikan
      //     classes: 5, // jumlah kelas
      //     colors: ['#fef0d9','#fdd49e','#fc8d59','#e34a33','#b30000'] // warna untuk kelas
      // });
      // Jika Anda ingin mengimplementasikannya, Anda perlu menambahkan data GeoJSON dan logikanya.
      // Untuk saat ini, plugin hanya dimuat, namun tidak aktif jika tidak ada implementasi.
});

[
  {
      "id": "farmhouse-lembang",
      "name": "Farmhouse Lembang",
      "address": "Jl. Raya Lembang No.108, Lembang",
      "description": "Suasana pedesaan Eropa dengan bangunan unik dan hewan ternak lucu. Ideal untuk foto tema peternakan atau dongeng.",
      "coords": [-6.832713336782749, 107.60561829999999]
  },
  {
      "id": "kawah-putih",
      "name": "Kawah Putih Ciwidey",
      "address": "Sugihmukti, Pasirjambu, Ciwidey",
      "description": "Danau vulkanik dengan air berwarna unik dan pemandangan pegunungan menakjubkan. Latar belakang dramatis untuk foto alam.",
      "coords": [-7.166079527634663, 107.40239713641692]
  },
  {
      "id": "gedung-sate",
      "name": "Gedung Sate",
      "address": "Jl. Diponegoro No.22, Bandung Wetan",
      "description": "Ikon Bandung dengan arsitektur kolonial megah. Spot favorit untuk foto arsitektur, terutama di pagi/sore hari.",
      "coords": [-6.902396935566265, 107.61864815016544]
  },
  {
      "id": "dago-dream-park",
      "name": "Dago Dream Park",
      "address": "Jl. Dago Giri Km. 2.2, Lembang",
      "description": "Wahana dan spot foto unik seperti karpet terbang dan rumah terbalik, dengan latar hutan pinus yang asri.",
      "coords": [-6.848514465752955, 107.62591753667327]
  },
  {
      "id": "braga-street",
      "name": "Jalan Braga",
      "address": "Jl. Braga, Kec. Sumur Bandung",
      "description": "Jalan bersejarah dengan bangunan art deco Eropa. Atmosfer klasik, artistik, dan retro untuk foto estetik.",
      "coords": [-6.91774308724223, 107.60943409434638]
  },
  {
      "id": "orchid-forest-cikole",
      "name": "Orchid Forest Cikole",
      "address": "Genteng, Cikole, Lembang",
      "description": "Taman anggrek terbesar di Indonesia dengan jembatan gantung bercahaya di tengah hutan pinus. Sangat indah di malam hari.",
      "coords": [-6.77994972418075, 107.6349355655086]
  },
  {
      "id": "floating-market-lembang",
      "name": "Floating Market Lembang",
      "address": "Jl. Grand Hotel No.33E, Lembang",
      "description": "Pasar terapung unik dengan perahu-perahu yang menjual makanan tradisional. Pemandangan danau yang menawan.",
      "coords": [-6.817810863506271, 107.61881375201747]
  },
  {
      "id": "the-great-asia-africa",
      "name": "The Great Asia Africa",
      "address": "Jl. Raya Lembang No.277, Lembang",
      "description": "Eksplorasi budaya dari 7 negara Asia dan Afrika dengan bangunan ikonik dan kostum tradisional untuk disewa.",
      "coords": [-6.832848961575541, 107.60446759434541]
  },
  {
      "id": "ranca-upas",
      "name": "Ranca Upas",
      "address": "Jl. Raya Ciwidey - Patengan No.Km. 11, Rancabali",
      "description": "Area perkemahan dengan padang rumput luas dan penangkaran rusa. Pemandangan kabut di pagi hari sangat fotogenik.",
      "coords": [-7.138403627471656, 107.39176305202142]
  },
  {
      "id": "lembang-park-zoo",
      "name": "Lembang Park & Zoo",
      "address": "Jl. Sukarasa No.17, Lembang",
      "description": "Kebun binatang modern dengan desain estetik, menawarkan interaksi dengan hewan dan spot foto yang menarik.",
      "coords": [-6.804078807199233, 107.59087047900043]
  },
  {
      "id": "curug-cimahi",
      "name": "Curug Cimahi (Pelangi)",
      "address": "Jl. Kolonel Masturi No.325, Cisarua",
      "description": "Air terjun yang indah, terutama saat malam hari dengan pencahayaan berwarna-warni yang menciptakan efek pelangi.",
      "coords": [-6.798658479625784, 107.57604592318116]
  },
  {
      "id": "bandung-zoo",
      "name": "Kebun Binatang Bandung",
      "address": "Jl. Kebun Binatang No.6, Lebak Siliwangi",
      "description": "Kebun binatang klasik dengan koleksi hewan dan area hijau yang luas, cocok untuk foto keluarga atau edukasi.",
      "coords": [-6.889817452432764, 107.6068124366738]
  },
  {
      "id": "taman-balai-kota-bandung",
      "name": "Taman Balai Kota Bandung",
      "address": "Jl. Wastukencana No.2, Babakan Ciamis",
      "description": "Taman publik di depan Balai Kota dengan berbagai instalasi seni dan taman bunga, cocok untuk foto santai.",
      "coords": [-6.91261707620527, 107.60966296365714]
  },
  {
      "id": "asia-afrika-street-art",
      "name": "Street Art Asia Afrika",
      "address": "Sepanjang Jl. Asia Afrika, Bandung",
      "description": "Dinding-dinding di sepanjang jalan Asia Afrika yang dihiasi mural dan grafiti berwarna-warni, cocok untuk foto urban edgy.",
      "coords": [-6.9211518234174, 107.60831597926212]
  },
  {
      "id": "punclut-bandung",
      "name": "Punclut Bandung",
      "address": "Jl. Punclut, Ciumbuleuit",
      "description": "Area perbukitan dengan banyak kafe dan restoran yang menawarkan pemandangan kota Bandung dari ketinggian, terutama indah di malam hari.",
      "coords": [-6.842802513388463, 107.62204653550714]
  },
  {
      "id": "ciater-hot-spring",
      "name": "Pemandian Air Panas Ciater",
      "address": "Jl. Raya Subang - Bandung, Ciater",
      "description": "Kolam-kolam air panas alami dengan latar pegunungan, cocok untuk relaksasi dan foto di suasana alami.",
      "coords": [-6.738604206502858, 107.65392049063823]
  },
  {
      "id": "bandung-lautan-api-monument",
      "name": "Monumen Bandung Lautan Api",
      "address": "Jl. Lapangan Supratman, Citarum",
      "description": "Monumen bersejarah yang melambangkan perjuangan rakyat Bandung, menjadi latar belakang yang kuat dan monumental.",
      "coords": [-6.933721888642074, 107.60492499434658]
  },
  {
      "id": "kyotoku-floating-resto",
      "name": "Kyotoku Floating Restaurant",
      "address": "Jl. Baru Laksana No.79, Lembang",
      "description": "Restoran unik dengan konsep bangunan Jepang mengapung di atas kolam, menawarkan suasana eksotis untuk bersantap dan berfoto.",
      "coords": [-6.819725852237631, 107.61874990968985]
  },
  {
      "id": "bukit-moko",
      "name": "Bukit Moko",
      "address": "Cimenyan, Kab. Bandung",
      "description": "Puncak dengan pemandangan kota Bandung yang spektakuler, terutama saat matahari terbit atau terbenam. Cocok untuk foto panorama.",
      "coords": [-6.842050421306854, 107.67680853667318]
  },
  {
      "id": "chinatown-bandung",
      "name": "Chinatown Bandung",
      "address": "Jl. Kelenteng No.41, Ciroyom",
      "description": "Area pecinan yang instagramable dengan bangunan-bangunan berwarna-warni, mural, dan kuliner khas. Cocok untuk foto bertema oriental dan video jalan-jalan.",
      "coords": [-6.9215659827941645, 107.60076405201872]
  },
  {
      "id": "tahura-djuanda",
      "name": "Taman Hutan Raya Ir. H. Djuanda (Tahura)",
      "address": "Komplek Tahura, Jl. Ir. H. Djuanda No.99, Dago",
      "description": "Kawasan hutan lindung dengan gua Jepang, gua Belanda, air terjun, dan pepohonan pinus tinggi. Ideal untuk foto dan video bertema alam dan petualangan.",
      "coords": [-6.858471572531893, 107.63078283667339]
  },
  {
    "id": "sarae-hills",
    "name": "Sarae Hills (Wonderland / Magic Forest)",
    "address": "Jl. Cibungur, Ciwangun, Kec. Parongpong, Kabupaten Bandung Barat",
    "description": "Area wisata dengan konsep negeri dongeng yang menawarkan berbagai spot foto ikonik seperti jembatan kaca, kastil fantasi, dan patung-patung raksasa dengan pemandangan pegunungan yang menakjubkan.",
    "coords": [-6.843504807236732, 107.62422876550941]
  },
  {
      "id": "glamping-lakeside-rancabali",
      "name": "Glamping Lakeside Rancabali",
      "address": "Situ Patengan KM. 39, Rancabali",
      "description": "Tempat glamping unik di tepi Situ Patenggang dengan pemandangan danau yang menawan dan kapal Pinisi raksasa. Sangat indah untuk foto dan video bertema alam dan relaksasi.",
      "coords": [-7.1668343968210015, 107.35405589403325]
  },
  {
      "id": "the-lodge-maribaya",
      "name": "The Lodge Maribaya",
      "address": "Jl. Maribaya No.149/252, Cibodas, Lembang",
      "description": "Destinasi wisata alam dengan beragam wahana dan spot foto unik seperti balon udara, ayunan langit, dan sepeda gantung, dikelilingi hutan pinus yang asri.",
      "coords": [-6.829198138912117, 107.68742367900083]
  }
]