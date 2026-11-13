const destinations = [
  {id:"kawah-putih",name:"Kawah Putih",location:"Ciwidey, Kabupaten Bandung",area:"Ciwidey",category:"Alam",desc:"Danau kawah berwarna unik dengan lanskap pegunungan yang ikonik.",image:"https://images.unsplash.com/photo-1698186861646-31803b7908f4?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",ticket:35000,parking:10000,food:30000,transport:25000,extra:5000,facility:7,beauty:10,cleanliness:8,safety:8,access:7,activities:7,comfort:8},
  {id:"farmhouse",name:"Farmhouse Lembang",location:"Lembang, Kabupaten Bandung Barat",area:"Bandung",category:"Keluarga",desc:"Suasana ala desa Eropa, spot foto, dan aktivitas santai untuk keluarga.",image:"https://idetrips.com/wp-content/uploads/2022/04/hobbiton-farmhouse-lembang.jpg",ticket:35000,parking:10000,food:40000,transport:20000,extra:10000,facility:9,beauty:8,cleanliness:8,safety:9,access:8,activities:9,comfort:9},
  {id:"floating-market",name:"Floating Market Lembang",location:"Lembang, Kabupaten Bandung Barat",area:"Bandung",category:"Keluarga",desc:"Wisata keluarga dengan kuliner, area tematik, dan kegiatan rekreasi.",image:"https://zjglidcehtsqqqhbdxyp.supabase.co/storage/v1/object/public/atourin/images/destination/bandung/floating-market-lembang-profile1695143972.jpeg?x-image-process=image/resize,p_100,limit_1/imageslim",ticket:35000,parking:10000,food:45000,transport:20000,extra:10000,facility:9,beauty:8,cleanliness:8,safety:9,access:8,activities:9,comfort:8},
  {id:"orchid-forest",name:"Orchid Forest Cikole",location:"Cikole, Lembang",area:"Bandung",category:"Alam",desc:"Hutan pinus, koleksi anggrek, dan jalur jalan kaki di udara sejuk.",image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT24Up3xbtfrdbXW8XW2AlthcRz3uQHrL7sPv2NL4bDYd0BKKOrwh4c1cA&s=10",ticket:40000,parking:10000,food:35000,transport:25000,extra:10000,facility:8,beauty:9,cleanliness:9,safety:8,access:7,activities:8,comfort:8},
  {id:"the-lodge",name:"The Lodge Maribaya",location:"Lembang, Kabupaten Bandung Barat",area:"Bandung",category:"Petualangan",desc:"Panorama hutan dan perbukitan dengan aktivitas luar ruang.",image:"https://7summitstravel.com/public/uploads/news-923.jpg",ticket:35000,parking:10000,food:45000,transport:25000,extra:25000,facility:8,beauty:10,cleanliness:8,safety:8,access:7,activities:10,comfort:7},
  {id:"taman-safari",name:"Taman Safari Indonesia",location:"Cisarua, Kabupaten Bogor",area:"Bogor",category:"Edukasi",desc:"Wisata satwa dan edukasi untuk keluarga dengan banyak aktivitas.",image:"https://tamansafari.com/wp-content/uploads/2025/09/experience-the-thrill-of-elephant-sumatra-adventures.jpg",ticket:150000,parking:15000,food:50000,transport:45000,extra:15000,facility:10,beauty:8,cleanliness:9,safety:9,access:8,activities:10,comfort:8},
  {id:"situ-patenggang",name:"Situ Patenggang",location:"Rancabali, Kabupaten Bandung",area:"Ciwidey",category:"Alam",desc:"Danau di kawasan pegunungan dengan pemandangan kebun teh.",image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZJoOqC5pVS9LQieMfx-ZG8oGxPg6IDTX-b2qAJIRyhA&s=10",ticket:25000,parking:10000,food:30000,transport:30000,extra:5000,facility:7,beauty:9,cleanliness:8,safety:8,access:7,activities:7,comfort:8},
  {id:"darajat",name:"Darajat Pass",location:"Pasirwangi, Kabupaten Garut",area:"Garut",category:"Keluarga",desc:"Wisata air panas dan kolam dengan udara sejuk pegunungan.",image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJ6kehR4bNPgzUYUsiUHWp6nkC6sVbJz-m2in8L4YpYg&s=10",ticket:40000,parking:10000,food:35000,transport:40000,extra:10000,facility:8,beauty:8,cleanliness:7,safety:8,access:7,activities:8,comfort:8}
];

const criteria = [
  {key:"cost",code:"C1",name:"Total biaya per orang",short:"Total biaya",attribute:"Cost",hint:"Tiket + parkir + makan + transportasi + biaya tambahan",unit:"Rp"},
  {key:"facility",code:"C2",name:"Fasilitas",short:"Fasilitas",attribute:"Benefit",hint:"Ketersediaan toilet, tempat istirahat, dan fasilitas umum",unit:""},
  {key:"beauty",code:"C3",name:"Keindahan",short:"Keindahan",attribute:"Benefit",hint:"Pemandangan dan daya tarik visual",unit:""},
  {key:"cleanliness",code:"C4",name:"Kebersihan",short:"Kebersihan",attribute:"Benefit",hint:"Kondisi lingkungan dan kebersihan area",unit:""},
  {key:"safety",code:"C5",name:"Keamanan",short:"Keamanan",attribute:"Benefit",hint:"Penilaian umum keamanan dan pengelolaan area",unit:""},
  {key:"access",code:"C6",name:"Aksesibilitas",short:"Akses",attribute:"Benefit",hint:"Kemudahan mencapai lokasi dan akses di area wisata",unit:""},
  {key:"activities",code:"C7",name:"Variasi aktivitas",short:"Aktivitas",attribute:"Benefit",hint:"Banyaknya aktivitas atau pengalaman yang tersedia",unit:""},
  {key:"comfort",code:"C8",name:"Kenyamanan",short:"Kenyamanan",attribute:"Benefit",hint:"Kenyamanan berkunjung secara keseluruhan",unit:""}
];
const MAX_WEIGHT = 10; // skala bobot 1–10
const CRITERIA_ICONS = {cost:"fa-wallet",facility:"fa-restroom",beauty:"fa-mountain-sun",cleanliness:"fa-broom",safety:"fa-shield-halved",access:"fa-route",activities:"fa-person-hiking",comfort:"fa-couch"};
const presets = {
  // Urutan: biaya, fasilitas, keindahan, kebersihan, keamanan, akses, aktivitas, kenyamanan
  balanced:[7,7,7,7,7,7,7,7],
  cheap:[10,4,4,5,6,5,4,5],
  comfort:[5,9,7,8,9,8,8,10],
  nature:[5,5,10,8,7,7,8,8]
};
